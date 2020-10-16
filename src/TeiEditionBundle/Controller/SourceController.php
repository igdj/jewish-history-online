<?php

namespace TeiEditionBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Contracts\Translation\TranslatorInterface;

use TeiEditionBundle\Entity\SourceArticle;
use TeiEditionBundle\Utils\ImageMagick\ImageMagickProcessor;

/**
 *
 */
class SourceController
extends ArticleController
{
    static function mb_wordwrap($str, $width = 75, $break = "\n", $cut = false)
    {
        $lines = explode($break, $str);

        foreach ($lines as &$line) {
            $line = rtrim($line);
            if (mb_strlen($line) <= $width) {
                continue;
            }

            $words = explode(' ', $line);
            $line = '';
            $actual = '';
            foreach ($words as $word) {
                if (mb_strlen($actual.$word) <= $width) {
                    $actual .= $word.' ';
                }
                else {
                    if ($actual != '') {
                        $line .= rtrim($actual).$break;
                    }

                    $actual = $word;
                    if ($cut) {
                        while (mb_strlen($actual) > $width) {
                            $line .= mb_substr($actual, 0, $width).$break;
                            $actual = mb_substr($actual, $width);
                        }
                    }

                    $actual .= ' ';
                }
            }

            $line .= trim($actual);
        }

        return implode($break, $lines);
    }

    protected function renderSourcePdf($parts)
    {
        $sourceArticle = $parts['article'];

        $html = $this->renderView('@TeiEdition/Article/source-printview.html.twig', [
            'article' => $sourceArticle,
            'meta' => $sourceArticle,
            'layers' => $parts['layers'],
            'description' => $parts['description'],
            'interpretations' => $parts['interpretations'],
            'name' => $sourceArticle->getName(),
            'license' => $parts['license'],
        ]);

        /*
        // debug $html generation
        echo $html;
        exit;
        */

        $this->renderPdf($html, str_replace(':', '-', $sourceArticle->getSlug(true)) . '.pdf');
    }

    protected function renderSourceViewer(Request $request, TranslatorInterface $translator, $uid, SourceArticle $sourceArticle)
    {
        if (in_array($request->get('_route'), [ 'source-jsonld' ])) {
            // return jsonld-rendition
            return new JsonLdResponse($sourceArticle->jsonLdSerialize($request->getLocale()));
        }

        $generatePrintView = 'source-pdf' == $request->get('_route');

        $fname = $this->buildArticleFname($sourceArticle);

        $params = [
            'params' => [
                // localize labels in xslt
                'lang' => \TeiEditionBundle\Utils\Iso639::code1To3($request->getLocale()),

                // notes per page in pdf
                'noteplacement' => 'perpage',
            ],
        ];

        // render the transcript / translation in the current language to get $license
        // and rendered content for non-iview2 display
        $html = $this->renderTei($fname,
                                 $generatePrintView ? 'dtabf_article-printview.xsl' : 'dtabf_article.xsl',
                                 $params);

        list($authors, $section_headers, $license, $entities, $bibitemLookup, $glossaryTerms, $refs) = $this->extractPartsFromHtml($html, $translator);

        $interpretation = $sourceArticle->getIsPartOf();
        $interpretations = !is_null($interpretation)
            ? [ $interpretation ] : [];
        $sourceDescription = null; // $sourceDescription is part of $interpretation
        $related = []; // if there are multiple sources for $interpretation
        if (isset($interpretation)) {
            $sourceDescription = [
                'article' => $interpretation,
                'html' => $this->renderSourceDescription($interpretation, $translator),
            ];
            list($dummy, $dummy, $license, $entitiesSourceDescription, $bibitemLookup, $glossaryTermsSourceDescription, $refs) = $this->extractPartsFromHtml($sourceDescription['html'], $translator);

            $entities = array_merge($entities, $entitiesSourceDescription);
            $glossaryTerms += $glossaryTermsSourceDescription;

            $relatedCriteria = new \Doctrine\Common\Collections\Criteria();
            $relatedCriteria
                ->where($relatedCriteria->expr()->eq('isPartOf', $interpretation))
                ->andWhere($relatedCriteria->expr()->neq('uid', $sourceArticle->getUid()));
            $relatedCriteria->orderBy([ 'dateCreated' => 'ASC', 'name' => 'ASC' ]);

            $related = $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\Article')
                ->matching($relatedCriteria);
        }

        $entityLookup = $this->buildEntityLookup($entities);
        $glossaryLookup = $this->buildGlossaryLookup($glossaryTerms, $request->getLocale());

        $fnameMets = $this->buildArticleFname($sourceArticle, '.mets.xml');
        $parts = explode('.', $fnameMets);
        $path = $parts[0]; // paths are of the format 'source-%05d', e.g. 'source-00123'

        /*
         * We have three different display formats
         *  1) Transcript/Translation without facsimile for AV and Transcript only:
         *      viewer-layers.html.twig
         *  2) Image/Object without a transcript:
         *      viewer-media.html.twig
         *      viewer-model.html.twig
         *  3) Facsimile and Transcript/Translation through iview2:
         *      viewer.html.twig
         *
         * 1) and 3) should support a PDF-rendition
         */
        $teiHelper = new \TeiEditionBundle\Utils\TeiHelper();

        $firstFacs = $teiHelper->getFirstPbFacs($this->locateTeiResource($fname));

        $sourceType = $sourceArticle->getSourceType();
        if ($generatePrintView) {
            // PDF-view is currently only the transcript without facsimile
            $sourceType = 'Transcript';
        }

        if (in_array($sourceType, [ 'Transkript', 'Transcript' ])
            || (empty($firstFacs) && in_array($sourceArticle->getSourceType(), [
                        'Audio', 'Video',
                        'Bild', 'Image',
                        'Objekt', 'Object',
                    ])))
        {
            $html = $this->adjustMedia($html,
                                       $request->getBaseURL() . '/viewer/' . $path);
            $sourceLocale = \TeiEditionBundle\Utils\Iso639::code3to1($sourceArticle->getLanguage());

            if (in_array($sourceType, [
                    'Transkript', 'Transcript', 'Audio', 'Video',
                ]))
            {
                $pullFeaturedMedia = false;

                $variants = [ 'transcription' ];
                $bodies = []; // rendered content by variant

                $getTranslatedFrom = $sourceArticle->getTranslatedFrom();
                if (!empty($getTranslatedFrom)
                    && ($sourceArticle->getTranslatedFrom() != $sourceArticle->getLanguage()))
                {
                    if ('yid' == $sourceArticle->getTranslatedFrom()) {
                        // yiddish texts in hebrew script might have an additional
                        // transcript according to YIVO rules in latin script
                        $variants[] = 'transcription_yl';
                    }

                    // the source is in a different language than the display locale,
                    // so $html is a translation and not the transcript
                    $key = 'translation_' . $sourceLocale;
                    $variants[] = $key;
                    $bodies[$key] = $html;
                }
                else {
                    // $html is transcription, so no additional $variant needed
                    $bodies['transcription'] = $html;
                }

                $layers = [];
                foreach ($variants as $variant) {
                    if (in_array($variant, ['transcription', 'transcription_yl'])) {
                        $label = 'Transcription';
                        if ('transcription_yl' == $variant) {
                            $label .= ' (Latin script)';
                        }

                        if (!array_key_exists($variant, $bodies)) {
                            $transcriptionLocale = 'transcription_yl' == $variant
                                ? 'yl' : \TeiEditionBundle\Utils\Iso639::code3to1($sourceArticle->getTranslatedFrom());
                            $transcriptionFname = $this->buildArticleFnameFromUid($sourceArticle->getUid(), $transcriptionLocale) . '.xml';

                            $params = [
                                'params' => [
                                    // localize labels in xslt
                                    'lang' => $transcriptionLocale,

                                    // notes per page in pdf
                                    'noteplacement' => 'perpage',
                                ],
                            ];

                            $body = $this->adjustMedia($this->renderTei($transcriptionFname, $generatePrintView ? 'dtabf_article-printview.xsl' : 'dtabf_article.xsl', $params),
                                                       $request->getBaseURL() . '/viewer/' . $path);

                            // so notes in different locales don't collide
                            // TODO: use lang in xsl to build the notes
                            $body = preg_replace('/note\-(\d+)\-marker/',
                                                 'note-' . $transcriptionLocale . '-\1-marker',
                                                 $body);
                            $body = preg_replace('/#note\-(\d+)/',
                                                 '#note-' . $transcriptionLocale . '-\1',
                                                 $body);
                            $body = preg_replace('/name="note\-(\d+)/',
                                                 'name="note-' . $transcriptionLocale . '-\1',
                                                 $body);
                        }
                        else {
                            $body = $bodies[$variant];
                        }
                    }
                    else {
                        $keyParts = explode('_', $variant, 2);
                        $label = ('en' == $keyParts[1] ? 'English' : 'German') . ' Translation';
                        $body = $bodies[$key];
                    }

                    $layers[] = [
                        'opened' => !$pullFeaturedMedia
                            && (1 == count($variants) || $variant == 'translation_' . $sourceLocale),
                        'label' => $label,
                        'body' => $this->removeByCssSelector($body, [ '#license' ]),
                    ];
                }

                if ($generatePrintView) {
                    $this->renderSourcePdf([
                        'article' => $sourceArticle,
                        'layers' => $layers,
                        'description' => $sourceDescription,
                        'name' => $sourceArticle->getName(),
                        'interpretations' => $interpretations,
                        'license' => $license,
                    ]);

                    return;
                }

                if ($pullFeaturedMedia) {
                    $player = 'TODO: Player';
                }
                else {
                    $player = '';
                }

                // AV plus transcript and maybe translation
                // should be handled through iview2 in the future
                return $this->render('@TeiEdition/Article/viewer-layers.html.twig', [
                    'article' => $sourceArticle,
                    'html' => $player,
                    'layers' => $layers,
                    'description' => $sourceDescription,
                    'name' => $sourceArticle->getName(),
                    'pageTitle' => $sourceArticle->getName(),
                    'interpretations' => $interpretations,
                    'related' => $related,
                    'uid' => $uid,
                    'path' => $path,
                    'license' => $license,
                    'entity_lookup' => $entityLookup,
                    'glossary_lookup' => $glossaryLookup,
                    'pageMeta' => [
                        'jsonLd' => $sourceArticle->jsonLdSerialize($request->getLocale()),
                        'og' => $this->buildOg($sourceArticle, $request, $translator, 'source', [ 'uid' => $sourceArticle->getUid() ]),
                        'twitter' => $this->buildTwitter($sourceArticle, $request, 'source', [ 'uid' => $sourceArticle->getUid() ]),
                    ],
                ]);
            }

            $template = 'viewer-media.html.twig';
            if (in_array($sourceArticle->getSourceType(), [
                        'Objekt', 'Object',
                    ]))
            {
                // check for object tag
                if (preg_match('/<object([^>]*)><\/object>/', $html, $matches)) {
                    // build three-js structure
                    $object = new \SimpleXMLElement($matches[0]);
                    $url = (string)$object->attributes()['data'];
                    $tag = <<<EOT
            <div id="glFullwidth">
                <canvas id="canvas" data-src="{$url}"></canvas>
            </div>
            <div id="dat"></div>
EOT;
                    $html = preg_replace('/<object([^>]*)><\/object>/', $html, $tag);

                    $template = 'viewer-model.html.twig';
                }
            }

            return $this->render('@TeiEdition/Article/' . $template , [
                'article' => $sourceArticle,
                'html' => $html,
                'description' => $sourceDescription,
                'name' => $sourceArticle->getName(),
                'pageTitle' => $sourceArticle->getName(),
                'interpretations' => $interpretations,
                'related' => $related,
                'uid' => $uid,
                'path' => $path,
                'license' => $license,
                'entity_lookup' => $entityLookup,
                'glossary_lookup' => $glossaryLookup,
                'pageMeta' => [
                    'jsonLd' => $sourceArticle->jsonLdSerialize($request->getLocale()),
                    'og' => $this->buildOg($sourceArticle, $request, $translator, 'source', [ 'uid' => $sourceArticle->getUid() ]),
                    'twitter' => $this->buildTwitter($sourceArticle, $request, 'source', [ 'uid' => $sourceArticle->getUid() ]),
                ],
            ]);
        }

        return $this->render('@TeiEdition/Article/viewer.html.twig', [
            'article' => $sourceArticle,
            'description' => $sourceDescription,
            'name' => $sourceArticle->getName(),
            'pageTitle' => $sourceArticle->getName(),
            'interpretations' => $interpretations,
            'related' => $related,
            'uid' => $uid,
            'path' => $path,
            'mets' => $fnameMets,
            'firstFacs' => !empty($firstFacs) ? $firstFacs : 'f0001',
            'license' => $license,
            'entity_lookup' => $entityLookup,
            'glossary_lookup' => $glossaryLookup,
            'pageMeta' => [
                'jsonLd' => $sourceArticle->jsonLdSerialize($request->getLocale()),
                'og' => $this->buildOg($sourceArticle, $request, $translator, 'source', [ 'uid' => $sourceArticle->getUid() ]),
                'twitter' => $this->buildTwitter($sourceArticle, $request, 'source', [ 'uid' => $sourceArticle->getUid() ]),
            ],
        ]);
    }

    /**
     * @Route("/source/{uid}.jsonld", name="source-jsonld")
     * @Route("/source/{uid}.pdf", name="source-pdf")
     * @Route("/source/{uid}", name="source", requirements={"uid"=".*source\-\d+"})
     */
    public function sourceViewerAction(Request $request,
                                       TranslatorInterface $translator,
                                       $uid)
    {
        $criteria = [ 'uid' => $uid ];
        $locale = $request->getLocale();
        if (!empty($locale)) {
            $criteria['language'] = \TeiEditionBundle\Utils\Iso639::code1to3($locale);
        }

        $sourceArticle = $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\SourceArticle')
                ->findOneBy($criteria);

        if (!$sourceArticle) {
            throw $this->createNotFoundException('This source does not exist');
        }

        return $this->renderSourceViewer($request, $translator, $uid, $sourceArticle);
    }

    protected function buildFolderName($uid)
    {
        if (!preg_match('/(source)\-(\d+)/', $uid, $matches)) {
            return false;
        }

        return sprintf('%s-%05d', $matches[1], $matches[2]);
    }

    protected function renderReadme($translator, $uid)
    {
        $fs = new \Symfony\Component\Filesystem\Filesystem();

        $result = $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\SourceArticle')
                ->findByUid($uid);

        $ret = [];

        $defaultLocale = $translator->getLocale();

        foreach ($result as $sourceArticle) {
            $locale = \TeiEditionBundle\Utils\Iso639::code3to1($sourceArticle->getLanguage());
            if (in_array($locale, $this->getParameter('locales'))) {
                $translator->setLocale($locale);
                $content = $this->renderView('@TeiEdition/Article/readme-' . $locale . '.txt.twig',
                                             [ 'meta' => $sourceArticle ]);
                $tempnam = $fs->tempnam(sys_get_temp_dir(), 'readme-' . $locale);
                file_put_contents($tempnam,
                                  str_replace("\n", "\r\n", self::mb_wordwrap($content)));
                $ret[$translator->trans('README.txt')] = $tempnam;
            }
        }

        $translator->setLocale($defaultLocale);

        return $ret;
    }

    protected function buildImgSrcPath($relPath)
    {
        $imgDir = 'img/';
        $srcPath = $imgDir . $relPath;

        try {
            $srcPathFull = $this->locateData($srcPath);

            return $srcPathFull;
        }
        catch (\InvalidArgumentException $e) {
        }
    }

    protected function buildDownloadFiles($uid, $sourceArticle)
    {
        $dir = $this->buildFolderName($uid);
        if (false === $dir) {
            return false;
        }

        $files = [];
        $srcDir = $this->buildImgSrcPath($dir);
        if (empty($srcDir)) {
            return $files;
        }

        $iterators = [ new \GlobIterator($srcDir . '/f*.jpg') ];

        if ('Audio' == $sourceArticle->getSourceType()) {
            $iterators[] = new \GlobIterator($srcDir . '/m*.mp3');
        }

        foreach ($iterators as $iterator) {
            foreach ($iterator as $file) {
                if ($file->isFile()) {
                    $files[$file->getFilename()] = $file->getPathname();
                }
            }
        }

        if (empty($files) && 'Text' != $sourceArticle->getSourceType()) {
            $teiHelper = new \TeiEditionBundle\Utils\TeiHelper();
            $fname = $this->buildArticleFname($sourceArticle);
            $figures = $teiHelper->getFigureFacs($this->locateTeiResource($fname));
            if (false !== $figures) {
                foreach ($figures as $figure) {
                    $file = new \SplFileInfo($srcDir . '/' . $figure);
                    if ($file->isFile()) {
                        $files[$file->getFilename()] = $file->getPathname();
                    }
                }
            }
        }

        return $files;
    }

    protected function buildViewerPath($uid)
    {
        $dir = $this->buildFolderName($uid);
        if (false === $dir) {
            return false;
        }

        $baseDir = realpath($this->getProjectDir());
        $relPath = sprintf('viewer/%s', $dir);
        $filePath = $baseDir . '/web/' . $relPath;

        if (!file_exists($filePath)) {
            return false;
        }

        return [ $relPath, $filePath ];
    }

    protected function generateZip($imagickProcessor, $uid, $files)
    {
        $dstPath = $this->buildViewerPath($uid);
        if (false === $dstPath) {
            return false;
        }
        list($relPath, $filePath) = $dstPath;

        $fnameZip = $this->buildFolderName($uid) . '.zip';
        $fullnameZip = $filePath . '/' . $fnameZip;
        $urlZip = $this->get('router')->getContext()->getBaseUrl()
                . '/' . $relPath . '/' . $fnameZip;

        $flags = \ZipArchive::CREATE;
        if (file_exists($fullnameZip)) {
            $regenerate = false; // TODO: check if we need to regenerate
            if (!$regenerate) {
                return $urlZip;
            }
            $flags |= \ZipArchive::OVERWRITE;
        }

        $zip = new \ZipArchive();
        $res = $zip->open($fullnameZip, $flags);
        if ($res !== true) {
            return false;
        }

        $footer = $this->buildImgSrcPath('footer-download.png');

        $fs = new \Symfony\Component\Filesystem\Filesystem();
        $tempfiles = [];
        foreach ($files as $localfname => $fname) {
            if (in_array($localfname, [ 'README.txt', 'LIESMICH.txt' ])) {
                $tempfiles[] = $localfname;
            }
            if (!empty($footer) && preg_match('/(\.(jpg|png))$/i', $fname, $matches)) {
                $res = @getimagesize($fname);
                if (!empty($res) && $res[0] > 0) {
                    $tempnam = $fs->tempnam(sys_get_temp_dir(), 'tmp');
                    rename($tempnam, $tempnam .= $matches[1]);
                    $convertArgs = [
                        '-append',
                        sprintf('-resize %dx', $res[0]),
                        $imagickProcessor->escapeshellarg($fname),
                        $imagickProcessor->escapeshellarg($footer),
                        $tempnam,
                    ];

                    if (0 == $imagickProcessor->convert($convertArgs)) {
                        $tempfiles[] = $fname = $tempnam;
                    }
                }
            }

            $zip->addFile($fname, $localfname);
        }

        $zip->close();

        foreach ($tempfiles as $tempfile) {
            if (file_exists($tempfile)) {
                @unlink($tempfile);
            }
        }

        return $urlZip;
    }

    protected function findSourceArticle($uid, $locale)
    {
        $criteria = [ 'uid' => $uid ];
        if (!empty($locale)) {
            $criteria['language'] = \TeiEditionBundle\Utils\Iso639::code1to3($locale);
        }

        return $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\SourceArticle')
                ->findOneBy($criteria);
    }

    /**
     * @Route("/source/{uid}.zip", name="source-download")
     */
    public function downloadAction(Request $request,
                                   TranslatorInterface $translator,
                                   ImageMagickProcessor $imagickProcessor,
                                   $uid)
    {
        $article = $this->findSourceArticle($uid, $request->getLocale());

        if (!$article) {
            throw $this->createNotFoundException('This source does not exist');
        }

        $files = false;
        // check if we are allowed to download
        if ($article->licenseAllowsDownload()) {
            $files = $this->buildDownloadFiles($uid, $article);
        }

        if (false === $files || empty($files)) {
            // no download
            return new \Symfony\Component\HttpFoundation\RedirectResponse($this->generateUrl('source', [ 'uid' => $uid ]));
        }

        // generate README.txt / LIESMICH.txt
        $readme = $this->renderReadme($translator, $uid);
        if (false !== $readme) {
            $files = array_merge($files, $readme);
        }

        $urlZip = $this->generateZip($imagickProcessor, $uid, $files);
        if (false === $files) {
            // something went wrong
            return new \Symfony\Component\HttpFoundation\RedirectResponse($this->generateUrl('source', [ 'uid' => $uid ]));
        }

        return new \Symfony\Component\HttpFoundation\RedirectResponse($urlZip);
    }

    /**
     *
     * @Route("/source/{uid}.mets.xml", name="source-mets")
     *
     * For downloadable sources, adjust the METS-container so it works well
     * in the DFG-Viewer
     *
     */
    public function metsAction(Request $request,
                               \Twig\Environment $twig,
                               $uid)
    {
        $article = $this->findSourceArticle($uid, $request->getLocale());

        if (!$article) {
            throw $this->createNotFoundException('This source does not exist');
        }

        $relPath = $resource = null;
        if ($article->licenseAllowsDownload()) {
            // if we are allowed to download, check for a mets container
            $dstPath = $this->buildViewerPath($uid);
            if (false !== $dstPath) {
                list($relPath, $filePath) = $dstPath;
                $fnameMets = sprintf('%s.%s.mets.xml',
                                     $this->buildFolderName($uid),
                                     $request->getLocale());
                $fullnameMets = $filePath . '/' . $fnameMets;
                try {
                    $resource = new \DOMDocument();
                    $resource->load($fullnameMets);
                } catch (\Exception $e) {
                    $resource = null;
                    ; // import failed
                }
            }
        }

        if (is_null($resource)) {
            // no download or mets-container
            return new \Symfony\Component\HttpFoundation\RedirectResponse($this->generateUrl('source', [ 'uid' => $uid ]));
        }

        $defaultZoom = 3;

        $directoryUrlAbs = $request->getSchemeAndHttpHost()
            . $this->get('router')->getContext()->getBaseUrl()
            . '/' . $relPath;

        $xpath = new \DOMXPath($resource);
        foreach ($xpath->query("//mets:fileSec/mets:fileGrp[@USE='MASTER']") as $fileSec) {
            // <mets:fileGrp USE="MASTER"> -> <mets:fileGrp USE="DEFAULT">
            $fileSec->setAttribute('USE', 'DEFAULT');

            /*
             *  change <mets:FLocat LOCTYPE="URL" xlink:href="fxxx.(jpg|png)">
             *    to absolute urls pointing to the default ZOOM-level
             *    (_3.(jpg|png) if available, otherwise _2 or _1)
             */
            foreach ($xpath->query("./mets:file/mets:FLocat[@LOCTYPE='URL']", $fileSec) as $node) {
                $hrefRel = $node->getAttribute('xlink:href');
                $pathParts = pathinfo($hrefRel);
                for ($zoom = $defaultZoom; $zoom >= 0; $zoom--) {
                    $fnameScaled = $pathParts['filename'] . '_' . $zoom . '.' . $pathParts['extension'];
                    if (file_exists($filePath . '/' . $fnameScaled)) {
                        $hrefAbs = $directoryUrlAbs . '/' . $fnameScaled;
                        $node->setAttribute('xlink:href', $hrefAbs);
                        break;
                    }
                }
            };
        }

        $template = $twig->loadTemplate('@TeiEdition/Article/mods-fragments.xml.twig');
        $context = $twig->getGlobals();

        // add mets:rightsMD / mets:digiprovMD to mets:dmdSec
        foreach ($xpath->query("//mets:dmdSec[1]") as $dmdSec) {
            $fragment = $resource->createDocumentFragment();
            $fragment->appendXML($template->renderBlock('dmdSecChildren', [ 'article' => $article ] + $context));
            $dmdSec->appendChild($fragment);
        }

        // add mets:mdWrap to mets:amdSec
        $xpath = new \DOMXPath($resource);
        foreach ($xpath->query("//mets:amdSec[1]") as $amdSec) {
            // add rights-header
            $fragment = $resource->createDocumentFragment();
            $fragment->appendXML($template->renderBlock('amdSecChildren', [ 'article' => $article ] + $context));
            $amdSec->appendChild($fragment);
        }

        return new \Symfony\Component\HttpFoundation\Response($resource->saveXML() , 200, [
            'Content-Type' => 'text/xml;charset=UTF-8'
        ]);
    }

    /**
     *
     * @Route("/source/tei2html/{path}", requirements={"path" = ".*"}, name="tei2html")
     *
     * This action is called by
     *   iview-client-mets.js
     * to render a specific page of the transcription or translation
     */
    public function tei2htmlAction($path)
    {
        $parts = explode('/', $path, 2);
        $locale = $this->getParameter('default_locale');

        if (preg_match('/^tei\/(translation|transcription)\.([a-z][a-z])\/(page\-(\d+)(\.xml))$/', $parts[1], $matches)) {
            $locale = $matches[2];
            $page = $matches[3];
        }
        else {
            $page = preg_replace('/[^0-9a-zA-Z\.\-]/', '', $parts[1]);
        }

        // source
        $uid = preg_replace('/[^0-9a-zA-Z_\-\:]/', '', $parts[0]);
        if (preg_match('/(article|source)\-(\d+)/', $uid, $matches)) {
            $fname = sprintf('%s-%05d.%s',
                             $matches[1], $matches[2], $locale);
        }
        $fname .= '.xml';

        // check if source is splitted into individual files one per page
        $baseDir = realpath($this->getProjectDir());

        $targetPath = sprintf('web/viewer/%s', $uid);
        $targetDir = realpath($baseDir . '/' . $targetPath);

        $html = 'TODO: A problem occured';
        if (!empty($targetDir)) {
            $pagesPath = 'pages.' . $locale;
            if (!is_dir($targetDir . '/' . $pagesPath)) {
                mkdir($targetDir . '/' . $pagesPath);
            }

            if (is_dir($targetDir . '/' . $pagesPath)) {
                $pagesDir = realpath($targetDir . '/' . $pagesPath);

                $pageExistsAndIsCurrent = false;
                if (file_exists($pagesDir . '/' . $page)) {
                    // page exists, check if it is current
                    $fnameFull = $this->locateTeiResource($fname);

                    $modifiedSource = filemtime($fnameFull);
                    $modifiedTarget = filemtime($pagesDir . '/' . $page);

                    // target is older than source, so run again
                    $pageExistsAndIsCurrent = $modifiedTarget >= $modifiedSource;
                }

                if (!$pageExistsAndIsCurrent) {
                    // (re-)generate
                    $pagesDirUri = 'file:///' . str_replace('\\', '/', $pagesDir);
                    // we have to split the source file to pages
                    $res = $this->renderTei($fname, 'split-pages.xsl',
                                            [ 'params' => [ 'outdir' => $pagesDirUri ] ]);
                }

                $params = [
                    'locateXmlResource' => false,
                    'params' => [
                        'lang' => \TeiEditionBundle\Utils\Iso639::code1To3($locale), // localize labels in xslt
                    ],
                ];

                if (file_exists($pagesDir . '/' . $page)) {
                    $html = $this->renderTei(realpath($pagesDir . '/' . $page), 'dtabf_viewer.xsl',
                                             $params);
                }
            }
        }

        return new Response($html);
    }

    /**
     *
     * @Route("/source/imginfo/{path}", requirements={"path" = ".*"}, name="imginfo")
     *
     * This action is called by
     *   iview-client-mets.js
     * to determine the width and height of the page facsimile
     * to determine the maximum zoom level for the tiles
     */
    public function imgInfoAction($path)
    {
        $parts = explode('/', $path);

        $derivate = preg_replace('/[^0-9a-zA-Z_\-\:]/', '', $parts[0]);
        $fname = preg_replace('/[^0-9a-zA-Z\.]/', '', $parts[1]);

        $srcPath = sprintf('img/%s', $derivate);

        try {
            $fnameFull = $this->locateData($srcPath . '/' . $fname);
        }
        catch (\InvalidArgumentException $e) {
            var_dump($e);
            exit;
            throw $this->createNotFoundException('This source-image does not exist');
        }

        $size = @getimagesize($fnameFull);
        if (empty($size)) {
            throw $this->createNotFoundException('The size of the source-image could not be determined');
        }

        $width = $size[0];
        $height = $size[1];

        $iViewTiler = new \TeiEditionBundle\Utils\IViewTiler();
        $level = $iViewTiler->determineMaxZoom($width, $height);

        $response = new Response(<<<EOX
<?xml version="1.0" encoding="UTF-8"?>
<imageinfo derivate="{$derivate}" path="{$fname}" tiles="1" width="{$width}" height="{$height}" zoomLevel="{$level}" />
EOX
        );
        $response->headers->set('Content-Type', 'text/xml');

        return $response;
    }
}

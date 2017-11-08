<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class SourceController extends ArticleController
{
    protected function renderSourceViewer(Request $request, $uid, $sourceArticle)
    {
        $fname = $this->buildArticleFname($sourceArticle);

        $teiHelper = new \AppBundle\Utils\TeiHelper();
        $meta = $sourceArticle; // $teiHelper->analyzeHeader($this->locateTeiResource($fname));
        $firstFacs = $teiHelper->getFirstPbFacs($this->locateTeiResource($fname));

        $params = [
            'params' => [
                'lang' => \AppBundle\Utils\Iso639::code1To3($request->getLocale()), // localize labels in xslt
            ],
        ];
        $html = $this->renderTei($fname, 'dtabf_article.xsl', $params);

        list($authors, $section_headers, $license, $entities, $bibitemLookup, $glossaryTerms, $refs) = $this->extractPartsFromHtml($html);

        $sourceDescription = null;
        $related = [];
        $interpretation = $sourceArticle->getIsPartOf();
        if (isset($interpretation)) {
            $sourceDescription = [
                'article' => $interpretation,
                'html' => $this->renderSourceDescription($interpretation),
            ];
            list($dummy, $dummy, $license, $entitiesSourceDescription, $bibitemLookup, $glossaryTermsSourceDescription, $refs) = $this->extractPartsFromHtml($sourceDescription['html']);

            $entities = array_merge($entities, $entitiesSourceDescription);
            $glossaryTerms += $glossaryTermsSourceDescription;

            $related = $this->getDoctrine()
                ->getRepository('AppBundle:Article')
                ->findBy([ 'isPartOf' => $interpretation ],
                         [ 'dateCreated' => 'ASC', 'name' => 'ASC']);
        }

        if (in_array($request->get('_route'), [ 'source-jsonld' ])) {
            return new JsonLdResponse($sourceArticle->jsonLdSerialize($request->getLocale()));
        }

        $entityLookup = $this->buildEntityLookup($entities);
        $glossaryLookup = $this->buildGlossaryLookup($glossaryTerms, $request->getLocale());

        $fnameMets = $this->buildArticleFname($sourceArticle, '.mets.xml');
        $parts = explode('.', $fnameMets);
        $path = $parts[0];

        if (in_array($sourceArticle->getSourceType(), [ 'Transkript', 'Transcript' ])
            || (empty($firstFacs)
                && in_array($sourceArticle->getSourceType(), [
                        'Audio', 'Video',
                        'Bild', 'Image',
                        'Objekt', 'Object',
                    ])))
        {
            $html = $this->adjustMedia($html,
                                       $request->getBaseURL()
                                       . '/viewer/' . $path);
            $sourceLocale = \AppBundle\Utils\Iso639::code3to1($sourceArticle->getLanguage());

            if (in_array($sourceArticle->getSourceType(), [
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
                    // $html is a translation
                    $key = 'translation_' . $sourceLocale;
                    $variants[] = $key;
                    $bodies[$key] = $html;
                }
                else {
                    // $html is transcription, no additional $variant
                    $bodies['transcription'] = $html;
                }

                $layers = [];
                foreach ($variants as $variant) {
                    if ('transcription' == $variant) {
                        $label = 'Transcript';
                        if (!array_key_exists($variant, $bodies)) {
                            $transcriptionLocale = \AppBundle\Utils\Iso639::code3to1($sourceArticle->getTranslatedFrom());
                            $transcriptionFname = $this->buildArticleFnameFromUid($sourceArticle->getUid(), $transcriptionLocale) . '.xml';

                            $params = [
                                'params' => [
                                    'lang' => $transcriptionLocale, // localize labels in xslt
                                ],
                            ];

                            $body = $this->adjustMedia($this->renderTei($transcriptionFname, 'dtabf_article.xsl', $params),
                                                       $request->getBaseURL()
                                                       . '/viewer/' . $path);
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

                if ($pullFeaturedMedia) {
                    $player = 'TODO: Player';
                }
                else {
                    $player = '';
                }

                // AV plus transcript and maybe translation
                // should be handled through iview2 in the future
                return $this->render('AppBundle:Article:viewer-layers.html.twig', [
                    'article' => $sourceArticle,
                    'html' => $player,
                    'layers' => $layers,
                    'meta' => $meta,
                    'description' => $sourceDescription,
                    'name' => $sourceArticle->getName(),
                    'pageTitle' => $sourceArticle->getName(),
                    'interpretations' => [ $interpretation ],
                    'related' => $related,
                    'uid' => $uid,
                    'path' => $path,
                    'license' => $license,
                    'entity_lookup' => $entityLookup,
                    'glossary_lookup' => $glossaryLookup,
                    'pageMeta' => [
                        'jsonLd' => $sourceArticle->jsonLdSerialize($request->getLocale()),
                        'og' => $this->buildOg($sourceArticle, $request, 'source', [ 'uid' => $sourceArticle->getUid() ]),
                        'twitter' => $this->buildTwitter($sourceArticle, $request, 'source', [ 'uid' => $sourceArticle->getUid() ]),
                    ],
                ]);
            }

            return $this->render('AppBundle:Article:viewer-media.html.twig', [
                'article' => $sourceArticle,
                'html' => $html,
                'meta' => $meta,
                'description' => $sourceDescription,
                'name' => $sourceArticle->getName(),
                'pageTitle' => $sourceArticle->getName(),
                'interpretations' => [ $interpretation ],
                'related' => $related,
                'uid' => $uid,
                'path' => $path,
                'license' => $license,
                'entity_lookup' => $entityLookup,
                'glossary_lookup' => $glossaryLookup,
                'pageMeta' => [
                    'jsonLd' => $sourceArticle->jsonLdSerialize($request->getLocale()),
                    'og' => $this->buildOg($sourceArticle, $request, 'source', [ 'uid' => $sourceArticle->getUid() ]),
                    'twitter' => $this->buildTwitter($sourceArticle, $request, 'source', [ 'uid' => $sourceArticle->getUid() ]),
                ],
            ]);
        }

        return $this->render('AppBundle:Article:viewer.html.twig', [
            'article' => $sourceArticle,
            'meta' => $meta,
            'description' => $sourceDescription,
            'name' => $sourceArticle->getName(),
            'pageTitle' => $sourceArticle->getName(),
            'interpretations' => [ $interpretation ],
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
                'og' => $this->buildOg($sourceArticle, $request, 'source', [ 'uid' => $sourceArticle->getUid() ]),
                'twitter' => $this->buildTwitter($sourceArticle, $request, 'source', [ 'uid' => $sourceArticle->getUid() ]),
            ],
        ]);
    }

    /**
     * @Route("/source/{uid}.jsonld", name="source-jsonld")
     * @Route("/source/{uid}", name="source")
     */
    public function sourceViewerAction(Request $request, $uid)
    {
        $criteria = [ 'uid' => $uid ];
        $locale = $request->getLocale();
        if (!empty($locale)) {
            $criteria['language'] = \AppBundle\Utils\Iso639::code1to3($locale);
        }

        $article = $this->getDoctrine()
                ->getRepository('AppBundle:SourceArticle')
                ->findOneBy($criteria);

        if (!$article) {
            throw $this->createNotFoundException('This source does not exist');
        }

        return $this->renderSourceViewer($request, $uid, $article);
    }

    protected function buildFolderName($uid)
    {
        if (!preg_match('/(source)\-(\d+)/', $uid, $matches)) {
            return false;
        }

        return sprintf('%s-%05d', $matches[1], $matches[2]);
    }

    static function mb_wordwrap($str, $width = 75, $break = "\n", $cut = false) {
        $lines = explode($break, $str);
        foreach ($lines as &$line) {
            $line = rtrim($line);
            if (mb_strlen($line) <= $width)
                continue;
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

    protected function renderReadme($uid)
    {
        $fs = new \Symfony\Component\Filesystem\Filesystem();

        $result = $this->getDoctrine()
                ->getRepository('AppBundle:SourceArticle')
                ->findByUid($uid);

        $ret = [];

        $translator = $this->container->get('translator');

        $defaultLocale = $translator->getLocale();

        foreach ($result as $sourceArticle) {
            $locale = \AppBundle\Utils\Iso639::code3to1($sourceArticle->getLanguage());
            if (in_array($locale, [ 'en', 'de' ])) {
                $translator->setLocale($locale);
                $content = $this->renderView('AppBundle:Article:readme-' . $locale . '.txt.twig',
                                         [ 'meta' => $sourceArticle ]);
                $tempnam = $fs->tempnam(sys_get_temp_dir(), 'readme-' . $locale);
                file_put_contents($tempnam,
                                  str_replace("\n", "\r\n",
                                              self::mb_wordwrap($content)));
                $ret[$translator->trans('README.txt')] = $tempnam;
            }
        }

        $translator->setLocale($defaultLocale);

        return $ret;
    }

    protected function buildImgSrcPath($relPath)
    {
        $imgDir = 'src/AppBundle/Resources/data/img/';
        $srcPath = $imgDir . $relPath;

        $baseDir = realpath($this->get('kernel')->getRootDir() . '/..');

        $srcPathFull = realpath($baseDir . '/' . $srcPath);

        return $srcPathFull;
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
            $teiHelper = new \AppBundle\Utils\TeiHelper();
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

        $relPath = sprintf('viewer/%s', $dir);
        $baseDir = realpath($this->get('kernel')->getRootDir() . '/..');
        $filePath = $baseDir . '/web/' . $relPath;

        if (!file_exists($filePath)) {
            return false;
        }

        return [ $relPath, $filePath ];
    }

    protected function generateZip($uid, $files)
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
        $imagickProcessor = $this->container->get('app.imagemagick');

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
            $criteria['language'] = \AppBundle\Utils\Iso639::code1to3($locale);
        }

        return $this->getDoctrine()
                ->getRepository('AppBundle:SourceArticle')
                ->findOneBy($criteria);
    }

    /**
     * @Route("/source/{uid}.zip", name="source-download")
     */
    public function downloadAction(Request $request, $uid)
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
        $readme = $this->renderReadme($uid);
        if (false !== $readme) {
            $files = array_merge($files, $readme);
        }

        $urlZip = $this->generateZip($uid, $files);
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
    public function metsAction(Request $request, $uid)
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

        $twig = $this->get('twig');
        $template = $twig->loadTemplate('AppBundle:Article:mods-fragments.xml.twig');
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

    public function tei2htmlAction($path)
    {
        $parts = explode('/', $path, 2);
        $lang = 'de';

        if (preg_match('/^tei\/(translation|transcription)\.(de|en|yi|yl)\/(page\-(\d+)(\.xml))$/', $parts[1], $matches)) {
            $lang = $matches[2];
            $page = $matches[3];
        }
        else {
            $page = preg_replace('/[^0-9a-zA-Z\.\-]/', '', $parts[1]);
        }

        // source
        $uid = preg_replace('/[^0-9a-zA-Z_\-\:]/', '', $parts[0]);
        if (preg_match('/(article|source)\-(\d+)/', $uid, $matches)) {
            $fname = sprintf('%s-%05d.%s',
                             $matches[1], $matches[2], $lang);
        }
        $fname .= '.xml';

        // check if source is splitted into parts
        $baseDir = realpath($this->get('kernel')->getRootDir() . '/..');

        $targetPath = sprintf('web/viewer/%s', $uid);
        $targetDir = realpath($baseDir . '/' . $targetPath);

        $html = 'TODO: A problem occured';
        if (!empty($targetDir)) {
            $pagesPath = 'pages.' . $lang;
            if (!is_dir($targetDir . '/' . $pagesPath)) {
                mkdir($targetDir . '/' . $pagesPath);
            }

            if (is_dir($targetDir . '/' . $pagesPath)) {
                $pagesDir = realpath($targetDir . '/' . $pagesPath);

                if (!file_exists($pagesDir . '/' . $page)) {
                    // TODO: check dates
                    $pagesDirUri = 'file:///' . str_replace('\\', '/', $pagesDir);
                    // we have to split the source file to pages
                    $res = $this->renderTei($fname, 'split-pages.xsl',
                                            [ 'params' => [ 'outdir' => $pagesDirUri ] ]);
                }

                $params = [
                    'locateXmlResource' => false,
                    'params' => [
                        'lang' => \AppBundle\Utils\Iso639::code1To3($lang), // localize labels in xslt
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

    public function imgInfoAction($path)
    {
        $parts = explode('/', $path);

        $derivate = preg_replace('/[^0-9a-zA-Z_\-\:]/', '', $parts[0]);
        $fname = preg_replace('/[^0-9a-zA-Z\.]/', '', $parts[1]);

        $baseDir = realpath($this->get('kernel')->getRootDir() . '/..');
        $srcPath = sprintf('src/AppBundle/Resources/data/img/%s', $derivate);

        $fnameFull = realpath($baseDir . '/' . $srcPath . '/' . $fname);

        if (!file_exists($fnameFull)) {
            throw $this->createNotFoundException('This source-image does not exist');
        }

        $size = @getimagesize($fnameFull);
        if (empty($size)) {
            throw $this->createNotFoundException('The size of the source-image could not be determined');
        }

        $width = $size[0];
        $height = $size[1];

        $iViewTiler = new \AppBundle\Utils\IViewTiler();
        $level = $iViewTiler->determineMaxZoom($width, $height);

        $response = new Response(<<<EOX
<?xml version="1.0" encoding="UTF-8"?>
<imageinfo derivate="${derivate}" path="${fname}" tiles="1" width="${width}" height="${height}" zoomLevel="${level}" />
EOX
        );
        $response->headers->set('Content-Type', 'text/xml');

        return $response;
    }
}

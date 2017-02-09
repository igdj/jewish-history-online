<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Response;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class SourceController extends ArticleController
{
    protected function renderSourceViewer($uid, $sourceArticle)
    {
        $fname = $this->buildArticleFname($sourceArticle);

        $teiHelper = new \AppBundle\Utils\TeiHelper();
        $meta = $sourceArticle; // $teiHelper->analyzeHeader($this->locateTeiResource($fname));
        $firstFacs = $teiHelper->getFirstPbFacs($this->locateTeiResource($fname));

        $params = [
            'params' => [
                'lang' => \AppBundle\Utils\Iso639::code1To3($this->getRequest()->getLocale()), // localize labels in xslt
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

        if (in_array($this->container->get('request')->get('_route'), [ 'source-jsonld' ])) {
            return new JsonLdResponse($sourceArticle->jsonLdSerialize($this->getRequest()->getLocale()));
        }

        $entityLookup = $this->buildEntityLookup($entities);
        $glossaryLookup = $this->buildGlossaryLookup($glossaryTerms);

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
                                       $this->get('request')->getBaseURL()
                                       . '/viewer/' . $path);

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
                    'jsonLd' => $sourceArticle->jsonLdSerialize($this->getRequest()->getLocale()),
                    'og' => $this->buildOg($sourceArticle, 'source', [ 'uid' => $sourceArticle->getUid() ]),
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
                'jsonLd' => $sourceArticle->jsonLdSerialize($this->getRequest()->getLocale()),
                'og' => $this->buildOg($sourceArticle, 'source', [ 'uid' => $sourceArticle->getUid() ]),
            ],
        ]);
    }

    /**
     * @Route("/source/{uid}")
     */
    public function sourceViewerAction($uid)
    {
        $criteria = [ 'uid' => $uid ];
        $locale = $this->get('request')->getLocale();
        if (!empty($locale)) {
            $criteria['language'] = \AppBundle\Utils\Iso639::code1to3($locale);
        }

        $article = $this->getDoctrine()
                ->getRepository('AppBundle:SourceArticle')
                ->findOneBy($criteria);

        if (!$article) {
            throw $this->createNotFoundException('This source does not exist');
        }

        return $this->renderSourceViewer($uid, $article);
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

        foreach (new \GlobIterator($srcDir . '/f*.jpg') as $file) {
            if ($file->isFile()) {
                $files[$file->getFilename()] = $file->getPathname();
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

    protected function generateZip($uid, $files)
    {
        $dir = $this->buildFolderName($uid);
        if (false === $dir) {
            return false;
        }

        $relPath = sprintf('viewer/%s', $dir);
        $baseDir = realpath($this->get('kernel')->getRootDir() . '/..');
        $dstPath = $baseDir . '/web/' . $relPath;

        if (!file_exists($dstPath)) {
            return false;
        }

        $fnameZip = $dir . '.zip';
        $fullnameZip = $dstPath . '/' . $fnameZip;
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

    public function downloadAction($uid)
    {
        $criteria = [ 'uid' => $uid ];
        $locale = $this->get('request')->getLocale();
        if (!empty($locale)) {
            $criteria['language'] = \AppBundle\Utils\Iso639::code1to3($locale);
        }

        $article = $this->getDoctrine()
                ->getRepository('AppBundle:SourceArticle')
                ->findOneBy($criteria);

        if (!$article) {
            throw $this->createNotFoundException('This source does not exist');
        }

        $files = false;
        // check if we are allowed to download
        if ($article->licenseAllowsDownload()) {
            $files = $this->buildDownloadFiles($uid, $article);
        }

        if (false === $files) {
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

    public function tei2htmlAction($path)
    {
        $parts = explode('/', $path, 2);
        $lang = 'de';

        if (preg_match('/^tei\/(translation|transcription)\.(de|en|yi)\/(page\-(\d+)(\.xml))$/', $parts[1], $matches)) {
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

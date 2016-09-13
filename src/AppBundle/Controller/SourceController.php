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
    protected function adjustMedia($html, $baseUrl)
    {
        $crawler = new \Symfony\Component\DomCrawler\Crawler();
        $crawler->addHtmlContent($html);

        $crawler->filter('audio > source')->each(function ($node, $i) use ($baseUrl) {
            $src = $node->attr('src');
            $node->getNode(0)->setAttribute('src', $baseUrl . '/' . $src);
        });

        $crawler->filter('video > source')->each(function ($node, $i) use ($baseUrl) {
            $src = $node->attr('src');
            $node->getNode(0)->setAttribute('src', $baseUrl . '/' . $src);
        });

        $crawler->filter('img')->each(function ($node, $i) use ($baseUrl) {
            $src = $node->attr('src');
            $node->getNode(0)->setAttribute('src', $baseUrl . '/' . $src);
        });

        return $crawler->html();
    }

    protected function renderSourceViewer($uid, $sourceArticle)
    {
        $fname = $this->buildArticleFname($sourceArticle);

        $teiHelper = new \AppBundle\Utils\TeiHelper();
        $meta = $sourceArticle; // $teiHelper->analyzeHeader($this->locateTeiResource($fname));
        $firstFacs = $teiHelper->getFirstPbFacs($this->locateTeiResource($fname));

        $html = $this->renderTei($fname);

        list($authors, $section_headers, $license, $entities, $glossaryTerms) = $this->extractPartsFromHtml($html);

        $sourceDescription = null;
        $related = [];
        $interpretation = $sourceArticle->getIsPartOf();
        if (isset($interpretation)) {
            $sourceDescription = [ 'article' => $interpretation,
                                   'html' => $this->renderSourceDescription($interpretation) ];
            list($dummy, $dummy, $license, $entitiesSourceDescription, $glossaryTermsSourceDescription) = $this->extractPartsFromHtml($sourceDescription['html']);

            $entities = array_merge($entities, $entitiesSourceDescription);
            $glossaryTerms += $glossaryTermsSourceDescription;

            $related = $this->getDoctrine()
                ->getRepository('AppBundle:Article')
                ->findBy([ 'isPartOf' => $interpretation ],
                         [ 'dateCreated' => 'ASC', 'name' => 'ASC']);
        }

        $entityLookup = $this->buildEntityLookup($entities);
        $glossaryLookup = $this->buildGlossaryLookup($glossaryTerms);

        $fnameMets = $this->buildArticleFname($sourceArticle, '.mets.xml');
        $parts = explode('.', $fnameMets);
        $path = $parts[0];

        if (empty($firstFacs) && in_array($sourceArticle->getSourceType(), [ 'Audio', 'Video', 'Bild', 'Image', 'Objekt', 'Object' ])) {
            $html = $this->adjustMedia($html,
                                       $this->get('request')->getBaseURL()
                                       . '/viewer/' . $path);

            return $this->render('AppBundle:Article:viewer-media.html.twig',
                                 [
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
                                  ]);
        }

        return $this->render('AppBundle:Article:viewer.html.twig',
                             [
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

    public function tei2htmlAction($path)
    {
        $parts = explode('/', $path, 2);
        $lang = 'de';

        if (preg_match('/^tei\/(translation|transcription)\.(de|en)\/(page\-(\d+)(\.xml))$/', $parts[1], $matches)) {
            $lang = $matches[2];
            $page = $matches[3];
        }
        else {
            $page = preg_replace('/[^0-9a-zA-Z\.\-]/', '', $parts[1]);
        }
        /*
        if (preg_match('/(.+)\.(de|en)(\.xml)$/', $page, $matches)) {
            $page = $matches[1] . $matches[3];
            $lang = $matches[2];
        }
        */

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
                                            [ 'params' => [ 'outdir' => $pagesDirUri ]]);
                }

                if (file_exists($pagesDir . '/' . $page)) {
                    $html = $this->renderTei(realpath($pagesDir . '/' . $page), 'dtabf_viewer.xsl',
                                             [ 'locateXmlResource' => false ]);
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

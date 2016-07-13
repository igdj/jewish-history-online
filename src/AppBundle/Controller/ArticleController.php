<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Response;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class ArticleController extends RenderTeiController
{
    /*
     * TODO: maybe move into entity
     */
    protected function buildArticleFname($article, $extension = '.xml')
    {
        $fname = $article->getSlug();
        if (empty($fname)) {
            $uid = $article->getUid();
            if (preg_match('/(article|source)\-(\d+)/', $uid, $matches)) {
                $fname = sprintf('%s-%05d.%s',
                                 $matches[1], $matches[2], $article->getLanguage());
            }
        }
        $fname .= $extension;
        return $fname;
    }

    protected function renderSource($sourceArticle)
    {
        $html = $this->renderTei($this->buildArticleFname($sourceArticle));

        list($authors, $section_headers, $license, $entities, $glossaryTerms) = $this->extractPartsFromHtml($html);

        $interpretation = $sourceArticle->getIsPartOf();
        if (isset($interpretation)) {
            $related = $this->getDoctrine()
                ->getRepository('AppBundle:Article')
                ->findBy([ 'isPartOf' => $interpretation ],
                         [ 'name' => 'ASC']);
        }

        return $this->render('AppBundle:Article:source.html.twig',
                             [
                                'article' => $sourceArticle,
                                'name' => $sourceArticle->getName(),
                                'html' => $html,
                                'interpretation' => $interpretation,
                                'related' => $related,
                                // 'section_headers' => $section_headers,
                                'license' => $license,
                              ]);
    }

    protected function renderSourceDescription($interpretation)
    {
        $html = $this->renderTei($this->buildArticleFname($interpretation), 'dtabf_note.xsl');
        return $html;
    }

    protected function renderSourceViewer($uid, $sourceArticle)
    {
        $fname = $this->buildArticleFname($sourceArticle);

        $teiHelper = new \AppBundle\Utils\TeiHelper();
        $meta = $teiHelper->analyzeHeader($this->locateTeiResource($fname));

        $html = $this->renderTei($fname);

        list($authors, $section_headers, $license, $entities, $glossaryTerms) = $this->extractPartsFromHtml($html);

        $sourceDescription = null;
        $interpretation = $sourceArticle->getIsPartOf();
        if (isset($interpretation)) {
            $sourceDescription = [ 'article' => $interpretation,
                                   'html' => $this->renderSourceDescription($interpretation) ];

            $related = $this->getDoctrine()
                ->getRepository('AppBundle:Article')
                ->findBy([ 'isPartOf' => $interpretation ],
                         [ 'name' => 'ASC']);
        }

        $fnameMets = $this->buildArticleFname($sourceArticle, '.mets.xml');
        $parts = explode('.', $fnameMets);
        $path = $parts[0];

        return $this->render('AppBundle:Article:viewer.html.twig',
                             [
                                'article' => $sourceArticle,
                                'meta' => $meta,
                                'description' => $sourceDescription,
                                'name' => $sourceArticle->getName(),
                                'interpretations' => [ $interpretation ],
                                'related' => $related,
                                'uid' => $uid,
                                'path' => $path,
                                'mets' => $fnameMets,
                                'license' => $license,
                              ]);
    }

    protected function renderArticle($article)
    {
        $fname = $article->getSlug();
        if (empty($fname)) {
            $uid = $article->getUid();
            if (preg_match('/(article|source)\-(\d+)/', $uid, $matches)) {
                $fname = sprintf('%s-%05d.%s',
                                 $matches[1], $matches[2], $article->getLanguage());
            }
        }
        $fname .= '.xml';

        $html = $this->renderTei($fname);

        list($authors, $section_headers, $license, $entities, $glossaryTerms) = $this->extractPartsFromHtml($html);

        $entityLookup = $this->buildEntityLookup($entities);
        $glossaryLookup = $this->buildGlossaryLookup($glossaryTerms);

        $related = $this->getDoctrine()
            ->getRepository('AppBundle:Article')
            ->findBy([ 'isPartOf' => $article ],
                     [ 'name' => 'ASC']);

        $sourceDescription = $this->renderSourceDescription($article);

        return $this->render('AppBundle:Article:article.html.twig',
                             [
                                'article' => $article,
                                'source_description' => $sourceDescription,
                                'related' => $related,
                                'name' => $article->getName(),
                                'html' => $html,
                                'authors' => $authors,
                                'section_headers' => $section_headers,
                                'license' => $license,
                                'entity_lookup' => $entityLookup,
                                'glossary_lookup' => $glossaryLookup,
                              ]);
    }

    public function tei2htmlAction($path)
    {
        $parts = explode('/', $path, 2);
        $lang = 'de';

        $page = preg_replace('/[^0-9a-zA-Z\.\-]/', '', $parts[1]);
        if (preg_match('/(.+)\.(de|en)(\.xml)$/', $page, $matches)) {
            $page = $matches[1] . $matches[3];
            $lang = $matches[2];
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

    /**
     * @Route("/article/{slug}")
     */
    public function articleBySlugAction($slug)
    {
        $article = $this->getDoctrine()
                ->getRepository('AppBundle:Article')
                ->findOneBySlug($slug);

        if (!$article) {
            throw $this->createNotFoundException('This article does not exist');
        }

        return $this->renderArticle($article);
    }

    /**
     * @Route("/source/{uid}/viewer")
     */
    public function sourceViewerByUidAction($uid)
    {
        $article = $this->getDoctrine()
                ->getRepository('AppBundle:Article')
                ->findOneByUid($uid);

        if (!$article) {
            throw $this->createNotFoundException('This source does not exist');
        }

        return $this->renderSourceViewer($uid, $article);
    }

    /**
     * @Route("/source/{uid}")
     */
    public function sourceByUidAction($uid)
    {
        $article = $this->getDoctrine()
                ->getRepository('AppBundle:Article')
                ->findOneByUid($uid);

        if (!$article) {
            throw $this->createNotFoundException('This source does not exist');
        }

        return $this->renderSource($article);
    }

}

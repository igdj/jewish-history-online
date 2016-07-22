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

        $html = $this->renderTei($fname);

        list($authors, $section_headers, $license, $entities, $glossaryTerms) = $this->extractPartsFromHtml($html);

        $sourceDescription = null;
        $interpretation = $sourceArticle->getIsPartOf();
        if (isset($interpretation)) {
            $sourceDescription = [ 'article' => $interpretation,
                                   'html' => $this->renderSourceDescription($interpretation) ];
            list($dummy, $dummy, $license, $entitiesSourceDescription, $glossaryTermsSourceDescription) = $this->extractPartsFromHtml($sourceDescription['html']);

            $entities += $entitiesSourceDescription;
            $glossaryTerms += $glossaryTermsSourceDescription;

            $related = $this->getDoctrine()
                ->getRepository('AppBundle:Article')
                ->findBy([ 'isPartOf' => $interpretation ],
                         [ 'name' => 'ASC']);
        }

        $entityLookup = $this->buildEntityLookup($entities);
        $glossaryLookup = $this->buildGlossaryLookup($glossaryTerms);

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
}

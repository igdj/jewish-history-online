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

        if (empty($fname) || false === $this->locateTeiResource($fname . $extension)) {
            $uid = $article->getUid();
            if (preg_match('/(article|source)\-(\d+)/', $uid, $matches)) {
                $fname = sprintf('%s-%05d.%s',
                                 $matches[1], $matches[2],
                                 \AppBundle\Utils\Iso639::code3to1($article->getLanguage()));
            }
        }
        $fname .= $extension;
        return $fname;
    }

    protected function renderSourceDescription($interpretation)
    {
        $html = $this->renderTei($this->buildArticleFname($interpretation), 'dtabf_note.xsl');
        return $html;
    }

    protected function renderArticle($article)
    {
        $fname = $this->buildArticleFname($article);

        $teiHelper = new \AppBundle\Utils\TeiHelper();
        $meta = $teiHelper->analyzeHeader($this->locateTeiResource($fname));

        $html = $this->renderTei($fname);

        list($authors, $section_headers, $license, $entities, $glossaryTerms) = $this->extractPartsFromHtml($html);

        $sourceDescription = $this->renderSourceDescription($article);
        list($dummy, $dummy, $license, $entitiesSourceDescription, $glossaryTermsSourceDescription) = $this->extractPartsFromHtml($sourceDescription);

        $entities = array_merge($entities, $entitiesSourceDescription);

        $entityLookup = $this->buildEntityLookup($entities);
        $glossaryLookup = $this->buildGlossaryLookup($glossaryTerms);

        $related = $this->getDoctrine()
            ->getRepository('AppBundle:Article')
            ->findBy([ 'isPartOf' => $article ],
                     [ 'dateCreated' => 'ASC', 'name' => 'ASC']);

        $localeSwitch = [];
        $translations = $this->getDoctrine()
            ->getRepository('AppBundle:Article')
            ->findBy([ 'uid' => $article->getUid() ]);
        foreach ($translations as $translation) {
            if ($article->getLanguage() != $translation->getLanguage()) {
                $localeSwitch[\AppBundle\Utils\Iso639::code3to1($translation->getLanguage())]
                    = [ 'slug' => $translation->getSlug(true) ];
            }
        }

        return $this->render('AppBundle:Article:article.html.twig',
                             [
                                'article' => $article,
                                'meta' => $meta,
                                'source_description' => $sourceDescription,
                                'related' => $related,
                                'name' => $article->getName(),
                                'html' => $html,
                                'authors' => $authors,
                                'section_headers' => $section_headers,
                                'license' => $license,
                                'entity_lookup' => $entityLookup,
                                'glossary_lookup' => $glossaryLookup,
                                'route_params_locale_switch' => $localeSwitch,
                              ]);
    }

    /**
     * @Route("/article/{slug}")
     */
    public function articleAction($slug)
    {
        $criteria = [];
        $locale = $this->get('request')->getLocale();
        if (!empty($locale)) {
            $criteria['language'] = \AppBundle\Utils\Iso639::code1to3($locale);
        }

        if (preg_match('/article-\d+/', $slug)) {
            $criteria['uid'] = $slug;
        }
        else {
            $criteria['slug'] = $slug;
        }

        $article = $this->getDoctrine()
                ->getRepository('AppBundle:Article')
                ->findOneBy($criteria);

        if (!$article) {
            throw $this->createNotFoundException('This article does not exist');
        }

        return $this->renderArticle($article);
    }
}

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
        $generatePrintView = 'article-pdf' == $this->container->get('request')->get('_route');

        $fname = $this->buildArticleFname($article);

        // localize labels in xslt
        $language = null;
        $params = [];
        if ($article instanceof \AppBundle\Entity\Article) {
            $language = $article->getLanguage();
            if (!empty($language)) {
                $params['lang'] = $language;
            }
        }

        $teiHelper = new \AppBundle\Utils\TeiHelper();
        $meta = $teiHelper->analyzeHeader($this->locateTeiResource($fname));

        $html = $this->renderTei($fname,
                                 $generatePrintView ? 'dtabf_article-printview.xsl' : 'dtabf_article.xsl',
                                 [ 'params' => $params ]);

        list($authors, $section_headers, $license, $entities, $bibitemLookup, $glossaryTerms, $refs) = $this->extractPartsFromHtml($html);
        $html = $this->adjustRefs($html, $refs, $language);

        $html = $this->adjustMedia($html,
                                   $this->get('request')->getBaseURL()
                                   . '/viewer');

        $sourceDescription = $this->renderSourceDescription($article);
        if ($generatePrintView) {
            $html = $this->removeByCssSelector('<body>' . $html . '</body>',
                                               [ 'h2 + br', 'h3 + br' ]);

            $templating = $this->container->get('templating');

            $html = $templating->render('AppBundle:Article:article-printview.html.twig', [
                'article' => $article,
                'meta' => $meta,
                'source_description' => $sourceDescription,
                'name' => $article->getName(),
                'html' => preg_replace('/<\/?body>/', '', $html),
                'authors' => $authors,
                'section_headers' => $section_headers,
                'license' => $license,
            ]);

            $this->renderPdf($html, str_replace(':', '-', $article->getSlug(true)) . '.pdf');
            return;
        }

        list($dummy, $dummy, $dummy, $entitiesSourceDescription, $dummy, $glossaryTermsSourceDescription, $refs) = $this->extractPartsFromHtml($sourceDescription);

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

        if (in_array($this->container->get('request')->get('_route'), [ 'article-jsonld' ])) {
            return new JsonLdResponse($article->jsonLdSerialize($this->getRequest()->getLocale()));
        }

        return $this->render('AppBundle:Article:article.html.twig', [
            'article' => $article,
            'meta' => $meta,
            'source_description' => $sourceDescription,
            'related' => $related,
            'name' => $article->getName(),
            'pageTitle' => $article->getName(), // TODO: append authors in brackets
            'html' => $html,
            'authors' => $authors,
            'section_headers' => $section_headers,
            'license' => $license,
            'entity_lookup' => $entityLookup,
            'bibitem_lookup' => $bibitemLookup,
            'glossary_lookup' => $glossaryLookup,
            'pageMeta' => [
                'jsonLd' => $article->jsonLdSerialize($this->getRequest()->getLocale()),
                'og' => $this->buildOg($article, 'article', [ 'slug' => $article->getSlug(true) ]),
            ],
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

    /**
     * @Route("/article")
     */
    public function indexAction()
    {
        $language = null;
        $locale = $this->get('request')->getLocale();
        if (!empty($locale)) {
            $language = \AppBundle\Utils\Iso639::code1to3($locale);
        }

        $sort = in_array($this->container->get('request')->get('_route'), [
                    'article-index-date', 'article-index-rss'
                ])
            ? '-A.datePublished' : 'A.creator';

        $qb = $this->getDoctrine()
                ->getManager()
                ->createQueryBuilder();

        $qb->select([ 'A',
                     $sort . ' HIDDEN articleSort'
            ])
            ->from('AppBundle:Article', 'A')
            ->where('A.status = 1')
            ->andWhere('A.language = :language')
            ->andWhere("A.articleSection IN ('background', 'interpretation')")
            ->andWhere('A.creator IS NOT NULL') // TODO: set for background
            ->orderBy('articleSort, A.creator, A.name')
            ;
        $query = $qb->getQuery();
        if (!empty($language)) {
            $query->setParameter('language', $language);
        }
        if ('article-index-rss' == $this->container->get('request')->get('_route')) {
            $query->setMaxResults(10);
        }
        $articles = $query->getResult();

        if ('article-index-rss' == $this->container->get('request')->get('_route')) {
            $feed = $this->get('eko_feed.feed.manager')->get('article');
            $feed->addFromArray($articles);

            return new Response($feed->render('rss')); // or 'atom'
        }

        return $this->render('AppBundle:Article:index.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Article Overview'),
            'articles' => $articles,
        ]);
    }
}

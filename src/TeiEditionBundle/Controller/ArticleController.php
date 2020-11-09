<?php

namespace TeiEditionBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Contracts\Translation\TranslatorInterface;

use Eko\FeedBundle\Feed\FeedManager;

/**
 *
 */
class ArticleController
extends RenderTeiController
{
    protected function buildArticleFname($article, $extension = '.xml')
    {
        $fname = $article->getSlug();

        if (empty($fname) || false === $this->locateTeiResource($fname . $extension)) {
            $fname = $this->buildArticleFnameFromUid($article->getUid(), \TeiEditionBundle\Utils\Iso639::code3to1($article->getLanguage()));
        }

        $fname .= $extension;

        return $fname;
    }

    /*
     * TODO: maybe move into entity
     */
    protected function buildArticleFnameFromUid($uid, $locale)
    {
        if (preg_match('/(article|source)\-(\d+)/', $uid, $matches)) {
            return sprintf('%s-%05d.%s',
                           $matches[1], $matches[2], $locale);
        }
    }

    protected function renderSourceDescription($article, $translator)
    {
        // localize labels in xslt
        $language = null;
        $params = [];
        if ($article instanceof \TeiEditionBundle\Entity\Article) {
            $language = $article->getLanguage();
            if (!empty($language)) {
                $params['lang'] = $language;
            }
        }

        $html = $this->renderTei($this->buildArticleFname($article), 'dtabf_note.xsl', [
            'params' => $params,
        ]);

        if (empty($html)) {
            return $html;
        }

        list($authors, $sectionHeaders, $license, $entities, $bibitemLookup, $glossaryTerms, $refs) = $this->extractPartsFromHtml($html, $translator);

        return $this->adjustRefs($html, $refs, $translator, $language);
    }

    protected function renderArticle(Request $request,
                                     TranslatorInterface $translator,
                                     $article)
    {
        $generatePrintView = 'article-pdf' == $request->get('_route');

        $fname = $this->buildArticleFname($article);

        // localize labels in xslt
        $language = null;
        $params = [];
        if ($article instanceof \TeiEditionBundle\Entity\Article) {
            $language = $article->getLanguage();
            if (!empty($language)) {
                $params['lang'] = $language;
            }
        }

        $teiHelper = new \TeiEditionBundle\Utils\TeiHelper();
        $meta = $teiHelper->analyzeHeader($this->locateTeiResource($fname));

        $path = '';
        list($prefix, $path) = explode(':', $meta->uid, 2);
        if (preg_match('/\-(\d+)$/', $path, $matches)) {
            $path = preg_replace('/\-(\d+)$/', sprintf('-%05d', $matches[1]), $path);
        }


        $html = $this->renderTei($fname,
                                 $generatePrintView ? 'dtabf_article-printview.xsl' : 'dtabf_article.xsl',
                                 [ 'params' => $params ]);

        list($authors, $sectionHeaders, $license, $entities, $bibitemLookup, $glossaryTerms, $refs) = $this->extractPartsFromHtml($html, $translator);
        $html = $this->adjustRefs($html, $refs, $translator, $language);

        $html = $this->adjustMedia($html,
                                   $request->getBaseURL()
                                   . '/viewer/' . $path,
                                   $generatePrintView ? '' : 'img-responsive');

        $sourceDescription = $this->renderSourceDescription($article, $translator);
        if ($generatePrintView) {
            $html = $this->removeByCssSelector('<body>' . $html . '</body>',
                                               [ 'h2 + br', 'h3 + br' ]);

            $html = $this->renderView('@TeiEdition/Article/article-printview.html.twig', [
                'article' => $article,
                'meta' => $meta,
                'source_description' => $sourceDescription,
                'name' => $article->getName(),
                'html' => preg_replace('/<\/?body>/', '', $html),
                'authors' => $authors,
                'section_headers' => $sectionHeaders,
                'license' => $license,
            ]);

            $this->renderPdf($html, str_replace(':', '-', $article->getSlug(true)) . '.pdf');

            return;
        }

        list($dummy, $dummy, $dummy, $entitiesSourceDescription, $dummy, $glossaryTermsSourceDescription, $refs) = $this->extractPartsFromHtml($sourceDescription, $translator);

        $entities = array_merge($entities, $entitiesSourceDescription);

        $entityLookup = $this->buildEntityLookup($entities);
        $glossaryLookup = $this->buildGlossaryLookup($glossaryTerms, $request->getLocale());

        $related = $this->getDoctrine()
            ->getRepository('\TeiEditionBundle\Entity\Article')
            ->findBy([ 'isPartOf' => $article ],
                     [ 'dateCreated' => 'ASC', 'name' => 'ASC']);

        $localeSwitch = [];
        $translations = $this->getDoctrine()
            ->getRepository('\TeiEditionBundle\Entity\Article')
            ->findBy([ 'uid' => $article->getUid() ]);
        foreach ($translations as $translation) {
            if ($article->getLanguage() != $translation->getLanguage()) {
                $localeSwitch[\TeiEditionBundle\Utils\Iso639::code3to1($translation->getLanguage())]
                    = [ 'slug' => $translation->getSlug(true) ];
            }
        }

        if (in_array($request->get('_route'), [ 'article-jsonld' ])) {
            return new JsonLdResponse($article->jsonLdSerialize($request->getLocale()));
        }

        return $this->render('@TeiEdition/Article/article.html.twig', [
            'article' => $article,
            'meta' => $meta,
            'source_description' => $sourceDescription,
            'related' => $related,
            'name' => $article->getName(),
            'pageTitle' => $article->getName(), // TODO: append authors in brackets
            'html' => $html,
            'authors' => $authors,
            'section_headers' => $sectionHeaders,
            'license' => $license,
            'entity_lookup' => $entityLookup,
            'bibitem_lookup' => $bibitemLookup,
            'glossary_lookup' => $glossaryLookup,
            'pageMeta' => [
                'jsonLd' => $article->jsonLdSerialize($request->getLocale()),
                'og' => $this->buildOg($article, $request, $translator, 'article', [ 'slug' => $article->getSlug(true) ]),
                'twitter' => $this->buildTwitter($article, $request, 'article', [ 'slug' => $article->getSlug(true) ]),
            ],
            'route_params_locale_switch' => $localeSwitch,
        ]);
    }

    /**
     * @Route("/article/date", name="article-index-date")
     * @Route("/article.rss", name="article-index-rss")
     * @Route("/article", name="article-index")
     */
    public function indexAction(Request $request,
                                TranslatorInterface $translator,
                                FeedManager $feedManager)
    {
        $language = null;
        $locale = $request->getLocale();
        if (!empty($locale)) {
            $language = \TeiEditionBundle\Utils\Iso639::code1to3($locale);
        }

        $sort = in_array($request->get('_route'), [
                    'article-index-date', 'article-index-rss'
                ])
            ? '-A.datePublished' : 'A.creator';

        $qb = $this->getDoctrine()
                ->getManager()
                ->createQueryBuilder();

        $qb->select([ 'A',
                $sort . ' HIDDEN articleSort'
            ])
            ->from('\TeiEditionBundle\Entity\Article', 'A')
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

        if ('article-index-rss' == $request->get('_route')) {
            $query->setMaxResults(10);
        }

        $articles = $query->getResult();

        if ('article-index-rss' == $request->get('_route')) {
            $feed = $feedManager->get('article');
            $feed->addFromArray($articles);

            return new Response($feed->render('rss'), // // or 'atom'
                Response::HTTP_OK,
                [ 'content-type' => 'text/xml' ]
            );
        }

        return $this->render('@TeiEdition/Article/index.html.twig', [
            'pageTitle' => $translator->trans('Article Overview'),
            'articles' => $articles,
        ]);
    }

    /**
     * @Route("/article/{slug}.jsonld", name="article-jsonld")
     * @Route("/article/{slug}.pdf", name="article-pdf")
     * @Route("/article/{slug}", name="article")
     */
    public function detailAction(Request $request,
                                 TranslatorInterface $translator,
                                 $slug)
    {
        $criteria = [];
        $locale = $request->getLocale();
        if (!empty($locale)) {
            $criteria['language'] = \TeiEditionBundle\Utils\Iso639::code1to3($locale);
        }

        if (preg_match('/article-\d+/', $slug)) {
            $criteria['uid'] = $slug;
        }
        else {
            $criteria['slug'] = $slug;
        }

        $article = $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\Article')
                ->findOneBy($criteria);

        if (!$article) {
            throw $this->createNotFoundException('This article does not exist');
        }

        return $this->renderArticle($request, $translator, $article);
    }
}

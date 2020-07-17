<?php

namespace TeiEditionBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Contracts\Translation\TranslatorInterface;

use Cocur\Slugify\SlugifyInterface;
use Sylius\Bundle\ThemeBundle\Context\SettableThemeContext;
use FS\SolrBundle\SolrInterface;
use Knp\Component\Pager\PaginatorInterface;

/**
 *
 */
class SearchController
extends BaseController
{
    protected $solr;
    protected $paginator;

    public function __construct(KernelInterface $kernel,
                                SlugifyInterface $slugify,
                                SettableThemeContext $themeContext,
                                SolrInterface $solr,
                                PaginatorInterface $paginator)
    {
        parent::__construct($kernel, $slugify, $themeContext);

        $this->solr = $solr;
        $this->paginator = $paginator;
    }

    protected function getQuery(Request $request, $facetNames = [])
    {
        $q = ''; $filter = [];

        if ($request->getMethod() == 'POST') {
            $q = trim($request->request->get('q'));
        }
        else {
            $q = trim($request->query->get('q'));
            $filter = $request->query->get('filter');
            if (!empty($filter)) {
                // filter down to allowed facetNames as keys
                $filter = array_intersect_key($filter, array_flip($facetNames));
            }
        }

        return [ $q, $filter ];
    }

    /*
     * set the locale-specific endpoint
     */
    protected function getSolrClient($request)
    {
        $locale = $request->getLocale();
        $endpoint = 'jgo_presentation-' . $locale;

        $solrClient = $this->solr->getClient();

        // set the proper $endpoint
        $solrClient->setDefaultEndpoint($endpoint);

        return $solrClient;
    }

    /**
     * @Route("/search", name="search-index")
     */
    public function indexAction(Request $request,
                                TranslatorInterface $translator)
    {
        $solrClient = $this->getSolrClient($request);

        $meta = $results = [];
        $pagination = null;
        $facetNames = [ 'entity' ];

        list($q, $filter) = $this->getQuery($request, $facetNames);

        if (!empty($q) || !empty($filter)) {
            $meta['query'] = $q;

            // get a select query instance
            $solrQuery = $solrClient->createSelect();

            // paging
            $resultsPerPage = 20;
            $solrQuery
                ->setStart(0)
                ->setRows($resultsPerPage)
                ;

            // actual query
            $edismax = $solrQuery->getEdisMax();
            $edismax->setQueryFields('_text_');
            $edismax->setMinimumMatch('100%');

            $solrQuery->setQuery($q);

            // get the facetset component
            $facetSet = $solrQuery->getFacetSet();

            // create the facets
            foreach ($facetNames as $facetName) {
                $field = $facetName . '_s'; // currently all string fields

                if (!empty($filter[$facetName])) {
                    // set a filter-query to this value
                    $solrQuery->addFilterQuery([
                        'key' => $facetName,
                        'tag' => $facetName,
                        'query' => $field . ':' . $filter[$facetName]
                    ]);
                }

                // create a facet field
                $facetField = $facetSet
                    ->createFacetField([
                        'key' => $facetName,
                        'field' => $field,
                        'exclude' => $facetName,
                    ])
                    ->setMinCount(1) // only get the ones with matches
                    ;
            }

            // highlighting
            $hl = $solrQuery->getHighlighting();
            $hl->setFields('highlight');
            // hl.requireFieldMatch=true.
            $hl->setSimplePrefix('<b>');
            $hl->setSimplePostfix('</b>');

            /*
            // debug
            $request = $solrClient->createRequest($solrQuery);
            $uri = $request->getUri();
            die($uri);
            */

            // build paginator - this one excecutes the quey
            $pagination = $this->paginator->paginate(
                [ $solrClient, $solrQuery ],
                $request->query->get('page', 1),
                $resultsPerPage
            );
            $pagination->setParam('q', $q);

            $resultset = $pagination->getCustomParameter('result');

            $meta['numFound'] = $pagination->getTotalItemCount(); // not really needed

            $meta['facet'] = [];
            foreach ($facetNames as $facetName) {
                $facet = $resultset->getFacetSet()->getFacet($facetName);
                if (count($facet) > 1) {
                    $meta['facet'][$facetName] = $facet;
                }
            }

            // show documents using the resultset iterator
            foreach ($pagination as $document) {
                $result = [];

                // the documents are also iterable, to get all fields
                foreach ($document as $field => $value) {
                    // this converts multivalue fields to a comma-separated string
                    if (is_array($value)) {
                        $value = implode(', ', $value);
                    }

                    $result[$field] = $value;
                }

                $results[] = $result;
            }
        }

        return $this->render('@TeiEdition/Search/index.html.twig', [
            'pageTitle' => $translator->trans('Search'),
            'results' => $results,
            'meta' => $meta,
            'pagination' => $pagination,
            'highlighting' => isset($resultset) ? $resultset->getHighlighting() : null,
        ]);
    }

    /**
     * @Route("/search/suggest", name="search-suggest")
     */
    public function suggestAction(Request $request)
    {
        $suggestions = [];

        list($q, $filter) = $this->getQuery($request);
        if (empty($q) || mb_strlen($q, 'UTF-8') < 3) {
            return new \Symfony\Component\HttpFoundation\JsonResponse($suggestions);
        }

        $solrClient = $this->getSolrClient($request);

        // get a suggester query instance
        $query = $solrClient->createSuggester();
        $query->setQuery($q);
        $query->setDictionary('suggester');

        $query->addParam('suggest.cfq', '!bibitem'); // currently exclude

        /*
        // override the presets
        $query->setOnlyMorePopular(true);
        $query->setCount(10);
        $query->setCollate(true);
        */

        // this executes the query and returns the result
        $resultset = $solrClient->suggester($query);
        $data = $resultset->getData();
        $terms = array_keys($data['suggest']['suggester']);
        $term = $terms[0]; // should be same as $q, but we don't want to rely on this

        $terms = [];
        foreach ($data['suggest']['suggester'][$term]['suggestions'] as $suggestion) {
            if (in_array($suggestion['term'], $terms)) {
                // duplicates like for example city and state Hamburg are confusing
                continue;
            }
            $terms[] = $suggestion['term'];

            // build route from $suggestion['payload']
            $parts = explode('_', $suggestion['payload'], 2);
            $route = null;
            switch ($parts[0]) {
                case 'sourcearticle':
                case 'article':
                    $articleIds[] = intval($parts[1]);
                    $route = 'article';
                    $routeParams = [ 'id' => intval($parts[1]) ];
                    break;

                case 'bibitem':
                    $route = 'bibliography';
                    ; // fall through
                default:
                    if (is_null($route)) {
                        $route = $parts[0];
                        $routeParams = [ 'id' => intval($parts[1]) ];
                    }
            }

            $suggestion['route'] = $route;
            $suggestion['routeParams'] = $routeParams;

            $suggestions[] = $suggestion;
        }

        // payload can only hold a single field, so we need to lookup the rest
        $articles = [];
        if (!empty($articleIds)) {
            $qb = $this->getDoctrine()
                    ->getRepository('\TeiEditionBundle\Entity\Article')
                    ->createQueryBuilder('A')
                    ;
            $qb->select('A.id, A.uid, A.slug, A.articleSection')
                ->where('A.status = 1')
                ->andWhere('A.id IN (:ids)')
                ->setParameter('ids', $articleIds)
                ;

            foreach ($qb->getQuery()->getResult() as $article) {
                $articles[$article['id']] = $article;
            }
        }

        $suggestionsFinal = [];
        foreach ($suggestions as $suggestion) {
            $url = null;

            if ('article' == $suggestion['route']) {
                if (!array_key_exists($suggestion['routeParams']['id'], $articles)) {
                    continue; // lookup failed
                }

                $article = & $articles[$suggestion['routeParams']['id']];
                switch ($article['articleSection']) {
                    case 'background':
                        $route = 'topic-background';
                        $routeParams = [ 'slug' => $article['slug'] ];
                        break;

                    case 'interpretation':
                        $route = 'article';
                        $routeParams = [
                            'slug' => !empty($article['slug'])
                                ? $article['slug'] : $article['uid'],
                        ];
                        break;

                    case 'source':
                        $route = 'source';
                        $routeParams = [ 'uid' => $article['uid'] ];
                        break;

                    default:
                        // we shouldn't get here
                        continue 2;
                }

                $url = $this->generateUrl($route, $routeParams);
            }
            else {
                $url = $this->generateUrl($suggestion['route'], $suggestion['routeParams']);
            }

            if (!is_null($url)) {
                $suggestionsFinal[] = [
                    'name' => $suggestion['term'],
                    'url' => $url,
                ];
            }
        }

        return new \Symfony\Component\HttpFoundation\JsonResponse($suggestionsFinal);
    }
}

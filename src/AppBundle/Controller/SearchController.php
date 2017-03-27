<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class SearchController extends Controller
{
    /**
     * @Route("/search")
     */
    public function indexAction()
    {
        $solrClient = $this->get('solr.client')->getClient();

        $request = $this->getRequest();

        $locale = $request->getLocale();
        $endpoint = 'jgo_presentation-' . $locale;

        $facetNames = [ 'entity' ];

        $meta = $results = [];
        $q = ''; $filter = [];
        $pagination = null;

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
                    ->createFacetField([ 'key' => $facetName, 'field' => $field, 'exclude' => $facetName ])
                    ->setMinCount(1) // only get the ones with matches
                    ;
            }

            // highlighting
            $hl = $solrQuery->getHighlighting();
            $hl->setFields('highlight');
            // hl.requireFieldMatch=true.
            $hl->setSimplePrefix('<b>');
            $hl->setSimplePostfix('</b>');

            // set the proper $endpoint
            $solrClient->setDefaultEndpoint($endpoint);

            /*
            // debug
            $request = $solrClient->createRequest($solrQuery);
            $uri = $request->getUri();
            die($uri);
            */

            // build paginator - this one excecutes the quey
            $paginator = $this->get('knp_paginator');

            $pagination = $paginator->paginate(
                array($solrClient, $solrQuery),
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

        return $this->render('AppBundle:Search:index.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Search'),
            'results' => $results,
            'meta' => $meta,
            'pagination' => $pagination,
            'highlighting' => isset($resultset) ? $resultset->getHighlighting() : null,
        ]);
    }
}

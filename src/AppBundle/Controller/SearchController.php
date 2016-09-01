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

        $meta = $results = [];
        $q = '';
        $pagination = null;

        if ($request->getMethod() == 'POST') {
            $q = trim($request->request->get('q'));
        }
        else {
            $q = trim($request->query->get('q'));
        }

        if (!empty($q)) {
            $meta['query'] = $q;

            // get a select query instance
            $solrQuery = $solrClient->createSelect();

            // TODO: paging
            $resultsPerPage = 20;
            $solrQuery
                ->setStart(0)
                ->setRows($resultsPerPage)
                ;

            $edismax = $solrQuery->getEdisMax();

            $edismax->setQueryFields('_text_');

            $edismax->setMinimumMatch('100%');

            $solrQuery->setQuery($q);

            // get the facetset component
            $facetSet = $solrQuery->getFacetSet();

            // create a facet query on entity_
            $facetSet->createFacetField('entity')
                ->setField('entity_s')
                ->setMinCount(1) // only get the ones with matches
                ;

            // this executes the query and returns the result
            $solrClient->setDefaultEndpoint($endpoint);

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
            foreach ([ 'entity' ] as $facetName) {
                $meta['facet'][$facetName] = $resultset->getFacetSet()->getFacet('entity');
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

        return $this->render('AppBundle:Search:index.html.twig',
                             [
                               'results' => $results,
                               'meta' => $meta,
                               'pagination' => $pagination,
                             ]);
    }

}

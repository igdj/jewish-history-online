<?php

/**
 *
 */

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

abstract class RenderTeiController extends Controller
{
    protected function locateTeiResource($fnameXml)
    {
        $kernel = $this->container->get('kernel');

        try {
            $pathToXml = $kernel->locateResource('@AppBundle/Resources/data/tei/' . $fnameXml);
        } catch (\InvalidArgumentException $e) {
            return false;
        }

        return $pathToXml;
    }

    protected function renderTei($fnameXml, $fnameXslt = 'dtabf_article.xsl', $options = [])
    {
        $kernel = $this->container->get('kernel');

        $locateResource = !array_key_exists('locateXmlResource', $options)
            || $options['locateXmlResource'];
        if ($locateResource) {
            $pathToXml = $this->locateTeiResource($fnameXml);
            if (false === $pathToXml) {
                return false;
            }
        }
        else {
            $pathToXml = $fnameXml;
        }

        $proc = $this->get('app.xslt');
        $pathToXslt = $kernel->locateResource('@AppBundle/Resources/data/xsl/' . $fnameXslt);
        $res = $proc->transformFileToXml($pathToXml, $pathToXslt, $options);
        return $res;
    }

    protected function buildEntityLookup($entities)
    {
        $entitiesByType = [ 'person' => [], 'place' => [], 'organization' => [] ];
        foreach ($entities as $entity) {
            if (!array_key_exists($entity['type'], $entitiesByType)) {
                continue;
            }
            if (!array_key_exists($entity['uri'], $entitiesByType[$entity['type']])) {
                $entitiesByType[$entity['type']][$entity['uri']] = [ 'count' => 0 ];
            }
            ++$entitiesByType[$entity['type']][$entity['uri']]['count'];
        }

        foreach ($entitiesByType as $type => $uriCount) {
            switch ($type) {
                case 'person':
                    $personGnds = [];
                    foreach ($uriCount as $uri => $count) {
                        if (preg_match('/^'
                                       . preg_quote('http://d-nb.info/gnd/', '/')
                                       . '(\d+[xX]?)$/', $uri, $matches))
                        {
                            $personGnds[$matches[1]] = $uri;
                        }
                    }
                    if (!empty($personGnds)) {
                        $persons = $this->getDoctrine()
                            ->getRepository('AppBundle:Person')
                            ->findBy([ 'gnd' => array_keys($personGnds) ]);
                        foreach ($persons as $person) {
                            if ($person->getStatus() >= 0) {
                                $uri = $personGnds[$person->getGnd()];
                                $details = [ 'url' => $this->generateUrl('person-by-gnd', [ 'gnd' => $person->getGnd()]) ];
                                $entitiesByType[$type][$uri] += $details;
                            }
                        }
                    }
                    break;

                case 'place':
                    $placeTgns = [];
                    foreach ($uriCount as $uri => $count) {
                        if (preg_match('/^'
                                       . preg_quote('http://vocab.getty.edu/tgn/', '/')
                                       . '(\d+?)$/', $uri, $matches))
                        {
                            $placeTgns[$matches[1]] = $uri;
                        }
                    }
                    if (!empty($placeTgns)) {
                        $places = $this->getDoctrine()
                            ->getRepository('AppBundle:Place')
                            ->findBy([ 'tgn' => array_keys($placeTgns) ]);
                        foreach ($places as $place) {
                            if (true /*$person->getStatus() >= 0 */) {
                                $uri = $placeTgns[$place->getTgn()];
                                $details = [ 'url' => $this->generateUrl('place-by-tgn', [ 'tgn' => $place->getTgn()]) ];
                                $entitiesByType[$type][$uri] += $details;
                            }
                        }
                    }
                    break;

                case 'organization':
                    $organizationGnds = [];
                    foreach ($uriCount as $uri => $count) {
                        if (preg_match('/^'
                                       . preg_quote('http://d-nb.info/gnd/', '/')
                                       . '(\d+[\-]?[\dxX]?)$/', $uri, $matches))
                        {
                            $organizationGnds[$matches[1]] = $uri;
                        }
                    }
                    if (!empty($organizationGnds)) {
                        $organizations = $this->getDoctrine()
                            ->getRepository('AppBundle:Organization')
                            ->findBy([ 'gnd' => array_keys($organizationGnds) ]);
                        foreach ($organizations as $organization) {
                            if ($organization->getStatus() >= 0) {
                                $uri = $organizationGnds[$organization->getGnd()];
                                $details = [ 'url' => $this->generateUrl('organization-by-gnd', [ 'gnd' => $organization->getGnd()]) ];
                                $entitiesByType[$type][$uri] += $details;
                            }
                        }
                    }
                    break;

            }
        }

        return $entitiesByType;
    }

    protected function buildGlossaryLookup($glossaryTerms)
    {
        $slugify = $this->container->get('cocur_slugify');
        switch ($this->container->get('request')->getLocale()) {
            case 'de':
                $language = 'deu';
                break;

            default:
                $language = 'eng';
                break;
        }

        $slugs = array_map(function ($term) use ($slugify) {
                                return $slugify->slugify($term);
                           },
                           $glossaryTerms);

        $termsBySlug = [];

        foreach( $this->getDoctrine()
                ->getRepository('AppBundle:GlossaryTerm')
                ->findBy([ 'status' => [ 0, 1 ],
                           'language' => $language,
                           'slug' => $slugs ])
                as $term)
        {
            $termsBySlug[$term->getSlug()] = $term;
        }

        $glossaryLookup = [];

        foreach ($glossaryTerms as $glossaryTerm) {
            $slug = $slugify->slugify($glossaryTerm);
            if (array_key_exists($slug, $termsBySlug)) {
                $term = $termsBySlug[$slug];
                $glossaryLookup[$glossaryTerm] = [ 'slug' => $term->getSlug(),
                                                   'headline' => $term->getHeadline() ];
            }
        }

        return $glossaryLookup;
    }

    protected function extractPartsFromHtml($html)
    {
        $crawler = new \Symfony\Component\DomCrawler\Crawler();
        $crawler->addHtmlContent($html);

        // extract toc
        $section_headers = $crawler->filterXPath('//h2')->each(function ($node, $i) {
            return [ 'id' => $node->attr('id'), 'text' => $node->text() ];
        });
        $authors = $crawler->filterXPath("//ul[@id='authors']/li")->each(function ($node, $i) {
            $author = [ 'text' => $node->text() ];
            $slug = $node->attr('data-author-slug');
            if (!empty($slug)) {
                $author['slug'] = $slug;
            }
            return $author;
        });

        // extract license
        $license = null;
        $node = $crawler
            ->filterXpath("//div[@id='license']");
        if (count($node) > 0) {
            $license = [ 'text' => trim($node->text()),
                         'url' => $node->attr('data-target') ];
        }

        // extract entities
        $entities = $crawler->filterXPath("//span[@class='entity-ref']")->each(function ($node, $i) {
            $entity = [];
            $type = $node->attr('data-type');
            if (!empty($type)) {
                $entity['type'] = $type;
            }
            $uri = $node->attr('data-uri');
            if (!empty($uri)) {
                $entity['uri'] = $uri;
            }
            return $entity;
        });

        // extract glossary terms
        $glossaryTerms = array_unique($crawler->filterXPath("//span[@class='glossary']")->each(function ($node, $i) {
            return $node->attr('data-title');
        }));

        // try to get bios in the current locale
        $locale = $this->get('translator')->getLocale();
        $author_slugs = [];
        $authors_by_slug = [];
        foreach ($authors as $author) {
            if (array_key_exists('slug', $author)) {
                $author_slugs[] = $author['slug'];
                $authors_by_slug[$author['slug']] = $author;
            }
            else {
                $authors_by_slug[] = $author;
            }
        }
        if (!empty($author_slugs)) {
            $query = $this->get('doctrine')
                ->getManager()
                ->createQuery('SELECT p.slug, p.description FROM AppBundle:Person p WHERE p.slug IN (:slugs)')
                ->setParameter('slugs', $author_slugs);

            foreach ($query->getResult() as $person) {
                if (!is_null($person['description']) && array_key_exists($locale, $person['description'])) {
                    $authors_by_slug[$person['slug']]['description'] = $person['description'][$locale];
                }
            }
        }

        return [ $authors_by_slug, $section_headers, $license, $entities, $glossaryTerms ];
    }
}

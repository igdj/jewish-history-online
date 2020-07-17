<?php

/**
 * Shared methods for Controllers working with the TEI-files
 */

namespace TeiEditionBundle\Controller;

use Symfony\Component\CssSelector\CssSelectorConverter;
use Symfony\Component\HttpKernel\KernelInterface;

use Symfony\Contracts\Translation\TranslatorInterface;

use Cocur\Slugify\SlugifyInterface;

use Doctrine\ORM\EntityManagerInterface;

use Sylius\Bundle\ThemeBundle\Context\SettableThemeContext;

use TeiEditionBundle\Utils\Xsl\XsltProcessor;

abstract class RenderTeiController
extends BaseController
{
    use SharingBuilderTrait,
        \TeiEditionBundle\Utils\RenderTeiTrait; // use shared method renderTei()

    protected $xsltProcessor;

    public function __construct(KernelInterface $kernel,
                                SlugifyInterface $slugify,
                                SettableThemeContext $themeContext,
                                XsltProcessor $xsltProcessor)
    {
        parent::__construct($kernel, $slugify, $themeContext);

        $this->xsltProcessor = $xsltProcessor;
    }

    protected function buildRefLookup($refs, TranslatorInterface $translator, $language)
    {
        $refMap = [];

        if (empty($refs)) {
            return ;
        }

        // make sure we only pick-up the published ones
        $query = $this->getDoctrine()
            ->getManager()
            ->createQuery("SELECT a"
                          . " FROM \TeiEditionBundle\Entity\Article a"
                          . " WHERE a.status IN (1)"
                          . " AND a.uid IN (:refs)"
                          . (!empty($language) ? ' AND a.language=:language' : '')
                          . " ORDER BY a.name")
            ->setParameter('refs', $refs, \Doctrine\DBAL\Connection::PARAM_STR_ARRAY)
            ;

        if (!empty($language)) {
            $query->setParameter('language', $language);
        }

        foreach ($query->getResult() as $article) {
            $prefix = null;
            switch ($article->getArticleSection()) {
                case 'background':
                    $prefix = $translator->trans('Topic');
                    $route = 'topic-background';
                    $params = [ 'slug' => $article->getSlug() ];
                    break;

                case 'interpretation':
                    $prefix = $translator->trans('Interpretation');
                    $route = 'article';
                    $params = [ 'slug' => $article->getSlug(true) ];
                    break;

                case 'source':
                    $prefix = $translator->trans('Source');
                    $route = 'source';
                    $params = [ 'uid' => $article->getUid() ];
                    break;

                default:
                    $route = null;
            }

            if (!is_null($route)) {
                $entry = [
                    'href' => $this->generateUrl($route, $params, true),
                ];
                if (!empty($prefix)) {
                    $entry['headline'] = $prefix . ': ' . $article->getName();
                    if (count($article->getAuthor()) > 0) {
                        $authors = [];
                        foreach ($article->getAuthor() as $author) {
                            $authors[] = $author->getFullname(true);
                        }
                        $entry['headline'] .= ' (' . implode(', ', $authors) . ')';
                    }
                }
                $refMap[$article->getUid()] = $entry;
            }
        }

        return $refMap;
    }

    protected function buildEntityLookup($entities)
    {
        $entitiesByType = [
            'person' => [],
            'place' => [],
            'organization' => [],
            'date' => [],
        ];

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
                    $personGnds = $personDjhs = $personStolpersteine = [];
                    foreach ($uriCount as $uri => $count) {
                        if (preg_match('/^'
                                       . preg_quote('http://d-nb.info/gnd/', '/')
                                       . '(\d+[xX]?)$/', $uri, $matches))
                        {
                            $personGnds[$matches[1]] = $uri;
                        }
                        else if (preg_match('/^'
                                    . preg_quote('http://www.dasjuedischehamburg.de/inhalt/', '/')
                                    . '(.+)$/', $uri, $matches))
                        {
                            $personDjhs[urldecode($matches[1])] = $uri;
                        }
                        else if (preg_match('/^'
                                            . preg_quote('http://www.stolpersteine-hamburg.de/', '/')
                                            . '.*?BIO_ID=(\d+)/', $uri, $matches))
                        {
                            $personStolpersteine[$matches[1]] = $uri;
                        }
                    }

                    if (!empty($personGnds)) {
                        $persons = $this->getDoctrine()
                            ->getRepository('\TeiEditionBundle\Entity\Person')
                            ->findBy([ 'gnd' => array_keys($personGnds) ])
                            ;

                        foreach ($persons as $person) {
                            if ($person->getStatus() >= 0) {
                                $uri = $personGnds[$person->getGnd()];
                                $details = [
                                    'url' => $this->generateUrl('person-by-gnd', [
                                        'gnd' => $person->getGnd(),
                                    ]),
                                ];
                                $entitiesByType[$type][$uri] += $details;
                            }
                        }
                    }

                    if (!empty($personDjhs)) {
                        $persons = $this->getDoctrine()
                            ->getRepository('\TeiEditionBundle\Entity\Person')
                            ->findBy([ 'djh' => array_keys($personDjhs) ])
                            ;

                        foreach ($persons as $person) {
                            if ($person->getStatus() >= 0) {
                                $uri = $personDjhs[$person->getDjh()];
                                $details = [
                                    'url' => $this->generateUrl('person', [
                                        'id' => $person->getId(),
                                    ]),
                                ];
                                $entitiesByType[$type][$uri] += $details;
                            }
                        }
                    }

                    if (!empty($personStolpersteine)) {
                        $persons = $this->getDoctrine()
                            ->getRepository('\TeiEditionBundle\Entity\Person')
                            ->findBy([ 'stolpersteine' => array_keys($personStolpersteine) ])
                            ;

                        foreach ($persons as $person) {
                            if ($person->getStatus() >= 0) {
                                $uri = $personStolpersteine[$person->getStolpersteine()];
                                $details = [
                                    'url' => $this->generateUrl('person', [
                                        'id' => $person->getId(),
                                    ]),
                                ];
                                $entitiesByType[$type][$uri] += $details;
                            }
                        }
                    }
                    break;

                case 'place':
                    $placeTgns = $placeGeo = [];
                    foreach ($uriCount as $uri => $count) {
                        if (preg_match('/^'
                                       . preg_quote('http://vocab.getty.edu/tgn/', '/')
                                       . '(\d+?)$/', $uri, $matches))
                        {
                            $placeTgns[$matches[1]] = $uri;
                        }
                        else if (preg_match('/^geo\:(-?\d+\.\d*)(,)\s*(-?\d+\.\d*)/', $uri, $matches)) {
                            $placeGeo['geo:' . $matches[1] . $matches[2] . $matches[3]] = $uri;
                        }
                        else {
                            // TODO: maybe handle gnd as well
                        }
                    }

                    if (!empty($placeTgns)) {
                        $places = $this->getDoctrine()
                            ->getRepository('\TeiEditionBundle\Entity\Place')
                            ->findBy([ 'tgn' => array_keys($placeTgns) ])
                            ;

                        foreach ($places as $place) {
                            if ($place->getStatus() >= 0) {
                                $uri = $placeTgns[$place->getTgn()];
                                $details = [
                                    'url' => $this->generateUrl('place-by-tgn', [
                                        'tgn' => $place->getTgn()
                                    ]),
                                ];
                                $entitiesByType[$type][$uri] += $details;
                            }
                        }
                    }

                    if (!empty($placeGeo)) {
                        $geos = [];

                        foreach ($placeGeo as $uriNormalized => $uriOriginal) {
                            $coords = explode(',', $latLong = str_replace('geo:', '', $uriNormalized));
                            $details = [
                                'url' => $uriNormalized,
                                'latLong' => [ (double)$coords[0], (double)$coords[1] ],
                            ];
                            $entitiesByType[$type][$uriOriginal] += $details;

                            $geos[] = $latLong;
                        }

                        // override the urls of thse entries that link to a Landmark
                        $landmarks = $this->getDoctrine()
                            ->getRepository('\TeiEditionBundle\Entity\Landmark')
                            ->findBy([
                                'geo' => $geos,
                                'status' => [ 0, 1 ],
                            ])
                            ;

                        foreach ($landmarks as $landmark) {
                            if ($landmark->getStatus() >= 0) {
                                $uri = 'geo:' . $landmark->getGeo();
                                $entitiesByType[$type][$uri]['url'] = $this->generateUrl('landmark', [
                                    'id' => $landmark->getId(),
                                ]);
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
                            ->getRepository('\TeiEditionBundle\Entity\Organization')
                            ->findBy([ 'gnd' => array_keys($organizationGnds) ])
                            ;

                        foreach ($organizations as $organization) {
                            if ($organization->getStatus() >= 0) {
                                $uri = $organizationGnds[$organization->getGnd()];
                                $details = [
                                    'url' => $this->generateUrl('organization-by-gnd', [
                                        'gnd' => $organization->getGnd(),
                                    ]),
                                ];
                                $entitiesByType[$type][$uri] += $details;
                            }
                        }
                    }
                    break;

                case 'date':
                    $dateGnds = [];
                    foreach ($uriCount as $uri => $count) {
                        if (preg_match('/^'
                                       . preg_quote('http://d-nb.info/gnd/', '/')
                                       . '(\d+[\-]?[\dxX]?)$/', $uri, $matches))
                        {
                            $dateGnds[$matches[1]] = $uri;
                        }
                    }

                    if (!empty($dateGnds)) {
                        $events = $this->getDoctrine()
                            ->getRepository('\TeiEditionBundle\Entity\Event')
                            ->findBy([ 'gnd' => array_keys($dateGnds) ])
                            ;

                        foreach ($events as $event) {
                            if ($event->getStatus() >= 0 && !is_null($event->getStartDate())) {
                                $uri = $dateGnds[$event->getGnd()];
                                $details = [
                                    'url' => $this->generateUrl('event-by-gnd', [
                                        'gnd' => $event->getGnd(),
                                    ]),
                                ];
                                $entitiesByType[$type][$uri] += $details;
                            }
                        }
                    }
                    break;
            }
        }

        return $entitiesByType;
    }

    protected function buildGlossaryLookup($glossaryTerms, $locale)
    {
        $glossaryLookup = [];

        if (empty($glossaryTerms)) {
            return $glossaryLookup;
        }

        $language = \TeiEditionBundle\Utils\Iso639::code1to3($locale);

        $that = $this;

        $slugs = array_map(
            function ($term) use ($that) {
                return $that->slugify($term);
            },
            $glossaryTerms);

        $termsBySlug = [];

        // lookup matching terms by slug
        foreach ($this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\GlossaryTerm')
                ->findBy([
                   'status' => [ 0, 1 ],
                   'language' => $language,
                   'slug' => $slugs,
                ]) as $term)
        {
            $termsBySlug[$term->getSlug()] = $term;
        }

        foreach ($glossaryTerms as $glossaryTerm) {
            $slug = $this->slugify($glossaryTerm);
            if (array_key_exists($slug, $termsBySlug)) {
                $term = $termsBySlug[$slug];
                $headline = $term->getHeadline();
                $headline = str_replace(']]', '', $headline);
                $headline = str_replace('[[', '→', $headline);
                $glossaryLookup[$glossaryTerm] = [
                    'slug' => $term->getSlug(),
                    'name' => $term->getName(),
                    'headline' => $headline,
                ];
            }
        }

        return $glossaryLookup;
    }

    protected function adjustMedia($html, $baseUrl, $imgClass = 'image-responsive')
    {
        $crawler = new \Symfony\Component\DomCrawler\Crawler();
        $crawler->addHtmlContent($html);

        $crawler->filter('audio > source')->each(function ($node, $i) use ($baseUrl) {
            $src = $node->attr('src');
            $node->getNode(0)->setAttribute('src', $baseUrl . '/' . $src);
        });

        // for https://github.com/iainhouston/bootstrap3_player
        $crawler->filter('audio')->each(function ($node, $i) use ($baseUrl) {
            $poster = $node->attr('data-info-album-art');
            if (!is_null($poster)) {
                $node->getNode(0)->setAttribute('data-info-album-art', $baseUrl . '/' . $poster);
            }
        });

        $crawler->filter('video > source')->each(function ($node, $i) use ($baseUrl) {
            $src = $node->attr('src');
            $node->getNode(0)->setAttribute('src', $baseUrl . '/' . $src);
        });

        $crawler->filter('video')->each(function ($node, $i) use ($baseUrl) {
            $poster = $node->attr('poster');
            if (!is_null($poster)) {
                $node->getNode(0)->setAttribute('poster', $baseUrl . '/' . $poster);
            }
        });

        $crawler->filter('img')->each(function ($node, $i) use ($baseUrl, $imgClass) {
            $src = $node->attr('src');
            $node->getNode(0)->setAttribute('src', $baseUrl . '/' . $src);
            if (!empty($imgClass)) {
                $node->getNode(0)->setAttribute('class', $imgClass);
            }
        });

        return $crawler->html();
    }

    protected function renderPdf($html, $filename = '', $dest = 'I')
    {
        /*
        // for debugging
        echo $html;
        exit;
        */

        // mpdf
        $pdfGenerator = new \TeiEditionBundle\Utils\PdfGenerator([
            'fontDir' => [
                $this->locateData('font/'),
            ],
            'fontdata' => [
                'roboto' => [
                    'R' => 'Roboto-Regular.ttf',
                    'B' => 'Roboto-Bold.ttf',
                    'I' => 'Roboto-Italic.ttf',
                    'BI' => 'Roboto-BoldItalic.ttf',
                    // 'useOTL' => 0xFF, // this font does not have OTL table
                ],
                // see https://github.com/OdedEzer/heebo/tree/master/compiled_fonts/ttf
                'heebo' => [
                    'R' => 'Heebo-Regular.ttf',
                    'B' => 'Heebo-Bold.ttf',
                    'I' => 'Heebo-Regular.ttf',
                    'BI' => 'Heebo-Bold.ttf',
                ],
            ],
            'default_font' => 'roboto',
        ]);

        $fnameLogo = $this->getProjectDir() . '/web/img/icon/icons_wide.png';
        $pdfGenerator->imageVars['logo_top'] = file_get_contents($fnameLogo);

        // silence due to https://github.com/mpdf/mpdf/issues/302 when using tables
        @$pdfGenerator->writeHTML($html);

        $pdfGenerator->Output($filename, 'I');
    }

    protected function adjustRefs($html, $refs, $translator, $language)
    {
        if (empty($refs)) {
            // nothing to do
            return $html;
        }

        $refLookup = $this->buildRefLookup($refs, $translator, $language);

        $crawler = new \Symfony\Component\DomCrawler\Crawler();
        $crawler->addHtmlContent('<body>' . $html . '</body>');

        $crawler->filterXPath("//a[@class='external']")
            ->each(function ($crawler) use ($refLookup) {
                foreach ($crawler as $node) {
                    $href = $node->getAttribute('href');

                    if (preg_match('/^jgo:(article|source)\-(\d+)$/', $href)) {
                        if (array_key_exists($href, $refLookup)) {
                            $info = $refLookup[$href];
                            $node->setAttribute('href', $refLookup[$href]['href']);
                            if (!empty($info['headline'])) {
                                $node->setAttribute('title', $refLookup[$href]['headline']);
                                $node->setAttribute('class', 'setTooltip');
                            }
                        }
                        else {
                            $node->removeAttribute('href');
                            $node->setAttribute('class', 'externalDisabled');
                        }
                    }
                }
        });

        return preg_replace('/<\/?body>/', '', $crawler->html());
    }

    protected function extractPartsFromHtml(string $html, TranslatorInterface $translator)
    {
        $crawler = new \Symfony\Component\DomCrawler\Crawler();
        $crawler->addHtmlContent($html);

        // headers for TOC
        $sectionHeaders = $crawler->filterXPath('//h2')->each(function ($node, $i) {
            return [ 'id' => $node->attr('id'), 'text' => $node->text() ];
        });

        // authors
        $authors = $crawler->filterXPath("//ul[@id='authors']/li")->each(function ($node, $i) {
            $author = [ 'text' => $node->text() ];

            $slug = $node->attr('data-author-slug');
            if (!empty($slug)) {
                $author['slug'] = $slug;
            }

            return $author;
        });

        // license
        $license = null;
        $node = $crawler
            ->filterXpath("//div[@id='license']");
        if (count($node) > 0) {
            $license = [
                'text' => trim($node->text()),
                'url' => $node->attr('data-target'),
            ];
        }

        // entities
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

        // bibitem
        $bibitems = array_filter(array_unique($crawler->filterXPath("//span[@class='dta-bibl']")->each(function ($node, $i) {
            return trim($node->attr('data-corresp'));
        })));

        $bibitemsByCorresp = [];
        if (!empty($bibitems)) {
            foreach ($bibitems as $corresp) {
                $bibitemsMap[$corresp] = \TeiEditionBundle\Entity\Bibitem::slugifyCorresp($this->getSlugify(), $corresp);
            }

            $query = $this->getDoctrine()
                ->getManager()
                ->createQuery('SELECT b.slug'
                              . ' FROM \TeiEditionBundle\Entity\Bibitem b'
                              . ' WHERE b.slug IN (:slugs) AND b.status >= 0')
                ->setParameter('slugs', array_values($bibitemsMap))
                ;

            foreach ($query->getResult() as $bibitem) {
                $corresps = array_keys($bibitemsMap, $bibitem['slug']);
                foreach ($corresps as $corresp) {
                    $bibitemsByCorresp[$corresp] = $bibitem;
                }
            }
        }

        //  glossary terms
        $glossaryTerms = array_unique($crawler->filterXPath("//span[@class='glossary']")->each(function ($node, $i) {
            return $node->attr('data-title');
        }));

        // refs to other articles in the format jg:article-123 or jgo:source-123
        $refs = array_unique($crawler->filterXPath("//a[@class='external']")->each(function ($node, $i) {
            $href = $node->attr('href');
            if (preg_match('/^jgo:(article|source)\-(\d+)$/', $node->attr('href'))) {
                return $node->attr('href');
            }
        }));

        // try to get bios in the current locale
        $locale = $translator->getLocale();
        $authorSlugs = [];
        $authorsBySlug = [];
        foreach ($authors as $author) {
            if (array_key_exists('slug', $author)) {
                $authorSlugs[] = $author['slug'];
                $authorsBySlug[$author['slug']] = $author;
            }
            else {
                $authorsBySlug[] = $author;
            }
        }

        if (!empty($authorSlugs)) {
            $query = $this->getDoctrine()
                ->getManager()
                ->createQuery('SELECT p.slug, p.description, p.gender'
                              . ' FROM \TeiEditionBundle\Entity\Person p'
                              . ' WHERE p.slug IN (:slugs)')
                ->setParameter('slugs', $authorSlugs);

            foreach ($query->getResult() as $person) {
                $authorsBySlug[$person['slug']]['gender'] = $person['gender'];
                if (!is_null($person['description']) && array_key_exists($locale, $person['description'])) {
                    $authorsBySlug[$person['slug']]['description'] = $person['description'][$locale];
                }
            }
        }

        return [
            $authorsBySlug,
            $sectionHeaders,
            $license,
            $entities,
            $bibitemsByCorresp,
            $glossaryTerms,
            $refs,
        ];
    }
}

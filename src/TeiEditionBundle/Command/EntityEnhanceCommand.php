<?php
// src/TeiEditionBundle/Command/EntityEnhanceCommand.php

namespace TeiEditionBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

use Doctrine\ORM\EntityManagerInterface;

/**
 * Set additional information from various Web services.
 */
class EntityEnhanceCommand
extends BaseCommand
{
    protected function configure()
    {
        $this
            ->setName('entity:enhance')
            ->setDescription('Enhance Entities with additional information from Web services')
            ->addArgument(
                'type',
                InputArgument::REQUIRED,
                'which entities do you want to enhance (person / organization / place / country / bibitem)'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        switch ($input->getArgument('type')) {
            case 'person':
                return $this->enhancePerson();
                break;

            case 'place':
                return $this->enhancePlace();
                break;

            case 'organization':
                return $this->enhanceOrganization();
                break;

            case 'country':
                return $this->enhanceCountry();
                break;

            case 'bibitem':
                return $this->enhanceBibitem();
                break;

            default:
                $output->writeln(sprintf('<error>invalid type: %s</error>',
                                         $input->getArgument('type')));

                return 1;
        }
    }

    protected function normalizeUnicode($value)
    {
        if (!class_exists('\Normalizer')) {
            return $value;
        }

        if (!\Normalizer::isNormalized($value)) {
            $normalized = \Normalizer::normalize($value);
            if (false !== $normalized) {
                $value = $normalized;
            }
        }

        return $value;
    }

    /**
     * Executes a query
     *
     * @param string $query
     * @param array|null $headers
     * @param bool|null $assoc
     *
     * @throws NoResultException
     *
     * @return json object representing the query result
     */
    protected function executeJsonQuery($url, $headers = [], $assoc = false)
    {
        if (!isset($this->client)) {
            $this->client = new \EasyRdf\Http\Client();
        }

        $this->client->setUri($url);
        $this->client->resetParameters(true); // clear headers
        foreach ($headers as $name => $val) {
            $this->client->setHeaders($name, $val);
        }

        try {
            $response = $this->client->request();
            if ($response->getStatus() < 400) {
                $content = $response->getBody();
            }
        } catch (\Exception $e) {
            $content = null;
        }

        if (!isset($content)) {
            return false;
        }

        $json = json_decode(self::normalizeUnicode($content), true);

        // API error
        if (!isset($json)) {
            return false;
        }

        return $json;
    }

    protected function loadGndBeacon($files = [ 'dasjuedischehamburg'  => 'BEACON-GND-dasjuedischehamburg.txt' ])
    {
        $gndBeacon = [];

        foreach ($files as $key => $fname) {
            $info = [];

            $fnameFull = $this->locateData($fname);

            $lines = file($fnameFull);
            foreach ($lines as $line) {
                if (empty($line)) {
                    continue;
                }

                if (preg_match('/^\#/', $line)) {
                    if (preg_match('/^\#\s*(NAME|DESCRIPTION|PREFIX|TARGET)\s*\:\s*(.+)/', $line, $matches)) {
                        $info[strtolower($matches[1])] = trim($matches[2]);
                    }

                    continue;
                }

                $parts = explode('|', $line);
                if (count($parts) >= 3) {
                    $gnd = trim($parts[0]);
                    if (!array_key_exists($gnd, $gndBeacon)) {
                        $gndBeacon[$gnd] = [];
                    }

                    $gndBeacon[$gnd][$key] = $info + [ 'url' => trim($parts[2]) ];
                }
            }
        }

        return $gndBeacon;
    }

    protected function enhancePerson()
    {
        // currently beacon, entityfacts and wikidata
        $gndBeacon = $this->loadGndBeacon();

        $personRepository = $this->em->getRepository('\TeiEditionBundle\Entity\Person');
        $persons = $personRepository->findBy([ 'status' => [ 0, 1 ] ]);
        foreach ($persons as $person) {
            $persist = false;
            $gnd = $person->getGnd();
            if (empty($gnd)) {
                continue;
            }

            if (array_key_exists($gnd, $gndBeacon)) {
                $additional = $person->getAdditional();
                $additional['beacon'] = $gndBeacon[$gnd];
                $person->setAdditional($additional);
                $persist = true;
            }

            $additional = $person->getAdditional();
            if (is_null($additional) || !array_key_exists('wikidata', $additional)) {
                foreach ([ $this->getParameter('default_locale') ] as $locale) {
                    $wikidata = \TeiEditionBundle\Utils\BiographicalWikidata::fetchByGnd($gnd, $locale);

                    if (!empty($wikidata)) {
                        if (is_null($additional)) {
                            $additional = [];
                        }

                        if (!array_key_exists('wikidata', $additional)) {
                            $additional['wikidata'] = [];
                        }

                        $additional['wikidata'][$locale] = (array)$wikidata;
                        $person->setAdditional($additional);
                        $persist = true;
                    }
                }
            }

            foreach ($this->getParameter('locales') as $locale) {
                $entityfacts = $person->getEntityfacts($locale, true);

                if (is_null($entityfacts)) {
                    $url = sprintf('http://hub.culturegraph.org/entityfacts/%s', $gnd);
                    $result = $this->executeJsonQuery($url, [
                        'Accept' => 'application/json',
                        'Accept-Language' => $locale, // date-format!
                    ]);

                    if (false !== $result) {
                        $person->setEntityfacts($result, $locale);
                        $entityfacts = $person->getEntityfacts($locale, true);

                        if ('de' == $locale && !empty($result['biographicalOrHistoricalInformation'])) {
                            $description = $person->getDescription();
                            if (!array_key_exists($locale, $description)) {
                                $description[$locale] = $result['biographicalOrHistoricalInformation'];
                                $person->setDescription($description);
                            }
                        }

                        $persist = true;
                    }
                }

                if (!is_null($entityfacts)) {
                    $fullname = $person->getFullname();
                    if (empty($fullname)) {
                        // set surname - e.g. http://hub.culturegraph.org/entityfacts/118676059
                        foreach ([ 'surname' => 'givenName' ] as $src => $property) {
                            if (!empty($entityfacts[$src])) {
                                $method = 'set' . ucfirst($property);
                                $person->$method($entityfacts[$src]);
                                $persist = true;
                            }
                        }
                    }

                    // try to set birth/death place
                    foreach ([ 'birth', 'death' ] as $property) {
                        if ('en' == $locale) {
                            // we use english locale because of date format

                            $key = 'dateOf' . ucfirst($property);
                            if (!empty($entityfacts[$key])) {
                                $method = 'get' . ucfirst($property) . 'Date';
                                $date = $person->$method();
                                if (empty($date)) {
                                    $value = $entityfacts[$key];
                                    if (preg_match('/^\d{4}$/', $value)) {
                                        $value .= '-00-00';
                                    }
                                    else {
                                        $date = \DateTime::createFromFormat('F d, Y', $value);
                                        unset($value);
                                        if (isset($date)) {
                                            $res = \DateTime::getLastErrors();
                                            if (0 == $res['warning_count'] && 0 == $res['error_count']) {
                                                $date_str = $date->format('Y-m-d');
                                                if ('0000-00-00' !== $date_str) {
                                                    $value = $date_str;
                                                }
                                            }
                                        }
                                    }

                                    if (isset($value)) {
                                        var_dump($entityfacts['preferredName']);
                                        var_dump($property);
                                        var_dump($value);
                                        $method = 'set' . ucfirst($property) . 'Date';
                                        $person->$method($value);
                                        $persist = true;
                                    }
                                }
                            }
                        }

                        $method = 'get' . ucfirst($property) . 'PlaceInfo';
                        $placeInfo = $person->$method($locale);

                        if (is_null($placeInfo) || !empty($placeInfo['tgn'])) {
                            continue;
                        }

                        $place = null;
                        if ($placeInfo['name'] == 'Altona') {
                            $places = $this->em->getRepository('\TeiEditionBundle\Entity\Place')->findByTgn('7012310');
                        }
                        else if (!empty($placeInfo['gnd'])) {
                            $places = $this->em->getRepository('\TeiEditionBundle\Entity\Place')->findByGnd($placeInfo['gnd']);
                            if (empty($places)) {
                                // try to lookup by name
                                $places = $this->em->getRepository('\TeiEditionBundle\Entity\Place')->findByName($placeInfo['name']);
                                if (count($places) > 1) {
                                    $places[] = []; // skip if there are multiple matches
                                }
                            }
                        }
                        else {
                            continue;
                        }

                        if (!empty($places)) {
                            $place = $places[0];
                        }
                        else {
                            $geo = \TeiEditionBundle\Utils\GeographicalData::fetchByIdentifier('gnd' . ':' . $placeInfo['gnd']);
                            if (!empty($geo) && !empty($geo->sameAs)) {
                                foreach ($geo->sameAs as $uri) {
                                    if (preg_match('/^'
                                                   . preg_quote('http://sws.geonames.org/', '/')
                                                   . '(\d+)$/', $uri, $matches))
                                    {
                                        $geonamesId = $matches[1];
                                        $places = $this->em->getRepository('\TeiEditionBundle\Entity\Place')->findByGeonames($geonamesId);
                                        if (!empty($places)) {
                                            $place = $places[0];
                                        }
                                    }
                                }
                            }
                        }

                        if (!is_null($place)) {
                            $method = 'set' . ucfirst($property) . 'Place';
                            $person->$method($place);
                            $persist = true;
                        }
                        else {
                            echo sprintf("Lookup TGN: %s\thttps://d-nb.info/gnd/%s",
                                         $placeInfo['name'], $placeInfo['gnd'])
                              . "\n";
                        }
                    }
                }
            }

            if ($persist) {
                $this->em->persist($person);
                $this->flushEm($this->em);
            }
        }

        return 0;
    }

    protected function enhancePlace()
    {
        // currently only geonames
        // TODO: maybe get outlines
        // http://www.geonames.org/servlet/geonames?&srv=780&geonameId=2921044&type=json
        $placeRepository = $this->em->getRepository('\TeiEditionBundle\Entity\Place');

        foreach ([
                'nation', 'country',
                'state', 'metropolitan area',
                'inhabited place', 'neighborhood'
            ] as $type)
        {
            $places = $placeRepository->findBy([ 'type' => $type,
                                                 'geonames' => null]);

            foreach ($places as $place) {
                $geo = $place->getGeo();
                if (empty($geo) || false === strpos($geo, ':')) {
                    continue;
                }

                $persist = false;
                list($lat, $long) = explode(':', $geo, 2);
                $url = sprintf('http://api.geonames.org/extendedFindNearby?lat=%s&lng=%s&username=burckhardtd',
                               $lat, $long);

                $xml = simplexml_load_file($url);
                foreach ($xml->geoname as $geoname) {
                    switch ($type) {
                        case 'nation':
                            if ('PCLI' == $geoname->fcode) {
                                $geonames = (string)($geoname->geonameId);
                                var_dump($place->getName() . ': '
                                 . (string)($geoname->name) . ' - ' . $geonames );
                                $place->setGeonames($geonames);
                                $persist = true;
                            }
                            break;

                        case 'country':
                            if ('ADM1' == $geoname->fcode) {
                                $geonames = (string)($geoname->geonameId);
                                var_dump($place->getName() . ': '
                                 . (string)($geoname->name) . ' - ' . $geonames );
                                $place->setGeonames($geonames);
                                $persist = true;
                            }
                            break;

                        case 'state':
                            if ('ADM1' == $geoname->fcode) {
                                $geonames = (string)($geoname->geonameId);
                                var_dump($place->getName() . ': '
                                 . (string)($geoname->name) . ' - ' . $geonames );
                                $place->setGeonames($geonames);
                                $persist = true;
                            }
                            break;

                        case 'metropolitan area':
                            if ('ADM2' == $geoname->fcode) {
                                $geonames = (string)($geoname->geonameId);
                                var_dump($place->getName() . ': '
                                 . (string)($geoname->name) . ' - ' . $geonames );
                                $place->setGeonames($geonames);
                                $persist = true;
                            }
                            break;

                        case 'inhabited place':
                            if ('PPLA3' == $geoname->fcode || 'ADM4' == $geoname->fcode) {
                                $geonames = (string)($geoname->geonameId);
                                var_dump($place->getName() . ': '
                                 . (string)($geoname->name) . ' - ' . $geonames );
                                $place->setGeonames($geonames);
                                $persist = true;
                            }
                            break;

                        case 'neighborhood':
                            if ('PPLX' == $geoname->fcode) {
                                $geonames = (string)($geoname->geonameId);
                                var_dump($place->getName() . ': '
                                 . (string)($geoname->name) . ' - ' . $geonames );
                                $place->setGeonames($geonames);
                                $persist = true;
                            }
                            break;
                    }
                }

                if ($persist) {
                    $this->em->persist($place);
                    $this->flushEm($this->em);
                }
            }

            $places = $placeRepository->findBy([ 'type' => $type ]);
            foreach ($places as $place) {
                $persist = false;
                $additional = $place->getAdditional();

                if (!is_null($additional) && array_key_exists('bounds', $additional)) {
                    continue; // TODO: maybe option to force update
                }

                $geonames = $place->getGeonames();
                if (empty($geonames)) {
                    continue;
                }

                $url = sprintf('http://api.geonames.org/get?geonameId=%s&username=burckhardtd',
                               $geonames);
                $xml = simplexml_load_file($url);
                $json = json_encode($xml);
                $info_array = json_decode($json, true);
                if (array_key_exists('bbox', $info_array)) {
                    if (is_null($additional)) {
                        $additional = [];
                    }

                    $info = $info_array['bbox'];
                    $additional['bounds'] = [
                        [ $info['south'], $info['west'] ],
                        [ $info['north'], $info['east'] ],
                    ];

                    foreach ( [ 'areaInSqKm', 'population' ] as $key) {
                        if (array_key_exists($key, $info_array)) {
                            $additional[$key] = $info_array[$key];
                        }
                    }

                    $place->setAdditional($additional);
                    $persist = true;
                }

                if ($persist) {
                    $this->em->persist($place);
                    $this->flushEm($this->em);
                }
            }
        }

        return 0;
    }

    protected function enhanceOrganization()
    {
        // currently beacon
        $gndBeacon = $this->loadGndBeacon([ 'dasjuedischehamburg' => 'BEACON-GND-ORG-dasjuedischehamburg.txt' ]);

        $organizationRepository = $this->em->getRepository('\TeiEditionBundle\Entity\Organization');
        /*
        foreach ($organizationRepository->findAll() as $organization) {
            $organization->setAlternateName($organization->getAlternateName());
            $this->em->persist($organization);
        }
        $this->flushEm($this->em);
        return;
        */

        $organizations = $organizationRepository->findBy([ 'status' => [0, 1] ]);
        foreach ($organizations as $organization) {
            $persist = false;
            $gnd = $organization->getGnd();

            if (empty($gnd)) {
                continue;
            }

            if (array_key_exists($gnd, $gndBeacon)) {
                $additional = $organization->getAdditional();
                $additional['beacon'] = $gndBeacon[$gnd];
                $organization->setAdditional($additional);
                $persist = true;
            }

            if ($persist) {
                $this->em->persist($organization);
                $this->flushEm($this->em);
            }
        }

        // currently only homepages
        /*
        $organizationRepository = $this->em->getRepository('\TeiEditionBundle\Entity\Organization');
        $organizations = $organizationRepository->findBy([ 'url' => null ]);
        foreach ($organizations as $organization) {
            $persist = false;
            $gnd = $organization->getGnd();
            if (empty($gnd)) {
                continue;
            }

            $corporateBody = \TeiEditionBundle\Utils\CorporateBodyData::fetchByGnd($gnd);
            if (is_null($corporateBody) || !$corporateBody->isDifferentiated) {
                continue;
            }

            // the following were missing in the beginning
            foreach ([
                      'dateOfTermination',
                      'homepage',
                      ] as $src)
            {
                if (!empty($corporateBody->{$src})) {
                    switch ($src) {
                        case 'dateOfTermination':
                            $val = $organization->getDissolutionDate();
                            if (empty($val)) {
                                $organization->setDissolutionDate($corporateBody->{$src});
                                $persist = true;
                            }
                            break;

                        case 'homepage':
                            $val = $organization->getUrl();
                            if (empty($val)) {
                                $organization->setUrl($corporateBody->{$src});
                                $persist = true;
                            }
                            break;
                    }
                }
            }
            if ($persist) {
                $this->em->persist($organization);
                $this->flushEm($this->em);
            }
        }
        */

        return 0;
    }

    protected function enhanceCountry()
    {
        // currently info from http://api.geonames.org/countryInfo?username=burckhardtd';
        $url = 'http://api.geonames.org/countryInfo?username=burckhardtd';

        $xml = simplexml_load_file($url);
        $json = json_encode($xml);
        $info_array = json_decode($json, true);

        $info_by_countrycode = [];
        $info_by_geonames = [];
        foreach ($info_array['country'] as $country => $info) {
            $info_by_countrycode[$info['countryCode']] = $info;
            $info_by_geonames[$info['geonameId']] = $info;
        }

        $placeRepository = $this->em->getRepository('\TeiEditionBundle\Entity\Place');
        foreach ([ 'nation' ] as $type) {
            $places = $placeRepository->findBy([ 'type' => $type ]);
            foreach ($places as $country) {
                $persist = false;
                $info = null;
                $countryCode = $country->getCountryCode();
                if (!empty($countryCode)) {
                    if (array_key_exists($countryCode, $info_by_countrycode)) {
                        $info = $info_by_countrycode[$countryCode];
                    }
                }
                else {
                    $geonames = $country->getGeonames();
                    if (!empty($geonames) && array_key_exists($geonames, $info_by_geonames)) {
                        $info = $info_by_geonames[$geonames];
                        $country->setCountryCode($info['countryCode']);
                        $persist = true;
                    }
                }

                if (!empty($info)) {
                    $persist = true;

                    $additional = $country->getAdditional();
                    if (is_null($additional)) {
                        $additional = [];
                    }

                    $additional['bounds'] = [
                        [ $info['south'], $info['west'] ],
                        [ $info['north'], $info['east'] ],
                    ];

                    foreach ( [ 'areaInSqKm', 'population' ] as $key) {
                        if (array_key_exists($key, $info)) {
                            $additional[$key] = $info[$key];
                        }
                    }

                    $country->setAdditional($additional);
                }

                if ($persist) {
                    $this->em->persist($country);
                    $this->flushEm($this->em);
                }
            }
        }

        return 0;
    }

    protected function enhanceBibitem()
    {
        // currently only googleapis.com/books
        $googleapisKey = $this->getParameter('googleapis.key');
        if (empty($googleapisKey)) {
            return;
        }

        $bibitemRepository = $this->em->getRepository('\TeiEditionBundle\Entity\Bibitem');
        $items = $bibitemRepository->findBy([ 'status' => [0, 1] ]);
        foreach ($items as $item) {
            $persist = false;
            $isbns = $item->getIsbnListNormalized(false);
            if (empty($isbns)) {
                continue;
            }

            $additional = $item->getAdditional();
            if (is_null($additional) || !array_key_exists('googleapis-books', $additional)) {
                $url = sprintf('https://www.googleapis.com/books/v1/volumes?q=isbn:%s&key=%s',
                               $isbns[0],
                               $googleapisKey);
                // var_dump($url);
                $result = $this->executeJsonQuery($url, [
                    'Accept' => 'application/json',
                    // 'Accept-Language' => $locale, // date-format!
                ]);
                // var_dump($result);

                if (false !== $result && $result['totalItems'] > 0) {
                    $resultItem = $result['items'][0];
                    if (!empty($resultItem['selfLink'])) {
                        $result = $this->executeJsonQuery($resultItem['selfLink'], [
                            'Accept' => 'application/json',
                            // 'Accept-Language' => $locale, // date-format!
                        ]);

                        if (false !== $result) {
                            $resultItem = $result;
                        }
                    }

                    if (is_null($additional)) {
                        $additional = [];
                    }

                    $additional['googleapis-books'] = $resultItem;
                    $item->setAdditional($additional);

                    $persist = true;
                }
            }

            if ($persist) {
                $this->em->persist($item);
                $this->flushEm($this->em);
            }
        }

        return 0;
    }
}

<?php

namespace AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

class EntityEnhanceCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('entity:enhance')
            ->setDescription('Enhance Person/Place Entities')
            ->addArgument(
                'type',
                InputArgument::REQUIRED,
                'which entities do you want to enhance (person / place)'
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

            case 'country':
                return $this->enhanceCountry();
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
            $this->client = new \EasyRdf_Http_Client();
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

    protected function loadGndBeacon()
    {
        $gndBeacon = [];

        foreach ([ 'dasjuedischehamburg'  => 'BEACON-GND-dasjuedischehamburg.txt' ]
                 as $key => $fname)
        {
            $info = [];

            $fnameFull = $this->getContainer()->get('kernel')->getRootDir()
                   . '/Resources/data/' . $fname;
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
        // currently entityfacts and beacon
        $gndBeacon = $this->loadGndBeacon();

        $em = $this->getContainer()->get('doctrine')->getEntityManager();
        $personRepository = $em->getRepository('AppBundle:Person');
        $persons = $personRepository->findBy([ 'status' => [0, 1] ]);
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
            foreach ([ 'de', /* en */] as $locale) {
                // en currently not working
                $entityfacts = $person->getEntityfacts($locale, true);
                if (is_null($entityfacts)) {
                    $url = sprintf('http://hub.culturegraph.org/entityfacts/%s', $gnd);
                    $result = $this->executeJsonQuery($url,
                                                      array('Accept' => 'application/json',
                                                            'Accept-Language' => $locale, // date-format!
                                                            ));
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
                    // try to set birth/death place
                    foreach ([ 'birth', 'death' ] as $property) {
                        $method = 'get' . ucfirst($property) . 'PlaceInfo';
                        $placeInfo = $person->$method($locale);
                        if (is_null($placeInfo) || !empty($placeInfo['tgn'])) {
                            continue;
                        }
                        $place = null;
                        if ($placeInfo['name'] == 'Altona') {
                            $places = $em->getRepository('AppBundle:Place')->findByTgn('7012310');
                        }
                        else if (!empty($placeInfo['gnd'])) {
                            $places = $em->getRepository('AppBundle:Place')->findByGnd($placeInfo['gnd']);
                        }
                        else {
                            continue;
                        }

                        if (!empty($places)) {
                            $place = $places[0];
                        }
                        else {
                            $geo = \AppBundle\Utils\GeographicalData::fetchByIdentifier('gnd' . ':' . $placeInfo['gnd']);
                            if (!empty($geo) && !empty($geo->sameAs)) {
                                foreach ($geo->sameAs as $uri) {
                                    if (preg_match('/^'
                                                   . preg_quote('http://sws.geonames.org/', '/')
                                                   . '(\d+)$/', $uri, $matches))
                                    {
                                        $geonamesId = $matches[1];
                                        $places = $em->getRepository('AppBundle:Place')->findByGeonames($geonamesId);
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
                            echo sprintf('Lookup TGN for gnd:%s: %s', $placeInfo['gnd'], $placeInfo['name']) . "\n";
                        }

                    }
                }
            }
            if ($persist) {
                $em->persist($person);
                $em->flush();
            }
        }
    }


    protected function enhancePlace()
    {
        // currently only geonames
        // TODO: maybe get outlines
        // http://www.geonames.org/servlet/geonames?&srv=780&geonameId=2921044&type=json
        $em = $this->getContainer()->get('doctrine')->getEntityManager();
        $placeRepository = $em->getRepository('AppBundle:Place');
        foreach ([ 'nation', 'country',
                  'state', 'metropolitan area',
                  'inhabited place', 'neighborhood' ] as $type) {
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
                    $em->persist($place);
                    $em->flush();
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
                    $em->persist($place);
                    $em->flush();
                }
            }
        }
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

        $em = $this->getContainer()->get('doctrine')->getEntityManager();

        $placeRepository = $em->getRepository('AppBundle:Place');
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
                    $em->persist($country);
                    $em->flush();
                }
            }
        }
    }

}

<?php
namespace AppBundle\Utils;

class BiographicalData
{
    private static $RDFParser = NULL;

    private static function getRDFParser ()
    {
        if (!isset(self::$RDFParser)) {
            self::$RDFParser = \ARC2::getRDFParser();
        }
        return self::$RDFParser;
    }

    /*
     */
    static function fetchGeographicLocation ($url)
    {
        $parser = self::getRDFParser();
        $parser->parse($url . '/about/lds');
        $triples = $parser->getTriples();
        $index = \ARC2::getSimpleIndex($triples, true) ; /* true -> flat version */
        if (isset($index[$url]['http://d-nb.info/standards/elementset/gnd#preferredNameForThePlaceOrGeographicName']))
            return $index[$url]['http://d-nb.info/standards/elementset/gnd#preferredNameForThePlaceOrGeographicName'][0];
        if (isset($index[$url]['preferredNameForThePlaceOrGeographicName']))
            return $index[$url]['preferredNameForThePlaceOrGeographicName'][0];
        foreach ($triples as $triple) {
            if ('sameAs' == $triple['p']) {
                if (preg_match('/d\-nb\.info/', $triple['o']) && $triple['o'] != $url) {
                    return self::fetchGeographicLocation($triple['o']);
                }
            }
        }
    }

    static function fetchByGnd ($gnd)
    {
        $parser = self::getRDFParser();
        $url = sprintf('http://d-nb.info/gnd/%s/about/lds', $gnd);
        $parser->parse($url);
        $triples = $parser->getTriples();
        if (empty($triples)) {
            return;
        }
        $index = \ARC2::getSimpleIndex($triples, false) ; /* false -> non-flat version */

        $bio = new BiographicalData();
        $bio->gnd = $gnd;
        foreach ($triples as $triple) {
            switch ($triple['p']) {
                case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type':
                    $bio->isDifferentiated = 'http://d-nb.info/standards/elementset/gnd#DifferentiatedPerson' == $triple['o'];
                    break;
                case 'http://d-nb.info/standards/elementset/gnd#dateOfBirth':
                case 'dateOfBirth':
                    $bio->dateOfBirth = $triple['o'];
                    break;
                case 'http://d-nb.info/standards/elementset/gnd#placeOfBirth':
                case 'placeOfBirth':
                    $placeOfBirth = self::fetchGeographicLocation($triple['o']);
                    if (!empty($placeOfBirth))
                        $bio->placeOfBirth = $placeOfBirth;
                    break;
                case 'http://d-nb.info/standards/elementset/gnd#placeOfActivity':
                case 'placeOfActivity':
                    $placeOfActivity = self::fetchGeographicLocation($triple['o']);
                    if (!empty($placeOfActivity))
                        $bio->placeOfActivity = $placeOfActivity;
                    break;
                case 'http://d-nb.info/standards/elementset/gnd#dateOfDeath':
                case 'dateOfDeath':
                    $bio->dateOfDeath = $triple['o'];
                    break;
                case 'http://d-nb.info/standards/elementset/gnd#placeOfDeath':
                case 'placeOfDeath':
                    $placeOfDeath = self::fetchGeographicLocation($triple['o']);
                    if (!empty($placeOfDeath))
                        $bio->placeOfDeath = $placeOfDeath;
                    break;
                case 'http://d-nb.info/standards/elementset/gnd#forename':
                case 'forename':
                    $bio->forename = $triple['o'];
                    break;
                case 'http://d-nb.info/standards/elementset/gnd#surname':
                case 'surname':
                    $bio->surname = $triple['o'];
                    break;
                case 'http://d-nb.info/standards/elementset/gnd#preferredNameForThePerson':
                case 'preferredNameForThePerson':
                    if (!isset($bio->preferredName) && 'literal' == $triple['o_type'])
                        $bio->preferredName = $triple['o'];
                    else if ('bnode' == $triple['o_type']) {
                        $nameRecord = $index[$triple['o']];
                        $bio->preferredName = array($nameRecord['http://d-nb.info/standards/elementset/gnd#surname'][0]['value'],
                                                    $nameRecord['http://d-nb.info/standards/elementset/gnd#forename'][0]['value']);
                        // var_dump($index[$triple['o']]);
                    }
                    break;
                case 'http://d-nb.info/standards/elementset/gnd#academicDegree':
                case 'academicDegree':
                    $bio->academicDegree = $triple['o'];
                    break;
                    break;
                case 'http://d-nb.info/standards/elementset/gnd#biographicalOrHistoricalInformation':
                case 'biographicalOrHistoricalInformation':
                    $bio->biographicalInformation = $triple['o'];
                    break;
                case 'http://d-nb.info/standards/elementset/gnd#professionOrOccupation':
                case 'professionOrOccupation':
                    // TODO: links to external resource
                    break;
                case 'http://d-nb.info/standards/elementset/gnd#variantNameForThePerson':
                case 'variantNameForThePerson':
                    // var_dump($triple);
                    break;
                default:
                    if (!empty($triple['o'])) {
                        // var_dump($triple);
                    }
                    // var_dump($triple['p']);
            }
        }
        return $bio;
    }

    var $gnd;
    var $isDifferentiated = false;
    var $preferredName;
    var $academicDegree;
    var $biographicalInformation;
    var $dateOfBirth;
    var $placeOfBirth;
    var $placeOfActivity;
    var $dateOfDeath;
    var $placeOfDeath;
}

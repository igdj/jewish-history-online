<?php
namespace AppBundle\Utils;

abstract class DnbData
{
    private static $RDFParser = NULL;

    protected static function getRDFParser()
    {
        if (!isset(self::$RDFParser)) {
            self::$RDFParser = \ARC2::getRDFParser();
        }

        return self::$RDFParser;
    }

    protected static function normalizeString($str)
    {
        if (!class_exists("\Normalizer", false)) {
            die('DOES NOT EXIST');

            return $str;
        }

        return normalizer_normalize($str);
    }

    /*
     */
    static function fetchGeographicLocation($uri)
    {
        $parser = self::getRDFParser();
        if (preg_match('/d\-nb\.info\/gnd\/([^\/]*)$/', $uri, $matches)) {
            $url = sprintf('https://d-nb.info/gnd/%s/about/lds', $matches[1]);
        }
        @$parser->parse($url);
        $triples = $parser->getTriples();
        $index = \ARC2::getSimpleIndex($triples, true) ; /* true -> flat version */

        if (isset($index[$uri]['http://d-nb.info/standards/elementset/gnd#preferredNameForThePlaceOrGeographicName'])) {
            return self::normalizeString($index[$uri]['http://d-nb.info/standards/elementset/gnd#preferredNameForThePlaceOrGeographicName'][0]);
        }

        if (isset($index[$uri]['preferredNameForThePlaceOrGeographicName'])) {
            return self::normalizeString($index[$uri]['preferredNameForThePlaceOrGeographicName'][0]);
        }

        foreach ($triples as $triple) {
            if ('sameAs' == $triple['p']) {
                if (preg_match('/d\-nb\.info/', $triple['o']) && $triple['o'] != $uri) {
                    return self::fetchGeographicLocation($triple['o']);
                }
            }
        }
    }

    static function instantiateResult($index, $gnd = null)
    {
        $type = $index['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0]['value'];

        switch ($type) {
            case 'http://d-nb.info/standards/elementset/gnd#DifferentiatedPerson':
            case 'http://d-nb.info/standards/elementset/gnd#Pseudonym':
            case 'http://d-nb.info/standards/elementset/gnd#RoyalOrMemberOfARoyalHouse':
            case 'http://d-nb.info/standards/elementset/gnd#UndifferentiatedPerson':
                return new BiographicalData();
                break;

            case 'http://d-nb.info/standards/elementset/gnd#CorporateBody':
            case 'http://d-nb.info/standards/elementset/gnd#OrganOfCorporateBody':
            case 'http://d-nb.info/standards/elementset/gnd#TerritorialCorporateBodyOrAdministrativeUnit':
                return new CorporateBodyData();
                break;

            case 'http://d-nb.info/standards/elementset/gnd#HistoricSingleEventOrEra':
            case 'http://d-nb.info/standards/elementset/gnd#SubjectHeadingSensoStricto';
                return new HistoricEventData();
                break;

            case 'http://d-nb.info/standards/elementset/gnd#ConferenceOrEvent':
                # TODO: e.g. Wiener Kongress, http://d-nb.info/gnd/2026986-9
            case 'http://d-nb.info/standards/elementset/gnd#SeriesOfConferenceOrEvent': # e.g. Berlinale
            case 'http://d-nb.info/standards/elementset/gnd#HistoricSingleEventOrEra':
            case 'http://d-nb.info/standards/elementset/gnd#SubjectHeadingSensoStricto';
                break; // currently ignore

            default:
                var_dump($type);
                var_dump($gnd);
                exit;
        }
    }

    abstract function processTriple($triple);

    static function fetchByGnd($gnd)
    {
        $url = sprintf('https://d-nb.info/gnd/%s/about/lds', $gnd);

        $parser = self::getRDFParser();
        $parser->parse($url);
        $triples = $parser->getTriples();

        if (empty($triples)) {
            return;
        }

        $index = \ARC2::getSimpleIndex($triples, false) ; /* false -> non-flat version */

        $res = self::instantiateResult($index['http://d-nb.info/gnd/' . $gnd], $gnd);
        if (is_null($res)) {
            // type not handled
            return null;
        }

        $res->gnd = $gnd;
        foreach ($triples as $triple) {
            $res->processTriple($triple);
        }

        return $res;
    }

    var $gnd;
}

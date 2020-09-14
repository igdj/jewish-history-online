<?php
namespace TeiEditionBundle\Utils;

abstract class DnbData
{
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
        if (!preg_match('/d\-nb\.info\/gnd\/([^\/]*)$/', $uri, $matches)) {
            throw new \InvalidArgumentException($uri);
        }

        $rdfUrl = sprintf('https://d-nb.info/gnd/%s/about/lds', $matches[1]);

        try {
            $graph = \EasyRdf\Graph::newAndLoad($rdfUrl);
        }
        catch (\EasyRdf\Http\Exception $e) {
            throw new \InvalidArgumentException($e->getMessage());
        }

        $resource = $graph->resource($uri);

        $preferredNameForThePlaceOrGeographicName = $resource->getLiteral('https://d-nb.info/standards/elementset/gnd#preferredNameForThePlaceOrGeographicName');

        if (!is_null($preferredNameForThePlaceOrGeographicName)) {
            return self::normalizeString((string)$preferredNameForThePlaceOrGeographicName);
        }

        // try sameAs
        $resources = $resource->all('owl:sameAs');
        if (!is_null($resources)) {
            foreach ($resources as $sameAs) {
                $sameAsUri = $sameAs->getUri();
                if (preg_match('/d\-nb\.info/', $sameAsUri) && $sameAsUri != $uri) {
                    return self::fetchGeographicLocation($sameAsUri);
                }
            }
        }
    }

    static function instantiateResult($resource)
    {
        $type = $resource->get('rdf:type');

        switch ($type) {
            case 'https://d-nb.info/standards/elementset/gnd#DifferentiatedPerson':
            case 'https://d-nb.info/standards/elementset/gnd#Pseudonym':
            case 'https://d-nb.info/standards/elementset/gnd#RoyalOrMemberOfARoyalHouse':
            case 'https://d-nb.info/standards/elementset/gnd#LiteraryOrLegendaryCharacter':
            case 'https://d-nb.info/standards/elementset/gnd#UndifferentiatedPerson':
                return new BiographicalData();
                break;

            case 'https://d-nb.info/standards/elementset/gnd#CorporateBody':
            case 'https://d-nb.info/standards/elementset/gnd#OrganOfCorporateBody':
            case 'https://d-nb.info/standards/elementset/gnd#TerritorialCorporateBodyOrAdministrativeUnit':
            case 'https://d-nb.info/standards/elementset/gnd#MusicalCorporateBody':
            case 'https://d-nb.info/standards/elementset/gnd#Company':
                return new CorporateBodyData();
                break;

            case 'https://d-nb.info/standards/elementset/gnd#HistoricSingleEventOrEra':
            case 'https://d-nb.info/standards/elementset/gnd#SubjectHeadingSensoStricto';
                return new HistoricEventData();
                break;

            case 'https://d-nb.info/standards/elementset/gnd#ConferenceOrEvent':
                # TODO: e.g. Wiener Kongress, https://d-nb.info/gnd/2026986-9
            case 'https://d-nb.info/standards/elementset/gnd#SeriesOfConferenceOrEvent': # e.g. Berlinale
            case 'https://d-nb.info/standards/elementset/gnd#HistoricSingleEventOrEra':
            case 'https://d-nb.info/standards/elementset/gnd#SubjectHeadingSensoStricto';
                break; // currently ignore

            default:
                var_dump((string)$type);
                var_dump($resource->getUri());
                exit;
        }
    }

    abstract function processProperty($resource, $uri);

    static function fetchByGnd($gnd)
    {
        $uri = sprintf('https://d-nb.info/gnd/%s', $gnd);
        $rdfUrl = $uri . '/about/lds';

        try {
            $graph = \EasyRdf\Graph::newAndLoad($rdfUrl);
        }
        catch (\EasyRdf\Http\Exception $e) {
            throw new \InvalidArgumentException($e->getMessage());
        }

        $resource = $graph->resource($uri);

        // dd($resource->dump('text'));

        $res = self::instantiateResult($resource);
        if (is_null($res)) {
            // type not handled
            return null;
        }

        $res->gnd = $gnd;

        foreach ($resource->propertyUris() as $uri) {
            $res->processProperty($resource, $uri);
        }

        return $res;
    }

    var $gnd;
}

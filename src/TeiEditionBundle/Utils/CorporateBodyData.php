<?php
namespace TeiEditionBundle\Utils;

class CorporateBodyData
extends DnbData
{
    function processProperty($resource, $uri)
    {
        switch ($uri) {
            case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type':
                break;

            case 'https://d-nb.info/standards/elementset/gnd#dateOfEstablishment':
                $this->dateOfEstablishment = (string)$resource->getLiteral($uri);
                break;

            /*
            case 'https://d-nb.info/standards/elementset/gnd#placeOfBirth':
                $placeOfBirth = self::fetchGeographicLocation($resource->get($uri)->getUri());
                if (!empty($placeOfBirth)) {
                    $this->placeOfBirth = $placeOfBirth;
                }
                break;
            */

            case 'https://d-nb.info/standards/elementset/gnd#placeOfBusiness':
                $placeOfBusiness = self::fetchGeographicLocation($resource->get($uri)->getUri());
                if (!empty($placeOfBusiness)) {
                    $this->placeOfBusiness = $placeOfBusiness;
                }
                break;

            case 'https://d-nb.info/standards/elementset/gnd#dateOfTermination':
                $this->dateOfTermination = (string)$resource->getLiteral($uri);
                break;

            /*
            case 'https://d-nb.info/standards/elementset/gnd#placeOfDeath':
                $placeOfDeath = self::fetchGeographicLocation($resource->get($uri)->getUri());
                if (!empty($placeOfDeath))
                    $this->placeOfDeath = $placeOfDeath;
                break;
            */

            case 'https://d-nb.info/standards/elementset/gnd#preferredNameForTheCorporateBody':
                $property = $resource->get($uri);

                if (!isset($this->preferredName) && $property instanceof \EasyRdf\Literal) {
                    $this->preferredName = self::normalizeString((string)$property);
                }
                break;

            case 'https://d-nb.info/standards/elementset/gnd#homepage':
                $property = $resource->get($uri);
                if (!is_null($property)) {
                    $this->homepage = (string)$property;
                }
                break;

            case 'https://d-nb.info/standards/elementset/gnd#biographicalOrHistoricalInformation':
                $this->biographicalInformation = self::normalizeString($resource->getLiteral($uri));
                break;

            case 'https://d-nb.info/standards/elementset/gnd#variantNameForTheCorporateBody':
                // var_dump($triple);
                break;

            case 'https://d-nb.info/standards/elementset/gnd#hierarchicalSuperiorOfTheCorporateBody':
            case 'https://d-nb.info/standards/elementset/gnd#precedingCorporateBody':
                break;
        }
    }

    var $gnd;
    var $preferredName;
    var $biographicalInformation;
    var $dateOfEstablishment;
    // var $placeOfBirth;
    var $placeOfBusiness;
    var $dateOfTermination;
    // var $placeOfDeath;
    var $homepage;
}

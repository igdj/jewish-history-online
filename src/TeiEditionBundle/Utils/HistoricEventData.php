<?php
namespace TeiEditionBundle\Utils;

class HistoricEventData
extends DnbData
{
    function processProperty($resource, $uri)
    {
        switch ($uri) {
            case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type':
                break;

            case 'https://d-nb.info/standards/elementset/gnd#associatedDate':
                $this->associatedDate = (string)$resource->getLiteral($uri);
                break;

            case 'https://d-nb.info/standards/elementset/gnd#relatedPlaceOrGeographicName':
                $relatedPlaceOrGeographicName = self::fetchGeographicLocation($resource->get($uri)->getUri());
                if (!empty($relatedPlaceOrGeographicName)) {
                    $this->relatedPlaceOrGeographicName = $relatedPlaceOrGeographicName;
                }
                break;

            case 'https://d-nb.info/standards/elementset/gnd#preferredNameForTheSubjectHeading':
                $property = $resource->get($uri);

                if (!isset($this->preferredName) && $property instanceof \EasyRdf\Literal) {
                    $this->preferredName = self::normalizeString((string)$property);
                }
                break;

            case 'https://d-nb.info/standards/elementset/gnd#definition':
                $this->definition = self::normalizeString($resource->getLiteral($uri));
                break;

            case 'https://d-nb.info/standards/elementset/gnd#variantNameForTheSubjectHeading':
                // var_dump($resource->getLiteral($uri));
                break;

            case 'https://d-nb.info/standards/elementset/gnd#broaderTermInstantial':
                break;
        }
    }

    var $gnd;
    var $preferredName;
    var $definition;
    var $relatedPlaceOrGeographicName;
    var $associatedDate;
}

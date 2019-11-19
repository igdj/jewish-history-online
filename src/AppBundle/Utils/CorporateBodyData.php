<?php
namespace AppBundle\Utils;

class CorporateBodyData
extends DnbData
{
    function processTriple($triple)
    {
        switch ($triple['p']) {
            case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type':
                $this->isDifferentiated = true; // 'https://d-nb.info/standards/elementset/gnd#DifferentiatedPerson' == $triple['o'];
                break;

            case 'https://d-nb.info/standards/elementset/gnd#dateOfEstablishment':
                $this->dateOfEstablishment = $triple['o'];
                break;

            /*
            case 'https://d-nb.info/standards/elementset/gnd#placeOfBirth':
                $placeOfBirth = self::fetchGeographicLocation($triple['o']);
                if (!empty($placeOfBirth))
                    $this->placeOfBirth = $placeOfBirth;
                break;
            */

            case 'https://d-nb.info/standards/elementset/gnd#placeOfBusiness':
                $placeOfBusiness = self::fetchGeographicLocation($triple['o']);
                if (!empty($placeOfBusiness)) {
                    $this->placeOfBusiness = $placeOfBusiness;
                }
                break;

            case 'https://d-nb.info/standards/elementset/gnd#dateOfTermination':
                $this->dateOfTermination = $triple['o'];
                break;

            /*
            case 'https://d-nb.info/standards/elementset/gnd#placeOfDeath':
                $placeOfDeath = self::fetchGeographicLocation($triple['o']);
                if (!empty($placeOfDeath))
                    $this->placeOfDeath = $placeOfDeath;
                break;
            */

            case 'https://d-nb.info/standards/elementset/gnd#preferredNameForTheCorporateBody':
                if (!isset($this->preferredName) && 'literal' == $triple['o_type'])
                    $this->preferredName = self::normalizeString($triple['o']);
                /*
                else if ('bnode' == $triple['o_type']) {
                    $nameRecord = $index[$triple['o']];
                    $this->preferredName = array($nameRecord['https://d-nb.info/standards/elementset/gnd#surname'][0]['value'],
                                                $nameRecord['https://d-nb.info/standards/elementset/gnd#forename'][0]['value']);
                    // var_dump($index[$triple['o']]);
                }
                */
                break;

            case 'https://d-nb.info/standards/elementset/gnd#homepage':
                $this->homepage = $triple['o'];
                break;

            case 'https://d-nb.info/standards/elementset/gnd#biographicalOrHistoricalInformation':
                $this->biographicalInformation = self::normalizeString($triple['o']);
                break;

            case 'https://d-nb.info/standards/elementset/gnd#variantNameForTheCorporateBody':
                // var_dump($triple);
                break;

            case 'https://d-nb.info/standards/elementset/gnd#hierarchicalSuperiorOfTheCorporateBody':
            case 'https://d-nb.info/standards/elementset/gnd#precedingCorporateBody':
                break;

            default:
                if (!empty($triple['o'])) {
                    // var_dump($triple);
                }
                // var_dump($triple['p']);
        }
    }

    var $gnd;
    var $isDifferentiated = true;
    var $preferredName;
    var $dateOfEstablishment;
    // var $placeOfBirth;
    var $placeOfBusiness;
    var $dateOfTermination;
    // var $placeOfDeath;
    var $homepage;
}

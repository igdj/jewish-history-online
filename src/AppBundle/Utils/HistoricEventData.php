<?php
namespace AppBundle\Utils;

class HistoricEventData
extends DnbData
{
    function processTriple($triple)
    {
        switch ($triple['p']) {
            case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type':
                $this->isDifferentiated = true; // 'http://d-nb.info/standards/elementset/gnd#DifferentiatedPerson' == $triple['o'];
                break;

            case 'http://d-nb.info/standards/elementset/gnd#dateOfEstablishment':
                $this->dateOfEstablishment = $triple['o'];
                break;

            case 'http://d-nb.info/standards/elementset/gnd#dateOfTermination':
                $this->dateOfTermination = $triple['o'];
                break;

            case 'http://d-nb.info/standards/elementset/gnd#relatedPlaceOrGeographicName':
                $relatedPlaceOrGeographicName = self::fetchGeographicLocation($triple['o']);
                if (!empty($relatedPlaceOrGeographicName)) {
                    $this->relatedPlaceOrGeographicName = $relatedPlaceOrGeographicName;
                }
                break;


            case 'http://d-nb.info/standards/elementset/gnd#preferredNameForTheSubjectHeading':
                if (!isset($this->preferredName) && 'literal' == $triple['o_type'])
                    $this->preferredName = self::normalizeString($triple['o']);
                /*
                else if ('bnode' == $triple['o_type']) {
                    $nameRecord = $index[$triple['o']];
                    $this->preferredName = array($nameRecord['http://d-nb.info/standards/elementset/gnd#surname'][0]['value'],
                                                $nameRecord['http://d-nb.info/standards/elementset/gnd#forename'][0]['value']);
                    // var_dump($index[$triple['o']]);
                }
                */
                break;

            case 'http://d-nb.info/standards/elementset/gnd#definition':
                $this->definition = self::normalizeString($triple['o']);
                break;

            case 'http://d-nb.info/standards/elementset/gnd#variantNameForTheSubjectHeading':
                // var_dump($triple);
                break;

            case 'http://d-nb.info/standards/elementset/gnd#broaderTermInstantial':
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
    var $definition;
    var $relatedPlaceOrGeographicName;
    var $dateOfEstablishment;
    var $dateOfTermination;
}

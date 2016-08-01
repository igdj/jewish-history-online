<?php
namespace AppBundle\Utils;

class BiographicalData extends DnbData
{
    function processTriple($triple)
    {
        switch ($triple['p']) {
            case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type':
                $this->isDifferentiated =
                    in_array($triple['o'],
                             [ 'http://d-nb.info/standards/elementset/gnd#DifferentiatedPerson',
                               'http://d-nb.info/standards/elementset/gnd#Pseudonym' ]);
                break;
            case 'http://d-nb.info/standards/elementset/gnd#dateOfBirth':
            case 'dateOfBirth':
                $this->dateOfBirth = $triple['o'];
                break;
            case 'http://d-nb.info/standards/elementset/gnd#placeOfBirth':
            case 'placeOfBirth':
                $placeOfBirth = self::fetchGeographicLocation($triple['o']);
                if (!empty($placeOfBirth)) {
                    $this->placeOfBirth = $placeOfBirth;
                }
                break;
            case 'http://d-nb.info/standards/elementset/gnd#placeOfActivity':
            case 'placeOfActivity':
                $placeOfActivity = self::fetchGeographicLocation($triple['o']);
                if (!empty($placeOfActivity)) {
                    $this->placeOfActivity = $placeOfActivity;
                }
                break;
            case 'http://d-nb.info/standards/elementset/gnd#dateOfDeath':
            case 'dateOfDeath':
                $this->dateOfDeath = $triple['o'];
                break;
            case 'http://d-nb.info/standards/elementset/gnd#placeOfDeath':
            case 'placeOfDeath':
                $placeOfDeath = self::fetchGeographicLocation($triple['o']);
                if (!empty($placeOfDeath))
                    $this->placeOfDeath = $placeOfDeath;
                break;
            case 'http://d-nb.info/standards/elementset/gnd#forename':
            case 'forename':
                $this->forename = self::normalizeString($triple['o']);
                break;
            case 'http://d-nb.info/standards/elementset/gnd#surname':
            case 'surname':
                $this->surname = self::normalizeString($triple['o']);
                break;
            case 'http://d-nb.info/standards/elementset/gnd#preferredNameForThePerson':
            case 'preferredNameForThePerson':
                if (!isset($this->preferredName) && 'literal' == $triple['o_type']) {
                    $this->preferredName = self::normalizeString($triple['o']);
                }
                else if ('bnode' == $triple['o_type']) {
                    $nameRecord = $index[$triple['o']];
                    $this->preferredName = array(self::normalizeString($nameRecord['http://d-nb.info/standards/elementset/gnd#surname'][0]['value']),
                                                self::normalizeString($nameRecord['http://d-nb.info/standards/elementset/gnd#forename'][0]['value']));
                    // var_dump($index[$triple['o']]);
                }
                break;
            case 'http://d-nb.info/standards/elementset/gnd#academicDegree':
            case 'academicDegree':
                $this->academicDegree = self::normalizeString($triple['o']);
                break;
                break;
            case 'http://d-nb.info/standards/elementset/gnd#biographicalOrHistoricalInformation':
            case 'biographicalOrHistoricalInformation':
                $this->biographicalInformation = self::normalizeString($triple['o']);
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

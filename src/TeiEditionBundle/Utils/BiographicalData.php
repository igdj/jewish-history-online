<?php
namespace TeiEditionBundle\Utils;

class BiographicalData
extends DnbData
{
    function processProperty($resource, $uri)
    {
        switch ($uri) {
            case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type':
                $this->isDifferentiated = !in_array('https://d-nb.info/standards/elementset/gnd#UndifferentiatedPerson', $resource->typesAsResources());
                break;

            case 'https://d-nb.info/standards/elementset/gnd#gender':
                $property = $resource->get($uri);

                if (!is_null($property)) {
                    switch ($property->getUri()) {
                        case 'https://d-nb.info/standards/vocab/gnd/gender#female':
                            $this->gender = 'Female';
                            break;

                        case 'https://d-nb.info/standards/vocab/gnd/gender#male':
                            $this->gender = 'Male';
                            break;
                    }
                }
                break;

            case 'https://d-nb.info/standards/elementset/gnd#dateOfBirth':
                $this->dateOfBirth = (string)$resource->getLiteral($uri);
                break;

            case 'https://d-nb.info/standards/elementset/gnd#placeOfBirth':
                $placeOfBirth = self::fetchGeographicLocation($resource->get($uri)->getUri());
                if (!empty($placeOfBirth)) {
                    $this->placeOfBirth = $placeOfBirth;
                }
                break;

            case 'https://d-nb.info/standards/elementset/gnd#placeOfActivity':
                $placeOfActivity = self::fetchGeographicLocation($resource->get($uri)->getUri());
                if (!empty($placeOfActivity)) {
                    $this->placeOfActivity = $placeOfActivity;
                }
                break;

            case 'https://d-nb.info/standards/elementset/gnd#dateOfDeath':
                $this->dateOfDeath = (string)$resource->getLiteral($uri);
                break;

            case 'https://d-nb.info/standards/elementset/gnd#placeOfDeath':
                $placeOfDeath = self::fetchGeographicLocation($resource->get($uri)->getUri());
                if (!empty($placeOfDeath)) {
                    $this->placeOfDeath = $placeOfDeath;
                }
                break;

            case 'https://d-nb.info/standards/elementset/gnd#forename':
                $this->forename = self::normalizeString((string)$resource->getLiteral($uri));
                break;

            case 'https://d-nb.info/standards/elementset/gnd#surname':
                $this->surname = self::normalizeString((string)$resource->getLiteral($uri));
                break;


            case 'https://d-nb.info/standards/elementset/gnd#preferredNameEntityForThePerson':
                $property = $resource->get($uri);
                if (!is_null($property)) {
                    foreach ($property->propertyUris() as $propertyUri) {
                        $this->processProperty($property, $propertyUri);
                    }
                }
                break;

            case 'https://d-nb.info/standards/elementset/gnd#preferredNameForThePerson':
                $property = $resource->get($uri);

                if (!isset($this->preferredName) && $property instanceof \EasyRdf\Literal) {
                    $this->preferredName = self::normalizeString((string)$property);
                }
                break;

            case 'https://d-nb.info/standards/elementset/gnd#academicDegree':
                $this->academicDegree = self::normalizeString($resource->getLiteral($uri));
                break;

            case 'https://d-nb.info/standards/elementset/gnd#biographicalOrHistoricalInformation':
                $this->biographicalInformation = self::normalizeString($resource->getLiteral($uri));
                break;

            case 'https://d-nb.info/standards/elementset/gnd#professionOrOccupation':
                // TODO: links to external resource
                break;

            case 'https://d-nb.info/standards/elementset/gnd#variantNameForThePerson':
                // var_dump($resource->getLiteral($uri));
                break;
        }
    }

    var $gnd;
    var $isDifferentiated = false;
    var $preferredName;
    var $forename;
    var $surname;
    var $gender;
    var $academicDegree;
    var $biographicalInformation;
    var $dateOfBirth;
    var $placeOfBirth;
    var $placeOfActivity;
    var $dateOfDeath;
    var $placeOfDeath;
}

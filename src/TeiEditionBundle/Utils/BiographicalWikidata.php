<?php

namespace TeiEditionBundle\Utils;

/**
 * Get biographical information from Wikidata query service
 * Important: This service will be phased out, so this needs to be changed
 * to the SPARQL-Service:
 *  https://opendata.stackexchange.com/a/7059
 */

class BiographicalWikidata
{
    const BASE_URL = 'http://wdq.wmflabs.org/api';

    static $KEY_MAP = [
        19 => 'placeOfBirth',
        20 => 'placeOfDeath',
        21 => 'sex',
        214 => 'viaf',
        244 => 'lc_naf',
        569 => 'dateOfBirth',
        570 => 'dateOfDeath',
    ];

    static $LABELS = [];

    /**
     * Executes a query
     *
     * @param string $query
     *
     * @throws NoResultException
     *
     * @return string $response
     */
    protected static function executeHttpQuery($url, $headers = [])
    {
        $client = new \EasyRdf\Http\Client($url);
        /* if (empty($headers)) {
            $headers['Accept'] = 'application/rdf+xml';
        }
        */
        foreach ($headers as $name => $value) {
            $client->setHeaders($name, $value);
        }

        try {
            $response = $client->request();
        }
        catch (\EasyRdf\Exception $e) {
            // currently frequent timeouts
            return null;
        }

        if (!$response->isSuccessful()) {
            return null;
        }

        return $response->getBody();
    }

    private static function getItemLabel($id, $lang_preferred)
    {
        // only query once
        if (array_key_exists($lang_preferred, self::$LABELS)
            && array_key_exists($id, self::$LABELS[$lang_preferred]))
        {
            return self::$LABELS[$lang_preferred][$id];
        }

        // labels not working, so go through mediawiki-api
        $id_full = 'Q' . $id;
        $url = sprintf('https://www.wikidata.org/w/api.php?action=wbgetentities&ids=%s&props=labels&format=json&languages=%s&languagefallback=' ,
                       $id_full, $lang_preferred);

        $data = json_decode(self::executeHttpQuery($url), TRUE);
        if (isset($data['entities']) && isset($data['entities'][$id_full])) {
            foreach ($data['entities'][$id_full]['labels'] as $lang => $label) {
                if ($lang_preferred == $lang) {
                    if (!array_key_exists($lang_preferred, self::$LABELS)) {
                        self::$LABELS[$lang_preferred] = [];
                    }
                    return self::$LABELS[$lang_preferred][$id] = $label['value'];
                }
            }
            die('TODO: handle fallback language');
            exit;
        }
    }

    private static function normalizePropertyValue($value, $type, $lang)
    {
        switch ($type) {
            case 'item':
                return self::getItemLabel($value, $lang);
                break;

            case 'time':
                // we currently handle only dates greater than 0
                if (preg_match('/([0-9]+\-[0-9]+\-[0-9]+)T/', $value, $matches)) {
                    return preg_replace('/^0+/', '', $matches[1]); // trim leading 0es
                }
                else if ((string)$value != '+00000000000--55-00T00:00:00Z') {
                    die('TODO: handle time ' . $value);
                }
                break;

            default:
                return $value;
        }
    }

    private static function getPropertyByIdentifier ($data, $identifier, $property, $lang)
    {
        if (!array_key_exists($property, $data['props'])) {
            return;
        }
        $properties = $data['props'][$property];
        if (empty($properties)) {
            return;
        }
        foreach ($properties as $property_entry) {
            if ($property_entry[0] == $identifier) {
                return in_array($property, [ 21 ]) // leave certain labels unresolved
                    ? $property_entry[2]
                    : self::normalizePropertyValue($property_entry[2], $property_entry[1], $lang);
            }
        }
    }

    static function fetchByGnd($gnd, $lang = 'de',
                               $properties = [
                                    569, // date of birth
                                    19, // place of birth
                                    570, // date of death
                                    20, // place of death
                                    21, // sex or gender
                                    214, // Viaf-identifier
                                    244, // LCCN identifier
                                    646, // Freebase identifier
                               ])
    {

        // labels are currently not active
        // https://bitbucket.org/magnusmanske/wikidataquery/issue/1/labels-not-working-question
        $url = self::BASE_URL
             . sprintf('?q=string[227:%%22%s%%22]&props=%s&labels=%s',
                       $gnd, implode(',', $properties), $lang);
// var_dump($url);
        $response = self::executeHttpQuery($url);
        if (!empty($response)) {
            // happens if properties are empty
            $count = 0;
            while (preg_match('/,,/', $response)) {
                $response = preg_replace('/,,/', ',"u_' . $count . '": null,', $response, 1);
                ++$count;
            }
            $response = preg_replace('/\,\s*\}\}$/', '}}', $response);
        }
//      var_dump($response);
        $data = json_decode($response, TRUE);
//var_dump($data);
        if (FALSE === $data || empty($data['items'])) {
            return;
        }

        foreach ($data['items'] as $identifier) {
            $entity = new BiographicalWikidata();
            $entity->identifier = $identifier;
            $entity->gnd = $gnd;

            foreach ($properties as $property_key) {
                $property = self::getPropertyByIdentifier($data, $identifier, $property_key, $lang);
                if (!empty($property) && array_key_exists($property_key, self::$KEY_MAP)) {
                    switch ($property_key) {
                        case 21: // sex or gender
                            switch ($property) {
                                case 6581072:
                                    $entity->{self::$KEY_MAP[$property_key]} = 'F';
                                    break;

                                case 6581097:
                                    $entity->{self::$KEY_MAP[$property_key]} = 'M';
                                    break;

                                default:
                                    die('TODO: handle P21: ' . $property);
                            }
                            break;

                        default:
                            $entity->{self::$KEY_MAP[$property_key]} = $property;
                            break;
                    }
                }
            }
            break; // we currently take only first match
        }
        return $entity;
    }

    var $identifier = NULL;
    var $gnd;
    var $viaf = NULL;
    var $lc_naf = NULL;
    var $preferredName;
    var $sex;
    var $academicTitle;
    var $dateOfBirth;
    var $placeOfBirth;
    var $placeOfResidence;
    var $dateOfDeath;
    var $placeOfDeath;
}

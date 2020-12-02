<?php

namespace TeiEditionBundle\Utils;

class GeographicalData
{
    /**
     * Executes a query
     *
     * @param string $query
     *
     * @return \EasyRdf\Graph|null graph object representing the query result
     */
    protected function executeRdfQuery($query, $headers = [])
    {
        $client = new \EasyRdf\Http\Client($query);
        if (empty($headers)) {
            $headers['Accept'] = 'application/rdf+xml';
        }

        foreach ($headers as $name => $value) {
            $client->setHeaders($name, $value);
        }

        $response = $client->request();
        if (!$response->isSuccessful()) {
            return null;
        }

        $content = $response->getBody();
        // the graph is too big for stuff like http://vocab.getty.edu/tgn/7003669
        $content = preg_replace('/\s*<skos\:narrower rdf\:resource\=\"[^"]*\"\s*\/>\s*/', '', $content);
        $graph = new \EasyRdf\Graph($query);
        try {
            $num_triples = $graph->parse($content);
        }
        catch (\EasyRdf\Exception $e) {
            throw new \Exception(sprintf('Problem executing query %s: %s',
                                         $query, $e->getMessage()));
        }

        return $graph;
    }

    /**
     * easyrdf-Helper Stuff
     */
    protected function setValuesFromResource(&$values, $resource, $propertyMap, $prefix = '')
    {
        foreach ($propertyMap as $src => $target) {
            if (is_int($src)) {
                // numerical indexed
                $key = $target;
            }
            else {
                $key = $src;
            }

            if (!empty($prefix) && !preg_match('/\:/', $key)) {
                $key = $prefix . ':' . $key;
            }

            $count = $resource->countValues($key);
            if ($count > 1) {
                $collect = [];
                $properties = $resource->all($key);
                foreach ($properties as $property) {
                    $value = $property->getValue();
                    if (!empty($value)) {
                        $collect[] = $value;
                    }
                }

                $values[$target] = $collect;
            }
            else if ($count == 1) {
                $property = $resource->get($key);

                if (isset($property) && !($property instanceof \EasyRdf\Resource)) {
                    $value = $property->getValue();
                    if (!empty($value)) {
                        $values[$target] = $value;
                    }
                }
            }
        }
    }

    //
    static function fetchByIdentifier($identifier, $preferredLocale = 'de')
    {
        $parts = preg_split('/\:/', $identifier, 2);

        if ('tgn' == $parts[0]) {
            \EasyRdf\RdfNamespace::set('gvp', 'http://vocab.getty.edu/ontology#');
            $url = sprintf('http://vocab.getty.edu/%s/%s', $parts[0], $parts[1]);
        }
        else if ('gnd' == $parts[0]) {
            \EasyRdf\RdfNamespace::set('gnd', 'https://d-nb.info/standards/elementset/gnd#');
            $url = sprintf('https://d-nb.info/%s/%s/about/lds', $parts[0], $parts[1]);
            $uri = sprintf('https://d-nb.info/%s/%s', $parts[0], $parts[1]);
        }

        $place = new GeographicalData();

        $graph = $place->executeRdfQuery($url, [ 'Accept' => 'application/rdf+xml' ]);
        if (!isset($graph)) {
            return;
        }

        if (empty($uri)) {
            $uri = $graph->getUri();
        }

        if (!empty($uri)) {
            $resource = $graph->resource($uri);
        }

        if ('tgn' == $parts[0]) {
            $place->tgn = $resource->get('dc11:identifier')->getValue();
            $prefLabels = $resource->all('skos:prefLabel');
            $preferredName = '';

            if (empty($prefLabels)) {
                $prefLabels = $resource->all('skosxl:prefLabel');
                if (empty($prefLabels)) {
                    echo $resource->dump();
                    exit;
                }

                foreach ($prefLabels as $prefLabel) {
                    if ($prefLabel instanceof \EasyRdf\Resource) {
                        $subgraph = $place->executeRdfQuery($prefLabel->getUri());
                        $subresource = $subgraph->resource($prefLabel->getUri());
                        $preferredName = $subresource->get('gvp:term')->getValue();
                        $values['preferredName'] = $preferredName;
                    }
                }
            }
            else {
                foreach ($prefLabels as $prefLabel) {
                    $lang = $prefLabel->getLang();
                    if (empty($preferredName) || $preferredLocale == $lang) {
                        $preferredName = $prefLabel->getValue();
                        $values['preferredName'] = $preferredName;
                    }

                    if (!empty($lang)) {
                        if (!array_key_exists('alternateName', $values)) {
                            $values['alternateName'] = [];
                        }

                        $values['alternateName'][$lang] = $prefLabel->getValue();
                    }
                }
            }

            $place->setValuesFromResource($values, $resource, [
                    'parentString' => 'parentPath',
                ], 'gvp');

            $broader = $resource->get('gvp:broaderPreferred');
            if (isset($broader)) {
                $uri = $broader->getUri();
                if (preg_match('/'
                               . preg_quote('http://vocab.getty.edu/tgn/', '/')
                               . '(\d+)/',
                               $uri, $matches))
                {
                    $values['tgnParent'] = $matches[1];
                }
            }

            $placeTypePreferred = $resource->get('gvp:placeTypePreferred')->getUri();
            switch ($placeTypePreferred) {
                case 'http://vocab.getty.edu/aat/300386699':
                    $values['type'] = 'root';
                    break;

                case 'http://vocab.getty.edu/aat/300128176':
                    $values['type'] = 'continent';
                    break;

                case 'http://vocab.getty.edu/aat/300008687':
                    $values['type'] = 'ocean';
                    break;

                case 'http://vocab.getty.edu/aat/300008694':
                    $values['type'] = 'sea';
                    break;

                case 'http://vocab.getty.edu/aat/300386854':
                    $values['type'] = 'archipelago';
                    break;

                case 'http://vocab.getty.edu/aat/300008804':
                    $values['type'] = 'island';
                    break;

                case 'http://vocab.getty.edu/aat/300386853':
                    $values['type'] = 'island group';
                    break;

                case 'http://vocab.getty.edu/aat/300008791':
                    $values['type'] = 'peninsula';
                    break;

                case 'http://vocab.getty.edu/aat/300132315':
                    $values['type'] = 'gulf';
                    break;

                case 'http://vocab.getty.edu/aat/300132316':
                    $values['type'] = 'bay';
                    break;

                case 'http://vocab.getty.edu/aat/300008707':
                    $values['type'] = 'river';
                    break;

                case 'http://vocab.getty.edu/aat/300008699':
                    $values['type'] = 'stream';
                    break;

                case 'http://vocab.getty.edu/aat/300008680':
                    $values['type'] = 'lake';
                    break;

                case 'http://vocab.getty.edu/aat/300008795':
                    $values['type'] = 'mountain';
                    break;

                case 'http://vocab.getty.edu/aat/300386831':
                    $values['type'] = 'mountain range';
                    break;

                case 'http://vocab.getty.edu/aat/300128207':
                    $values['type'] = 'nation';
                    break;

                case 'http://vocab.getty.edu/aat/300387506':
                    $values['type'] = 'country';
                    break;

                case 'http://vocab.getty.edu/aat/300387107':
                    $values['type'] = 'autonomous region';
                    break;

                case 'http://vocab.getty.edu/aat/300387110':
                    $values['type'] = 'autonomous republic';
                    break;

                case 'http://vocab.getty.edu/aat/300387176':
                    $values['type'] = 'dependent state';
                    break;

                case 'http://vocab.getty.edu/aat/300000776':
                    $values['type'] = 'state';
                    break;

                case 'http://vocab.getty.edu/aat/300000769':
                    $values['type'] = 'canton';
                    break;

                case 'http://vocab.getty.edu/aat/300235093':
                    $values['type'] = 'governorate';
                    break;

                case 'http://vocab.getty.edu/aat/300235107':
                    $values['type'] = 'oblast';
                    break;

                case 'http://vocab.getty.edu/aat/300395501':
                    $values['type'] = 'kray';
                    break;

                case 'http://vocab.getty.edu/aat/300000774':
                    $values['type'] = 'province';
                    break;

                case 'http://vocab.getty.edu/aat/300387081':
                    $values['type'] = 'national district';
                    break;

                case 'http://vocab.getty.edu/aat/300132618':
                    $values['type'] = 'metropolitan area';
                    break;

                case 'http://vocab.getty.edu/aat/300387346':
                    $values['type'] = 'general region';
                    break;

                case 'http://vocab.getty.edu/aat/300236112':
                    $values['type'] = 'region';
                    break;

                case 'http://vocab.getty.edu/aat/300387173':
                    $values['type'] = 'administrative division';
                    break;

                case 'http://vocab.getty.edu/aat/300387131':
                    $values['type'] = 'regional division';
                    break;

                case 'http://vocab.getty.edu/aat/300387333':
                    $values['type'] = 'district'; // Bezirk
                    break;

                case 'http://vocab.getty.edu/aat/300387178':
                    $values['type'] = 'historical region';
                    break;

                case 'http://vocab.getty.edu/aat/300000771':
                    $values['type'] = 'county';
                    break;

                case 'http://vocab.getty.edu/aat/300235088':
                    $values['type'] = 'duchy';
                    break;

                case 'http://vocab.getty.edu/aat/300235112':
                    $values['type'] = 'voivodeship';
                    break;

                case 'http://vocab.getty.edu/aat/300387052':
                    $values['type'] = 'semi-independent political entity';
                    break;

                case 'http://vocab.getty.edu/aat/300387069':
                    $values['type'] = 'autonomous city';
                    break;

                case 'http://vocab.getty.edu/aat/300387068':
                    $values['type'] = 'independent city';
                    break;

                case 'http://vocab.getty.edu/aat/300387113':
                    $values['type'] = 'autonomous community';
                    break;

                case 'http://vocab.getty.edu/aat/300008347':
                    $values['type'] = 'inhabited place';
                    break;

                case 'http://vocab.getty.edu/aat/300387067':
                    $values['type'] = 'special city';
                    break;

                case 'http://vocab.getty.edu/aat/300387354':
                    $values['type'] = 'former group of political entitites';
                    break;

                case 'http://vocab.getty.edu/aat/300387356':
                    $values['type'] = 'former primary political entity';
                    break;

                case 'http://vocab.getty.edu/aat/300387179':
                    $values['type'] = 'former administrative divisions';
                    break;

                case 'http://vocab.getty.edu/aat/300167671':
                    $values['type'] = 'deserted settlement';
                    break;

                case 'http://vocab.getty.edu/aat/300387064':
                    $values['type'] = 'province'; // first level subdivisions (political entities)
                    break;

                case 'http://vocab.getty.edu/aat/300235099':
                    $values['type'] = 'prefecture';
                    break;

                case 'http://vocab.getty.edu/aat/300387198':
                    $values['type'] = 'district'; //third level subdivisions (political entities)
                    break;

                case 'http://vocab.getty.edu/aat/300265612':
                    $values['type'] = 'municipality';
                    break;

                case 'http://vocab.getty.edu/aat/300387213':
                    $values['type'] = 'special municipality';
                    break;

                case 'http://vocab.getty.edu/aat/300000745':
                    $values['type'] = 'neighborhood';
                    break;

                case 'http://vocab.getty.edu/aat/300387337':
                    $values['type'] = 'urban district';
                    break;

                case 'http://vocab.getty.edu/aat/300387340':
                    $values['type'] = 'city district'; // Ortsteile
                    break;

                case 'http://vocab.getty.edu/aat/300000778':
                    $values['type'] = 'borough'; //
                    break;

                case 'http://vocab.getty.edu/aat/300387071':
                    $values['type'] = 'unitary authority';
                    break;

                case 'http://vocab.getty.edu/aat/300025950':
                    $values['type'] = 'association'; // Verbuende wie Commonwealth
                    break;

                case 'http://vocab.getty.edu/aat/300000833':
                    $values['type'] = 'historic site';
                    break;

                case 'http://vocab.getty.edu/aat/300006891':
                    $values['type'] = 'castle';
                    break;

                case 'http://vocab.getty.edu/aat/300386698':
                    $values['type'] = 'miscellaneous';
                    break;

                case 'http://vocab.getty.edu/aat/300387575':
                    $values['type'] = 'area';
                    break;

                case 'http://vocab.getty.edu/aat/300386832':
                    $values['type'] = 'mountain system';
                    break;

                default:
                    die('TODO: handle place type ' . $placeTypePreferred . ' for ' . $place->tgn);
            }

            $schemaPlace = $resource->get('foaf:focus');
            if (isset($schemaPlace)) {
                $place->setValuesFromResource($values, $schemaPlace, [
                        'lat' => 'latitude', 'long' => 'longitude',
                    ],
                    'geo');
            }

            // echo $schemaPlace->dump();
            foreach ($values as $key => $val) {
                $place->$key = $val;
            }
        }
        else if ('gnd' == $parts[0]) {
            // incomplete - currently just looking for geonames
            // sameAs
            $gndIdentifier = $resource->get('gnd:gndIdentifier');
            if (!is_null($gndIdentifier)) {
                $place->gnd = $gndIdentifier->getValue();
            }

            foreach ($resource->allResources('owl:sameAs') as $sameAs) {
                $place->sameAs[] = $sameAs->getUri();
            }
        }

        return $place;
    }

    var $tgn;
    var $gnd;
    var $preferredName;
    var $alternateName = [];
    var $sameAs = [];
    var $type;
    var $tgnParent;
    var $parentPath;
    var $latitude;
    var $longitude;
}

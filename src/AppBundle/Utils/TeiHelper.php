<?php
/*
 * Verbatim copy of https://github.com/jalet/util-sprintf-php
 */
namespace AppBundle\Utils;


/**
 *
 */
class TeiHelper
{
    protected $errors = [];

    public function getErrors()
    {
        return libxml_get_errors();
    }

    public function analyzeHeader($fname)
    {
        libxml_use_internal_errors(true);
        $xml = @simplexml_load_file($fname);

        if (false === $xml) {
            $this->errors = libxml_get_errors();
            libxml_use_internal_errors(false);
            return false;
        }

        libxml_use_internal_errors(false);

        $this->registerXpathNamespaces($xml);

        $result = $xml->xpath('/tei:TEI/tei:teiHeader');
        if (empty($result)) {
            $this->errors = [ (object) [ 'message' => 'No teiHeader found' ] ];
            return false;
        }
        $header = $result[0];
        $this->registerXpathNamespaces($header);

        $article = new \stdClass();

        // name
        $result = $header->xpath('./tei:fileDesc/tei:titleStmt/tei:title[@type="main"]');
        if (!empty($result)) {
            $article->name = $this->extractTextContent($result[0]);
        }

        // author
        $result = $header->xpath('./tei:fileDesc/tei:titleStmt/tei:author');
        foreach ($result as $element) {
            $article->author = $this->buildPersons($element);
        }

        // datePublication
        $result = $header->xpath('./tei:fileDesc/tei:publicationStmt/tei:date');
        foreach ($result as $element) {
            switch ($element['type']) {
                case 'publication':
                    $article->datePublished = (string)$element;
                    break;
            }
        }

        // license
        $result = $header->xpath('./tei:fileDesc/tei:publicationStmt/tei:availability/tei:licence');
        if (!empty($result)) {
            $article->license = (string)$result[0]['target'];
        }
        else {
            $result = $header->xpath('./tei:fileDesc/tei:publicationStmt/tei:availability/tei:p');
            if (!empty($result)) {
                $article->rights = (string)$result[0];
            }
        }

        // slug
        $result = $header->xpath('(./tei:fileDesc/tei:publicationStmt/tei:idno/tei:idno[@type="DTAID"])[1]');
        if (!empty($result)) {
            $article->slug = (string)$result[0];
        }

        // primary date and publication
        $result = $header->xpath('./tei:fileDesc/tei:sourceDesc/tei:bibl');
        if (!empty($result)) {
            $article->creator = (string)$result[0]->author;
            $placeName = $result[0]->placeName;
            if (!empty($placeName)) {
                $place = new \AppBundle\Entity\Place();
                $place->setName((string)$placeName);
                $uri = $placeName['ref'];
                if (!empty($uri)) {
                    if (preg_match('/^'
                                   . preg_quote('http://vocab.getty.edu/tgn/', '/')
                                   . '(\d+)$/', $uri, $matches))
                    {
                        $place->setTgn($matches[1]);
                    }
                }
                $article->contentLocation = $place;
            }
            $orgName = $result[0]->orgName;
            if (!empty($orgName)) {
                $org = new \AppBundle\Entity\Organization();
                $org->setName((string)$orgName);
                $uri = $orgName['ref'];
                if (!empty($uri)) {
                    if (preg_match('/^'
                                   . preg_quote('http://d-nb.info/gnd/', '/')
                                   . '(\d+[\-]?[\dxX]?)$/', $uri, $matches))
                    {
                        $org->setGnd($matches[1]);
                    }
                }
                $article->provider = $org;
            }
            $article->providerIdno = (string)($result[0]->idno);
            $date = $result[0]->date;
            if (!empty($date)) {
                $article->dateCreatedDisplay = (string)$date;
                $when = $date['when'];
                if (!empty($when)) {
                    $article->dateCreated = (string)$when;
                }
            }
        }

        // classification
        $keywords = [];
        $result = $header->xpath('./tei:profileDesc/tei:textClass/tei:classCode');
        foreach ($result as $element) {
            $label_parts = explode(':', (string)$element, 2);
            $label = $label_parts[0];
            if (count($label_parts) > 1) {
                $article->sourceType = $label_parts[1];
            }

            switch ($element['scheme']) {
                case 'http://juedische-geschichte-online.net/doku/#genre':
                    switch ($label) {
                        case 'Quelle':
                            $article->genre = 'source';
                            break;
                        case 'Interpretationstext':
                            $article->genre = 'interpretation';
                            break;
                        case 'Übersichtstext':
                        case 'Hintergrundtext':
                            $article->genre = 'background';
                            break;
                        default:
                            // var_dump($label);
                    }
                    break;

                case 'http://juedische-geschichte-online.net/doku/#topic':
                    $keywords[] = $label;
                    break;
            }
        }
        $article->keywords = $keywords;

        // language
        $langIdents = [];
        $result = $header->xpath('./tei:profileDesc/tei:langUsage/tei:language');
        foreach ($result as $element) {
            if (!empty($element['ident'])) {
                $langIdents[] = (string)$element['ident'];
            }
        }
        $article->language = join(', ', $langIdents);

        return $article;
    }

    protected function registerXpathNamespaces($xml)
    {
        $xml->registerXPathNamespace('tei', 'http://www.tei-c.org/ns/1.0');
    }

    protected function extractTextContent(\SimpleXMLElement $node, $normalizeWhitespace = true)
    {
        $textContent = dom_import_simplexml($node)->textContent;
        if ($normalizeWhitespace) {
            // http://stackoverflow.com/a/33980774
            return preg_replace(['(\s+)u', '(^\s|\s$)u'], [' ', ''], $textContent);

        }
        return $textContent;
    }

    /*
    protected function buildPersons($element)
    {
        $persons = [];

        $this->registerXpathNamespaces($element);
        foreach ($element->xpath('.//tei:persName') as $persName) {
            $person = new \stdClass();
            if (!empty($persName['corresp'])) {
                $person->slug = (string)$persName['corresp'];
            }
            $person->name = (string)$persName;
            $person->{'@type'} = 'http://schema.org/Person';

            $persons[] = $person;
        }
        return $persons;
    }
    */


    public function extractEntities($fname)
    {
        $input = file_get_contents($fname);
        $reader = new CollectingReader();

        $reader->elementMap = [
            '{http://www.tei-c.org/ns/1.0}persName' => '\\AppBundle\\Utils\\CollectingReader::collectElement',
            '{http://www.tei-c.org/ns/1.0}placeName' => '\\AppBundle\\Utils\\CollectingReader::collectElement',
            '{http://www.tei-c.org/ns/1.0}orgName' => '\\AppBundle\\Utils\\CollectingReader::collectElement',
        ];

        try {
            $reader->xml($input);
            $output = $reader->parse();
            foreach ($output as $entity) {
                if (empty($entity['attributes']['ref'])) {
                  continue;
                }
                $uri = trim($entity['attributes']['ref']);
                switch ($entity['name']) {
                    case '{http://www.tei-c.org/ns/1.0}placeName':
                        $type = 'place';
                        if (preg_match('/^'
                                       . preg_quote('http://vocab.getty.edu/tgn/', '/')
                                       . '\d+$/', $uri))
                        {
                        }
                        else {
                            // die($uri);
                            unset($uri);
                        }
                        break;

                      case '{http://www.tei-c.org/ns/1.0}persName':
                        $type = 'person';
                        if (preg_match('/^'
                                       . preg_quote('http://d-nb.info/gnd/', '/')
                                       . '\d+[xX]?$/', $uri))
                        {
                        }
                        else {
                            // die($uri);
                            unset($uri);
                        }
                        break;

                      case '{http://www.tei-c.org/ns/1.0}orgName':
                        $type = 'organization';
                        if (preg_match('/^'
                                       . preg_quote('http://d-nb.info/gnd/', '/')
                                       . '\d+\-?[\dxX]?$/', $uri))
                        {
                        }
                        else {
                            // die($uri);
                            unset($uri);
                        }
                        break;

                      default:
                        unset($uri);
                }

                if (isset($uri)) {
                    if (!isset($additional[$type])) {
                        $additional[$type] = array();
                    }
                    if (!isset($additional[$type][$uri])) {
                        $additional[$type][$uri] = 0;
                    }
                    ++$additional[$type][$uri];
                }

            }
        }
        catch (\Exception $e) {
            var_dump($e);
            return false;
        }

        return $additional;
    }

}

class CollectingReader extends \Sabre\Xml\Reader
{
    function xml($source, $encoding = null, $options = 0)
    {
        // hack for <?xml-model href="http://www.deutschestextarchiv.de/basisformat_ohne_header.rng"
        // type="application/xml"
        // schematypens="http://relaxng.org/ns/structure/1.0"?\>
        $source = preg_replace('/<\?xml\-model [\s\S]*?\?>/', '', $source);
        parent::xml($source, $encoding, $options);
    }

    function collect($output)
    {
        $this->collected[] = $output;
    }

    function parse()
    {
        $this->collected = array();
        parent::parse();
        return $this->collected;
    }

    static function collectElement(\Sabre\Xml\Reader $reader)
    {
        $name = $reader->getClark();
        // var_dump($name);
        $attributes = $reader->parseAttributes();

        $res = [
            'name' => $name,
            'attributes' => $attributes,
            'text' => $reader->readText(),
        ];

        $reader->collect($res);

        $reader->next();
    }
}

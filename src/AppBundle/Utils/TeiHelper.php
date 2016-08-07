<?php
/**
 * Methods to work with TEI / DTA-Basisformat DTABf
 */

namespace AppBundle\Utils;


class TeiHelper
{
    protected $errors = [];

    public function getErrors()
    {
        return libxml_get_errors();
    }

    public function buildPerson($element)
    {
        $person = new \AppBundle\Entity\Person();

        if (!empty($element['corresp'])) {
            $person->setSlug((string)$element['corresp']);
        }

        return $person;
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
        $result = $header->xpath('./tei:fileDesc/tei:titleStmt/tei:author/tei:persName');
        foreach ($result as $element) {
            $person = $this->buildPerson($element);
            if (!is_null($person)) {
                if (!isset($article->author)) {
                    $article->author = [];
                }
                $article->author[] = $person;
            }
        }

        // translator
        $result = $header->xpath('./tei:fileDesc/tei:titleStmt/tei:editor[@role="translator"]/tei:persName');
        if (!empty($result)) {
            $element = $result[0];
            $person = $this->buildPerson($element);
            if (!is_null($person)) {
                $article->translator = $person;
            }
        }

        // datePublication
        $result = $header->xpath('./tei:fileDesc/tei:publicationStmt/tei:date');
        foreach ($result as $element) {
            switch ($element['type']) {
                case 'firstPublication':
                    $article->datePublished = new \DateTime((string)$element);
                    break;
                case 'publication':
                    $article->dateModified = new \DateTime((string)$element);
                    break;
            }
        }
        if (empty($article->datePublished) && !empty($article->dateModified)) {
            $article->datePublished = $article->dateModified;
        }
        if (!empty($article->datePublished) && !empty($article->dateModified)
            && $article->datePublished->format("Y-m-d") == $article->dateModified->format("Y-m-d"))
        {
            unset($article->dateModified);
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

        // uid & slug
        $result = $header->xpath('(./tei:fileDesc/tei:publicationStmt/tei:idno/tei:idno[@type="DTAID"])[1]');
        if (!empty($result)) {
            $article->uid = (string)$result[0];
        }
        $result = $header->xpath('(./tei:fileDesc/tei:publicationStmt/tei:idno/tei:idno[@type="DTADirName"])[1]');
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

        // url
        $result = $header->xpath('(./tei:fileDesc/tei:sourceDesc/tei:msDesc/tei:msIdentifier/tei:idno/tei:idno[@type="URLImages"])[1]');
        if (!empty($result)) {
            $article->url = (string)$result[0];
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
                        case 'Source':
                            $article->genre = 'source';
                            break;
                        case 'Interpretation':
                        case 'Interpretationstext':
                        case 'Article':
                        case 'Beitrag':
                            $article->genre = 'interpretation';
                            break;
                        case 'Introduction':
                        case 'Einführung':
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

                case 'http://juedische-geschichte-online.net/doku/#translated-from':
                    if (!empty($label)) {
                        $article->translatedFrom = $label;
                    }

            }
        }
        $article->keywords = $keywords;

        // isPartOf
        if (isset($article->genre) && 'source' == $article->genre) {
            $result = $header->xpath('./tei:fileDesc/tei:seriesStmt/tei:title[@type="main"]');
            foreach ($result as $element) {
                if (!empty($element['corresp'])) {
                    $corresp = (string)$element['corresp'];
                    if (preg_match('/^\#(jgo\:(article|source)-\d+)$/', $corresp, $matches)) {
                        $isPartOf = new \AppBundle\Entity\Article();
                        $isPartOf->setUid($matches[1]);
                        $article->isPartOf = $isPartOf;
                    }
                }
            }
        }

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

    private function addDescendants($parent, $path, $callbacks)
    {
        $pathParts = explode('/', $path);
        // if missing, we need to iteratively add
        for ($depth = 0; $depth < count($pathParts); $depth++) {
            $name = $pathParts[$depth];
            $subPath = './' . $name;
            $this->registerXpathNamespaces($parent);
            $result = $parent->xpath($subPath);
            if (!empty($result)) {
                $parent = $result[0];
                continue;
            }
            if (array_key_exists($name, $callbacks)) {
                // custom call
                $parent = $callbacks[$name]($parent, $name);
            }
            else {
                // default is an element without attributes
                $parent = $parent->addChild($name);
            }
        }
    }

    public function addChildStructure($parent, $structure, $prefix = '')
    {
        foreach ($structure as $tagName => $content) {
            if (is_scalar($content)) {
                $self = $parent->addChild($prefix . $tagName, $content);
            }
            else {
                $atKeys = preg_grep('/^@/', array_keys($content));
                if (!empty($atKeys)) {
                    // simple element with attributes
                    if (in_array('@value', $atKeys)) {
                        $self = $parent->addChild($prefix . $tagName, $content['@value']);
                    }
                    else {
                        $self = $parent->addChild($prefix . $tagName);
                    }
                    foreach ($atKeys as $key) {
                        if ('@value' == $key) {
                            continue;
                        }
                        $self->addAttribute($prefix . ltrim($key, '@'), $content[$key]);
                    }
                }
                else {
                    $self = $parent->addChild($prefix . $tagName);
                    $this->addChildStructure($self, $content, $prefix);
                }
            }
        }
    }

    public function adjustHeader($fname, $data)
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
            // we only adjust data in header - so we are done
            return $xml;
        }

        $header = $result[0];
        $this->registerXpathNamespaces($header);

        // removal is not available in simple-xml, so make $dom available
        $dom = dom_import_simplexml($xml);

        $lang = $dom->getAttribute('xml:lang');
        if (!empty($lang)) {
            $langCode3 = \AppBundle\Utils\Iso639::code1to3($lang);
            if (!empty($langCode3)) {
                $langName = \AppBundle\Utils\Iso639::nameByCode3($langCode3);

                $this->addDescendants($header, 'tei:profileDesc/tei:langUsage/tei:language',
                                     [
                                        'tei:language' => function ($parent, $name) use ($langName, $langCode3) {
                                            $self = $parent->addChild($name, $langName);
                                            $self->addAttribute('tei:ident', $langCode3);
                                            return $self;
                                        },
                                      ]);

                // remove the original attribute
                $dom->removeAttribute('xml:lang');
            }
        }

        // adjust <?xml-model if still set to basisformat_ohne_header.rng
        // see http://stackoverflow.com/a/24914655
        $xpath = new \DOMXpath($dom->ownerDocument);
        $result = $xpath->evaluate(
            '/processing-instruction()[name() = "xml-model"]'
        );
        foreach ($result as $node) {
            if (preg_match('/basisformat_ohne_header\.rng/', $node->textContent)) {
                // we need to replace the node
                $pi = $dom->ownerDocument->createProcessingInstruction('xml-model', preg_replace('/basisformat_ohne_header\.rng/', 'basisformat.rng', $node->textContent));
                $dom->ownerDocument->appendChild($pi);
                $node->parentNode->insertBefore($pi, $node);
                $node->parentNode->removeChild($node);
            }
        }

        // remove all oxygen comments
        $result = $xpath->evaluate(
            '//processing-instruction()[name() = "oxy_comment_start" or name() = "oxy_comment_end"]'
        );
        foreach ($result as $node) {
            $node->parentNode->removeChild($node);
        }

        // if we have only <title> and not <title type="main">, add this attribute
        $result = $header->xpath('./tei:fileDesc/tei:titleStmt/tei:title[@type="main"]');
        if (empty($result)) {
            $result = $header->xpath('./tei:fileDesc/tei:titleStmt/tei:title');
            if (!empty($result)) {
                $result[0]->addAttribute('tei:type', 'main');
            }
        }


        if (!empty($data['translator'])) {
                $this->addDescendants($header, 'tei:fileDesc/tei:titleStmt/tei:editor[@role="translator"]',
                                     [
                                        'tei:editor[@role="translator"]' => function ($parent, $name) use ($data) {
                                            $self = null;
                                            foreach ($data['translator'] as $corresp => $persName) {
                                                $self = $parent->addChild('tei:editor');
                                                $self->addAttribute('tei:role', 'translator');
                                                $persName = $self->addChild('tei:persName', $persName);
                                                $persName->addAttribute('tei:corresp', $corresp);
                                            }
                                            return $self;
                                        },
                                      ]);
        }

        if (!empty($data['publisher'])) {
            $result = $header->xpath('./tei:fileDesc/tei:publicationStmt/tei:p[not(*) and not(normalize-space())]');
            foreach ($result as $element) {
                $dom = dom_import_simplexml($element);
                $dom->parentNode->removeChild($dom);
            }

            $this->addDescendants($header, 'tei:fileDesc/tei:publicationStmt/tei:publisher',
                                 [
                                    'tei:publisher' => function ($parent, $name) use ($data) {
                                        $self = $parent->addChild($name);
                                        $this->addChildStructure($self, $data['publisher'], 'tei:');
                                        return $self;
                                    },
                                  ]);

            if (!empty($data['dates'])) {
                foreach ($data['dates'] as $type => $val) {
                    $match = 'tei:date[@type="' . $type . '"]';
                    $this->addDescendants($header, 'tei:fileDesc/tei:publicationStmt/' . $match,
                                     [
                                        $match => function ($parent, $name) use ($type, $val) {
                                            $self = $parent->addChild('tei:date', $val);
                                            $self->addAttribute('tei:type', $type);
                                            return $self;
                                        },
                                      ]);
                }
            }

            if (!empty($data['license'])) {
                $this->addDescendants($header, 'tei:fileDesc/tei:publicationStmt/tei:availability',
                                     [
                                        'tei:availability' => function ($parent, $name) use ($data) {
                                            $self = $parent->addChild($name);
                                            $targets = array_keys($data['license']);
                                            if (!empty($targets)) {
                                                $target = $targets[0];
                                                if (!empty($target)) {
                                                    $self = $self->addChild('tei:licence');
                                                    $self->addAttribute('tei:target', $target);
                                                    $this->addChildStructure($self, [ 'p' => $data['license'][$target] ], 'tei:');
                                                }
                                                else {
                                                    $availability = $data['license'][$target];
                                                    if (!empty($availability)) {
                                                        /* $self = $self->addChild('tei:licence');
                                                        $self->addAttribute('tei:target', '#'); */
                                                        $this->addChildStructure($self, [ 'p' => $availability ], 'tei:');
                                                    }
                                                }
                                            }
                                            return $self;
                                        },
                                      ]);
            }
            if (!empty($data['uid'])) {
                $this->addDescendants($header, 'tei:fileDesc/tei:publicationStmt/tei:idno/tei:idno[@type="DTAID"]',
                                     [
                                        'tei:idno[@type="DTAID"]' => function ($parent, $name) use ($data) {
                                            $self = $parent->addChild('tei:idno', $data['uid']);
                                            $self->addAttribute('tei:type', 'DTAID');
                                            return $self;
                                        },
                                      ]);
            }
            if (!empty($data['slug'])) {
                $this->addDescendants($header, 'tei:fileDesc/tei:publicationStmt/tei:idno/tei:idno[@type="DTADirName"]',
                                     [
                                        'tei:idno[@type="DTADirName"]' => function ($parent, $name) use ($data) {
                                            $self = $parent->addChild('tei:idno', $data['slug']);
                                            $self->addAttribute('tei:type', 'DTADirName');
                                            return $self;
                                        },
                                      ]);
            }
        }

        if (!empty($data['seriesStmt'])) {
            $this->addDescendants($header, 'tei:fileDesc/tei:seriesStmt',
                                 [
                                    'tei:seriesStmt' => function ($parent, $name) use ($header, $data) {
                                        // seriesStmt must go before sourceDesc
                                        $result = $header->xpath('./tei:fileDesc/tei:sourceDesc');
                                        // dirty - we just remove it for now since it will be added through bibl afterwards
                                        // should change to insertBefore
                                        foreach ($result as $element) {
                                            $dom = dom_import_simplexml($element);
                                            $dom->parentNode->removeChild($dom);
                                        }

                                        $self = $parent->addChild('tei:seriesStmt');
                                        foreach ($data['seriesStmt'] as $corresp => $title) {
                                            $child = $self->addChild('tei:title', $title);
                                            $child->addAttribute('tei:type', 'main');
                                            $child->addAttribute('tei:corresp', $corresp);
                                        }
                                        return $self;
                                    },
                                  ]);
        }

        if (!empty($data['bibl'])) {
            /*
            // remove if it is legacy <p>
            $result = $header->xpath('./tei:fileDesc/tei:publicationStmt/tei:p[not(*) and not(normalize-space())]');
            foreach ($result as $element) {
                $dom = dom_import_simplexml($element);
                $dom->parentNode->removeChild($dom);
            }
            */
            $this->addDescendants($header, 'tei:fileDesc/tei:sourceDesc/tei:bibl',
                                 [
                                    'tei:bibl' => function ($parent, $name) use ($data) {
                                        $self = $parent->addChild($name);
                                        $this->addChildStructure($self, $data['bibl'], 'tei:');
                                    }
                                 ]);
        }

        if (!empty($data['URLImages'])) {
            $this->addDescendants($header, 'tei:fileDesc/tei:sourceDesc/tei:msDesc/tei:msIdentifier',
                                 [
                                    'tei:msIdentifier' => function ($parent, $name) use ($data) {
                                        $self = $parent->addChild($name);
                                        $this->addChildStructure($self,
                                                                 [
                                                                   'repository' => $data['bibl']['orgName']['@value'],
                                                                   'idno' => [ 'idno' => [ '@type' => 'URLImages', '@value' => $data['URLImages']] ]
                                                                 ],
                                                                 'tei:');
                                    }
                                 ]);
        }

        if (!empty($data['genre'])) {
            $this->addDescendants($header, 'tei:profileDesc/tei:textClass/tei:classCode[contains(@scheme, "genre")]',
                                 [
                                    'tei:classCode[contains(@scheme, "genre")]' => function ($parent, $name) use ($data) {
                                        $self = $parent->addChild('tei:classCode', $data['genre']);
                                        $self->addAttribute('tei:scheme', 'http://juedische-geschichte-online.net/doku/#genre');
                                        return $self;
                                    },
                                  ]);

        }
        if (!empty($data['topic'])) {
            $this->addDescendants($header, 'tei:profileDesc/tei:textClass/tei:classCode[contains(@scheme, "topic")]',
                                 [
                                    'tei:classCode[contains(@scheme, "topic")]' => function ($parent, $name) use ($data) {
                                        $self = null;
                                        foreach ($data['topic'] as $topic) {
                                            $self = $parent->addChild('tei:classCode', $topic);
                                            $self->addAttribute('tei:scheme', 'http://juedische-geschichte-online.net/doku/#topic');
                                        }
                                        return $self;
                                    },
                                  ]);
        }
        if (!empty($data['translatedFrom'])) {
            $this->addDescendants($header, 'tei:profileDesc/tei:textClass/tei:classCode[contains(@scheme, "translated-from")]',
                                 [
                                    'tei:classCode[contains(@scheme, "translated-from")]' => function ($parent, $name) use ($data) {
                                        $self = $parent->addChild('tei:classCode', $data['translatedFrom']);
                                        $self->addAttribute('tei:scheme', 'http://juedische-geschichte-online.net/doku/#translated-from');
                                        return $self;
                                    },
                                  ]);

        }

        return $xml;
    }

    protected function registerXpathNamespaces($xml)
    {
        // $xml->registerXPathNamespace('xml', 'http://www.w3.org/XML/1998/namespace');
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

        $additional = [];
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
                        $additional[$type] = [];
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
        $source = preg_replace('/<\?xml\-model [\s\S\n]*?\?>/', '', $source);
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

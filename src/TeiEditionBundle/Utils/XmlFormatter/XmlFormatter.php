<?php

namespace TeiEditionBundle\Utils\XmlFormatter;

class XmlFormatter
{
    var $config = [];
    var $adapter = null;

    public static function addLinebreak($xml, $element = 'lb')
    {
        // hack to add a line break after <lb />
        $xml = preg_replace('~([ \t]+)(.*?)(<' . $element . '\s*/>)~',
                            "\\1\\2<" . $element . "/>\n\\1",
                            $xml);

        return $xml;
    }

    public function __construct($config = null)
    {
        if (isset($config) && is_array($config)) {
            $this->config = $config;
        }
    }

    public function setAdapter($adapter)
    {
        $this->adapter = $adapter;
    }

    protected function instantiateDomDocument()
    {
        // create $doc
        $doc = new \DomDocument('1.0', 'UTF-8');
        $doc->preserveWhiteSpace = false;
        $doc->formatOutput = true;

        return $doc;
    }

    public function formatFile($fnameXml, $options = [])
    {
        if (isset($this->adapter)) {
            $res = $this->adapter->formatFile($fnameXml, $options);

            return $res;
        }

        // load xml
        $doc = $this->instantiateDomDocument();
        @$valid = $doc->load($fnameXml);

        $ret = $doc->saveXML();

        return self::addLinebreak($ret);
    }

    public function formatXML($xml, $options = [])
    {
        if (isset($this->adapter)) {
            $res = $this->adapter->formatXML($xml, $options);

            return $res;
        }

        // load xml
        $doc = $this->instantiateDomDocument();
        @$valid = $doc->loadXML($xml);

        $ret = $doc->saveXML();

        return self::addLinebreak($ret);
    }
}

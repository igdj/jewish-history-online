<?php

namespace AppBundle\Utils\XmlFormatter;

class XmlFormatter
{
    var $config = [];
    var $adapter = null;

    public static function addLinebreak($xml, $element = 'lb')
    {
        // hack to add a line break after <lb />
        $xml = preg_replace('~([ \t]+)(.*?)(<' . $element . '\s*/>)~',
                            "\\1\\2<" .$element . "/>\n\\1",
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

    public function formatFile($fname_xml, $options = [])
    {
        if (isset($this->adapter)) {
            $res = $this->adapter->formatFile($fname_xml, $options);

            return $res;
        }

        // create $doc
        $doc = new \DomDocument('1.0', 'UTF-8');
        $doc->preserveWhiteSpace = false;
        $doc->formatOutput = true;

        // load xml
        @$valid = $doc->load($fname_xml);

        $ret = $doc->saveXML();


        return self::addLinebreak($ret);
    }
}

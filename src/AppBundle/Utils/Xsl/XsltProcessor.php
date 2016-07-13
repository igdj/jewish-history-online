<?php

namespace AppBundle\Utils\Xsl;

use XSLTProcessor as NativeXsltProcessor;

/*
 * See also https://github.com/genkgo/xsl for PHP >= 5.6
 */
class XsltProcessor extends NativeXsltProcessor
{
    var $config = [];
    var $adapter = null;

    function __construct($config = null)
    {
        if (isset($config) && is_array($config)) {
            $this->config = $config;
        }
    }

    function setAdapter($adapter)
    {
        $this->adapter = $adapter;
    }

    function transformFileToXml($fname_xml, $fname_xsl, $options = [])
    {
        if (isset($this->adapter)) {
            $res = $this->adapter->transformToXml($fname_xml, $fname_xsl, $options);
            return $res;
        }

        // load xml
        $dom = new \DomDocument('1.0', 'UTF-8');
        @$valid = $dom->load($fname_xml);

        // load xsl
        $xsl = new \DomDocument('1.0', 'UTF-8');
        $xsl->load($fname_xsl);

        // Create the XSLT processor
        $proc = new \XsltProcessor();
        $proc->importStylesheet($xsl);

        // Transform
        $newdom = $proc->transformToDoc($dom);
        return $newdom->saveXML();
    }
}

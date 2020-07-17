<?php

namespace TeiEditionBundle\Utils\Xsl;

use XSLTProcessor as NativeXsltProcessor;

/*
 * Extend XsltProcessor to set an adapter that handles XSLT 2
 */
class XsltProcessor
extends NativeXsltProcessor
{
    protected $config = [];
    protected $adapter = null;
    protected $errors = [];

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

    public function getErrors()
    {
        if (isset($this->adapter)) {
            return $this->adapter->getErrors();
        }

        return $this->errors;
    }

    public function transformFileToXml($fname_xml, $fname_xsl, $options = [])
    {
        if (isset($this->adapter)) {
            $res = $this->adapter->transformToXml($fname_xml, $fname_xsl, $options);

            return $res;
        }

        $this->errors = [];

        // native XsltProcessor doesn't handle XSLT 2.0
        libxml_use_internal_errors(true);

        $dom = new \DomDocument('1.0', 'UTF-8');
        @$valid = $dom->load($fname_xml);
        if (!$valid) {
            $this->errors = libxml_get_errors();
            libxml_use_internal_errors(false);

            return false;
        }

        // load xsl
        $xsl = new \DomDocument('1.0', 'UTF-8');
        $res = $xsl->load($fname_xsl);
        if (!$res) {
            $this->errors = libxml_get_errors();
            libxml_use_internal_errors(false);

            return false;
        }

        // Create the XSLT processor
        $proc = new \XsltProcessor();
        $proc->importStylesheet($xsl);

        // Transform
        $newdom = $proc->transformToDoc($dom);
        if (false === $newdom) {
            $this->errors = libxml_get_errors();
            libxml_use_internal_errors(false);

            return false;
        }

        libxml_use_internal_errors(false);

        return $newdom->saveXML();
    }
}

<?php

namespace AppBundle\Utils\Xsl;

use AppBundle\Utils\Sprintf;

class XsltCommandlineAdapter
{
    var $cmdTemplate;
    var $config = [];

    function __construct($cmdTemplate, $config = null)
    {
        $this->cmdTemplate = $cmdTemplate;
        if (isset($config) && is_array($config)) {
            $this->config = $config;
        }
    }

    protected function escapeFilename($fname, $check_exists = true)
    {
        if ($check_exists) {
            $fname = realpath($fname);
            if (false == $fname) {
                throw new \InvalidArgumentException("$fname does not exist");
            }
        }

        return escapeshellarg($fname);
    }

    protected function buildAdditional($options)
    {
        $nameValue = [];
        if (array_key_exists('params', $options)) {
            foreach ($options['params'] as $name => $value) {
                $name_sanitized = trim(preg_replace('/[^a-zA-Z\-0-9\.]/', '', $name));
                if ('' !== $name_sanitized) {
                    $nameValue[] = $name_sanitized . '=' . escapeshellarg($value);
                }
            }
        }

        return join(' ', $nameValue);
    }

    function transformToXml($srcFilename, $xslFilename, $options = [])
    {
        $cmd = trim(Sprintf::f($this->cmdTemplate, [
                'source' => $this->escapeFilename($srcFilename),
                'xsl' => $this->escapeFilename($xslFilename),
                'additional' => $this->buildAdditional($options),
            ]));
        $res = `$cmd`;

        // TODO: implement some form of error-handling
        return $res;
    }
}

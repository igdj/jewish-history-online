<?php

namespace TeiEditionBundle\Utils\Xsl;

use TeiEditionBundle\Utils\Sprintf;

class XsltSaxonProcessorAdapter
{
    protected $config = [];
    protected $errors = [];

    public function __construct($config = null)
    {
        if (isset($config) && is_array($config)) {
            $this->config = $config;
        }
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function transformToXml($srcFilename, $xslFilename, $options = [])
    {
        $this->errors = [];

        $saxonProc = new \Saxon\SaxonProcessor(true);
        $proc = $saxonProc->newXsltProcessor();

        if (array_key_exists('params', $options)) {
            foreach ($options['params'] as $name => $value) {
                $xdmValue = $saxonProc->createAtomicValue(strval($value));
                if ($xdmValue != null) {
                    $proc->setParameter($name, $xdmValue);
                }
            }
        }

        $proc->setSourceFromFile($srcFilename);
        $proc->compileFromFile($xslFilename);

        $res = $proc->transformToString();
        if (is_null($res)) {
            // simple error-handling
            $res = false;

            $errCount = $proc->getExceptionCount();
            for ($i = 0; $i < $errCount; $i++) {
                $this->errors[] = (object) [ 'message' => $proc->getErrorMessage($i) ];
            }
        }

        $proc->clearParameters();
        $proc->clearProperties();
        unset($proc);

        return $res;
    }
}

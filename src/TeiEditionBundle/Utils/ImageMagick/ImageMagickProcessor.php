<?php

namespace TeiEditionBundle\Utils\ImageMagick;


/*
 *
 */
class ImageMagickProcessor
{
    protected $path = '';

    var $config = [];

    public function __construct($config = null)
    {
        if (isset($config) && is_array($config)) {
            $this->config = $config;
        }
        if (array_key_exists('path', $this->config)) {
            $this->path = $this->config['path'];
        }
    }

    // escapeshellarg strips % from windows
    public function escapeshellarg($arg)
    {
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            return '"' . addcslashes($arg, '\\"') . '"';
        }

        return escapeshellarg($arg);
    }

    public function convert($arguments)
    {
        $cmd = $this->path
             . 'convert '
             . join(' ', $arguments);

        $ret = exec($cmd, $lines, $retval);

        return $ret;
    }
}

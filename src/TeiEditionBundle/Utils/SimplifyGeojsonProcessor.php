<?php

namespace TeiEditionBundle\Utils;


/*
 *
 */
class SimplifyGeojsonProcessor
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

    protected function exec($arguments)
    {
        $cmd = $this->path
             . 'simplify-geojson '
             . join(' ', $arguments)
             ;

        $ret = exec($cmd, $lines, $retval);

        return join("\n", $lines);
    }

    public function simplifyGeojson($geojson, $precision = '0.01')
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'TMP_');
        file_put_contents($tempFile, json_encode($geojson));
        $ret = $this->exec([ sprintf('-t %f', $precision), $tempFile ]);
        @unlink($tempFile);

        return json_decode($ret, true);
    }
}

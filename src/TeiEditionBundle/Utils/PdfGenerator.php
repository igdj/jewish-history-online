<?php

namespace TeiEditionBundle\Utils;

class PdfGenerator
extends \Mpdf\Mpdf
{
    // mpdf
    public function __construct($options = [])
    {
        // mpdf >= 7
        $defaultConfig = (new \Mpdf\Config\ConfigVariables())->getDefaults();
        $fontDir = $defaultConfig['fontDir'];

        /*
         * mPDF is pre-configured to use <path to mpdf>/tmp as a directory
         * to write temporary files (mainly for images).
         * Write permissions must be set for read/write access for the tmp directory.
         *
         * As the default temp directory will be in vendor folder,
         * is is advised to set custom temporary directory.
         */
        $options['tempDir'] = array_key_exists('tempDir', $options)
            ? $options['tempDir']
            : sys_get_temp_dir();

        $options['fontDir'] = array_key_exists('fontDir', $options)
            ? array_merge($options['fontDir'], $fontDir)
            : $fontDir;

        $defaultFontConfig = (new \Mpdf\Config\FontVariables())->getDefaults();
        $fontdata = $defaultFontConfig['fontdata'];

        $options['fontdata'] = array_key_exists('fontdata', $options)
            ? $fontdata + $options['fontdata']
            : $fontdata;

        parent::__construct($options);

        $this->autoScriptToLang = true;

        $this->SetDisplayMode('fullpage');
    }
}

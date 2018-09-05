<?php

namespace AppBundle\Utils;

class PdfGenerator
extends \Mpdf\Mpdf
{
    // mpdf
    public function __construct($options = [])
    {
        // mpdf 7.x
        $defaultConfig = (new \Mpdf\Config\ConfigVariables())->getDefaults();
        $fontDir = $defaultConfig['fontDir'];

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

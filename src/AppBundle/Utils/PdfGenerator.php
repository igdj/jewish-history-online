<?php
namespace AppBundle\Utils;

class PdfGenerator extends \mPDF
{
    // mpdf
    public function __construct()
    {
        // add font - mpdf 6.1
        define('_MPDF_SYSTEM_TTFONTS_CONFIG', realpath(__DIR__ . '/config_fonts.php'));

        parent::__construct();
        $this->SetDisplayMode('fullpage');
    }
}

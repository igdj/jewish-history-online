<?php

namespace AppBundle\Utils;

/**
 *
 *
 */
trait RenderTeiTrait
{
    /* Transform an XML file ($fnameXml) with an XSLT stylesheet ($fnameXslt) */
    public function renderTei($fnameXml, $fnameXslt = 'dtabf_article.xsl', $options = [])
    {
        $kernel = $this->getContainer()->get('kernel');

        $locateResource = !array_key_exists('locateXmlResource', $options)
            || $options['locateXmlResource'];
        if ($locateResource) {
            $pathToXml = $this->locateTeiResource($fnameXml);
            if (false === $pathToXml) {
                return false;
            }
        }
        else {
            $pathToXml = $fnameXml;
        }

        $proc = $this->getContainer()->get('app.xslt');
        $pathToXslt = $kernel->locateResource('@AppBundle/Resources/data/xsl/' . $fnameXslt);
        $res = $proc->transformFileToXml($pathToXml, $pathToXslt, $options);
        return $res;
    }
}
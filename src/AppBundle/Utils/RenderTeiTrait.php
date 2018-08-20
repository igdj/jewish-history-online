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
        $pathToXslt = $kernel->locateResource('@AppBundle/Resources/data/xsl/' . $fnameXslt,
                                              $kernel->getResourcesOverrideDir());
        $res = $proc->transformFileToXml($pathToXml, $pathToXslt, $options);

        return $res;
    }

    function removeByCssSelector($html, $selectorsToRemove)
    {
        $crawler = new \Symfony\Component\DomCrawler\Crawler();
        $crawler->addHtmlContent($html);

        foreach ($selectorsToRemove as $selector) {
            $crawler->filter($selector)->each(function ($crawler) {
                foreach ($crawler as $node) {
                    // var_dump($node);
                    $node->parentNode->removeChild($node);
                }
            });
        }

        return $crawler->html();
    }
}

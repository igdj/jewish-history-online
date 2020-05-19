<?php

namespace AppBundle\Utils;

/**
 * Use a trait to share methods for Command and Controller
 *
 * TODO: Transform into Service (for better dependency injection)
 *
 */
trait RenderTeiTrait
{
    protected function locateTeiResource($fnameXml)
    {
        try {
            $pathToXml = $this->locateResource('@AppBundle/Resources/data/tei/' . $fnameXml,
                                               $this->getResourcesOverrideDir());
        }
        catch (\InvalidArgumentException $e) {
            return false;
        }

        return $pathToXml;
    }

    /**
     * Transform an XML file ($fnameXml)
     * with an XSLT stylesheet ($fnameXslt)
     */
    protected function renderTei($fnameXml, $fnameXslt = 'dtabf_article.xsl', $options = [])
    {
        $locateResource = !array_key_exists('locateXmlResource', $options)
            || $options['locateXmlResource'];

        $pathToXml = $fnameXml;
        if ($locateResource) {
            $pathToXml = $this->locateTeiResource($fnameXml);
            if (false === $pathToXml) {
                return false;
            }
        }

        $pathToXslt = $this->locateResource('@AppBundle/Resources/data/xsl/' . $fnameXslt,
                                            $this->getResourcesOverrideDir());

        return $this->xsltProcessor->transformFileToXml($pathToXml, $pathToXslt, $options);
    }

    /**
     * Remove nodes from HTML by CSS-Selector
     */
    function removeByCssSelector($html, $selectorsToRemove)
    {
        $crawler = new \Symfony\Component\DomCrawler\Crawler();
        $crawler->addHtmlContent($html);

        foreach ($selectorsToRemove as $selector) {
            $crawler->filter($selector)->each(function ($crawler) {
                foreach ($crawler as $node) {
                    $node->parentNode->removeChild($node);
                }
            });
        }

        return $crawler->html();
    }
}

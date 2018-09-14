<?php

namespace AppBundle\Utils;

/**
 * Use a trait to share methods for Command and Controller
 *
 */
trait RenderTeiTrait
{
    /**
     * Capsulate difference between
     * Controller and ContainerAwareCommand
     */
    protected function getFromContainer($name)
    {
        $container = method_exists($this, 'getContainer')
            ? $this->getContainer() : $this;

        return $container->get($name);
    }

    protected function locateResource($name)
    {

        $kernel = $this->getFromContainer('kernel');

        return $kernel->locateResource($name, $kernel->getResourcesOverrideDir());
    }

    protected function locateTeiResource($fnameXml)
    {
        try {
            $pathToXml = $this->locateResource('@AppBundle/Resources/data/tei/' . $fnameXml);
        }
        catch (\InvalidArgumentException $e) {
            return false;
        }

        return $pathToXml;
    }

    /**
     * Transform an XML file ($fnameXml)
     * with an XSLT stylesheet ($fnameXslt)
     * using the processor defined by
     *  app.xslt
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

        $pathToXslt = $this->locateResource('@AppBundle/Resources/data/xsl/' . $fnameXslt);

        $proc = $this->getFromContainer('app.xslt');
        $res = $proc->transformFileToXml($pathToXml, $pathToXslt, $options);

        return $res;
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

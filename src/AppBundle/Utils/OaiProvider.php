<?php

namespace AppBundle\Utils;

/**
 * Override \Picturae\OaiPmh\Provider to include
 * <?xml-stylesheet type="text/xsl" href="/assets/oai.xsl"?>
 */
class OaiProvider
extends \Picturae\OaiPmh\Provider
{
    protected $repositoryProperty;
    protected $repositoryMethods = [];
    protected $params;
    protected $granularity = [];

    /**
     * @param Repository $repository
     * @param ServerRequestInterface $request
     */
    public function __construct(\Picturae\OaiPmh\Interfaces\Repository $repository,
                                \Psr\Http\Message\ServerRequestInterface $request = null)
    {
        if ($request->getMethod() === 'POST') {
            $this->params = $request->getParsedBody();
        } else {
            $this->params = $request->getQueryParams();
        }

        parent::__construct($repository, $request);

        // open some methods
        foreach ([ 'checkVerb', 'doVerb' ] as $method) {
            $this->repositoryMethods[$method] = new \ReflectionMethod('\\Picturae\\OaiPmh\\Provider', $method);
            $this->repositoryMethods[$method]->setAccessible(true);
        }

        $this->repositoryProperty = new \ReflectionProperty('\\Picturae\\OaiPmh\\Provider', 'repository');
        $this->repositoryProperty->setAccessible(true);
    }

    /**
     * handles the current request
     * @return ResponseInterface
     */
    public function getResponse()
    {
        $repository = $this->repositoryProperty->getValue($this);

        $response = new \Picturae\OaiPmh\ResponseDocument();
        $headersProperty = new \ReflectionProperty('\\Picturae\\OaiPmh\\ResponseDocument', 'headers');
        $headersProperty->setAccessible(true);
        $headersProperty->setValue($response, ['Content-Type' => 'text/xml']);

        $xml = $response->getDocument();
        $xslUrl = preg_replace('/oai$/', 'assets/oai.xsl', $repository->getBaseUrl());
        $xslt = $xml->createProcessingInstruction('xml-stylesheet',
                                                  'type="text/xsl" href="' . $xslUrl . '"');

        //adding it to the xml
        $xml->insertBefore($xslt, $xml->documentElement);

        $responseProperty = new \ReflectionProperty('\\Picturae\\OaiPmh\\Provider', 'response');
        $responseProperty->setAccessible(true);
        $responseProperty->setValue($this, $response);


        $response->addElement("responseDate", $this->toUtcDateTime(new \DateTime()));
        $requestNode = $response->createElement("request", $repository->getBaseUrl());
        $response->getDocument()->documentElement->appendChild($requestNode);

        try {
            $this->repositoryMethods['checkVerb']->invoke($this); // $this->checkVerb();
            $verbOutput = $this->repositoryMethods['doVerb']->invoke($this); // $this->doVerb();

            // we are sure now that all request variables are correct otherwise an error would have been thrown
            foreach ($this->params as $k => $v) {
                $requestNode->setAttribute($k, $v);
            }

            // the element is only added when everything went fine, otherwise we would add error node(s) in the catch
            // block below
            $response->getDocument()->documentElement->appendChild($verbOutput);
        } catch (\Picturae\OaiPmh\Exception\MultipleExceptions $errors) {
            //multiple errors happened add all of the to the response
            foreach ($errors as $error) {
                $response->addError($error);
            }
        } catch (\Picturae\OaiPmh\Exception $error) {
            //add this error to the response
            $response->addError($error);
        }

        return $response->getResponse();
    }

    /**
     * @param \DateTime $time
     * @return string
     */
    private function toUtcDateTime(\DateTime $time)
    {
        $UTC = new \DateTimeZone("UTC");
        $time->setTimezone($UTC);
        return $time->format('Y-m-d\TH:i:s\Z');
    }
}

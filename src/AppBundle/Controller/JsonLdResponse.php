<?php

namespace AppBundle\Controller;

class JsonLdResponse
extends \Symfony\Component\HttpFoundation\JsonResponse
{
    public function __construct($data = null, $status = 200, $headers = array('Content-Type' => 'application/ld+json'), $json = false)
    {
        parent::__construct($data, $status, $headers, $json);
    }
}

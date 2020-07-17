<?php

namespace TeiEditionBundle\Controller;

class JsonLdResponse
extends \Symfony\Component\HttpFoundation\JsonResponse
{
    public function __construct($data = null, $status = 200, $headers = [ 'Content-Type' => 'application/ld+json' ], $json = false)
    {
        parent::__construct($data, $status, $headers, $json);
    }
}

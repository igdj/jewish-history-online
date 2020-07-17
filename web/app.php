<?php

use Symfony\Component\HttpFoundation\Request;

$loader = require __DIR__.'/../config/autoload.php';

$kernel = \App\MicroKernel::fromEnvironment();

$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);

<?php

use Symfony\Component\HttpFoundation\Request;

$loader = require __DIR__.'/../app/config/autoload.php';
require_once __DIR__.'/../app/MicroKernel.php';

$kernel = MicroKernel::fromEnvironment();

$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);

<?php

namespace AppBundle\Entity;

interface OgSerializable
{
    public function ogSerialize($locale, $baseUrl);
}

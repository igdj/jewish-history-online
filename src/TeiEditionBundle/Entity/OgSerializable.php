<?php

namespace TeiEditionBundle\Entity;

interface OgSerializable
{
    public function ogSerialize($locale, $baseUrl);
}

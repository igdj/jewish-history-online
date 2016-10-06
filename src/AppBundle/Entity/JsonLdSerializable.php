<?php

namespace AppBundle\Entity;

interface JsonLdSerializable
{
    public function jsonLdSerialize($locale);
}

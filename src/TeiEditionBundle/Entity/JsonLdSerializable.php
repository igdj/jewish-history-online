<?php

namespace TeiEditionBundle\Entity;

interface JsonLdSerializable
{
    public function jsonLdSerialize($locale);
}

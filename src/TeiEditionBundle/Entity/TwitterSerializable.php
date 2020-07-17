<?php

namespace TeiEditionBundle\Entity;

interface TwitterSerializable
{
    public function twitterSerialize($locale, $baseUrl, $params = []);
}

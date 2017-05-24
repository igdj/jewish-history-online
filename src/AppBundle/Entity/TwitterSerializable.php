<?php

namespace AppBundle\Entity;

interface TwitterSerializable
{
    public function twitterSerialize($locale, $baseUrl, $params = []);
}

<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 *
 * @ORM\Entity
 */
class SourceArticle extends Article
{
    public static function buildDateBucket($date)
    {
        // we only care about the year
        if (is_object($date) && $date instanceof \DateTime) {
            $date = $date->format('Y');
        }
        else {
            if (!preg_match('/(\d{4})/', $date, $matches)) {
                return [ $date, $date ];
            }
            $date = $matches[1];
        }
        if ($date < 1900) {
            $bucket = $date - $date % 100; // centuries
            $key = 'epoch.century';
        }
        else {
            $bucket = $date - $date % 10; // decade
            $key = 'epoch.decade';
        }
        return [ $bucket, $key ];
    }

    public function getEpochLabel()
    {
        return self::buildDateBucket($this->dateCreated);
    }
}

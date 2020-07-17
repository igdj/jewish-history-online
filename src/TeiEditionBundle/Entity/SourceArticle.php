<?php

namespace TeiEditionBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 *
 * @ORM\Entity
 */
class SourceArticle
extends Article
{
    /**
     * Gets genre.
     *
     * @return string
     */
    public function getGenre()
    {
        return 'source';
    }

    public static function buildDateBucket($date)
    {
        // we only care about the year
        if (is_object($date) && $date instanceof \DateTime) {
            $date = $date->format('Y');
        }
        else {
            if (!preg_match('/(\-?\d{4})/', $date, $matches)) {
                return [ $date, $date ];
            }

            $date = $matches[1];
        }

        if ($date < 1900) {
            $bucket = $date - $date % 100; // centuries
            if ($date < 0) {
                $key = 'epoch.century-bce';
            }
            else {
                $key = (2 == $bucket / 100) ? 'epoch.century-nd' : 'epoch.century';
            }
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

    public function licenseAllowsDownload()
    {
        // check if we are allowed to download
        $license = $this->getLicense();
        if (!empty($license)
            && in_array($license, [
                '#personal-use',
                '#public-domain',
                'http://creativecommons.org/licenses/by-sa/4.0/',
                'http://creativecommons.org/licenses/by-nc-sa/4.0/',
                'http://creativecommons.org/licenses/by-nc-nd/4.0/',
            ]))
        {
            return true;
        }

        return false;
    }

    public function jsonLdSerialize($locale, $omitContext = false)
    {
        $ret = parent::jsonLdSerialize($locale, $omitContext);
        if (!empty($this->creator)) {
            $ret['creator'] = $this->creator;
        }
        if (!empty($this->dateCreated)) {
            $ret['dateCreated'] = \TeiEditionBundle\Utils\JsonLd::formatDate8601($this->dateCreated);
        }
        if (isset($this->contentLocation)) {
            $ret['contentLocation'] = $this->contentLocation->jsonLdSerialize($locale, true);
        }
        if (isset($this->provider)) {
            $ret['provider'] = $this->provider->jsonLdSerialize($locale, true);
        }

        return $ret;
    }
}

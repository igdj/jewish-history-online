<?php

namespace TeiEditionBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

use FS\SolrBundle\Doctrine\Annotation as Solr;

/**
 * Common logic for alternateName property
 * For Solr-indexing to work, the array keys need to be in a fixed order
 *
 */
trait AlternateNameTrait
{
    protected static $language_preferred_ordered = [ 'de', 'en' ];

    protected static function ensureSortByPreferredLanguages($assoc, $default = null)
    {
        if (is_null($assoc)) {
            $assoc = [];
        }

        foreach (self::$language_preferred_ordered as $lang) {
            if (!array_key_exists($lang, $assoc)) {
                $assoc[$lang] = $default;
            }
        }

        // make sure order is as in $language_preferred_ordered
        uksort($assoc, function($langA, $langB) {
            if ($langA == $langB) {
                return 0;
            }

            $langOrderA = array_search($langA, self::$language_preferred_ordered);
            if (false === $langOrderA) {
                $langOrderA = 99;
            }

            $langOrderB = array_search($langB, self::$language_preferred_ordered);
            if (false === $langOrderB) {
                $langOrderB = 99;
            }

            return ($langOrderA < $langOrderB) ? -1 : 1;
        });

        return $assoc;
    }

    protected static function stripAt($name)
    {
        return preg_replace('/(\s+)@/', '\1', $name);
    }

    /**
     * @var array|null An alias for the item.
     *
     * @ORM\Column(type="json_array", nullable=true)
     * @Solr\Field(type="strings")
     */
    protected $alternateName;

    /**
     * Sets alternateName.
     *
     * @param array|null $alternateName
     *
     * @return $this
     */
    public function setAlternateName($alternateName)
    {
        $this->alternateName = $alternateName;

        return $this;
    }

    /**
     * Gets alternateName.
     *
     * @return array|null
     */
    public function getAlternateName()
    {
        return self::ensureSortByPreferredLanguages($this->alternateName, self::stripAt($this->name));
    }
}

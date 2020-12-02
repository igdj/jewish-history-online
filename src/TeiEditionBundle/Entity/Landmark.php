<?php

namespace TeiEditionBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo; // alias for Gedmo extensions annotations

use Symfony\Component\Validator\Constraints as Assert;

/**
 * An historical landmark or building.
 *
 * @see https://schema.org/LandmarksOrHistoricalBuildings on Schema.org
 *
 * @ORM\Entity
 * @ORM\Table(name="landmark")
 */
class Landmark
extends PlaceBase
{
    use ArticleReferencesTrait;

    /**
     * @var string
     * @ORM\Column(type="string", nullable=true)
     */
    protected $djh;

    /**
     * @ORM\OneToMany(targetEntity="ArticleLandmark",
     *   mappedBy="landmark",
     *   cascade={"persist", "remove"},
     *   orphanRemoval=TRUE
     * )
     */
    protected $articleReferences;

    /**
     * Sets djh.
     *
     * @param string $djh
     *
     * @return $this
     */
    public function setDjh($djh)
    {
        $this->djh = $djh;

        return $this;
    }

    /**
     * Gets djh.
     *
     * @return string
     */
    public function getDjh()
    {
        return $this->djh;
    }

    public function getDefaultZoomlevel()
    {
        return 12;
    }

    /*
     * Overridden to get more concrete type
     */
    protected function getSchemaType()
    {
        return 'LandmarksOrHistoricalBuildings';
    }
}

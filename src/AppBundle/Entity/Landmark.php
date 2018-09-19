<?php

namespace AppBundle\Entity;

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
     * @ORM\OneToMany(targetEntity="ArticleLandmark",
     *   mappedBy="landmark",
     *   cascade={"persist", "remove"},
     *   orphanRemoval=TRUE
     * )
     */
    protected $articleReferences;

    public function getDefaultZoomlevel()
    {
        return 12;
    }

    public function getArticles()
    {
        return $this->articles;
    }

    /*
     * Overridden to get more concrete type
     */
    protected function getSchemaType()
    {
        return 'LandmarksOrHistoricalBuildings';
    }
}

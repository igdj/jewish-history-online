<?php

namespace TeiEditionBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 */
class ArticleLandmark
extends ArticleEntity
{
    /**
     * @ORM\ManyToOne(targetEntity="Landmark", inversedBy="articleReferences")
     * @ORM\JoinColumn(name="entity_id", referencedColumnName="id", nullable=FALSE)
     */
    protected $landmark;

    /**
     * @ORM\ManyToOne(targetEntity="Article", inversedBy="landmarkReferences")
     * @ORM\JoinColumn(name="article_id", referencedColumnName="id", nullable=FALSE)
     */
    protected $article;

    public function setEntity($entity)
    {
        $this->landmark = $entity;
    }

    public function getEntity()
    {
        return $this->landmark;
    }
}

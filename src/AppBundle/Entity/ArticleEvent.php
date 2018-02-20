<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 */
class ArticleEvent
extends ArticleEntity
{
    /**
     * @ORM\ManyToOne(targetEntity="Organization", inversedBy="articleReferences")
     * @ORM\JoinColumn(name="entity_id", referencedColumnName="id", nullable=FALSE)
     */
    protected $event;

    /**
     * @ORM\ManyToOne(targetEntity="Article", inversedBy="organizationReferences")
     * @ORM\JoinColumn(name="article_id", referencedColumnName="id", nullable=FALSE)
     */
    protected $article;

    public function setEntity($entity)
    {
        $this->event = $entity;

        return $this;
    }

    public function getEntity()
    {
        return $this->event;
    }
}

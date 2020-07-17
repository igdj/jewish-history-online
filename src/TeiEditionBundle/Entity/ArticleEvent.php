<?php

namespace TeiEditionBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 */
class ArticleEvent
extends ArticleEntity
{
    /**
     * @ORM\ManyToOne(targetEntity="Event", inversedBy="articleReferences")
     * @ORM\JoinColumn(name="entity_id", referencedColumnName="id", nullable=FALSE)
     */
    protected $event;

    /**
     * @ORM\ManyToOne(targetEntity="Article", inversedBy="eventReferences")
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

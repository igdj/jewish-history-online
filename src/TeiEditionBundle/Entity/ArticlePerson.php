<?php

namespace TeiEditionBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 */
class ArticlePerson
extends ArticleEntity
{
    /**
     * @ORM\ManyToOne(targetEntity="Person", inversedBy="articleReferences")
     * @ORM\JoinColumn(name="entity_id", referencedColumnName="id", nullable=FALSE)
     */
    protected $person;

    /**
     * @ORM\ManyToOne(targetEntity="Article", inversedBy="personReferences")
     * @ORM\JoinColumn(name="article_id", referencedColumnName="id", nullable=FALSE)
     */
    protected $article;

    public function setEntity($entity)
    {
        $this->person = $entity;

        return $this;
    }

    public function getEntity()
    {
        return $this->person;
    }
}

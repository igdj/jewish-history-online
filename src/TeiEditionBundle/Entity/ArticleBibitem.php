<?php

namespace TeiEditionBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 */
class ArticleBibitem
extends ArticleEntity
{
    /**
     * @ORM\ManyToOne(targetEntity="Bibitem", inversedBy="articleReferences")
     * @ORM\JoinColumn(name="entity_id", referencedColumnName="id", nullable=FALSE)
     */
    protected $bibitem;

    /**
     * @ORM\ManyToOne(targetEntity="Article", inversedBy="bibitemReferences")
     * @ORM\JoinColumn(name="article_id", referencedColumnName="id", nullable=FALSE)
     */
    protected $article;

    public function setEntity($entity)
    {
        $this->bibitem = $entity;

        return $this;
    }

    public function getEntity()
    {
        return $this->bibitem;
    }
}

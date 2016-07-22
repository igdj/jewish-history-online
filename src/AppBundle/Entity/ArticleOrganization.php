<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo; // alias for Gedmo extensions annotations

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity
 */
class ArticleOrganization extends ArticleEntity
{
    /**
     * @ORM\ManyToOne(targetEntity="Organization", inversedBy="articleReferences")
     * @ORM\JoinColumn(name="entity_id", referencedColumnName="id", nullable=FALSE)
     */
    protected $organization;

    /**
     * @ORM\ManyToOne(targetEntity="Article", inversedBy="organizationReferences")
     * @ORM\JoinColumn(name="article_id", referencedColumnName="id", nullable=FALSE)
     */
    protected $article;

    public function setEntity($entity)
    {
        $this->organization = $entity;

        return $this;
    }

    public function getEntity()
    {
        return $this->organization;
    }
}

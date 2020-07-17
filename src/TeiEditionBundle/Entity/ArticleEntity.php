<?php

namespace TeiEditionBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo; // alias for Gedmo extensions annotations

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity
 * @ORM\Table(name="article_entity")
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name="type", type="string")
 * @ORM\DiscriminatorMap({
 *   "person" = "ArticlePerson",
 *   "organization" = "ArticleOrganization",
 *   "place" = "ArticlePlace",
 *   "landmark" = "ArticleLandmark",
 *   "event" = "ArticleEvent",
 *   "bibitem" = "ArticleBibitem"
 * })
 */
abstract class ArticleEntity
{
    /**
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue
     */
    protected $id;

    public function setArticle(Article $article)
    {
        $this->article = $article;

        return $this;
    }

    public function getArticle()
    {
        return $this->article;
    }

    abstract public function setEntity($entity);

    abstract public function getEntity();
}

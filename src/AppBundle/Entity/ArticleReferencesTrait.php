<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 *
 *
 */
trait ArticleReferencesTrait
{
    public function getArticleReferences($lang = null)
    {
        if (is_null($this->articleReferences)) {
            return [];
        }

        if (is_null($lang)) {
            return $this->articleReferences->toArray();
        }

        $langCode3 = \AppBundle\Utils\Iso639::code1to3($lang);

        return $this->articleReferences->filter(
            function ($entity) use ($langCode3) {
                return 1 == $entity->getArticle()->getStatus()
                    && $entity->getArticle()->getLanguage() == $langCode3;
            }
        )->toArray();
    }
}

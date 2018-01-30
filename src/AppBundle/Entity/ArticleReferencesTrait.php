<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 *
 *
 */
trait ArticleReferencesTrait
{
    /* Currently simple sort by article title */
    protected function sortArticleReferences($articleReferences)
    {
        usort($articleReferences, function ($a, $b) {
            return strcmp(mb_strtolower($a->getArticle()->getName(), 'UTF-8'),
                          mb_strtolower($b->getArticle()->getName(), 'UTF-8'));
        });

        return $articleReferences;
    }

    public function getArticleReferences($lang = null)
    {
        if (is_null($this->articleReferences)) {
            return [];
        }

        if (is_null($lang)) {
            return $this->articleReferences->toArray();
        }

        $langCode3 = \AppBundle\Utils\Iso639::code1to3($lang);

        return $this->sortArticleReferences($this->articleReferences->filter(
            function ($entity) use ($langCode3) {
                return 1 == $entity->getArticle()->getStatus()
                    && $entity->getArticle()->getLanguage() == $langCode3;
            }
        )->toArray());
    }
}

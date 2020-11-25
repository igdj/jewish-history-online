<?php

namespace TeiEditionBundle\Entity;

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

    public function getArticleReferences($lang = null, $ignoreArticles = null)
    {
        if (is_null($this->articleReferences)) {
            return [];
        }

        if (is_null($lang)) {
            return $this->articleReferences->toArray();
        }

        $langCode3 = \TeiEditionBundle\Utils\Iso639::code1to3($lang);

        $ignoreArticleIds = [];
        if (!is_null($ignoreArticles)) {
            foreach ($ignoreArticles as $article) {
                $ignoreArticleIds[] = $article->getId();
            }
        }

        return $this->sortArticleReferences($this->articleReferences->filter(
            function ($entity) use ($langCode3, $ignoreArticleIds) {
                if (is_null($entity->getArticle())) {
                    // orphaned references, should only happen on manual delete
                    return false;
                }

                if (in_array($entity->getArticle()->getId(), $ignoreArticleIds)) {
                    return false;
                }

                return 1 == $entity->getArticle()->getStatus()
                    && $entity->getArticle()->getLanguage() == $langCode3;
            }
        )->toArray());
    }
}

<?php

/**
 *
 * Shared methods to build Facebook OpenGraph
 *  https://developers.facebook.com/docs/sharing/webmasters#markup
 * and Twitter Cards meta-tags
 *  https://dev.twitter.com/cards/overview
 */

namespace AppBundle\Controller;

trait SharingBuilderTrait
{
    /*
     * transforms en -> en_US and de -> de_DE
     *
     */
    protected function buildOgLocale()
    {
        $locale = $this->getRequest()->getLocale();

        switch ($locale) {
            case 'en':
                $append = 'US';
                break;

            default:
                $append = strtoupper($locale);

        }
        return implode('_', [ $locale, $append ]);
    }

    /**
     * Build og:* meta-tags for sharing on FB
     *
     * Debug through https://developers.facebook.com/tools/debug/sharing/
     *
     */
    public function buildOg($entity, $routeName, $routeParams = [])
    {
        $translator = $this->container->get('translator');
        $twig = $this->container->get('twig');
        $globals = $twig->getGlobals();

        if (empty($routeParams)) {
            $routeParams = [ 'id' => $entity->getId() ];
        }

        $og = [
            'og:site_name' => $translator->trans($globals['siteName']),
            'og:locale' => $this->buildOgLocale(),
            'og:url' => $this->generateUrl($routeName, $routeParams, true),
        ];

        /*
        foreach ($app['app_allowed_locales'] as $locale) {
            $locale_full = $this->buildOgLocale($request, $app, $locale);
            if ($locale_full != $og['og:locale']) {
                if (!isset($og['og:locale:alternate'])) {
                    $og['og:locale:alternate'] = array();
                }
                $og['og:locale:alternate'][] = $locale_full;
            }
        }
        */

        $baseUri = $this->getRequest()->getUriForPath('/');

        if ($entity instanceof \AppBundle\Entity\OgSerializable) {
            $ogEntity = $entity->ogSerialize($this->getRequest()->getLocale(), $baseUri);
            if (isset($ogEntity)) {
                $og = array_merge($og, $ogEntity);
                if (array_key_exists('article:section', $og)) {
                    $og['article:section'] = $translator->trans($og['article:section']);
                }
            }
        }

        if (empty($og['og:image'])) {
            // this one is required
            if ($entity instanceof \AppBundle\Entity\Person) {
                $og['og:image'] = $baseUri . 'img/icon/placeholder_person.png';
            }
            else if ($entity instanceof \AppBundle\Entity\Bibitom) {
                $og['og:image'] = $baseUri . 'img/icon/placeholder_bibitem.png';
            }
            else if ($entity instanceof \AppBundle\Entity\Article) {
                switch ($entity->getArticleSection()) {
                    case 'background':
                        $englishName = \AppBundle\Controller\TopicController::lookupLocalizedTopic($entity->getName(), $translator, $this->getRequest()->getLocale());
                        $slugify = $this->get('cocur_slugify');
                        $imgName = $slugify->slugify($englishName);
                        $og['og:image'] = $baseUri . 'img/topic/' . $imgName . '.jpg';
                        break;

                    case 'interpretation':
                    case 'source':
                        $uidSource = null;

                        if ('source' == $entity->getArticleSection()) {
                            $uidSource = $entity->getUid();
                        }
                        else {
                            // take the first source
                            $related = $this->getDoctrine()
                                ->getRepository('AppBundle:Article')
                                ->findBy([ 'isPartOf' => $entity ],
                                         [ 'dateCreated' => 'ASC', 'name' => 'ASC'],
                                         1);
                            if (count($related) > 0) {
                                $uidSource = $related[0]->getUid();
                            }
                        }

                        if (!is_null($uidSource)) {
                            // check for thumb
                            $thumb = sprintf('viewer/source-%05d/thumb.jpg',
                                             str_replace('jgo:source-', '', $uidSource));

                            if (file_exists($globals['webDir'] . '/' . $thumb)) {
                                $og['og:image'] = $baseUri . $thumb;
                                break;
                            }
                        }
                        // fall-through

                    default:
                        $og['og:image'] = $baseUri . 'img/icon/placeholder_article.png';
                }
            }
        }

        return $og;
    }

    /**
     *
     * Build twitter:* meta-tags for Twitter Decks
     * This can be tested through
     *  http://cards-dev.twitter.com/validator
     *
     */
    public function buildTwitter($entity, $routeName, $routeParams = [], $params = [])
    {
        $twitter = [];

        $twig = $this->container->get('twig');
        $globals = $twig->getGlobals();
        if (empty($globals['twitterSite'])) {
            return $twitter;
        }

        // we don't put @ in parameters.yml since @keydocuments looks like a service
        $twitter['twitter:card'] = 'summary';
        $twitter['twitter:site'] = '@' . $globals['twitterSite'];

        if ($entity instanceof \AppBundle\Entity\TwitterSerializable) {
            $baseUri = $this->getRequest()->getUriForPath('/');
            $twitterEntity = $entity->twitterSerialize($this->getRequest()->getLocale(), $baseUri, $params);
            if (isset($twitterEntity)) {
                $twitter = array_merge($twitter, $twitterEntity);
            }
        }

        return $twitter;
    }
}

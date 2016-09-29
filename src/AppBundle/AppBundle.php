<?php

namespace AppBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

use Presta\SitemapBundle\Event\SitemapPopulateEvent;
use Presta\SitemapBundle\Sitemap\Url\UrlConcrete;

class AppBundle extends Bundle
{
    // see http://stackoverflow.com/a/10473026
    private function startsWith($haystack, $needle)
    {
        // search backwards starting from haystack length characters from the end
        return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== false;
    }

    private function endsWith($haystack, $needle)
    {
        // search forward starting from end minus needle length characters
        return $needle === "" || (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== false);
    }

    private function addUrlDescription(&$urlDescriptions, $key, $routeLocale, $localeUrlDescription)
    {
        if (!array_key_exists($key, $urlDescriptions)) {
            $urlDescriptions[$key] = [];
        }
        $urlDescriptions[$key][$routeLocale] = $localeUrlDescription;
    }

    // see https://github.com/prestaconcept/PrestaSitemapBundle/blob/master/Resources/doc/3-Usage-Quick_and_dirty.md
    public function boot()
    {
        $router = $this->container->get('router');
        $event  = $this->container->get('event_dispatcher');

        $container = $this->container;

        //listen presta_sitemap.populate event
        $event->addListener(
            SitemapPopulateEvent::ON_SITEMAP_POPULATE,
            function (SitemapPopulateEvent $event) use ($router, $container) {
                $locale = $container->get('router.request_context')->getParameter('_locale');

                $urlDescriptions = [];

                foreach ($router->getRouteCollection() as $name => $route) {
                    $defaults = $route->getDefaults();
                    if (!$this->startsWith($defaults['_controller'], 'AppBundle')) {
                        // skip routes from other bundles
                        continue;
                    }
                    if (!array_key_exists('_locale', $defaults)) {
                        continue;
                    }
                    $urlset = 'default';
                    // name is $locale__RG__$routeName
                    $parts = explode('__', $name);
                    $routeName = $parts[count($parts) - 1];
                    if (preg_match('/\{.*?\}/', $route->getPath())) {
                        // handle the ones with parameters

                        /*
                        if ($defaults['_locale'] != $locale) {
                            continue; // TODO: also generate language variants for these
                        }
                        */

                        switch ($routeName) {
                            case 'topic-background':
                                $slugify = $container->get('cocur_slugify');
                                $translator = $container->get('translator');

                                foreach (\AppBundle\Controller\TopicController::$TOPICS as $topic) {
                                    $translator->setLocale($defaults['_locale']);
                                    $url = $router->generate($routeName, [ 'slug' => $slugify->slugify($translator->trans($topic)), '_locale' => $defaults['_locale'] ],
                                                             UrlGeneratorInterface::ABSOLUTE_URL);
                                    $this->addUrlDescription($urlDescriptions, $routeName . $topic, $defaults['_locale'], [ 'url' => $url, 'urlset' => $urlset ]);
                                }
                                break;

                            case 'person':
                            case 'organization':
                                $urlset = $routeName;
                                $qb = $container->get('doctrine')
                                    ->getManager()
                                    ->createQueryBuilder();

                                $qb->select([ 'E' ])
                                    ->from('AppBundle:' . ucfirst($routeName), 'E')
                                    ->where('E.status IN (0,1)')
                                    ;
                                $query = $qb->getQuery();
                                $entities = $query->getResult();
                                foreach ($entities as $entity) {
                                    $gnd = $entity->getGnd();
                                    if (!empty($gnd)) {
                                        $url = $router->generate($routeName . '-by-gnd', [ 'gnd' => $gnd, '_locale' => $defaults['_locale'] ],
                                                                 UrlGeneratorInterface::ABSOLUTE_URL);
                                    }
                                    else {
                                        $url = $router->generate($routeName, [ 'id' => $entity->getId(), '_locale' => $defaults['_locale'] ],
                                                                 UrlGeneratorInterface::ABSOLUTE_URL);
                                    }
                                    $this->addUrlDescription($urlDescriptions, $routeName . $entity->getId(), $defaults['_locale'], [ 'url' => $url, 'urlset' => $urlset ]);
                                }
                                break;

                            case 'place':
                                $urlset = $routeName;
                                $places = $container->get('doctrine')
                                        ->getRepository('AppBundle:Place')
                                        ->findBy([ 'type' => 'inhabited place' ],
                                                 [ 'name' => 'ASC' ]);
                                foreach ($places as $entity) {
                                    $tgn = $entity->getTgn();
                                    if (!empty($tgn)) {
                                        $url = $router->generate($routeName . '-by-tgn', [ 'tgn' => $tgn ],
                                                                 UrlGeneratorInterface::ABSOLUTE_URL);
                                    }
                                    else {
                                        $url = $router->generate($routeName, [ 'id' => $entity->getId() ],
                                                                 UrlGeneratorInterface::ABSOLUTE_URL);
                                    }
                                    $this->addUrlDescription($urlDescriptions, $routeName  . $entity->getId(), $defaults['_locale'], [ 'url' => $url, 'urlset' => $urlset ]);
                                }
                                break;

                            case 'source':
                            case 'article':
                                $urlset = $routeName;
                                $criteria = [
                                    'status' => [ 0, 1 ],
                                    'language' => \AppBundle\Utils\Iso639::code1to3($defaults['_locale']),
                                    'articleSection' => 'article' == $routeName ? 'interpretation' : 'source',
                                ];

                                $qb = $container->get('doctrine')
                                    ->getManager()
                                    ->createQueryBuilder();

                                $qb->select('A')
                                        ->from('AppBundle:Article', 'A')
                                        ;
                                foreach ($criteria as $field => $cond) {
                                    $qb->andWhere('A.' . $field
                                                            . (is_array($cond)
                                                               ? ' IN (:' . $field . ')'
                                                               : '= :' . $field))
                                        ->setParameter($field, $cond);
                                }

                                foreach ($qb->getQuery()->getResult() as $article) {
                                    if ('article' == $routeName) {
                                        $url = $router->generate($routeName, [ 'slug' => $article->getSlug(true), '_locale' => $defaults['_locale'] ],
                                                                 UrlGeneratorInterface::ABSOLUTE_URL);
                                    }
                                    else {
                                        $url = $router->generate($routeName, [ 'uid' => $article->getUid(), '_locale' => $defaults['_locale'] ],
                                                                 UrlGeneratorInterface::ABSOLUTE_URL);
                                    }
                                    $this->addUrlDescription($urlDescriptions, $article->getUid(), $defaults['_locale'], [ 'url' => $url, 'urlset' => $urlset ]);
                                }

                                break;

                            default:
                                continue;
                        }
                    }
                    else {
                        $url = $router->generate($routeName, [ '_locale' => $defaults['_locale'] ], UrlGeneratorInterface::ABSOLUTE_URL);
                        if (!$this->endsWith($url, '/beacon')) {
                            $this->addUrlDescription($urlDescriptions, $routeName, $defaults['_locale'], [ 'url' => $url, 'urlset' => $urlset ]);
                        }
                    }

                }

                foreach ($urlDescriptions as $urlDescription) {
                    if (array_key_exists($locale, $urlDescription)) {
                        $localeUrlDescription = $urlDescription[$locale];
                        $url = new UrlConcrete(
                                $localeUrlDescription['url']
                                //,
                                // TODO: custom settings for lastMode, changeFreq, weight
                                // new \DateTime(),
                                // UrlConcrete::CHANGEFREQ_WEEKLY,
                                // 0.5
                            );

                        $url = new \Presta\SitemapBundle\Sitemap\Url\GoogleMultilangUrlDecorator($url);

                        // add decorations for alternate language versions
                        foreach ($urlDescription as $altLocale => $localeUrlDescription) {
                            if ($altLocale != $locale) {
                                $url->addLink($localeUrlDescription['url'], $altLocale);
                            }
                        }

                        $event->getUrlContainer()->addUrl($url,
                            $localeUrlDescription['urlset']
                        );
                    }
                }
        });
    }
}

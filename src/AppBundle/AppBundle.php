<?php

namespace AppBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

use Presta\SitemapBundle\Event\SitemapPopulateEvent;
use Presta\SitemapBundle\Sitemap\Url\UrlConcrete;

class AppBundle extends Bundle
{
    // see http://stackoverflow.com/a/10473026
    private function startsWith($haystack, $needle) {
        // search backwards starting from haystack length characters from the end
        return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== false;
    }

    private function endsWith($haystack, $needle) {
        // search forward starting from end minus needle length characters
        return $needle === "" || (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== false);
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

                foreach ($router->getRouteCollection() as $name => $route) {
                    $defaults = $route->getDefaults();
                    if (!$this->startsWith($defaults['_controller'], 'AppBundle')) {
                        // skip foreign bundles
                        continue;
                    }
                    if (!array_key_exists('_locale', $defaults)) {
                        continue;
                    }
                    if ($defaults['_locale'] != $locale) {
                        // TODO: alternate language through GoogleMultilangUrlDecorator
                        continue;
                    }
                    $urlset = 'default';
                    $urls = [];
                    if (preg_match('/\{.*?\}/', $route->getPath())) {
                        // handle the ones with parameters
                        // name is $locale__RG__$routeName
                        $parts = explode('__', $name);
                        $routeName = $parts[count($parts) - 1];
                        switch ($routeName) {
                            case 'topic-background':
                                $slugify = $container->get('cocur_slugify');
                                $translator = $container->get('translator');

                                foreach (\AppBundle\Controller\TopicController::$TOPICS as $topic) {
                                    $urls[] = $router->generate($name, [ 'slug' => $slugify->slugify($translator->trans($topic)) ],
                                                                UrlGeneratorInterface::ABSOLUTE_URL);
                                }
                                break;

                            case 'person':
                            case 'organization':
                                $urlset = $routeName;
                                $qb = $container->get('doctrine')
                                    ->getManager()
                                    ->createQueryBuilder();

                                $qb->select([ 'E'                                             ])
                                    ->from('AppBundle:' . ucfirst($routeName), 'E')
                                    ->where('E.status IN (0,1)')
                                    ;
                                $query = $qb->getQuery();
                                $entities = $query->getResult();
                                foreach ($entities as $entity) {
                                    $gnd = $entity->getGnd();
                                    if (!empty($gnd)) {
                                        $urls[] = $router->generate($routeName . '-by-gnd', [ 'gnd' => $gnd ],
                                                                    UrlGeneratorInterface::ABSOLUTE_URL);
                                    }
                                    else {
                                        $urls[] = $router->generate($routeName, [ 'id' => $entity->getId() ],
                                                                    UrlGeneratorInterface::ABSOLUTE_URL);
                                    }
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
                                        $urls[] = $router->generate($routeName . '-by-tgn', [ 'tgn' => $tgn ],
                                                                    UrlGeneratorInterface::ABSOLUTE_URL);
                                    }
                                    else {
                                        $urls[] = $router->generate($routeName, [ 'id' => $entity->getId() ],
                                                                    UrlGeneratorInterface::ABSOLUTE_URL);
                                    }
                                }
                                break;

                            case 'source':
                            case 'article':
                                $urlset = $routeName;
                                $criteria = [
                                    'status' => [ 0, 1 ],
                                    'language' => \AppBundle\Utils\Iso639::code1to3($locale),
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
                                        $urls[] = $router->generate($routeName, [ 'slug' => $article->getSlug(true) ],
                                                                    UrlGeneratorInterface::ABSOLUTE_URL);
                                    }
                                    else {
                                        $urls[] = $router->generate($routeName, [ 'uid' => $article->getUid() ],
                                                                    UrlGeneratorInterface::ABSOLUTE_URL);
                                    }
                                }

                                break;

                            default:
                                continue;
                        }
                    }
                    else {
                        $url = $router->generate($name,[], UrlGeneratorInterface::ABSOLUTE_URL);
                        if (!$this->endsWith($url, '/beacon')) {
                            $urls[] = $url;
                        }
                    }

                    foreach ($urls as $url) {
                        //add $urls to the urlset named default
                        $event->getUrlContainer()->addUrl(
                            new UrlConcrete(
                                $url,
                                // TODO: custom settings for lastMode, changeFreq, weight
                                new \DateTime(),
                                UrlConcrete::CHANGEFREQ_WEEKLY,
                                0.5
                            ),
                            $urlset
                        );

                    }
                }
        });
    }
}

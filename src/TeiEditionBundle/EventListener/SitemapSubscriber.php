<?php

namespace TeiEditionBundle\EventListener;

/**
 * See https://github.com/prestaconcept/PrestaSitemapBundle/blob/master/Resources/doc/4-dynamic-routes-usage.md
 */

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

use Symfony\Contracts\Translation\TranslatorInterface;

use Doctrine\ORM\EntityManagerInterface;

use Cocur\Slugify\SlugifyInterface;

use Presta\SitemapBundle\Event\SitemapPopulateEvent;
use Presta\SitemapBundle\Service\UrlContainerInterface;
use Presta\SitemapBundle\Sitemap\Url\UrlConcrete;

class SitemapSubscriber
implements EventSubscriberInterface
{
    /**
     * @var EntityManager
     */
    private $entityManager;

    /**
     * @var RouterInterface
     */
    private $router;

    /**
     * @var UrlGeneratorInterface
     */
    private $urlGenerator;

    /**
     * @var TranslatorInterface
     */
    private $translator;

    /**
     * @var SlugifyInterface
     */
    private $slugify;

    /**
     * @var ParameterBagInterface
     */
    private $params;

    /**
     * @param UrlGeneratorInterface $urlGenerator
     * @param EntityManagerInterface $entityManager
     */
    public function __construct(EntityManagerInterface $entityManager,
                                RouterInterface $router,
                                UrlGeneratorInterface $urlGenerator,
                                TranslatorInterface $translator,
                                SlugifyInterface $slugify,
                                ParameterBagInterface $params)
    {
        $this->entityManager = $entityManager;
        $this->router = $router;
        $this->urlGenerator = $urlGenerator;
        $this->translator = $translator;
        $this->slugify = $slugify;
        $this->params = $params;
    }

    /**
     * @inheritdoc
     */
    public static function getSubscribedEvents()
    {
        return [
            SitemapPopulateEvent::ON_SITEMAP_POPULATE => 'populate',
        ];
    }

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

    /**
     * @param SitemapPopulateEvent $event
     */
    public function populate(SitemapPopulateEvent $event): void
    {
        $locale = $this->translator->getLocale();

        $urlDescriptions = [];

        foreach ($this->router->getRouteCollection() as $name => $route) {
            $defaults = $route->getDefaults();
            if (!$this->startsWith($defaults['_controller'], 'TeiEditionBundle')) {
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

            if (in_array($routeName, [ 'home-preview', 'labs-index', 'bibliography-unapi', 'search-suggest', 'oai'])) {
                // omit certain routes from sitemap
                continue;
            }

            if (preg_match('/\{.*?\}/', $route->getPath())) {
                // handle the ones with parameters

                switch ($routeName) {
                    case 'topic-background':
                        foreach (\TeiEditionBundle\Controller\TopicController::$TOPICS as $topic) {
                            $this->translator->setLocale($defaults['_locale']);
                            $url = $this->router->generate($routeName, [
                                    'slug' => $this->slugify->slugify(/** @Ignore */ $this->translator->trans($topic)),
                                    '_locale' => $defaults['_locale'],
                                ], UrlGeneratorInterface::ABSOLUTE_URL);
                            $this->addUrlDescription($urlDescriptions, $routeName . $topic, $defaults['_locale'], [ 'url' => $url, 'urlset' => $urlset ]);
                        }
                        break;

                    case 'exhibition':
                        foreach (\TeiEditionBundle\Controller\ExhibitionController::$EXHIBITIONS as $exhibition => $descr) {
                            if (array_key_exists('published', $descr) && !$descr['published']) {
                                continue;
                            }

                            $this->translator->setLocale($defaults['_locale']);
                            $url = $this->router->generate($routeName, [
                                    'slug' => $this->slugify->slugify(/** @Ignore */ $this->translator->trans($exhibition)),
                                    '_locale' => $defaults['_locale'],
                                ], UrlGeneratorInterface::ABSOLUTE_URL);
                            $this->addUrlDescription($urlDescriptions, $routeName . $exhibition, $defaults['_locale'], [ 'url' => $url, 'urlset' => $urlset ]);
                        }
                        break;

                    case 'person':
                    case 'organization':
                        $urlset = $routeName;
                        $qb = $this->entityManager
                            ->createQueryBuilder();

                        $qb->select([ 'E' ])
                            ->from('\TeiEditionBundle\Entity\\' . ucfirst($routeName), 'E')
                            ->where('E.status IN (0,1)')
                            ;
                        $query = $qb->getQuery();
                        $entities = $query->getResult();
                        foreach ($entities as $entity) {
                            $gnd = $entity->getGnd();
                            if (!empty($gnd)) {
                                $url = $this->router->generate($routeName . '-by-gnd', [ 'gnd' => $gnd, '_locale' => $defaults['_locale'] ],
                                                         UrlGeneratorInterface::ABSOLUTE_URL);
                            }
                            else {
                                $url = $this->router->generate($routeName, [ 'id' => $entity->getId(), '_locale' => $defaults['_locale'] ],
                                                         UrlGeneratorInterface::ABSOLUTE_URL);
                            }

                            $this->addUrlDescription($urlDescriptions, $routeName . $entity->getId(), $defaults['_locale'], [ 'url' => $url, 'urlset' => $urlset ]);
                        }
                        break;

                    case 'place':
                        $urlset = $routeName;
                        $places = $this->entityManager
                                ->getRepository('\TeiEditionBundle\Entity\Place')
                                ->findBy([ 'type' => 'inhabited place' ],
                                         [ 'name' => 'ASC' ]);

                        foreach ($places as $entity) {
                            $tgn = $entity->getTgn();
                            if (!empty($tgn)) {
                                $url = $this->router->generate($routeName . '-by-tgn', [ 'tgn' => $tgn, '_locale' => $defaults['_locale'] ],
                                                         UrlGeneratorInterface::ABSOLUTE_URL);
                            }
                            else {
                                $url = $this->router->generate($routeName, [ 'id' => $entity->getId(), '_locale' => $defaults['_locale'] ],
                                                         UrlGeneratorInterface::ABSOLUTE_URL);
                            }

                            $this->addUrlDescription($urlDescriptions, $routeName  . $entity->getId(), $defaults['_locale'], [ 'url' => $url, 'urlset' => $urlset ]);
                        }
                        break;

                    case 'bibliography':
                        $urlset = $routeName;
                        $qb = $this->entityManager
                            ->createQueryBuilder();

                        $qb->select([ 'B' ])
                            ->from('\TeiEditionBundle\Entity\Bibitem', 'B')
                            ->where('B.status IN (0,1)')
                            ;
                        $query = $qb->getQuery();
                        $bibitems = $query->getResult();
                        foreach ($bibitems as $bibitem) {
                            $url = $this->router->generate($routeName, [ 'slug' => $bibitem->getSlug(), '_locale' => $defaults['_locale'] ],
                                                     UrlGeneratorInterface::ABSOLUTE_URL);
                            $this->addUrlDescription($urlDescriptions, $routeName  . $bibitem->getId(), $defaults['_locale'], [ 'url' => $url, 'urlset' => $urlset ]);
                        }
                        break;

                    case 'source':
                    case 'article':
                        $urlset = $routeName;
                        $criteria = [
                            'status' => [ 1 ], // explicit publishing needed
                            'language' => \TeiEditionBundle\Utils\Iso639::code1to3($defaults['_locale']),
                            'articleSection' => 'article' == $routeName ? 'interpretation' : 'source',
                        ];

                        $qb = $this->entityManager
                            ->createQueryBuilder();

                        $qb->select('A')
                                ->from('\TeiEditionBundle\Entity\Article', 'A')
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
                                $url = $this->router->generate($routeName, [ 'slug' => $article->getSlug(true), '_locale' => $defaults['_locale'] ],
                                                         UrlGeneratorInterface::ABSOLUTE_URL);
                            }
                            else {
                                $url = $this->router->generate($routeName, [ 'uid' => $article->getUid(), '_locale' => $defaults['_locale'] ],
                                                         UrlGeneratorInterface::ABSOLUTE_URL);
                            }

                            $this->addUrlDescription($urlDescriptions, $article->getUid(), $defaults['_locale'], [ 'url' => $url, 'urlset' => $urlset ]);
                        }

                        break;

                    default:
                        ; // ignore
                }
            }
            else {
                $url = $this->router->generate($routeName, [
                        '_locale' => $defaults['_locale'],
                    ], UrlGeneratorInterface::ABSOLUTE_URL);

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
    }
}

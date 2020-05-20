<?php

use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\Config\Loader\LoaderInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Routing\RouteCollectionBuilder;

// see https://github.com/ikoene/symfony-micro
class MicroKernel
extends Kernel
{
    /*
     * Set an Environment Variable in Apache Configuration
     *   SetEnv APP_ENVIRONMENT prod
     * for production setting instead of having www/app.php and www/app_dev.php
     * This approach is described in
     *   https://www.pmg.com/blog/symfony-no-app-dev/
     */
    public static function fromEnvironment()
    {
        $env = getenv('APP_ENVIRONMENT');
        if (false === $env) {
            $env = 'dev';
            $debug = true;
        }
        else {
            $debug = filter_var(getenv('APP_DEBUG'), FILTER_VALIDATE_BOOLEAN);
        }

        return new self($env, $debug);
    }

    use MicroKernelTrait;

    /*
     * {@inheritDoc}
     */
    public function registerBundles()
    {
        $bundles = [
            new \Symfony\Bundle\FrameworkBundle\FrameworkBundle(),

            new \Symfony\Bundle\TwigBundle\TwigBundle(),

            new \Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle(),

            new \Doctrine\Bundle\DoctrineBundle\DoctrineBundle(),
            new \Stof\DoctrineExtensionsBundle\StofDoctrineExtensionsBundle(),

            // $slug = $this->get('cocur_slugify')->slugify('Hello World!');
            // see https://github.com/cocur/slugify#user-content-symfony2
            new \Cocur\Slugify\Bridge\Symfony\CocurSlugifyBundle(),

            new \Symfony\Bundle\MonologBundle\MonologBundle(), // required by JMS\TranslationBundle\JMSTranslationBundle

            // translate routes
            new \JMS\I18nRoutingBundle\JMSI18nRoutingBundle(),
            // not required, but recommended for better extraction
            new \JMS\TranslationBundle\JMSTranslationBundle(),

            // https://github.com/a-r-m-i-n/scssphp-bundle
            new \Armin\ScssphpBundle\ScssphpBundle(),

            // menu
            // see http://symfony.com/doc/current/bundles/KnpMenuBundle/index.html
            new \Knp\Bundle\MenuBundle\KnpMenuBundle(),

            // converturls filter
            new \Liip\UrlAutoConverterBundle\LiipUrlAutoConverterBundle(),

            // solr
            new \FS\SolrBundle\FSSolrBundle(),
            new \Knp\Bundle\PaginatorBundle\KnpPaginatorBundle(),

            // sitemap
            new \Presta\SitemapBundle\PrestaSitemapBundle(),

            // rss
            new \Eko\FeedBundle\EkoFeedBundle(),

            // own code
            new \AppBundle\AppBundle(),
        ];

        if (in_array($this->getEnvironment(), [ 'dev', 'test' ], true)) {
            $bundles[] = new \Symfony\Bundle\WebProfilerBundle\WebProfilerBundle();
            $bundles[] = new \Symfony\Bundle\DebugBundle\DebugBundle();
        }

        return $bundles;
    }

    // see https://github.com/symfony/symfony-standard/blob/master/app/AppKernel.php
    public function getCacheDir()
    {
        return dirname(__DIR__).'/var/cache/'.$this->getEnvironment();
    }

    public function getLogDir()
    {
        return dirname(__DIR__).'/var/logs';
    }

    /*
     * we pass this $dir to locateResources
     * so the method will first look for a local bundle-override file named
     * app/Resources/<BundleName>/path/without/Resources
     *
     * @see https://api.symfony.com/2.8/Symfony/Component/HttpKernel/Kernel.html#method_locateResource
     */
    public function getResourcesOverrideDir()
    {
        return realpath($this->getRootDir() . '/../app/Resources');
    }

    /*
     * {@inheritDoc}
     */
    protected function configureContainer(ContainerBuilder $c, LoaderInterface $loader)
    {
        $loader->load(__DIR__ . '/config/config_' . $this->getEnvironment() . '.yml');
        $loader->load(__DIR__ . '/config/services.yml');
    }

    /*
     * {@inheritDoc}
     */
    protected function configureRoutes(RouteCollectionBuilder $routes)
    {
        if (in_array($this->getEnvironment(), [ 'dev', 'test' ], true)) {
            $routes->mount('/_wdt', $routes->import('@WebProfilerBundle/Resources/config/routing/wdt.xml'));
            $routes->mount(
                '/_profiler',
                $routes->import('@WebProfilerBundle/Resources/config/routing/profiler.xml')
            );

            // Preview error pages through /_error/{statusCode}
            //   see http://symfony.com/doc/current/cookbook/controller/error_pages.html
            // Note: not sure why this is mapped to /_error/_error/{code}.{_format} as can be seen by
            //   bin/console debug:router | grep error
            // -> _preview_error  ANY      ANY      ANY    /_error/_error/{code}.{_format}
            $routes->mount(
                '/_error',
                $routes->import('@FrameworkBundle/Resources/config/routing/errors.xml')
            );
        }

        // exports /sitemap.xml
        $routes->mount('/', $routes->import('@PrestaSitemapBundle/Resources/config/routing.yml'));

        // Loading annotated routes
        $routes->mount('/', $routes->import('@AppBundle/Controller', 'annotation'));
    }
}

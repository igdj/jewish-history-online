<?php
// src/TeiEditionBundle/Command/ImportGeoCommand.php

namespace TeiEditionBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\HttpKernel\KernelInterface;

use Symfony\Contracts\Translation\TranslatorInterface;

use Doctrine\ORM\EntityManagerInterface;

use Cocur\Slugify\SlugifyInterface;

use Sylius\Bundle\ThemeBundle\Context\SettableThemeContext;
use Sylius\Bundle\ThemeBundle\Repository\ThemeRepositoryInterface;

use TeiEditionBundle\Utils\ImageMagick\ImageMagickProcessor;
use TeiEditionBundle\Utils\Xsl\XsltProcessor;
use TeiEditionBundle\Utils\XmlFormatter\XmlFormatter;
use TeiEditionBundle\Utils\SimplifyGeojsonProcessor;

/**
 * Import administrative boundaries downloaded from https://mapzen.com/data/borders/.
 */
class ImportGeoCommand
extends BaseCommand
{
    protected $simplifier;

    public function __construct(EntityManagerInterface $em,
                                KernelInterface $kernel,
                                RouterInterface $router,
                                TranslatorInterface $translator,
                                SlugifyInterface $slugify,
                                ParameterBagInterface $params,
                                ThemeRepositoryInterface $themeRepository,
                                SettableThemeContext $themeContext,
                                ?string $siteTheme,
                                ImageMagickProcessor $imagickProcessor,
                                XsltProcessor $xsltProcessor,
                                XmlFormatter $formatter,
                                SimplifyGeojsonProcessor $simplifier
                                )
    {
        parent::__construct($em, $kernel, $router, $translator, $slugify, $params,
                            $themeRepository, $themeContext, $siteTheme,
                            $imagickProcessor,
                            $xsltProcessor, $formatter);

        $this->simplifier = $simplifier;
    }


    protected function configure()
    {
        $this
            ->setName('import:geo')
            ->setDescription('Import Geo Information (Mapzen)')
        ;
    }

    protected function simplify($geometry, $type)
    {
        $precision = 'nation' == $type ? 0.01 : 0.001;

        return $this->simplifier->simplifyGeojson($geometry, $precision);
    }

    protected function processCountry($dir, $geojson)
    {
        $countryCode = $feature = null;
        foreach ($geojson['features'] as $aFeature) {
            if ($aFeature['osm_type'] == 'relation') {
                $feature = $aFeature;
                $countryCode = $feature['properties']['ISO3166-1'];
            }
        }

        if (is_null($countryCode)) {
            return false;
        }

        $country = $this->em->getRepository('TeiEditionBundle\Entity\Place')
            ->findOneBy([ 'countryCode' => $countryCode, 'type' => 'nation' ]);

        if (is_null($country)) {
            return false;
        }

        $additional = $country->getAdditional();
        if (is_null($additional)) {
            $additional = [];
        }

        if (!array_key_exists('boundary', $additional)) {
            $feature['properties'] = [ 'name' => $feature['properties']['name'] ];
            $simplified = $this->simplify([
                'type' => 'FeatureCollection',
                'features' => [
                    $feature
                ],
            ], $country->getType());

            if (!empty($simplified)) {
                $additional['boundary'] = $simplified;
                $country->setAdditional($additional);
                $this->em->persist($country);
                $this->flushEm($this->em);
            }
        }

        $level = in_array($countryCode, [ 'CZ', 'HU' ]) ? 6 : 4;
        $fname = file_exists($dir . '/' . 'admin_level_' . $level . '.reduced.geojson')
            ? $dir . '/' . 'admin_level_' . $level . '.reduced.geojson'
            : $dir . '/' . 'admin_level_' . $level . '.geojson';
        $info = file_get_contents($fname);
        if (false !== $info) {
            $level4geojson = json_decode($info, true);
            if (false !== $level4geojson) {
                foreach ($level4geojson['features'] as $feature) {
                    if ($feature['osm_type'] == 'relation' && !empty($feature['properties']['ISO3166-2']))
                    {
                        $code = $feature['properties']['ISO3166-2'];
                        foreach ($country->getChildren() as $child) {
                            $additional = $child->getAdditional();
                            if (!is_null($additional)
                                && array_key_exists('boundaryCode', $additional)
                                && $additional['boundaryCode'] == $code)
                            {
                                $feature['properties'] = [ 'name' => $feature['properties']['name'] ];
                                $simplified = $this->simplify([
                                    'type' => 'FeatureCollection',
                                    'features' => [
                                        $feature
                                    ],
                                ], $child->getType());

                                if (!empty($simplified)) {
                                    $additional['boundary'] = $simplified;
                                    $child->setAdditional($additional);
                                    $this->em->persist($child);
                                    $this->flushEm($this->em);
                                    unset($additional);
                                    unset($simplified);
                                }
                            }
                        }
                    }
                }
                unset($child);
                unset($level4geojson);
            }
        }

        unset($country);
        $this->em->clear();
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $dir = $this->locateData($fname = 'geo/');

        $fs = new Filesystem();

        if (!$fs->exists($dir)) {
            $output->writeln(sprintf('<error>%s does not exist</error>', $fname));

            return 1;
        }

        $directories = [];
        foreach (new \GlobIterator($dir . '/*') as $subdir) {
            if ($subdir->isDir()) {
                $directories[] = (string)$subdir;
            }
        }

        gc_enable();
        foreach ($directories as $dir) {
            $info = file_get_contents($dir . '/' . 'admin_level_2.geojson');
            if (false === $info) {
                continue;
            }

            $geojson = json_decode($info, true);
            unset($info);
            if (false === $geojson) {
                continue;
            }

            $this->processCountry($dir, $geojson);
            unset($geojson);
            gc_collect_cycles();
        }

        return 0;
    }
}

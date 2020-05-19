<?php
// src/AppBundle/Command/ImportGeoCommand.php

/* boundary download on: https://mapzen.com/data/borders/ */

namespace AppBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\HttpKernel\KernelInterface;

use Doctrine\ORM\EntityManagerInterface;

use Cocur\Slugify\SlugifyInterface;

use AppBundle\Utils\Xsl\XsltProcessor;
use AppBundle\Utils\XmlFormatter\XmlFormatter;
use AppBundle\Utils\SimplifyGeojsonProcessor;

class ImportGeoCommand
extends EntityCommandBase
{
    protected $simplifier;

    public function __construct(EntityManagerInterface $em,
                                KernelInterface $kernel,
                                RouterInterface $router,
                                TranslatorInterface $translator,
                                SlugifyInterface $slugify,
                                ParameterBagInterface $params,
                                \Doctrine\DBAL\Connection $dbconnAdmin,
                                string $rootDir,
                                XsltProcessor $xsltProcessor,
                                XmlFormatter $formatter,
                                SimplifyGeojsonProcessor $simplifier
                                )
    {
        parent::__construct($em, $kernel, $router, $translator, $slugify, $params,
                            $dbconnAdmin, $rootDir, $xsltProcessor, $formatter);

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

        $country = $this->em->getRepository('AppBundle\Entity\Place')
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
                $this->em->flush();
            }
        }

        $level = in_array($countryCode, [ 'CZ', 'HU' ]) ? 6 : 4;
        $fname = file_exists($dir . '/' . 'admin_level_' . $level . '.reduced.geojson')
            ? $dir . '/' . 'admin_level_' . $level . '.reduced.geojson' : $dir . '/' . 'admin_level_' . $level . '.geojson';
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
                                    $this->em->flush();
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
        $dir = $this->rootDir
             . '/Resources/data/geo';

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
    }
}

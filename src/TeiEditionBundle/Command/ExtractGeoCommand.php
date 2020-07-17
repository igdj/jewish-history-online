<?php
// src/TeiEditionBundle/Command/ExtractGeoCommand.php

namespace TeiEditionBundle\Command;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

class ExtractGeoCommand
extends BaseCommand
{
    use \TeiEditionBundle\Utils\RenderTeiTrait;

    protected function configure()
    {
        $this
            ->setName('extract:geo')
            ->setDescription('Extract placeName with ref="geo:..."')
        ;
    }

    /*
     * TODO: maybe move into entity
     */
    protected function buildArticleFnameFromUid($uid, $locale)
    {
        if (preg_match('/(article|source)\-(\d+)/', $uid, $matches)) {
            return sprintf('%s-%05d.%s',
                           $matches[1], $matches[2], $locale);
        }
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $language = 'deu';
        $locale = \TeiEditionBundle\Utils\Iso639::code3to1($language);

        $teiHelper = new MyTeiHelper();

        $articles = $this->em->getRepository('TeiEditionBundle\Entity\Article')
            ->findBy([
                // 'uid' => 'jgo:source-193',
                'language' => $language,
            ],
            [ 'uid' => 'ASC' ])
            ;

        $entitiesByUid = [];
        foreach ($articles as $article) {
            if ('background' == $article->getArticleSection()) {
                $fname = sprintf('%s.%s',
                                 $article->getSlug(), $locale);
            }
            else {
                $fname = $this->buildArticleFnameFromUid($article->getUid(), $locale);
            }

            $fnameFull = $this->locateTeiResource($fname . '.xml');
            if (false === $fnameFull) {
                var_dump($fname);
                continue;
            }

            $entities = $teiHelper->extractGeoEntities($fnameFull);

            if (!empty($entities)) {
                $entitiesByUid[$article->getUid()] = $entities;
            }
        }

        // $output->writeln($this->jsonPrettyPrint($entitiesByUid));

        // we want to make a table
        // coord | label(s) | article(s)
        $entitiesByGeo = [];
        foreach ($entitiesByUid as $uid => $infos) {
            foreach ($infos as $info) {
                if (!array_key_exists($info['geo'], $entitiesByGeo)) {
                    $entitiesByGeo[$info['geo']] = [
                        'text' => [],
                        'uid' => [],
                    ];
                }

                if (!in_array($info['text'], $entitiesByGeo[$info['geo']]['text'])) {
                    $entitiesByGeo[$info['geo']]['text'][] = $info['text'];
                }

                if (!in_array($uid, $entitiesByGeo[$info['geo']]['uid'])) {
                    $entitiesByGeo[$info['geo']]['uid'][] = $uid;
                }
            }
        }

        ksort($entitiesByGeo);
        foreach ($entitiesByGeo as $geo => $info) {
            $status = !preg_match('/^-?\d+\.\d*,-?\d+\.\d*$/', $geo)
                ? 'WARN' : '';

            echo implode("\t", [
                $geo,
                implode('; ', $info['text']),
                implode(', ', $info['uid']),
                $status
            ]) . "\n";
        }

        return 0;
    }
}

class MyTeiHelper
extends \TeiEditionBundle\Utils\TeiHelper
{
    protected function normalizeWhitespace($txt)
    {
        return trim(preg_replace('/\s[\s]+/', ' ', $txt));
    }

    public function extractGeoEntities($fname)
    {
        $input = file_get_contents($fname);
        $reader = new \TeiEditionBundle\Utils\CollectingReader();

        $reader->elementMap = [
            '{http://www.tei-c.org/ns/1.0}placeName' => '\\TeiEditionBundle\\Utils\\CollectingReader::collectElement',
        ];

        $ret = [];
        try {
            $reader->xml($input);
            $output = $reader->parse();
            foreach ($output as $entity) {
                $attribute = '{http://www.tei-c.org/ns/1.0}date' == $entity['name']
                    ? 'corresp' : 'ref';
                if (empty($entity['attributes'][$attribute])) {
                  continue;
                }

                $uri = trim($entity['attributes'][$attribute]);

                $geo = null;
                switch ($entity['name']) {
                    case '{http://www.tei-c.org/ns/1.0}placeName':
                        if (preg_match('/geo\:(.*)/', $uri, $matches)) {
                            $ret[] = [
                                'geo' => $matches[1],
                                'text' => $this->normalizeWhitespace($entity['text']),
                            ];
                        }
                        break;
                }
            }
        }
        catch (\Exception $e) {
            var_dump($e);

            return false;
        }

        return $ret;
    }
}

<?php

// src/AppBundle/Command/ArticleBiblioCommand.php
namespace AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

class ArticleBiblioCommand
extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('article:biblio')
            ->setDescription('Extract Bibliography')
            ->addArgument(
                'file',
                InputArgument::REQUIRED,
                'TEI file'
            )
            ->addOption(
                'insert-missing',
                null,
                InputOption::VALUE_NONE,
                'If set, missing items will be added to Bibitem'
            )
            ->addOption(
                'update',
                null,
                InputOption::VALUE_NONE,
                'If set, an existing item will be updated'
            )
            ->addOption(
                'set-references',
                null,
                InputOption::VALUE_NONE,
                'If set, references between article and items will be set'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $fname = $input->getArgument('file');

        if ('all' == $fname) {
            if (!$input->getOption('update')) {
                $output->writeln(sprintf('<error>all only works in combination with --update</error>', $fname));
                return 1;
            }
            $query = $this->getContainer()->get('doctrine')
                ->getManager()
                ->createQuery('SELECT DISTINCT b.slug FROM AppBundle:Bibitem b WHERE b.status >= 0')
                ;
            $items = array_flip(array_map(function ($res) { return $res['slug']; },
                               array_values($query->getResult())));
        }
        else {
            $fs = new Filesystem();

            if (!$fs->exists($fname)) {
                $output->writeln(sprintf('<error>%s does not exist</error>', $fname));
                return 1;
            }

            $teiHelper = new \AppBundle\Utils\TeiHelper();

            $items = $teiHelper->extractBibitems($fname, $this->getContainer()->get('cocur_slugify'));
        }

        if (false === $items) {
            $output->writeln(sprintf('<error>%s could not be loaded</error>', $fname));
            foreach($teiHelper->getErrors() as $error) {
                $output->writeln(sprintf('<error>  %s</error>', trim($error->message)));
            }

            return 1;
        }

        $em = $this->getContainer()->get('doctrine')->getManager();
        if ($input->getOption('update') || $input->getOption('insert-missing')) {
            foreach ($items as $key => $num) {
                $bibitem = $this->findBibitemBySlug($key);
                if (!is_null($bibitem) && !$input->getOption('update')) {
                    continue;
                }

                // either insert or update
                $zoteroItems = $this->findZoteroItemsBySlug($key, $output);
                if (empty($zoteroItems)) {
                    $output->writeln(sprintf('<error>No Zotero entry found for %s</error>',
                                             trim($key)));
                    continue;
                }
                else if (count($zoteroItems) > 1) {
                    $output->writeln(sprintf('<error>More than one Zotero entry found for %s</error>',
                                             trim($key)));
                    continue;
                }

                $zoteroItem = & $zoteroItems[0];
                if (is_null($bibitem)) {
                    $bibitem = new \AppBundle\Entity\Bibitem();
                    $bibitem->setUid($zoteroItem['zoteroKey']);
                    $bibitem->setSlug($key);
                }
                $zoteroData = json_decode($zoteroItem['zoteroData'], true);

                // var_dump($zoteroData);
                foreach ([
                        'itemType' => 'itemType',
                        'title' => 'name',
                        'bookTitle' => 'containerName',
                        'encyclopediaTitle' => 'containerName',
                        'publicationTitle' => 'containerName',
                        'creators' => 'creators',
                        'series' => 'series',
                        'seriesNumber' => 'seriesNumber',
                        'volume' => 'volume',
                        'numberOfVolumes' => 'numberOfVolumes',
                        'edition' => 'bookEdition',
                        'place' => 'publicationLocation',
                        'publisher' => 'publisher',
                        'date' => 'datePublished',
                        'pages' => 'pagination',
                        'numPages' => 'numberOfPages',
                        'language' => 'language',
                        'DOI' => 'doi',
                        'ISBN' => 'isbn',
                        'url' => 'url',
                    ] as $src => $target)
                {
                    $val = array_key_exists($src, $zoteroData) ? $zoteroData[$src] : null;
                    if (is_null($val) && 'containerName' == $target) {
                        // skip on null since multiple $src can set this
                        continue;
                    }

                    $methodName = 'set' . ucfirst($target);
                    $bibitem->$methodName($val);
                }

                var_dump(json_encode($bibitem));
                $em->persist($bibitem);
                $em->flush();
            }
        }
        else if ($input->getOption('set-references')) {
            $article = $teiHelper->analyzeHeader($fname);

            if (empty($article->uid)) {
                $output->writeln(sprintf('<error>no uid found in %s</error>', $fname));

                return 1;
            }

            if (empty($article->language)) {
                $output->writeln(sprintf('<error>no language found in %s</error>', $fname));

                return 1;
            }

            $em = $this->getContainer()->get('doctrine')->getManager();

            $uid = $article->uid; $language = $article->language;
            $article = $em->getRepository('AppBundle\Entity\Article')
                ->findOneBy([
                    'uid' => $uid,
                    'language' => $language,
                ]);

            if (is_null($article)) {
                $output->writeln(sprintf('<error>no article found for uid %s and language %s</error>',
                                         $uid, $language));

                return 1;
            }

            $persist = false;
            foreach ([ 'bibitem' ] as $type) {
                // clear existing before adding them back
                $method = 'get' . ucfirst($type) . 'References';
                $references = $article->$method();
                if (!empty($references)) {
                    $references->clear();
                    $persist = true;
                }

                foreach ($items as $key => $item) {
                    if ($this->setBibitemReference($article, $key)) {
                        $persist = true;
                    }
                }
            }

            if ($persist) {
                $em->persist($article);
                $em->flush();
                $output->writeln(sprintf('<info>updated article %s</info>', $uid));
            }
        }
        else {
            $output->writeln($this->jsonPrettyPrint($items));
        }
    }

    protected function setBibitemReference($article, $key)
    {
        $entity = $this->findBibitemBySlug($key);
        if (is_null($entity)) {
            return false;
        }

        $entityReference = new \AppBundle\Entity\ArticleBibitem();
        $entityReference->setEntity($entity);
        $article->addBibitemReference($entityReference);

        return true;
    }

    protected function findBibitemBySlug($slug)
    {
        $em = $this->getContainer()->get('doctrine')->getManager();

        return $em->getRepository('AppBundle\Entity\Bibitem')->findOneBySlug($slug);
    }

    protected function findZoteroItemsBySlug($slug, $output)
    {
        $conn = $this->getContainer()->get('doctrine.dbal.admin_connection');

        $sql = "SELECT * FROM Zotero WHERE corresp = :slug AND status >= 0";

        return $conn->fetchAll($sql, [ 'slug' => $slug ]);
    }
}

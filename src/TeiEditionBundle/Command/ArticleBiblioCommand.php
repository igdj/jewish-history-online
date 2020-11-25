<?php
// src/TeiEditionBundle/Command/ArticleBiblioCommand.php

namespace TeiEditionBundle\Command;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

/**
 * Extract bibliographic items from TEI and insert/update into Bibitem.
 */
class ArticleBiblioCommand
extends BaseCommand
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

        $fs = new Filesystem();

        if (!$fs->exists($fname)) {
            $output->writeln(sprintf('<error>%s does not exist</error>', $fname));
            return 1;
        }

        $teiHelper = new \TeiEditionBundle\Utils\TeiHelper();

        $items = $teiHelper->extractBibitems($fname, $this->slugify);

        if (false === $items) {
            $output->writeln(sprintf('<error>%s could not be loaded</error>', $fname));
            foreach ($teiHelper->getErrors() as $error) {
                $output->writeln(sprintf('<error>  %s</error>', trim($error->message)));
            }

            return 1;
        }

        if ($input->getOption('set-references')) {
            $article = $teiHelper->analyzeHeader($fname);

            if (empty($article->uid)) {
                $output->writeln(sprintf('<error>no uid found in %s</error>', $fname));

                return 1;
            }

            if (empty($article->language)) {
                $output->writeln(sprintf('<error>no language found in %s</error>', $fname));

                return 1;
            }

            $uid = $article->uid; $language = $article->language;
            $article = $this->em->getRepository('TeiEditionBundle\Entity\Article')
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
                $this->em->persist($article);
                $this->flushEm($this->em);
                $output->writeln(sprintf('<info>updated article %s</info>', $uid));
            }
        }
        else {
            $output->writeln($this->jsonPrettyPrint($items));
        }

        return 0;
    }

    protected function setBibitemReference($article, $key)
    {
        $entity = $this->findBibitemBySlug($key);
        if (is_null($entity)) {
            return false;
        }

        $entityReference = new \TeiEditionBundle\Entity\ArticleBibitem();
        $entityReference->setEntity($entity);
        $article->addBibitemReference($entityReference);

        return true;
    }

    protected function findBibitemBySlug($slug)
    {
        return $this->em->getRepository('TeiEditionBundle\Entity\Bibitem')->findOneBySlug($slug);
    }
}

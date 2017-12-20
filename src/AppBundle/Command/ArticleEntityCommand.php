<?php

// src/AppBundle/Command/ArticleEntityCommand.php
namespace AppBundle\Command;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

class ArticleEntityCommand extends BaseEntityCommand
{
    protected function configure()
    {
        $this
            ->setName('article:entity')
            ->setDescription('Extract Entities')
            ->addArgument(
                'file',
                InputArgument::REQUIRED,
                'TEI file'
            )
            ->addOption(
                'insert-missing',
                null,
                InputOption::VALUE_NONE,
                'If set, missing entries will be added to person/place/organization'
            )
            ->addOption(
                'set-references',
                null,
                InputOption::VALUE_NONE,
                'If set, references between article and entities will be set'
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

        $teiHelper = new \AppBundle\Utils\TeiHelper();

        $entities = $teiHelper->extractEntities($fname);

        if (false === $entities) {
            $output->writeln(sprintf('<error>%s could not be loaded</error>', $fname));
            foreach($teiHelper->getErrors() as $error) {
                $output->writeln(sprintf('<error>  %s</error>', trim($error->message)));
            }

            return 1;
        }

        if ($input->getOption('insert-missing')) {
            foreach ([ 'person', 'place', 'organization' ] as $type) {
                if (empty($entities[$type])) {
                    continue;
                }

                foreach ($entities[$type] as $uri => $num) {
                    switch ($type) {
                        case 'person':
                            $this->insertMissingPerson($uri);
                            break;

                        case 'place':
                            $this->insertMissingPlace($uri);
                            break;

                        case 'organization':
                            $this->insertMissingOrganization($uri);
                            break;
                    }
                }
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
            foreach ([ 'person', 'place', 'organization' ] as $type) {
                // clear existing before adding them back
                $method = 'get' . ucfirst($type) . 'References';
                $references = $article->$method();
                if (!empty($references)) {
                    $references->clear();
                    $persist = true;
                }

                if (empty($entities[$type])) {
                    continue;
                }

                foreach ($entities[$type] as $uri => $num) {
                    switch ($type) {
                        case 'person':
                            if ($this->setPersonReference($article, $uri)) {
                                $persist = true;
                            }
                            break;

                        case 'place':
                            if ($this->setPlaceReference($article, $uri)) {
                                $persist = true;
                            }
                            break;

                        case 'organization':
                            if ($this->setOrganizationReference($article, $uri)) {
                                $persist = true;
                            }
                            break;
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
            echo json_encode($entities, JSON_PRETTY_PRINT);
        }
    }

    protected function setPersonReference($article, $uri)
    {
        $entity = $this->findPersonByUri($uri);
        if (is_null($entity)) {
            return false;
        }

        $entityReference = new \AppBundle\Entity\ArticlePerson();
        $entityReference->setEntity($entity);
        $article->addPersonReference($entityReference);

        return true;
    }

    protected function setOrganizationReference($article, $uri)
    {
        $entity = $this->findOrganizationByUri($uri);
        if (is_null($entity)) {
            return false;
        }

        $entityReference = new \AppBundle\Entity\ArticleOrganization();
        $entityReference->setEntity($entity);
        $article->addOrganizationReference($entityReference);

        return true;
    }

    protected function setPlaceReference($article, $uri)
    {
        $entity = $this->findPlaceByUri($uri);
        if (is_null($entity)) {
            return false;
        }

        $entityReference = new \AppBundle\Entity\ArticlePlace();
        $entityReference->setEntity($entity);
        $article->addPlaceReference($entityReference);

        return true;
    }
}

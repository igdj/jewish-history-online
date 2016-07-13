<?php

// src/AppBundle/Command/GreetCommand.php
namespace AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
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
        else {
            echo json_encode($entities, JSON_PRETTY_PRINT);
        }
    }

}

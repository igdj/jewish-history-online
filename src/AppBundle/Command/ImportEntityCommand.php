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

class ImportEntityCommand extends BaseEntityCommand
{
    protected function configure()
    {
        $this
            ->setName('import:entity')
            ->setDescription('Import Entities')
            /*->addArgument(
                'file',
                InputArgument::REQUIRED,
                'XLSX file'
            )*/
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $fname = $this->getContainer()->get('kernel')->getRootDir()
               . '/Resources/data/gnd2tgn.xlsx';

        $fs = new Filesystem();

        if (!$fs->exists($fname)) {
            $output->writeln(sprintf('<error>%s does not exist</error>', $fname));
            return 1;
        }

        $file = new \SplFileObject($fname);
        $reader = new \Ddeboer\DataImport\Reader\ExcelReader($file);

        $reader->setHeaderRowNumber(0);

        $entities = [ 'place' => [] ];
        foreach ($reader as $row) {
            $unique_values = array_unique(array_values($row));
            if (1 == count($unique_values) && null === $unique_values[0]) {
                // all values null
                continue;
            }

            if (empty($row['tgn'])) {
                continue;
            }
            $entities['place'][$row['tgn']] = $row;
        }
        foreach ([ 'person', 'place', 'organization' ] as $type) {
            // currently only place
            if (empty($entities[$type])) {
                continue;
            }
            foreach ($entities[$type] as $uri => $additional) {
                switch ($type) {
                    case 'person':
                        $this->insertMissingPerson($uri);
                        break;

                    case 'place':
                        $this->insertMissingPlace($uri, $additional);
                        break;

                    case 'organization':
                        $this->insertMissingOrganization($uri);
                        break;
                }
            }
        }
    }

}

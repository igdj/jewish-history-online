<?php
// src/TeiEditionBundle/Command/ImportGlossaryCommand.php

namespace TeiEditionBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

use Doctrine\ORM\EntityManagerInterface;

use Cocur\Slugify\SlugifyInterface;

/**
 * Import Glossary from data/glossary.xlsx (one line per item and language).
 */
class ImportGlossaryCommand
extends BaseCommand
{
    protected function configure()
    {
        $this
            ->setName('import:glossary')
            ->setDescription('Import Glossary')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $fname = 'glossary.xlsx';

        try {
            $fname = $this->locateData($fname);
        }
        catch (\InvalidArgumentException $e) {
            $output->writeln(sprintf('<error>%s does not exist</error>', $fname));

            return 1;
        }

        $fs = new Filesystem();

        if (!$fs->exists($fname)) {
            $output->writeln(sprintf('<error>%s does not exist</error>', $fname));

            return 1;
        }

        $file = new \SplFileObject($fname);
        $reader = new \Ddeboer\DataImport\Reader\ExcelReader($file);

        $reader->setHeaderRowNumber(0);
        $count = 0;

        $termRepository = $this->em->getRepository('\TeiEditionBundle\Entity\GlossaryTerm');

        foreach ($reader as $row) {
            $unique_values = array_unique(array_values($row));
            if (1 == count($unique_values) && null === $unique_values[0]) {
                // all values null
                continue;
            }

            if (empty($row['term']) || empty($row['language']) || !in_array($row['language'], [ 'deu', 'eng' ])) {
                continue;
            }

            $output->writeln('Insert/Update: ' . $row['term']);

            $term = $termRepository->findOneBy([
                'term' => $row['term'],
                'language' => $row['language'],
            ]);

            if (is_null($term)) {
                $term = new \TeiEditionBundle\Entity\GlossaryTerm();
                $term->setTerm(trim($row['term']));
                $term->setSlug($this->slugify->slugify($term->getTerm()));
                $term->setLanguage($row['language']);
            }

            foreach ($row as $key => $value) {
                switch ($key) {
                    case 'name':
                    case 'headline':
                    case 'description':
                    case 'url':
                        $method = 'set' . ucfirst($key);
                        $term->{$method}($value);
                        break;

                    default:
                        // $output->writeln('Skip : ' . $key);
                }
            }
            $this->em->persist($term);
        }

        $this->flushEm($this->em);

        return 0;
    }
}

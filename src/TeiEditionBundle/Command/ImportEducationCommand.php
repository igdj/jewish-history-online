<?php
// src/TeiEditionBundle/Command/ImportEducationCommand.php

namespace TeiEditionBundle\Command;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

/**
 * Read Education entries from data/education.xlsx and write proper JSON-structure.
 */
class ImportEducationCommand
extends BaseCommand
{
    protected function configure()
    {
        $this
            ->setName('import:education')
            ->setDescription('Import Education Entries')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $fname = 'education.xlsx';

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

        $entriesByTopic = $parent = [];

        $lastEntry = null;
        foreach ($reader as $row) {
            $unique_values = array_unique(array_values($row));

            if (1 == count($unique_values) && null === $unique_values[0]) {
                // all values null
                continue;
            }

            if (empty($row['url'])) {
                continue;
            }

            if (empty($row['topic'])) {
                // sub-entry
                if (!is_null($lastEntry)) {
                    if (!array_key_exists('children', $lastEntry)) {
                        $lastEntry['children'] = [];
                    }

                    $url = $row['url'];
                    if (preg_match('#^https://youtu.be/(.+)#', $url, $matches)) {
                        // we want to embed
                        $url = sprintf('https://www.youtube.com/embed/%s',
                                       $matches[1]);
                    }
                    $child = [
                        'url' => $url,
                        'provider' => $row['provider'],
                    ];

                    if ('GHDI' == $row['provider']) {
                        $child['title'] = [
                            'de' => trim($row['title']),
                            'en' => trim($row['title_en']),
                        ];
                    }

                    if (!empty($row['url_additional'])) {
                        $child['url_additional'] = $row['url_additional'];
                    }

                    $lastEntry['children'][] = $child;
                }
                continue;
            }

            $topic = trim($row['topic']);
            if (!array_key_exists($topic, $entriesByTopic)) {
                $entriesByTopic[$topic] = [];
            }

            $entry = [];
            if (preg_match('/^jgo:/', $row['url'])) {
                // we only need the key, all else will be pulled from the database
                $entry['url'] = $row['url'];
            }
            else if ('Geschichtomat' == $row['provider']) {
                $entry['provider'] = $row['provider'];

                $url = $row['url'];
                if (preg_match('#^https://youtu.be/(.+)#', $url, $matches)) {
                    // we want to embed
                    $url = sprintf('https://www.youtube.com/embed/%s',
                                   $matches[1]);
                }
                $entry['url'] = $url;

                if (!empty($row['url_additional'])) {
                    $entry['url_additional'] = $row['url_additional'];
                }
            }
            else if ('Hamburg-Geschichtsbuch' == $row['provider']) {
                $entry['provider'] = $row['provider'];
                $entry['url'] = $row['url'];
                if (!empty($row['url_additional'])) {
                    $entry['url_additional'] = $row['url_additional'];
                }
            }
            else if ('GHDI' == $row['provider']) {
                $entry['provider'] = $row['provider'];
                $entry['url'] = $row['url'];
                $entry['title'] = [
                    'de' => trim($row['title']),
                    'en' => trim($row['title_en']),
                ];
            }

            if (!empty($entry)) {
               $entriesByTopic[$topic][] = $entry;
               end($entriesByTopic[$topic]);
               $lastEntry = & $entriesByTopic[$topic][key($entriesByTopic[$topic])];
            }
        }

        $output->writeln($this->jsonPrettyPrint($entriesByTopic));

        return 0;
    }
}

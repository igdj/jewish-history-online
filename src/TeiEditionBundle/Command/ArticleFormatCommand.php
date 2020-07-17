<?php
// src/TeiEditionBundle/Command/ArticleFormatCommand.php

namespace TeiEditionBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

use TeiEditionBundle\Utils\XmlFormatter\XmlFormatter;

/**
 * Run XmlFormatter::formatFile() to normalize TEI.
 */
class ArticleFormatCommand
extends Command
{
    protected $formatter;

    public function __construct(XmlFormatter $formatter)
    {
        parent::__construct();

        $this->formatter = $formatter;
    }

    protected function configure()
    {
        $this
            ->setName('article:format')
            ->setDescription('Re-format TEI')
            ->addArgument(
                'file',
                InputArgument::REQUIRED,
                'TEI file'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $fname = $input->getArgument('file');
        $options = [];

        $fs = new Filesystem();

        if (!$fs->exists($fname)) {
            $output->writeln(sprintf('<error>%s does not exist</error>', $fname));

            return 1;
        }

        echo $this->formatter->formatFile($fname, $options);

        return 0;
    }
}

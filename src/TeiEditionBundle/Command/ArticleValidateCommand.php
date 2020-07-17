<?php
// src/TeiEditionBundle/Command/ArticleValidateCommand.php

namespace TeiEditionBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

use Symfony\Component\HttpKernel\KernelInterface;

/**
 * Validate TEI against data/basisformat.rng.
 */
class ArticleValidateCommand
extends BaseCommand
{
    protected function configure()
    {
        $this
            ->setName('article:validate')
            ->setDescription('Validate TEI')
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

        $fs = new Filesystem();

        if (!$fs->exists($fname)) {
            $output->writeln(sprintf('<error>%s does not exist</error>', $fname));

            return 1;
        }

        $teiHelper = new \TeiEditionBundle\Utils\TeiHelper();

        $fnameSchema = $this->locateData('basisformat.rng');

        $result = $teiHelper->validateXml($fname, $fnameSchema);

        if (false === $result) {
            $output->writeln(sprintf('<error>%s is not valid</error>', $fname));
            foreach ($teiHelper->getErrors() as $error) {
                $output->writeln(sprintf('<error>  %s</error>', trim($error->message)));
            }

            return 1;
        }

        $output->writeln(sprintf('<info>%s is valid</info>', $fname));

        return 0;
    }
}

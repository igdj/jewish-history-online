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

class ArticleHeaderCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('article:header')
            ->setDescription('Show Header')
            ->addArgument(
                'file',
                InputArgument::REQUIRED,
                'TEI file'
            )
            /*
            ->addOption(
                'yell',
                null,
                InputOption::VALUE_NONE,
                'If set, the task will yell in uppercase letters'
            )
            */
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

        $article = $teiHelper->analyzeHeader($fname);

        if (false === $article) {
            $output->writeln(sprintf('<error>%s could not be loaded</error>', $fname));
            foreach($teiHelper->getErrors() as $error) {
                $output->writeln(sprintf('<error>  %s</error>', trim($error->message)));
            }
            return 1;
        }

        echo json_encode($article, JSON_PRETTY_PRINT);
        //     $output->writeln($text);
    }
}

<?php
// src/AppBundle/Command/ArticleRefreshCommand.php

namespace AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;

use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\Console\Output\OutputInterface;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

class ArticleRefreshCommand
extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('article:refresh')
            ->setDescription('Meta command to article:adjust / article:header / article:content / articlce:entity / article:biblio ')
            ->addArgument(
                'file',
                InputArgument::REQUIRED,
                'TEI file'
            )
            ->addOption(
                'publish',
                null,
                InputOption::VALUE_NONE,
                'If set, article:publish will be called as well'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        // for calling other commands, see https://symfony.com/doc/3.4/console/calling_commands.html

        $fnameInput = $input->getArgument('file');
        $quiet = $input->getOption('quiet');

        $fs = new Filesystem();

        if (!$fs->exists($fnameInput)) {
            $output->writeln(sprintf('<error>%s does not exist</error>', $fnameInput));

            return 1;
        }

        $basename = pathinfo($fnameInput, PATHINFO_FILENAME);
        if (!preg_match('/\.([a-z]+)$/', $basename, $matches)) {
            $output->writeln(sprintf('<error>%s is missing a language code</error>', $fnameInput));

            return 1;
        }
        $langIso2 = $matches[1];

        $ext = pathinfo($fnameInput, PATHINFO_EXTENSION);
        if ('tei' == $ext) {
            // refresh .xml as well
            $fnameOutput = preg_replace('/\.' . preg_quote($ext, '/') . '$/', '.xml', $fnameInput);

            $command = $this->getApplication()->find('article:adjust');

            $arguments = [
                'command' => 'article:adjust',
                'file' => $fnameInput,
                '--tidy' => null,
            ];

            $adjustInput = new ArrayInput($arguments);
            // we want to catch output
            $bufferedOutput = new BufferedOutput();

            $output->write(sprintf('<info>Running article:adjust %s > %s</info>',
                                   $fnameInput, $fnameOutput));

            $returnCode = $command->run($adjustInput, $bufferedOutput);

            if (0 != $returnCode) {
                $output->writeln('<info> [FAIL]</info>');
                $output->writeln(sprintf('<error>article:adjust on %s failed</error>', $fnameInput));

                return 2;
            }

            $output->writeln('<info> [OK]</info>');

            $outputText = $bufferedOutput->fetch();
            file_put_contents($fnameOutput, $outputText);

            // use .xml for all of the following
            $fnameInput = $fnameOutput;
        }

        $ext = pathinfo($fnameInput, PATHINFO_EXTENSION);
        if ('xml' != $ext) {
            $output->writeln(sprintf('<error>Invalid file extension for %s (must be .xml)</error>',
                                     $fnameInput));

            return 1;
        }

        if (!in_array($langIso2, [ 'de', 'en' ])) {
            // alternate source languages don't have a article-entity that needs to be updated
            return 0;
        }

        $commands = [
            'article:author' => [ '--update' ],
            'article:header' => $input->getOption('publish')
                ? [ '--update', '--publish' ] : [ '--update' ],
            'article:content' => [ '--update' ],
            'article:entity' => [ '--insert-missing', '--set-references' ],
            'article:biblio' => [ '--insert-missing', '--set-references' ],
        ];

        $intermediateOutput = $quiet ? new NullOutput() : $output;
        foreach ($commands as $name => $calls) {
            $command = $this->getApplication()->find($name);

            foreach ($calls as $call) {
                $arguments = [
                    'command' => $name,
                    'file' => $fnameInput,
                    $call => null,
                ];

                $output->write(sprintf('<info>Running %s %s %s: </info>',
                                       $name, $call, $fnameInput));

                $returnCode = $command->run(new ArrayInput($arguments), $intermediateOutput);

                if (0 != $returnCode) {
                    $output->writeln('<error> [FAIL]</error>');

                    return 3;
                }

                $output->writeln('<info> [OK]</info>');
            }
        }
    }

    protected function findUserFromAdminBySlug($slug, $output)
    {
        $conn =  $this->getContainer()->get('doctrine.dbal.admin_connection');

        $sql = "SELECT * FROM User WHERE slug = :slug AND status <> -100";
        $users = $conn->fetchAll($sql, [ 'slug' => $slug ]);
        if (empty($users)) {
            return;
        }

        if (count($users) > 1) {
            $output->writeln(sprintf('<error>More than one user found for %s</error>',
                                     trim($slug)));
        }

        return $users[0];
    }

    protected function findPersonBySlug($slug)
    {
        $em = $this->getContainer()->get('doctrine')->getManager();

        return $em->getRepository('AppBundle\Entity\Person')->findOneBySlug($slug);
    }
}

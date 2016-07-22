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

class ArticleAuthorCommand extends BaseEntityCommand
{
    protected function configure()
    {
        $this
            ->setName('article:author')
            ->setDescription('Extract Author(s) and Translator')
            ->addArgument(
                'file',
                InputArgument::REQUIRED,
                'TEI file'
            )
            ->addOption(
                'insert-missing',
                null,
                InputOption::VALUE_NONE,
                'If set, missing entries will be added to person'
            )
            ->addOption(
                'update',
                null,
                InputOption::VALUE_NONE,
                'If set, an existing person will be updated'
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

        $article = $teiHelper->analyzeHeader($fname);

        if (false === $article) {
            $output->writeln(sprintf('<error>%s could not be loaded</error>', $fname));
            foreach($teiHelper->getErrors() as $error) {
                $output->writeln(sprintf('<error>  %s</error>', trim($error->message)));
            }
            return 1;
        }

        if (empty($article->author)) {
            $output->writeln(sprintf('<info>No author found in %s</info>', $fname));
            return 0;
        }

        $persons = $article->author;
        if (!empty($article->translator)) {
            $persons[] = $article->translator;
        }
        echo json_encode($persons, JSON_PRETTY_PRINT);

        if ($input->getOption('insert-missing')) {
            $em = $this->getContainer()->get('doctrine')->getEntityManager();
            foreach ($persons as $author) {
                $slug = $author->getSlug();
                if (empty($slug)) {
                    $output->writeln(sprintf('<info>Skip author with empty slug in %s</info>', $fname));
                    continue;
                }
                $person = $this->findPersonBySlug($slug);
                if (!is_null($person) && !$input->getOption('update')) {
                    continue;
                }
                // either insert or update
                $user = $this->findUserFromAdminBySlug($slug);
                if (is_null($person)) {
                    if (is_null($user)) {
                        $output->writeln(sprintf('<error>No user found for %s</error>',
                                                 trim($slug)));
                        continue;
                    }
                    if (!empty($user['gnd'])) {
                        $uri = 'http://d-nb.info/gnd/' . $user['gnd'];
                        $this->insertMissingPerson($uri);
                        $person = $this->findPersonByUri($uri);
                    }
                    if (is_null($person)) {
                        $person = new \AppBundle\Entity\Person();
                    }
                    $person->setSlug($slug);
                }
                foreach ([
                           'title' => 'honoricPrefix',
                           'firstname' => 'givenName',
                           'lastname' => 'familyName',
                           'position' => 'jobTitle',
                           'sex' => 'gender',
                           ] as $src => $target) {
                    if (!empty($user[$src])) {
                        $methodName = 'set' . ucfirst($target);
                        $person->$methodName($user[$src]);
                    }
                }
                $description = [];
                if (!empty($user['description_de'])) {
                    $description['de'] = $user['description_de'];
                }
                if (!empty($user['description'])) {
                    $description['en'] = $user['description'];
                }
                $person->setDescription($description);
                // var_dump(json_encode($person));
                $em->persist($person);
                $em->flush();
            }
        }
    }

    protected function findUserFromAdminBySlug($slug)
    {
        $conn =  $this->getContainer()->get('doctrine.dbal.admin_connection');

        $sql = "SELECT * FROM User WHERE slug = :slug AND status <> -1";
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
        $em = $this->getContainer()->get('doctrine')->getEntityManager();
        return $em->getRepository('AppBundle\Entity\Person')->findOneBySlug($slug);
    }

}

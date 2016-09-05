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

use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;

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
            ->addOption(
                'insert-missing',
                null,
                InputOption::VALUE_NONE,
                'If set, a missing article will be added'
            )
            ->addOption(
                'update',
                null,
                InputOption::VALUE_NONE,
                'If set, an existing article will be updated'
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
            foreach ($teiHelper->getErrors() as $error) {
                $output->writeln(sprintf('<error>  %s</error>', trim($error->message)));
            }
            return 1;
        }

        echo json_encode($article, JSON_PRETTY_PRINT);

        if (!($input->getOption('insert-missing') || $input->getOption('update'))) {
            return 0; // done
        }

        if (empty($article->uid)) {
            $output->writeln(sprintf('<error>no uid found in %s</error>', $fname));
            return 1;
        }
        if (empty($article->language)) {
            $output->writeln(sprintf('<error>no language found in %s</error>', $fname));
            return 1;
        }

        $em = $this->getContainer()->get('doctrine')->getEntityManager();

        $entity = $em->getRepository('AppBundle\Entity\Article')
            ->findOneBy([
                         'uid' => $article->uid,
                         'language' => $article->language,
                         ]);
        if (is_null($entity)) {
            if ($input->getOption('insert-missing')) {
                switch ($article->genre) {
                    case 'interpretation':
                    case 'background':
                        $entity = new \AppBundle\Entity\Article();
                        $entity->setArticleSection($article->genre);
                        $entity->setSourceType('Text');
                        break;

                    case 'source':
                        $entity = new \AppBundle\Entity\SourceArticle();
                        $entity->setArticleSection($article->genre);
                        // $entity->setSourceType($article->sourceType);
                        break;

                    default:
                        die('TODO: insert-missing: ' . $article->genre);
                }
            }
            else {
                $output->writeln(sprintf('<error>no entry for uid %s found</error>', $article->uid));
                return 1;
            }
        }
        else if (!$input->getOption('update')) {
            $output->writeln(sprintf('<info>entry for uid %s already exists</info>', $article->uid));
            return 0;
        }

        // TODO: pack the following into custom hydrator
        $normalizer = new ObjectNormalizer();
        // exclude object-properties since arrays would be passed in
        $ignoredAttributes = [ 'datePublished', 'author', 'translator', 'provider', 'contentLocation', 'isPartOf'  ];
        $normalizer->setIgnoredAttributes($ignoredAttributes);
        $serializer = new Serializer([ $normalizer ], [ new JsonEncoder() ]);

        $serializer->deserialize(json_encode($article), get_class($entity), 'json', array('object_to_populate' => $entity));
        foreach ($ignoredAttributes as $attribute) {
            if (!isset($article->$attribute)) {
                continue;
            }

            // \DateTime
            if ('datePublished' == $attribute) {
                $method = 'set' . ucfirst($attribute);
                $entity->$method($article->$attribute);
                continue;
            }

            $related = $article->$attribute;
            $criteria = $key = $value = $repoClass = null;

            switch ($attribute) {
                case 'author':
                    $repoClass = 'Person';
                    $key = 'slug';
                    $value = array_map(
                                       function($related) { return $related->getSlug(); },
                                       $related);
                    break;

                case 'translator':
                    $repoClass = 'Person';
                    $key = 'slug';
                    $value = $related->getSlug();
                    break;

                case 'provider':
                    $repoClass = 'Organization';
                    $key = 'gnd';
                    $value = $related->getGnd();
                    break;

                case 'contentLocation':
                    $repoClass = 'Place';
                    $key = 'tgn';
                    $value = $related->getTgn();
                    break;

                case 'isPartOf';
                    $repoClass = 'Article';
                    $criteria = [
                                  'uid' => $related->getUid(),
                                  'language' => $entity->getLanguage(),
                                  ];
                    break;
            }

            if (is_null($criteria) && isset($key) && !empty($value)) {
                $criteria = [ $key => $value ];
            }

            if (!empty($criteria)) {
                if (is_array($value)) {
                    $methodGet = 'get' . ucfirst($attribute);
                    $currentValues = $entity->$methodGet();
                    foreach ($value as $singleValue) {
                        $criteria = [ $key => $singleValue ];
                        $relatedEntity = $em->getRepository('AppBundle:' . $repoClass)
                            ->findOneBy($criteria);

                        if (!is_null($relatedEntity)
                            && !$currentValues->contains($relatedEntity))
                        {
                            $method = 'add' . ucfirst($attribute);
                            $entity->$method($relatedEntity);
                        }
                    }
                    $currentValues = $entity->$methodGet();
                }
                else {
                    $relatedEntity = $em->getRepository('AppBundle:' . $repoClass)
                        ->findOneBy($criteria);
                    if (!is_null($relatedEntity)) {
                        $method = 'set' . ucfirst($attribute);
                        $entity->$method($relatedEntity);
                    }
                }
            }
        }
        echo json_encode($entity, JSON_PRETTY_PRINT);

        $em->persist($entity);
        $em->flush();
        //     $output->writeln($text);
    }
}

<?php
// src/TeiEditionBundle/Command/ArticleHeaderCommand.php

namespace TeiEditionBundle\Command;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;

/**
 * Lookup article-information from TEI header.
 */
class ArticleHeaderCommand
extends BaseCommand
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
            ->addOption(
                'publish',
                null,
                InputOption::VALUE_NONE,
                'If set, an existing article will be set to published'
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

        $article = $teiHelper->analyzeHeader($fname);

        if (false === $article) {
            $output->writeln(sprintf('<error>%s could not be loaded</error>', $fname));
            foreach ($teiHelper->getErrors() as $error) {
                $output->writeln(sprintf('<error>  %s</error>', trim($error->message)));
            }

            return 1;
        }

        $output->writeln($this->jsonPrettyPrint($article));

        $entity = $this->em->getRepository('TeiEditionBundle\Entity\Article')
            ->findOneBy([
                'uid' => $article->uid,
                'language' => $article->language,
            ]);

        if (is_null($entity)) {
            if ($input->getOption('insert-missing')) {
                switch ($article->genre) {
                    case 'interpretation':
                    case 'background':
                        $entity = new \TeiEditionBundle\Entity\Article();
                        $entity->setArticleSection($article->genre);
                        $entity->setSourceType('Text');
                        break;

                    case 'source':
                        $entity = new \TeiEditionBundle\Entity\SourceArticle();
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
        else if ($input->getOption('insert-missing')) {
            $output->writeln(sprintf('<info>entry for uid %s already exists</info>', $article->uid));

            return 0;
        }

        if ($input->getOption('publish')) {
            $entity->setStatus(1);
            $this->em->persist($entity);

            // set the (non-deleted)sources belonging to this article to publish as well
            $sourceArticles = $this->em->getRepository('\TeiEditionBundle\Entity\Article')
                ->findBy([ 'isPartOf' => $entity  ],
                         [ 'dateCreated' => 'ASC', 'name' => 'ASC']);

            foreach ($sourceArticles as $sourceArticle) {
                if (0 == $sourceArticle->getStatus()) {
                    $sourceArticle->setStatus(1);
                    $this->em->persist($sourceArticle);
                }
            }

            $this->flushEm($this->em);
        }

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

        // TODO: pack the following into custom hydrator
        // exclude object-properties since arrays would be passed in
        $ignoredAttributes = [
            'datePublished', 'dateModified',
            'author', 'translator',
            'provider', 'contentLocation', 'isPartOf',
        ];
        $normalizer = new ObjectNormalizer(null, null, null, null, null, null, [
            AbstractNormalizer::IGNORED_ATTRIBUTES => $ignoredAttributes,
        ]);

        $serializer = new Serializer([ $normalizer ], [ new JsonEncoder() ]);

        $serializer->deserialize(json_encode($article), get_class($entity), 'json', [
            'object_to_populate' => $entity,
        ]);

        foreach ($ignoredAttributes as $attribute) {
            if (in_array($attribute, [ 'datePublished', 'dateModified' ])) {
                // \DateTime
                $method = 'set' . ucfirst($attribute);
                $entity->$method(isset($article->$attribute)
                                 ? $article->$attribute : null);
                continue;
            }

            if (!isset($article->$attribute)) {
                if (in_array($attribute, [ 'translator', 'provider', 'contentLocation' ])) {
                    // clear previously set value
                    // TODO: maybe extend to further properties
                    $method = 'set' . ucfirst($attribute);
                    $entity->$method(null);
                }

                continue;
            }

            $related = $article->$attribute;
            $criteria = $key = $value = $repoClass = null;

            switch ($attribute) {
                case 'author':
                    $repoClass = 'Person';
                    $key = 'slug';
                    $value = array_map(function ($related) { return $related->getSlug(); },
                                       $related);
                    $creator = [];
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
                        $relatedEntity = $this->em->getRepository('\TeiEditionBundle\Entity\\' . $repoClass)
                            ->findOneBy($criteria);

                        if (!is_null($relatedEntity)) {
                            if ('author' == $attribute) {
                                // collect author into creator for quick sorting
                                $creator[] = $relatedEntity->getFullname();
                            }

                            if (!$currentValues->contains($relatedEntity)) {
                                $method = 'add' . ucfirst($attribute);
                                $entity->$method($relatedEntity);
                            }
                        }
                        else {
                            die('TeiEditionBundle:' . $repoClass . '->findOneBy' . json_encode($criteria) . ' failed');
                        }
                    }

                    $currentValues = $entity->$methodGet();
                    if ('author' == $attribute) {
                        $entity->setCreator(join('; ', $creator));
                    }
                }
                else {
                    $relatedEntity = $this->em->getRepository('\TeiEditionBundle\Entity\\' . $repoClass)
                        ->findOneBy($criteria);

                    if (!is_null($relatedEntity)) {
                        $method = 'set' . ucfirst($attribute);
                        $entity->$method($relatedEntity);
                    }
                }
            }
        }

        $output->writeln($this->jsonPrettyPrint($entity));

        $this->em->persist($entity);
        $this->flushEm($this->em);
        // $output->writeln($text);

        return 0;
    }
}

<?php
// src/TeiEditionBundle/Command/ExhibitionHeaderCommand.php

namespace TeiEditionBundle\Command;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;

/**
 * Lookup exhibition-information from Schema.org header.
 */
class ExhibitionHeaderCommand
extends BaseCommand
{
    protected function configure()
    {
        $this
            ->setName('exhibition:header')
            ->setDescription('Show Header')
            ->addArgument(
                'file',
                InputArgument::REQUIRED,
                'HTML file (with <script type="application/ld+json">'
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
                'If set, an existing exhibition will be updated'
            )
            ->addOption(
                'publish',
                null,
                InputOption::VALUE_NONE,
                'If set, an existing exhibition will be set to published'
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

        $html = file_get_contents($fname);
        $dom  = new \DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="utf-8" ?>' . $html); // see https://stackoverflow.com/a/8218649
        libxml_use_internal_errors(false);
        $xpath = new \DOMXpath($dom);

        $jsonScripts = $xpath->query('//script[@type="application/ld+json"]');
        $json = trim($jsonScripts->item(0)->nodeValue);

        $article = json_decode($json);

        if (false === $article) {
            $output->writeln(sprintf('<error>%s could not be loaded or no script-tag found</error>', $fname));

            return 1;
        }

        // set lang / slug from $fname
        $pathinfo = pathinfo($fname);
        if (!preg_match('/(.*)\.(de|en)\.*/', $pathinfo['filename'], $matches)) {
            $output->writeln(sprintf('<error>Slug and language could not be determined from %s</error>', $fname));

            return 1;
        }

        $this->translator->setLocale($matches[2]);

        $article->slug = /** @Ignore */$this->translator->trans($matches[1]);
        $article->language = \TeiEditionBundle\Utils\Iso639::code1to3($matches[2]);
        $article->articleSection = $article->genre;

        for ($i = 0; $i < count($article->author); $i++) {
            $author = $article->author[$i];

            $person = null;
            if (!empty($author->sameAs)) {
                $person = $this->findPersonByUri($uri = $author->sameAs);

                if (is_null($person)) {
                    if (preg_match('/d\-nb\.info\/gnd\/([^\/]*)$/', $uri, $matches)) {
                        $user = $this->findUserFromAdminByGnd($gnd = $matches[1], $output);
                        if (!empty($user)) {
                            $this->insertMissingPerson($uri);
                            $person = $this->findPersonByUri($uri);
                            if (!is_null($person)) {
                                foreach ([
                                        'slug' => 'slug',
                                        'title' => 'honoricPrefix',
                                        'firstname' => 'givenName',
                                        'lastname' => 'familyName',
                                        'position' => 'jobTitle',
                                        'sex' => 'gender',
                                        'url' => 'url',
                                    ] as $src => $target)
                                {
                                    if (!empty($user[$src])) {
                                        if ('url' == $src && preg_match('/^keine/i', $user[$src])) {
                                           $user[$src] = null;
                                        }
                                        $methodName = 'set' . ucfirst($target);
                                        $person->$methodName($user[$src]);
                                    }
                                    else if ('url' == $target) {
                                        // clear url
                                        $methodName = 'set' . ucfirst($target);
                                        $person->$methodName(null);
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
                                $this->em->persist($person);
                                $this->flushEm($this->em);
                            }
                        }
                    }
                }
            }

            if (is_null($person)) {
                die('TODO: Lookup or create matching person' . json_encode($author));
            }

            $article->author[$i] = $person;
        }

        if (!empty($article->translator)) {
            $translator = & $article->translator;

            $person = null;
            if (!empty($this->translator->identifier)) {
                $person = $this->findPersonBySlug($this->translator->identifier);
            }

            if (is_null($person) && !empty($this->translator->sameAs)) {
                $person = $this->findPersonByUri($uri = $this->translator->sameAs);

                if (is_null($person)) {
                    if (preg_match('/d\-nb\.info\/gnd\/([^\/]*)$/', $uri, $matches)) {
                        $user = $this->findUserFromAdminByGnd($gnd = $matches[1], $output);
                        if (!empty($user)) {
                            $this->insertMissingPerson($uri);
                            $person = $this->findPersonByUri($uri);
                        }
                    }
                }
            }

            if (is_null($person)) {
                die('TODO: Lookup or create matching person' . json_encode($translator));
            }

            $article->translator = $person;
        }

        $output->writeln($this->jsonPrettyPrint($article));

        $entity = $this->em->getRepository('TeiEditionBundle\Entity\Article')
            ->findOneBy([
                'slug' => $article->slug,
                'language' => $article->language,
                'articleSection' => $article->genre,
            ]);

        if (is_null($entity)) {
            if ($input->getOption('insert-missing')) {
                switch ($article->genre) {
                    case 'exhibition':
                        $entity = new \TeiEditionBundle\Entity\ExhibitionArticle();
                        $entity->setArticleSection($article->genre);
                        $entity->setSourceType('Text');
                        break;

                    default:
                        die('TODO: insert-missing: ' . $article->genre);
                }
            }
            else {
                $output->writeln(sprintf('<error>no entry for slug %s found</error>', $article->slug));

                return 1;
            }
        }
        else if ($input->getOption('insert-missing')) {
            $output->writeln(sprintf('<info>entry for slug %s already exists</info>', $article->slug));

            return 0;
        }

        if ($input->getOption('publish')) {
            $entity->setStatus(1);
            $this->em->persist($entity);

            $this->flushEm($this->em);
        }

        if (!($input->getOption('insert-missing') || $input->getOption('update'))) {
            return 0; // done
        }

        if (empty($article->uid) && !empty($article->slug)) {
            $article->uid = sprintf('jgo:exhibition-' . $article->slug);
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
        $normalizer = new ObjectNormalizer();
        // exclude object-properties since arrays would be passed in
        $ignoredAttributes = [
            'datePublished', 'dateModified',
            'author', 'translator',
            'provider', 'contentLocation', 'isPartOf',
        ];
        $normalizer->setIgnoredAttributes($ignoredAttributes);
        $serializer = new Serializer([ $normalizer ], [ new JsonEncoder() ]);

        $serializer->deserialize(json_encode($article), get_class($entity), 'json', [
            'object_to_populate' => $entity,
        ]);

        foreach ($ignoredAttributes as $attribute) {
            if (in_array($attribute, [ 'datePublished', 'dateModified' ])) {
                // \DateTime
                $method = 'set' . ucfirst($attribute);
                $entity->$method(isset($article->$attribute) ? new \DateTime($article->$attribute) : null);
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
                    $key = 'gnd';
                    $value = array_map(function ($related) { return $related->getGnd(); },
                                       $related);
                    $creator = [];
                    break;

                case 'translator':
                    $repoClass = 'Person';
                    $key = 'gnd';
                    $value = $related->getGnd();
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
    }

    protected function findPersonBySlug($slug)
    {
        return $this->em->getRepository('TeiEditionBundle\Entity\Person')->findOneBySlug($slug);
    }

    protected function findUserFromAdminByGnd($gnd, $output)
    {
        $sql = "SELECT * FROM User WHERE gnd = :gnd AND status <> -100";

        $users = $this->dbconnAdmin->fetchAll($sql, [ 'gnd' => $gnd ]);
        if (empty($users)) {
            return;
        }

        if (count($users) > 1) {
            $output->writeln(sprintf('<error>More than one user found for %s (IDs %s)</error>',
                                     trim($slug),
                                     join(', ', array_map(function ($user) { return $user['id']; }, $users))));
        }

        return $users[0];
    }
}

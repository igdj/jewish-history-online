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

class ArticleContentCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('article:content')
            ->setDescription('Show Content')
            ->addArgument(
                'file',
                InputArgument::REQUIRED,
                'TEI file'
            )
            /*
            ->addOption(
                'insert-missing',
                null,
                InputOption::VALUE_NONE,
                'If set, a missing article will be added'
            )
            */
            ->addOption(
                'update',
                null,
                InputOption::VALUE_NONE,
                'If set, an existing article will be updated'
            )
        ;
    }

    /* TODO: move the following to a RenderTeiTrait shared with RenderTeiController */
    protected function renderTei($fnameXml, $fnameXslt = 'dtabf_article.xsl', $options = [])
    {
        $kernel = $this->getContainer()->get('kernel');

        $locateResource = !array_key_exists('locateXmlResource', $options)
            || $options['locateXmlResource'];
        if ($locateResource) {
            $pathToXml = $this->locateTeiResource($fnameXml);
            if (false === $pathToXml) {
                return false;
            }
        }
        else {
            $pathToXml = $fnameXml;
        }

        $proc = $this->getContainer()->get('app.xslt');
        $pathToXslt = $kernel->locateResource('@AppBundle/Resources/data/xsl/' . $fnameXslt);
        $res = $proc->transformFileToXml($pathToXml, $pathToXslt, $options);
        return $res;
    }

    function removeByCssSelector($html, $selectorsToRemove)
    {
        $crawler = new \Symfony\Component\DomCrawler\Crawler();
        $crawler->addHtmlContent($html);

        foreach ($selectorsToRemove as $selector) {
            $crawler->filter($selector)->each(function ($crawler) {
                foreach ($crawler as $node) {
                    // var_dump($node);
                    $node->parentNode->removeChild($node);
                }
            });

            /*
            // TODO: switch to reduce - doesn't work yet
            $crawler->filter($selector)->reduce(function ($crawler, $i) {
                return false;

            });
            */
        }

        return $crawler->html();
    }

    protected function html2text($html)
    {
        $html2text = new \Html2Text\Html2Text($html);
        return $html2text->getText();
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
            $output->writeln(sprintf('<error>no article found for %s - %s</error>',
                                     $uid, $language));
            return 1;
        }

        // localize labels in xslt
        $params = [];
        if ($entity instanceof \AppBundle\Entity\Article) {
            $lang = $entity->getLanguage();
            if (!empty($lang)) {
                $params['lang'] = $lang;
            }
        }

        $fnameXslt = 'dtabf_article-printview.xsl';
        switch ($entity->getArticleSection()) {
            case 'interpretation':
                // sourceDescription
                $html = $this->renderTei($fname, 'dtabf_note.xsl',
                                         [ 'params' => $params,
                                           'locateXmlResource' => false ]);
                $description = $this->html2Text($html);
                $entity->setDescription(trim($description));
                break;

            case 'source':
                $fnameXslt = 'dtabf_viewer.xsl';
                break;

            default:
                die('TODO: handle ' . $entity->getArticleSection());
        }

        $html = $this->renderTei($fname,
                                 $fnameXslt,
                                 [ 'params' => $params,
                                   'locateXmlResource' => false ]);

        $html = $this->removeByCssSelector($html,
                                           [ '.fn-intext', '.footnote > .fn-sign', '.gap' ]);

        $text = ltrim(trim($this->html2Text($html)), '*'); // * comes from <li> in authors

        $entity->setText($text);

        echo json_encode($entity, JSON_PRETTY_PRINT);

        if (!($input->getOption('update'))) {
            return 0; // done
        }

        $em->persist($entity);
        $em->flush();
        //     $output->writeln($text);
    }
}

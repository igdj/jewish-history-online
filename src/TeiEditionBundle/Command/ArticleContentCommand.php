<?php
// src/TeiEditionBundle/Command/ArticleContentCommand.php

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
 * Set Article.description as plain-text for Solr indexing.
 */
class ArticleContentCommand
extends BaseCommand
{
    use \TeiEditionBundle\Utils\RenderTeiTrait; // use shared method renderTei()

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
            ->addOption(
                'update',
                null,
                InputOption::VALUE_NONE,
                'If set, an existing article will be updated'
            )
        ;
    }

    protected function html2text($html, $do_links = false)
    {
        $html2text = new \Html2Text\Html2Text($html, [
            'do_links' => is_bool($do_links) && !$do_links
                ? 'none' : 'inline',
            ]);

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

        $teiHelper = new \TeiEditionBundle\Utils\TeiHelper();

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

        $entity = $this->em->getRepository('TeiEditionBundle\Entity\Article')
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
        if ($entity instanceof \TeiEditionBundle\Entity\Article) {
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
                $description = $this->html2Text($html, false);
                $entity->setDescription(trim($description));
                break;

            case 'background':
                // sourceDescription
                $html = $this->renderTei($fname, 'dtabf_summary.xsl',
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

        $output->writeln($this->jsonPrettyPrint($entity));

        if (!($input->getOption('update'))) {
            return 0; // done
        }

        $this->em->persist($entity);
        $this->flushEm($this->em);
        // $output->writeln($text);

        return 0;
    }
}

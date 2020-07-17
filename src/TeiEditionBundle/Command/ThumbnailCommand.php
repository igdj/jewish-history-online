<?php
// src/TeiEditionBundle/Command/ThumbnailCommand.php

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
 * Command that creates a thumbnail for the source.
 */
class ThumbnailCommand
extends BaseCommand
{
    static $widthScaled = 293;
    static $quality = 85;

    protected function configure()
    {
        $this
            ->setName('source:thumbnail')
            ->setDescription('Generate Thumbnail')
            ->addArgument(
                'file',
                InputArgument::REQUIRED,
                'TEI file'
            )
        ;
    }

    protected function registerXpathNamespaces($xml)
    {
        $xml->registerXPathNamespace('tei', 'http://www.tei-c.org/ns/1.0');
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

        $DERIVATE = preg_replace('/\.(de|en)$/', '', pathinfo($fname, PATHINFO_FILENAME));

        $baseDir = realpath($this->getProjectDir());

        $convertArgs = [];

        $facsimile = $teiHelper->getFirstPbFacs($fname);

        if (!empty($facsimile)) {
            $srcPath = sprintf('img/%s', $DERIVATE);

            try {
                $srcDir = $this->locateData($srcPath);
            }
            catch (\InvalidArgumentException $e) {
                $output->writeln(sprintf('<error>%s does not exist</error>', $srcPath));

                return 1;
            }

            $fnameSrc = false;
            foreach ([ '.jpg', '.png', '.pdf' ] as $extension) {
                $fnameFull = $srcDir . '/' . $facsimile . $extension;
                $file = new \Symfony\Component\HttpFoundation\File\File($fnameFull);

                if ($file->isFile()) {
                    $fnameSrc = $file->getFilename();
                    if ('.pdf' == $extension) {
                        $convertArgs[] = '-density 400';
                    }

                    break;
                }
            }

            if (false == $fnameSrc) {
                $output->writeln(sprintf('<error>%s.{jpg|png|pdf} does not exist</error>',
                                         $srcDir . '/' . $facsimile));

                return 1;
            }

            $targetPath = sprintf('web/viewer/%s', $DERIVATE);
            if (!is_dir($baseDir . '/' . $targetPath)) {
                mkdir($baseDir . '/' . $targetPath);
            }
            $targetDir = realpath($baseDir . '/' . $targetPath);
            if (empty($targetDir)) {
                $output->writeln(sprintf('<error>%s could not be created</error>', $targetPath));

                return 1;
            }

            $fnameFull = realpath($srcDir . '/' . $fnameSrc);
            if (!file_exists($fnameFull)) {
                $output->writeln(sprintf('<error>%s does not exist</error>', $fnameFull));

                return 1;
            }
        }
        else {
            switch ($article->sourceType) {
                case 'Text':
                    return 2;
                    break;

                default:
                    $figureFacs = $teiHelper->getFirstFigureFacs($fname);
                    if (empty($figureFacs)) {
                        return 2;
                    }

                    $targetDir = realpath($baseDir . '/' . sprintf('web/viewer/%s', $DERIVATE));

                    $fnameFull = $targetDir . '/' . $figureFacs;

                    if (!file_exists($fnameFull)) {
                        $output->writeln(sprintf('<error>%s does not exist</error>', $fnameFull));

                        return 1;
                    }
            }
        }

        $fnameThumb = $targetDir . DIRECTORY_SEPARATOR . 'thumb.jpg';
        $geom = sprintf('-geometry %dx', self::$widthScaled);

        // for img-optimization
        //  -sampling-factor 4:2:0 -strip -quality 85
        // see https://developers.google.com/speed/docs/insights/OptimizeImages
        $quality = sprintf('-quality %s', self::$quality);

        $convertArgs = array_merge($convertArgs, [
            $this->imagickProcessor->escapeshellarg($fnameFull),
            '-sampling-factor 4:2:0',
            '-strip',
            $quality,
            $geom,
            $this->imagickProcessor->escapeshellarg($fnameThumb)
        ]);

        $this->imagickProcessor->convert($convertArgs);

        return 0;
    }
}

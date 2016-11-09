<?php

// src/AppBundle/Command/ThumbnailCommand.php
namespace AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

class ThumbnailCommand extends ContainerAwareCommand
{
    protected $UPLOAD_PATH2MAGICK = 'C:/Progra~1/ImageMagick-6.9.1-Q16/';
    static $widthScaled = 293;

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

    /* move the following shared methods to common base */
    protected function convertExec($arguments)
    {
        if ($this->getContainer()->hasParameter('imagemagick.path2bin')) {
            $this->UPLOAD_PATH2MAGICK = $this->getContainer()->getParameter('imagemagick.path2bin');
        }

        $cmd = $this->UPLOAD_PATH2MAGICK . 'convert '
             . join(' ', $arguments);
        $ret = exec($cmd, $lines, $retval);
        return $ret;
    }

    function convertEscapeshellarg($arg)
    {
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            // escapeshellarg strips % from windows
            return '"' . addcslashes($arg, '\\"') . '"';
        }
        return escapeshellarg($arg);
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

        $teiHelper = new \AppBundle\Utils\TeiHelper();

        $article = $teiHelper->analyzeHeader($fname);
        if (false === $article) {
            $output->writeln(sprintf('<error>%s could not be loaded</error>', $fname));
            foreach ($teiHelper->getErrors() as $error) {
                $output->writeln(sprintf('<error>  %s</error>', trim($error->message)));
            }
            return 1;
        }

        $baseDir = realpath($this->getContainer()->get('kernel')->getRootDir() . '/..');

        $DERIVATE = preg_replace('/\.(de|en)$/', '', pathinfo($fname, PATHINFO_FILENAME));

        $convert_args = [];

        $facsimile = $teiHelper->getFirstPbFacs($fname);

        if (!empty($facsimile)) {
            $srcPath = sprintf('src/AppBundle/Resources/data/img/%s', $DERIVATE);

            $srcDir = realpath($baseDir . '/' . $srcPath);
            if (empty($srcDir)) {
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
                        $convert_args[] = '-density 400';
                    }
                    break;
                }
            }

            if (false == $fnameSrc) {
                $output->writeln(sprintf('<error>%s.{jpg|png|pdf} does not exist</error>', $srcDir . '/' . $facsimile));
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


        $convert_args = array_merge($convert_args,
                                    [ $this->convertEscapeshellarg($fnameFull),
                                     $geom,
                                     $this->convertEscapeshellarg($fnameThumb) ]);
        $this->convertExec($convert_args);
    }
}

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

class TilesCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('source:tiles')
            ->setDescription('Generate Tiles')
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

        // TODO: get from params
        define('UPLOAD_PATH2MAGICK', 'C:/Progra~1/ImageMagick-6.9.1-Q16/'); // '/usr/X11R6/bin/';
    }

    protected function convertExec($arguments)
    {
        $cmd = UPLOAD_PATH2MAGICK . 'convert '
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

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $fname = $input->getArgument('file');

        $fs = new Filesystem();

        if (!$fs->exists($fname)) {
            $output->writeln(sprintf('<error>%s does not exist</error>', $fname));
            return 1;
        }

        $DERIVATE = preg_replace('/\.(de|en)$/', '', pathinfo($fname, PATHINFO_FILENAME));

        $baseDir = realpath($this->getContainer()->get('kernel')->getRootDir() . '/..');

        $srcPath = sprintf('src/AppBundle/Resources/data/img/%s', $DERIVATE);

        $srcDir = realpath($baseDir . '/' . $srcPath);
        if (empty($srcDir)) {
            $output->writeln(sprintf('<error>%s does not exist</error>', $srcPath));
            return 1;
        }

        $files = [];
        foreach (new \GlobIterator($srcDir . '/f*.jpg') as $file) {
            if ($file->isFile()) {
                $files[] = $file->getFilename();
            }
        }
        foreach (new \GlobIterator($srcDir . '/f*.png') as $file) {
            if ($file->isFile()) {
                $fname = $file->getFilename();
                $fnameJpg = preg_replace('/\.png/i', '.jpg', $fname);
                $convert_args = [ $srcDir . '/' . $fname,
                                  $srcDir . '/' . $fnameJpg ];
                $this->convertExec($convert_args);
                $files[] = $fnameJpg;
            }
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

        foreach ($files as $fname) {
            $fnameFull = realpath($srcDir . '/' . $fname);
            if (!file_exists($fnameFull)) {
                continue;
            }
            $size = @getimagesize($fnameFull);
            if (empty($size)) {
                continue;
            }
            $width = $size[0];
            $height = $size[1];
            $pathinfo = pathinfo($fnameFull);
            // $dirname = $pathinfo['dirname'];
            $fnameBase = $pathinfo['filename'];
            $fnameRel = $pathinfo['basename'];

            $iViewTiler = new \AppBundle\Utils\IViewTiler();
            $zoomMax = $iViewTiler->determineMaxZoom($width, $height);
            $zoomFactor = 1;
            for ($i = $zoomMax; $i >= 0; --$i) {
                if ($zoomFactor > 1) {
                    $widthScaled = round($width / $zoomFactor);
                    $geom = sprintf('-geometry %dx', $widthScaled);
                    $fnameScaled = $targetDir . DIRECTORY_SEPARATOR . $fnameBase . '_' . $i . '.jpg';
                    $convert_args = array($this->convertEscapeshellarg($fnameFull),
                                          $geom,
                                          $this->convertEscapeshellarg($fnameScaled));
                    $this->convertExec($convert_args);
                }
                else {
                    $fnameScaled = $fnameFull;
                }
                $convert_args = array($this->convertEscapeshellarg($fnameScaled),
                                      '-crop 256x256',
                                      '+gravity',
                                      '-set '
                                      . $this->convertEscapeshellarg('filename:tile')
                                      . ' ' . $this->convertEscapeshellarg('%[fx:page.y/256]-%[fx:page.x/256]'),
                                      $this->convertEscapeshellarg($targetDir . DIRECTORY_SEPARATOR
                                                     . $fnameBase
                                                     . '_' . $i
                                                     . '_%[filename:tile].jpg'));
                $this->convertExec($convert_args);

                foreach (glob($targetDir . DIRECTORY_SEPARATOR
                                                     . $fnameBase
                                                     . '_' . $i
                                                     . '_*.jpg') as $tilename)
                {
                    $pathinfo_tile = pathinfo($tilename);
                    if (preg_match('/(\d+)_(\d+)\-(\d+)$/', $pathinfo_tile['filename'], $matches)) {
                        $level = $matches[1];
                        if ($level == $i) {
                            $row = $matches[2];
                            $column = $matches[3];

                            // one directory per row
                            $rowPath = $targetDir
                                . DIRECTORY_SEPARATOR . $fnameRel
                                . DIRECTORY_SEPARATOR . $level
                                . DIRECTORY_SEPARATOR . $row;

                            if (!is_dir($rowPath)) {
                                mkdir($rowPath, 0777, true);
                            }
                            rename($tilename, $rowPath . DIRECTORY_SEPARATOR . $column. '.jpg');
                        }
                    }
                }

                $zoomFactor *= 2;
            }
        }

    }
}
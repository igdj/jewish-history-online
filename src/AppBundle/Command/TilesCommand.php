<?php
// src/AppBundle/Command/TilesCommand.php

namespace AppBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

use Symfony\Component\HttpKernel\KernelInterface;

class TilesCommand
extends Command
{
    protected $kernel;
    protected $imagickProcessor;

    public function __construct(KernelInterface $kernel,
                                \AppBundle\Utils\ImageMagick\ImageMagickProcessor $imagickProcessor)
    {
        parent::__construct();

        $this->kernel = $kernel;
        $this->imagickProcessor = $imagickProcessor;
    }

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

        $DERIVATE = preg_replace('/\.(de|en)$/', '', pathinfo($fname, PATHINFO_FILENAME));

        $baseDir = realpath($this->kernel->getRootDir() . '/..');

        $srcPath = sprintf('@AppBundle/Resources/data/img/%s', $DERIVATE);

        try {
            $srcDir = $this->kernel->locateResource($srcPath, $this->kernel->getResourcesOverrideDir());
        }
        catch (\InvalidArgumentException $e) {
            $output->writeln(sprintf('<error>%s does not exist</error>', $srcPath));

            return 1;
        }

        $files = [];
        foreach (new \GlobIterator($srcDir . '/f*.jpg') as $file) {
            if ($file->isFile()) {
                $files[] = $file->getFilename();
            }
        }

        if (empty($files)) {
            foreach (new \GlobIterator($srcDir . '/f*.png') as $file) {
                if ($file->isFile()) {
                    $fname = $file->getFilename();
                    $fnameJpg = preg_replace('/\.png/i', '.jpg', $fname);
                    $convertArgs = [
                        $srcDir . '/' . $fname,
                        $srcDir . '/' . $fnameJpg,
                    ];
                    $this->imagickProcessor->convert($convertArgs);
                    $files[] = $fnameJpg;
                }
            }

            foreach (new \GlobIterator($srcDir . '/f*.pdf') as $file) {
                if ($file->isFile()) {
                    $fname = $file->getFilename();
                    $fnameJpg = preg_replace('/\.pdf/i', '.jpg', $fname);
                    $convertArgs = [
                        '-density 400',
                        $srcDir . '/' . $fname,
                        $srcDir . '/' . $fnameJpg,
                    ];
                    $this->imagickProcessor->convert($convertArgs);
                    $files[] = $fnameJpg;
                }
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
                    $convertArgs = [
                        $this->imagickProcessor->escapeshellarg($fnameFull),
                        $geom,
                        $this->imagickProcessor->escapeshellarg($fnameScaled)
                    ];

                    $this->imagickProcessor->convert($convertArgs);
                }
                else {
                    $fnameScaled = $fnameFull;
                }

                $convertArgs = [
                    $this->imagickProcessor->escapeshellarg($fnameScaled),
                    '-crop 256x256',
                    '+gravity',
                    '-set ' . $this->imagickProcessor->escapeshellarg('filename:tile')
                    . ' ' . $this->imagickProcessor->escapeshellarg('%[fx:page.y/256]-%[fx:page.x/256]'),
                    $this->imagickProcessor->escapeshellarg($targetDir . DIRECTORY_SEPARATOR
                                                      . $fnameBase
                                                      . '_' . $i
                                                      . '_%[filename:tile].jpg'),
                ];

                $this->imagickProcessor->convert($convertArgs);

                foreach (glob($targetDir . DIRECTORY_SEPARATOR
                              . $fnameBase . '_' . $i . '_*.jpg') as $tilename)
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

        return 0;
    }
}

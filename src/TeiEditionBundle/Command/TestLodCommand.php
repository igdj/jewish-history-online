<?php
// src/TeiEditionBundle/Command/LodTestCommand.php

namespace TeiEditionBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\HttpKernel\KernelInterface;

use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Test.
 */
class TestLodCommand
extends BaseCommand
{
    protected function configure()
    {
        $this
            ->setName('test:lod')
            ->setDescription('Test DnbProvider')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $value = '118529579'; // Einstein
        $bio = \TeiEditionBundle\Utils\BiographicalData::fetchByGnd($value);
        dd($bio);

        $value = '4421561-7';
        $info = \TeiEditionBundle\Utils\CorporateBodyData::fetchByGnd($value);
        dd($info);

        $value = '4137666-3';
        $info = \TeiEditionBundle\Utils\HistoricEventData::fetchByGnd($value);
        dd($info);


        $value = '118529579'; // Einstein
        $bio = \TeiEditionBundle\Utils\BiographicalData::fetchByGnd($value);
        dd($bio);
    }
}

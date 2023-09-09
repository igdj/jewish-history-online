<?php
// src/App/Command/BaseCommand.php

namespace App\Command;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\HttpKernel\KernelInterface;

use Symfony\Contracts\Translation\TranslatorInterface;

use Doctrine\ORM\EntityManagerInterface;

use Cocur\Slugify\SlugifyInterface;

use Sylius\Bundle\ThemeBundle\Context\SettableThemeContext;
use Sylius\Bundle\ThemeBundle\Repository\ThemeRepositoryInterface;

use TeiEditionBundle\Utils\ImageMagick\ImageMagickProcessor;
use TeiEditionBundle\Utils\Xsl\XsltProcessor;
use TeiEditionBundle\Utils\XmlFormatter\XmlFormatter;

/**
 * Shared Base for all Commands.
 */
abstract class BaseCommand
extends \TeiEditionBundle\Command\BaseCommand
{
    protected $dbconnAdmin;

    public function __construct(EntityManagerInterface $em,
                                KernelInterface $kernel,
                                RouterInterface $router,
                                TranslatorInterface $translator,
                                SlugifyInterface $slugify,
                                ParameterBagInterface $params,
                                ThemeRepositoryInterface $themeRepository,
                                SettableThemeContext $themeContext,
                                ?string $siteTheme,
                                ImageMagickProcessor $imagickProcessor,
                                XsltProcessor $xsltProcessor,
                                XmlFormatter $formatter,
                                ?string $publicDir,
                                \Doctrine\DBAL\Connection $dbconnAdmin
                            )
    {
        parent::__construct($em, $kernel, $router, $translator, $slugify, $params,
                            $themeRepository, $themeContext, $siteTheme,
                            $imagickProcessor,
                            $xsltProcessor, $formatter,
                            $publicDir);

        $this->dbconnAdmin = $dbconnAdmin;
    }

    protected function getLocaleCode1()
    {
        // $this->translator->setLocale() appends @translation-domain which we need to get rid of
        return preg_replace('/@.*/', '', $this->translator->getLocale());
    }
}

<?php

// see https://github.com/Sylius/SyliusThemeBundle/blob/master/docs/your_first_theme.md
namespace App\EventListener;

use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;

use Sylius\Bundle\ThemeBundle\Context\SettableThemeContext;
use Sylius\Bundle\ThemeBundle\Repository\ThemeRepositoryInterface;

class ThemeRequestListener
{
    /** @var ThemeRepositoryInterface */
    private $themeRepository;

    /** @var SettableThemeContext */
    private $themeContext;

    private $siteTheme;

    public function __construct(ThemeRepositoryInterface $themeRepository,
                                SettableThemeContext $themeContext,
                                ?string $siteTheme)
    {
        $this->themeRepository = $themeRepository;
        $this->themeContext = $themeContext;
        $this->siteTheme = $siteTheme;
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (HttpKernelInterface::MASTER_REQUEST !== $event->getRequestType()) {
            // don't do anything if it's not the master request
            return;
        }

        if (empty($this->siteTheme)) {
            // no theme set in app.site_theme
            return;
        }

        $theme = $this->themeRepository->findOneByName($this->siteTheme);
        if (!is_null($theme)) {
            $this->themeContext->setTheme($theme);
        }
    }
}

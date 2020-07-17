<?php

/**
 * Shared methods for Controllers
 */

namespace TeiEditionBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\KernelInterface;

use Cocur\Slugify\SlugifyInterface;

use Sylius\Bundle\ThemeBundle\Context\SettableThemeContext;

abstract class BaseController
extends AbstractController
{
    use \TeiEditionBundle\Utils\LocateDataTrait;

    private $kernel;
    private $slugify;
    private $themeContext;
    private $globals = null;

    public function __construct(KernelInterface $kernel,
                                SlugifyInterface $slugify,
                                SettableThemeContext $themeContext)
    {
        $this->kernel = $kernel;
        $this->slugify = $slugify;
        $this->themeContext = $themeContext;
    }

    protected function slugify($string, $options = null)
    {
        return $this->slugify->slugify($string, $options);
    }

    protected function getSlugify()
    {
        return $this->slugify;
    }

    protected function getGlobal($key)
    {
        if (is_null($this->globals)) {
            $this->globals = $this->get('twig')->getGlobals();
        }

        return array_key_exists($key, $this->globals)
            ? $this->globals[$key] : null;
    }
}

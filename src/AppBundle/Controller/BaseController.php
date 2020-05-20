<?php

/**
 * Shared methods for Controllers
 */

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\KernelInterface;

use Cocur\Slugify\SlugifyInterface;

abstract class BaseController
extends AbstractController
{
    private $kernel;
    private $slugify;
    private $globals = null;

    public function __construct(KernelInterface $kernel,
                                SlugifyInterface $slugify)
    {
        $this->kernel = $kernel;
        $this->slugify = $slugify;
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

    protected function locateResource($name, $dir = null, $first = true)
    {
        return $this->kernel->locateResource($name, $dir, $first);
    }

    protected function getResourcesOverrideDir()
    {
        return $this->kernel->getResourcesOverrideDir();
    }

    protected function getRootDir()
    {
        return $this->kernel->getRootDir();
    }

    protected function getProjectDir()
    {
        return $this->kernel->getProjectDir();
    }
}

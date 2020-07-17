<?php

namespace TeiEditionBundle\Utils;

/**
 * Use a trait to share methods for Command and Controller
 *
 * locateData first checks active theme/data and then @TeiEditionBundle/Resources/data
 *
 */
trait LocateDataTrait
{
    private function getDataDirs($append = '/data')
    {
        $ret = [];

        $theme = $this->themeContext->getTheme();
        if (!is_null($theme)) {
            // try to locate from theme-data path
            $ret[] = $theme->getPath() . $append;
        }

        // try to locate from bundle-specific Resources-path
        $ret[] = '@TeiEditionBundle/Resources' . $append;

        return $ret;
    }

    private function locateFile(string $name)
    {
        if ('@' === $name[0]) {
            return $this->kernel->locateResource($name);
        }

        $fnameFull = realpath($name);
        if (false == $fnameFull) {
            throw new \InvalidArgumentException(sprintf('Unable to find file "%s".', $name));
        }

        return $fnameFull;
    }

    protected function locateData($name)
    {
        foreach ($this->getDataDirs() as $prefix) {
            try {
                return $this->locateFile($prefix . '/' . $name);
            }
            catch (\Exception $e) {
                ; // ignore
            }
        }

        throw new \InvalidArgumentException(sprintf('Unable to find "%s".', $name));
    }

    protected function getProjectDir()
    {
        return $this->kernel->getProjectDir();
    }
}

<?php
// src/AppBundle/Twig/AppExtension.php
/*

see http://symfony.com/doc/current/cookbook/templating/twig_extension.html

# app/config/services.yml

services:
    app.twig_extension:
        class: AppBundle\Twig\AppExtension
        public: false
        tags:
            - { name: twig.extension }

*/

namespace AppBundle\Twig;

class AppExtension extends \Twig_Extension
{
    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('dateincomplete', array($this, 'dateincompleteFilter')),
            new \Twig_SimpleFilter('prettifyurl', array($this, 'prettifyurlFilter')),
        );
    }

    public function dateincompleteFilter($datestr)
    {
        $date_parts = preg_split('/\-/', $datestr);
        $date_parts_formatted = array();
        for ($i = 0; $i < count($date_parts); $i++) {
            if (0 == $date_parts[$i]) {
                break;
            }
            $date_parts_formatted[] = $date_parts[$i];
        }
        if (empty($date_parts_formatted)) {
            return '';
        }
        return implode('.', array_reverse($date_parts_formatted));
    }

    public function prettifyurlFilter($url)
    {
        $parsed = parse_url($url);

        return $parsed['host'] . ('/' !== $parsed['path'] ? $parsed['path'] : '');
    }

    public function getName()
    {
        return 'app_extension';
    }
}
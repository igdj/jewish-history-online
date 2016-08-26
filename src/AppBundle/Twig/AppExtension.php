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
    private $translator;

    public function __construct(\Symfony\Component\Translation\TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public function getFilters()
    {
        return array(
            // general
            new \Twig_SimpleFilter('dateincomplete', array($this, 'dateincompleteFilter')),
            new \Twig_SimpleFilter('epoch', array($this, 'epochFilter')),
            new \Twig_SimpleFilter('prettifyurl', array($this, 'prettifyurlFilter')),

            // appbundle-specific
            new \Twig_SimpleFilter('placeTypeLabel', array($this, 'placeTypeLabelFilter')),
            new \Twig_SimpleFilter('lookupLocalizedTopic', array($this, 'lookupLocalizedTopFilter')),
        );
    }

    private function getLocale()
    {
        return $this->translator->getLocale();
    }

    public function dateincompleteFilter($datestr, $locale = null)
    {
        if (is_null($locale)) {
            $locale = $this->getLocale();
        }

        if (is_object($datestr) && $datestr instanceof \DateTime) {
            $datestr = $datestr->format('Y-m-d');
        }

        return \AppBundle\Utils\Formatter::dateIncomplete($datestr, $locale);
    }

    public function epochFilter($epoch, $class, $locale = null)
    {
        if (is_null($locale)) {
            $locale = $this->getLocale();
        }

        return $this->translator->trans($class,
                                 [
                                   '%epoch%' => $epoch,
                                   '%century%' => intval($epoch / 100) + 1,
                                   '%decade%' => $epoch % 100,
                                 ]);
    }

    public function prettifyurlFilter($url)
    {
        $parsed = parse_url($url);

        return $parsed['host'] . (!empty($parsed['path']) && '/' !== $parsed['path'] ? $parsed['path'] : '');
    }


    public function lookupLocalizedTopFilter($topic, $locale = null)
    {
        if (is_null($locale)) {
            $locale = $this->getLocale();
        }
        return \AppBundle\Controller\TopicController::lookupLocalizedTopic($topic, $this->translator, $locale);
    }

    public function placeTypeLabelFilter($placeType, $count = 1, $locale = null)
    {
        if (is_null($locale)) {
            $locale = $this->getLocale();
        }
        return \AppBundle\Entity\Place::buildPluralizedTypeLabel($placeType, $count);
    }

    public function getName()
    {
        return 'app_extension';
    }
}
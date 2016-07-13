<?php
// src/AppBundle/Menu/Builder.php

// see http://symfony.com/doc/current/bundles/KnpMenuBundle/index.html
namespace AppBundle\Menu;

use Knp\Menu\FactoryInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class Builder implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function topMenu(FactoryInterface $factory, array $options)
    {
        // translation will soon handled by template
        // see https://github.com/KnpLabs/KnpMenuBundle/pull/280
        $translator = $this->container->get('translator');

        $menu = $factory->createItem('root');
        if (array_key_exists('position', $options) && 'footer' == $options['position']) {
            $menu->setChildrenAttributes(array('id' => 'menu-top-footer', 'class' => 'small'));
        }
        else {
            $menu->setChildrenAttributes(array('id' => 'menu-top', 'class' => 'list-inline'));
        }

        // add menu items
        $menu->addChild('about',
                        array('label' => $translator->trans('About us'), 'route' => 'about'));
        $menu['about']
            ->addChild('about-staff',
                        array('label' => $translator->trans('Staff', [], 'menu'), 'route' => 'about-staff'));
        $menu['about']
            ->addChild('about-editors',
                        array('label' => $translator->trans('Editors', [], 'menu'), 'route' => 'about-editors'));
        $menu['about']
            ->addChild('about-board',
                       array('label' => $translator->trans('Advisory Board'), 'route' => 'about-board'));
        $menu['about']
            ->addChild('about-sponsors',
                        array('label' => $translator->trans('Sponsors and Partners'), 'route' => 'about-sponsors'));

        $menu->addChild('terms',
                        array('label' => $translator->trans('Terms and Conditions'), 'route' => 'terms'));

        $menu->addChild('contact',
                        array('label' => $translator->trans('Contact'), 'route' => 'contact'));

        return $menu;
    }

    public function mainMenu(FactoryInterface $factory, array $options)
    {
        $breadcrumb_mode = isset($options['position']) && 'breadcrumb' == $options['position'];

        // translation will soon handled by template
        // see https://github.com/KnpLabs/KnpMenuBundle/pull/280
        $translator = $this->container->get('translator');

        $menu = $factory->createItem('home', array('label' => $translator->trans('Home'), 'route' => 'home'));
        if (array_key_exists('position', $options) && 'footer' == $options['position']) {
            $menu->setChildrenAttributes(array('id' => 'menu-main-footer', 'class' => 'small'));
        }
        else {
            $menu->setChildrenAttributes(array('id' => 'menu-main', 'class' => 'list-inline'));
        }

        // add menu item
        $menu->addChild('topic-index', array('label' => $translator->trans('Topics'), 'route' => 'topic-index'));
        $menu->addChild('place-map', array('label' => $translator->trans('Map'), 'route' => 'place-map'));
        $menu->addChild('date-chronology', array('label' => $translator->trans('Chronology'), 'route' => 'date-chronology'));
        $menu->addChild('_lookup', array('label' => $translator->trans('Look-up'), 'uri' => '#'))
            ->setAttribute('dropdown', true);
        $menu['_lookup']
            ->addChild('person-index',
                        array('label' => $translator->trans('Persons'), 'route' => 'person-index'));
        $menu['_lookup']
            ->addChild('place-index',
                        array('label' => $translator->trans('Places'), 'route' => 'place-index'));
        $menu['_lookup']
            ->addChild('organization-index',
                        array('label' => $translator->trans('Organizations'), 'route' => 'organization-index'));
        $menu['_lookup']
            ->addChild('glossary-index',
                        array('label' => $translator->trans('Glossary'), 'route' => 'glossary-index'));

        if (!(array_key_exists('position', $options) && 'footer' == $options['position'])) {
            $menu['topic-index']->setAttribute('id', 'menu-item-topic');
            $menu['place-map']->setAttribute('id', 'menu-item-map');
            $menu['date-chronology']->setAttribute('id', 'menu-item-chronology');
            $menu['_lookup']->setAttribute('id', 'menu-item-lookup');

            // find the matching parent
            // TODO: maybe use a voter
            $uri_current = $this->container->get('request')->getRequestUri();

            // create the iterator
            $itemIterator = new \Knp\Menu\Iterator\RecursiveItemIterator($menu);

            // iterate recursively on the iterator
            $iterator = new \RecursiveIteratorIterator($itemIterator, \RecursiveIteratorIterator::SELF_FIRST);

            foreach ($iterator as $item) {
                $uri = $item->getUri();
                if (substr($uri_current, 0, strlen($uri)) === $uri) {
                    $item->setCurrent(true);
                    break;
                }
            }
        }

        return $menu;
    }

    public function breadcrumbMenu(FactoryInterface $factory, array $options)
    {
        $menu = $this->mainMenu($factory, $options + [ 'position' => 'breadcrumb' ]);

        // try to return the active item
        $current_route = $this->container->get('request')->get('_route');
        if ('home' == $current_route) {
            return $menu;
        }

        // first level
        $item = $menu[$current_route];
        if (isset($item)) {
            return $item;
        }

        // additional routes
        switch ($current_route) {
            case 'about':
            case 'terms':
            case 'contact':
                $toplevel = $this->topMenu($factory, []);
                $item = $toplevel[$current_route];
                $item->setParent(null);
                $item = $menu->addChild($item);
                break;

            case 'about-staff':
            case 'about-editors':
            case 'about-board':
            case 'about-sponsors':
                $toplevel = $this->topMenu($factory, []);
                $item = $toplevel['about'];
                $item->setParent(null);
                $menu->addChild($item);
                $item = $item[$current_route];
                break;

            case 'topic-background':
                $item = $menu['topic-index']->addChild($current_route, array('label' => 'Survey', 'uri' => '#'));
                break;

            case 'article':
                $item = $menu->addChild($current_route, array('label' => 'Article'));
                break;

            case 'source':
                $item = $menu->addChild($current_route, array('label' => 'Source'));
                break;

            case 'person-index':
            case 'place-index':
            case 'organization-index':
            case 'glossary-index':
                $item = $menu['_lookup'][$current_route];
                break;

            case 'person':
            case 'person-by-gnd':
                $item = $menu['_lookup']['person-index'];
                $item = $item->addChild($current_route, array('label' => 'Detail', 'uri' => '#'));
                break;

            case 'place':
            case 'place-by-tgn':
                $item = $menu['_lookup']['place-index'];
                $item = $item->addChild($current_route, array('label' => 'Detail', 'uri' => '#'));
                break;

            case 'organization':
            case 'organization-by-gnd':
                $item = $menu['_lookup']['organization-index'];
                $item = $item->addChild($current_route, array('label' => 'Detail', 'uri' => '#'));
                break;

            default:
                var_dump($current_route);
        }
        if (isset($item)) {
            $item->setCurrent(true);
            return $item;
        }
        return $menu;
    }

}

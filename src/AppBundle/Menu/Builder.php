<?php
// src/AppBundle/Menu/Builder.php

// see http://symfony.com/doc/current/bundles/KnpMenuBundle/index.html
namespace AppBundle\Menu;

use Knp\Menu\FactoryInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class Builder
implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function topMenu(FactoryInterface $factory, array $options)
    {
        // translation will soon handled by template
        // see https://github.com/KnpLabs/KnpMenuBundle/pull/280
        $translator = $this->container->get('translator');

        $menu = $factory->createItem('root');
        if (array_key_exists('position', $options) && 'footer' == $options['position']) {
            $menu->setChildrenAttributes([ 'id' => 'menu-top-footer', 'class' => 'small' ]);
        }
        else {
            $menu->setChildrenAttributes([ 'id' => 'menu-top', 'class' => 'list-inline' ]);
        }

        // add menu items
        if (!array_key_exists('part', $options) || 'left' == $options['part']) {
            $menu->addChild('about', [
                'label' => $translator->trans('About this edition'),
                'route' => 'about',
            ]);
            $menu['about']
                ->addChild('about-goals', [
                    'label' => $translator->trans('Goals', [], 'menu'), 'route' => 'about-goals',
                ]);
            $menu['about']
                ->addChild('about-keydocuments', [
                    'label' => $translator->trans('Key Documents', [], 'menu'), 'route' => 'about-keydocuments',
                ]);
            $menu['about']
                ->addChild('about-audience', [
                    'label' => $translator->trans('Target Audience', [], 'menu'), 'route' => 'about-audience',
                ]);
            $menu['about']
                ->addChild('about-usage', [
                    'label' => $translator->trans('How to Use this Edition', [], 'menu'), 'route' => 'about-usage',
                ]);
            $menu['about']
                ->addChild('about-editorialmodel', [
                    'label' => $translator->trans('Editorial Model', [], 'menu'), 'route' => 'about-editorialmodel',
                ]);
            $menu['about']
                ->addChild('about-editionguidelines', [
                    'label' => $translator->trans('Edition and Edition Guidelines', [], 'menu'), 'route' => 'about-editionguidelines',
                ]);
            $menu['about']
                ->addChild('about-implementation', [
                    'label' => $translator->trans('Technical Implementation', [], 'menu'), 'route' => 'about-implementation',
                ]);
            $menu['about']
                ->addChild('about-publications', [
                    'label' => $translator->trans('Presentations and Publications', [], 'menu'), 'route' => 'about-publications',
                ]);
        }

        if (!array_key_exists('part', $options) || 'right' == $options['part']) {
            $menu->addChild('about-us', [
                'label' => $translator->trans('About us'), 'route' => 'about-staff',
            ]);
            $menu['about-us']
                ->addChild('about-staff', [
                    'label' => $translator->trans('Staff', [], 'menu'), 'route' => 'about-staff',
                ]);
            $menu['about-us']
                ->addChild('about-editors', [
                    'label' => $translator->trans('Editors', [], 'menu'), 'route' => 'about-editors',
                ]);
            $menu['about-us']
                ->addChild('about-authors', [
                    'label' => $translator->trans('Authors', [], 'menu'), 'route' => 'about-authors',
                ]);
            $menu['about-us']
                ->addChild('about-board', [
                    'label' => $translator->trans('Advisory Board'), 'route' => 'about-board',
                ]);
            $menu['about-us']
                ->addChild('about-sponsors', [
                    'label' => $translator->trans('Sponsors and Partners'), 'route' => 'about-sponsors',
                ]);
            $menu['about-us']
                ->addChild('about-news', [
                    'label' => $translator->trans('Project News'), 'route' => 'about-news',
                ]);

            $menu->addChild('terms', [
                'label' => $translator->trans('Terms and Conditions'), 'route' => 'terms',
            ]);

            $menu->addChild('contact', [
                'label' => $translator->trans('Contact'), 'route' => 'contact',
            ]);

            if (array_key_exists('position', $options) && 'footer' == $options['position']) {
                $router = $this->container->get('router');

                $menu['contact']->addChild('imprint', [
                    'label' => $translator->trans('Imprint'),
                    'uri' => $router->generate('contact') . '#imprint',
                ]);
                $menu['contact']->addChild('dataprotection', [
                    'label' => $translator->trans('Data Protection'),
                    'uri' => $router->generate('contact') . '#dataprotection',
                ]);
            }
        }

        return $menu;
    }

    public function mainMenu(FactoryInterface $factory, array $options)
    {
        $breadcrumb_mode = isset($options['position']) && 'breadcrumb' == $options['position'];

        // translation will soon handled by template
        // see https://github.com/KnpLabs/KnpMenuBundle/pull/280
        $translator = $this->container->get('translator');

        $menu = $factory->createItem('home', [ 'label' => $translator->trans('Home'), 'route' => 'home' ]);
        if (array_key_exists('position', $options) && 'footer' == $options['position']) {
            $menu->setChildrenAttributes([ 'id' => 'menu-main-footer', 'class' => 'small' ]);
        }
        else {
            $menu->setChildrenAttributes([ 'id' => 'menu-main', 'class' => 'list-inline' ]);
        }

        // add menu item
        $menu->addChild('topic-index', [ 'label' => $translator->trans('Topics'), 'route' => 'topic-index' ]);
        $menu->addChild('place-map', [ 'label' => $translator->trans('Map'), 'route' => 'place-map' ]);
        $menu->addChild('date-chronology', [ 'label' => $translator->trans('Chronology'), 'route' => 'date-chronology' ]);
        $menu->addChild('_lookup', [ 'label' => $translator->trans('Look-up'), 'uri' => '#' ])
            ->setAttribute('dropdown', true);
        $menu['_lookup']
            ->addChild('person-index', [
                'label' => $translator->trans('Persons'), 'route' => 'person-index',
            ]);
        $menu['_lookup']
            ->addChild('place-index', [
                'label' => $translator->trans('Places'), 'route' => 'place-index',
            ]);
        $menu['_lookup']
            ->addChild('organization-index', [
                'label' => $translator->trans('Organizations'), 'route' => 'organization-index',
            ]);
        $menu['_lookup']
            ->addChild('event-index', [
                'label' => $translator->trans('Epochs and Events'), 'route' => 'event-index',
            ]);
        $menu['_lookup']
            ->addChild('bibliography-index', [
                'label' => $translator->trans('Bibliography'), 'route' => 'bibliography-index',
            ]);
        $menu['_lookup']
            ->addChild('article-index', [
                'label' => $translator->trans('Articles'), 'route' => 'article-index',
            ]);
        $menu['_lookup']
            ->addChild('glossary-index', [
                'label' => $translator->trans('Glossary'), 'route' => 'glossary-index',
            ]);

        if (array_key_exists('position', $options) && 'footer' == $options['position']) {
            $menu->addChild('education', [
                'label' => $translator->trans('Teaching Resources'), 'route' => 'education-index',
            ]);
        }
        else {
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

            case 'about-goals':
            case 'about-keydocuments':
            case 'about-audience':
            case 'about-usage':
            case 'about-editorialmodel':
            case 'about-editionguidelines':
            case 'about-implementation':
            case 'about-publications':
            case 'about-cfp':
                $toplevel = $this->topMenu($factory, []);
                $item = $toplevel['about'];
                $item->setParent(null);
                $menu->addChild($item);
                $item = $item[$current_route];
                break;

            case 'about-staff':
            case 'about-editors':
            case 'about-authors':
            case 'about-board':
            case 'about-sponsors':
            case 'about-news':
                $toplevel = $this->topMenu($factory, []);
                $item = $toplevel['about-us'];
                $item->setParent(null);
                $menu->addChild($item);
                $item = $item[$current_route];
                break;

            case 'topic-background':
                $item = $menu['topic-index']->addChild($current_route, [
                    'label' => 'Introduction',
                    'uri' => '#',
                ]);
                break;

            case 'article':
            case 'article-pdf':
                $item = $menu->addChild($current_route, [ 'label' => 'Article' ]);
                break;

            case 'source':
                $item = $menu->addChild($current_route, [ 'label' => 'Source' ]);
                break;

            case 'person-index':
            case 'place-index':
            case 'organization-index':
            case 'event-index':
            case 'bibliography-index':
            case 'glossary-index':
                $item = $menu['_lookup'][$current_route];
                break;

            case 'person':
            case 'person-by-gnd':
                $item = $menu['_lookup']['person-index'];
                $item = $item->addChild($current_route, [ 'label' => 'Detail', 'uri' => '#' ]);
                break;

            case 'place-map-mentioned':
                $item = $menu->addChild($current_route, [ 'label' => 'Map' ]);
                break;

            case 'place':
            case 'place-by-tgn':
                $item = $menu['_lookup']['place-index'];
                $item = $item->addChild($current_route, [ 'label' => 'Detail', 'uri' => '#' ]);
                break;

            case 'organization':
            case 'organization-by-gnd':
                $item = $menu['_lookup']['organization-index'];
                $item = $item->addChild($current_route, [ 'label' => 'Detail', 'uri' => '#' ]);
                break;

            case 'event':
            case 'event-by-gnd':
                $item = $menu['_lookup']['event-index'];
                // $item = $item->addChild($current_route, [ 'label' => 'Detail', 'uri' => '#' ]);
                break;

            case 'article-index':
            case 'article-index-date':
                $item = $menu['_lookup']['article-index'];
                $item = $item->addChild($current_route, [ 'label' => 'Detail', 'uri' => '#' ]);
                break;

            case 'bibliography':
                $item = $menu['_lookup']['bibliography-index'];
                $item = $item->addChild($current_route, [ 'label' => 'Detail', 'uri' => '#' ]);
                break;

            case 'search-index':
                $item = $menu->addChild($current_route, [ 'label' => 'Search' ]);
                break;

            case 'education-index':
            case 'about-educationguidelines':
            case 'about-educationsourceinterpretation':
                $item = $menu->addChild($current_route, [ 'label' => 'Teaching Resources' ]);
                break;

            // experimental stuff
            case 'home-preview':
            case 'exhibition':
            case 'labs-index':
            case 'person-by-year':
            case 'person-by-birthplace':
            case 'person-by-deathplace':
            case 'person-birth-death':
                break;

            default:
                if (!is_null($current_route)) {
                    var_dump($current_route);
                }
        }

        if (isset($item)) {
            $item->setCurrent(true);
            return $item;
        }

        return $menu;
    }
}

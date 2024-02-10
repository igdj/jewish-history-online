<?php
// src/App/Menu/Builder.php

// see http://symfony.com/doc/current/bundles/KnpMenuBundle/index.html
namespace App\Menu;

use Knp\Menu\FactoryInterface;
use Knp\Menu\ItemInterface;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RouterInterface;

use Symfony\Contracts\Translation\TranslatorInterface;

class Builder
{
    private $factory;
    private $translator;
    private $requestStack;
    private $router;

    /**
     * @param FactoryInterface $factory
     * @param TranslatorInterface $translator
     * @param RequestStack $requestStack
     * @param Router $router
     *
     * Add any other dependency you need
     */
    public function __construct(FactoryInterface $factory,
                                TranslatorInterface $translator,
                                RequestStack $requestStack,
                                RouterInterface $router)
    {
        $this->factory = $factory;
        $this->translator = $translator;
        $this->requestStack = $requestStack;
        $this->router = $router;
    }

    public function createTopMenu(array $options): ItemInterface
    {
        $menu = $this->factory->createItem('root');
        if (array_key_exists('position', $options) && 'footer' == $options['position']) {
            $menu->setChildrenAttributes([ 'id' => 'menu-top-footer', 'class' => 'small' ]);
        }
        else {
            $menu->setChildrenAttributes([ 'id' => 'menu-top', 'class' => 'list-inline' ]);
        }

        // add menu items
        if (!array_key_exists('part', $options) || 'left' == $options['part']) {
            $menu->addChild('about', [
                'label' => $this->translator->trans('About this edition', [], 'menu'),
                'route' => 'about',
            ]);
            $menu['about']
                ->addChild('about-goals', [
                    'label' => $this->translator->trans('Goals', [], 'menu'), 'route' => 'about-goals',
                ]);
            $menu['about']
                ->addChild('about-keydocuments', [
                    'label' => $this->translator->trans('Key Documents', [], 'menu'), 'route' => 'about-keydocuments',
                ]);
            $menu['about']
                ->addChild('about-audience', [
                    'label' => $this->translator->trans('Target Audience', [], 'menu'), 'route' => 'about-audience',
                ]);
            $menu['about']
                ->addChild('about-usage', [
                    'label' => $this->translator->trans('How to Use this Edition', [], 'menu'), 'route' => 'about-usage',
                ]);
            $menu['about']
                ->addChild('about-editorialmodel', [
                    'label' => $this->translator->trans('Editorial Model', [], 'menu'), 'route' => 'about-editorialmodel',
                ]);
            $menu['about']
                ->addChild('about-editionguidelines', [
                    'label' => $this->translator->trans('Edition and Edition Guidelines', [], 'menu'), 'route' => 'about-editionguidelines',
                ]);
            $menu['about']
                ->addChild('about-implementation', [
                    'label' => $this->translator->trans('Technical Implementation', [], 'menu'), 'route' => 'about-implementation',
                ]);
            $menu['about']
                ->addChild('about-publications', [
                    'label' => $this->translator->trans('Presentations and Publications', [], 'menu'), 'route' => 'about-publications',
                ]);
        }

        if (!array_key_exists('part', $options) || 'right' == $options['part']) {
            $menu->addChild('about-us', [
                'label' => $this->translator->trans('About us', [], 'menu'), 'route' => 'about-us',
            ]);
            $menu['about-us']
                ->addChild('about-team', [
                    'label' => $this->translator->trans('Team', [], 'menu'), 'route' => 'about-us',
                ]);
            $menu['about-us']
                ->addChild('about-editors', [
                    'label' => $this->translator->trans('Editors', [], 'menu'), 'route' => 'about-editors',
                ]);
            $menu['about-us']
                ->addChild('about-authors', [
                    'label' => $this->translator->trans('Authors', [], 'menu'), 'route' => 'about-authors',
                ]);
            $menu['about-us']
                ->addChild('about-board', [
                    'label' => $this->translator->trans('Advisory Board', [], 'menu'), 'route' => 'about-board',
                ]);
            $menu['about-us']
                ->addChild('about-sponsors', [
                    'label' => $this->translator->trans('Sponsors and Partners', [], 'menu'), 'route' => 'about-sponsors',
                ]);
            $menu['about-us']
                ->addChild('about-news', [
                    'label' => $this->translator->trans('Project News', [], 'menu'), 'route' => 'about-news',
                ]);

            $menu->addChild('terms', [
                'label' => $this->translator->trans('Terms and Conditions', [], 'menu'), 'route' => 'terms',
            ]);

            $menu->addChild('contact', [
                'label' => $this->translator->trans('Contact', [], 'menu'), 'route' => 'contact',
            ]);

            if (array_key_exists('position', $options) && 'footer' == $options['position']) {
                $context = new \Symfony\Component\Routing\RequestContext();
                $context->fromRequest($this->requestStack->getCurrentRequest());
                $this->router->setContext($context);

                $menu['contact']->addChild('imprint', [
                    'label' => $this->translator->trans('Imprint', [], 'menu'),
                    'uri' => $this->router->generate('contact') . '#imprint',
                ]);
                $menu['contact']->addChild('dataprotection', [
                    'label' => $this->translator->trans('Data Protection', [], 'menu'),
                    'uri' => $this->router->generate('contact') . '#dataprotection',
                ]);
            }
        }

        return $menu;
    }

    public function createMainMenu(array $options): ItemInterface
    {
        $breadcrumbMode = isset($options['position']) && 'breadcrumb' == $options['position'];

        $menu = $this->factory->createItem('home', [ 'label' => $this->translator->trans('Home', [], 'menu'), 'route' => 'home' ]);
        if (array_key_exists('position', $options) && 'footer' == $options['position']) {
            $menu->setChildrenAttributes([ 'id' => 'menu-main-footer', 'class' => 'small' ]);
        }
        else {
            $menu->setChildrenAttributes([ 'id' => 'menu-main', 'class' => 'list-inline' ]);
        }

        // add menu item
        $menu->addChild('exhibition-index', [ 'label' => $this->translator->trans('Online Exhibitions', [], 'menu'), 'route' => 'exhibition-index' ]);
        $menu->addChild('topic-index', [ 'label' => $this->translator->trans('Topics', [], 'menu'), 'route' => 'topic-index' ]);
        $menu->addChild('place-map', [ 'label' => $this->translator->trans('Map', [], 'menu'), 'route' => 'place-map' ]);
        $menu->addChild('date-chronology', [ 'label' => $this->translator->trans('Chronology', [], 'menu'), 'route' => 'date-chronology' ]);
        $menu->addChild('_lookup', [ 'label' => $this->translator->trans('Look-up', [], 'menu'), 'uri' => '#' ])
            ->setAttribute('dropdown', true);
        $menu['_lookup']
            ->addChild('person-index', [
                'label' => $this->translator->trans('Persons', [], 'menu'), 'route' => 'person-index',
            ]);
        $menu['_lookup']
            ->addChild('place-index', [
                'label' => $this->translator->trans('Places', [], 'menu'), 'route' => 'place-index',
            ]);
        $menu['_lookup']
            ->addChild('organization-index', [
                'label' => $this->translator->trans('Organizations', [], 'menu'), 'route' => 'organization-index',
            ]);
        $menu['_lookup']
            ->addChild('event-index', [
                'label' => $this->translator->trans('Epochs and Events', [], 'menu'), 'route' => 'event-index',
            ]);
        $menu['_lookup']
            ->addChild('bibliography-index', [
                'label' => $this->translator->trans('Bibliography', [], 'menu'), 'route' => 'bibliography-index',
            ]);
        $menu['_lookup']
            ->addChild('article-index', [
                'label' => $this->translator->trans('Articles', [], 'menu'), 'route' => 'article-index',
            ]);
        $menu['_lookup']
            ->addChild('glossary-index', [
                'label' => $this->translator->trans('Glossary', [], 'menu'), 'route' => 'glossary-index',
            ]);

        if (array_key_exists('position', $options) && 'footer' == $options['position']) {
            $menu->addChild('education', [
                'label' => $this->translator->trans('Teaching Resources', [], 'menu'), 'route' => 'education-index',
            ]);
        }
        else {
            $menu['exhibition-index']->setAttribute('id', 'menu-item-exhibition');
            $menu['topic-index']->setAttribute('id', 'menu-item-topic');
            $menu['place-map']->setAttribute('id', 'menu-item-map');
            $menu['date-chronology']->setAttribute('id', 'menu-item-chronology');
            $menu['_lookup']->setAttribute('id', 'menu-item-lookup');

            // find the matching parent
            // TODO: maybe use a voter
            $uriCurrent = $this->requestStack->getCurrentRequest()->getRequestUri();

            // create the iterator
            $itemIterator = new \Knp\Menu\Iterator\RecursiveItemIterator($menu);

            // iterate recursively on the iterator
            $iterator = new \RecursiveIteratorIterator($itemIterator, \RecursiveIteratorIterator::SELF_FIRST);

            foreach ($iterator as $item) {
                $uri = $item->getUri();
                if (substr($uriCurrent, 0, strlen($uri)) === $uri) {
                    $item->setCurrent(true);
                    break;
                }
            }
        }

        return $menu;
    }

    public function createBreadcrumbMenu(array $options): ItemInterface
    {
        $menu = $this->createMainMenu($options + [ 'position' => 'breadcrumb' ]);

        // try to return the active item
        $currentRoute = $this->requestStack->getCurrentRequest()->get('_route');

        if (is_null($currentRoute) || 'home' == $currentRoute) {
            // $currentRoute is null on error pages, e.g. 404
            return $menu;
        }

        // first level
        $item = $menu[$currentRoute];
        if (isset($item)) {
            return $item;
        }

        // additional routes
        switch ($currentRoute) {
            case 'about':
            case 'terms':
            case 'contact':
                $toplevel = $this->createTopMenu([]);
                $item = $toplevel[$currentRoute];
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
                $toplevel = $this->createTopMenu([]);
                $item = $toplevel['about'];
                $item->setParent(null);
                $menu->addChild($item);
                $item = $item[$currentRoute];
                break;

            case 'about-us':
            case 'about-staff':
            case 'about-editors':
            case 'about-authors':
            case 'about-board':
            case 'about-sponsors':
            case 'about-news':
                $toplevel = $this->createTopMenu([]);
                $item = $toplevel['about-us'];
                $item->setParent(null);
                $menu->addChild($item);
                $item = $item[$currentRoute];
                break;

            case 'topic-background':
                $item = $menu['topic-index']->addChild($currentRoute, [
                    'label' => 'Introduction',
                    'uri' => '#',
                ]);
                break;

            case 'article':
            case 'article-pdf':
                $item = $menu->addChild($currentRoute, [ 'label' => 'Article' ]);
                break;

            case 'source':
                $item = $menu->addChild($currentRoute, [ 'label' => 'Source' ]);
                break;

            case 'person-index':
            case 'place-index':
            case 'organization-index':
            case 'event-index':
            case 'bibliography-index':
            case 'glossary-index':
                $item = $menu['_lookup'][$currentRoute];
                break;

            case 'person':
            case 'person-by-gnd':
                $item = $menu['_lookup']['person-index'];
                $item = $item->addChild($currentRoute, [ 'label' => 'Detail', 'uri' => '#' ]);
                break;

            case 'place-map-mentioned':
            case 'place-map-landmark':
                $item = $menu->addChild($currentRoute, [ 'label' => 'Map' ]);
                break;

            case 'place':
            case 'place-by-tgn':
                $item = $menu['_lookup']['place-index'];
                $item = $item->addChild($currentRoute, [ 'label' => 'Detail', 'uri' => '#' ]);
                break;

            case 'organization':
            case 'organization-by-gnd':
                $item = $menu['_lookup']['organization-index'];
                $item = $item->addChild($currentRoute, [ 'label' => 'Detail', 'uri' => '#' ]);
                break;

            case 'event':
            case 'event-by-gnd':
                $item = $menu['_lookup']['event-index'];
                // $item = $item->addChild($currentRoute, [ 'label' => 'Detail', 'uri' => '#' ]);
                break;

            case 'article-index':
            case 'article-index-date':
                $item = $menu['_lookup']['article-index'];
                $item = $item->addChild($currentRoute, [ 'label' => 'Detail', 'uri' => '#' ]);
                break;

            case 'bibliography':
                $item = $menu['_lookup']['bibliography-index'];
                $item = $item->addChild($currentRoute, [ 'label' => 'Detail', 'uri' => '#' ]);
                break;

            case 'search-index':
                $item = $menu->addChild($currentRoute, [ 'label' => 'Search' ]);
                break;

            case 'education-index':
            case 'about-educationguidelines':
            case 'about-educationsourceinterpretation':
                $item = $menu->addChild($currentRoute, [ 'label' => 'Teaching Resources' ]);
                break;

            case 'exhibition-index':
            case 'exhibition':
                $item = $menu->addChild($currentRoute, [ 'label' => 'Online Exhibitions' ]);
                break;
                break;

            case 'dossier-index':
            case 'dossier':
            case 'dossier-section':
                $item = $menu->addChild($currentRoute, [ 'label' => 'Dossier' ]);
                break;
                break;


            // experimental stuff
            case 'landmark':
            case 'home-preview':
            case 'labs-index':
            case 'person-by-year':
            case 'person-by-birthplace':
            case 'person-by-deathplace':
            case 'person-birth-death':
                break;
        }

        if (isset($item)) {
            $item->setCurrent(true);

            return $item;
        }

        return $menu;
    }
}

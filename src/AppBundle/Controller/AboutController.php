<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Response;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class AboutController extends RenderTeiController
{
    protected function renderContent()
    {
        $route = $this->get('request')->get('_route');
        $locale = $this->get('request')->getLocale();
        $fnameTei = $route . '.' . $locale . '.xml';

        $html = $this->renderTei($fnameTei);

        if (false === $html) {
            return '<div class="alert alert-warning">'
                 . 'Error: Invalid or missing file: ' . $fnameTei
                 . '</div>';
        }

        return $html;
    }

    /**
     * @Route("/about")
     */
    public function aboutAction()
    {
        return $this->render('AppBundle:Default:sitetext-about.html.twig',
                             [ 'title' => 'About us',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/about/staff", name="about-staff")
     */
    public function staffAction()
    {
        return $this->render('AppBundle:Default:sitetext-about.html.twig',
                             [ 'title' => 'Staff',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/about/editors", name="about-editors")
     */
    public function editorsAction()
    {
        return $this->render('AppBundle:Default:sitetext-about.html.twig',
                             [ 'title' => 'Editors',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/about/board", name="about-board")
     */
    public function boardAction()
    {
        return $this->render('AppBundle:Default:sitetext-about.html.twig',
                             [ 'title' => 'Advisory Board',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/about/sponsors", name="about-sponsors")
     */
    public function sponsorsAction()
    {
        return $this->render('AppBundle:Default:sitetext-about.html.twig',
                             [ 'title' => 'Sponsors and Partners',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/contact")
     */
    public function contactAction()
    {
        return $this->render('AppBundle:Default:sitetext.html.twig',
                             [ 'title' => 'Contact',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/terms")
     */
    public function termsAction()
    {
        return $this->render('AppBundle:Default:sitetext.html.twig',
                             [ 'title' => 'Terms and Conditions',
                               'content' => $this->renderContent() ]);
    }

}

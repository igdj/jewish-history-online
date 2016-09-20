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

        $params = [ 'lang' => \AppBundle\Utils\Iso639::code1To3($locale) ];

        $html = $this->renderTei($fnameTei, 'dtabf_article-printview.xsl', [ 'params' => $params ]);

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
                             [ 'title' => 'About this edition',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/about/goals", name="about-goals")
     */
    public function goalsAction()
    {
        return $this->render('AppBundle:Default:sitetext-about.html.twig',
                             [ 'title' => 'Goals',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/about/goals", name="about-goals")
     */
    public function keydocumentsAction()
    {
        return $this->render('AppBundle:Default:sitetext-about.html.twig',
                             [ 'title' => 'Key Documents',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/about/audience", name="about-audience")
     */
    public function audienceAction()
    {
        return $this->render('AppBundle:Default:sitetext-about.html.twig',
                             [ 'title' => 'Target Audience',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/about/usage", name="about-usage")
     */
    public function usageAction()
    {
        return $this->render('AppBundle:Default:sitetext-about.html.twig',
                             [ 'title' => 'Structure / How to Use this Edition',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/about/editorial-model", name="about-editorialmodel")
     */
    public function editorialmodelAction()
    {
        return $this->render('AppBundle:Default:sitetext-about.html.twig',
                             [ 'title' => 'Editorial Model',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/about/edition", name="about-edition")
     */
    public function editionguidelinesAction()
    {
        return $this->render('AppBundle:Default:sitetext-about.html.twig',
                             [ 'title' => 'Edition and Edition Guidelines',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/about/technical-implementation", name="about-implementation")
     */
    public function implementationAction()
    {
        return $this->render('AppBundle:Default:sitetext-about.html.twig',
                             [ 'title' => 'Technical Implementation',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/about/staff", name="about-staff")
     */
    public function staffAction()
    {
        return $this->render('AppBundle:Default:sitetext-about-us.html.twig',
                             [ 'title' => 'Staff',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/about/editors", name="about-editors")
     */
    public function editorsAction()
    {
        return $this->render('AppBundle:Default:sitetext-about-us.html.twig',
                             [
                               'title' => 'Editors',
                               'content' => $this->renderContent(),
                             ]);
    }

    /**
     * @Route("/about/board", name="about-board")
     */
    public function boardAction()
    {
        return $this->render('AppBundle:Default:sitetext-about-us.html.twig',
                             [ 'title' => 'Advisory Board',
                               'content' => $this->renderContent() ]);
    }

    /**
     * @Route("/about/sponsors", name="about-sponsors")
     */
    public function sponsorsAction()
    {
        return $this->render('AppBundle:Default:sitetext-about-us.html.twig',
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

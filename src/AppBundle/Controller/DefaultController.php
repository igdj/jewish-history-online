<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class DefaultController
extends TopicController
{
    /* shared code with PlaceController */
    use MapHelperTrait;

    /**
     * @Route("/")
     */
    public function indexAction()
    {
        list($markers, $bounds) = $this->buildMap();

        return $this->render('AppBundle:Default:index.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Welcome'),
            'topics' => $this->buildTopicsDescriptions(),
            'markers' => $markers,
            'bounds' => $bounds,
        ]);
    }
}

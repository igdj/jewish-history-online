<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class DateController extends Controller
{
    /**
     * @Route("/chronology")
     */
    public function chronologyAction()
    {
        $articles = $this->getDoctrine()
                ->getRepository('AppBundle:SourceArticle')
                ->findBy(array('status' => [ 0, 1 ]),
                         array('dateCreated' => 'ASC'));

        return $this->render('AppBundle:Date:chronology.html.twig',
                             [ 'articles' => $articles]);
    }

}

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
        $criteria = [ 'status' => [ 0, 1 ] ];

        $locale = $this->get('request')->getLocale();
        if (!empty($locale)) {
            $criteria['language'] = \AppBundle\Utils\Iso639::code1to3($locale);
        }

        $articles = $this->getDoctrine()
                ->getRepository('AppBundle:SourceArticle')
                ->findBy($criteria,
                         [ 'dateCreated' => 'ASC' ]);

        return $this->render('AppBundle:Date:chronology.html.twig',
                             [ 'articles' => $articles]);
    }

}

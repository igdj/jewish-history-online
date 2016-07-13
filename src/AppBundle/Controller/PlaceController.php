<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class PlaceController extends Controller
{
    /**
     * @Route("/map")
     */
    public function mapAction()
    {
        return $this->render('AppBundle:Place:map.html.twig');
    }

    /**
     * @Route("/place")
     */
    public function indexAction()
    {
        $places = $this->getDoctrine()
                ->getRepository('AppBundle:Place')
                ->findBy([ 'type' => 'inhabited place' ],
                         [ 'name' => 'ASC' ]);

        return $this->render('AppBundle:Place:index.html.twig',
                             [ 'places' => $places ]);
    }

    public function detailAction($id = null, $tgn = null)
    {
        $placeRepo = $this->getDoctrine()
                ->getRepository('AppBundle:Place');

        if (!empty($id)) {
            $place = $placeRepo->findOneById($id);
        }
        else if (!empty($tgn)) {
            $place = $placeRepo->findOneByTgn($tgn);

        }
        /*
        else if (!empty($gnd)) {
            $place = $placeRepo->findOneByGnd($gnd);

        }
        */

        if (!isset($place) /* || $place->getStatus() < 0 */) {
            return $this->redirectToRoute('place-index');
        }

        return $this->render('AppBundle:Place:detail.html.twig',
                             array('place' => $place));
    }

}

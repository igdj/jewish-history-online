<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class PersonController extends Controller
{
    /**
     * @Route("/person")
     */
    public function indexAction()
    {
        $persons = $this->getDoctrine()
                ->getRepository('AppBundle:Person')
                ->findBy(array('status' => [ 0, 1 ]),
                         array('familyName' => 'ASC', 'givenName' => 'ASC'));

        return $this->render('AppBundle:Person:index.html.twig',
                             [ 'persons' => $persons ]);
    }

    public function detailAction($id = null, $gnd = null)
    {
        $personRepo = $this->getDoctrine()
                ->getRepository('AppBundle:Person');

        if (!empty($id)) {
            $person = $personRepo->findOneById($id);
        }
        else if (!empty($gnd)) {
            $person = $personRepo->findOneByGnd($gnd);

        }

        if (!isset($person) || $person->getStatus() < 0) {
            return $this->redirectToRoute('person-index');
        }

        return $this->render('AppBundle:Person:detail.html.twig',
                             array('person' => $person));
    }

}

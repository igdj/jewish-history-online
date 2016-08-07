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
                             [ 'person' => $person ]);
    }

    public function gndBeaconAction()
    {
        $translator = $this->container->get('translator');

        $personRepo = $this->getDoctrine()
                ->getRepository('AppBundle:Person');

        $query = $personRepo
                ->createQueryBuilder('P')
                ->where('P.status >= 0')
                ->andWhere('P.gnd IS NOT NULL')
                ->orderBy('P.gnd')
                ->getQuery()
                ;

        $persons = $query->execute();

        $ret = '#FORMAT: BEACON' . "\n"
             . '#PREFIX: http://d-nb.info/gnd/'
             . "\n";
        $ret .= sprintf('#TARGET: %s/gnd/{ID}',
                        $this->generateUrl('person-index', [], true))
              . "\n";
        $ret .= '#NAME: ' . $translator->trans('Hamburg Key-Documents of German-Jewish History')
              . "\n";
        // $ret .= '#MESSAGE: ' . "\n";

        foreach ($persons as $person) {
            $ret .=  $person->getGnd() . "\n";
        }

        return new \Symfony\Component\HttpFoundation\Response($ret, \Symfony\Component\HttpFoundation\Response::HTTP_OK,
                                                              [ 'Content-Type' => 'text/plain; charset=UTF-8' ]);
    }

}

<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class OrganizationController extends Controller
{
    /**
     * @Route("/organization")
     */
    public function indexAction()
    {
        $organizations = $this->getDoctrine()
                ->getRepository('AppBundle:Organization')
                ->findBy(array('status' => [ 0, 1 ]),
                         array('name' => 'ASC'));

        return $this->render('AppBundle:Organization:index.html.twig',
                             [ 'organizations' => $organizations ]);
    }

    public function detailAction($id = null, $gnd = null)
    {
        $organizationRepo = $this->getDoctrine()
                ->getRepository('AppBundle:Organization');

        if (!empty($id)) {
            $organization = $organizationRepo->findOneById($id);
        }
        else if (!empty($gnd)) {
            $organization = $organizationRepo->findOneByGnd($gnd);

        }

        if (!isset($organization) || $organization->getStatus() < 0) {
            return $this->redirectToRoute('organization-index');
        }

        return $this->render('AppBundle:Organization:detail.html.twig',
                             array('organization' => $organization));
    }

    public function gndBeaconAction()
    {
        $translator = $this->container->get('translator');

        $personRepo = $this->getDoctrine()
                ->getRepository('AppBundle:Organization');

        $query = $personRepo
                ->createQueryBuilder('O')
                ->where('O.status >= 0')
                ->andWhere('O.gnd IS NOT NULL')
                ->orderBy('O.gnd')
                ->getQuery()
                ;

        $organizations = $query->execute();

        $ret = '#FORMAT: BEACON' . "\n"
             . '#PREFIX: http://d-nb.info/gnd/'
             . "\n";
        $ret .= sprintf('#TARGET: %s/gnd/{ID}',
                        $this->generateUrl('organization-index', [], true))
              . "\n";
        $ret .= '#NAME: ' . $translator->trans('Key Documents of German-Jewish History')
              . "\n";
        // $ret .= '#MESSAGE: ' . "\n";

        foreach ($organizations as $organization) {
            $ret .=  $organization->getGnd() . "\n";
        }

        return new \Symfony\Component\HttpFoundation\Response($ret, \Symfony\Component\HttpFoundation\Response::HTTP_OK,
                                                              [ 'Content-Type' => 'text/plain; charset=UTF-8' ]);
    }

}

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

}

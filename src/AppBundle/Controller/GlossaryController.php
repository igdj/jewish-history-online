<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class GlossaryController extends Controller
{
    /**
     * @Route("/glossary")
     */
    public function indexAction()
    {
        $language = \AppBundle\Utils\Iso639::code1to3($this->container->get('request')->getLocale());

        $terms = $this->getDoctrine()
                ->getRepository('AppBundle:GlossaryTerm')
                ->findBy([ 'status' => [ 0, 1 ],
                           'language' => $language ],
                         [ 'term' => 'ASC' ]);

        return $this->render('AppBundle:Glossary:index.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Glossary'),
            'terms' => $terms,
        ]);
    }

    /*
    // currently only index, no detail
    public function detailAction($slug = null, $gnd = null)
    {
        $termRepo = $this->getDoctrine()
                ->getRepository('AppBundle:GlossaryTerm');

        if (!empty($slug)) {
            $term = $termRepo->findOneBySlug($slug);
        }
        else if (!empty($gnd)) {
            $term = $termRepo->findOneByGnd($gnd);
        }

        if (!isset($term) || $term->getStatus() < 0) {
            return $this->redirectToRoute('glossary-index');
        }

        return $this->render('AppBundle:Glossary:detail.html.twig',
                             array('term' => $term));
    }
    */
}

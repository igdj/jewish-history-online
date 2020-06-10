<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Translation\TranslatorInterface;

/**
 *
 */
class GlossaryController
extends BaseController
{
    /**
     * @Route("/glossary", name="glossary-index")
     */
    public function indexAction(Request $request,
                                TranslatorInterface $translator)
    {
        $language = \AppBundle\Utils\Iso639::code1to3($request->getLocale());

        $terms = $this->getDoctrine()
                ->getRepository('\AppBundle\Entity\GlossaryTerm')
                ->findBy([ 'status' => [ 0, 1 ],
                           'language' => $language ],
                         [ 'term' => 'ASC' ]);

        return $this->render('@AppBundle/Glossary/index.html.twig', [
            'pageTitle' => $translator->trans('Glossary'),
            'terms' => $terms,
        ]);
    }

    /*
    // currently only index, no detail
    public function detailAction($slug = null, $gnd = null)
    {
        $termRepo = $this->getDoctrine()
                ->getRepository('\AppBundle\Entity\GlossaryTerm');

        if (!empty($slug)) {
            $term = $termRepo->findOneBySlug($slug);
        }
        else if (!empty($gnd)) {
            $term = $termRepo->findOneByGnd($gnd);
        }

        if (!isset($term) || $term->getStatus() < 0) {
            return $this->redirectToRoute('glossary-index');
        }

        return $this->render('@AppBundle/Glossary/detail.html.twig',
                             [ 'term' => $term ]);
    }
    */
}

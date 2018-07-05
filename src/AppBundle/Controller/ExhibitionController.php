<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;


class ExhibitionController
extends ArticleController
{
    static $EXHIBITIONS = [
        'jewish-life-since-1945' => [
            'name' => 'Jüdisches Leben seit 1945',
        ],
    ];

    protected function renderExhibition(Request $request, $slug)
    {
        $exhibition = self::$EXHIBITIONS[$slug];

        return $this->render('AppBundle:Exhibition:'
                             . $slug
                             . '.' .$request->getLocale() . '.html.twig', [
            'pageTitle' => /** @Ignore */ $this->get('translator')->trans($exhibition['name']),
        ]);
    }

    /**
     * @Route("/exhibition/{slug}", name="exhibition")
     */
    public function detailAction(Request $request, $slug)
    {
        $criteria = [];
        $locale = $request->getLocale();

        if (!array_key_exists($slug, self::$EXHIBITIONS)) {
            throw $this->createNotFoundException('This exhibition does not exist');
        }

        return $this->renderExhibition($request, $slug);
    }
}

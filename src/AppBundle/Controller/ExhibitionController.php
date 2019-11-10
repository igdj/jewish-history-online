<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ExhibitionController
extends ArticleController
{
    static $EXHIBITIONS = [
        'jewish-life-since-1945' => [
            'name' => 'Jewish Life since 1945',
        ],
        'migration' => [
            'name' => 'Jewish Migration: Location Hamburg',
        ],
        'salzberg' => [
            'name' => '“A (Life) History between Four Walls” – Max and Frida Salzberg',
        ],
        'histories-in-images' => [
            'name' => '(Hi)stories in Images – Jewish Private Photography in the 20th Century',
        ],
        'childrens-worlds' => [
            'name' => 'Children’s Worlds – New Perspectives on the History of Jewish School Life in Hamburg', // 'Kinderwelten – Neue Perspektiven auf die Geschichte des jüdischen Schulleben Hamburgs',
            'published' => false,
        ],
    ];

    public static function lookupLocalizedExhibition($slug, $translator, $locale)
    {
        if ('en' == $locale) {
            // no lookup needed
            return $slug;
        }

        // we need to get from german to english term
        $localeTranslator = $translator->getLocale();
        if ($localeTranslator != $locale) {
            $translator->setLocale($locale);
        }

        foreach (\AppBundle\Controller\ExhibitionController::$EXHIBITIONS as $key => $descr) {
            if (/** @Ignore */ $translator->trans($key) == $slug) {
                $slug = $key;
                break;
            }
        }

        if ($localeTranslator != $locale) {
            $translator->setLocale($localeTranslator);
        }

        return $slug;
    }

    protected function renderExhibition(Request $request, $slug)
    {
        $exhibition = self::$EXHIBITIONS[$slug];

        $localeSwitch = [];
        if ('en' == ($locale = $request->getLocale())) {
            $translator = $this->get('translator');
            foreach ([ 'de' ] as $alternateLocale) {
                $translator->setLocale($alternateLocale);
                $localeSwitch[$alternateLocale] = [
                    'slug' => /** @Ignore */$translator->trans($slug),
                ];
            }
            $translator->setLocale($locale);
        }
        else {
            $localeSwitch['en'] = [ 'slug' => $slug ];
        }

        return $this->render('AppBundle:Exhibition:'
                             . $slug
                             . '.' . $locale . '.html.twig', [
            'pageTitle' => /** @Ignore */ $this->get('translator')->trans($exhibition['name']),
            'route_params_locale_switch' => $localeSwitch,
        ]);
    }

    /**
     * @Route("/exhibition", name="exhibition-index")
     */
    public function indexAction(Request $request)
    {
        $locale = $request->getLocale();

        return $this->render('AppBundle:Exhibition:index.html.twig', [
            'pageTitle' => /** @Ignore */ $this->get('translator')->trans('Online Exhibitions'),
        ]);
    }

    /**
     * @Route("/exhibition/{slug}", name="exhibition")
     */
    public function detailAction(Request $request, $slug)
    {
        $locale = $request->getLocale();

        $slugEn = self::lookupLocalizedExhibition($slug, $this->get('translator'), $locale);


        if (!array_key_exists($slugEn, self::$EXHIBITIONS)) {
            throw $this->createNotFoundException('This exhibition does not exist');
        }

        return $this->renderExhibition($request, $slugEn);
    }
}

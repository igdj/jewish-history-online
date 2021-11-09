<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Contracts\Translation\TranslatorInterface;

class ExhibitionController
extends \TeiEditionBundle\Controller\BaseController
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
            'name' => 'Children’s Worlds – New Perspectives on the History of Jewish School Life in Hamburg',
        ],
        'sea-voyages' => [
            'name' => 'On Board the Ship: “as on another Earth”',
        ],
        'womens-lives' => [
            'name' => 'Women’s Lives – Work and Impact of Jewish Women in Hamburg',
        ],
        'jewish-life-since-1945-relaunch' => [
            'name' => 'Jewish Life since 1945 – Relaunch',
        ],
        /*
        'preview' => [
            'name' => 'New Exhibition',
            'published' => false,
        ],
        */
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

        foreach (self::$EXHIBITIONS as $key => $descr) {
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

    protected function renderExhibition(Request $request,
                                        TranslatorInterface $translator,
                                        $slug)
    {
        $exhibition = self::$EXHIBITIONS[$slug];

        $localeSwitch = [];
        if ($this->getParameter('fallback_locale') == ($locale = $request->getLocale())) {
            foreach ($this->getParameter('locales') as $alternateLocale) {
                if ($locale != $alternateLocale) {
                    $translator->setLocale($alternateLocale);
                    $localeSwitch[$alternateLocale] = [
                        'slug' => /** @Ignore */$translator->trans($slug),
                    ];
                }
            }

            $translator->setLocale($locale);
        }
        else {
            $localeSwitch[$this->getParameter('fallback_locale')] = [ 'slug' => $slug ];
        }

        return $this->render('Exhibition/'
                             . $slug
                             . '.' . $locale . '.html.twig', [
            'pageTitle' => /** @Ignore */ $translator->trans($exhibition['name']),
            'route_params_locale_switch' => $localeSwitch,
        ]);
    }

    /**
     * @Route("/exhibition", name="exhibition-index")
     */
    public function indexAction(Request $request,
                                TranslatorInterface $translator)
    {
        $locale = $request->getLocale();

        return $this->render('Exhibition/index.html.twig', [
            'pageTitle' => /** @Ignore */ $translator->trans('Online Exhibitions'),
        ]);
    }

    /**
     * @Route("/exhibition/{slug}", name="exhibition")
     */
    public function detailAction(Request $request,
                                 TranslatorInterface $translator,
                                 $slug)
    {
        $locale = $request->getLocale();

        $slugEn = self::lookupLocalizedExhibition($slug, $translator, $locale);


        if (!array_key_exists($slugEn, self::$EXHIBITIONS)) {
            throw $this->createNotFoundException('This exhibition does not exist');
        }

        return $this->renderExhibition($request, $translator, $slugEn);
    }
}

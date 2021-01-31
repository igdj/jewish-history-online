<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Yaml\Yaml;

use Symfony\Contracts\Translation\TranslatorInterface;

use Sylius\Bundle\ThemeBundle\Context\SettableThemeContext;

/*
 * TODO: Share with ExhibitionController
 */
class DossierController
extends \TeiEditionBundle\Controller\BaseController
{
    protected $dossiers = [];

    public function __construct(SettableThemeContext $themeContext)
    {
        $themePath = $themeContext->getTheme()->getPath();
        $info = Yaml::parseFile($themePath . '/data/site.yaml');
        if (is_array($info) && array_key_exists('dossiers', $info)) {
            $this->dossiers = $info['dossiers'];
        }
    }

    public function lookupFromLocalized($slug, $translator, $locale)
    {
        if ('en' == $locale) {
            // no lookup needed
            return $slug;
        }

        // we need to get from localized to english term
        $localeTranslator = $translator->getLocale();
        if ($localeTranslator != $locale) {
            $translator->setLocale($locale);
        }

        foreach ($this->dossiers as $key => $descr) {
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

    private function buildLocaleSwitch(Request $request,
                                       TranslatorInterface $translator,
                                       $slug)
    {
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

        return $localeSwitch;
    }

    protected function renderDossier(Request $request,
                                     TranslatorInterface $translator,
                                     $slug)
    {
        $dossier = $this->dossiers[$slug];
        $locale = $request->getLocale();

        return $this->render('Dossier/'
                             . $slug
                             . '.' . $locale . '.html.twig', [
            'pageTitle' => /** @Ignore */ $translator->trans($dossier['name']),
            'route_params_locale_switch' => $this->buildLocaleSwitch($request, $translator, $slug),
        ]);
    }

    /**
     * @Route("/dossier/{slug}", name="dossier")
     * @Route("/dossier/{slug}/{section}", name="dossier-section")
     */
    public function detailAction(Request $request,
                                 TranslatorInterface $translator,
                                 $slug,
                                 $section = null)
    {
        $locale = $request->getLocale();

        $slugEn = $this->lookupFromLocalized($slug, $translator, $locale);

        if (!array_key_exists($slugEn, $this->dossiers)) {
            throw $this->createNotFoundException('This dossier does not exist');
        }

        if (!empty($section)) {
            $response = $this->renderDossierSection($request, $translator, $slugEn, $section);
            if (!is_null($response)) {
                return $response;
            }
        }

        return $this->renderDossier($request, $translator, $slugEn);
    }

    /**
     * Dossier specific sub-sections
     */
    protected function renderDossierSection(Request $request,
                                            TranslatorInterface $translator,
                                            $slug, $section)
    {
        $dossier = $this->dossiers[$slug];

        switch ($slug) {
            case 'martha-glass':
                switch ($section) {
                    case 'brandis-wohlwill':
                        return $this->render('Dossier/martha-glass.brandis-wohlwill.html.twig', [
                            'pageTitle' => /** @Ignore */ $translator->trans($dossier['name']),
                            'section' => $section,
                            'route_params_locale_switch' => $this->buildLocaleSwitch($request, $translator, $slug),
                        ]);

                    case 'material':
                        return $this->render('Dossier/martha-glass.material.html.twig', [
                            'pageTitle' => /** @Ignore */ $translator->trans($dossier['name']),
                            'section' => $section,
                            'route_params_locale_switch' => $this->buildLocaleSwitch($request, $translator, $slug),
                        ]);

                    case 'welcoming-note':
                        return $this->render('Dossier/martha-glass.welcoming-note.html.twig', [
                            'pageTitle' => /** @Ignore */ $translator->trans($dossier['name']),
                            'section' => $section,
                            'route_params_locale_switch' => $this->buildLocaleSwitch($request, $translator, $slug),
                        ]);
                }
                break;
        }
    }
}

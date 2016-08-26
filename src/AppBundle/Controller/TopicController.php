<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class TopicController extends RenderTeiController
{
    static $TOPICS = [
        'Daily and Family Life',
        'Demography and Social Structures',
        'Education',
        'Leisure and Sports',
        'Remembrance',
        'Anti-Semitism and Persecution',
        'Arts and Culture',
        'Migration',
        'Organizations and Institutions',
        'Law and Politics',
        'Religious Life and Identity Issues',
        'Social Issues and Welfare',
        'Economy and Occupational Composition',
        'Scholarship',
    ];

    public static function lookupLocalizedTopic($topic, $translator, $locale)
    {
        if ('en' == $locale) {
            // no lookup needed
            return $topic;
        }

        // we need to get from german to english term
        $localeTranslator = $translator->getLocale();
        if ($localeTranslator != $locale) {
            $translator->setLocale($locale);
        }

        foreach (\AppBundle\Controller\TopicController::$TOPICS as $label) {
            /** @Ignore */
            if ($translator->trans($label) == $topic) {
                $topic = $label;
                break;
            }
        }

        if ($localeTranslator != $locale) {
            $translator->setLocale($localeTranslator);
        }

        return $topic;
    }

    private function buildTopicsBySlug($translate_keys = false)
    {
        $translator = $this->get('translator');
        $slugify = $this->get('cocur_slugify');

        $topics = [];
        foreach (self::$TOPICS as $label) {
            /** @Ignore */
            $label_translated = $translator->trans($label);
            $key = $slugify->slugify($translate_keys ? $label_translated : $label);
            $topics[$key] = $label_translated;
        }
        return $topics;
    }

    /**
     * @Route("/topic")
     */
    public function indexAction()
    {
        $topics = $this->buildTopicsBySlug();
        asort($topics);

        $slugify = $this->get('cocur_slugify');
        $topicsDescription = [];
        foreach ($topics as $slug => $label) {
            $topicsDescription[$slug] = [ 'label' => $label ];
            $articleSlug =  $slugify->slugify($label);
            $articlePath = $this->locateTeiResource($articleSlug . '.xml');
            if (false !== $articlePath) {
                $topicsDescription[$slug]['article'] = $articleSlug;
            }
        }
        return $this->render('AppBundle:Topic:index.html.twig',
                             [ 'topics' => $topicsDescription ]);
    }

    /**
     * @Route("/topic/{slug}")
     */
    public function backgroundAction($slug)
    {
        $topics = $this->buildTopicsBySlug(true);
        if (!array_key_exists($slug, $topics)) {
            return $this->redirectToRoute('topic-index');
        }

        $generatePrintView = 'topic-background-pdf' == $this->container->get('request')->get('_route');
        $fname = $slug . '.xml';

        $teiHelper = new \AppBundle\Utils\TeiHelper();
        $meta = $teiHelper->analyzeHeader($this->locateTeiResource($fname));

        $html = $this->renderTei($fname, $generatePrintView ? 'dtabf_article-printview.xsl' : 'dtabf_article.xsl');

        list($authors, $section_headers, $license, $entities, $glossaryTerms) = $this->extractPartsFromHtml($html);

        if ($generatePrintView) {
            $html = $this->removeByCssSelector('<body>' . $html . '</body>',
                                               [ 'h2 + br', 'h3 + br' ]);

            $templating = $this->container->get('templating');

            $html = $templating->render('AppBundle:Article:article-printview.html.twig',
                                 [
                                    'name' => $topics[$slug],
                                    'html' => preg_replace('/<\/?body>/', '', $html),
                                    'authors' => $authors,
                                    'section_headers' => $section_headers,
                                    'license' => $license,
                                  ]);
            // return new Response($html);
            $pdfGenerator = new \AppBundle\Utils\PdfGenerator();
            $pdfGenerator->writeHTML($html);
            $pdfGenerator->Output();
            return;
        }

        // sidebar
        $query = $this->get('doctrine')
            ->getManager()
            ->createQuery('SELECT a FROM AppBundle:Article a WHERE a.keywords LIKE :topic ORDER BY a.name')
            ->setParameter('topic', '%' . $topics[$slug] . '%');

        $articles = $query->getResult();

        return $this->render('AppBundle:Topic:background.html.twig',
                             [
                                'slug' => $slug,
                                'name' => $topics[$slug],
                                'html' => $html,
                                'meta' => $meta,
                                'authors' => $authors,
                                'section_headers' => $section_headers,
                                'license' => $license,
                                'interpretations' => $articles,
                              ]);
    }
}

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
        'Economy',
        'Scholarship',
    ];

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
        return $this->render('AppBundle:Topic:index.html.twig',
                             [ 'topics' => $topics ]);
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

        $html = $this->renderTei($slug . '.xml');

        list($authors, $section_headers, $license, $entities, $glossaryTerms) = $this->extractPartsFromHtml($html);

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
                                'authors' => $authors,
                                'section_headers' => $section_headers,
                                'license' => $license,
                                'interpretations' => $articles,
                              ]);
    }
}

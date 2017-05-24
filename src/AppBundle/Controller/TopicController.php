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
        'Demographics and Social Structure',
        'Education and Learning',
        'Family and Everyday Life',
        'Leisure and Sports',
        'Memory and Remembrance',
        'Antisemitism and Persecution',
        'Arts and Culture',
        'Migration',
        'Organizations and Institutions',
        'Law and Politics',
        'Religion and Identity',
        'Sephardic Jews',
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

    protected function buildTopicsBySlug($translate_keys = false)
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

    protected function buildTopicsDescriptions()
    {
        $locale = $this->get('request')->getLocale();
        $fnameAppend = !empty($locale) ? '.' . $locale : '';

        $topics = $this->buildTopicsBySlug();
        asort($topics);

        $slugify = $this->get('cocur_slugify');
        $topicsDescription = [];
        foreach ($topics as $slug => $label) {
            $topicsDescription[$slug] = [ 'label' => $label ];
            $articleSlug =  $slugify->slugify($label);
            $articlePath = $this->locateTeiResource($articleSlug . $fnameAppend . '.xml');
            if (false !== $articlePath) {
                $topicsDescription[$slug]['article'] = $articleSlug;
            }
        }

        return $topicsDescription;
    }

    /**
     * @Route("/topic")
     */
    public function indexAction()
    {
        return $this->render('AppBundle:Topic:index.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Topics'),
            'topics' => $this->buildTopicsDescriptions(),
        ]);
    }

    /**
     * @Route("/topic/{slug}")
     */
    public function backgroundAction($slug)
    {
        $language = null;
        $locale = $this->get('request')->getLocale();
        if (!empty($locale)) {
            $language = \AppBundle\Utils\Iso639::code1to3($locale);
        }
        $fnameAppend = !empty($locale) ? '.' . $locale : '';

        $topics = $this->buildTopicsBySlug(true);
        if (!array_key_exists($slug, $topics)) {
            return $this->redirectToRoute('topic-index');
        }

        $generatePrintView = 'topic-background-pdf' == $this->container->get('request')->get('_route');
        $fname = $slug . $fnameAppend . '.xml';
        $path = '';

        $criteria = [ 'slug' => $slug, 'language' => \AppBundle\Utils\Iso639::code1to3($locale) ];

        $article = $this->getDoctrine()
                ->getRepository('AppBundle:Article')
                ->findOneBy($criteria);
        if (isset($article)) {
            $meta = $article;
            list($prefix, $path) = explode(':', $meta->getUid(), 2);
            if (preg_match('/\-(\d+)$/', $path, $matches)) {
                $path = preg_replace('/\-(\d+)$/', sprintf('-%05d', $matches[1]), $path);
            }
        }
        else {
            // fallback to file system
            $teiHelper = new \AppBundle\Utils\TeiHelper();
            $meta = $teiHelper->analyzeHeader($this->locateTeiResource($fname));
        }

        // TODO: Unify with ArticleController::renderArticle()
        // localize labels in xslt
        $language = null;
        $params = [];
        if ($article instanceof \AppBundle\Entity\Article) {
            $language = $article->getLanguage();
            if (!empty($language)) {
                $params['lang'] = $language;
            }
        }

        $html = $this->renderTei($fname, $generatePrintView ? 'dtabf_article-printview.xsl' : 'dtabf_article.xsl', [ 'params' => $params ]);

        list($authors, $section_headers, $license, $entities, $bibitemLookup, $glossaryTerms, $refs) = $this->extractPartsFromHtml($html);
        $html = $this->adjustRefs($html, $refs, $language);

        $html = $this->adjustMedia($html,
                                   $this->get('request')->getBaseURL()
                                   . '/viewer/' . $path,
                                   $generatePrintView ? '' : 'img-responsive');

        if ($generatePrintView) {
            $html = $this->removeByCssSelector('<body>' . $html . '</body>',
                                               [ 'h2 + br', 'h3 + br' ]);

            $templating = $this->container->get('templating');

            $html = $templating->render('AppBundle:Article:article-printview.html.twig', [
                'name' => $topics[$slug],
                'html' => preg_replace('/<\/?body>/', '', $html),
                'authors' => $authors,
                'section_headers' => $section_headers,
                'license' => $license,
            ]);

            $this->renderPdf($html, $slug . '.pdf');
            return;
        }

        $localeSwitch = [];
        if ('en' == $locale) {
            $translator = $this->get('translator');
            $slugify = $this->get('cocur_slugify');
            foreach ([ 'de' ] as $alternateLocale) {
                $translator->setLocale($alternateLocale);
                $localeSwitch[$alternateLocale] = [ 'slug' => $slugify->slugify($translator->trans($topics[$slug])) ];
            }
            $translator->setLocale($locale);
        }
        else {
            // find corresponding english slug
            $translator = $this->get('translator');
            $slugify = $this->get('cocur_slugify');
            foreach (self::$TOPICS as $topicLabel) {
                if ($topics[$slug] == $translator->trans($topicLabel)) {
                    $localeSwitch['en'] = [ 'slug' => $slugify->slugify($topicLabel) ];
                    break;
                }
            }
        }

        $entityLookup = $this->buildEntityLookup($entities);
        $glossaryLookup = $this->buildGlossaryLookup($glossaryTerms);

        // sidebar
        $query = $this->get('doctrine')
            ->getManager()
            ->createQuery("SELECT A FROM AppBundle:Article A"
                          . " WHERE A.status IN (1) AND A.keywords LIKE :topic AND A.articleSection <> 'background'"
                          . (!empty($language) ? ' AND A.language=:language' : '')
                          . " ORDER BY A.name")
            ->setParameter('topic', '%' . $topics[$slug] . '%')
            ;
        if (!empty($language)) {
            $query->setParameter('language', $language);
        }

        $articles = $query->getResult();

        return $this->render('AppBundle:Topic:background.html.twig', [
            'slug' => $slug,
            'name' => $topics[$slug],
            'pageTitle' => $topics[$slug], // TODO: Prepend Einfuehrung, append authors in brackets
            'html' => $html,
            'meta' => $meta,
            'authors' => $authors,
            'section_headers' => $section_headers,
            'license' => $license,
            'entity_lookup' => $entityLookup,
            'bibitem_lookup' => $bibitemLookup,
            'glossary_lookup' => $glossaryLookup,
            'interpretations' => $articles,
            'pageMeta' => [
                'jsonLd' => $article->jsonLdSerialize($this->getRequest()->getLocale()),
                'og' => $this->buildOg($article, 'topic-background', [ 'slug' => $slug ]),
                'twitter' => $this->buildTwitter($article, 'topic-background', [ 'slug' => $slug ]),
            ],
            'route_params_locale_switch' => $localeSwitch, // TODO: put into pageMeta
        ]);
    }
}

<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 *
 */
class EducationController
extends RenderTeiController
{
    static $TOPICS = [
        'Emanzipation, rechtliche Gleichstellung und Aufklärung'
            => 'Emancipation, Legal Equality and Enlightment',
        'Jüdische Religion und Kultur, Vereinswesen'
            => 'Jewish Religion and Culture, Associations',
        'Alltag und Familie'
            => 'Family and Everyday Life',
        'Migration'
            => 'Migration',
        'Antisemitismus und Judenverfolgung'
            => 'Antisemitism and Persecution',
        'Nationalsozialismus'
            => 'National Socialism',
        'Jüdisches Leben nach 1945'
            => 'Jewish Life after 1945',
        'Ego-Dokumente'
            => 'Ego Documents',
        'Erinnern und Gedenken'
            => 'Memory and Remembrance',
    ];

    /* TODO: share the following with AboutController */
    protected function renderTitleContent($title, $template)
    {
        $translator = $this->get('translator');

        return $this->render($template, [
            'pageTitle' => /** @Ignore */ $translator->trans($title),
            'title' => $title,
            'content' => $this->renderContent(),
        ]);
    }

    protected function renderContent()
    {
        $route = $this->get('request')->get('_route');
        $locale = $this->get('request')->getLocale();
        $fnameTei = $route . '.' . $locale . '.xml';

        $params = [ 'lang' => \AppBundle\Utils\Iso639::code1To3($locale) ];

        $html = $this->renderTei($fnameTei, 'dtabf_article-printview.xsl', [ 'params' => $params ]);

        if (false === $html) {
            return '<div class="alert alert-warning">'
                 . 'Error: Invalid or missing file: ' . $fnameTei
                 . '</div>';
        }

        return $html;
    }

    /**
     * @Route("/education", name="education-index")
     */
    public function indexAction(Request $request)
    {
        $kernel = $this->get('kernel');

        $fname = '/Resources/data/education.json';

        try {
            $fname = $kernel->locateResource('@AppBundle' . $fname,
                                             $kernel->getResourcesOverrideDir());
        }
        catch (\InvalidArgumentException $e) {
            $fname = $kernel->getRootDir() . $fname;
        }

        $structure = json_decode(file_get_contents($fname), true);

        // make sure we only pick-up the published ones in the current language
        $language = \AppBundle\Utils\Iso639::code1to3($request->getLocale());

        // we look up jgo:(article|source)\-d+ and fetch if published
        $uids = [];
        $topics = array_keys($structure);
        foreach ($topics as $topic) {
            $entries = $structure[$topic];
            foreach ($entries as $entry) {
                if (preg_match('/^(jgo:(article|source)\-\d+)$/', $entry['url'])) {
                    $uids[] = $entry['url'];
                }
            }

            if ('eng' == $language && array_key_exists($topic, self::$TOPICS)) {
                // rename to topic to english version
                $topicEng = self::$TOPICS[$topic];
                unset($structure[$topic]);
                $structure[$topicEng] = $entries;
            }
        }

        $queryBuilder = $this->getDoctrine()
                ->getManager()
                ->createQueryBuilder()
                ->select('S, A')
                ->from('AppBundle:SourceArticle', 'S')
                ->leftJoin('S.isPartOf', 'A')
                ->where('A.status IN (1) AND A.uid IN(:refs) AND A.language=:language')
                ->orderBy('S.dateCreated', 'ASC')
                ->setParameter('refs', array_unique($uids), \Doctrine\DBAL\Connection::PARAM_STR_ARRAY)
                ->setParameter('language', $language);

        $result = $queryBuilder->getQuery()->getResult();

        $sourcesByUid = [];
        foreach ($result as $source) {
            $uid = $source->getIsPartOf()->getUid();
            if (!array_key_exists($uid, $sourcesByUid)) {
                // take only oldest source if there is more than one per article
                $sourcesByUid[$uid] = $source;
            }
        }

        return $this->render('AppBundle:Education:index.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Teaching Resources'),
            'structure' => $structure,
            'sourcesByUid' => $sourcesByUid,
        ]);
    }

    /**
     * @Route("/education/guidelines", name="about-educationguidelines")
     */
    public function editionguidelinesAction()
    {
        return $this->renderTitleContent($this->get('translator')->trans('Guidelines for the Use of Materials in the Key Documents Edition'),
                                         'AppBundle:Default:sitetext-education.html.twig');
    }

    /**
     * @Route("/education/sourceinterpretation", name="about-educationsourceinterpretation")
     */
    public function educationsourceinterpretationAction()
    {
        return $this->renderTitleContent('Information on Source Interpretation for Students',
                                         'AppBundle:Default:sitetext-education.html.twig');
    }
}

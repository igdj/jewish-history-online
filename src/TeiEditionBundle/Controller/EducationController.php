<?php

namespace TeiEditionBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Contracts\Translation\TranslatorInterface;

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
    protected function renderTitleContent(Request $request,
                                          TranslatorInterface $translator,
                                          $title, $template)
    {
        return $this->render($template, [
            'pageTitle' => /** @Ignore */ $translator->trans($title),
            'title' => $title,
            'content' => $this->renderContent($request),
        ]);
    }

    protected function renderContent(Request $request)
    {
        $route = $request->get('_route');
        $locale = $request->getLocale();

        $fnameTei = $route . '.' . $locale . '.xml';

        $params = [ 'lang' => \TeiEditionBundle\Utils\Iso639::code1To3($locale) ];

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
    public function indexAction(Request $request,
                                TranslatorInterface $translator)
    {
        $fname = 'education.json';

        try {
            $fname = $this->locateData($fname);

            $structure = json_decode(file_get_contents($fname), true);
        }
        catch (\InvalidArgumentException $e) {
            $structure = [];
        }


        // make sure we only pick-up the published ones in the current language
        $language = \TeiEditionBundle\Utils\Iso639::code1to3($request->getLocale());

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
                ->from('\TeiEditionBundle\Entity\SourceArticle', 'S')
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

        return $this->render('@TeiEdition/Education/index.html.twig', [
            'pageTitle' => $translator->trans('Teaching Resources'),
            'structure' => $structure,
            'sourcesByUid' => $sourcesByUid,
        ]);
    }

    /**
     * @Route("/education/guidelines", name="about-educationguidelines")
     */
    public function editionguidelinesAction(Request $request,
                                            TranslatorInterface $translator)
    {
        return $this->renderTitleContent($request, $translator,
                                         'Guidelines for the Use of Materials in the Key Documents Edition',
                                         '@TeiEdition/Default/sitetext-education.html.twig');
    }

    /**
     * @Route("/education/sourceinterpretation", name="about-educationsourceinterpretation")
     */
    public function educationsourceinterpretationAction(Request $request,
                                                        TranslatorInterface $translator)
    {
        return $this->renderTitleContent($request, $translator,
                                         'Information on Source Interpretation for Students',
                                         '@TeiEdition/Default/sitetext-education.html.twig');
    }
}

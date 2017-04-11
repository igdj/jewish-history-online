<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class PlaceController extends Controller
{
    /**
     * @Route("/map")
     *
     * This is the map of all sources
     *
     */
    public function mapAction()
    {
        $qb = $this->getDoctrine()
                ->getRepository('AppBundle:SourceArticle')
                ->createQueryBuilder('A')
                ;

        $qb->select('COUNT(DISTINCT A.id) AS number, P.id AS places, P.name, P.alternateName, COALESCE(A.geo,P.geo) AS geo')
                ->innerJoin('A.contentLocation', 'P')
                ->andWhere('A.status IN (1) AND (P.geo IS NOT NULL OR A.geo IS NOT NULL)')
                ->groupBy('geo, P.id')
                ;

        $locale = $this->get('request')->getLocale();
        if (!empty($locale)) {
            $language = \AppBundle\Utils\Iso639::code1to3($locale);

            $qb->andWhere('A.language = :lang')
                ->setParameter('lang', $language)
                ;
        }

        $result = $qb
                ->getQuery()
                ->getResult();
                ;

        $markers = $this->buildPlaceMarkers($result, $locale);

        return $this->render('AppBundle:Place:map.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Map'),
            'bounds' => [
                [ 34.05, -118.2333 ], // LA, Sonderling
                [ 59.35, 17.9167 ],   // Stockholm, Berendsohn
            ],
            'markers' => $markers,
        ]);
    }

    /**
     * @Route("/map/place")
     *
     * This is the map of all mentioned places
     *
     */
    public function mapMentionedAction()
    {
        $qb = $this->getDoctrine()
                ->getRepository('AppBundle:Article')
                ->createQueryBuilder('A')
                ;

        $qb->select('COUNT(DISTINCT A.id) AS number, P.id AS places, P.name, P.alternateName, P.tgn, P.geo')
                ->innerJoin('A.placeReferences', 'AP')
                ->innerJoin('AP.place', 'P')
                ->andWhere('A.status IN (1) AND P.geo IS NOT NULL')
                ->andWhere("NOT P.type IN('continent')")
                ->groupBy('P.geo, P.id')
                ;

        $locale = $this->get('request')->getLocale();
        if (!empty($locale)) {
            $language = \AppBundle\Utils\Iso639::code1to3($locale);

            $qb->andWhere('A.language = :lang')
                ->setParameter('lang', $language)
                ;
        }

        $result = $qb
                ->getQuery()
                ->getResult()
                ;

        $markers = $this->buildPlaceMarkers($result, $locale);

        return $this->render('AppBundle:Place:map.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Map'),
            'bounds' => [
                [ 60, -120 ],
                [ -15, 120 ],
            ],
            'markers' => $markers,
        ]);
    }

    protected function buildPlaceMarkers($result, $locale)
    {
        $place = new \AppBundle\Entity\Place();
        $markers = [];
        foreach ($result as $position) {
            $geo = $position['geo'];
            if (empty($geo)) {
                continue;
            }
            // localize name
            $place->setName($position['name']);
            $place->setAlternateName($position['alternateName']);
            $position['name'] = $place->getNameLocalized($locale);
            if (!array_key_exists($geo, $markers)) {
                unset($position['geo']);
                $position['number'] = (int)($position['number']);
                $latLng = explode(',', $geo);
                $position['latLng'] = [ (double)$latLng[0], (double)$latLng[1] ];
                $markers[$geo] = $position;
            }
            else {
                $markers[$geo]['number'] += $position['number'];
                $markers[$geo]['places'] .= ',' . $position['places'];
            }
        }
        return $markers;
    }


    /**
     * @Route("/map/popup-content/{ids}")
     */
    public function mapPopupContentAction($ids)
    {
        if (empty($ids)) {
            $articles = [];
        }
        else {
            $request = $this->get('request');

            $mentioned = 'place-map-mentioned' == $request->get('caller');

            $ids = explode(',', $ids);
            $qb = $this->getDoctrine()
                    ->getRepository($mentioned ? 'AppBundle:Article' : 'AppBundle:SourceArticle')
                    ->createQueryBuilder('A')
                    ;

            $qb->select('A')
                    ->distinct()
                    ->andWhere('A.status IN (1) AND P.id IN (:ids)')
                    ->setParameter('ids', $ids)
                    ;

            if ($mentioned) {
                $qb
                ->innerJoin('A.placeReferences', 'AP')
                ->innerJoin('AP.place', 'P');
            }
            else {
                $qb->innerJoin('A.contentLocation', 'P');

                $geo = $request->get('geo');
                if (!empty($geo)) {
                    $qb->andWhere('A.geo = :geo OR (A.geo IS NULL AND P.geo = :geo)')
                        ->setParameter('geo', $geo)
                        ;
                }
            }


            $locale = $request->getLocale();
            if (!empty($locale)) {
                $qb->andWhere('A.language = :lang')
                    ->setParameter('lang', \AppBundle\Utils\Iso639::code1to3($locale))
                    ;
            }

            $qb->addOrderBy('A.dateCreated', 'ASC')
                ->addOrderBy('A.name', 'ASC');

            $articles = $qb
                    ->getQuery()
                    ->getResult();
                    ;
        }

        return $this->render('AppBundle:Place:map-popup-content.html.twig', [
            'articles' => $articles,
        ]);
    }

    /**
     * @Route("/place")
     */
    public function indexAction()
    {
        $places = $this->getDoctrine()
                ->getRepository('AppBundle:Place')
                ->findBy([ 'type' => 'inhabited place' ],
                         [ 'name' => 'ASC' ]);

        return $this->render('AppBundle:Place:index.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Places'),
            'places' => $places,
        ]);
    }

    public function detailAction($id = null, $tgn = null)
    {
        $placeRepo = $this->getDoctrine()
                ->getRepository('AppBundle:Place');

        if (!empty($id)) {
            $place = $placeRepo->findOneById($id);
        }
        else if (!empty($tgn)) {
            $place = $placeRepo->findOneByTgn($tgn);
        }
        /*
        else if (!empty($gnd)) {
            $place = $placeRepo->findOneByGnd($gnd);

        }
        */

        if (!isset($place) /* || $place->getStatus() < 0 */) {
            return $this->redirectToRoute('place-index');
        }

        if (in_array($this->container->get('request')->get('_route'), [ 'place-jsonld', 'place-by-tgn-jsonld' ])) {
            return new JsonLdResponse($place->jsonLdSerialize($this->getRequest()->getLocale()));
        }

        return $this->render('AppBundle:Place:detail.html.twig', [
            'pageTitle' => $place->getNameLocalized($this->get('request')->getLocale()),
            'place' => $place,
            'pageMeta' => [
                'jsonLd' => $place->jsonLdSerialize($this->getRequest()->getLocale()),
            ],
        ]);
    }
}

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
     */
    public function mapAction()
    {
        $qb = $this->getDoctrine()
                ->getRepository('AppBundle:SourceArticle')
                ->createQueryBuilder('A')
                ;

        $qb->select('COUNT(DISTINCT A.id) AS number, P.id AS places, P.name, P.geo')
                ->innerJoin('A.contentLocation', 'P')
                ->andWhere('P.geo IS NOT NULL')
                ->groupBy('P.id')
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

        $markers = [];
        foreach ($result as $position) {
            $geo = $position['geo'];
            if (empty($geo)) {
                continue;
            }
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

        return $this->render('AppBundle:Place:map.html.twig',
                             [ 'markers' => $markers ]);
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
            $ids = explode(',', $ids);
            $qb = $this->getDoctrine()
                    ->getRepository('AppBundle:SourceArticle')
                    ->createQueryBuilder('A')
                    ;

            $qb->select('A.uid, A.name')
                    ->distinct()
                    ->innerJoin('A.contentLocation', 'P')
                    ->andWhere('P.id IN (:ids)')
                    ->setParameter('ids', $ids)
                    ;

            $locale = $this->get('request')->getLocale();
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
        return $this->render('AppBundle:Place:map-popup-content.html.twig',
                             [ 'articles' => $articles ]);

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

        return $this->render('AppBundle:Place:index.html.twig',
                             [ 'places' => $places ]);
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

        return $this->render('AppBundle:Place:detail.html.twig',
                             array('place' => $place));
    }

}

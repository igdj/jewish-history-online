<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class PlaceController
extends Controller
{
    use MapHelperTrait;

    /**
     * @Route("/map", name="place-map")
     *
     * This is the map of all sources
     *
     */
    public function mapAction()
    {
        list($markers, $bounds) = $this->buildMap('place-map-mentioned' == $this->container->get('request')->get('_route'));

        return $this->render('AppBundle:Place:map.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Map'),
            'bounds' => $bounds,
            'markers' => $markers,
        ]);
    }

    /**
     * @Route("/map/popup-content/{ids}", name="place-map-popup-content")
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
     * @Route("/place", name="place-index")
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

<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;

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
     * Display map of sources and mentioned places
     *
     * @Route("/map", name="place-map")
     * @Route("/map/place", name="place-map-mentioned")
     *
     */
    public function mapAction(Request $request)
    {
        list($markers, $bounds) = $this->buildMap($request->getLocale(), 'place-map-mentioned' == $request->get('_route'));

        return $this->render('AppBundle:Place:map.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Map'),
            'bounds' => $bounds,
            'markers' => $markers,
        ]);
    }

    /**
     * @Route("/map/popup-content/{ids}", name="place-map-popup-content")
     */
    public function mapPopupContentAction(Request $request, $ids)
    {
        if (empty($ids)) {
            $articles = [];
        }
        else {
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

    /**
     * @Route("/place/{id}.jsonld", name="place-jsonld")
     * @Route("/place/{id}", name="place")
     * @Route("/place/tgn/{tgn}.jsonld", name="place-by-tgn-jsonld")
     * @Route("/place/tgn/{tgn}", name="place-by-tgn")
     */
    public function detailAction(Request $request, $id = null, $tgn = null)
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

        if (in_array($request->get('_route'), [ 'place-jsonld', 'place-by-tgn-jsonld' ])) {
            return new JsonLdResponse($place->jsonLdSerialize($request->getLocale()));
        }

        // get the persons associated with this place, currently birthplace / deathplace
        $qb = $this->getDoctrine()
                ->getManager()
                ->createQueryBuilder();

        $qb->select([
                'P',
                "CONCAT(COALESCE(P.familyName,P.givenName), ' ', COALESCE(P.givenName, '')) HIDDEN nameSort"
            ])
            ->from('AppBundle:Person', 'P')
            ->where("P.birthPlace = :place OR P.deathPlace = :place")
            ->andWhere('P.status <> -1')
            ->orderBy('P.birthDate')
            ->addOrderBy('nameSort')
            ;

        $persons = $qb->getQuery()
            ->setParameter('place', $place)
            ->getResult();


        return $this->render('AppBundle:Place:detail.html.twig', [
            'pageTitle' => $place->getNameLocalized($request->getLocale()),
            'place' => $place,
            'persons' => $persons,
            'pageMeta' => [
                'jsonLd' => $place->jsonLdSerialize($request->getLocale()),
            ],
        ]);
    }
}

<?php

namespace TeiEditionBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Contracts\Translation\TranslatorInterface;

/**
 *
 */
class PlaceController
extends BaseController
{
    use MapHelperTrait;

    /**
     * Display map of sources and mentioned places
     *
     * @Route("/map", name="place-map")
     * @Route("/map/place", name="place-map-mentioned")
     * @Route("/map/landmark", name="place-map-landmark")
     *
     */
    public function mapAction(Request $request, TranslatorInterface $translator)
    {
        list($markers, $bounds) = $this->buildMap($request->getLocale(),
                                                  str_replace('place-map-', '', $request->get('_route')));

        return $this->render('@TeiEdition/Place/map.html.twig', [
            'pageTitle' => $translator->trans('Map'),
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
            $mode = str_replace('place-map-', '', $request->get('caller'));

            $ids = explode(',', $ids);
            $qb = $this->getDoctrine()
                    ->getRepository(in_array($mode, [ 'mentioned', 'landmark' ])
                                             ? '\TeiEditionBundle\Entity\Article' : '\TeiEditionBundle\Entity\SourceArticle')
                    ->createQueryBuilder('A')
                    ;

            $qb->select('A')
                    ->distinct()
                    ->andWhere('A.status IN (1) AND P.id IN (:ids)')
                    ->setParameter('ids', $ids)
                    ;

            if ('mentioned' == $mode) {
                $qb
                ->innerJoin('A.placeReferences', 'AP')
                ->innerJoin('AP.place', 'P');
            }
            else if ('landmark' == $mode) {
                $qb
                ->innerJoin('A.landmarkReferences', 'AL')
                ->innerJoin('AL.landmark', 'P');

                $geo = $request->get('geo');
                if (!empty($geo)) {
                    $qb->andWhere('P.geo = :geo')
                        ->setParameter('geo', $geo)
                        ;
                }
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
                    ->setParameter('lang', \TeiEditionBundle\Utils\Iso639::code1to3($locale))
                    ;
            }

            $qb->addOrderBy('A.dateCreated', 'ASC')
                ->addOrderBy('A.name', 'ASC');

            $articles = $qb
                    ->getQuery()
                    ->getResult();
                    ;
        }

        return $this->render('@TeiEdition/Place/map-popup-content.html.twig', [
            'articles' => $articles,
        ]);
    }

    /**
     * @Route("/place", name="place-index")
     */
    public function indexAction(TranslatorInterface $translator)
    {
        $places = $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\Place')
                ->findBy([ 'type' => 'inhabited place' ],
                         [ 'name' => 'ASC' ]);

        return $this->render('@TeiEdition/Place/index.html.twig', [
            'pageTitle' => $translator->trans('Places'),
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
                ->getRepository('\TeiEditionBundle\Entity\Place');

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
            ->from('\TeiEditionBundle\Entity\Person', 'P')
            ->where("P.birthPlace = :place OR P.deathPlace = :place")
            ->andWhere('P.status <> -1')
            ->orderBy('P.birthDate')
            ->addOrderBy('nameSort')
            ;

        $persons = $qb->getQuery()
            ->setParameter('place', $place)
            ->getResult();


        return $this->render('@TeiEdition/Place/detail.html.twig', [
            'pageTitle' => $place->getNameLocalized($request->getLocale()),
            'place' => $place,
            'persons' => $persons,
            'pageMeta' => [
                'jsonLd' => $place->jsonLdSerialize($request->getLocale()),
            ],
        ]);
    }

    /**
     * @Route("/landmark/{id}.jsonld", name="landmark-jsonld")
     * @Route("/landmark/{id}", name="landmark")
     */
    public function landmarkDetailAction(Request $request, $id = null)
    {
        $landmarkRepo = $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\Landmark');

        if (!empty($id)) {
            $landmark = $landmarkRepo->findOneById($id);
        }

        if (!isset($landmark) || $landmark->getStatus() < 0) {
            return $this->redirectToRoute('place-map-landmark');
        }

        if (in_array($request->get('_route'), [ 'landmark-jsonld' ])) {
            return new JsonLdResponse($landmark->jsonLdSerialize($request->getLocale()));
        }

        return $this->render('@TeiEdition/Place/landmark-detail.html.twig', [
            'pageTitle' => $landmark->getNameLocalized($request->getLocale()),
            'landmark' => $landmark,
            'pageMeta' => [
                'jsonLd' => $landmark->jsonLdSerialize($request->getLocale()),
            ],
        ]);
    }
}

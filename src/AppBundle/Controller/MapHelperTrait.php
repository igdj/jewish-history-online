<?php

/**
 * Shared methods to build the maps
 */

namespace AppBundle\Controller;

trait MapHelperTrait
{
    /**
     *
     */
    protected function buildPlaceMarkers($result, $locale, $geoPrimary = null)
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
                $position['primary'] = is_null($geoPrimary) || array_key_exists($geo, $geoPrimary);
                $markers[$geo] = $position;
            }
            else {
                $markers[$geo]['number'] += $position['number'];
                $markers[$geo]['places'] .= ',' . $position['places'];
            }
        }

        return $markers;
    }

    public function buildMap($locale, $mentioned = false)
    {
        $qb = $this->getDoctrine()
                ->getRepository($mentioned ? 'AppBundle:Article' : 'AppBundle:SourceArticle')
                ->createQueryBuilder('A')
                ;

        $geoPrimary = null;
        if ($mentioned) {
            // set $geoPrimary = [ 'geo0' => 1, 'geo1' => 1, ... ] for quick lookup
            $geo = $this->getDoctrine()
                ->getRepository('AppBundle:SourceArticle')
                ->createQueryBuilder('A')
                ->select('COALESCE(A.geo,P.geo) AS geo')
                ->distinct()
                ->innerJoin('A.contentLocation', 'P')
                ->andWhere('A.status IN (1) AND (P.geo IS NOT NULL OR A.geo IS NOT NULL)')
                ->getQuery()
                ->getScalarResult()
                ;

            // https://stackoverflow.com/a/13462039/2114681
            $geoPrimary = array_reduce($geo,
                function ($result, $row) {
                    $result[$row['geo']] = 1;
                    return $result;
                }, []);

            $qb->select('COUNT(DISTINCT A.id) AS number, P.id AS places, P.name, P.alternateName, P.tgn, P.geo')
                    ->innerJoin('A.placeReferences', 'AP')
                    ->innerJoin('AP.place', 'P')
                    ->andWhere('A.status IN (1) AND P.geo IS NOT NULL')
                    ->andWhere("NOT P.type IN('continent')")
                    ->groupBy('P.geo, P.id')
                    ;
        }
        else {
            $qb->select('COUNT(DISTINCT A.id) AS number, P.id AS places, P.name, P.alternateName, COALESCE(A.geo,P.geo) AS geo')
                ->innerJoin('A.contentLocation', 'P')
                ->andWhere('A.status IN (1) AND (P.geo IS NOT NULL OR A.geo IS NOT NULL)')
                ->groupBy('geo, P.id')
                ;
        }

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

        $markers = $this->buildPlaceMarkers($result, $locale, $geoPrimary);

        return [
            $markers, $mentioned
                ? [
                    [ 60, -120 ],
                    [ -15, 120 ],
                ]
                : [
                    [ 34.05, -118.2333 ], // LA, Sonderling
                    [ 60, 122 ],   // 59.35: Stockholm, 121.5: Shanghai
                ],
        ];
    }
}

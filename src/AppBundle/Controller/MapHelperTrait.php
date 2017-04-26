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

    public function buildMap($mentioned = false)
    {
        $qb = $this->getDoctrine()
                ->getRepository($mentioned ? 'AppBundle:Article' : 'AppBundle:SourceArticle')
                ->createQueryBuilder('A')
                ;

        if ($mentioned) {
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

        return [
            $markers, $mentioned
                ? [
                    [ 60, -120 ],
                    [ -15, 120 ],
                ]
                : [
                    [ 34.05, -118.2333 ], // LA, Sonderling
                    [ 59.35, 17.9167 ],   // Stockholm, Berendsohn
                ],
        ];
    }
}

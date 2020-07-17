<?php

/**
 * Shared methods to build the maps
 */

namespace TeiEditionBundle\Controller;

trait MapHelperTrait
{
    /**
     *
     */
    protected function buildPlaceMarkers($result, $locale, $geoPrimary = null)
    {
        $place = new \TeiEditionBundle\Entity\Place();
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

                if (!empty($position['type'])) {
                    switch ($position['type']) {
                        case 'landmark':
                            $position['url'] = $this->generateUrl('landmark', [
                                'id' => $position['id'],
                            ]);
                            break;
                    }
                }

                $markers[$geo] = $position;
            }
            else {
                $markers[$geo]['number'] += $position['number'];
                $markers[$geo]['places'] .= ',' . $position['places'];
            }
        }

        return $markers;
    }

    public function buildMap($locale, $mode = '')
    {
        switch ($mode) {
            case 'landmark':
                $entityName = '\TeiEditionBundle\Entity\Article';
                $boundingBox = [
                    [ 53.549405, 9.950503 ], // Königsstraße
                    [ 53.6154844, 10.038958900000011 ], // Jüdischer Friedhof an der Ilandkoppel
                ];
                break;

            case 'mentioned':
                $entityName = '\TeiEditionBundle\Entity\Article';
                $boundingBox = [
                    [ 60, -120 ],
                    [ -15, 120 ],
                ];
                break;

            default:
                $entityName = '\TeiEditionBundle\Entity\SourceArticle';
                $boundingBox = [
                    [ 34.05, -118.2333 ], // LA, Sonderling
                    [ 60, 122 ],   // 59.35: Stockholm, 121.5: Shanghai
                ];
        }

        $qb = $this->getDoctrine()
                ->getRepository($entityName)
                ->createQueryBuilder('A')
                ;

        $geoPrimary = null;
        if ('mentioned' == $mode) {
            // set $geoPrimary = [ 'geo0' => 1, 'geo1' => 1, ... ] for quick lookup
            $geo = $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\SourceArticle')
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
        else if ('landmark' == $mode) {
            $qb->select("COUNT(DISTINCT A.id) AS number, P.id AS places, P.id AS id, 'landmark' AS type, P.name, P.alternateName, COALESCE(A.geo,P.geo) AS geo")
                ->innerJoin('A.landmarkReferences', 'AL')
                ->innerJoin('AL.landmark', 'P')
                ->andWhere('A.status IN (1) AND (P.geo IS NOT NULL)')
                ->groupBy('geo, P.id')
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
            $language = \TeiEditionBundle\Utils\Iso639::code1to3($locale);

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
            $markers,
            $boundingBox,
        ];
    }
}

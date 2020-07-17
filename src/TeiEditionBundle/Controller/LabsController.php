<?php

namespace TeiEditionBundle\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Contracts\Translation\TranslatorInterface;

/**
 *
 */
class LabsController
extends BaseController
{
    /**
     * @Route("/labs", name="labs-index")
     */
    public function indexAction(TranslatorInterface $translator)
    {
        return $this->render('@TeiEdition/Labs/index.html.twig', [
            'pageTitle' => $translator->trans('Labs'),
        ]);
    }

    /**
     * @Route("/labs/person-by-year", name="person-by-year")
     */
    public function personByYearAction()
    {
        // display the person by birth-year, the catalog-entries by exhibition-year
        $em = $this->getDoctrine()->getEntityManager();

        $dbconn = $em->getConnection();
        $querystr = "SELECT 'active' AS type, COUNT(*) AS how_many FROM person"
                  . " WHERE status >= 0 AND birthdate IS NOT NULL"
                  // . "  AND sex IS NOT NULL"
                  ;
        $querystr .= " UNION SELECT 'total' AS type, COUNT(*) AS how_many"
                   . " FROM person WHERE status >= 0";
        $stmt = $dbconn->query($querystr);
        $subtitle_parts = [];
        while ($row = $stmt->fetch()) {
          if ('active' == $row['type']) {
            $total_active = $row['how_many'];
          }
          $subtitle_parts[] = $row['how_many'];
        }
        $subtitle = implode(' out of ', $subtitle_parts) . ' persons';

        $data = [];
        $max_year = $min_year = 0;
        foreach (['birth', 'death'] as $key) {
            $date_field = $key . 'date';
            $querystr = 'SELECT YEAR(' . $date_field . ') AS year'
                      // . ', sex'
                      . ', COUNT(*) AS how_many'
                      . ' FROM person WHERE status >= 0 AND ' . $date_field . ' IS NOT NULL'
                      // . ' AND sex IS NOT NULL'
                      . ' GROUP BY YEAR(' . $date_field. ')'
                      // . ', sex'
                      . ' ORDER BY YEAR(' . $date_field . ')'
                      //. ', sex'
                      ;
            $stmt = $dbconn->query($querystr);

            while ($row = $stmt->fetch()) {
                if (0 == $min_year || $row['year'] < $min_year) {
                    $min_year = $row['year'];
                }
                if ($row['year'] > $max_year) {
                    $max_year = $row['year'];
                }
                if (!isset($data[$row['year']])) {
                    $data[$row['year']] = [];
                }
                if (!array_key_exists($key, $data[$row['year']])) {
                    $data[$row['year']][$key] = 0;
                }
                $data[$row['year']][$key] += $row['how_many'];
            }
        }

        if ($min_year < 1760) {
            $min_year = 1760;
        }
        if ($max_year > 2020) {
            $max_year = 2020;
        }

        $categories = [];
        $smooth = 5;
        for ($year = $min_year; $year <= $max_year; $year += $smooth) {
            $categories[] = 0 == $year % 5 ? $year : '';
            foreach (['birth', 'death',
                           // 'works',
                      'works_issued_base', 'works_issued_extended']
                     as $key)
            {
                $total[$key][$year] = [
                    'name' => $year . ($smooth > 1 ? '-' . ($year + $smooth - 1) : ''),
                    'y' => isset($data[$year][$key])
                        ? intval($data[$year][$key]) : 0,
                ];
                for ($i = 1; $i < $smooth; $i++) {
                    if (isset($data[$year + $smooth][$key])) {
                        $total[$key][$year]['y'] += $data[$year + $smooth][$key];
                    }
                }
            }
        }

        return $this->render('@TeiEdition/Labs:person-by-year.html.twig', [
            'subtitle' => json_encode($subtitle),
            'categories' => json_encode($categories),
            'person_birth' => json_encode(array_values($total['birth'])),
            'person_death' => json_encode(array_values($total['death'])),
        ]);
    }

    /**
     * @Route("/labs/person-by-birthplace", name="person-by-birthplace")
     * @Route("/labs/person-by-deathplace", name="person-by-deathplace")
     */
    public function birthDeathPlaces(\Symfony\Component\HttpFoundation\Request $request)
    {
        $field = 'person-by-deathplace' == $request->get('_route')
            ? 'deathplace' : 'birthplace';

        $em = $this->getDoctrine()->getEntityManager();
        $dbconn = $em->getConnection();
        $querystr = "SELECT person.id AS person_id, person.familyName, person.givenName, birthdate, deathdate, COALESCE(place.name) AS place, place.tgn, geo"
                  . " FROM person"
                  . " INNER JOIN place ON person.{$field}_id=place.id"
                  . " WHERE"
                  . " person.status <> -1"
                  . " ORDER BY tgn, person.familyName, person.givenName"
                  ;
        $stmt = $dbconn->query($querystr);
        $values = [];
        while ($row = $stmt->fetch()) {
            if (empty($row['geo'])) {
                continue;
            }

            $key = $row['geo'];

            if (!array_key_exists($key, $values)) {
                $values[$key]  = [
                    'geo' => $row['geo'],
                    'place' => sprintf('<a href="%s">%s</a>',
                                       htmlspecialchars($this->generateUrl('place-by-tgn', [
                                            'tgn' => $row['tgn'],
                                       ])),
                                       htmlspecialchars($row['place'])),
                    'persons' => [],
                ];
            }

            $values[$key]['persons'][] = sprintf('<a href="%s">%s</a>',
                                                 htmlspecialchars($this->generateUrl('person', [
                                                    'id' => $row['person_id'],
                                                ])),
                                                $row['familyName'] . ', ' . $row['givenName']);
        }
        $values_final = [];
        foreach ($values as $key => $value) {
            $latLng = explode(',', $value['geo']);
            $values_final[] = [
                (double)$latLng[0], (double)$latLng[1],
                $value['place'],
                implode('<br />', $value['persons']),
                count($value['persons']),
            ];
        }

        // display
        return $this->render('@TeiEdition/Labs/person-by-place.html.twig', [
            'pageTitle' => sprintf('Persons by %s Place',
                                   'birthplace' == $field ? 'Birth' : 'Death'),
            'data' => json_encode($values_final),
            'bounds' => [
                [ 60, -120 ],
                [ -15, 120 ],
            ],
        ]);
    }

    /**
     * @Route("/labs/person-birth-death", name="person-birth-death")
     */
    public function personBirthDeathAction(\Symfony\Component\HttpFoundation\Request $request)
    {
        $em = $this->getDoctrine()->getEntityManager();

        $dbconn = $em->getConnection();

        $querystr = "SELECT place.tgn AS tgn, place.name AS name, 'XX' AS country_code"
                  . ' FROM person INNER JOIN place ON person.deathplace_id=place.id'
                  . ' WHERE person.status <> -1'
                  // . " AND country_code IN ('IL')"
                  . ' GROUP BY country_code, place.name, place.tgn'
                  . ' ORDER BY country_code, place.name, place.tgn'
                  ;
        $stmt = $dbconn->query($querystr);
        $deathplaces_by_country = [];
        while ($row = $stmt->fetch()) {
            $deathplaces_by_country[$row['country_code']][$row['tgn']] = $row['name'];
        }
        $missingplaces_by_country = [];

        $dependencies = [];
        foreach ($deathplaces_by_country as $country_code => $places) {
            foreach ($places as $tgn => $place) {
                // find all birth-places as dependencies
                $querystr = "SELECT pb.tgn AS tgn, pb.name AS name, 'XX' AS country_code, COUNT(*) AS how_many"
                          . ' FROM person'
                          . ' INNER JOIN place pb ON person.birthplace_id=pb.id'
                          . ' INNER JOIN place pd ON person.deathplace_id=pd.id'
                          . " WHERE pd.tgn='" . $tgn. "' AND person.status <> -1"
                          . ' GROUP BY country_code, pb.name, pb.tgn';
                $stmt = $dbconn->query($querystr);
                $dependencies_by_place = [];
                while ($row = $stmt->fetch()) {
                    // add to $missingplaces_by_country if not already in $death_by_country
                    if (!isset($deathplaces_by_country[$row['country_code']])
                        || !isset($deathplaces_by_country[$row['country_code']][$row['tgn']]))
                    {
                        $missingplaces_by_country[$row['country_code']][$row['tgn']] = $row['name'];
                    }
                    $place_key = 'place.' . $row['country_code'] . '.' . $row['tgn'];
                    $dependencies_by_place[] = $place_key;
                }
                $place_key = 'place.' . $country_code . '.' . $tgn;
                $entry = [
                    'name' => $place_key,
                    'label' => $place,
                    'size' => 1,
                    'imports' => [],
                ];
                if (!empty($dependencies_by_place)) {
                    $entry['imports'] = $dependencies_by_place;
                }

                $dependencies[] = $entry;
            }
        }

        foreach ($missingplaces_by_country as $country_code => $places) {
            arsort($places);
            foreach ($places as $tgn => $place) {
                $place_key = $country_code . '.' . $tgn;
                $entry = [
                    'name' => 'place.' . $place_key,
                    'label' => $place,
                    'size' => 1,
                    'imports' => [],
                ];
                $dependencies[] = $entry;
            }
        }

        // display the static content
        return $this->render('@TeiEdition/Labs/person-birth-death.html.twig', [
            'dependencies' => $dependencies,
        ]);
    }

    private function setEdges(&$edges, $shared_ids, $weighted = false)
    {
        $count_shared_ids = count($shared_ids);
        for ($i = 0; $i < $count_shared_ids - 1; $i++) {
            $src_id = $shared_ids[$i];
            for ($j = $i + 1; $j < $count_shared_ids; $j++) {
                $target_id = $shared_ids[$j];
                $src_target = $src_id < $target_id
                    ? array($src_id, $target_id)
                    : array($target_id, $src_id);
                $edge_key = join(',', $src_target);
                if (!array_key_exists($edge_key, $edges)) {
                    $edges[$edge_key] = 0;
                }
                if ($weighted) {
                    $edges[$edge_key] += 1.0 / ($count_shared_ids - 1);
                }
                else {
                    $edges[$edge_key] += 1;
                }
            }
        }
    }

    /**
     * @Route("/labs/person-gdf", name="person-gdf")
     */
    public function personGdfAction(\Symfony\Component\HttpFoundation\Request $request)
    {
        $locale = $request->getLocale();
        if (!empty($locale)) {
            $language = \TeiEditionBundle\Utils\Iso639::code1to3($locale);
        }

        $em = $this->getDoctrine()->getEntityManager();
        $qb = $em->createQueryBuilder();
        $qb->select("P.id, CONCAT(COALESCE(P.givenName,''), ' ', COALESCE(P.familyName, '')) AS name, count(AR.id) AS counter")
            ->from('\TeiEditionBundle\Entity\Person', 'P')
            ->join('P.articleReferences', 'AR')
            ->join('\TeiEditionBundle\Entity\Article', 'A',
                   \Doctrine\ORM\Query\Expr\Join::WITH,
                   'A = AR.article')
            ->where('P.status IN (0,1)')
            ->andWhere('A.status = 1')
            ->andWhere('A.language = :language')
            ->groupby('P.id')
            ->having('counter >= 2')
            ->orderBy('counter', 'DESC')
            ;

        $query = $qb
               ->getQuery();
        $query->setParameter('language', $language);
        $results = $query->getResult();
        $nodes = $edges = [];
        foreach ($results as $result) {
            $nodes[$result['id']] = trim(str_replace(',', ' ', $result['name']));
        }

        $ret = 'nodedef>name VARCHAR,label VARCHAR' . "\n";
        foreach ($nodes as $node_id => $node_label) {
            $ret .= implode(',', [ $node_id, $node_label ]) . "\n";
        }

        $qb = $em->createQueryBuilder();
        $qb->select('AP.id AS prId, A.id as articleId', 'P.id AS personId')
            ->from('\TeiEditionBundle\Entity\ArticlePerson', 'AP')
            ->join('\TeiEditionBundle\Entity\Article', 'A',
                   \Doctrine\ORM\Query\Expr\Join::WITH,
                   'A = AP.article')
            ->join('\TeiEditionBundle\Entity\Person', 'P',
                   \Doctrine\ORM\Query\Expr\Join::WITH,
                   'P = AP.person')
            ->where('A.status = 1')
            ->andWhere('A.language = :language')
            ->orderBy('articleId', 'ASC');

        $query = $qb
               ->getQuery();
        $query->setParameter('language', $language);

        $results = $query->getResult();
        $last_reportId = -1;
        $persons = [];
        foreach ($results as $result) {
            if ($last_reportId != $result['articleId']) {
                if (count($persons) > 1) {
                    $this->setEdges($edges, $persons);
                }
                $persons = [];
                $last_reportId = $result['articleId'];
                $ret .= 'ID: ' . $last_reportId . "\n";
            }
            $person_id = $result['personId'];
            if (array_key_exists($person_id, $nodes)) {
                // var_dump($result);
                $persons[] = $person_id;
            }
        }
        if (count($persons) > 1) {
            $this->setEdges($edges, $persons);
        }

        $ret .= 'edgedef>node1 VARCHAR,node2 VARCHAR, weight DOUBLE' . "\n";
        foreach ($edges as $edge_key => $edge_count) {
            $ret .= join(',', [$edge_key, $edge_count]) . "\n";
        }

        return new \Symfony\Component\HttpFoundation\Response($ret, \Symfony\Component\HttpFoundation\Response::HTTP_OK,
                                                              [ 'Content-Type' => 'text/plain; charset=UTF-8' ]);
    }

    protected function buildNode($type, $id)
    {
        $repo = $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\\' . ucfirst($type));

        $entity = $repo->findOneById($id);

        return str_replace(',', ' ', $entity->getName());
    }

    /**
     * @Route("/labs/article-gdf", name="article-gdf")
     */
    public function articleGdfAction(\Symfony\Component\HttpFoundation\Request $request)
    {
        $locale = $request->getLocale();
        if (!empty($locale)) {
            $language = \TeiEditionBundle\Utils\Iso639::code1to3($locale);
        }

        $em = $this->getDoctrine()->getEntityManager();

        // select all entities that are in at least two articles
        $dbconn = $em->getConnection();
        $querystr = "SELECT entity_id, type, COUNT(DISTINCT article.id) AS counter"
                  . " FROM article_entity"
                  . " INNER JOIN article"
                  . " ON article.id=article_id AND article.status IN (0,1) AND article.language='" . $language . "'"
                  . " AND type IN ('person', 'organization', 'bibitem') AND articleSection = 'interpretation'"
                  . " GROUP BY entity_id, type"
                  . " HAVING counter >= 2";

        $qb = $em->createQueryBuilder();
        $stmt = $dbconn->query($querystr);
        $entities = [];
        while ($row = $stmt->fetch()) {
            $type = $row['type'];
            if (!array_key_exists($type, $entities)) {
                $entities[$type] = [];
            }
            $entities[$type][] = $row['entity_id'];
        }

        $related = [];
        foreach ($entities as $type => $ids) {
            $related[$type] = [];

            $target =  ucfirst($type);
            $relation = 'Article' . $target;

            $qb = $em->createQueryBuilder();
            $qb->select('A.id AS articleId, T.id AS targetId')
                ->from('\TeiEditionBundle\Entity\\' . $relation, 'AR')
                ->join('\TeiEditionBundle\Entity\Article', 'A',
                    \Doctrine\ORM\Query\Expr\Join::WITH,
                    'A = AR.article')
                ->join('\TeiEditionBundle\Entity\\' . $target, 'T',
                       \Doctrine\ORM\Query\Expr\Join::WITH,
                       'T = AR.' . $type)
                ->where('A.status = 1')
                ->andWhere('A.language = :language')
                ->andWhere("A.articleSection = 'interpretation'")
                ->andWhere('T.id IN (:ids)')
                ->addOrderBy('targetId', 'ASC')
                ->addOrderBy('articleId', 'ASC');

            $query = $qb
                   ->getQuery();
            $query->setParameter('language', $language);
            $query->setParameter('ids', $ids, \Doctrine\DBAL\Connection::PARAM_STR_ARRAY);

            $results = $query->getResult();
            foreach ($results as $result) {
                if (!array_key_exists($result['targetId'], $related[$type])) {
                    $related[$type][$result['targetId']] = [];
                }
                $related[$type][$result['targetId']][] = $result['articleId'];
            }
        }

        $nodes = $edges = [];
        foreach ($related as $type => $results) {
            foreach ($results as $id => $article_ids) {
                for ($i = 0; $i < count($article_ids) - 1; $i++) {
                    for ($j = $i + 1; $j < count($article_ids); $j++) {
                        $src_id = $article_ids[$i];
                        $target_id = $article_ids[$j];
                        if (!isset($nodes[$src_id])) {
                            $nodes[$src_id] = $this->buildNode('Article', $src_id);
                        }
                        if (!isset($nodes[$target_id])) {
                            $nodes[$target_id] = $this->buildNode('Article', $target_id);
                        }
                        $edge_key = join(',', [$src_id, $target_id]);
                        if (!array_key_exists($edge_key, $edges)) {
                            $edges[$edge_key] = [];
                        }
                        $edges[$edge_key][] = $type . ':' . $id;
                    }
                }
            }
        }

        $ret = 'nodedef>name VARCHAR,label VARCHAR' . "\n";
        foreach ($nodes as $node_id => $node_label) {
            $ret .= implode(',', [ $node_id, $node_label ]) . "\n";
        }

        $ret .= 'edgedef>node1 VARCHAR,node2 VARCHAR, weight DOUBLE,label VARCHAR' . "\n";
        foreach ($edges as $edge_key => $names) {
            $ret .= join(',', [ $edge_key, count($names), implode('; ', $names) ]) . "\n";
        }

        return new \Symfony\Component\HttpFoundation\Response($ret, \Symfony\Component\HttpFoundation\Response::HTTP_OK,
                                                              [ 'Content-Type' => 'text/plain; charset=UTF-8' ]);
    }
}

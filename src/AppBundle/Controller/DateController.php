<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class DateController extends Controller
{
    /**
     * @Route("/chronology")
     */
    public function chronologyAction()
    {
        $criteria = [ 'status' => [ 1 ] ];

        $locale = $this->get('request')->getLocale();
        if (!empty($locale)) {
            $criteria['language'] = \AppBundle\Utils\Iso639::code1to3($locale);
        }

        $queryBuilder = $this->getDoctrine()
                ->getEntityManager()
                ->createQueryBuilder()
                ->select('S, A')
                ->from('AppBundle:SourceArticle', 'S')
                ->leftJoin('S.isPartOf', 'A')
                ->orderBy('S.dateCreated', 'ASC')
                ;
        foreach ($criteria as $field => $cond) {
            $queryBuilder->andWhere('S.' . $field
                                    . (is_array($cond)
                                       ? ' IN (:' . $field . ')'
                                       : '= :' . $field))
                ->setParameter($field, $cond);
        }

        $result = $queryBuilder->getQuery()->getResult();

        return $this->render('AppBundle:Date:chronology.html.twig',
                             [
                                'pageTitle' =>  $this->get('translator')
                                                    ->trans('Chronology'),
                                'articles' => $result,
                              ]);
    }

}

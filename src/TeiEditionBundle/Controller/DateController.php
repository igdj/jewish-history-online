<?php

namespace TeiEditionBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Contracts\Translation\TranslatorInterface;

/**
 *
 */
class DateController
extends BaseController
{
    /**
     * @Route("/chronology/partial", name="date-chronology-partial")
     * @Route("/chronology", name="date-chronology")
     */
    public function chronologyAction(Request $request,
                                     TranslatorInterface $translator)
    {
        $criteria = [ 'status' => [ 1 ] ];

        $locale = $request->getLocale();
        if (!empty($locale)) {
            $criteria['language'] = \TeiEditionBundle\Utils\Iso639::code1to3($locale);
        }

        $queryBuilder = $this->getDoctrine()
                ->getManager()
                ->createQueryBuilder()
                ->select('S, A')
                ->from('\TeiEditionBundle\Entity\SourceArticle', 'S')
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

        return $this->render('@TeiEdition/Date/chronology.html.twig', [
            'pageTitle' =>  $translator->trans('Chronology'),
            'articles' => $result,
        ]);
    }

    /**
     * @Route("/event", name="event-index")
     */
    public function indexAction(TranslatorInterface $translator)
    {
        $qb = $this->getDoctrine()
                ->getManager()
                ->createQueryBuilder();

        $qb->select([
                'E'            ])
            ->from('\TeiEditionBundle\Entity\Event', 'E')
            ->where('E.status IN (0,1) AND E.startDate IS NOT NULL AND E.name IS NOT NULL')
            ->orderBy("CAST(E.startDate AS integer), E.startDate")
            ;

        $entities = $qb->getQuery()->getResult();

        return $this->render('@TeiEdition/Date/index.html.twig', [
            'pageTitle' => $translator->trans('Historical Epochs and Events'),
            'events' => $entities,
        ]);
    }

    /**
     * @Route("/event/{id}.jsonld", name="event-jsonld")
     * @Route("/event/{id}", name="event")
     * @Route("/event/gnd/{gnd}.jsonld", name="event-by-gnd-jsonld")
     * @Route("/event/gnd/{gnd}", name="event-by-gnd")
     */
    public function detailAction(Request $request, $id = null, $gnd = null)
    {
        $eventRepo = $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\Event');

        if (!empty($id)) {
            $event = $eventRepo->findOneById($id);
            if (isset($event)) {
                $gnd = $event->getGnd();
            }
        }
        else if (!empty($gnd)) {
            $event = $eventRepo->findOneByGnd($gnd);
        }

        if (!isset($event) || $event->getStatus() < 0) {
            return $this->redirectToRoute('event-index');
        }

        $routeName = 'event'; $routeParams = [];
        if (!empty($gnd)) {
            $routeName = 'event-by-gnd';
            $routeParams = [ 'gnd' => $gnd ];
        }

        if (in_array($request->get('_route'), [ 'event-jsonld', 'event-by-gnd-jsonld' ])) {
            return new JsonLdResponse($event->jsonLdSerialize($request->getLocale()));
        }

        return $this->render('@TeiEdition/Date/detail.html.twig', [
            'pageTitle' => $event->getNameLocalized($request->getLocale()), // TODO: span in brackets
            'event' => $event,
            'pageMeta' => [
                'jsonLd' => $event->jsonLdSerialize($request->getLocale()),
                /*
                'og' => $this->buildOg($event, $request, $translator, $routeName, $routeParams),
                'twitter' => $this->buildTwitter($event, $request, $routeName, $routeParams),
                */
            ],
        ]);
    }
}

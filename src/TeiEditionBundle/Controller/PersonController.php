<?php

namespace TeiEditionBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Contracts\Translation\TranslatorInterface;

/**
 *
 */
class PersonController
extends BaseController
{
    use SharingBuilderTrait;

    /**
     * @Route("/person", name="person-index")
     * @Route("/about/authors", name="about-authors")
     */
    public function indexAction(Request $request,
                                TranslatorInterface $translator)
    {
        $route = $request->get('_route');
        $authorsOnly = 'about-authors' == $route;

        $qb = $this->getDoctrine()
                ->getManager()
                ->createQueryBuilder();

        $qb->select([
                'P',
                "CONCAT(COALESCE(P.familyName,P.givenName), ' ', COALESCE(P.givenName, '')) HIDDEN nameSort"
            ])
            ->from('\TeiEditionBundle\Entity\Person', 'P')
            ->where('P.status IN (0,1)')
            ->orderBy('nameSort')
            ;

        if ($authorsOnly) {
            // limit to authors: Person with published Article
            $qb->distinct()
                ->innerJoin('P.articles', 'A')
                ->andWhere('A.status IN (1)')
                ;
        }

        $persons = $qb->getQuery()->getResult();

        return $this->render('@TeiEdition/Person/index.html.twig', [
            'pageTitle' => /** @Ignore */
                $translator->trans($authorsOnly ? 'Authors' : 'Persons'),
            'persons' => $persons,
        ]);
    }

    /**
     * @Route("/person/gnd/beacon", name="person-gnd-beacon")
     *
     * Provide a BEACON file as described in
     *  https://de.wikipedia.org/wiki/Wikipedia:BEACON
     */
    public function gndBeaconAction(TranslatorInterface $translator,
                                    \Twig\Environment $twig)
    {
        $repo = $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\Person');

        $query = $repo
                ->createQueryBuilder('P')
                ->where('P.status >= 0')
                ->andWhere('P.gnd IS NOT NULL')
                ->orderBy('P.gnd')
                ->getQuery()
                ;

        $persons = $query->execute();

        $ret = '#FORMAT: BEACON' . "\n"
             . '#PREFIX: http://d-nb.info/gnd/'
             . "\n";
        $ret .= sprintf('#TARGET: %s/gnd/{ID}',
                        $this->generateUrl('person-index', [], \Symfony\Component\Routing\Generator\UrlGeneratorInterface::ABSOLUTE_URL))
              . "\n";

        $ret .= '#NAME: '
              . /** @Ignore */ $translator->trans($this->getGlobal('siteName'))
              . "\n";
        // $ret .= '#MESSAGE: ' . "\n";

        foreach ($persons as $person) {
            $ret .=  $person->getGnd() . "\n";
        }

        return new \Symfony\Component\HttpFoundation\Response($ret, \Symfony\Component\HttpFoundation\Response::HTTP_OK,
                                                              [ 'Content-Type' => 'text/plain; charset=UTF-8' ]);
    }

    /**
     * @Route("/person/{id}.jsonld", name="person-jsonld")
     * @Route("/person/{id}", name="person")
     * @Route("/person/gnd/{gnd}.jsonld", name="person-by-gnd-jsonld")
     * @Route("/person/gnd/{gnd}", name="person-by-gnd")
     */
    public function detailAction(Request $request, TranslatorInterface $translator,
                                 $id = null, $gnd = null)
    {
        $personRepo = $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\Person');

        if (!empty($id)) {
            $person = $personRepo->findOneById($id);
            if (isset($person)) {
                $gnd = $person->getGnd();
            }
        }
        else if (!empty($gnd)) {
            $person = $personRepo->findOneByGnd($gnd);
        }

        if (!isset($person) || $person->getStatus() < 0) {
            return $this->redirectToRoute('person-index');
        }

        $routeName = 'person'; $routeParams = [];
        if (!empty($gnd)) {
            $routeName = 'person-by-gnd';
            $routeParams = [ 'gnd' => $gnd ];
        }

        if (in_array($request->get('_route'), [ 'person-jsonld', 'person-by-gnd-jsonld' ])) {
            return new JsonLdResponse($person->jsonLdSerialize($request->getLocale()));
        }

        return $this->render('@TeiEdition/Person/detail.html.twig', [
            'pageTitle' => $person->getFullname(true), // TODO: lifespan in brackets
            'person' => $person,
            'pageMeta' => [
                'jsonLd' => $person->jsonLdSerialize($request->getLocale()),
                'og' => $this->buildOg($person, $request, $translator, $routeName, $routeParams),
                'twitter' => $this->buildTwitter($person, $request, $routeName, $routeParams),
            ],
        ]);
    }
}

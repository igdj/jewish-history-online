<?php

namespace TeiEditionBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Contracts\Translation\TranslatorInterface;

/**
 *
 */
class OrganizationController
extends BaseController
{
    /**
     * @Route("/organization", name="organization-index")
     */
    public function indexAction(Request $request,
                                TranslatorInterface $translator)
    {
        $organizations = $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\Organization')
                ->findBy([ 'status' => [ 0, 1 ] ],
                         [ 'name' => 'ASC' ]);

        // the following doesn't work on windows, where we would probably need accent removal
        // for strcoll, so O-Umlaut sorts like O
        setlocale(LC_COLLATE, 'de_DE.utf8');

        if (!is_null($organizations)) {
            $locale = $request->getLocale();

            // We want everything with
            //    Hamburg. XXX
            // grouped together.
            // Since strcoll ignores . in de_DE.utf8, we replace by something that comes after z
            //   https://stackoverflow.com/a/25939502
            uasort($organizations, function ($a, $b) use ($locale) {
                return strcoll(str_replace('.', 'Ω', $a->getNameLocalized($locale)),
                               str_replace('.', 'Ω', $b->getNameLocalized($locale)));
            });
        }

        return $this->render('@TeiEdition/Organization/index.html.twig', [
            'pageTitle' => $translator->trans('Organizations'),
            'organizations' => $organizations,
        ]);
    }

    /**
     * @Route("/organization/gnd/beacon", name="organization-gnd-beacon")
     *
     * Provide a BEACON file as described in
     *  https://de.wikipedia.org/wiki/Wikipedia:BEACON
     */
    public function gndBeaconAction(TranslatorInterface $translator)
    {
        $repo = $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\Organization');

        $query = $repo
                ->createQueryBuilder('O')
                ->where('O.status >= 0')
                ->andWhere('O.gnd IS NOT NULL')
                ->orderBy('O.gnd')
                ->getQuery()
                ;

        $organizations = $query->execute();

        $ret = '#FORMAT: BEACON' . "\n"
             . '#PREFIX: http://d-nb.info/gnd/'
             . "\n";
        $ret .= sprintf('#TARGET: %s/gnd/{ID}',
                        $this->generateUrl('organization-index', [], \Symfony\Component\Routing\Generator\UrlGeneratorInterface::ABSOLUTE_URL))
              . "\n";

        $ret .= '#NAME: '
              . /** @Ignore */ $translator->trans($this->getGlobal('siteName'))
              . "\n";
        // $ret .= '#MESSAGE: ' . "\n";

        foreach ($organizations as $organization) {
            $ret .=  $organization->getGnd() . "\n";
        }

        return new \Symfony\Component\HttpFoundation\Response($ret, \Symfony\Component\HttpFoundation\Response::HTTP_OK,
                                                              [ 'Content-Type' => 'text/plain; charset=UTF-8' ]);
    }

    /**
     * @Route("/organization/{id}.jsonld", name="organization-jsonld")
     * @Route("/organization/{id}", name="organization")
     * @Route("/organization/gnd/{gnd}.jsonld", name="organization-by-gnd-jsonld")
     * @Route("/organization/gnd/{gnd}", name="organization-by-gnd")
     */
    public function detailAction(Request $request, $id = null, $gnd = null)
    {
        $organizationRepo = $this->getDoctrine()
                ->getRepository('\TeiEditionBundle\Entity\Organization');

        if (!empty($id)) {
            $organization = $organizationRepo->findOneById($id);
        }
        else if (!empty($gnd)) {
            $organization = $organizationRepo->findOneByGnd($gnd);
        }

        if (!isset($organization) || $organization->getStatus() < 0) {
            return $this->redirectToRoute('organization-index');
        }

        if (in_array($request->get('_route'), [ 'organization-jsonld', 'organization-by-gnd-jsonld' ])) {
            return new JsonLdResponse($organization->jsonLdSerialize($request->getLocale()));
        }

        return $this->render('@TeiEdition/Organization/detail.html.twig', [
            'pageTitle' => $organization->getNameLocalized($request->getLocale()),
            'organization' => $organization,
            'pageMeta' => [
                'jsonLd' => $organization->jsonLdSerialize($request->getLocale()),
            ],
        ]);
    }
}

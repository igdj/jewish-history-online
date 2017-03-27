<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class BibliographyController extends Controller
{
    use OgBuilderTrait;

    private function instantiateCiteProc()
    {
        $locale = $this->getRequest()->getLocale();

        $kernel = $this->container->get('kernel');
        $path = $kernel->locateResource('@AppBundle/Resources/data/csl/jgo-infoclio-de.csl.xml');

        return new \AcademicPuma\CiteProc\CiteProc(file_get_contents($path),
                                                   $locale);
    }

    /**
     * @Route("/bibliography")
     */
    public function indexAction()
    {
        $qb = $this->getDoctrine()
                ->getManager()
                ->createQueryBuilder();

        $qb->select([ 'B',
                     "B.slug HIDDEN nameSort"
                     ])
            ->from('AppBundle:Bibitem', 'B')
            ->where('B.status IN (0,1)')
            ->orderBy('nameSort')
            ;
        $query = $qb->getQuery();
        $items = $query->getResult();

        return $this->render('AppBundle:Bibliography:index.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Bibliography'),
            'items' => $items,
            'citeProc' => $this->instantiateCiteProc(),
        ]);
    }

    private function buildRisResponse($bibitem)
    {
        $data = $bibitem->jsonSerialize();


        unset($data['citation-label']);
        $csl = json_encode([ $data ]);

        $converter = new \Geissler\Converter\Converter();
        $res = $converter->convert(new \Geissler\Converter\Standard\CSL\CSL($csl), new \Geissler\Converter\Standard\RIS\RIS());

        $response = new \Symfony\Component\HttpFoundation\Response($res);
        $response->headers->set('Content-Type', 'text/plain; charset=UTF-8');
        return $response;
    }

    public function detailAction($id = null, $slug = null)
    {
        $bibitemRepo = $this->getDoctrine()
                ->getRepository('AppBundle:Bibitem');

        if (!empty($id)) {
            $bibitem = $bibitemRepo->findOneById($id);
            if (isset($bibitem)) {
                $slug = $bibitem->getSlug();
            }
        }
        else if (!empty($slug)) {
            $bibitem = $bibitemRepo->findOneBySlug($slug);
        }

        if (!isset($bibitem) || $bibitem->getStatus() < 0) {
            return $this->redirectToRoute('bibliography-index');
        }

        $routeName = 'bibliography'; $routeParams = [ 'slug' => $bibitem->getId() ];
        if (!empty($slug)) {
            $routeName = 'bibliography';
            $routeParams = [ 'slug' => $slug ];
        }

        if (in_array($this->container->get('request')->get('_route'), [ 'bibliography-jsonld' ])) {
            return new JsonLdResponse($bibitem->jsonLdSerialize($this->getRequest()->getLocale()));
        }
        else if (in_array($this->container->get('request')->get('_route'), [ 'bibliography-ris' ])) {
            return $this->buildRisResponse($bibitem);
        }

        return $this->render('AppBundle:Bibliography:detail.html.twig', [
            'pageTitle' => $bibitem->getName(true), //
            'bibitem' => $bibitem,
            'citeProc' => $this->instantiateCiteProc(),
            'pageMeta' => [
                'jsonLd' =>
                $bibitem->jsonLdSerialize($this->getRequest()->getLocale()),
                'og' => $this->buildOg($bibitem, $routeName, $routeParams),
            ],
        ]);
    }

    public function unapiAction()
    {
        /* see http://robotlibrarian.billdueber.com/2009/11/setting-up-your-opac-for-zotero-support-using-unapi/ */
        $format = $this->getRequest()->get('format');

        $id = $this->getRequest()->get('id');
        $bibitem = null;
        if (!empty($id)) {
            if (preg_match('/^urn:bibnum:(.+)$/', $id, $matches)) {
                $slug = $matches[1];
                $bibitemRepo = $this->getDoctrine()
                        ->getRepository('AppBundle:Bibitem');
                $bibitem = $bibitemRepo->findOneBySlug($slug);
            }
        }

        if (isset($bibitem) && in_array($format, [ 'ris' ])) {
            return $this->buildRisResponse($bibitem);
        }

        $formatsAttrs = !empty($id)
            ? sprintf(' id="%s"', htmlspecialchars($id))
            : '';


        $formats = '<' . '?xml version="1.0" encoding="UTF-8"?>
    <formats' . $formatsAttrs . '>
      <format name="ris"
              type="application/x-Research-Info-Systems"
              docs="http://www.refman.com/support/risformat_intro.asp"/>
    </formats>
    ';
        $response = new \Symfony\Component\HttpFoundation\Response($formats, 200, [ 'Content-Type' => 'application/xml' ]);
        return $response;
    }

    /*
    public function isbnBeaconAction()
    {
        $translator = $this->container->get('translator');
        $twig = $this->container->get('twig');

        $personRepo = $this->getDoctrine()
                ->getRepository('AppBundle:Bibitem');

        $query = $personRepo
                ->createQueryBuilder('B')
                ->where('B.status >= 0')
                ->andWhere('B.isbn IS NOT NULL')
                ->orderBy('B.isbn')
                ->getQuery()
                ;

        $persons = $query->execute();

        $ret = '#FORMAT: BEACON' . "\n"
             . '#PREFIX: http://d-nb.info/gnd/'
             . "\n";
        $ret .= sprintf('#TARGET: %s/gnd/{ID}',
                        $this->generateUrl('person-index', [], true))
              . "\n";

        $globals = $twig->getGlobals();
        $ret .= '#NAME: ' . $translator->trans($globals['siteName'])
              . "\n";
        // $ret .= '#MESSAGE: ' . "\n";

        foreach ($persons as $person) {
            $ret .=  $person->getGnd() . "\n";
        }

        return new \Symfony\Component\HttpFoundation\Response($ret, \Symfony\Component\HttpFoundation\Response::HTTP_OK,
                                                              [ 'Content-Type' => 'text/plain; charset=UTF-8' ]);
    }
    */
}

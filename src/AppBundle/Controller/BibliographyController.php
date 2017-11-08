<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class BibliographyController extends Controller
{
    use SharingBuilderTrait;

    private function instantiateCiteProc($locale)
    {
        $kernel = $this->container->get('kernel');
        $path = $kernel->locateResource('@AppBundle/Resources/data/csl/jgo-infoclio-de.csl.xml');

        return new \AcademicPuma\CiteProc\CiteProc(file_get_contents($path), $locale);
    }

    /**
     * @Route("/bibliography", name="bibliography-index")
     */
    public function indexAction(Request $request)
    {
        $qb = $this->getDoctrine()
                ->getManager()
                ->createQueryBuilder();

        $qb->select([ 'B', "B.slug HIDDEN nameSort" ])
            ->from('AppBundle:Bibitem', 'B')
            ->where('B.status IN (0,1)')
            ->orderBy('nameSort')
            ;
        $query = $qb->getQuery();
        $items = $query->getResult();

        return $this->render('AppBundle:Bibliography:index.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Bibliography'),
            'items' => $items,
            'citeProc' => $this->instantiateCiteProc($request->getLocale()),
        ]);
    }

    /**
     * @Route("/bibliography/isbn/beacon", name="bibliography-isbn-beacon")
     */
    public function isbnBeaconAction()
    {
        $translator = $this->container->get('translator');
        $twig = $this->container->get('twig');

        $bibitemRepo = $this->getDoctrine()
                ->getRepository('AppBundle:Bibitem');

        $query = $bibitemRepo
                ->createQueryBuilder('B')
                ->select('B.isbn, COUNT(B.isbn) AS how_many')
                ->where("B.status >= 0 AND B.itemType IN ('book')")
                ->andWhere("B.isbn IS NOT NULL AND B.isbn <> ''")
                ->groupBy('B.isbn')
                ->orderBy('B.isbn')
                ->getQuery()
                ;

        $bibitems = $query->execute();

        $ret = '#FORMAT: BEACON' . "\n"
             // . "#VERSION: 0.1\n"
             ;
        $ret .= sprintf('#TARGET: %s/isbn/{ID}',
                        $this->generateUrl('bibliography-index', [], true))
              . "\n";

        $globals = $twig->getGlobals();
        $ret .= '#NAME: ' . $translator->trans($globals['siteName'])
              . "\n";
        // $ret .= '#MESSAGE: ' . "\n";

        $isbns = [];
        foreach ($bibitems as $bibitem) {
            $isbnList = \AppBundle\Entity\Bibitem::buildIsbnListNormalized($bibitem['isbn'], false);
            foreach ($isbnList as $isbn) {
                if (!array_key_exists($isbn, $isbns)) {
                    $isbns[$isbn] = 0;
                }
                $isbns[$isbn] += $bibitem['how_many'];
            }
        }
        foreach ($isbns as $isbn => $count) {
            $ret .=  $isbn . ($count > 1 ? '|' . $count : '') . "\n";
        }

        return new \Symfony\Component\HttpFoundation\Response($ret, \Symfony\Component\HttpFoundation\Response::HTTP_OK,
                                                              [ 'Content-Type' => 'text/plain; charset=UTF-8' ]);
    }

    private function buildRisResponse($bibitem)
    {
        $data = $bibitem->jsonSerialize();


        unset($data['citation-label']);
        $csl = json_encode([ $data ]);

        $converter = new \Geissler\Converter\Converter();
        $res = $converter->convert(new \Geissler\Converter\Standard\CSL\CSL($csl),
                                   new \Geissler\Converter\Standard\RIS\RIS());

        $response = new \Symfony\Component\HttpFoundation\Response($res);
        $response->headers->set('Content-Type', 'text/plain; charset=UTF-8');

        return $response;
    }

    /**
     * @Route("/bibliography/{slug}.ris", name="bibliography-ris")
     * @Route("/bibliography/{slug}.jsonld", name="bibliography-jsonld")
     * @Route("/bibliography/{slug}", name="bibliography")
     */
    public function detailAction(Request $request, $id = null, $slug = null, $isbn = null)
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
        else if (!empty($isbn)) {
            $variants = \AppBundle\Entity\Bibitem::buildIsbnVariants($isbn, false);
            if (!empty($variants)) {
                $orParts = [];
                foreach ($variants as $variant) {
                    $orParts[] = sprintf("REPLACE(B.isbn, '-', '') LIKE '%%%s%%'",
                                         $variant);
                }
                $query = $bibitemRepo
                        ->createQueryBuilder('B')
                        ->select('B')
                        ->where("B.status >= 0 AND B.itemType IN ('book')")
                        ->andWhere(join(' OR ', $orParts))
                        ->groupBy('B.isbn')
                        ->orderBy('B.isbn')
                        ->getQuery()
                        ;
                $bibitems = $query->execute();
                if (count($bibitems) > 0) {
                    return $this->redirectToRoute('bibliography', [ 'slug' => $bibitems[0]->getSlug() ]);
                }
            }
        }

        if (!isset($bibitem) || $bibitem->getStatus() < 0) {
            return $this->redirectToRoute('bibliography-index');
        }

        $routeName = 'bibliography'; $routeParams = [ 'slug' => $bibitem->getId() ];
        if (!empty($slug)) {
            $routeName = 'bibliography';
            $routeParams = [ 'slug' => $slug ];
        }

        if (in_array($request->get('_route'), [ 'bibliography-jsonld' ])) {
            return new JsonLdResponse($bibitem->jsonLdSerialize($request->getLocale()));
        }
        else if (in_array($request->get('_route'), [ 'bibliography-ris' ])) {
            return $this->buildRisResponse($bibitem);
        }

        return $this->render('AppBundle:Bibliography:detail.html.twig', [
            'pageTitle' => $bibitem->getName(true), //
            'bibitem' => $bibitem,
            'citeProc' => $this->instantiateCiteProc($request->getLocale()),
            'pageMeta' => [
                'jsonLd' => $bibitem->jsonLdSerialize($request->getLocale()),
                'og' => $this->buildOg($bibitem, $request, $routeName, $routeParams),
                'twitter' => $this->buildTwitter($bibitem, $request, $routeName, $routeParams,
                                                 [ 'citeProc' => $this->instantiateCiteProc($request->getLocale()) ]),
            ],
        ]);
    }

    /**
     * @Route("/bibliography/unapi", name="bibliography-unapi")
     */
    public function unapiAction(Request $request)
    {
        /* see http://robotlibrarian.billdueber.com/2009/11/setting-up-your-opac-for-zotero-support-using-unapi/ */
        $format = $request->get('format');

        $id = $request->get('id');
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

        return new \Symfony\Component\HttpFoundation\Response($formats, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}

<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;

use Symfony\Component\Routing\Annotation\Route;

/**
 *
 */
class DefaultController
extends TopicController
{
    /* shared code with PlaceController */
    use MapHelperTrait;

    /**
     * @Route("/", name="home")
     * @Route("/preview", name="home-preview")
     */
    public function indexAction(Request $request)
    {
        list($markers, $bounds) = $this->buildMap($request->getLocale());

        /* check if we have settings for wp-rest */
        $news = [];
        $url = $this->container->hasParameter('app.wp-rest.url')
            ? $this->getParameter('app.wp-rest.url') : null;
        if (!empty($url)) {
            try {
                $client = new \Vnn\WpApiClient\WpClient(
                            new \Vnn\WpApiClient\Http\GuzzleAdapter(new \GuzzleHttp\Client()),
                            $url);
                $client->setCredentials(new \Vnn\WpApiClient\Auth\WpBasicAuth($this->getParameter('app.wp-rest.user'), $this->getParameter('app.wp-rest.password')));
                $posts = $client->posts()->get(null, [
                    'per_page' => 4,
                    'lang' => $request->getLocale(),
                ]);

                if (!empty($posts)) {
                    foreach ($posts as $post) {
                        $article = new \AppBundle\Entity\Article();
                        $article->setName($post['title']['rendered']);
                        $article->setSlug($post['slug']);
                        $article->setDatePublished(new \DateTime($post['date_gmt']));

                        $news[] = $article;
                    }
                }
            }
            catch (\Exception $e) {
                ;
            }
        }

        return $this->render('home-preview' == $request->get('_route')
            ? 'AppBundle:Default:home-preview.html.twig' : 'AppBundle:Default:home.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Welcome'),
            'topics' => $this->buildTopicsDescriptions($request->getLocale()),
            'markers' => $markers,
            'bounds' => $bounds,
            'news' => $news,
        ]);
    }
}

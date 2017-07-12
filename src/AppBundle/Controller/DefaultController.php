<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class DefaultController
extends TopicController
{
    /* shared code with PlaceController */
    use MapHelperTrait;

    /**
     * @Route("/")
     */
    public function indexAction()
    {
        list($markers, $bounds) = $this->buildMap();

        /* check if we have settings for wp-rest */
        $news = [];
        $url = $this->container->hasParameter('app.wp-rest.url')
            ? $this->getParameter('app.wp-rest.url') : null;
        if (!empty($url)) {
            try {
                $client = new \Vnn\WpApiClient\WpClient(
                    new \Vnn\WpApiClient\Http\Guzzle5Adapter(new \GuzzleHttp\Client()),
                        $url);
                $client->setCredentials(new \Vnn\WpApiClient\Auth\WpBasicAuth($this->getParameter('app.wp-rest.user'), $this->getParameter('app.wp-rest.password')));
                $posts = $client->posts()->get(null, [
                    'per_page' => 4,
                    'lang' => $this->get('request')->getLocale(),
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

        return $this->render('AppBundle:Default:index.html.twig', [
            'pageTitle' => $this->get('translator')->trans('Welcome'),
            'topics' => $this->buildTopicsDescriptions(),
            'markers' => $markers,
            'bounds' => $bounds,
            'news' => $news,
        ]);
    }
}

<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Response;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class AboutController extends RenderTeiController
{
    protected function renderContent()
    {
        $route = $this->get('request')->get('_route');
        $locale = $this->get('request')->getLocale();
        $fnameTei = $route . '.' . $locale . '.xml';

        $params = [ 'lang' => \AppBundle\Utils\Iso639::code1To3($locale) ];

        $html = $this->renderTei($fnameTei, 'dtabf_article-printview.xsl', [ 'params' => $params ]);

        if (false === $html) {
            return '<div class="alert alert-warning">'
                 . 'Error: Invalid or missing file: ' . $fnameTei
                 . '</div>';
        }

        return $html;
    }

    protected function renderTitleContent($title, $template)
    {
        $translator = $this->get('translator');

        return $this->render($template, [
            'pageTitle' => $translator->trans($title),
            'title' => $title,
            'content' => $this->renderContent(),
        ]);
    }

    protected function renderAbout($title)
    {
        return $this->renderTitleContent($title, 'AppBundle:Default:sitetext-about.html.twig');
    }

    protected function renderAboutUs($title)
    {
        return $this->renderTitleContent($title, 'AppBundle:Default:sitetext-about-us.html.twig');
    }

    /**
     * @Route("/about")
     */
    public function aboutAction()
    {
        return $this->renderAbout('About this edition');
    }

    /**
     * @Route("/about/goals", name="about-goals")
     */
    public function goalsAction()
    {
        return $this->renderAbout('Goals');
    }

    /**
     * @Route("/about/goals", name="about-goals")
     */
    public function keydocumentsAction()
    {
        return $this->renderAbout('Key Documents');
    }

    /**
     * @Route("/about/audience", name="about-audience")
     */
    public function audienceAction()
    {
        return $this->renderAbout('Target Audience');
    }

    /**
     * @Route("/about/usage", name="about-usage")
     */
    public function usageAction()
    {
        return $this->renderAbout('Structure / How to Use this Edition');
    }

    /**
     * @Route("/about/editorial-model", name="about-editorialmodel")
     */
    public function editorialmodelAction()
    {
        return $this->renderAbout('Editorial Model');
    }

    /**
     * @Route("/about/edition", name="about-edition")
     */
    public function editionguidelinesAction()
    {
        return $this->renderAbout('Edition and Edition Guidelines');
    }

    /**
     * @Route("/about/technical-implementation", name="about-implementation")
     */
    public function implementationAction()
    {
        return $this->renderAbout('Technical Implementation');
    }

    protected function buildNewsArticles(&$posts, $client)
    {
        $articles = [];
        $categories = [];

        foreach ($posts as $post) {
            $article = new \AppBundle\Entity\Article();
            $article->setName($post['title']['rendered']);
            $article->setSlug($post['slug']);
            $article->setText($post['content']['rendered']);
            $article->setDatePublished(new \DateTime($post['date_gmt']));

            $keywords = [];
            if (!empty($post['categories'])) {
                foreach ($post['categories'] as $category) {
                    if (array_key_exists($category, $categories)) {
                        $keywords[] = $categories[$category];
                    }
                    else {
                        $categoryInfo = $client->categories()->get($category);
                        $keywords[] = $categories[$category] = $categoryInfo['name'];
                    }
                }
                $article->setKeywords(join('/ ', $keywords));
            }

            if (!empty($post['featured_media'])) {
                try {
                    $featuredMedia = $client->media()->get($post['featured_media']);
                    if (!empty($featuredMedia)) {
                        $article->thumbnailUrl = $featuredMedia['media_details']['sizes']['medium']['source_url'];
                    }
                }
                catch (\Exception $e) {
                    ; // ignore
                }
            }

            $articles[] = $article;
        }
        return $articles;
    }

    /**
     * @Route("/about/news", name="about-news")
     */
    public function newsAction()
    {
        /* check if we have settings for wp-rest */
        $url = $this->container->hasParameter('app.wp-rest.url')
            ? $this->getParameter('app.wp-rest.url') : null;
        if (!empty($url)) {
            try {
                $client = new \Vnn\WpApiClient\WpClient(
                    new \Vnn\WpApiClient\Http\Guzzle5Adapter(new \GuzzleHttp\Client()),
                        $url);
                $client->setCredentials(new \Vnn\WpApiClient\Auth\WpBasicAuth($this->getParameter('app.wp-rest.user'), $this->getParameter('app.wp-rest.password')));
                $posts = $client->posts()->get(null, [
                    'per_page' => 5,
                    'lang' => $this->get('request')->getLocale(),
                ]);
                if (!empty($posts)) {
                    return $this->render('AppBundle:About:news.html.twig', [
                        'articles' => $this->buildNewsArticles($posts, $client),
                    ]);
                }
            }
            catch (\Exception $e) {
                ;
            }
        }

        // static fallback
        return $this->renderAbout('News');
    }

    /**
     * @Route("/about/staff", name="about-staff")
     */
    public function staffAction()
    {
        return $this->renderAboutUs('Staff');
    }

    /**
     * @Route("/about/editors", name="about-editors")
     */
    public function editorsAction()
    {
        return $this->renderAboutUs('Editors');
    }

    /**
     * @Route("/about/board", name="about-board")
     */
    public function boardAction()
    {
        return $this->renderAboutUs('Advisory Board');
    }

    /**
     * @Route("/about/sponsors", name="about-sponsors")
     */
    public function sponsorsAction()
    {
        return $this->renderAboutUs('Sponsors and Partners');
    }

    /**
     * @Route("/about/cfp", name="about-cfp")
     */
    public function cfpAction()
    {
        return $this->renderAboutUs('Become an Author');
    }

    /**
     * @Route("/terms")
     */
    public function termsAction()
    {
        return $this->renderTitleContent('Terms and Conditions', 'AppBundle:Default:sitetext.html.twig');
    }

    protected function sendMessage($data)
    {
        $template = $this->get('twig')->loadTemplate('AppBundle:Default:contact.email.twig');
        $subject = $template->renderBlock('subject', [ 'data' => $data ]);
        $textBody = $template->renderBlock('body_text', [ 'data' => $data ]);
        $htmlBody = $template->renderBlock('body_html', [ 'data' => $data ]);

        $message = \Swift_Message::newInstance()
            ->setSubject($subject)
            ->setFrom('burckhardtd@geschichte.hu-berlin.de')
            ->setTo('burckhardtd@geschichte.hu-berlin.de')
            ->setReplyTo($data['email']);
            ;


        if (!empty($htmlBody)) {
            $message->setBody($htmlBody, 'text/html')
                ->addPart($textBody, 'text/plain');
        } else {
            $message->setBody($textBody);
        }

        try {
            return $this->get('mailer')->send($message);
        }
        catch (\Exception $e) {
            return false;
        }
    }

    /**
     * @Route("/contact")
     */
    public function contactAction()
    {
        $form = $this->createForm(new \AppBundle\Form\Type\ContactType());
        $form->handleRequest($this->get('request'));
        if ($form->isSubmitted() && $form->isValid()) {
            $translator = $this->get('translator');
            return $this->render('AppBundle:Default:contact-sent.html.twig', [
                'pageTitle' => $translator->trans('Contact'),
                'success' => $this->sendMessage($form->getData()),
            ]);
        }
        $response = $this->renderTitleContent('Contact', 'AppBundle:Default:sitetext.html.twig');

        return new Response(str_replace('%form%',
                            $this->get('twig')
                            ->render('AppBundle:Default:contact-form.html.twig', [
                                'form' => $form->createView(),
                           ]), $response->getContent()));
    }
}

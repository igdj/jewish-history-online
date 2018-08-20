<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class AboutController
extends RenderTeiController
{
    protected function renderContent(Request $request)
    {
        $route = $request->get('_route');
        $locale = $request->getLocale();
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

    protected function renderTitleContent(Request $request, $title, $template)
    {
        $translator = $this->get('translator');

        return $this->render($template, [
            'pageTitle' => /** @Ignore */ $translator->trans($title),
            'title' => $title,
            'content' => $this->renderContent($request),
        ]);
    }

    protected function renderAbout(Request $request, $title)
    {
        return $this->renderTitleContent($request, $title, 'AppBundle:Default:sitetext-about.html.twig');
    }

    protected function renderAboutUs(Request $request, $title)
    {
        return $this->renderTitleContent($request, $title, 'AppBundle:Default:sitetext-about-us.html.twig');
    }

    /**
     * @Route("/about/edition", name="about")
     */
    public function aboutAction(Request $request)
    {
        return $this->renderAbout($request, 'About this edition');
    }

    /**
     * @Route("/about/goals", name="about-goals")
     */
    public function goalsAction(Request $request)
    {
        return $this->renderAbout($request, 'Goals');
    }

    /**
     * @Route("/about/keydocuments", name="about-keydocuments")
     */
    public function keydocumentsAction(Request $request)
    {
        return $this->renderAbout($request, 'Key Documents');
    }

    /**
     * @Route("/about/audience", name="about-audience")
     */
    public function audienceAction(Request $request)
    {
        return $this->renderAbout($request, 'Target Audience');
    }

    /**
     * @Route("/about/usage", name="about-usage")
     */
    public function usageAction(Request $request)
    {
        return $this->renderAbout($request, 'Structure / How to Use this Edition');
    }

    /**
     * @Route("/about/editorial-model", name="about-editorialmodel")
     */
    public function editorialmodelAction(Request $request)
    {
        return $this->renderAbout($request, 'Editorial Model');
    }

    /**
     * @Route("/about/edition-guidelines", name="about-editionguidelines")
     */
    public function editionguidelinesAction(Request $request)
    {
        return $this->renderAbout($request, 'Edition and Edition Guidelines');
    }

    /**
     * @Route("/about/technical-implementation", name="about-implementation")
     */
    public function implementationAction(Request $request)
    {
        return $this->renderAbout($request, 'Technical Implementation');
    }

    /**
     * @Route("/about/publications", name="about-publications")
     */
    public function publicationsAction(Request $request)
    {
        return $this->renderAbout($request, 'Presentations and Publications');
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
                $article->setKeywords(join(' / ', $keywords));
            }

            if (!empty($post['featured_media'])) {
                try {
                    $featuredMedia = $client->media()->get($post['featured_media']);
                    if (!empty($featuredMedia)) {
                        $size = array_key_exists('medium', $featuredMedia['media_details']['sizes'])
                            ? 'medium' : 'full';
                        $article->thumbnailUrl = $featuredMedia['media_details']['sizes'][$size]['source_url'];
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
    public function newsAction(Request $request)
    {
        /* check if we have settings for wp-rest */
        $url = $this->container->hasParameter('app.wp-rest.url')
            ? $this->getParameter('app.wp-rest.url') : null;

        if (!empty($url)) {
            try {
                $client = new \Vnn\WpApiClient\WpClient(
                    new \Vnn\WpApiClient\Http\GuzzleAdapter(new \GuzzleHttp\Client()),
                        $url);
                $client->setCredentials(new \Vnn\WpApiClient\Auth\WpBasicAuth($this->getParameter('app.wp-rest.user'), $this->getParameter('app.wp-rest.password')));

                $posts = $client->posts()->get(null, [
                    'per_page' => 15,
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
        return $this->renderAbout($request, 'News');
    }

    /**
     * @Route("/about/staff", name="about-staff")
     */
    public function staffAction(Request $request)
    {
        return $this->renderAboutUs($request, 'Staff');
    }

    /**
     * @Route("/about/editors", name="about-editors")
     */
    public function editorsAction(Request $request)
    {
        return $this->renderAboutUs($request, 'Editors');
    }

    /**
     * @Route("/about/board", name="about-board")
     */
    public function boardAction(Request $request)
    {
        return $this->renderAboutUs($request, 'Advisory Board');
    }

    /**
     * @Route("/about/sponsors", name="about-sponsors")
     */
    public function sponsorsAction(Request $request)
    {
        return $this->renderAboutUs($request, 'Sponsors and Partners');
    }

    /**
     * @Route("/about/cfp", name="about-cfp")
     */
    public function cfpAction(Request $request)
    {
        return $this->renderAboutUs($request, 'Become an Author');
    }

    /**
     * @Route("/terms", name="terms")
     */
    public function termsAction(Request $request)
    {
        return $this->renderTitleContent($request, 'Terms and Conditions', 'AppBundle:Default:sitetext.html.twig');
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
        }
        else {
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
     * @Route("/contact", name="contact")
     */
    public function contactAction(Request $request)
    {
        $translator = $this->get('translator');

        $form = $this->createForm(new \AppBundle\Form\Type\ContactType());
        $form->handleRequest($this->get('request'));
        if ($form->isSubmitted() && $form->isValid()) {
            return $this->render('AppBundle:Default:contact-sent.html.twig', [
                'pageTitle' => $translator->trans('Contact'),
                'success' => $this->sendMessage($form->getData()),
            ]);
        }

        $response = $this->renderTitleContent($request, 'Contact', 'AppBundle:Default:sitetext.html.twig');

        // add anchors to sub-headings
        $anchors = [
            'imprint' =>  $translator->trans('Imprint'),
            'dataprotection' =>  $translator->trans('Data Protection'),
        ];

        $crawler = new \Symfony\Component\DomCrawler\Crawler();
        $crawler->addHtmlContent($response->getContent());

        $crawler->filter('h3.dta-head')->each(function ($node, $i) use ($anchors) {
            foreach ($anchors as $id => $label) {
                if ($label == $node->text()) {
                    $node->getNode(0)->setAttribute('id', $id);
                    break;
                }
            }
        });


        return new Response(str_replace('%form%',
                                        $this->get('twig')
                                            ->render('AppBundle:Default:contact-form.html.twig', [
                                                'form' => $form->createView(),
                                            ]),
                                        $crawler->html()));
    }
}

<?php

namespace TeiEditionBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Contracts\Translation\TranslatorInterface;

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

        $params = [ 'lang' => \TeiEditionBundle\Utils\Iso639::code1To3($locale) ];

        $html = $this->renderTei($fnameTei, 'dtabf_article-printview.xsl', [ 'params' => $params ]);

        if (false === $html) {
            return '<div class="alert alert-warning">'
                 . 'Error: Invalid or missing file: ' . $fnameTei
                 . '</div>';
        }

        return $html;
    }

    protected function renderTitleContent(Request $request,
                                          TranslatorInterface $translator,
                                          $title, $template)
    {
        return $this->render($template, [
            'pageTitle' => /** @Ignore */ $translator->trans($title),
            'title' => $title,
            'content' => $this->renderContent($request),
        ]);
    }

    protected function renderAbout(Request $request,
                                   TranslatorInterface $translator,
                                   $title)
    {
        return $this->renderTitleContent($request, $translator, $title, '@TeiEdition/Default/sitetext-about.html.twig');
    }

    protected function renderAboutUs(Request $request,
                                     TranslatorInterface $translator,
                                     $title)
    {
        return $this->renderTitleContent($request, $translator, $title, '@TeiEdition/Default/sitetext-about-us.html.twig');
    }

    /**
     * @Route("/about/edition", name="about")
     */
    public function aboutAction(Request $request,
                                TranslatorInterface $translator)
    {
        return $this->renderAbout($request, $translator, 'About this edition');
    }

    /**
     * @Route("/about/goals", name="about-goals")
     */
    public function goalsAction(Request $request,
                                TranslatorInterface $translator)
    {
        return $this->renderAbout($request, $translator, 'Goals');
    }

    /**
     * @Route("/about/keydocuments", name="about-keydocuments")
     */
    public function keydocumentsAction(Request $request,
                                       TranslatorInterface $translator)
    {
        return $this->renderAbout($request, $translator, 'Key Documents');
    }

    /**
     * @Route("/about/audience", name="about-audience")
     */
    public function audienceAction(Request $request,
                                   TranslatorInterface $translator)
    {
        return $this->renderAbout($request, $translator, 'Target Audience');
    }

    /**
     * @Route("/about/usage", name="about-usage")
     */
    public function usageAction(Request $request,
                                TranslatorInterface $translator)
    {
        return $this->renderAbout($request, $translator, 'Structure / How to Use this Edition');
    }

    /**
     * @Route("/about/editorial-model", name="about-editorialmodel")
     */
    public function editorialmodelAction(Request $request,
                                         TranslatorInterface $translator)
    {
        return $this->renderAbout($request, $translator, 'Editorial Model');
    }

    /**
     * @Route("/about/edition-guidelines", name="about-editionguidelines")
     */
    public function editionguidelinesAction(Request $request,
                                            TranslatorInterface $translator)
    {
        return $this->renderAbout($request, $translator, 'Edition and Edition Guidelines');
    }

    /**
     * @Route("/about/technical-implementation", name="about-implementation")
     */
    public function implementationAction(Request $request,
                                         TranslatorInterface $translator)
    {
        return $this->renderAbout($request, $translator, 'Technical Implementation');
    }

    /**
     * @Route("/about/publications", name="about-publications")
     */
    public function publicationsAction(Request $request,
                                       TranslatorInterface $translator)
    {
        return $this->renderAbout($request, $translator, 'Presentations and Publications');
    }

    protected function buildNewsArticles(&$posts, $client)
    {
        $articles = [];
        $categories = [];

        foreach ($posts as $post) {
            $article = new \TeiEditionBundle\Entity\Article();
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
    public function newsAction(Request $request,
                               TranslatorInterface $translator)
    {
        try {
            /* the following can fail */
            $url = $this->getParameter('app.wp-rest.url');

            if (!empty($url)) {
                try {
                    $client = new \Vnn\WpApiClient\WpClient(
                        new \Vnn\WpApiClient\Http\GuzzleAdapter(new \GuzzleHttp\Client()),
                            $url);
                    $client->setCredentials(new \Vnn\WpApiClient\Auth\WpBasicAuth($this->getParameter('app.wp-rest.user'), $this->getParameter('app.wp-rest.password')));

                    $posts = $client->posts()->get(null, [
                        'per_page' => 15,
                        'lang' => $request->getLocale(),
                    ]);

                    if (!empty($posts)) {
                        return $this->render('@TeiEdition/About/news.html.twig', [
                            'articles' => $this->buildNewsArticles($posts, $client),
                        ]);
                    }
                }
                catch (\Exception $e) {
                    ;
                }
            }
        }
        catch (\InvalidArgumentException $e) {
            ; // ignore
        }

        // static fallback
        return $this->renderAbout($request, $translator, 'News');
    }

    /**
     * @Route("/about/staff", name="about-staff")
     */
    public function staffAction(Request $request, TranslatorInterface $translator)
    {
        return $this->renderAboutUs($request, $translator, 'Staff');
    }

    /**
     * @Route("/about/editors", name="about-editors")
     */
    public function editorsAction(Request $request, TranslatorInterface $translator)
    {
        return $this->renderAboutUs($request, $translator, 'Editors');
    }

    /**
     * @Route("/about/board", name="about-board")
     */
    public function boardAction(Request $request, TranslatorInterface $translator)
    {
        return $this->renderAboutUs($request, $translator, 'Advisory Board');
    }

    /**
     * @Route("/about/sponsors", name="about-sponsors")
     */
    public function sponsorsAction(Request $request,
                                   TranslatorInterface $translator)
    {
        return $this->renderAboutUs($request, $translator, 'Sponsors and Partners');
    }

    /**
     * @Route("/about/cfp", name="about-cfp")
     */
    public function cfpAction(Request $request,
                              TranslatorInterface $translator)
    {
        return $this->renderAboutUs($request, $translator, 'Become an Author');
    }

    /**
     * @Route("/terms", name="terms")
     */
    public function termsAction(Request $request,
                                TranslatorInterface $translator)
    {
        return $this->renderTitleContent($request, $translator, 'Terms and Conditions', '@TeiEdition/Default/sitetext.html.twig');
    }

    protected function sendMessage($mailer, $twig, $data)
    {
        $template = $twig->loadTemplate('@TeiEdition/Default/contact.email.twig');

        $subject = $template->renderBlock('subject', [ 'data' => $data ]);
        $textBody = $template->renderBlock('body_text', [ 'data' => $data ]);
        $htmlBody = $template->renderBlock('body_html', [ 'data' => $data ]);

        $message = (new \Swift_Message($subject))
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
            return $mailer->send($message);
        }
        catch (\Exception $e) {
            return false;
        }
    }

    /**
     * @Route("/contact", name="contact")
     */
    public function contactAction(Request $request,
                                  TranslatorInterface $translator,
                                  \Swift_Mailer $mailer,
                                  \Twig\Environment $twig)
    {
        $form = $this->createForm(\TeiEditionBundle\Form\Type\ContactType::class);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            return $this->render('@TeiEdition/Default/contact-sent.html.twig', [
                'pageTitle' => $translator->trans('Contact'),
                'success' => $this->sendMessage($mailer, $twig, $form->getData()),
            ]);
        }

        $response = $this->renderTitleContent($request, $translator, 'Contact', '@TeiEdition/Default/sitetext.html.twig');

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

        // the following gets full html from $crawler, except the doctype, so re-add
        $node = $crawler->getNode(0);
        $domDocument = $node->parentNode;
        $html = '<!DOCTYPE html>' . "\n"
            . $domDocument->saveHTML($node);

        return new Response(str_replace('%form%',
                                        $this->renderView('@TeiEdition/Default/contact-form.html.twig', [
                                            'form' => $form->createView(),
                                        ]),
                                        $html));
    }
}

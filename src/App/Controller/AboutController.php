<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Render the data/tei/about-*.locale.xml
 */
class AboutController
extends \TeiEditionBundle\Controller\RenderTeiController
{
    /**
     * Render about-text from TEI to HTML
     */
    protected function renderContent(Request $request, $fnameTei)
    {
        $params = [
            'lang' => \TeiEditionBundle\Utils\Iso639::code1To3($request->getLocale()),
        ];

        $html = $this->renderTei($fnameTei, 'dtabf_article-printview.xsl', [
            'params' => $params,
        ]);

        if (false === $html) {
            return '<div class="alert alert-warning">'
                 . 'Error: Invalid or missing file: ' . $fnameTei
                 . '</div>';
        }

        return $html;
    }

    /**
     * Render about-text from TEI to HTML
     * If $title is null, extract from TEI
     */
    protected function renderTitleContent(Request $request,
                                          $template,
                                          $title = null)
    {
        $route = $request->get('_route');
        $locale = $request->getLocale();
        $fnameTei = $route . '.' . $locale . '.xml';
        $title = '';

        if (is_null($title)) {
            $fnameFull = $this->locateTeiResource($fnameTei);
            if (false !== $fnameFull) {
                $teiHelper = new \TeiEditionBundle\Utils\TeiHelper();
                $meta = $teiHelper->analyzeHeader($this->locateTeiResource($fnameFull));
                if (!is_null($meta)) {
                    $title = $meta->name;
                }
            }
        }

        return $this->render($template, [
            'pageTitle' => $title,
            'title' => $title,
            'content' => $this->renderContent($request, $fnameTei),
        ]);
    }

    /**
     * @Route("/about/edition", name="about")
     * @Route("/about/goals", name="about-goals")
     * @Route("/about/keydocuments", name="about-keydocuments")
     * @Route("/about/audience", name="about-audience")
     * @Route("/about/usage", name="about-usage")
     * @Route("/about/editorial-model", name="about-editorialmodel")
     * @Route("/about/edition-guidelines", name="about-editionguidelines")
     * @Route("/about/technical-implementation", name="about-implementation")
     * @Route("/about/publications", name="about-publications")
     * @Route("/terms", name="terms")
     */
    public function renderAbout(Request $request, $title = null)
    {
        return $this->renderTitleContent($request, 'About/sitetext-about.html.twig', $title);
    }

    /**
     * build Article-entities from Wordpress-API entries
     */
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
     *
     * If app.wp-rest.url is set, get news-entries
     * through Wordpress-API
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
        return $this->renderAbout($request, $translator->trans('News'));
    }

    /**
     * @Route("/about/staff", name="about-staff")
     *
     * Legacy route, replaced by about-us
     */
    public function staffAction(Request $request, TranslatorInterface $translator)
    {
        return $this->redirect($this->generateUrl('about-us'));
    }

    /**
     * @Route("/about/team", name="about-us")
     * @Route("/about/editors", name="about-editors")
     * @Route("/about/board", name="about-board")
     * @Route("/about/sponsors", name="about-sponsors")
     * @Route("/about/cfp", name="about-cfp")
     */
    public function renderAboutUs(Request $request, $title = null)
    {
        return $this->renderTitleContent($request, 'About/sitetext-about-us.html.twig', $title);
    }

    /**
     * Send the contents of the contact form
     */
    protected function sendMessage(MailerInterface $mailer, \Twig\Environment $twig, $data)
    {
        $template = $twig->load('About/contact.email.twig');

        $subject = $template->renderBlock('subject', [ 'data' => $data ]);
        $textBody = $template->renderBlock('body_text', [ 'data' => $data ]);
        $htmlBody = $template->renderBlock('body_html', [ 'data' => $data ]);

        $message = (new Email())
            ->from('burckhardtd@geschichte.hu-berlin.de')
            ->to('burckhardtd@geschichte.hu-berlin.de')
            ->subject($subject)
            ->replyTo($data['email']);
            ;

        if (!empty($htmlBody)) {
            $message->html($htmlBody)
                ->text($textBody);
        }
        else {
            $message->text($textBody);
        }

        try {
            $mailer->send($message);
        }
        catch (\Exception $e) {
            return false;
        }

        return true;
    }

    /**
     * @Route("/contact", name="contact")
     */
    public function contactAction(Request $request,
                                  TranslatorInterface $translator,
                                  MailerInterface $mailer,
                                  \Twig\Environment $twig)
    {
        $form = $this->createForm(\App\Form\Type\ContactType::class);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            return $this->render('About/contact-sent.html.twig', [
                'pageTitle' => $translator->trans('Contact'),
                'success' => $this->sendMessage($mailer, $twig, $form->getData()),
            ]);
        }

        $response = $this->renderTitleContent($request, 'About/sitetext.html.twig', $translator->trans('Contact'));

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
                                        $this->renderView('About/contact-form.html.twig', [
                                            'form' => $form->createView(),
                                        ]),
                                        $html));
    }
}

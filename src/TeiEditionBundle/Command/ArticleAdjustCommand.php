<?php
// src/TeiEditionBundle/Command/ArticleAdjustCommand.php

namespace TeiEditionBundle\Command;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;

/**
 * Insert information from Admin-Database into manually created TEI.
 */
class ArticleAdjustCommand
extends BaseCommand
{
    protected function configure()
    {
        $this
            ->setName('article:adjust')
            ->setDescription('Adjust Header')
            ->addArgument(
                'file',
                InputArgument::REQUIRED,
                'TEI file'
            )
            ->addOption(
                'tidy',
                null,
                InputOption::VALUE_NONE,
                'If set, the output will be pretty printed'
            )
        ;
    }

    protected function getDataFromAdminDb($data, $translator)
    {
        if (!preg_match('/(article|source)\-(\d+)$/', $data['uid'], $matches)) {
            return $data;
        }

        switch ($matches[1]) {
            case 'article':
                $sql = "SELECT 'article' AS query_type, Message.*"
                     . ", Translator.slug AS translator_slug, Translator.firstname, Translator.lastname"
                     . ", Referee.slug AS referee_slug"
                     . " FROM Message"
                     . " LEFT OUTER JOIN User Translator"
                     . " ON Message.translator = Translator.id"
                     . " LEFT OUTER JOIN User Referee"
                     . " ON Message.referee = Referee.id"
                     . " WHERE Message.id=:id AND Message.status <> -1"
                     ;
                $params = [ 'id' => $matches[2] ];
                break;

            case 'source':
                $translatorField = 'deu' == $data['lang']
                    ? 'translator_de' : 'translator';

                $sql = "SELECT 'source' AS query_type, Publication.*"
                     . ", Translator.slug AS translator_slug, Translator.firstname, Translator.lastname"
                     . ", Provider.name AS provider_name, Provider.gnd AS provider_gnd, T1.name AS type_name"
                     . " FROM Publication"
                     . " LEFT OUTER JOIN User Translator"
                     . " ON Publication.{$translatorField} = Translator.id"
                     . " LEFT OUTER JOIN Publisher Provider"
                     . " ON Publication.publisher_id = Provider.id"
                     . " LEFT OUTER JOIN Term T1"
                     . " ON Publication.type = T1.id"
                     . " WHERE Publication.id=:id AND Publication.status <> -1"
                     ;
                $params = [ 'id' => $matches[2] ];
                break;
        }

        $result = $this->dbconnAdmin->fetchAssoc($sql, $params);

        if (false === $result || empty($result)) {
            return $data;
        }

        // common stuff
        if (!empty($result['lang'])
            && ($translatedFrom = \TeiEditionBundle\Utils\Iso639::code2bTo3($result['lang'])) != $data['lang'])
        {
            $translatorSlug = trim(join(' ', [ $result['firstname'], $result['lastname'] ]));
            if (!empty($translatorSlug)) {
                $data['translator'] = [
                    $result['translator_slug'] => $translatorSlug,
                ];
            }

            // admin uses 639-2B ('ger' instead of 'deu')
            $data['translatedFrom'] = $translatedFrom;
        }

        switch ($result['query_type']) {
            case 'article':
                $genre = 'Interpretation';
                if (preg_match('/^Einführung/', $result['subject'])) {
                    $genre = 'Introduction';
                }

                $data['genre'] = /** @Ignore */ $translator->trans($genre);

                if (!empty($result['section'])) {
                    $sql = "SELECT name FROM Term WHERE id IN (?) AND status <> -1";
                    $stmt = $this->dbconnAdmin->executeQuery($sql,
                                                [ explode(',', $result['section']) ],
                                                [ \Doctrine\DBAL\Connection::PARAM_INT_ARRAY ]);
                    $terms = $stmt->fetchAll();

                    $topics = [];
                    foreach ($terms as $term) {
                        /** @Ignore */
                        $topics[] = $translator->trans(\TeiEditionBundle\Controller\TopicController::lookupLocalizedTopic($term['name'], $translator, 'de')); // The admin-database stores the terms in German, so look them up from this locale
                    }

                    // set primary topic according to editor
                    $responsible = [];
                    switch ($result['referee_slug']) {
                        case 'bergmann-werner':
                            $responsible = [ $translator->trans('Antisemitism and Persecution') ];
                            break;

                        case 'braemer-andreas':
                            $responsible = [ $translator->trans('Religion and Identity') ];
                            break;

                        case 'brinkmann-tobias':
                            $responsible = [ $translator->trans('Migration') ];
                            break;

                        case 'fischer-stefanie':
                            $responsible = [ $translator->trans('Family and Everyday Life') ];
                            break;

                        case 'heinsohn-kirsten':
                            $responsible = [ $translator->trans('Leisure and Sports') ];
                            break;

                        case 'jensen-uffa':
                            $responsible = [
                                $translator->trans('Law and Politics'),
                                $translator->trans('Economy and Occupational Composition'),
                            ];
                            break;

                        case 'kauders-anthony':
                            $responsible = [ $translator->trans('Arts and Culture') ];
                            break;

                        case 'liedtke-rainer':
                            $responsible = [ $translator->trans('Organizations and Institutions') ];
                            break;

                        case 'lohmann-ingrid':
                            $responsible = [ $translator->trans('Education and Learning') ];
                            break;

                        case 'meyer-beate':
                            $responsible = [ $translator->trans('Memory and Remembrance') ];
                            break;

                        case 'ruerup-miriam':
                            $responsible = [ $translator->trans('Demographics and Social Structure') ];
                            break;

                        case 'schueler-springorum-stefanie':
                            $responsible = [ $translator->trans('Social Issues and Welfare') ];
                            break;

                        case 'studemund-halevy-michael':
                            $responsible = [ $translator->trans('Sephardic Jews') ];
                            break;

                        case 'tuerk-lilian':
                            $responsible = [ $translator->trans('Scholarship') ];
                            break;

                        default:
                            if (!empty($result['referee_slug'])) {
                                die('TODO: handle ' . $result['referee_slug']);
                            }
                    }

                    usort($topics, function ($a, $b) use ($responsible) {
                        if ($a == $b) {
                            return 0;
                        }

                        if (in_array($a, $responsible) && in_array($b, $responsible)) {
                            return strcmp($a, $b);
                        }

                        if (in_array($a, $responsible)) {
                            return -1;
                        }

                        if (in_array($b, $responsible)) {
                            return 1;
                        }

                        return strcmp($a, $b);
                    });

                    $data['topic'] = $topics;
                }

                $key_slug = 'slug';
                if ('en' == $translator->getLocale()) {
                    $key_slug .= '_' . $translator->getLocale();
                }

                if (!empty($result[$key_slug])) {
                    $data['slug'] = $result[$key_slug];
                }

                $dates = [];
                if (!empty($result['published'])) {
                    $published = new \DateTime($result['published']);
                    $dates['firstPublication'] = $published->format('Y-m-d');

                    if (!empty($result['modified'])) {
                        $modified = (new \DateTime($result['modified']))
                            ->format('Y-m-d');
                        if ($modified != $dates['firstPublication']) {
                            $dates['publication'] = $modified;
                        }
                    }
                }
                if (!empty($dates)) {
                    $data['dates'] = $dates;
                }

                if (!empty($result['license'])) {
                    switch ($result['license']) {
                        case 'CC BY-NC-ND':
                            $data['license'] = [
                                'http://creativecommons.org/licenses/by-nc-nd/4.0/'
                                => $translator->trans('license.by-nc-nd'),
                            ];
                            break;

                        case 'CC BY-SA':
                            $data['license'] = [
                                'http://creativecommons.org/licenses/by-sa/4.0/'
                                => $translator->trans('license.by-sa'),
                            ];
                            break;

                        case 'restricted':
                            $data['license'] = [ '' => $translator->trans('license.restricted') ];
                            break;

                        default:
                            die('TODO: handle ' . $result['license']);
                    }
                }
                break;

            case 'source':
                $locale = $translator->getLocale();
                $type = 'Text';
                switch ($result['type_name']) {
                    case 'Audio':
                    case 'Video':
                    case 'Text':
                        $type = $result['type_name'];
                        break;

                    case 'Bild':
                        $type = 'Image';
                        break;

                    case 'Transkript':
                        $type = 'Transcript';
                        break;

                    case 'Objekt':
                        $type = 'Object';
                        break;
                }

                $data['genre'] = $translator->trans('Source')
                               . ':'
                               . /** @Ignore */ $translator->trans($type);

                if (!empty($result['url'])) {
                    $data['URLImages'] = $result['url'];
                }

                // articles related to this source
                $sql = "SELECT Message.id AS id, subject, status"
                     . " FROM Message, MessagePublication"
                     . " WHERE MessagePublication.publication_id=? AND MessagePublication.message_id=Message.id AND Message.status <> -1"
                     . " ORDER BY Message.id DESC";

                $stmt = $this->dbconnAdmin->executeQuery($sql, [ $result['id'] ]);
                $articles = $stmt->fetchAll();
                $seriesStmt = [];
                foreach ($articles as $article) {
                    $corresp = sprintf('jgo:article-%d', $article['id']);
                    $seriesStmt[$corresp] = $article['subject']; // TODO: get actual title from TEI, not the one from db
                }
                if (!empty($seriesStmt)) {
                    $data['seriesStmt'] = $seriesStmt;
                }

                $bibl = [];

                if (!empty($result['author'])) {
                    $bibl['author'] = $result['author'];
                }

                if (!empty($result['place_identifier'])) {
                    $place = $this->findPlaceByUri($result['place_identifier']);
                    if (is_null($place)) {
                        die('TODO: get info for ' . $result['place_identifier']);
                    }
                    $bibl['placeName'] = [
                        '@ref' => $result['place_identifier'],
                        '@value' => $place->getNameLocalized($locale),
                    ];
                    if (!empty($result['place_geo'])) {
                        $bibl['placeName']['@corresp'] = '#' . trim($result['place_geo']);
                    }
                }

                if (!empty($result['indexingdate'])) {
                    $when = $result['indexingdate'];
                    if (!empty($result['displaydate'])) {
                        $date = $result['displaydate'];
                    }
                    else {
                        $date = \TeiEditionBundle\Utils\Formatter::dateIncomplete($when, $locale);
                    }

                    while (preg_match('/(.+)\-00$/', $when, $matches)) {
                        $when = $matches[1];
                    }

                    $bibl['date'] = [
                        '@when' => $when,
                        '@value' => $date,
                    ];
                }

                if (!empty($result['provider_name'])
                    && $result['provider_name'] != 'unbekannt')
                {
                    $bibl['orgName'] = [ '@value' => $result['provider_name'] ];

                    if (!empty($result['provider_gnd'])) {
                        $bibl['orgName']['@ref'] = 'http://d-nb.info/gnd/' . $result['provider_gnd'];
                    }
                }

                if (!empty($result['archive_location'])) {
                    $bibl['idno'] = $result['archive_location'];
                }

                $data['bibl'] = $bibl;

                $licenseKey = ''; // restricted
                $licenseAttribution = null;

                if (!empty($result['license'])) {
                    switch ($result['license']) {
                        case 'CC BY-SA':
                            $licenseKey = 'http://creativecommons.org/licenses/by-sa/4.0/';
                            $licenseAttribution = $translator->trans('license.by-sa');
                            break;

                        case 'CC BY-NC-SA':
                            $licenseKey = 'http://creativecommons.org/licenses/by-nc-sa/4.0/';
                            $licenseAttribution = $translator->trans('license.by-nc-sa');
                            break;

                        case 'CC BY-NC-ND':
                            $licenseKey = 'http://creativecommons.org/licenses/by-nc-nd/4.0/';
                            $licenseAttribution = $translator->trans('license.by-nc-nd');
                            break;

                        case 'restricted':
                            ;
                            break;

                        case 'PD':
                            $licenseKey = '#public-domain';
                            $licenseAttribution = $translator->trans('license.public-domain');
                            break;

                        case 'regular':
                            $licenseKey = '#personal-use';
                            $licenseAttribution = $translator->trans('license.personal-use');
                            break;

                        default:
                            die('TODO: handle ' . $result['license']);
                    }
                }

                if (!empty($result['attribution'])) {
                    $attribution = json_decode($result['attribution'], true);
                    if (false !== $attribution && !empty($attribution[$locale])) {
                        $licenseAttribution = $attribution[$locale];
                    }
                }

                if ('' !== $licenseKey || !is_null($licenseAttribution)) {
                    $data['license'] = [
                        $licenseKey => $licenseAttribution,
                    ];
                }
                break;

            default:
                die('TODO: handle ' . $result['query_type']);
        }

        return $data;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $fname = $input->getArgument('file');

        $fs = new Filesystem();

        if (!$fs->exists($fname)) {
            $output->writeln(sprintf('<error>%s does not exist</error>', $fname));

            return 1;
        }

        $teiHelper = new \TeiEditionBundle\Utils\TeiHelper();

        $uid = $langCode1 = null;
        if (preg_match('/(article|source)\-(\d+)\.(de|en)\.(xml|tei)$/', $fname, $matches)) {
            $uid = sprintf('jgo:%s-%d', $matches[1], $matches[2]);
            $langCode1 = $matches[3];
        }
        else if (preg_match('/(source)\-(\d+)\.(yi|yl|ja|la|sv|pt)\.(xml|tei)$/', $fname, $matches)) {
            // yiddish (hebrew), yiddish (latin), japanese, latin, swedish, portuguese
            $uid = sprintf('jgo:%s-%d', $matches[1], $matches[2]);
            $langCode1 = $matches[3];
        }

        if (empty($uid) || empty($langCode1)) {
            die('TODO: determine uid/langCode1 from teiHeader');
        }

        $data = [
            'uid' => $uid,
            'lang' => \TeiEditionBundle\Utils\Iso639::code1To3($langCode1),
        ];

        // set the publisher - needs to be localized
        $this->translator->setLocale(\TeiEditionBundle\Utils\Iso639::code3To1($data['lang']));

        $data['publisher'] = [
            'orgName' => $this->translator->trans('Institute for the History of the German Jews'),
            'email' => 'redaktion@juedische-geschichte-online.net',
            'address' => [
                'addrLine' => 'Beim Schlump 83, 20144 Hamburg',
            ],
        ];

        // all the data from the admin-database
        $dataFromDb = $this->getDataFromAdminDb($data, $this->translator);

        $xml = $teiHelper->adjustHeader($fname, $dataFromDb);
        if (false === $xml) {
            $output->writeln(sprintf('<error>%s could not be loaded</error>', $fname));

            return 1;
        }

        $xmlAsString = $xml->asXML();

        if ($input->getOption('tidy')) {
            // first check if it is valid
            $fnameSchema = $this->locateData('basisformat.rng');

            // we pass the string as stream_wrapper
            $stream = fopen('php://memory','r+');
            fwrite($stream, $xmlAsString);
            rewind($stream);

            $result = $teiHelper->validateXml($stream, $fnameSchema);

            if (false === $result) {
                fwrite(STDERR, "Invalid XML according to basisformat.rng\n");
                foreach ($teiHelper->getErrors() as $error) {
                    fwrite(STDERR, trim($error->message) . "\n");
                }
                /*
                // TODO: use Symfony's method to write to STDERR
                $output->writeln('<info> Invalid XML according to basisformat.rng</info>');
                foreach ($teiHelper->getErrors() as $error) {
                    $output->writeln(sprintf('<error>  %s</error>', trim($error->message)));
                }
                */
            }
            else {
                $res = $this->formatter->formatXML($xmlAsString);
                if (is_string($res)) {
                    $xmlAsString = $res;
                }
            }
        }

        $output->write($xmlAsString);

        return 0;
    }
}

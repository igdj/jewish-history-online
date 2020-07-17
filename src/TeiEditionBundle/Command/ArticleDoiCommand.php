<?php
// src/TeiEditionBundle/Command/ArticleDoiCommand.php

namespace TeiEditionBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;

use Symfony\Contracts\Translation\TranslatorInterface;

use Doctrine\ORM\EntityManagerInterface;

use FluidXml\FluidXml;
use FluidXml\FluidNamespace;

/**
 * Assign DOIs through DataCite MDS API.
 */
class ArticleDoiCommand
extends Command
{
    protected $em;
    protected $router;
    protected $translator;
    protected $prefix;
    protected $baseUrl;
    protected $user;
    protected $password;

    public function __construct(EntityManagerInterface $em,
                                RouterInterface $router,
                                TranslatorInterface $translator,
                                ParameterBagInterface $params)
    {
        parent::__construct();

        $this->em = $em;
        $this->router = $router;
        $this->translator = $translator;
        $this->prefix = $params->get('app.datacite.prefix');

        $this->baseUrl = $params->get('app.datacite.url');
        $this->user = $params->get('app.datacite.user');
        $this->password = $params->get('app.datacite.password');
    }

    protected function configure()
    {
        $this
            ->setName('article:doi')
            ->setDescription('Register DOI')
            ->addArgument(
                'file',
                InputArgument::REQUIRED,
                'TEI file'
            )
            ->addOption(
                'insert-missing',
                null,
                InputOption::VALUE_NONE,
                'If set, a missing doi will be added'
            )
            ->addOption(
                'update',
                null,
                InputOption::VALUE_NONE,
                'If set, an existing doi will be updated'
            )
        ;
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

        $article = $teiHelper->analyzeHeader($fname);

        if (false === $article) {
            $output->writeln(sprintf('<error>%s could not be loaded</error>', $fname));
            foreach ($teiHelper->getErrors() as $error) {
                $output->writeln(sprintf('<error>  %s</error>', trim($error->message)));
            }

            return 1;
        }

        $entity = $this->em->getRepository('TeiEditionBundle\Entity\Article')
            ->findOneBy([
                'uid' => $article->uid,
                'language' => $article->language,
            ]);

        if (is_null($entity)) {
            $output->writeln(sprintf('<error>no entry for uid %s found</error>', $article->uid));

            return 1;
        }


        list($url, $metadata) = $this->buildDataCite($entity, $this->prefix);

        $persist = false;

        if ($input->getOption('insert-missing')) {
            $doi = $entity->getDoi();
            if (!is_null($doi)) {
                $output->writeln(sprintf('<info>doi for uid %s already exists: %s</info>',
                                         $entity->getUid(), $entity->getDoi()));

                return 0;
            }
        }
        else if ($input->getOption('update')) {
            $doi = $entity->getDoi();
            if (is_null($doi)) {
                $output->writeln(sprintf('<info>no doi for uid %s yet</info>',
                                         $entity->getUid()));

                return 0;
            }
        }

        if ($input->getOption('insert-missing') || $input->getOption('update')) {
            $doi = $entity->buildDoi($this->prefix);
            $success = $this->registerDoi($doi, $url, $metadata, $entity->getStatus() > 0);
            if (true === $success) {
                $entity->setDoi($doi);
                $persist = true;
            }
            else {
                $output->writeln(sprintf('<info>Error trying to register doi %s for %s</info>',
                                         $doi, $entity->getUid()));

                return 2;
            }
        }
        else {
            echo $metadata;
        }

        if ($persist) {
            $this->em->persist($entity);
            $this->flushEm($this->em);
        }
    }

    function registerDoi($doi, $url, $metadata, $isActive = true)
    {
        // first step is to post metadata
        $response = \Httpful\Request::post($this->baseUrl . 'metadata')
            ->body($metadata)
            ->authenticateWith($this->user, $this->password)
            ->sendsXml()
            ->send();

        if ($response->hasErrors()) {
            return false;
        }

        if (!preg_match('/^OK/', $response->body)) {
            die('TODO: handle ' . $response->body);
        }

        if (!$isActive) {
            // delete-request sets to in_active
            $response = \Httpful\Request::delete($this->baseUrl . 'metadata/' . $doi)
                ->authenticateWith($this->user, $this->password)
                ->send();
        }

        // now mint the doi
        $mint = join("\n", [ 'doi=' . $doi, 'url=' . $url ]);

        $response = \Httpful\Request::post($this->baseUrl . 'doi')
            ->addHeader('Content-Type', 'text/plain;charset=UTF-8')
            ->body($mint)
            ->authenticateWith($this->user, $this->password)
            ->send();

        if ($response->hasErrors()) {
            return false;
        }

        return (bool)preg_match('/^OK/', $response->body);
    }

    private function adjustUrlProduction($url)
    {
        /* dirty hack to generate production urls on local setup */
        return str_replace([ '//localhost/', '//127.0.0.1/', ],
                           [ '//juedische-geschichte-online.net/', '//jewish-history-online.net/' ],
                           $url);
    }

    private function xmlspecialchars($str)
    {
        return htmlspecialchars($str, ENT_XML1, 'utf-8');
    }

    protected function buildDataCite($entity, $prefix)
    {
        $locale = \TeiEditionBundle\Utils\Iso639::code3To1($entity->getLanguage());
        $this->translator->setLocale($locale);

        $resource = new FluidXml(null);
        $resource->namespace('datacite', 'http://datacite.org/schema/kernel-4', FluidNamespace::MODE_IMPLICIT);
        $root = $resource->add('datacite:resource', true);

        $xsiNs = new FluidNamespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance');
        $rootNode = $root[0];
        $rootNode->setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:{$xsiNs->id()}",  $xsiNs->uri());

        $root->attr([ 'xsi:schemaLocation' => 'http://datacite.org/schema/kernel-4 http://schema.datacite.org/meta/kernel-4/metadata.xsd' ]);

        $root->addChild('identifier', $entity->buildDoi($prefix), [ 'identifierType' => 'DOI' ]);

        if ('source' == $entity->getGenre()) {
            $routeKey = 'uid';
            $routeName = 'source';
            // for sources, creator is free-text
            $creator = $entity->getCreator();
            if (!empty($creator)) {
                // xmlspecialchars needed due to https://github.com/servo-php/fluidxml/issues/14
                $creators = $root->addChild('creators', true)
                    ->addChild('creator', true)
                        ->addChild('creatorName', $this->xmlspecialchars($creator))
                    ;
            }
            else {
                die('TODO: either creators or contributors is mandatory');
            }
        }
        else {
            $routeKey = 'slug';
            $routeName = 'article';
            $authors = $entity->getAuthor();
            if (count($authors) > 0) {
                $creators = $root->addChild('creators', true);
                foreach ($authors as $author) {
                    $creator =
                        $creators->addChild('creator', true)
                            ->addChild('creatorName', $author->getFullname())
                            ->addChild('givenName', $author->getGivenName())
                            ->addChild('familyName', $author->getFamilyName());
                    $gnd = $author->getGnd();
                    if (!empty($gnd)) {
                        $creator->addChild('nameIdentifier', $gnd, [
                            'schemeURI' => 'http://d-nb.info/gnd',
                            'nameIdentifierScheme' => 'GND',
                        ]);
                    }
                }
            }
        }

        $root->addChild('titles', true)
            ->addChild('title', $entity->getName(), [ 'xml:lang' => $locale ]);

        $root
            // set the publisher - maybe get from xml instead
            ->addChild('publisher', $this->translator->trans('Institute for the History of the German Jews'));

        $publishedDate = $entity->getDatePublished();
        if (!is_null($publishedDate)) {
            $root->addChild('publicationYear', $publishedDate->format('Y'));
            $root->addChild('dates', true)
                ->addChild('date', $publishedDate->format('Y-m-d'), [ 'dateType' => 'Issued' ])
                ;
        }
        else {
            $now = new \DateTime();
            $root->addChild('publicationYear', $now->format('Y'));
        }

        if ('source' == $entity->getGenre()) {
            // adjust for different types of sources
            /*
            Controlled List Values for resourceTypeGeneral:
            Audiovisual -> Video
            Image
            PhysicalObject
            Sound
            Text
            Other
            */
            switch ($entity->getSourceType()) {
                case 'Object':
                case 'Objekt':
                    $root->addChild('resourceType', 'Object', [ 'resourceTypeGeneral' => 'PhysicalObject' ]);
                    break;

                case 'Image':
                case 'Bild':
                    $root->addChild('resourceType', 'Image', [ 'resourceTypeGeneral' => 'Image' ]);
                    break;

                case 'Audio':
                    $root->addChild('resourceType', 'Video', [ 'resourceTypeGeneral' => 'Audiovisual' ]);
                    break;

                case 'Video':
                    $root->addChild('resourceType', 'Audio', [ 'resourceTypeGeneral' => 'Sound' ]);
                    break;

                case 'Text':
                case 'Transcript':
                case 'Transkript':
                    $root->addChild('resourceType', 'Source', [ 'resourceTypeGeneral' => 'Text' ]);
                    break;

                default:
                    die('TODO: Handle sourceType: ' . $entity->getSourceType());
            }
        }
        else {
           $root->addChild('resourceType', 'Article', [ 'resourceTypeGeneral' => 'Text' ]);
        }

        /*
        // if you want to force https:// with UrlGeneratorInterface::ABSOLUTE_URL
        $context = $this->router->getContext();
        $context->setScheme('https');
        */

        $url = $this->adjustUrlProduction($this->router->generate($routeName, [
                $routeKey => $entity->getUid(),
                '_locale' => $locale,
            ], UrlGeneratorInterface::ABSOLUTE_URL));

        $root->addChild('language', $locale)
            ->addChild('alternateIdentifiers', true)
                ->addChild('alternateIdentifier', $url, [
                    'alternateIdentifierType' => 'URL',
                ]);

        $root->addChild('version', $entity->getVersion());

        // rights
        $rightsAttr = [];
        $rights = $entity->getRights();
        $license = $entity->getLicense();
        if (!empty($license)) {
            if ('#' != $license[0]) {
                $rightsAttr['rightsURI'] = $license;
            }

            if (empty($rights)) {
                // set standard rights for this license
                switch ($rightsAttr['rightsURI']) {
                    case 'http://creativecommons.org/licenses/by-nc-nd/4.0/':
                        $rights = $this->translator->trans('license.by-nc-nd');
                        break;
                }
            }
        }

        if (empty($rights) && !empty($license)) {
            die('TODO: determine rights-statement for ' . $license);
        }

        if (!empty($rights)) {
            // xmlspecialchars needed due to https://github.com/servo-php/fluidxml/issues/14
            $root->addChild('rightsList', true)
                ->addChild('rights', $this->xmlspecialchars($rights), $rightsAttr);
        }

        $keywords = $entity->getKeywords();
        if (!empty($keywords)) {
            $subjects = $root->addChild('subjects', true);
            foreach ($keywords as $keyword) {
                $subjects->addChild('subject', $keyword, [ 'xml:lang' => $locale ]);
            }
        }

        // relatedIdentifiers
        $relatedIdentifiers = $root->addChild('relatedIdentifiers', true);

        $relatedIdentifiers->addChild('relatedIdentifier',
            $this->adjustUrlProduction($this->router->generate('home',
                                                               [ '_locale' => $locale, ],
                                                               UrlGeneratorInterface::ABSOLUTE_URL)),
            [
                'relatedIdentifierType' => 'URL',
                'relationType' => 'IsPartOf',
            ]
        );

        // connection to translation
        $variants = $this->em
            ->getRepository('\TeiEditionBundle\Entity\Article')
            ->findBy([ 'uid' => $entity->getUid() ])
            ;

        foreach ($variants as $variant) {
            if ($entity->getLanguage() != $variant->getLanguage()) {
                $relationType = $variant->getTranslatedFrom() ==  $entity->getLanguage()
                    ? 'IsOriginalFormOf'
                    : 'IsVariantFormOf';

                $relatedIdentifiers->addChild('relatedIdentifier', $variant->buildDoi($prefix), [
                    'relatedIdentifierType' => 'DOI',
                    'relationType' => $relationType,
                ]);
            }
        }

        // connection source <-> interpretation
        if ('source' == $entity->getGenre()) {
            // for sources: interpretation
            $interpretation = $entity->getIsPartOf();
            if (isset($interpretation)) {
                $relatedIdentifiers->addChild('relatedIdentifier', $interpretation->buildDoi($prefix), [
                    'relatedIdentifierType' => 'DOI',
                    'relationType' => 'IsSupplementTo',
                ]);
            }
        }
        else {
            // for interpretation: sources
            $related = $this->em
                ->getRepository('\TeiEditionBundle\Entity\Article')
                ->findBy([ 'isPartOf' => $entity ],
                         [ 'dateCreated' => 'ASC', 'name' => 'ASC'])
                ;
            foreach ($related as $source) {
                $relatedIdentifiers->addChild('relatedIdentifier', $source->buildDoi($prefix), [
                    'relatedIdentifierType' => 'DOI',
                    'relationType' => 'IsSupplementedBy',
                ]);
            }
        }

        // description
        $description = $entity->getDescription();
        if (!empty($description)) {
            // htmlspecialchars added due to https://github.com/servo-php/fluidxml/issues/14
            $root->addChild('descriptions', true)
                ->addChild('description', htmlspecialchars($description, ENT_XML1, 'UTF-8'), [
                    'descriptionType' => 'Abstract',
                    'xml:lang' => $locale,
                ]);
        }

        // funding
        $root->add(<<<XML
    <fundingReferences>
        <fundingReference>
            <funderName>Deutsche Forschungsgemeinschaft</funderName>
            <funderIdentifier funderIdentifierType="Crossref Funder ID">http://dx.doi.org/10.13039/501100001659</funderIdentifier>
            <awardNumber awardURI="http://gepris.dfg.de/gepris/projekt/268470421">268470421</awardNumber>
            <awardTitle>Schlüsseldokumente zur deutsch-jüdischen Geschichte von der frühen Neuzeit bis in die Gegenwart. Erstellung eines nutzerfreundlichen Online-Quellenportals für das Fach Jüdische Geschichte</awardTitle>
        </fundingReference>
    </fundingReferences>
XML
        );

        return [ $url, (string)$resource ];
    }
}

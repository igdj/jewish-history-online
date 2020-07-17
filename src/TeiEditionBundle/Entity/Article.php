<?php

namespace TeiEditionBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use FS\SolrBundle\Doctrine\Annotation as Solr;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * An article, such as a news article or piece of investigative report. Newspapers and magazines have articles of many different types and this is intended to cover them all.
 *
 * See also [blog post](http://blog.schema.org/2014/09/schemaorg-support-for-bibliographic_2.html).
 *
 * @see http://schema.org/Article Documentation on Schema.org
 *
 * @Solr\Document(indexHandler="indexHandler")
 * @Solr\SynchronizationFilter(callback="shouldBeIndexed")
 *
 * @ORM\Entity
 * @ORM\Table(name="article")
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name="genre", type="string")
 * @ORM\DiscriminatorMap({"interpretation" = "Article", "source" = "SourceArticle", "exhibition" = "ExhibitionArticle"})
 */
class Article
implements \JsonSerializable, JsonLdSerializable, OgSerializable,
\Eko\FeedBundle\Item\Writer\RoutedItemInterface
{
    static function truncate($value, $length = 30, $preserve = false, $separator = '...')
    {
        if (mb_strlen($value, 'UTF-8') > $length) {
            if ($preserve) {
                // If breakpoint is on the last word, return the value without separator.
                if (false === ($breakpoint = mb_strpos($value, ' ', $length, 'UTF-8'))) {
                    return $value;
                }

                $length = $breakpoint;
            }

            return rtrim(mb_substr($value, 0, $length, 'UTF-8')).$separator;
        }

        return $value;
    }

    static function formatDateIncomplete($dateStr)
    {
        if (preg_match('/^\d{4}$/', $dateStr)) {
            $dateStr .= '-00-00';
        }
        else if (preg_match('/^\d{4}\-\d{2}$/', $dateStr)) {
            $dateStr .= '-00';
        }

        return $dateStr;
    }

    /**
     * @var int
     *
     * @Solr\Id
     *
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @var integer
     *
     * @ORM\Column(type="integer", nullable=false)
     */
    protected $status = 0;

    /**
     * @var string
     *
     * @ORM\Column(nullable=true)
     * @Solr\Field(type="string")
     */
    protected $articleSection;

    /**
     * @var ArrayCollection<Person> The author of this content.
     *
     * Please note that author is special in that HTML 5 provides
     * a special mechanism for indicating authorship via the rel tag.
     * That is equivalent to this and may be used interchangeably.
     *
     * @ORM\ManyToMany(targetEntity="TeiEditionBundle\Entity\Person", inversedBy="articles")
     * @Solr\Field(type="strings", getter="getFullname")
     */
    protected $author;

    /**
     * @var Person Organization or person who adapts a creative work to different languages, regional differences and technical requirements of a target market, or that translates during some event..
     *
     * @ORM\ManyToOne(targetEntity="TeiEditionBundle\Entity\Person")
     */
    protected $translator;

    /**
     * @var string
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     */
    protected $translatedFrom;

    /**
     * @var Place The location depicted or described in the content.
     *
     * @ORM\ManyToOne(targetEntity="TeiEditionBundle\Entity\Place", inversedBy="articles")
     */
    protected $contentLocation;

    /**
     * @var string The geo coordinates of the place.
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     * @Solr\Field()
     */
    protected $geo;

    /**
     * @ORM\OneToMany(
     *   targetEntity="ArticlePerson",
     *   mappedBy="article",
     *   cascade={"persist", "remove"},
     *   orphanRemoval=TRUE
     * )
     */
    protected $personReferences;

    /**
     * @ORM\OneToMany(
     *   targetEntity="ArticleOrganization",
     *   mappedBy="article",
     *   cascade={"persist", "remove"},
     *   orphanRemoval=TRUE
     * )
     */
    protected $organizationReferences;

    /**
     * @ORM\OneToMany(
     *   targetEntity="ArticlePlace",
     *   mappedBy="article",
     *   cascade={"persist", "remove"},
     *   orphanRemoval=TRUE
     * )
     */
    protected $placeReferences;

    /**
     * @ORM\OneToMany(
     *   targetEntity="ArticleLandmark",
     *   mappedBy="article",
     *   cascade={"persist", "remove"},
     *   orphanRemoval=TRUE
     * )
     */
    protected $landmarkReferences;

    /**
     * @ORM\OneToMany(
     *   targetEntity="ArticleEvent",
     *   mappedBy="article",
     *   cascade={"persist", "remove"},
     *   orphanRemoval=TRUE
     * )
     */
    protected $eventReferences;

    /**
     * @ORM\OneToMany(
     *   targetEntity="ArticleBibitem",
     *   mappedBy="article",
     *   cascade={"persist", "remove"},
     *   orphanRemoval=TRUE
     * )
     */
    protected $bibitemReferences;

    /**
     * @var string The creator/author of this CreativeWork.
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $creator;

    /**
     * @var string The date on which the CreativeWork was created.
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $dateCreated;

    /**
     * @var string Override of the date on which the CreativeWork was created.
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $dateCreatedDisplay;

    /**
     * @var \DateTime Date of first broadcast/publication.
     *
     * @Assert\Date
     * @ORM\Column(type="date", nullable=true)
     */
    protected $datePublished;

    /**
     * @var \DateTime The date on which the CreativeWork was most recently modified or when the item's entry was modified .
     *
     * @Assert\Date
     * @ORM\Column(type="date", nullable=true)
     */
    protected $dateModified;

    /**
     * @var string A short description of the item.
     *
     * @ORM\Column(type="text", length=65535, nullable=true)
     * @Solr\Field(type="string")
     */
    protected $description;

    /**
     * @var Article Indicates a CreativeWork that this CreativeWork is (in some sense) part of.
     *
     * @ORM\ManyToOne(targetEntity="TeiEditionBundle\Entity\Article")
     */
    protected $isPartOf;

    /**
     * @var Organization Holding institution.
     *
     * @ORM\ManyToOne(targetEntity="TeiEditionBundle\Entity\Organization", inversedBy="providerOf")
     */
    protected $provider;

    /**
     * @var string Holding institution's identification number.
     *
     * @ORM\Column(type="string", nullable=true)
     *
     */
    protected $providerIdno;

    /**
     * @var string Keywords or tags used to describe this content. Multiple entries in a keywords list are typically delimited by commas.
     *
     * @ORM\Column(type="simple_array", nullable=true)
     */
    protected $keywords;

    /**
     * @var string A license document that applies to this content, typically indicated by URL.
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     */
    protected $license;

    /**
     * @var string A license document that applies to this content, typically indicated by URL.
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true, length=2048)
     */
    protected $rights;

    /**
     * @var string The name of the item.
     *
     * @Assert\Type(type="string")
     * @Assert\NotNull
     * @ORM\Column(length=512)
     * @Solr\Field(type="string")
     */
    protected $name;

    /**
     * @var string
     *
     * @Assert\Type(type="string")
     * @Assert\NotNull
     * @ORM\Column
     */
    protected $language;

    /**
     * @var string
     *
     * @Assert\Type(type="string")
     * @ORM\Column
     * @Solr\Field(type="string")
     */
    protected $sourceType;

    /**
     * @var string The textual content of this CreativeWork.
     *
     * @ORM\Column(type="text", length=16777215, nullable=true)
     * @Solr\Field(type="text")
     */
    protected $text;

    /**
     * @var string
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     * @Solr\Field(type="string")
     */
    protected $uid;

    /**
     * @var string
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     * @Solr\Field(type="string")
     */
    protected $doi;

    /**
     * @var string URL of the item.
     *
     * @Assert\Url
     * @ORM\Column(nullable=true)
     */
    protected $url;

    /**
     * @var string
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     * @Solr\Field(type="string")
     */
    protected $slug;

    /**
     * @var string
     *
     * Currently only used for news articles
     */
    public $thumbnailUrl = null;

    public function __construct()
    {
        $this->author = new ArrayCollection();
        $this->personReferences = new ArrayCollection();
        $this->placeReferences = new ArrayCollection();
        $this->organizationReferences = new ArrayCollection();
        $this->bibitemReferences = new ArrayCollection();
    }

    /**
     * Sets id.
     *
     * @param int $id
     *
     * @return $this
     */
    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

    /**
     * Gets id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Sets status.
     *
     * @param int $status
     *
     * @return $this
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Gets status.
     *
     * @return int
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Sets articleSection.
     *
     * @param string $articleSection
     *
     * @return $this
     */
    public function setArticleSection($articleSection = null)
    {
        $this->articleSection = $articleSection;

        return $this;
    }

    /**
     * Gets articleSection.
     *
     * @return string
     */
    public function getArticleSection()
    {
        return $this->articleSection;
    }

    /**
     * Adds author.
     *
     * @param Person $author
     *
     * @return $this
     */
    public function addAuthor(Person $author)
    {
        $this->author[] = $author;

        return $this;
    }

    /**
     * Removes author.
     *
     * @param Person $author
     *
     * @return $this
     */
    public function removeAuthor(Person $author)
    {
        $this->author->removeElement($author);

        return $this;
    }

    /**
     * Gets author.
     *
     * @return ArrayCollection<Person>
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * Gets author Firstname1 Lastname1, Firstname2 Lastname2
     *
     * @return string
     */
    public function getAuthorDisplay($givenNameFirst = true)
    {
        $howMany = is_null($this->author) ? 0 : count($this->author);

        if (0 == $howMany) {
            return '';
        }

        if (1 == $howMany) {
            return $this->author[0]->getFullname($givenNameFirst);
        }

        if (!empty($this->creator)) {
            // TODO: get from creator so we respect order
            $fullnames = explode('; ', $this->creator);
            if ($givenNameFirst) {
                // switch Lastname, Firstname to Firstname Lastname
                $fullnames = array_map(function ($name) {
                    return join(' ', array_reverse(explode(', ', $name, 2)));
                }, $fullnames);
            }
        }
        else {
            $fullnames = array_map(function ($person) use ($givenNameFirst) {
                return $person->getFullname($givenNameFirst);
            }, $this->author->toArray());
        }

        return join(', ', $fullnames);
    }

    /**
     * Sets translator.
     *
     * @param Translator $translator
     *
     * @return $this
     */
    public function setTranslator(Person $translator = null)
    {
        $this->translator = $translator;

        return $this;
    }

    /**
     * Gets Translator.
     *
     * @return Person|null
     */
    public function getTranslator()
    {
        return $this->translator;
    }

    /**
     * Sets language from which it was translated.
     *
     * @param string $translatedFrom
     *
     * @return $this
     */
    public function setTranslatedFrom($translatedFrom)
    {
        $this->translatedFrom = $translatedFrom;

        return $this;
    }

    /**
     * Gets language from which it was translated.
     *
     * @return string
     */
    public function getTranslatedFrom()
    {
        return $this->translatedFrom;
    }

    /**
     * Sets content location.
     *
     * @param Place $contentLocation
     *
     * @return $this
     */
    public function setContentLocation(Place $contentLocation = null)
    {
        $this->contentLocation = $contentLocation;

        return $this;
    }

    /**
     * Gets content location.
     *
     * @return Place
     */
    public function getContentLocation()
    {
        return $this->contentLocation;
    }

    /**
     * Sets geo.
     *
     * @param string $geo
     *
     * @return $this
     */
    public function setGeo($geo)
    {
        $this->geo = $geo;

        return $this;
    }

    /**
     * Gets geo.
     *
     * @return string
     */
    public function getGeo()
    {
        return $this->geo;
    }

    /**
     * Sets creator.
     *
     * @param string $creator
     *
     * @return $this
     */
    public function setCreator($creator = null)
    {
        $this->creator = $creator;

        return $this;
    }

    /**
     * Gets creator.
     *
     * @return string
     */
    public function getCreator()
    {
        return $this->creator;
    }

    /**
     * Sets dateCreated.
     *
     * @param string $dateCreated
     *
     * @return $this
     */
    public function setDateCreated($dateCreated = null)
    {
        $this->dateCreated = self::formatDateIncomplete($dateCreated);

        return $this;
    }

    /**
     * Gets dateCreated.
     *
     * @return string
     */
    public function getDateCreated()
    {
        return $this->dateCreated;
    }

    /**
     * Sets dateCreatedDisplay.
     *
     * @param string $dateCreatedDisplay
     *
     * @return $this
     */
    public function setDateCreatedDisplay($dateCreatedDisplay = null)
    {
        $this->dateCreatedDisplay = $dateCreatedDisplay;

        return $this;
    }

    /**
     * Gets dateCreatedDisplay.
     *
     * @return string
     */
    public function getDateCreatedDisplay()
    {
        return $this->dateCreatedDisplay;
    }

    /**
     * Sets datePublished.
     *
     * @param \DateTime $datePublished
     *
     * @return $this
     */
    public function setDatePublished(\DateTime $datePublished = null)
    {
        $this->datePublished = $datePublished;

        return $this;
    }

    /**
     * Gets datePublished.
     *
     * @return \DateTime
     */
    public function getDatePublished()
    {
        return $this->datePublished;
    }

    /**
     * Sets dateModified.
     *
     * @param \DateTime $dateModified
     *
     * @return $this
     */
    public function setDateModified(\DateTime $dateModified = null)
    {
        $this->dateModified = $dateModified;

        return $this;
    }

    /**
     * Gets dateModified.
     *
     * @return \DateTime
     */
    public function getDateModified()
    {
        return $this->dateModified;
    }

    /**
     * Sets description.
     *
     * @param string $description
     *
     * @return $this
     */
    public function setDescription($description = null)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Gets description.
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Gets genre.
     *
     * @return string
     */
    public function getGenre()
    {
        return 'interpretation';
    }

    /**
     * Sets isPartOf.
     *
     * @param Article $isPartOf
     *
     * @return $this
     */
    public function setIsPartOf(Article $isPartOf = null)
    {
        $this->isPartOf = $isPartOf;

        return $this;
    }

    /**
     * Gets isPartOf.
     *
     * @return Article
     */
    public function getIsPartOf()
    {
        return $this->isPartOf;
    }

    /**
     * Sets provider.
     *
     * @param Organization $provider
     *
     * @return $this
     */
    public function setProvider(Organization $provider = null)
    {
        $this->provider = $provider;

        return $this;
    }

    /**
     * Gets provider.
     *
     * @return Organization|null
     */
    public function getProvider()
    {
        return $this->provider;
    }

    /**
     * Sets providerIdno.
     *
     * @param string $providerIdno
     *
     * @return $this
     */
    public function setProviderIdno($providerIdno)
    {
        $this->providerIdno = $providerIdno;

        return $this;
    }

    /**
     * Gets providerIdno.
     *
     * @return string
     */
    public function getProviderIdno()
    {
        return $this->providerIdno;
    }

    /**
     * Sets keywords.
     *
     * @param string $keywords
     *
     * @return $this
     */
    public function setKeywords($keywords)
    {
        $this->keywords = $keywords;

        return $this;
    }

    /**
     * Gets keywords.
     *
     * @return string
     */
    public function getKeywords()
    {
        return $this->keywords;
    }

    /**
     * Sets license.
     *
     * @param string $license
     *
     * @return $this
     */
    public function setLicense($license)
    {
        $this->license = $license;

        return $this;
    }

    /**
     * Gets license.
     *
     * @return string
     */
    public function getLicense()
    {
        return $this->license;
    }

    /**
     * Sets rights.
     *
     * @param string $rights
     *
     * @return $this
     */
    public function setRights($rights)
    {
        $this->rights = $rights;

        return $this;
    }

    /**
     * Gets rights.
     *
     * @return string
     */
    public function getRights()
    {
        return $this->rights;
    }

    /**
     * Sets text.
     *
     * @param string $text
     *
     * @return $this
     */
    public function setText($text = null)
    {
        $this->text = $text;

        return $this;
    }

    /**
     * Gets text.
     *
     * @return string
     */
    public function getText()
    {
        return $this->text;
    }

    /**
     * Sets name.
     *
     * @param string $name
     *
     * @return $this
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Gets name.
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Sets language.
     *
     * @param string $language
     *
     * @return $this
     */
    public function setLanguage($language)
    {
        $this->language = $language;

        return $this;
    }

    /**
     * Gets language.
     *
     * @return string
     */
    public function getLanguage()
    {
        return $this->language;
    }

    /**
     * Sets sourceType.
     *
     * @param string $sourceType
     *
     * @return $this
     */
    public function setSourceType($sourceType)
    {
        $this->sourceType = $sourceType;

        return $this;
    }

    /**
     * Gets sourceType.
     *
     * @return string
     */
    public function getSourceType()
    {
        return $this->sourceType;
    }

    /**
     * Sets uid.
     *
     * @param string $uid
     *
     * @return $this
     */
    public function setUid($uid)
    {
        $this->uid = $uid;

        return $this;
    }

    /**
     * Gets uid.
     *
     * @return string
     */
    public function getUid()
    {
        return $this->uid;
    }

    /**
     * Sets doi.
     *
     * @param string $doi
     *
     * @return $this
     */
    public function setDoi($doi)
    {
        $this->doi = $doi;

        return $this;
    }

    /**
     * Gets doi.
     *
     * @return string
     */
    public function getDoi()
    {
        return $this->doi;
    }

    /**
     * Sets url.
     *
     * @param string $url
     *
     * @return $this
     */
    public function setUrl($url)
    {
        $this->url = $url;

        return $this;
    }

    /**
     * Gets url.
     *
     * @return string
     */
    public function getUrl()
    {
        return $this->url;
    }

    /**
     * Sets slug.
     *
     * @param string $slug
     *
     * @return $this
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * Gets slug.
     *
     * @return string
     */
    public function getSlug($fallback = false)
    {
        if (empty($this->slug) && $fallback) {
            return $this->getUid();
        }

        return $this->slug;
    }

    public function addPersonReference(ArticleEntity $entityReference)
    {
        $entityId = $entityReference->getEntity()->getId();

        if (!$this->personReferences->exists(
            function ($key, $element) use ($entityId) {
                return $element->getEntity()->getId() == $entityId;
            }))
        {
            $this->personReferences->add($entityReference);
            $entityReference->setArticle($this);
        }

        return $this;
    }

    public function getPersonReferences()
    {
        return $this->personReferences;
    }

    public function addOrganizationReference(ArticleEntity $entityReference)
    {
        $entityId = $entityReference->getEntity()->getId();

        if (!$this->organizationReferences->exists(
            function ($key, $element) use ($entityId) {
                return $element->getEntity()->getId() == $entityId;
            }))
        {
            $this->organizationReferences->add($entityReference);
            $entityReference->setArticle($this);
        }

        return $this;
    }

    public function getOrganizationReferences()
    {
        return $this->organizationReferences;
    }

    public function addPlaceReference(ArticleEntity $entityReference)
    {
        $entityId = $entityReference->getEntity()->getId();

        if (!$this->placeReferences->exists(
            function ($key, $element) use ($entityId) {
                return $element->getEntity()->getId() == $entityId;
            }))
        {
            $this->placeReferences->add($entityReference);
            $entityReference->setArticle($this);
        }

        return $this;
    }

    public function getPlaceReferences()
    {
        return $this->placeReferences;
    }

    public function addLandmarkReference(ArticleEntity $entityReference)
    {
        $entityId = $entityReference->getEntity()->getId();

        if (!$this->landmarkReferences->exists(
            function ($key, $element) use ($entityId) {
                return $element->getEntity()->getId() == $entityId;
            }))
        {
            $this->landmarkReferences->add($entityReference);
            $entityReference->setArticle($this);
        }

        return $this;
    }

    public function getLandmarkReferences()
    {
        return $this->landmarkReferences;
    }

    public function addEventReference(ArticleEntity $entityReference)
    {
        $entityId = $entityReference->getEntity()->getId();

        if (!$this->eventReferences->exists(
            function ($key, $element) use ($entityId) {
                return $element->getEntity()->getId() == $entityId;
            }))
        {
            $this->eventReferences->add($entityReference);
            $entityReference->setArticle($this);
        }

        return $this;
    }

    public function getEventReferences()
    {
        return $this->eventReferences;
    }

    public function addBibitemReference(ArticleEntity $entityReference)
    {
        $entityId = $entityReference->getEntity()->getId();

        if (!$this->bibitemReferences->exists(
            function ($key, $element) use ($entityId) {
                return $element->getEntity()->getId() == $entityId;
            }))
        {
            $this->bibitemReferences->add($entityReference);
            $entityReference->setArticle($this);
        }

        return $this;
    }

    public function getBibitemReferences()
    {
        return $this->bibitemReferences;
    }

    public function getVersion()
    {
        return '1.0'; // TODO: add versioning support for updated articles
    }

    protected function buildDoiVersionAppendix()
    {
        // format is v1, v1-1, v1-2, v2, v2-1 and so on
        return 'v' . rtrim(str_replace('.', '-', $this->getVersion()), '-0');
    }

    /*
     * 10.5072 is the test prefix
     */
    public function buildDoi($prefix = '10.5072')
    {
        $locale = \TeiEditionBundle\Utils\Iso639::code3To1($this->getLanguage());

        return $prefix . '/' . $this->getUid()
            . '.' . $locale . '.' . $this->buildDoiVersionAppendix();
    }

    public function jsonSerialize()
    {
        return [
            'id' => $this->id,
            'uid' => $this->uid,
            'slug' => $this->slug,
            'status' => $this->status,
            'name' => $this->name,
            'creator' => $this->creator,
            'author' => $this->author,
            'translator' => $this->translator,
            'contentLocation' => $this->contentLocation,
            'geo' => $this->geo,
            'provider' => $this->provider,
            'providerIdno' => $this->providerIdno,
            'dateCreated' => $this->dateCreated,
            'dateCreatedDisplay' => $this->dateCreatedDisplay,
            'sourceType' => $this->sourceType,
            'genre' => isset($this->genre) ? $this->genre : null,
            'keywords' => $this->keywords,
            'language' => $this->language,
            'translatedFrom' => $this->translatedFrom,
            'description' => $this->description,
            'text' => $this->text,
        ];
    }

    public function jsonLdSerialize($locale, $omitContext = false)
    {
        $ret = [
            '@context' => 'http://schema.org',
            '@type' => 'CreativeWork', // we don't use Article for now since this requires image
            'name' => $this->name,
            'headline' => $this->name,
        ];

        if ($omitContext) {
            unset($ret['@context']);
        }

        if (!is_null($this->datePublished)) {
            $ret['datePublished'] = \TeiEditionBundle\Utils\JsonLd::formatDate8601($this->datePublished);

            if (!is_null($this->dateModified)) {
                $dateModified = \TeiEditionBundle\Utils\JsonLd::formatDate8601($this->dateModified);

                if ($dateModified != $ret['datePublished']) {
                    $ret['dateModified'] = $dateModified;
                }
            }
        }

        if (!is_null($this->author)) {
            $authors = [];
            foreach ($this->author as $author) {
                $authors[] = $author->jsonLdSerialize($locale, true);
            }

            if (count($authors) > 0) {
                $ret['author'] = (1 == count($authors)) ? $authors[0] : $authors;
            }
        }

        if (!is_null($this->translator)) {
            $ret['translator'] = $this->translator->jsonLdSerialize($locale, true);
        }

        if (!empty($this->license)) {
            switch ($this->license) {
                case '#public-domain':
                    $ret['license'] = 'https://creativecommons.org/publicdomain/mark/1.0/deed.' . $locale;
                    break;

                default:
                    $ret['license'] = $this->license;
            }
        }

        return $ret;
    }

    public function ogSerialize($locale, $baseUrl)
    {
        static $sectionMap = [
            'background' => 'Topics',
            'interpretation' => 'Interpretations',
            'source' => 'Sources',
        ];

        $ret = [
            'og:type' => 'article',
            'og:title' => $this->name,
            'article:section' => $sectionMap[$this->articleSection],
        ];

        $description = null;
        switch ($this->articleSection) {
            case 'background':
            case 'interpretation':
                $description = $this->description;
                if (!empty($description)) {
                    // remove all caps heading at beginning
                    $description = preg_replace('/^\p{Lu}[\p{Lu}\x{00df}\-\']+\s+/', '', $description);
                }
                break;

            case 'source':
                if (!is_null($this->isPartOf)) {
                    $description = $this->isPartOf->getDescription();
                }
                break;
        }

        if (!empty($description)) {
            $ret['og:description'] = str_replace("\n", ' ', self::truncate($description, 190, true));
        }

        return $ret;
    }

    // RoutedItemInterface for Feed Generation
    public function getFeedItemTitle()
    {
        return $this->getAuthorDisplay() . ', ' . $this->getName();
    }

    public function getFeedItemDescription()
    {
        return $this->description;
    }

    public function getFeedItemPubDate()
    {
        return $this->datePublished;
    }

    public function getFeedItemRouteName()
    {
        if ('source' == $this->getGenre()) {
            return 'source';
        }

        if ('background' == $this->articleSection) {
            return 'topic-background';
        }

        return 'article';
    }

    public function getFeedItemRouteParameters()
    {
        if ('source' == $this->getGenre()) {
            return [ 'slug' => $this->getUid() ];
        }

        return [ 'slug' => $this->getSlug(true) ];
    }

    public function getFeedItemUrlAnchor()
    {
        return '';
    }

    // solr-stuff
    /**
     * Solr-core depends on article-language
     *
     * @return string
     */
    public function indexHandler()
    {
        if (!empty($this->language) && 'eng' == $this->language) {
            return 'jgo_presentation-en';
        }

        return 'jgo_presentation-de';
    }

    /**
     * @return boolean
     */
    public function shouldBeIndexed()
    {
        return $this->status == 1; // explicit publishing needed
    }
}

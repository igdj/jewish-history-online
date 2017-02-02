<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo; // alias for Gedmo extensions annotations

use FS\SolrBundle\Doctrine\Annotation as Solr;
use Symfony\Component\Validator\Constraints as Assert;

/**
 *
 *
 * See also [blog post](http://blog.schema.org/2014/09/schemaorg-support-for-bibliographic_2.html).
 *
 * @see http://schema.org/CreativeWork and derived documents Documentation on Schema.org
 *
 * @Solr\Document(indexHandler="indexHandler")
 * @Solr\SynchronizationFilter(callback="shouldBeIndexed")
 *
 * @ORM\Entity
 * @ORM\Table(name="bibitem")
 * @ORM\HasLifecycleCallbacks()
 *
 */
class Bibitem
implements \JsonSerializable, JsonLdSerializable, OgSerializable
{
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
     * @var string The type of the Bibliographic Item (as in Zotero)
     * @ORM\Column(type="string", nullable=true)
     *
     */
    protected $itemType;

    /**
     * @var array The author/contributor/editor of this CreativeWork.
     * @ORM\Column(type="json_array", nullable=true)
     *
     */
    protected $creators;

    /**
     * @var string The series of books the book was published in
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $series;

    /**
     * @var string The number within the series of books the book was published in
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $seriesNumber;

    /**
     * @var string The volume of a journal or multi-volume book
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $volume;

    /**
     * @var string The number of volumes of a multi-volume book
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $numberOfVolumes;

    /**
     * @var string The issue of a journal, magazine, or tech-report, if applicable
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $issue;

    /**
     * @var string The edition of a book
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $bookEdition;

    /**
     * @var string The place(s) of publication
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $publicationLocation; /* map to contentLocation in Schema.org */

    /**
     * @var string The publisher's name
     * @ORM\Column(type="string", nullable=true)
     */
    protected $publisher;

    /**
     * @var string Date of first broadcast/publication.
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $datePublished;

    /**
     * @var string The Page numbers, separated either by commas or as range by hyphen
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $pagination;

    /**
     * @var string The number of pages of the book
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $numberOfPages;

    /**
     * @var string The doi of the article
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $doi;

    /**
     * @var string The isbn of the book
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $isbn;

    /**
     * @var string The issn of of the Journal
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $issn;

    /**
    * @ORM\Column(type="json_array", nullable=true)
    */
    protected $additional;

    /**
     * @var Bibitem Indicates a Bibitem that this Bibitem is (in some sense) part of.
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Bibitem")
     */
    protected $isPartOf;

    /**
     * @var string The name (title) of the item.
     *
     * @Assert\Type(type="string")
     * @Assert\NotNull
     * @ORM\Column(length=512)
     * @Solr\Field(type="string")
     */
    protected $name;

    /**
     * @var string The title of the book or journal for bookSection / journalArticle.
     *
     * @ORM\Column(length=512,nullable=true)
     */
    protected $containerName;

    /**
     * @var string
     *
     * @Assert\Type(type="string")
     * @Assert\NotNull
     * @ORM\Column
     */
    protected $language;

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
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     * @Solr\Field(type="string")
     */
    protected $uid;

    /**
     * @var string A short description of the item. Generated for solr
     *
     * @ORM\Column(type="json_array", nullable=true)
     *
     * @Solr\Field(type="strings")
     *
     */
    protected $description;

    use ArticleReferencesTrait;

    /**
     * @ORM\OneToMany(targetEntity="ArticleBibitem", mappedBy="bibitem", cascade={"persist", "remove"}, orphanRemoval=TRUE)
     */
    protected $articleReferences;

    /**
     * @var \DateTime
     *
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    protected $createdAt;

    /**
     * @var \DateTime
     *
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="changed_at", type="datetime")
     */
    protected $changedAt;

    public static function slugifyCorresp($slugify, $corresp)
    {
        if (preg_match('/(.*)\_(\d+[^_*])/', $corresp, $matches)) {
            // keep underscores before date
            return $slugify->slugify($matches[1])
                 . '_'
                 . $slugify->slugify($matches[2]);
        }
        return $slugify->slugify($corresp, '-');
    }

    public function __construct()
    {
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
     * Sets creators.
     *
     * @param array $creators
     *
     * @return $this
     */
    public function setCreators($creators = null)
    {
        $this->creators = $creators;

        return $this;
    }

    /**
     * Gets creators.
     *
     * @return string
     */
    public function getCreators()
    {
        return $this->creators;
    }

    /**
     * Sets series.
     *
     * @param string $series
     *
     * @return $this
     */
    public function setSeries($series = null)
    {
        $this->series = $series;

        return $this;
    }

    /**
     * Gets series.
     *
     * @return string
     */
    public function getSeries()
    {
        return $this->series;
    }

    /**
     * Sets series number.
     *
     * @param string $seriesNumber
     *
     * @return $this
     */
    public function setSeriesNumber($seriesNumber = null)
    {
        $this->seriesNumber = $seriesNumber;

        return $this;
    }

    /**
     * Gets series number.
     *
     * @return string
     */
    public function getSeriesNumber()
    {
        return $this->seriesNumber;
    }

    /**
     * Sets volume.
     *
     * @param string $volume
     *
     * @return $this
     */
    public function setVolume($volume = null)
    {
        $this->volume = $volume;

        return $this;
    }

    /**
     * Gets volume.
     *
     * @return string
     */
    public function getVolume()
    {
        return $this->volume;
    }

    /**
     * Sets number of volumes.
     *
     * @param string $numberOfVolumes
     *
     * @return $this
     */
    public function setNumberOfVolumes($numberOfVolumes = null)
    {
        $this->numberOfVolumes = $numberOfVolumes;

        return $this;
    }

    /**
     * Gets number of volumes.
     *
     * @return string
     */
    public function getNumberOfVolumes()
    {
        return $this->numberOfVolumes;
    }

    /**
     * Sets issue.
     *
     * @param string $issue
     *
     * @return $this
     */
    public function setIssue($issue = null)
    {
        $this->issue = $issue;

        return $this;
    }

    /**
     * Gets issue.
     *
     * @return string
     */
    public function getIssue()
    {
        return $this->issue;
    }

    /**
     * Sets edition of the book.
     *
     * @param string $bookEdition
     *
     * @return $this
     */
    public function setBookEdition($bookEdition = null)
    {
        $this->bookEdition = $bookEdition;

        return $this;
    }

    /**
     * Gets book edition.
     *
     * @return string
     */
    public function getBookEdition()
    {
        return $this->bookEdition;
    }

    /**
     * Sets publication location.
     *
     * @param string $publicationLocation
     *
     * @return $this
     */
    public function setPublicationLocation($publicationLocation = null)
    {
        $this->publicationLocation = $publicationLocation;

        return $this;
    }

    /**
     * Gets publication location.
     *
     * @return string
     */
    public function getPublicationLocation()
    {
        return $this->publicationLocation;
    }

    /**
     * Sets publisher.
     *
     * @param string $publisher
     *
     * @return $this
     */
    public function setPublisher($publisher = null)
    {
        $this->publisher = $publisher;

        return $this;
    }

    /**
     * Gets publisher.
     *
     * @return string
     */
    public function getPublisher()
    {
        return $this->publisher;
    }

    /**
     * Sets datePublished.
     *
     * @param string $datePublished
     *
     * @return $this
     */
    public function setDatePublished($datePublished = null)
    {
        $this->datePublished = $datePublished;

        return $this;
    }

    /**
     * Gets datePublished.
     *
     * @return string
     */
    public function getDatePublished()
    {
        return $this->datePublished;
    }

    /**
     * Sets pagination.
     *
     * @param string $pagination
     *
     * @return $this
     */
    public function setPagination($pagionation = null)
    {
        $this->pagination = $pagionation;

        return $this;
    }

    /**
     * Gets pagination.
     *
     * @return string
     */
    public function getPagination()
    {
        return $this->pagination;
    }

    /**
     * Sets number of pages.
     *
     * @param string $numberOfPages
     *
     * @return $this
     */
    public function setNumberOfPages($numberOfPages = null)
    {
        $this->numberOfPages = $numberOfPages;

        return $this;
    }

    /**
     * Gets number of pages.
     *
     * @return string
     */
    public function getNumberOfPages()
    {
        return $this->numberOfPages;
    }

    /**
     * Sets the DOI of the publication.
     *
     * @param string $doi
     *
     * @return $this
     */
    public function setDoi($doi = null)
    {
        $this->doi = $doi;

        return $this;
    }

    /**
     * Gets the DOI of the publication.
     *
     * @return string
     */
    public function getDoi()
    {
        return $this->doi;
    }

    /**
     * Sets the ISBN of the book.
     *
     * @param string $isbn
     *
     * @return $this
     */
    public function setIsbn($isbn = null)
    {
        $this->isbn = $isbn;

        return $this;
    }

    /**
     * Gets ISBN of the book.
     *
     * @return string
     */
    public function getIsbn()
    {
        return $this->isbn;
    }

    /**
     * Gets a list of normalized ISBNs of the book.
     *
     * @return array
     */
    public function getIsbnListNormalized($hyphens = true)
    {
        $normalized = [];
        if (empty($this->isbn)) {
            return $normalized;
        }

        $isbnUtil = new \Isbn\Isbn();

        $candidates = preg_split('/\s+/', $this->isbn);
        foreach ($candidates as $candidate) {
            if (preg_match('/([0-9xX\-]+)/', $candidate, $matches)) {
                $type = $isbnUtil->check->identify($matches[1]);
                if (false !== $type) {
                    $isbn13 = 13 == $type
                        ? $matches[1]
                        : $isbnUtil->translate->to13($matches[1]);
                    if (true === $hyphens) {
                        $isbn13 = $isbnUtil->hyphens->fixHyphens($isbn13);
                    }
                    else if (false === $hyphens) {
                        $isbn13 = $isbnUtil->hyphens->removeHyphens($isbn13);
                    }
                    if (!in_array($isbn13, $normalized)) {
                        $normalized[] = $isbn13;
                    }
                }
            }
        }

        return $normalized;
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
     * @ORM\PreUpdate
     *
     * Populate description for other properties.
     *
     * @param string $description
     *
     * @return $this
     */
    public function populateDescription()
    {
        $raw = $this->jsonSerialize();

        // so we can renderCitation in search-index
        // JSON_UNESCAPED_UNICODE is important for Umlaute to be found
        $this->description = [ 'raw' => json_encode($raw,  JSON_UNESCAPED_UNICODE) ];

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
     * Sets itemType.
     *
     * @param string $itemType
     *
     * @return $this
     */
    public function setItemType($itemType)
    {
        $this->itemType = $itemType;

        return $this;
    }

    /**
     * Gets itemType.
     *
     * @return string
     */
    public function itemType()
    {
        return $this->itemType;
    }

    /**
     * Sets isPartOf.
     *
     * @param Bibitem $isPartOf
     *
     * @return $this
     */
    public function setIsPartOf(Bibitem $isPartOf = null)
    {
        $this->isPartOf = $isPartOf;

        return $this;
    }

    /**
     * Gets isPartOf.
     *
     * @return Bibitem
     */
    public function getIsPartOf()
    {
        return $this->isPartOf;
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
     * Sets container name.
     *
     * @param string $containerName
     *
     * @return $this
     */
    public function setContainerName($containerName)
    {
        $this->containerName = $containerName;

        return $this;
    }

    /**
     * Gets container name.
     *
     * @return string
     */
    public function getContainerName()
    {
        return $this->containerName;
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
     * Sets additional.
     *
     * @param array $additional
     *
     * @return $this
     */
    public function setAdditional($additional)
    {
        $this->additional = $additional;

        return $this;
    }

    /**
     * Gets additional.
     *
     * @return array
     */
    public function getAdditional()
    {
        return $this->additional;
    }

    /**
     * Gets coverUrl.
     *
     * @return string
     */
    public function getCoverUrl()
    {
        if (empty($this->additional)) {
            return;
        }
        // currently only googleapi
        if (array_key_exists('googleapis-books', $this->additional)) {
            $item = $this->additional['googleapis-books'];
            if (array_key_exists('imageLinks', $item['volumeInfo'])) {
                foreach ([ 'thumbnail', 'smallThumbnail' ] as $key) {
                    if (array_key_exists($key, $item['volumeInfo']['imageLinks'])) {
                        return $item['volumeInfo']['imageLinks'][$key];
                    }
                }
            }
        }
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

    public function renderCitationAsHtml($citeProc, $purgeSeparator = false)
    {
        $ret = $citeProc->render(json_decode(json_encode($this->jsonSerialize())));
        if ($purgeSeparator) {
            if (preg_match('/, <span class="citeproc\-in">/', $ret, $matches)) {
                $ret = preg_replace('/, (<span class="citeproc\-in">)/', '\1', $ret);
            }
            else if (preg_match('/, <span class="citeproc\-volumes">/', $ret, $matches)) {
                $ret = preg_replace('/, (<span class="citeproc\-volumes">)/', '\1', $ret);
            }
            else if (preg_match('/, <span class="citeproc\-place">/', $ret, $matches)) {
                $ret = preg_replace('/, (<span class="citeproc\-place">)/', '\1', $ret);
            }
            $ret = preg_replace_callback('/(<span class="citeproc\-URL">&lt;)(.*?)(&gt;)/',
                function ($matches) {
                    return $matches[1]
                    . sprintf('<a href="%s" target="_blank">%s</a>',
                              $matches[2], $matches[2])
                    . $matches[3];
                },
                $ret);
        }
        return $ret;
    }

    private static function mb_ucfirst($string, $encoding = 'UTF-8')
    {
        $strlen = mb_strlen($string, $encoding);
        $firstChar = mb_substr($string, 0, 1, $encoding);
        $then = mb_substr($string, 1, $strlen - 1, $encoding);
        return mb_strtoupper($firstChar, $encoding) . $then;
    }

    private static function adjustTitle($title)
    {
        if (!is_null($title) && preg_match('/\s*\:\s+/', $title)) {
            // we don't separate subtitle by ': ' but by '. ';
            $titleParts = preg_split('/\s*\:\s+/', $title, 2);
            $title = implode('. ', [ $titleParts[0], self::mb_ucfirst($titleParts[1]) ]);
        }
        return $title;
    }

    /*
     * We transfer to Citeproc JSON
     * see https://github.com/citation-style-language/schema/blob/master/csl-data.json
     */
    public function jsonSerialize()
    {
        // see http://aurimasv.github.io/z2csl/typeMap.xml
        static $typeMap = [
            'audioRecording' => 'song',
            'blogPost' => 'post-weblog',
            'bookSection' => 'chapter',
            'document' => 'manuscript',
            'encyclopediaArticle' => 'entry-encyclopedia',
            'interview' => 'interview',
            'journalArticle' => 'article-journal',
            'letter' => 'personal_communication',
            'newspaperArticle' => 'article-newspaper',
            'presentation' => 'speech',
            'report' => 'report',
            'webpage' => 'webpage',
        ];

        $data = [
            'id' => $this->id,
            // 'uid' => $this->uid,
            'citation-label' => $this->slug,
            // 'status' => $this->status,
            'type' => array_key_exists($this->itemType, $typeMap)
                ? $typeMap[$this->itemType] : $this->itemType,
            'title' => self::adjustTitle($this->name),
            'container-title' => self::adjustTitle($this->containerName),
            'collection-title' => $this->series,
            'collection-number' => $this->seriesNumber,
            'volume' => $this->volume,
            'number-of-volumes' => $this->numberOfVolumes,
            'edition' => !is_null($this->bookEdition) && $this->bookEdition != 1
                ? $this->bookEdition : null,
            'publisher-place' => $this->publicationLocation,
            'publisher' => $this->publisher,
            'issued' => [
                "date-parts" => [ [ $this->datePublished ] ],
                "literal" => $this->datePublished,
            ],
            'page' => $this->pagination,
            'number-of-pages' => $this->numberOfPages,
            'DOI' => $this->doi,
            'ISBN' => $this->isbn,
            'ISSN' => $this->issn,
            'URL' => $this->url,
            'language' => $this->language,
        ];

        if (!empty($this->creators)) {
            foreach ($this->creators as $creator) {
                // var_dump($creator);
                $key = $creator['creatorType'];
                if (!array_key_exists($key, $data)) {
                    $data[$key] = [];
                }
                $targetEntry = [];
                if (array_key_exists('name', $creator)) {
                    $targetEntry['family'] = $creator['name'];
                }
                else {
                    foreach ([ 'firstName' => 'given', 'lastName' => 'family']
                             as $src => $dst)
                    {
                        if (array_key_exists($src, $creator)) {
                            $targetEntry[$dst] = $creator[$src];
                        }
                    }
                }


                $data[$key][] = $targetEntry;
            }
        }
        // var_dump($data);

        return $data;
    }

    public function jsonLdSerialize($locale, $omitContext = false)
    {
        // TODO:
        // for full property,
        // see https://www.worldcat.org/title/bauvertragsrecht-kommentar-zu-den-grundzugen-des-gesetzlichen-bauvertragsrechts-631-651-bgb-unter-besonderer-berucksichtigung-der-rechtsprechung-des-bundesgerichtshofs/oclc/920898066#microdatabox
        // and http://experiment.worldcat.org/entity/work/data/1348531819
        $type = 'CreativeWork';

        switch ($this->itemType) {
            case 'book':
                $type = 'Book';
                break;

            case 'journalArticle':
                $type = 'ScholarlyArticle';
                break;

            case 'bookSection':
            case 'encyclopediaArticle':
                $type = 'Chapter'; // see https://bib.schema.org/Chapter
                break;

            case 'newspaperArticle':
                $type = 'NewsArticle';
                break;

            case 'audioRecording':
                $type = 'AudioObject';
                break;

            case 'webpage':
                $type = 'WebPage';
                break;

            case 'letter':
            case 'document':
            case 'report':
            case 'interview':
            case 'presentation':
                $type = 'CreativeWork';
                break;

            // just for building isPartOf
            case 'issue':
                $type = 'PublicationIssue';
                break;
            case 'journal':
                $type = 'Periodical';
                break;
        }

        $ret = [
            '@context' => 'http://schema.org',
            '@type' => $type,
        ];
        if ($type == 'PublicationIssue') {
            // issues on't have a name, but might have an issue-number
            if (!empty($this->volume)) {
                $ret['issueNumber'] = $this->volume;
            }
            $parent = clone $this;
            $parent->setItemType('journal');
            $ret['isPartOf'] = $parent->jsonLdSerialize($parent);
        }
        else {
            $ret['name'] = $this->name;
        }
        if ($omitContext) {
            unset($ret['@context']);
        }

        if (!empty($this->creators)) {
            $target = [];
            foreach ($this->creators as $creator) {
                if (array_key_exists('creatorType', $creator) && in_array($creator['creatorType'], [ 'author', 'editor', 'translator' ])) {
                    if ('author' == $creator['creatorType']
                        && in_array($type, [ 'PublicationIssue', 'Periodical' ]))
                    {
                        continue;
                    }
                    else if ('editor' == $creator['creatorType'] && in_array($type, [ 'Chapter' ])) {
                        continue;
                    }
                    if (!empty($creator['firstName'])) {
                        // we have a person
                        $person = new Person();
                        if (!empty($creator['firstName'])) {
                            $person->setGivenName($creator['firstName']);
                        }
                        if (!empty($creator['lastName'])) {
                            $person->setFamilyName($creator['lastName']);
                        }
                        if (!array_key_exists($creator['creatorType'], $target)) {
                            $target[$creator['creatorType']] = [];
                        }
                        $target[$creator['creatorType']][] = $person->jsonLdSerialize($locale, true);
                    }
                }
            }
            foreach ($target as $key => $values) {
                $numValues = count($values);
                if (1 == $numValues) {
                    $ret[$key] = $values[0];
                }
                else if ($numValues > 1) {
                    $ret[$key] = $values;
                }
            }
        }

        if (in_array($type, [ 'Book', 'ScholarlyArticle', 'WebPage' ])) {
            foreach ([ 'url' ] as $property) {
                if (!empty($this->$property)) {
                    $ret[$property] = $this->$property;
                }
            }
            if (!empty($this->doi)) {
                $ret['sameAs'] = 'http://dx.doi.org/' . $this->doi;
            }
        }

        if (in_array($type, [ 'Book' ])) {
            $isbns = $this->getIsbnListNormalized(false);
            $numIsbns = count($isbns);
            if (1 == $numIsbns) {
                $ret['isbn'] = $isbns[0];
            }
            else if ($numIsbns > 1) {
                $ret['isbn'] = $isbns;
            }
            if (!empty($this->numberOfPages) && preg_match('/^\d+$/', $this->numberOfPages)) {
                $ret['numberOfPages'] = (int)$this->numberOfPages;
            }
        }
        else if (in_array($type, [ 'ScholarlyArticle', 'Chapter' ])) {
            foreach ([ 'pagination' ] as $property) {
                if (!empty($this->$property)) {
                    $ret[$property] = $this->$property;
                }
            }
            if (!empty($this->containerName)) {
                $parentItemType = null;
                switch ($type) {
                    case 'ScholarlyArticle':
                        $parentItemType = 'issue';
                        break;
                    case 'Chapter':
                        $parentItemType = 'book';
                        break;
                }
                if (!is_null($parentItemType)) {
                    $parent = clone $this;
                    $parent->setItemType($parentItemType);
                    $parent->setName($this->containerName);
                    if ('Chapter' == $type && !empty($this->creators)) {
                        $creatorsParent = [];
                        foreach ($this->creators as $creator) {
                            if (!in_array($creator['creatorType'], [ 'author', 'translator'])) {
                                $creatorsParent[] = $creator;
                            }
                        }
                        $parent->setCreators($creatorsParent);
                    }
                    $ret['isPartOf'] = $parent->jsonLdSerialize($locale, true);
                }
            }
        }

        if (in_array($type, [ 'Periodical', 'Book' ])) {
            foreach ([ 'issn' ] as $property) {
                if (!empty($this->$property)) {
                    $ret[$property] = $this->$property;
                }
            }
            if (!empty($this->publisher)) {
                $publisher = new Organization();
                $publisher->setName($this->publisher);
                $ret['publisher'] = $publisher->jsonLdSerialize($locale, true);
                if (!empty($this->publicationLocation)) {
                    $location = new Place();
                    $location->setName($this->publicationLocation);
                    $ret['publisher']['location'] = $location->jsonLdSerialize($locale, true);
                }
            }

        }

        if (!is_null($this->datePublished)
            && !in_array($type, [ 'ScholarlyArticle', 'Chapter', 'Periodical' ]))
        {
            $ret['datePublished'] = \AppBundle\Utils\JsonLd::formatDate8601($this->datePublished);
        }

        /*
        if (!is_null($this->dateModified)) {
            $dateModified = \AppBundle\Utils\JsonLd::formatDate8601($this->dateModified);
            $ret['dateModified'] = $dateModified;
        }
        */

        return $ret;
    }

    public function ogSerialize($locale, $baseUrl)
    {
        $type = null;
        switch ($this->itemType) {
            case 'book':
                $isbns = $this->getIsbnListNormalized(false);
                $type = 'books.book';
                break;
        }
        if (is_null($type)) {
            return;
        }

        $ret = [
			'og:type' => $type,
            'og:title' => $this->name,
        ];

        $isbns = $this->getIsbnListNormalized(false);
        if (empty($isbns)) {
            // 'books:isbn' is required
            return;
        }
        $ret['books:isbn'] = $isbns[0];

        return $ret;
    }

    // solr-stuff
    public function indexHandler()
    {
        return '*';
    }

    /**
     * TODO: move to a trait
     *
     * @return boolean
    */
    public function shouldBeIndexed()
    {
        return $this->status >= 0;
    }

}

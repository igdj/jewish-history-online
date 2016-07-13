<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * An article, such as a news article or piece of investigative report. Newspapers and magazines have articles of many different types and this is intended to cover them all.
 *
 * See also [blog post](http://blog.schema.org/2014/09/schemaorg-support-for-bibliographic_2.html).
 *
 * @see http://schema.org/Article Documentation on Schema.org
 *
 * @ORM\Entity
 * @ORM\Table(name="article")
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name="genre", type="string")
 * @ORM\DiscriminatorMap({"interpretation" = "Article", "source" = "SourceArticle"})
 */
class Article
{
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
     * @var ArrayCollection<Person> The author of this content. Please note that author is special in that HTML 5 provides a special mechanism for indicating authorship via the rel tag. That is equivalent to this and may be used interchangeably.
     *
     * @ORM\ManyToMany(targetEntity="AppBundle\Entity\Person", inversedBy="articles")
     * @ORM\JoinTable(inverseJoinColumns={@ORM\JoinColumn(unique=true)})
     */
    protected $author;
    /**
     * @var Place The location depicted or described in the content.
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Place", inversedBy="articles")
     */
    protected $contentLocation;
    /**
     * @var string The creator/author of this CreativeWork.
     * @ORM\Column(type="string", nullable=true)
     *
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
     * @var Article Indicates a CreativeWork that this CreativeWork is (in some sense) part of.
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Article")
     */
    protected $isPartOf;
    /**
     * @var Organization Holding institution.
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Organization")
     */
    protected $provider;
    /**
     * @var string Holding institution's identification number.
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
     * @ORM\Column(nullable=true)
     */
    protected $rights;
    /**
     * @var string The name of the item.
     *
     * @Assert\Type(type="string")
     * @Assert\NotNull
     * @ORM\Column
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
     */
    protected $sourceType;
    /**
     * @var string
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     */
    protected $uid;
    /**
     * @var string
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     */
    protected $slug;

    public function __construct()
    {
        $this->author = new ArrayCollection();
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
     * Sets dateCreated.
     *
     * @param string $datePublished
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
     * Sets genre.
     *
     * @param string $genre
     *
     * @return $this
     */
    public function setGenre($genre)
    {
        $this->genre = $genre;

        return $this;
    }

    /**
     * Gets genre.
     *
     * @return string
     */
    public function getGenre()
    {
        return $this->genre;
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
    public function getSlug()
    {
        return $this->slug;
    }
}

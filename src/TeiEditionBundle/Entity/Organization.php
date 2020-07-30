<?php

namespace TeiEditionBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo; // alias for Gedmo extensions annotations

use FS\SolrBundle\Doctrine\Annotation as Solr;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * An organization such as a school, NGO, corporation, club, etc.
 *
 * @see http://schema.org/Organization Documentation on Schema.org
 *
 * @Solr\Document(indexHandler="indexHandler")
 * @Solr\SynchronizationFilter(callback="shouldBeIndexed")
 *
 * @ORM\Entity
 * @ORM\Table(name="organization")
 */
class Organization
implements \JsonSerializable, JsonLdSerializable
{
    use AlternateNameTrait, ArticleReferencesTrait;

    static function formatDateIncomplete($dateStr)
    {
        if (preg_match('/^\d{4}$/', $dateStr)) {
            $dateStr .= '-00-00';
        }
        else if (preg_match('/^\d{4}\-\d{2}$/', $dateStr)) {
            $dateStr .= '-00';
        }
        else if (preg_match('/^(\d+)\.(\d+)\.(\d{4})$/', $dateStr, $matches)) {
            $dateStr = join('-', [ $matches[3], $matches[2], $matches[1] ]);
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
     * @var int
     *
     * @ORM\Column(type="integer", nullable=false)
     */
    protected $status = 0;

    /**
     * @var string A short description of the item.
     *
     * @ORM\Column(type="json_array", nullable=true)
     */
    protected $description;

    /**
     * @var string The date that this organization was dissolved.
     *
     * @Assert\Date
     * @ORM\Column(type="string", nullable=true)
     */
    protected $dissolutionDate;

    /**
     * @var string The date that this organization was founded.
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $foundingDate;

    /**
     * @var string The name of the item.
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     * @Solr\Field(type="string")
     */
    protected $name;

    /**
     * @var string URL of the item.
     *
     * @Assert\Url
     * @ORM\Column(nullable=true)
     */
    protected $url;

    /**
     * @var Place The place where the Organization was founded.
     *
     * @ORM\ManyToOne(targetEntity="TeiEditionBundle\Entity\Place")
     * @ORM\JoinColumn(name="foundingLocation_id", referencedColumnName="id")
     */
    protected $foundingLocation;

    /**
     * @var string
     * @ORM\Column(type="string", length=32, nullable=true)
     */
    protected $gnd;

    /**
     * @ORM\OneToMany(targetEntity="Article", mappedBy="provider")
     * @ORM\OrderBy({"dateCreated" = "ASC", "name" = "ASC"})
     */
    protected $providerOf;

    /**
    * @ORM\Column(type="json_array", nullable=true)
    */
    protected $additional;

    /**
     * @var Organization The organization that preceded this on.
     *
     * @ORM\OneToOne(targetEntity="TeiEditionBundle\Entity\Organization", inversedBy="succeedingOrganization")
     * @ORM\JoinColumn(name="precedingId", referencedColumnName="id")
     */
    protected $precedingOrganization;

    /**
     * @var Organization The organization that suceeded this on.
     *
     * @ORM\OneToOne(targetEntity="TeiEditionBundle\Entity\Organization", mappedBy="precedingOrganization")
     */
    protected $succeedingOrganization;

    /**
     * @ORM\OneToMany(targetEntity="ArticleOrganization", mappedBy="organization", cascade={"persist", "remove"}, orphanRemoval=TRUE)
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

    /**
     * @var string
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     */
    protected $slug;

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
     * Sets description.
     *
     * @param string $description
     *
     * @return $this
     */
    public function setDescription($description)
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
     * Gets description in a specific locale.
     *
     * @return string
     */
    public function getDescriptionLocalized($locale)
    {
        if (empty($this->description)) {
            return;
        }

        if (is_array($this->description)) {
            if (array_key_exists($locale, $this->description)) {
                return $this->description[$locale];
            }
        }
        else {
            return $this->description;
        }
    }

    /**
     * Sets dissolutionDate.
     *
     * @param string $dissolutionDate
     *
     * @return $this
     */
    public function setDissolutionDate($dissolutionDate = null)
    {
        $this->dissolutionDate = self::formatDateIncomplete($dissolutionDate);

        return $this;
    }

    /**
     * Gets dissolutionDate.
     *
     * @return string
     */
    public function getDissolutionDate()
    {
        return $this->dissolutionDate;
    }

    /**
     * Sets foundingDate.
     *
     * @param string $foundingDate
     *
     * @return $this
     */
    public function setFoundingDate($foundingDate = null)
    {
        $this->foundingDate = self::formatDateIncomplete($foundingDate);

        return $this;
    }

    /**
     * Gets foundingDate.
     *
     * @return string
     */
    public function getFoundingDate()
    {
        return $this->foundingDate;
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
     * Gets localized name.
     *
     * @return string
     */
    public function getNameLocalized($locale = 'en')
    {
        if (is_array($this->alternateName)
            && array_key_exists($locale, $this->alternateName)) {
            $name = $this->alternateName[$locale];
        }
        else {
            $name = $this->getName();
        }

        return self::stripAt($name);
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
     * Sets foundingLocation.
     *
     * @param Place $foundingLocation
     *
     * @return $this
     */
    public function setFoundingLocation(Place $foundingLocation = null)
    {
        $this->foundingLocation = $foundingLocation;

        return $this;
    }

    /**
     * Gets foundingLocation.
     *
     * @return Place
     */
    public function getFoundingLocation()
    {
        return $this->foundingLocation;
    }

    /**
     * Sets precedingOrganization.
     *
     * @param Organization $precedingOrganization
     *
     * @return $this
     */
    public function setPrecedingOrganization(Organization $precedingOrganization = null)
    {
        $this->precedingOrganization = $precedingOrganization;

        return $this;
    }

    /**
     * Gets precedingOrganization.
     *
     * @return Organization
     */
    public function getPrecedingOrganization()
    {
        return $this->precedingOrganization;
    }

    /**
     * Gets succeedingOrganization.
     *
     * @return Organization
     */
    public function getSucceedingOrganization()
    {
        return $this->succeedingOrganization;
    }

    /* override method of
     *   use ArticleReferencesTrait;
     * since we want to avoid duplicates with getProviderOf
     */
    public function getArticleReferences($lang = null, $skipProviderOf = true)
    {
        if (is_null($this->articleReferences)) {
            return [];
        }

        $langCode3 = is_null($lang) ? null : \TeiEditionBundle\Utils\Iso639::code1to3($lang);

        return $this->sortArticleReferences($this->articleReferences->filter(
            function ($entity) use ($langCode3, $skipProviderOf) {
                $ret = 1 == $entity->getArticle()->getStatus()
                     && (is_null($langCode3) || $entity->getArticle()->getLanguage() == $langCode3);

                if ($ret && $skipProviderOf && !is_null($this->providerOf)) {
                    // only return if not in providerOf
                    $ret = !$this->providerOf->contains($entity->getArticle());
                }

                return $ret;
            }
        )->toArray());
    }

    /**
     * Sets gnd.
     *
     * @param string $gnd
     *
     * @return $this
     */
    public function setGnd($gnd)
    {
        $this->gnd = $gnd;

        return $this;
    }

    /**
     * Gets gnd.
     *
     * @return string
     */
    public function getGnd()
    {
        return $this->gnd;
    }

    /**
     * Gets providerOf.
     *
     */
    public function getProviderOf($lang = null)
    {
        if (is_null($this->providerOf)) {
            return $this->providerOf;
        }

        $langCode3 = is_null($lang)
            ? null
            : \TeiEditionBundle\Utils\Iso639::code1to3($lang);

        return $this->providerOf->filter(
            function($entity) use ($langCode3) {
               return 1 == $entity->getStatus()
                && (is_null($langCode3) || $entity->getLanguage() == $langCode3);
            }
        );
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

    public function jsonSerialize()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'gnd' => $this->gnd,
            'url' => $this->url,
        ];
    }

    public function jsonLdSerialize($locale, $omitContext = false)
    {
        $ret = [
            '@context' => 'http://schema.org',
            '@type' => 'Organization',
            'name' => $this->getNameLocalized($locale),
        ];

        if ($omitContext) {
            unset($ret['@context']);
        }

        foreach ([ 'founding', 'dissolution'] as $lifespan) {
            $property = $lifespan . 'Date';

            if (!empty($this->$property)) {
                $ret[$property] = \TeiEditionBundle\Utils\JsonLd::formatDate8601($this->$property);
            }

            if ('founding' == $lifespan) {
                $property = $lifespan . 'Location';
                if (!is_null($this->$property)) {
                    $ret[$property] = $this->$property->jsonLdSerialize($locale, true);
                }
            }
        }

        $description = $this->getDescriptionLocalized($locale);
        if (!empty($description)) {
            $ret['description'] = $description;
        }

        foreach ([ 'url' ] as $property) {
            if (!empty($this->$property)) {
                $ret[$property] = $this->$property;
            }
        }

        if (!empty($this->gnd)) {
            $ret['sameAs'] = 'http://d-nb.info/gnd/' . $this->gnd;
        }

        return $ret;
    }


    // solr-stuff
    public function indexHandler()
    {
        return '*';
    }

    /**
     * Index everything that isn't deleted (no explicit publishing needed)
     *
     * @return boolean
     */
    public function shouldBeIndexed()
    {
        return $this->status >= 0;
    }
}

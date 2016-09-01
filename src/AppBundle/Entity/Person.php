<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo; // alias for Gedmo extensions annotations

use FS\SolrBundle\Doctrine\Annotation as Solr;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * A person (alive, dead, undead, or fictional).
 *
 * @see http://schema.org/Person Documentation on Schema.org
 *
 * @Solr\Document(indexHandler="indexHandler")
 * @Solr\SynchronizationFilter(callback="shouldBeIndexed")
 *
 * @ORM\Entity
 * @ORM\Table(name="person")
 */
class Person implements \JsonSerializable
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
     * @var string An additional name for a Person, can be used for a middle name.
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     */
    protected $additionalName;
    /**
     * @var string An award won by or for this item.
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     */
    protected $award;
    /**
     * @var string Date of birth.
     *
     * @ORM\Column(type="string", nullable=true)
     */
    protected $birthDate;
    /**
     * @var string Date of death.
     *
     * @Assert\Date
     * @ORM\Column(type="string", nullable=true)
     */
    protected $deathDate;
    /**
     * @var string A short description of the item.
     *
     * @ORM\Column(type="json_array", nullable=true)
     *
     * @Solr\Field(type="strings")
     *
     */
    protected $description;
    /**
     * @var string Family name. In the U.S., the last name of an Person. This can be used along with givenName instead of the name property.
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     * @Solr\Field(type="string")
     */
    protected $familyName;
    /**
     * @var string Gender of the person.
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     */
    protected $gender;
    /**
     * @var string Given name. In the U.S., the first name of a Person. This can be used along with familyName instead of the name property.
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     * @Solr\Field(type="string")
     */
    protected $givenName;
    /**
     * @var string The job title of the person (for example, Financial Manager).
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     */
    protected $jobTitle;
    /**
     * @var string Nationality of the person.
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     */
    protected $nationality;
    /**
     * @var string URL of the item.
     *
     * @Assert\Url
     * @ORM\Column(nullable=true)
     */
    protected $url;
    /**
     * @var Place The place where the person was born.
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Place")
     * @ORM\JoinColumn(name="birthPlace_id", referencedColumnName="id")
     */
    protected $birthPlace;
    /**
     * @var Place The place where the person died.
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Place")
     * @ORM\JoinColumn(name="deathPlace_id", referencedColumnName="id")
     */
    protected $deathPlace;
    /**
     * @var string
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     */
    protected $honoricPrefix;
    /**
     * @var string
     *
     * @Assert\Type(type="string")
     * @ORM\Column(nullable=true)
     */
    protected $honoricSuffix;
    /**
     * @var string
     * @ORM\Column(type="string", nullable=true)
     */
    protected $gnd;
    /**
     * @var string
     * @ORM\Column(type="string", nullable=true)
     */
    protected $stolpersteine;
    /**
     * @var string
     * @ORM\Column(type="string", nullable=true)
     */
    protected $djh;
    /**
     * @var string
     * @ORM\Column(type="string", nullable=true)
     */
    protected $viaf;

    /**
    * @ORM\Column(type="json_array", nullable=true)
    */
    protected $entityfacts;

    /**
    * @ORM\Column(type="json_array", nullable=true)
    */
    protected $additional;

    /**
     * @ORM\ManyToMany(targetEntity="Article", mappedBy="author")
     */
    protected $articles;

    use ArticleReferencesTrait;

   /**
     * @ORM\OneToMany(targetEntity="ArticlePerson", mappedBy="person", cascade={"persist", "remove"}, orphanRemoval=TRUE)
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
     * Sets additionalName.
     *
     * @param string $additionalName
     *
     * @return $this
     */
    public function setAdditionalName($additionalName)
    {
        $this->additionalName = $additionalName;

        return $this;
    }

    /**
     * Gets additionalName.
     *
     * @return string
     */
    public function getAdditionalName()
    {
        return $this->additionalName;
    }

    /**
     * Sets award.
     *
     * @param string $award
     *
     * @return $this
     */
    public function setAward($award)
    {
        $this->award = $award;

        return $this;
    }

    /**
     * Gets award.
     *
     * @return string
     */
    public function getAward()
    {
        return $this->award;
    }

    /**
     * Sets birthDate.
     *
     * @param string $birthDate
     *
     * @return $this
     */
    public function setBirthDate($birthDate = null)
    {
        $this->birthDate = self::formatDateIncomplete($birthDate);

        return $this;
    }

    /**
     * Gets birthDate.
     *
     * @return string
     */
    public function getBirthDate()
    {
        return $this->birthDate;
    }

    /**
     * Sets deathDate.
     *
     * @param string $deathDate
     *
     * @return $this
     */
    public function setDeathDate($deathDate = null)
    {
        $this->deathDate = self::formatDateIncomplete($deathDate);

        return $this;
    }

    /**
     * Gets deathDate.
     *
     * @return string
     */
    public function getDeathDate()
    {
        return $this->deathDate;
    }

    /**
     * Sets description.
     *
     * @param array|null $description
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
     * @return array|null
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Sets familyName.
     *
     * @param string $familyName
     *
     * @return $this
     */
    public function setFamilyName($familyName)
    {
        $this->familyName = $familyName;

        return $this;
    }

    /**
     * Gets familyName.
     *
     * @return string
     */
    public function getFamilyName()
    {
        return $this->familyName;
    }

    /**
     * Sets gender.
     *
     * @param string $gender
     *
     * @return $this
     */
    public function setGender($gender)
    {
        $this->gender = $gender;

        return $this;
    }

    /**
     * Gets gender.
     *
     * @return string
     */
    public function getGender()
    {
        return $this->gender;
    }

    /**
     * Sets givenName.
     *
     * @param string $givenName
     *
     * @return $this
     */
    public function setGivenName($givenName)
    {
        $this->givenName = $givenName;

        return $this;
    }

    /**
     * Gets givenName.
     *
     * @return string
     */
    public function getGivenName()
    {
        return $this->givenName;
    }

    /**
     * Sets jobTitle.
     *
     * @param string $jobTitle
     *
     * @return $this
     */
    public function setJobTitle($jobTitle)
    {
        $this->jobTitle = $jobTitle;

        return $this;
    }

    /**
     * Gets jobTitle.
     *
     * @return string
     */
    public function getJobTitle()
    {
        return $this->jobTitle;
    }

    /**
     * Sets nationality.
     *
     * @param string $nationality
     *
     * @return $this
     */
    public function setNationality($nationality)
    {
        $this->nationality = $nationality;

        return $this;
    }

    /**
     * Gets nationality.
     *
     * @return string
     */
    public function getNationality()
    {
        return $this->nationality;
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
     * Sets birthPlace.
     *
     * @param Place $birthPlace
     *
     * @return $this
     */
    public function setBirthPlace(Place $birthPlace = null)
    {
        $this->birthPlace = $birthPlace;

        return $this;
    }

    /**
     * Gets birthPlace.
     *
     * @return Place
     */
    public function getBirthPlace()
    {
        return $this->birthPlace;
    }

    private static function buildPlaceInfo($place, $locale)
    {
        $placeInfo = [ 'name' => $place->getNameLocalized($locale),
                       'id' => $place->getId(),
                       'tgn' => $place->getTgn(),
                       'geo' => $place->getGeo() ];
        return $placeInfo;
    }

    private static function buildPlaceInfoFromEntityfacts($entityfacts, $key)
    {
        if (is_null($entityfacts) || !array_key_exists($key, $entityfacts)) {
            return;
        }
        $place = $entityfacts[$key][0];
        if (empty($place)) {
            return;
        }
        $placeInfo = [ 'name' => $place['preferredName'] ];

        if (!empty($place['@id'])) {
            $uri = $place['@id'];
            if (preg_match('/^'
                           . preg_quote('http://d-nb.info/gnd/', '/')
                           . '(\d+\-?[\dxX]?)$/', $uri, $matches))
            {
                $placeInfo['gnd'] = $matches[1];
            }
        }

        return $placeInfo;
    }

    private static function buildPlaceInfoFromWikidata($wikidata, $key)
    {
        if (is_null($wikidata) || !array_key_exists($key, $wikidata)) {
            return;
        }
        return [ 'name' => $wikidata[$key] ];
    }

    /**
     * Gets birthPlace info
     *
     */
    public function getBirthPlaceInfo($locale = 'de')
    {
        if (!is_null($this->birthPlace)) {
            return self::buildPlaceInfo($this->birthPlace, $locale);
        }
        return self::buildPlaceInfoFromEntityfacts($this->getEntityfacts($locale), 'placeOfBirth');
    }

    /**
     * Sets deathPlace.
     *
     * @param Place $deathPlace
     *
     * @return $this
     */
    public function setDeathPlace(Place $deathPlace = null)
    {
        $this->deathPlace = $deathPlace;

        return $this;
    }

    /**
     * Gets deathPlace.
     *
     * @return Place
     */
    public function getDeathPlace()
    {
        return $this->deathPlace;
    }

    /**
     * Gets deathPlace info
     *
     */
    public function getDeathPlaceInfo($locale = 'de')
    {
        if (!is_null($this->deathPlace)) {
            return self::buildPlaceInfo($this->deathPlace, $locale);
        }
        $placeInfo = self::buildPlaceInfoFromEntityfacts($this->getEntityfacts($locale), 'placeOfDeath');
        if (!empty($placeInfo)) {
            return $placeInfo;
        }
        if (!is_null($this->additional) && array_key_exists('wikidata', $this->additional)) {
            return self::buildPlaceInfoFromWikidata($this->additional['wikidata']['de'],
                                                    'placeOfDeath');

        }
    }

    /**
     * Sets honoricPrefix.
     *
     * @param string $honoricPrefix
     *
     * @return $this
     */
    public function setHonoricPrefix($honoricPrefix)
    {
        $this->honoricPrefix = $honoricPrefix;

        return $this;
    }

    /**
     * Gets honoricPrefix.
     *
     * @return string
     */
    public function getHonoricPrefix()
    {
        return $this->honoricPrefix;
    }

    /**
     * Sets honoricSuffix.
     *
     * @param string $honoricSuffix
     *
     * @return $this
     */
    public function setHonoricSuffix($honoricSuffix)
    {
        $this->honoricSuffix = $honoricSuffix;

        return $this;
    }

    /**
     * Gets honoricSuffix.
     *
     * @return string
     */
    public function getHonoricSuffix()
    {
        return $this->honoricSuffix;
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
     * Sets djh.
     *
     * @param string $djh
     *
     * @return $this
     */
    public function setDjh($djh)
    {
        $this->djh = $djh;

        return $this;
    }

    /**
     * Gets djh.
     *
     * @return string
     */
    public function getDjh()
    {
        return $this->djh;
    }

    /**
     * Sets stolpersteine.
     *
     * @param string $stolpersteine
     *
     * @return $this
     */
    public function setStolpersteine($stolpersteine)
    {
        $this->stolpersteine = $stolpersteine;

        return $this;
    }

    /**
     * Gets stolpersteine.
     *
     * @return string
     */
    public function getStolpersteine()
    {
        return $this->stolpersteine;
    }

    /**
     * Sets entityfacts.
     *
     * @param array $entityfacts
     *
     * @return $this
     */
    public function setEntityfacts($entityfacts, $locale = 'de')
    {
        if (in_array($locale, ['de', 'en'])) {
            if (is_null($this->entityfacts)) {
                $this->entityfacts = [];
            }
            $this->entityfacts[$locale] = $entityfacts;
        }

        return $this;
    }

    /**
     * Gets entityfacts.
     *
     * @return array
     */
    public function getEntityfacts($locale = 'de', $force_locale = false)
    {
        if (is_null($this->entityfacts)) {
            return null;
        }

        // preferred locale
        if (array_key_exists($locale, $this->entityfacts)) {
            return $this->entityfacts[$locale];
        }

        if (!$force_locale) {
            // try to use fallback
            foreach ( ['de', 'en'] as $locale) {
                if (array_key_exists($locale, $this->entityfacts)) {
                    return $this->entityfacts[$locale];
                }
            }
        }

        return null;
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

    public function getFullname($givenNameFirst = false)
    {
        $parts = [];
        foreach ([ 'familyName', 'givenName' ] as $key) {
            if (!empty($this->$key)) {
                $parts[] = $this->$key;
            }
        }
        if (empty($parts)) {
            return '';
        }
        return $givenNameFirst
            ? implode(' ', array_reverse($parts))
            : implode(', ', $parts);
    }

    public function getArticles($lang = null)
    {
        if (is_null($lang) || is_null($this->articles)) {
            return $this->articles;
        }

        $langCode3 = \AppBundle\Utils\Iso639::code1to3($lang);

        return $this->articles->filter(
            function($entity) use ($langCode3) {
               return $entity->getLanguage() == $langCode3;
            }
        );
    }

    public function jsonSerialize()
    {
        return [
                 'id' => $this->id,
                 'fullname' => $this->getFullname(),
                 'honoricPrefix' => $this->getHonoricPrefix(),
                 'description' => $this->getDescription(),
                 'gender' => $this->getGender(),
                 'gnd' => $this->gnd,
                 'slug' => $this->slug,
                 ];
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

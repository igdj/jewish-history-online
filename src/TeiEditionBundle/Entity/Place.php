<?php

namespace TeiEditionBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo; // alias for Gedmo extensions annotations

use FS\SolrBundle\Doctrine\Annotation as Solr;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Entities that have a somewhat fixed, physical extension.
 *
 * @see http://schema.org/Place Documentation on Schema.org
 *
 * Might actually be the more specific City / Country / State
 * extending AdministrativeArea
 *
 * @Solr\Document(indexHandler="indexHandler")
 * @Solr\SynchronizationFilter(callback="shouldBeIndexed")
 *
 * @ORM\Entity
 * @ORM\Table(name="place")
 */
class Place
extends PlaceBase
{
    static $zoomLevelByType = [
        'neighborhood' => 12,
        'city district' => 11,
        'district' => 11,
        'inhabited place' => 10,
    ];

    public static function buildTypeLabel($type)
    {
        if ('root' == $type) {
            return '';
        }

        if ('inhabited place' == $type) {
            return 'place';
        }

        return $type;
    }

    public static function buildPluralizedTypeLabel($type, $count)
    {
        if (empty($type)) {
            return '';
        }

        $label = self::buildTypeLabel($type);
        if ($count > 1) {
            $label = \Doctrine\Common\Inflector\Inflector::pluralize($label);
        }

        return ucfirst($label);
    }

    /**
     * @var string
     *
     * @ORM\Column(type="string", nullable=false)
     */
    protected $type = 'inhabited place';

    /**
     * @ORM\ManyToOne(targetEntity="Place", inversedBy="children")
     * @ORM\JoinColumn(referencedColumnName="id", onDelete="CASCADE")
     */
    protected $parent;

    /**
     * @ORM\OneToMany(targetEntity="Place", mappedBy="parent")
     * @ORM\OrderBy({"type" = "ASC", "name" = "ASC"})
     */
    private $children;

    /**
     * @ORM\OneToMany(targetEntity="Article", mappedBy="contentLocation")
     */
    protected $articles;

    use ArticleReferencesTrait;

    /**
     * @ORM\OneToMany(targetEntity="ArticlePlace",
     *   mappedBy="place",
     *   cascade={"persist", "remove"},
     *   orphanRemoval=TRUE
     * )
     */
    protected $articleReferences;

    public function showCenterMarker()
    {
        $hasPlaceParent = false;
        $ancestorOrSelf = $this;
        while (!is_null($ancestorOrSelf)) {
            if (in_array($ancestorOrSelf->type, [ 'neighborhood', 'inhabited place' ])) {
                return true;
            }

            $ancestorOrSelf = $ancestorOrSelf->getParent();
        }

        return false;
    }

    public function getDefaultZoomlevel()
    {
        if (array_key_exists($this->type, self::$zoomLevelByType)) {
            return self::$zoomLevelByType[$this->type];
        }

        return 8;
    }

    public function setParent(Place $parent = null)
    {
        $this->parent = $parent;
    }

    public function getParent()
    {
        return $this->parent;
    }

    public function getChildren()
    {
        return $this->children;
    }

    public function getChildrenByType()
    {
        if (is_null($this->children)) {
            return null;
        }

        $ret = [];
        foreach ($this->children as $child) {
            $type = $child->getType();
            if (!array_key_exists($type, $ret)) {
                $ret[$type] = [];
            }
            $ret[$type][] = $child;
        }

        $typeWeights = [
            'continent' => -10,
            'nation' => 0,
            'dependent state' => 1,
            'former primary political entity' => 2,
            'state' => 3,
            'general region' => 5,
            'community' => 10,
            'historical region' => 11,
            'inhabited place' => 15,
            'archipelago' => 20,
        ];

        uksort($ret, function($typeA, $typeB) use ($typeWeights) {
            if ($typeA == $typeB) {
                return 0;
            }

            $typeOrderA = array_key_exists($typeA, $typeWeights) ? $typeWeights[$typeA] : 99;
            $typeOrderB = array_key_exists($typeB, $typeWeights) ? $typeWeights[$typeB] : 99;

            return ($typeOrderA < $typeOrderB) ? -1 : 1;
        });

        return $ret;
    }

    public function getTypeLabel()
    {
        return buildTypeLabel($this->type);
    }

    public function getPath()
    {
        $path = [];
        $parent = $this->getParent();
        while ($parent != null) {
            $path[] = $parent;
            $parent = $parent->getParent();
        }

        return array_reverse($path);
    }

    public function getArticles()
    {
        return $this->articles;
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

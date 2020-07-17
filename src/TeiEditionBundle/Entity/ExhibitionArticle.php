<?php

namespace TeiEditionBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 *
 * @ORM\Entity
 */
class ExhibitionArticle
extends Article
{
    /**
     * Gets genre.
     *
     * @return string
     */
    public function getGenre()
    {
        return 'exhibition';
    }
}

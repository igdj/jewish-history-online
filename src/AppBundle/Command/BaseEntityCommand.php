<?php

// src/AppBundle/Command/GreetCommand.php
namespace AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

abstract class BaseEntityCommand extends ContainerAwareCommand
{
    protected function buildPersonConditionByUri($uri)
    {
        $condition = null;

        if (preg_match('/^'
                       . preg_quote('http://d-nb.info/gnd/', '/')
                       . '(\d+[xX]?)$/', $uri, $matches))
        {
            $condition = [ 'gnd' => $matches[1] ];
        }

        return $condition;
    }

    protected function findPersonByUri($uri)
    {
        $condition = $this->buildPersonConditionByUri($uri);

        if (is_null($condition)) {
            die('Currently not handling ' . $uri);
            return -1;
        }

        $em = $this->getContainer()->get('doctrine')->getEntityManager();
        return $em->getRepository('AppBundle\Entity\Person')->findOneBy($condition);
    }

    protected function insertMissingPerson($uri)
    {
        $person = $this->findPersonByUri($uri);
        if (!is_null($person)) {
            return 0;
        }

        $em = $this->getContainer()->get('doctrine')->getEntityManager();
        $person = new \AppBundle\Entity\Person();
        $condition = $this->buildPersonConditionByUri($uri);
        foreach ($condition as $field => $value) {
            switch ($field) {
                case 'gnd':
                    $bio = \AppBundle\Utils\BiographicalData::fetchByGnd($value);
                    if (!$bio->isDifferentiated) {
                        return -1;
                    }
                    // TODO: use hydrator
                    foreach ([
                              'surname',
                              'forename',
                              'dateOfBirth',
                              'dateOfDeath',
                              'biographicalInformation',
                              ] as $src)
                    {
                        if (!empty($bio->{$src})) {
                            switch ($src) {
                                case 'surname':
                                    $person->setFamilyName($bio->{$src});
                                    break;
                                case 'forename':
                                    $person->setGivenName($bio->{$src});
                                    break;
                                case 'dateOfBirth':
                                    $person->setBirthDate($bio->{$src});
                                    break;
                                case 'dateOfDeath':
                                    $person->setDeathDate($bio->{$src});
                                    break;
                                case 'biographicalInformation':
                                    $person->setDescription([ 'de' => $bio->{$src} ]);
                                    break;
                            }
                        }
                    }
                    $person->setGnd($value);
                    break;

                default:
                    die('TODO: handle field ' . $field);
            }
        }
        $em->persist($person);
        $em->flush();
        return 1;
    }

    protected function buildOrganizationConditionByUri($uri)
    {
        $condition = null;

        if (preg_match('/^'
                       . preg_quote('http://d-nb.info/gnd/', '/')
                       . '(\d+\-?[\dxX]?)$/', $uri, $matches))
        {
            $condition = [ 'gnd' => $matches[1] ];
        }

        return $condition;
    }

    protected function findOrganizationByUri($uri)
    {
        $condition = $this->buildOrganizationConditionByUri($uri);

        if (is_null($condition)) {
            die('Currently not handling ' . $uri);
            return -1;
        }

        $em = $this->getContainer()->get('doctrine')->getEntityManager();
        return $em->getRepository('AppBundle\Entity\Organization')->findOneBy($condition);
    }

    protected function insertMissingOrganization($uri)
    {
        $organization = $this->findOrganizationByUri($uri);
        if (!is_null($organization)) {
            return 0;
        }

        $em = $this->getContainer()->get('doctrine')->getEntityManager();
        $organization = new \AppBundle\Entity\Organization();
        $condition = $this->buildOrganizationConditionByUri($uri);
        foreach ($condition as $field => $value) {
            switch ($field) {
                case 'gnd':
                    $corporateBody = \AppBundle\Utils\CorporateBodyData::fetchByGnd($value);
                    if (is_null($corporateBody) || !$corporateBody->isDifferentiated) {
                        return -1;
                    }
                    var_dump($corporateBody);
                    // TODO: use hydrator
                    foreach ([
                              'preferredName',
                              'dateOfEstablishment',
                              // 'dateOfDeath',
                              'biographicalInformation',
                              ] as $src)
                    {
                        if (!empty($corporateBody->{$src})) {
                            switch ($src) {
                                case 'preferredName':
                                    $organization->setName($corporateBody->{$src});
                                    break;
                                case 'dateOfEstablishment':
                                    $organization->setFoundingDate($corporateBody->{$src});
                                    break;
                                case 'dateOfTermination':
                                    $organization->setDissolutionDate($corporateBody->{$src});
                                    break;
                                case 'biographicalInformation':
                                    $organization->setDescription([ 'de' => $corporateBody->{$src} ]);
                                    break;

                                case 'homepage':
                                    $organization->setUrl($corporateBody->{$src});
                                    break;
                            }
                        }
                    }
                    $organization->setGnd($value);
                    break;
                default:
                    die('TODO: handle field ' . $field);
            }
        }
        $em->persist($organization);
        $em->flush();
        return 1;
    }

    protected function buildPlaceConditionByUri($uri)
    {
        $condition = null;

        if (preg_match('/^'
                       . preg_quote('http://vocab.getty.edu/tgn/', '/')
                       . '(\d+)$/', $uri, $matches))
        {
            $condition = [ 'tgn' => $matches[1] ];
        }

        return $condition;
    }

    protected function findPlaceByUri($uri)
    {
        $condition = $this->buildPlaceConditionByUri($uri);

        if (is_null($condition)) {
            die('Currently not handling ' . $uri);
            return;
        }

        $em = $this->getContainer()->get('doctrine')->getEntityManager();
        return $em->getRepository('AppBundle\Entity\Place')->findOneBy($condition);
    }

    protected function insertMissingPlace($uri, $additional = [])
    {
        $entity = $this->findPlaceByUri($uri);
        if (!is_null($entity)) {
            return 0;
        }

        $em = $this->getContainer()->get('doctrine')->getEntityManager();
        $entity = new \AppBundle\Entity\Place();
        $condition = $this->buildPlaceConditionByUri($uri);
        foreach ($condition as $prefix => $value) {
            switch ($prefix) {
                case 'tgn':
                    var_dump($prefix . ':' . $value);
                    $geo = \AppBundle\Utils\GeographicalData::fetchByIdentifier($prefix . ':' . $value);
                    if (empty($geo) || empty($geo->preferredName)) {
                        var_dump($geo);
                        die($tgn);
                    }

                    $parent = null;
                    if (!empty($geo->tgnParent)) {
                        $parent = $em->getRepository('AppBundle\Entity\Place')->findOneBy([ 'tgn' => $geo->tgnParent ]);
                        if (is_null($parent)) {
                            $res = $this->insertMissingPlace('http://vocab.getty.edu/tgn/' . $geo->tgnParent);
                            if ($res >= 0) {
                                $parent = $em->getRepository('AppBundle\Entity\Place')->findOneBy([ 'tgn' => $geo->tgnParent ]);
                            }
                        }
                    }

                    if (isset($parent)) {
                        $entity->setParent($parent);
                    }

                    if (!empty($additional['gnd'])) {
                        $uri = $additional['gnd'];
                        if (preg_match('/^'
                                       . preg_quote('http://d-nb.info/gnd/', '/')
                                       . '(\d+[\-]?[\dxX]?)$/', $uri, $matches))
                        {
                            $entity->setGnd($matches[1]);
                        }
                    }

                    // TODO: use hydrator
                    foreach ([
                              'type',
                              'preferredName', 'alternateName',
                              'latitude',
                              ] as $src)
                    {
                        if (!empty($geo->{$src})) {
                            switch ($src) {
                                case 'preferredName':
                                    $entity->setName($geo->{$src});
                                    break;
                                case 'alternateName':
                                    $entity->setAlternateName($geo->{$src});
                                    break;
                                case 'type':
                                    $entity->setType($geo->{$src});
                                    break;
                                case 'latitude':
                                    $entity->setGeo(join(',',
                                                         [ $geo->latitude, $geo->longitude ]));
                                    break;
                            }
                        }
                    }
                    $entity->setTgn($value);
                    break;

                default:
                    die('TODO: handle field ' . $field);
            }
        }
        $em->persist($entity);
        $em->flush();
        return 1;
    }
}

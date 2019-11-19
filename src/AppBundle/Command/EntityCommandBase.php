<?php
// src/AppBundle/Command/EntityCommandBase.php

namespace AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;

abstract class EntityCommandBase
extends ContainerAwareCommand
{
    protected function jsonPrettyPrint($structure)
    {
        return json_encode($structure, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    private function buildGndConditionbyUri($uri, $hyphenAllowed = true)
    {
        $condition = null;

        $regExp = '/^https?'
            . preg_quote('://d-nb.info/gnd/', '/')
            . ($hyphenAllowed ? '(\d+\-?[\dxX]?)' : '(\d+[xX]?)')
            . '$/';

        if (preg_match($regExp, $uri, $matches))
        {
            $condition = [ 'gnd' => $matches[1] ];
        }

        return $condition;
    }

    protected function buildPersonConditionByUri($uri)
    {
        $condition = $this->buildGndConditionByUri($uri, false);
        if (!empty($condition)) {
            return $condition;
        }

        if (preg_match('/^'
                       . preg_quote('http://www.dasjuedischehamburg.de/inhalt/', '/')
                       . '(.+)$/', $uri, $matches))
        {
            $condition = [ 'djh' => urldecode($matches[1]) ];
        }
        else if (preg_match('/^'
                            . preg_quote('http://www.stolpersteine-hamburg.de/', '/')
                            . '.*?BIO_ID=(\d+)/', $uri, $matches))
        {
            $condition = [ 'stolpersteine' => $matches[1] ];
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

        $em = $this->getContainer()->get('doctrine')->getManager();

        return $em->getRepository('AppBundle\Entity\Person')->findOneBy($condition);
    }

    protected function insertMissingPerson($uri)
    {
        $person = $this->findPersonByUri($uri);
        if (!is_null($person)) {
            return 0;
        }

        $em = $this->getContainer()->get('doctrine')->getManager();
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
                    die('TODO: handle field ' . $field . ' for ' . $value);
            }
        }

        $em->persist($person);
        $em->flush();

        return 1;
    }

    protected function buildOrganizationConditionByUri($uri)
    {
        return $this->buildGndConditionByUri($uri);
    }

    protected function findOrganizationByUri($uri)
    {
        $condition = $this->buildOrganizationConditionByUri($uri);

        if (is_null($condition)) {
            die('Currently not handling ' . $uri);

            return -1;
        }

        $em = $this->getContainer()->get('doctrine')->getManager();

        return $em->getRepository('AppBundle\Entity\Organization')->findOneBy($condition);
    }

    protected function insertMissingOrganization($uri)
    {
        $organization = $this->findOrganizationByUri($uri);
        if (!is_null($organization)) {
            return 0;
        }

        $em = $this->getContainer()->get('doctrine')->getManager();
        $organization = new \AppBundle\Entity\Organization();
        $condition = $this->buildOrganizationConditionByUri($uri);
        foreach ($condition as $field => $value) {
            switch ($field) {
                case 'gnd':
                    $corporateBody = \AppBundle\Utils\CorporateBodyData::fetchByGnd($value);
                    if (is_null($corporateBody) || !$corporateBody->isDifferentiated) {
                        return -1;
                    }

                    // var_dump($corporateBody);
                    // TODO: use hydrator
                    foreach ([
                            'preferredName',
                            'dateOfEstablishment',
                            'dateOfTermination',
                            'biographicalInformation',
                            'homepage',
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
        if (preg_match('/^geo:/', $uri)) {
            // ignore geo: $uri
            return null;
        }

        $condition = $this->buildPlaceConditionByUri($uri);

        if (is_null($condition)) {
            die('Currently not handling ' . $uri);

            return;
        }

        $em = $this->getContainer()->get('doctrine')->getManager();

        return $em->getRepository('AppBundle\Entity\Place')->findOneBy($condition);
    }

    protected function insertMissingPlace($uri, $additional = [])
    {
        if (preg_match('/^geo:/', $uri)) {
            // ignore geo: $uri
            return 0;
        }

        $em = $this->getContainer()->get('doctrine')->getManager();
        $entity = $this->findPlaceByUri($uri);
        if (!is_null($entity)) {
            // set gnd if given and not already set
            if (!empty($additional['gnd'])
                && preg_match('/^https?'
                              . preg_quote('://d-nb.info/gnd/', '/')
                              . '(\d+[\-]?[\dxX]?)$/', $additional['gnd'], $matches))
            {
                $gnd = $entity->getGnd();
                if (empty($gnd)) {
                    $entity->setGnd($matches[1]);
                    $em->persist($entity);
                    $em->flush();
                }
            }

            return 0;
        }

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
                        $parent = $em->getRepository('AppBundle\Entity\Place')->findOneBy([
                            'tgn' => $geo->tgnParent,
                        ]);
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
                        if (preg_match('/^https?'
                                       . preg_quote('://d-nb.info/gnd/', '/')
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
                                    $entity->setGeo(join(',', [ $geo->latitude, $geo->longitude ]));
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

    protected function buildLandmarkConditionByUri($uri)
    {
        if (preg_match('/^geo:(.*)/', $uri, $matches)) {
            return [
                'geo' => $matches[1],
            ];
        }
    }

    protected function findLandmarkByUri($uri)
    {
        if (!preg_match('/^geo:/', $uri)) {
            // ignore all non-geo: $uri
            return null;
        }

        $condition = $this->buildLandmarkConditionByUri($uri);

        if (is_null($condition)) {
            die('Currently not handling ' . $uri);

            return;
        }

        $em = $this->getContainer()->get('doctrine')->getManager();

        return $em->getRepository('AppBundle\Entity\Landmark')->findOneBy($condition);
    }

    protected function buildEventConditionByUri($uri)
    {
        return $this->buildGndConditionByUri($uri);
    }

    protected function findEventByUri($uri)
    {
        $condition = $this->buildEventConditionByUri($uri);

        if (is_null($condition)) {
            die('Currently not handling ' . $uri);
            return;
        }

        $em = $this->getContainer()->get('doctrine')->getManager();

        return $em->getRepository('AppBundle\Entity\Event')->findOneBy($condition);
    }

    protected function insertMissingEvent($uri, $additional = [])
    {
        $entity = $this->findEventByUri($uri);
        if (!is_null($entity)) {
            return 0;
        }

        $em = $this->getContainer()->get('doctrine')->getManager();
        $entity = new \AppBundle\Entity\Event();
        $condition = $this->buildEventConditionByUri($uri);
        foreach ($condition as $prefix => $value) {
            switch ($prefix) {
                case 'gnd':
                    $event = \AppBundle\Utils\HistoricEventData::fetchByGnd($value);
                    if (is_null($event)) {
                        return -1;
                    }

                    // TODO: use hydrator
                    foreach ([
                            'preferredName',
                            'dateOfEstablishment',
                            'dateOfTermination',
                            'definition',
                        ] as $src)
                    {
                        if (!empty($event->{$src})) {
                            switch ($src) {
                                case 'preferredName':
                                    $entity->setName($event->{$src});
                                    break;

                                case 'dateOfEstablishment':
                                    $entity->setStartDate($event->{$src});
                                    break;

                                case 'dateOfTermination':
                                    $entity->setEndDate($event->{$src});
                                    break;

                                case 'definition':
                                    $entity->setDescription([ 'de' => $event->{$src} ]);
                                    break;

                            }
                        }
                    }
                    $entity->setGnd($value);
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

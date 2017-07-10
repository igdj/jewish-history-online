<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Bridge\PsrHttpMessage\Factory\HttpFoundationFactory;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 *
 */
class OaiController extends Controller
{
    /**
     * @Route("/oai")
     */
    public function dispatchAction()
    {
        // Where $repository is an instance of \Picturae\OaiPmh\Interfaces\Repository
        $repository = new Repository($this);
        $provider = new \Picturae\OaiPmh\Provider($repository);

        $request = \Zend\Diactoros\ServerRequestFactory::fromGlobals();
        $provider = new \Picturae\OaiPmh\Provider($repository, $request);
        $psrResponse = $provider->getResponse();

        // convert $psrResponse
        $httpFoundationFactory = new HttpFoundationFactory();
        return $httpFoundationFactory->createResponse($psrResponse);
    }
}

/**
 * Custom Repository
 */
use DateTime;
use OpenSkos2\OaiPmh\Concept as OaiConcept;
use Picturae\OaiPmh\Exception\IdDoesNotExistException;
use Picturae\OaiPmh\Implementation\MetadataFormatType as ImplementationMetadataFormatType;
use Picturae\OaiPmh\Implementation\RecordList as OaiRecordList;
use Picturae\OaiPmh\Implementation\Repository\Identity as ImplementationIdentity;
use Picturae\OaiPmh\Implementation\Set;
use Picturae\OaiPmh\Implementation\SetList;
use Picturae\OaiPmh\Interfaces\MetadataFormatType;
use Picturae\OaiPmh\Interfaces\Record;
use Picturae\OaiPmh\Interfaces\RecordList;
use Picturae\OaiPmh\Interfaces\Repository as InterfaceRepository;
use Picturae\OaiPmh\Interfaces\Repository\Identity;
use Picturae\OaiPmh\Interfaces\SetList as InterfaceSetList;

class Repository implements InterfaceRepository
{
    protected $controller = null;
    protected $limit = 20;

    static function xmlEncode($str)
    {
        return htmlspecialchars(rtrim($str), ENT_XML1, 'utf-8');
    }

    public function __construct($controller)
    {
        $this->controller = $controller;
    }

    /**
     * @return string the base URL of the repository
     */
    public function getBaseUrl()
    {
        // create a generator
        return $this->controller->generateUrl('oai', [], \Symfony\Component\Routing\Generator\UrlGeneratorInterface::ABSOLUTE_URL);
    }

    /**
     * @return string
     * the finest harvesting granularity supported by the repository. The legitimate values are
     * YYYY-MM-DD and YYYY-MM-DDThh:mm:ssZ with meanings as defined in ISO8601.
     */
    public function getGranularity()
    {
        return \Picturae\OaiPmh\Interfaces\Repository\Identity::GRANULARITY_YYYY_MM_DD;
    }

    /**
     * @return Identity
     */
    public function identify()
    {
        return new ImplementationIdentity(
            $this->controller->getRequest()->getHost(),
            $this->getEarliestDateStamp(),
            \Picturae\OaiPmh\Interfaces\Repository\Identity::DELETED_RECORD_PERSISTENT,
            [ 'info@juedische-geschichte-online.net' ],
            $this->getGranularity()
        );
    }

    /**
     * @return InterfaceSetList
     */
    public function listSets()
    {
        $items = [];

        $items[] = new Set('background', 'Introductions');
        $items[] = new Set('interpretation', 'Interpretations');
        $items[] = new Set('source', 'Sources');

        return new SetList($items);
    }

    /**
     * @param string $token
     * @return InterfaceSetList
     */
    public function listSetsByToken($token)
    {
        $params = $this->decodeResumptionToken($token);
        return $this->listSets();
    }

    /**
     * @param string $metadataFormat
     * @param string $identifier
     * @return Record
     */
    public function getRecord($metadataFormat, $identifier)
    {
        // Fetch record
        $record = $this->getSomeRecord($metadataFormat, $identifier);

        // Throw exception if it does not exists
        if (!$record) {
            throw new IdDoesNotExistException('No matching identifier ' . $identifier);
        }

        return $record;
    }

    /**
     * @param string $metadataFormat metadata format of the records to be fetch or null if only headers are fetched
     * (listIdentifiers)
     * @param DateTime $from
     * @param DateTime $until
     * @param string $set name of the set containing this record
     * @return RecordList
     */
    public function listRecords($metadataFormat = null, DateTime $from = null, DateTime $until = null, $set = null)
    {
        $params = [
            'offset' => 0,
            'from' => $from,
            'until' => $until,
            'metadataPrefix' => $metadataFormat,
            'set' => $set,
        ];

        return $this->buildRecordList($params);
    }

    /**
     * @param string $token
     * @return RecordList
     */
    public function listRecordsByToken($token)
    {
        $params = $this->decodeResumptionToken($token);

        return $this->buildRecordList($params);
    }

    protected function buildRecordList($params)
    {
        $items = $this->getRecords($params);

        $token = null;
        if (count($items) > $this->limit) {
            // Only show if there are more records available else $token = null;
            $token = $this->encodeResumptionToken(
                $params['offset'] + $this->limit,
                $params['from'],
                $params['until'],
                $params['metadataPrefix'],
                $params['set']
            );
            unset($items[$this->limit]);
        }

        return new OaiRecordList($items, $token);
    }

    /**
     * @param string $identifier
     * @return MetadataFormatType[]
     */
    public function listMetadataFormats($identifier = null)
    {
        $formats = [];

        $formats[] = new ImplementationMetadataFormatType(
            'oai_dc',
            'http://www.openarchives.org/OAI/2.0/oai_dc.xsd',
            'http://www.openarchives.org/OAI/2.0/oai_dc/'
        );

        return $formats;
    }

    /**
     * Decode resumption token
     * possible properties are:
     *
     * ->offset
     * ->metadataPrefix
     * ->set
     * ->from (timestamp)
     * ->until (timestamp)
     *
     * @param string $token
     * @return array
     */
    private function decodeResumptionToken($token)
    {
        $params = (array) json_decode(base64_decode($token));

        if (!empty($params['from'])) {
            $params['from'] = new \DateTime('@' . $params['from']);
        }

        if (!empty($params['until'])) {
            $params['until'] = new \DateTime('@' . $params['until']);
        }

        return $params;
    }

    /**
     * Get resumption token
     *
     * @param int $offset
     * @param DateTime $from
     * @param DateTime $util
     * @param string $metadataPrefix
     * @param string $set
     * @return string
     */
    private function encodeResumptionToken(
        $offset = 0,
        DateTime $from = null,
        DateTime $until = null,
        $metadataPrefix = null,
        $set = null
    ) {
        $params = [];
        $params['offset'] = $offset;
        $params['metadataPrefix'] = $metadataPrefix;
        $params['set'] = $set;
        $params['from'] = null;
        $params['until'] = null;

        if ($from) {
            $params['from'] = $from->getTimestamp();
        }

        if ($until) {
            $params['until'] = $until->getTimestamp();
        }

        return base64_encode(json_encode($params));
    }

    /**
     * Get earliest modified timestamp
     *
     * @return DateTime
     */
    private function getEarliestDateStamp()
    {
        // Fetch earliest timestamp
        return new DateTime('2016-01-01T00:00:00Z');
    }

    protected function buildDateExpression($date)
    {
        $date->setTimezone(new \DateTimeZone('UTC'));
        return $date->format('Y-m-d'); // currently no time in datePublished field
    }

    protected function getRecords($params)
    {
        $locale = $this->controller->getRequest()->getLocale();

        $criteria = [
            'status' => [ 1 ], // explicit publishing needed
            'language' => \AppBundle\Utils\Iso639::code1to3($locale),
        ];
        if (!empty($params['set'])
            && in_array($params['set'], [ 'background', 'interpretation', 'source' ]))
        {
            $criteria['articleSection'] = $params['set'];
        }

        $qb = $this->controller->getDoctrine()
            ->getManager()
            ->createQueryBuilder();

        $qb->select('A.uid')
            ->from('AppBundle:Article', 'A');

        foreach ($criteria as $field => $cond) {
            $qb->andWhere('A.' . $field
                                    . (is_array($cond)
                                       ? ' IN (:' . $field . ')'
                                       : '= :' . $field))
                ->setParameter($field, $cond);
        }

        if (!empty($params['from']) || !empty($params['until'])) {
            // datePublished only on interpretation
            $qb->leftJoin('A.isPartOf', 'PA');
        }

        if (!empty($params['from'])) {
            $qb->andWhere('COALESCE(A.datePublished, PA.datePublished) >= :from')
                ->setParameter('from', $this->buildDateExpression($params['from']));
        }
        if (!empty($params['until'])) {
            $qb->andWhere('COALESCE(A.datePublished, PA.datePublished) <= :until')
                ->setParameter('until', $this->buildDateExpression($params['until']));
        }

        $qb->orderBy('A.id')
            ->setMaxResults($this->limit + 1);

        if (!empty($params['offset']) && $params['offset'] > 0) {
            $qb->setFirstResult((int)$params['offset']);
        }

        $records = [];
        foreach ($qb->getQuery()->getResult() as $row) {
            $uid = implode('.', [ $row['uid'], $locale ]);
            $records[] = $this->buildRecord($uid, $params['metadataPrefix']);
        }

        return $records;
    }

    protected function buildRecord($uid, $metadataFormat = null)
    {
        if (!preg_match('/(jgo\:(article|source)\-\d+)\.(de|en)/', $uid, $matches)) {
            return;
        }

        $article = $this->controller->getDoctrine()
            ->getManager()
            ->getRepository('AppBundle\Entity\Article')
            ->findOneBy([
                'uid' => $matches[1],
                'language' => \AppBundle\Utils\Iso639::code1to3($locale = $matches[3]),
                'status' => 1
            ]);

        if (is_null($article)) {
            return;
        }

        $identifier = 'oai:' . $uid;

        $title = self::xmlEncode($article->getName());

        $creatorParts = $subjectParts = [];
        $datePublished = $article->getDatePublished();
        if ('source' == $article->getGenre()) {
            $keywords = '';
            $route = 'source';
            $params = [ 'uid' => $article->getUid() ];
            // for sources, creator is free-text
            $creatorParts[] = $article->getCreator();
            $description = $article->getIsPartOf()->getDescription();
            if (is_null($datePublished)) {
                $datePublished = $article->getIsPartOf()->getDatePublished();
            }
        }
        else {
            $subjectParts = $article->getKeywords();
            if ('background' == $article->getGenre()) {
                $route = 'topic-background';
                $params = [ 'slug' => $article->getSlug() ];
            }
            else {
                $route = 'article';
                $params = [ 'slug' => $article->getSlug(true) ];
            }
            $authors = $article->getAuthor();
            if (count($authors) > 0) {
                foreach ($authors as $author) {
                    $creatorParts[] = $author->getFullName();
                }
            }
            $description = $article->getDescription();
        }

        $doi = $article->getDoi();
        if (!empty($doi) && false === strpos('10.5072', $doi)) {
            $url = 'https://dx.doi.org/' . $doi;
        }
        else {
            $url = $this->controller->generateUrl($route, $params, true);
        }
        $description = self::xmlEncode($description);
        $subject = self::xmlEncode(implode(', ', $subjectParts));
        $creator = self::xmlEncode(implode(', ', $creatorParts));

        if (!is_null($datePublished)) {
            $date = $datePublished->format('Y-m-d');
        }
        else {
            $date = '';
        }

        // oai_dc
        $xml = <<<EOT
            <oai_dc:dc
                 xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"
                 xmlns:dc="http://purl.org/dc/elements/1.1/"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/
                 http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
                <dc:language>{$locale}</dc:language>
                <dc:title>{$title}</dc:title>
                <dc:identifier>{$url}</dc:identifier>
                <dc:creator>{$creator}</dc:creator>
                <dc:publisher>Institit f&#252;r die Geschichte der deutschen Juden</dc:publisher>
                <dc:subject>{$subject}</dc:subject>
                <dc:type>Online Ressource</dc:type>
                <dc:description>{$description}</dc:description>
                <dc:date>{$date}</dc:date>
            </oai_dc:dc>
EOT;

        $recordMetadata = new \DOMDocument();
        $recordMetadata->loadXML($xml);
        $someRecord = new \Picturae\OaiPmh\Implementation\Record(
            new \Picturae\OaiPmh\Implementation\Record\Header($identifier, $datePublished, [], $article->getStatus() != 1),
            $recordMetadata);

        return $someRecord;
    }

    protected function getSomeRecord($metadataFormat, $identifier)
    {
        return $this->buildRecord($identifier, $metadataFormat);
    }
}

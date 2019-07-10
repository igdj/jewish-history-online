<?php
// src/AppBundle/Command/MetsCommand.php

namespace AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

class MetsCommand
extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('source:mets')
            ->setDescription('Generate Mets')
            ->addArgument(
                'file',
                InputArgument::REQUIRED,
                'TEI file'
            )
        ;
    }

    protected function registerXpathNamespaces($xml)
    {
        $xml->registerXPathNamespace('tei', 'http://www.tei-c.org/ns/1.0');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $fname = $input->getArgument('file');

        $fs = new Filesystem();

        if (!$fs->exists($fname)) {
            $output->writeln(sprintf('<error>%s does not exist</error>', $fname));

            return 1;
        }

        $teiHelper = new \AppBundle\Utils\TeiHelper();

        $article = $teiHelper->analyzeHeader($fname);
        if (false === $article) {
            $output->writeln(sprintf('<error>%s could not be loaded</error>', $fname));
            foreach ($teiHelper->getErrors() as $error) {
                $output->writeln(sprintf('<error>  %s</error>', trim($error->message)));
            }

            return 1;
        }

        libxml_use_internal_errors(true);
        $xml = @simplexml_load_file($fname);

        if (false === $xml) {
            $output->writeln(sprintf('<error>%s could not be loaded</error>', $fname));
            foreach (libxml_get_errors() as $error) {
                $output->writeln(sprintf('<error>  %s</error>', trim($error->message)));
            }

            return 1;
        }

        libxml_use_internal_errors(false);

        $this->registerXpathNamespaces($xml);

        $result = $xml->xpath('/tei:TEI/tei:text//tei:pb');
        if (empty($result)) {
            $output->writeln('<error>No pb found</error>');

            return;
        }

        $ID = pathinfo($fname, PATHINFO_FILENAME);

        $PAGES = [];

        $facs_ref = $facs_counter = 1;
        foreach ($result as $element) {
            $facs = $element['facs'];
            if (!empty($facs) && preg_match('/(\d+)/', $facs, $matches)) {
                $facs_ref = $matches[1];
            }
            $page = [
                'counter' => $facs_counter++,
                'facs' => sprintf('f%04d', $facs_ref++),
            ];
            $n = $element['n'];
            if (!empty($n)) {
                $page['n'] = (string)$n;
            }
            $PAGES[$page['counter']] = $page;
        }

        // set the publisher - needs to be localized
        $translator = $this->getContainer()->get('translator');
        $translator->setLocale(\AppBundle\Utils\Iso639::code3To1($article->language));

        // TODO: allow to set a more complex structure
        $FILE_GROUPS = [
            'MASTER',
            'TRANSCRIPTION',
        ];

        $translations = [];
        if (!empty($article->translatedFrom) && $article->translatedFrom != $article->language) {
            $FILE_GROUPS[] = 'TRANSLATION';
            if ($article->translatedFrom == 'yid') {
                $translations[] = 'yl'; // yivo-transcript in latin letters
            }
            $translations[] = \AppBundle\Utils\Iso639::code3to1($article->language);
        }

        $LOGICAL_TYPE = 'Source';
        $LOGICAL_LABEL = $article->name;
        $LOGICAL_STRUCTURE = [
            'content' => [
                'TYPE' => 'content',
                'LABEL' => /** @Ignore */ $translator->trans($LOGICAL_TYPE),
                'ORDER' => 1,
                'physical_start' => 1,
            ],
        ];

        $xw = new \XMLWriter();
        $xw->openMemory();
        $xw->setIndent(TRUE);

        $xw->startDocument('1.0', 'UTF-8');

        $xw->startElementNs('mets', 'mets', 'http://www.loc.gov/METS/');
        $xw->writeAttributeNs('xsi', 'schemaLocation',
                              'http://www.w3.org/2001/XMLSchema-instance',
                              'http://www.loc.gov/METS/ http://www.loc.gov/standards/mets/mets.xsd');

        // Descriptive Metadata
        foreach ([ 'dmd', 'amd' ] as $sec) {
            $xw->startElement('mets:' . $sec . 'Sec');
            $xw->writeAttribute('ID', $sec . '_' . $ID);
            $xw->endElement(); // </mets:${sec}Sec>
        }

        // fileSec
        $fileids_by_page = [];
        $xw->startElement('mets:fileSec');
        foreach ($FILE_GROUPS as $group) {
            $xw->startElement('mets:fileGrp');
            $xw->writeAttribute('USE', $group);
            foreach ($PAGES as $page_def) {
                $page = $page_def['counter'];
                $hrefs = [];
                if ('MASTER' == $group) {
                    $mime = 'image/jpeg';
                    $hrefs[] = sprintf('%s.jpg', $page_def['facs']);
                }
                else {
                    $mime = 'text/xml';

                    if ('TRANSLATION' == $group) {
                        /*
                        the following must correspond to in iview-client-mets.js
                        // tei/translation.de/THULB_129846422_1801_1802_LLZ_001_18010701_001.xml -> de
                        MetsStructureBuilder.prototype.extractTranslationLanguage = function (href) {
                            return href.split("/")[1].split(".")[1];
                        };
                        */
                        foreach ($translations as $code1) {
                            $hrefs[] = sprintf('tei/translation.%s/page-%d.xml',
                                               $code1, $page);
                        }
                    }
                    else {
                        // language of the transcription
                        if (!empty($translations) && empty($article->translatedFrom)) {
                            die('translationFrom is not set');
                        }

                        $langTranscription = !empty($article->translatedFrom)
                            ? $article->translatedFrom : $article->language;

                        $hrefs[] = sprintf('tei/transcription.%s/page-%d.xml',
                                           \AppBundle\Utils\Iso639::code3to1($langTranscription),
                                           $page);
                    }
                }

                foreach ($hrefs as $href) {
                    $id = sprintf('%s_%s', strtolower($group), md5($href));
                    if (!array_key_exists($page, $fileids_by_page)) {
                        $fileids_by_page[$page] = [];
                    }
                    if (!array_key_exists($group, $fileids_by_page[$page])) {
                        $fileids_by_page[$page][$group] = [];
                    }
                    $fileids_by_page[$page][$group][] = $id;
                    $xw->startElement('mets:file');
                    $xw->writeAttribute('ID', $id);
                    $xw->writeAttribute('MIMETYPE', $mime);

                    $xw->startElement('mets:FLocat');
                    $xw->writeAttribute('LOCTYPE', 'URL');
                    $xw->writeAttributeNs('xlink', 'href',
                                          'http://www.w3.org/1999/xlink',
                                          $href);
                    $xw->endElement(); // </mets:FLocat>

                    $xw->endElement(); // </mets:file>
                }
            }
            $xw->endElement(); // </mets:fileGrp>
        }
        $xw->endElement(); // </mets:fileSec>

        // struct maps
        foreach (['PHYSICAL', 'LOGICAL'] as $type) {
            $xw->startElement('mets:structMap');
            $xw->writeAttribute('TYPE', $type);
            if ('PHYSICAL' == $type) {
                // physSequence
                $xw->startElement('mets:div');
                $xw->writeAttribute('ID', 'phys_dmd_' . $ID);
                $xw->writeAttribute('TYPE', 'physSequence');
                foreach ($fileids_by_page as $order => $fileidsByGroup) {
                    $xw->startElement('mets:div');
                    $xw->writeAttribute('ID', 'phys_dmd_' . $ID . '_' . $order);
                    $xw->writeAttribute('TYPE', 'page');
                    $xw->writeAttribute('ORDER', $order);

                    if (array_key_exists($order, $PAGES)) {
                        if (!empty($PAGES[$order]['n'])) {
                           $xw->writeAttribute('ORDERLABEL', $PAGES[$order]['n']);
                        }
                    }

                    foreach ($fileidsByGroup as $fileids) {
                        foreach ($fileids as $fileid) {
                            $xw->startElement('mets:fptr');
                            $xw->writeAttribute('FILEID', $fileid);
                            $xw->endElement(); // </mets:fptr>
                        }
                    }

                    $xw->endElement(); // </mets:div>
                }

                $xw->endElement(); // </mets:div>
            }
            else if ('LOGICAL' == $type) {
                $xw->startElement('mets:div');
                $xw->writeAttribute('ID', 'log_' . $ID);
                $xw->writeAttribute('DMDID', 'dmd_' . $ID);
                $xw->writeAttribute('ADMIDID', 'amd_' . $ID);
                $xw->writeAttribute('TYPE', $LOGICAL_TYPE);
                $xw->writeAttribute('LABEL', $LOGICAL_LABEL);
                $xw->writeAttribute('ORDER', 1);

                $logical_by_physical_start = [];
                foreach ($LOGICAL_STRUCTURE as $part) {
                    $logical_by_physical_start[$part['physical_start']] = $part;
                    $xw->startElement('mets:div');
                    $xw->writeAttribute('TYPE', $part['TYPE']);
                    $xw->writeAttribute('ID', 'log_' . $ID . '_' . $part['ORDER']);
                    $xw->writeAttribute('ORDER', $part['ORDER']);
                    $xw->writeAttribute('LABEL', $part['LABEL']);
                    $xw->endElement(); // </mets:div>
                }

                $xw->endElement(); // </mets:div>

                // structLink
                $xw->startElement('mets:structLink');
                $part = $logical_by_physical_start[key($logical_by_physical_start)];
                $from = 'log_' . $ID . '_' . $part['ORDER'];
                foreach ($PAGES as $page_def) {
                    $page = $page_def['counter'];
                    if (array_key_exists($page, $logical_by_physical_start)) {
                        $part = $logical_by_physical_start[$page];
                        $from = 'log_' . $ID . '_' . $part['ORDER'];
                    }
                    $to = sprintf('phys_dmd_%s_%s',
                                  $ID, $page);
                    $xw->startElement('mets:smLink');
                    $xw->writeAttribute('LOCTYPE', 'URL');
                    $xw->writeAttributeNs('xlink', 'from',
                                          'http://www.w3.org/1999/xlink',
                                          $from);
                    $xw->writeAttributeNs('xlink', 'to',
                                          'http://www.w3.org/1999/xlink',
                                          $to);
                    $xw->endElement(); // </mets:smlink>
                }
                $xw->endElement(); // </mets:structLink>
            }
            $xw->endElement(); // </mets:structMap>
        }

        $xw->endElement(); // </mets:mets>

        echo $xw->outputMemory(true);
    }
}

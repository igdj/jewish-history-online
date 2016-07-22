<?php

namespace AppBundle\Utils;

/**
 *
 */
class Formatter
{

    /** No instances */
    private function __construct() {}

    public static function dateIncomplete($datestr, $locale = 'en')
    {
        $date_parts = preg_split('/\-/', $datestr);

        $date_parts_formatted = [];
        for ($i = 0; $i < count($date_parts); $i++) {
            if (0 == $date_parts[$i]) {
                break;
            }
            $date_parts_formatted[] = $date_parts[$i];
        }
        if (empty($date_parts_formatted)) {
            return '';
        }

        $separator = '.';
        if ('en' == $locale && count($date_parts_formatted) > 1) {
            $dateObj  = \DateTime::createFromFormat('!m', $date_parts_formatted[1]);
            $monthName = $dateObj->format('F'); // March
            $ret = [ $monthName ];
            if (count($date_parts_formatted) > 2) {
                $ret[] = $date_parts_formatted[2] . ','; // day
            }
            $ret[] = $date_parts_formatted[0]; // year
            return join(' ', $ret);
        }

        $date_parts_formatted = array_reverse($date_parts_formatted);

        return implode($separator, $date_parts_formatted);
    }
}

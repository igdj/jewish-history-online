<?php
/*
 * Verbatim copy of https://github.com/jalet/util-sprintf-php
 */
namespace TeiEditionBundle\Utils;


/**
 *
 */
class Sprintf
{

    private static $string;

    /** No instances */
    private function __construct() {}

    /**
     * Replace patterns in string with mathing value of array $args.
     *
     *     %key:bool:int% =>   1  |  0
     *     %key:bool:str% => true | false
     *
     *     %key:int%
     *     %key:float%
     *     %key:bool%
     *     %key%            * default
     *
     * @param  String $string String to be formated
     * @param  Array  $args   Key/value pairs
     * @return String         Formated string
     */
    public static function f($string, Array $args)
    {
        self::$string = $string;

        foreach ($args as $key => $val) {

            // Forced formatting for boolean values
            if (preg_match('%(?P<key>'.$key.'(?:\:bool\:(?P<format>int|str)))%', self::$string, $matches)) {
                self::$string = self::replace($matches['key'], $val, 'bool', $matches['format']);
                continue;
            }

            // Forced formatting for any value
            if (preg_match('%(?P<key>'.$key.'(?:\:(?P<format>\w+)))%', self::$string, $matches)) {
                self::$string = self::replace($matches['key'], $val, $matches['format']);
                continue;
            }

            // Just replace as is.
            self::$string = self::replace($key, $val);

        }

        return self::$string;
    }

    /**
     * [replace description]
     * @param  String $key      Pattern to replace
     * @param  String $val      The value to replace it with
     * @param  String $format   Format, int, float or bool. Will default to string
     * @param  String $output   Only used for :bool:int|str
     * @return String
     */
    private static function replace($key, $val, $format = 'string', $output = null)
    {
        switch ($format) {

            case 'int':
                $string = preg_replace('/%'.$key.'%/', intval($val), self::$string);
                break;

            case 'float':
                $string = preg_replace('/%'.$key.'%/', floatval($val), self::$string);
                break;

            case 'bool':
                $string = $output === 'str' ? preg_replace('/%'.$key.'%/', (bool) $val ? 'true' : 'false', self::$string)
                                            : preg_replace('/%'.$key.'%/', (bool) $val, self::$string);
                break;

            default:
                $string = preg_replace('/%'.$key.'%/', strval($val), self::$string);
                break;
        }

        return $string;
    }
}
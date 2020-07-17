<?php
/*
 *
 */
namespace TeiEditionBundle\Utils;

/**
 *
 */
class Iso639
{

    private static $languages = null;

    /** No instances */
    private function __construct() {}

    private static function getLanguages()
    {
        if (is_null(self::$languages)) {
            self::$languages = new \Gmo\Iso639\Languages();
        }

        return self::$languages;
    }

    /**
     * Convert two-letter ISO-639-1 to three-letter ISO-639-3 code
     *
     * @param  String $code1 code1
     * @return String        code3
     */
    public static function code1To3($code1)
    {
        $languages = self::getLanguages();
        $scriptAppend = '';
        if ('yl' == $code1) {
            // yl is our custom two-letter placeholder for yi-Latn
            $code1 = 'yi';
            $scriptAppend = '-Latn';
        }

        return $languages->findByCode1($code1)
            ->code3()
            . $scriptAppend;
    }

    /**
     * Convert three-letter ISO-639-2b to three-letter ISO-639-3 code
     *
     * @param  String $code2 code2
     * @return String        code3
     */
    public static function code2bTo3($code2)
    {
        $languages = self::getLanguages();

        return $languages->findByCode2b($code2)->code3();
    }

    /**
     *
     * Convert three-letter ISO-639-3 to two-letter ISO-639-1 code
     *
     * @param  String $code3 code3
     * @return String        code1
     */
    public static function code3To1($code3)
    {
        $languages = self::getLanguages();

        return $languages->findByCode3($code3)->code1();
    }

    /**
     *
     * Lookup name by three-letter ISO-639-3 code
     *
     * @param  String $code3 code3
     * @return String        name
     */
    public static function nameByCode3($code3)
    {
        $languages = self::getLanguages();

        return $languages->findByCode3($code3)->name();
    }
}

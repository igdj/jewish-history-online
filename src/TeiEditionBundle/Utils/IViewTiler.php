<?php
namespace TeiEditionBundle\Utils;

class IViewTiler
{
    var $tile_size = 256;

    function determineMaxZoom ($width, $height)
    {
        $currentWidth = $width;
        $currentHeight = $height;
        $factor = 2;

        $maxLevel = 0;
        while ($currentWidth > $this->tile_size || $currentHeight > $this->tile_size) {
            $currentWidth = round($width / $factor);
            $currentHeight = round($height / $factor);
            $factor *= 2;
            ++$maxLevel;
        }

        return $maxLevel;
    }
}

<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  version="2.0"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  xmlns:dta="urn:dta"
  exclude-result-prefixes="dta tei">


  <xsl:template name="applyRendition">
    <xsl:param name="class" select="'noClass'"/>
    <xsl:if test="@rend or @rendition or ($class != 'noClass' and normalize-space($class)!='')">
      <xsl:if test="@rend">
        <xsl:attribute name="title">
          <xsl:value-of select="@rend"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:attribute name="class">
        <xsl:choose>
          <xsl:when test="$class = 'noClass' or normalize-space($class)=''"/>
          <xsl:otherwise>
            <xsl:value-of select="$class"/>
            <xsl:if test="@rendition or @rend">
              <xsl:text> </xsl:text>
            </xsl:if>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="@rend">
          <xsl:value-of select="'dta-rend'"/>
          <xsl:if test="@rendition"><xsl:text> </xsl:text></xsl:if>
        </xsl:if>
        <xsl:choose>
          <xsl:when test="@rendition and contains(normalize-space(@rendition),' ')">
            <xsl:call-template name="splitRendition">
              <xsl:with-param name="value">
                <xsl:value-of select="normalize-space(@rendition)"/>
              </xsl:with-param>
            </xsl:call-template>
          </xsl:when>
          <xsl:when test="@rendition">
            <xsl:call-template name="findRendition">
              <xsl:with-param name="value">
                <xsl:value-of select="@rendition"/>
              </xsl:with-param>
            </xsl:call-template>
          </xsl:when>
        </xsl:choose>
      </xsl:attribute>
    </xsl:if>
  </xsl:template>

  <xsl:template name="splitRendition">
    <xsl:param name="value"/>
    <xsl:choose>
      <xsl:when test="$value=''"/>
      <xsl:when test="contains($value,' ')">
        <xsl:call-template name="findRendition">
          <xsl:with-param name="value">
            <xsl:value-of select="substring-before($value,' ')"/>
          </xsl:with-param>
        </xsl:call-template>
        <xsl:text> </xsl:text>
        <xsl:call-template name="splitRendition">
          <xsl:with-param name="value">
            <xsl:value-of select="substring-after($value,' ')"/>
          </xsl:with-param>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="findRendition">
          <xsl:with-param name="value" select="$value"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="findRendition">
    <xsl:param name="value"/>
    <xsl:choose>
      <xsl:when test="starts-with($value,'#')">
        <xsl:call-template name="transformRendition">
          <xsl:with-param name="value" select="substring-after($value,'#')"/>
        </xsl:call-template>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="transformRendition">
    <xsl:param name="value"/>
    <xsl:choose>
      <xsl:when test="contains($value,'Braced')">
        <xsl:value-of select="concat('dta-braced-',substring-before($value, 'Braced'))"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="concat('dta-', $value)"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- @prev/@next stuff -->
  <xsl:template name="applyPrev">
    <xsl:if test="@prev">
      <xsl:attribute name="data-prev"><xsl:value-of select="@prev"/></xsl:attribute>
    </xsl:if>
  </xsl:template>

  <xsl:template name="applyNext">
    <xsl:if test="@next">
      <xsl:attribute name="data-next"><xsl:value-of select="@next"/></xsl:attribute>
    </xsl:if>
  </xsl:template>

  <xsl:template name="applyXmlId">
    <xsl:if test="@xml:id">
      <xsl:attribute name="data-xmlid"><xsl:value-of select="@xml:id"/></xsl:attribute>
    </xsl:if>
  </xsl:template>
  <!-- end @prev/@next stuff -->

  <xsl:template name="addClass">
    <xsl:param name="value"/>
    <xsl:attribute name="class">
      <xsl:value-of select="$value"/>
      <xsl:text> </xsl:text>
    </xsl:attribute>
  </xsl:template>

  <xsl:variable name="specialChars">&#x9;&#xA;&#xD;&#x20;&#x21;</xsl:variable>
  <xsl:template name="escapeUnicode">
    <xsl:param name="str"/>
    <xsl:choose>
      <xsl:when test="string-length($str)=0"/>
      <xsl:when test="string-length($str)=1">
        <xsl:choose>
          <xsl:when test="contains($ascii, $str) or contains($latin1, $str) or contains($specialChars, $str)">
            <xsl:value-of select="$str"/>
          </xsl:when>
          <xsl:otherwise>
            <!-- TODO: add escaping here -->
            <!-- <xsl:text disable-output-escaping="yes">&amp;#</xsl:text> -->
            <xsl:value-of select="$str"/>
            <!-- <xsl:text>;</xsl:text>-->
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="escapeUnicode">
          <xsl:with-param name="str" select="substring($str,1,1)"/>
        </xsl:call-template>
        <xsl:call-template name="escapeUnicode">
          <xsl:with-param name="str" select="substring($str,2)"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>

  </xsl:template>

  <!--
	ISO-8859-1 based URL-encoding demo
	Written by Mike J. Brown, mike@skew.org.
	Updated 2002-05-20.

	No license; use freely, but credit me if reproducing in print.

	Also see http://skew.org/xml/misc/URI-i18n/ for a discussion of
	non-ASCII characters in URIs.

	Usage:

	<xsl:call-template name="url-decode">
		<xsl:with-param name="str" select="$url"/>
	</xsl:call-template>

	<xsl:call-template name="url-encode">
		<xsl:with-param name="str" select="$url"/>
	</xsl:call-template>

-->

  <xsl:variable name="hex" select="'0123456789ABCDEF'"/>
  <xsl:variable name="ascii"> !"#$%&amp;'()*+,-./0123456789:;&lt;=&gt;?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~</xsl:variable>
  <xsl:variable name="safe">!'()*-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz~</xsl:variable>
  <xsl:variable name="latin1">&#160;&#161;&#162;&#163;&#164;&#165;&#166;&#167;&#168;&#169;&#170;&#171;&#172;&#173;&#174;&#175;&#176;&#177;&#178;&#179;&#180;&#181;&#182;&#183;&#184;&#185;&#186;&#187;&#188;&#189;&#190;&#191;&#192;&#193;&#194;&#195;&#196;&#197;&#198;&#199;&#200;&#201;&#202;&#203;&#204;&#205;&#206;&#207;&#208;&#209;&#210;&#211;&#212;&#213;&#214;&#215;&#216;&#217;&#218;&#219;&#220;&#221;&#222;&#223;&#224;&#225;&#226;&#227;&#228;&#229;&#230;&#231;&#232;&#233;&#234;&#235;&#236;&#237;&#238;&#239;&#240;&#241;&#242;&#243;&#244;&#245;&#246;&#247;&#248;&#249;&#250;&#251;&#252;&#253;&#254;&#255;</xsl:variable>

  <xsl:template name="url-decode">
    <xsl:param name="str"/>

    <xsl:choose>
      <xsl:when test="contains($str,'%')">
        <xsl:value-of select="substring-before($str,'%')"/>
        <xsl:variable name="hexpair" select="translate(substring(substring-after($str,'%'),1,2),'abcdef','ABCDEF')"/>
        <xsl:variable name="decimal" select="(string-length(substring-before($hex,substring($hexpair,1,1))))*16 + string-length(substring-before($hex,substring($hexpair,2,1)))"/>
        <xsl:choose>
          <xsl:when test="$decimal &lt; 127 and $decimal &gt; 31">
            <xsl:value-of select="substring($ascii,$decimal - 31,1)"/>
          </xsl:when>
          <xsl:when test="$decimal &gt; 159">
            <xsl:value-of select="substring($latin1,$decimal - 159,1)"/>
          </xsl:when>
          <xsl:otherwise>?</xsl:otherwise>
        </xsl:choose>
        <xsl:call-template name="url-decode">
          <xsl:with-param name="str" select="substring(substring-after($str,'%'),3)"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$str"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>


  <xsl:template name="url-encode">
    <xsl:param name="str"/>
    <xsl:if test="$str">
      <xsl:variable name="first-char" select="substring($str,1,1)"/>
      <xsl:choose>
        <xsl:when test="contains($safe,$first-char)">
          <xsl:value-of select="$first-char"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:variable name="codepoint">
            <xsl:choose>
              <xsl:when test="contains($ascii,$first-char)">
                <xsl:value-of select="string-length(substring-before($ascii,$first-char)) + 32"/>
              </xsl:when>
              <xsl:when test="contains($latin1,$first-char)">
                <xsl:value-of select="string-length(substring-before($latin1,$first-char)) + 160"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:message terminate="no">Warning: string contains a character that is out of range! Substituting "?".</xsl:message>
                <xsl:text>63</xsl:text>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <xsl:variable name="hex-digit1" select="substring($hex,floor($codepoint div 16) + 1,1)"/>
          <xsl:variable name="hex-digit2" select="substring($hex,$codepoint mod 16 + 1,1)"/>
          <xsl:value-of select="concat('%',$hex-digit1,$hex-digit2)"/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:if test="string-length($str) &gt; 1">
        <xsl:call-template name="url-encode">
          <xsl:with-param name="str" select="substring($str,2)"/>
        </xsl:call-template>
      </xsl:if>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
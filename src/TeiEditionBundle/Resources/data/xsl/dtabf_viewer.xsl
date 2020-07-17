<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="tei"
  version="2.0">

<xsl:import href="dtabf_base.xsl"/>
<!-- TODO: switch to
<xsl:import href="dta-tools/dta-base.xsl"/>
<xsl:import href="dtabf_customize.xsl"/>
-->

<!-- copied over from dtabf_customize.xsl -->
  <!-- translate-layer -->
  <xsl:param name="lang" />
  <xsl:variable name="strings" select="document('translation.xml')/strings"/>

  <xsl:template name="translate">
   <xsl:param name="label" />
   <xsl:choose>
      <xsl:when test="$strings/string[@key=$label and @language=$lang]">
         <xsl:value-of select="$strings/string[@key=$label and @language=$lang]" />
      </xsl:when>
      <xsl:otherwise>
         <xsl:value-of select="$label" />
      </xsl:otherwise>
   </xsl:choose>
  </xsl:template>

  <!-- from http://www.deutschestextarchiv.de/basisformat_ms.rng -->
  <xsl:template match="tei:del">
    <xsl:element name="span">
      <xsl:call-template name="applyRendition"/>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

<xsl:output method="html" doctype-system="about:legacy-compat"/>

<xsl:template match="tei:TEI">
    <div id="{generate-id()}" class="text-layer"><xsl:apply-templates/></div>
    <script>initEntityGlossaryNote('#<xsl:value-of select="generate-id()" />')</script>
</xsl:template>

<!-- add support for @dir -->
<xsl:template match='tei:p'>
  <xsl:choose>
    <xsl:when test="ancestor::tei:sp and name(preceding-sibling::*[2]) != 'p'">
      <span class="dta-in-sp"><xsl:apply-templates/></span>
    </xsl:when>
    <xsl:when test="ancestor::tei:sp and local-name(preceding-sibling::node()[1]) != 'lb' and local-name(preceding-sibling::node()[1]) != 'pb'">
      <span class="dta-in-sp"><xsl:apply-templates/></span>
    </xsl:when>
    <xsl:when test="ancestor::tei:sp and local-name(preceding-sibling::node()[1]) = 'lb'">
      <p class="dta-p-in-sp-really"><xsl:apply-templates/></p>
    </xsl:when>
    <xsl:when test="@rendition">
      <p>
        <xsl:call-template name="applyRendition"/>
        <xsl:apply-templates/>
      </p>
    </xsl:when>
    <xsl:when test="@prev">
      <p class="dta-no-indent"><xsl:apply-templates/></p>
    </xsl:when>
    <xsl:otherwise>
      <p class="dta-p">
        <xsl:if test="@dir">
          <xsl:attribute name="dir"><xsl:value-of select="@dir"/></xsl:attribute>
        </xsl:if>
        <xsl:apply-templates/>
      </p>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- override poems to add support for @dir -->
<xsl:template match='tei:lg[@type="poem"]'>
  <div class="poem"><xsl:if test="@dir">
      <xsl:attribute name="dir"><xsl:value-of select="@dir"/></xsl:attribute>
    </xsl:if><xsl:apply-templates/></div>
</xsl:template>

<xsl:template match='tei:lg[not(@type="poem")]'>
  <div class="dta-lg"><xsl:if test="@dir">
      <xsl:attribute name="dir"><xsl:value-of select="@dir"/></xsl:attribute>
    </xsl:if><xsl:apply-templates/></div>
</xsl:template>
<!-- end poems -->

<xsl:template match='tei:ref'>
  <xsl:choose>
    <xsl:when test="@target">
      <xsl:choose>
        <xsl:when test="@type = 'editorialNote'">
          <a class="hoverTooltip glossary" href="#">
            <xsl:attribute name="data-title"><xsl:value-of select="substring(@target, 2)" /></xsl:attribute>
            <xsl:apply-templates/>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <a class="external">
            <xsl:attribute name="href"><xsl:value-of select="@target" /></xsl:attribute>
            <xsl:apply-templates/>
          </a>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:otherwise><xsl:apply-templates/></xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="tei:choice">
  <xsl:choose>
    <xsl:when test="./tei:reg">
      <xsl:element name="span">
        <xsl:attribute name="title"><!--Original: --><xsl:value-of select="tei:reg"/></xsl:attribute>
        <xsl:attribute name="class">dta-reg</xsl:attribute>
        <xsl:apply-templates select="tei:orig"/>
      </xsl:element>
    </xsl:when>
    <xsl:when test="./tei:abbr">
      <xsl:element name="span">
        <xsl:attribute name="title"><xsl:variable name="temp"><xsl:apply-templates select="tei:expan" mode="choice"/></xsl:variable><xsl:value-of select="normalize-space($temp)" /></xsl:attribute>
        <xsl:attribute name="class">dta-abbr</xsl:attribute>
        <xsl:apply-templates select="tei:abbr"/>
      </xsl:element>
    </xsl:when>
    <xsl:otherwise>
      <xsl:element name="span">
        <xsl:attribute name="title">Schreibfehler: <xsl:value-of select="tei:sic"/></xsl:attribute>
        <xsl:attribute name="class">dta-corr</xsl:attribute>
        <xsl:apply-templates select="tei:corr"/>
      </xsl:element>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- editorial notes -->
<xsl:template match='tei:note[@type="editorial"]'>
  <xsl:choose>
    <xsl:when test="@place='foot'"><a class="editorial-marker img-info-sign" href="#{concat($lang, generate-id())}">&#160;</a><span id="{concat($lang, generate-id())}" class="editorial foot"><xsl:apply-templates/></span>
    </xsl:when>
    <xsl:otherwise>
      <span class="editorial inline"><xsl:apply-templates/></span>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>


</xsl:stylesheet>

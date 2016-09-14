<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="tei"
  version="2.0">

<xsl:import href="dtabf_base.xsl"/>

<xsl:output method="html" doctype-system="about:legacy-compat"/>

<xsl:template match="tei:TEI">
    <div id="{generate-id()}" class="text-layer"><xsl:apply-templates/></div>
    <script>initEntityGlossaryNote('#<xsl:value-of select="generate-id()" />')</script>
</xsl:template>

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
    <xsl:when test="@place='foot'"><a class="editorial-marker img-info-sign" href="#{generate-id()}">&#160;</a><span id="{generate-id()}" class="editorial foot"><xsl:apply-templates/></span>
    </xsl:when>
    <xsl:otherwise>
      <span class="editorial inline"><xsl:apply-templates/></span>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>


</xsl:stylesheet>

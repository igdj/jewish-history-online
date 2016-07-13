<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="tei"
  version="2.0">

<xsl:import href="dtabf_base.xsl"/>

<xsl:output method="html" doctype-system="about:legacy-compat"/>

<xsl:template match="tei:TEI">
    <div class="text-layer"><xsl:apply-templates/></div>
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

</xsl:stylesheet>

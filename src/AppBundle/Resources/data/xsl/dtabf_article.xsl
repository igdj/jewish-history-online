<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="tei"
  version="2.0">

<xsl:import href="dtabf_base.xsl"/>

<xsl:output method="html" doctype-system="about:legacy-compat"/>

<xsl:template match="tei:TEI">
    <ul id="authors">
        <xsl:for-each select="./tei:teiHeader/tei:fileDesc/tei:titleStmt/tei:author/tei:persName">
          <li>
            <xsl:if test="@corresp">
              <xsl:attribute name="data-author-slug"><xsl:value-of select="@corresp" /></xsl:attribute>
            </xsl:if>
            <xsl:value-of select="text()" />
          </li>
        </xsl:for-each>
    </ul>
    <div class="article">
      <xsl:apply-templates/>
    </div>
    <xsl:if test="./tei:teiHeader/tei:fileDesc/tei:publicationStmt/tei:availability/tei:licence">
      <div id="license">
        <xsl:if test="./tei:teiHeader/tei:fileDesc/tei:publicationStmt/tei:availability/tei:licence/@target">
          <xsl:attribute name="data-target"><xsl:value-of select="./tei:teiHeader/tei:fileDesc/tei:publicationStmt/tei:availability/tei:licence/@target" /></xsl:attribute>
        </xsl:if>
        <xsl:apply-templates select="./tei:teiHeader/tei:fileDesc/tei:publicationStmt/tei:availability/tei:licence" />
      </div>
    </xsl:if>
</xsl:template>

<xsl:template match='tei:ref'>
  <xsl:choose>
    <xsl:when test="@target">
      <xsl:choose>
        <xsl:when test="@type = 'editorialNote'">
          <span class="glossary">
            <xsl:attribute name="data-title"><xsl:value-of select="substring(@target, 2)" /></xsl:attribute>
            <xsl:apply-templates/>
          </span>
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

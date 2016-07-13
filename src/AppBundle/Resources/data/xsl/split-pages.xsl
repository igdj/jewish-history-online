<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0"
  xmlns="http://www.tei-c.org/ns/1.0" xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="#all">

  <!--
    Idea for range from
    http://wiki.tei-c.org/index.php/BetweenPageBreaks
    See also http://wiki.tei-c.org/index.php/Split-teiCorpus

    saxon multipages.TEI-P5.xml split-pages.xsl
  -->
  <xsl:param name="outdir" required="yes"/>

  <!-- No output for main -->
  <xsl:output method="text"/>

  <!--
  Identity transform
  See http://en.wikipedia.org/wiki/Identity_transform#Using_XSLT
  -->
  <xsl:template match="@*|node()|comment()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()|comment()" />
    </xsl:copy>
  </xsl:template>

  <xsl:template match="tei:pb" mode="range">
    <xsl:param name="start"/>
    <xsl:param name="end"/>
    <xsl:if test="./@facs=$start/@facs">
      <xsl:copy><xsl:apply-templates select="@*" mode="range" /></xsl:copy>
    </xsl:if>
  </xsl:template>

  <xsl:template match="node()" mode="range">
    <xsl:param name="start"/>
    <xsl:param name="end"/>
    <!--
    Facs current: <xsl:value-of select="$start/@facs" />
    Facs next: <xsl:value-of select="$end/@facs" /> -->
    <xsl:if test="not(following::tei:pb[@facs=$start/@facs]) and not(preceding::tei:pb[@facs=$end/@facs])">
      <xsl:copy>
        <xsl:apply-templates select="@* | node()" mode="range">
          <xsl:with-param name="start" select="$start"/>
          <xsl:with-param name="end" select="$end"/>
        </xsl:apply-templates>
      </xsl:copy>
    </xsl:if>
  </xsl:template>

  <xsl:template match="@*" mode="range">
    <xsl:copy />
  </xsl:template>

  <!-- ignore teiHeader -->
  <xsl:template match="/tei:TEI/tei:teiHeader" />

  <!-- Match the /TEI/text element -->
  <xsl:template match="/tei:TEI/tei:text">
    <!-- Create a file, one item for each pb element -->
    <xsl:for-each select=".//tei:pb">
      <xsl:variable name="file">page-<xsl:value-of select="position()" />.xml</xsl:variable>
      <xsl:variable name="fileuri"><xsl:value-of select="$outdir" />/<xsl:value-of select="$file" /></xsl:variable>
      <!-- Output a result-document  -->
      <xsl:result-document method="xml" indent="yes" href="{$fileuri}">
        <TEI xmlns="http://www.tei-c.org/ns/1.0" xml:id="dtabf">
          <xsl:apply-templates select="/tei:TEI/tei:teiHeader"/>
          <xsl:apply-templates mode="range" select="ancestor::tei:text">
            <xsl:with-param name="start" select="."/>
            <xsl:with-param name="end" select="following::tei:pb[1]"/>
          </xsl:apply-templates>
        </TEI>
      </xsl:result-document>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
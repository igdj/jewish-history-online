<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="tei"
  version="2.0">

<xsl:import href="dta-tools/dta-base.xsl"/>
<xsl:import href="dtabf_customize.xsl"/>

<xsl:output method="html" doctype-system=""/>

  <!-- main match including source description -->
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
        <xsl:if test="/tei:TEI/tei:teiHeader/tei:fileDesc/tei:notesStmt/tei:note">
          <h2>Quellenbeschreibung</h2>
            <div class="source-description">
                <xsl:apply-templates select="/tei:TEI/tei:teiHeader/tei:fileDesc/tei:notesStmt/tei:note/node()"/>
            </div>
        </xsl:if>
        <xsl:apply-templates/>

        <xsl:if test='//tei:note[@place="foot"]'>
          <div class="dta-footnotesep"/>
          <h3>Anmerkungen</h3>
          <xsl:apply-templates select='//tei:note[@place="foot" and text()]' mode="footnotes"/>
        </xsl:if>
        <xsl:apply-templates select='//tei:fw[@place="bottom" and (text() or *)]' mode="signatures"/>
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

  <!-- begin footnotes -->
  <xsl:template match='tei:note[@place="foot"]'>
    <xsl:if test="string-length(@prev)=0">
      <a class="dta-fn-intext">
          <xsl:attribute name="name">note-<xsl:number level="any" count='//tei:note[@place="foot" and text()]' format="1"/>-marker</xsl:attribute>
          <xsl:attribute name="href">#note-<xsl:number level="any" count='//tei:note[@place="foot" and text()]' format="1"/></xsl:attribute>

        <!--<xsl:value-of select="@n"/>-->
        <xsl:number level="any" count='//tei:note[@place="foot" and text()]' format="[1]"/>
      </a>
      <xsl:text> </xsl:text>
    </xsl:if>
  </xsl:template>

  <!-- show at end -->
  <xsl:template  match='tei:note[@place="foot"]' mode="footnotes">
    <xsl:choose>
      <!-- occurance at the end (content of the endnote) -->
      <xsl:when test="string-length(.) &gt; 0">
        <xsl:choose>
          <!-- doesn't contain pagebreak -->
          <xsl:when test="local-name(*[1])!='pb'">
            <div class="dta-endnote dta-endnote-indent">
              <a class="dta-fn-sign">
                <xsl:attribute name="name">note-<xsl:number level="any" count='//tei:note[@place="foot" and text()]' format="1"/></xsl:attribute>
                <xsl:attribute name="href">#note-<xsl:number level="any" count='//tei:note[@place="foot" and text()]' format="1"/>-marker</xsl:attribute>
<!--                <xsl:value-of select="@n"/> -->
        <xsl:number level="any" count='//tei:note[@place="foot" and text()]' format="[1]"/>
              </a>
              <xsl:text> </xsl:text>
              <xsl:apply-templates/>
            </div>
          </xsl:when>
          <!-- contains pagebreak -->
          <xsl:otherwise>
            <div class="dta-endnote">
              <xsl:apply-templates/>
            </div>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <!-- occurence in text (link to the endnote) -->
      <xsl:otherwise>
        <span class="dta-fn-sign">
          <!--
          <xsl:value-of select="@n"/>
          -->
                  <xsl:number level="any" count='//tei:note[@place="foot" and text()]' format="[1]"/>

        </span>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- end end notes -->

</xsl:stylesheet>

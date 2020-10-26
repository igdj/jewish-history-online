<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="tei"
  version="2.0">

  <xsl:import href="dta-tools/dta-base.xsl"/>
  <xsl:import href="dtabf_customize.xsl"/>

  <!-- notes are placed 'perpage' for source and 'end' for topic/interpretation -->
  <xsl:param name="noteplacement" select="'end'" />

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
        <h2 class="source-description-head">
          <xsl:call-template name="translate">
            <xsl:with-param name="label" select="'Quellenbeschreibung'" />
          </xsl:call-template>
        </h2>
        <div class="source-description">
          <xsl:apply-templates select="/tei:TEI/tei:teiHeader/tei:fileDesc/tei:notesStmt/tei:note/node()"/>
        </div>
      </xsl:if>

      <xsl:apply-templates/>

      <xsl:if test='$noteplacement="end" and //tei:note[@place="foot" or @place="end"]'>
        <div class="dta-footnotesep"/>
          <div class="appendix">
          <h3 id="notes">
            <xsl:call-template name="translate">
              <xsl:with-param name="label" select="'Anmerkungen'" />
            </xsl:call-template>
          </h3>
          <xsl:apply-templates select='//tei:note[@place="foot" and (text() or *)]' mode="footnotes"/>
          <xsl:apply-templates select='//tei:note[@place="end" and (text() or *)]' mode="footnotes"/>
        </div>
      </xsl:if>

      <xsl:apply-templates select='//tei:fw[@place="bottom" and (text() or *)]' mode="signatures"/>
    </div>

    <xsl:choose>
      <xsl:when test="./tei:teiHeader/tei:fileDesc/tei:publicationStmt/tei:availability/tei:licence">
        <div id="license">
          <xsl:if test="./tei:teiHeader/tei:fileDesc/tei:publicationStmt/tei:availability/tei:licence/@target">
            <xsl:attribute name="data-target"><xsl:value-of select="./tei:teiHeader/tei:fileDesc/tei:publicationStmt/tei:availability/tei:licence/@target" /></xsl:attribute>
          </xsl:if>
          <xsl:apply-templates select="./tei:teiHeader/tei:fileDesc/tei:publicationStmt/tei:availability/tei:licence" />
        </div>
      </xsl:when>
      <xsl:otherwise>
        <xsl:if test="./tei:teiHeader/tei:fileDesc/tei:publicationStmt/tei:availability">
          <div id="license">
            <xsl:apply-templates select="./tei:teiHeader/tei:fileDesc/tei:publicationStmt/tei:availability" />
          </div>
        </xsl:if>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- put expansions in brackets for print -->
  <xsl:template match="tei:choice">
    <xsl:choose>
      <xsl:when test="./tei:reg">
        <xsl:element name="span">
          <xsl:attribute name="title">Original: <xsl:apply-templates select="tei:orig" mode="choice"/></xsl:attribute>
          <xsl:attribute name="class">dta-reg</xsl:attribute>
          <xsl:apply-templates select="tei:reg" mode="choice"/>
        </xsl:element>
      </xsl:when>
      <xsl:when test="./tei:abbr">
        <xsl:element name="span">
          <!--<xsl:attribute name="class">dta-abbr</xsl:attribute>-->
          <xsl:apply-templates select="tei:abbr" mode="choice"/> (<xsl:apply-templates select="tei:expan" mode="choice"/>)
        </xsl:element>
      </xsl:when>
      <xsl:when test="./tei:corr">
        <xsl:element name="span">
          <xsl:attribute name="title">Schreibfehler: <xsl:apply-templates select="tei:sic" mode="choice"/></xsl:attribute>
          <xsl:attribute name="class">dta-corr</xsl:attribute>
          <xsl:apply-templates select="tei:corr" mode="choice"/>
        </xsl:element>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template match='tei:ref'>
    <xsl:choose>
      <xsl:when test="@target != ''">
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
      <xsl:otherwise><xsl:value-of select="@target" /><xsl:apply-templates/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- renditions -->
  <xsl:template match="tei:hi|tei:del">
    <xsl:choose>
    <xsl:when test="contains(@rendition,'#right') or contains(@rendition,'#et') or ends-with(@rendition,'#c')">
        <!-- mpdf doesn't respect display:block for span,
        so we need to use <div> instead of <span>-->
        <xsl:element name="div">
          <xsl:call-template name="applyRendition"/>
          <xsl:apply-templates/>
        </xsl:element>
    </xsl:when>
    <xsl:otherwise>
        <xsl:element name="span">
          <xsl:call-template name="applyRendition"/>
          <xsl:apply-templates/>
        </xsl:element>
        </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- end renditions -->

  <!-- begin marginals -->
  <!-- mpdf doesn't respect display:block for span,
  so we need to use <div> instead of <span>-->
  <xsl:template match='tei:note[@place="right" and not(@type)]'>
    <xsl:value-of select="@n"/>
    <div class="dta-marginal dta-marginal-right">
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match='tei:note[@place="left" and not(@type)]'>
    <xsl:value-of select="@n"/>
    <div class="dta-marginal dta-marginal-left">
      <xsl:apply-templates/>
    </div>
  </xsl:template>
  <!-- end marginals -->

  <!-- begin footnotes -->
  <xsl:template match='tei:note[@place="foot"]'>
    <xsl:if test="string-length(@prev)=0">
      <a class="dta-fn-intext">
        <xsl:attribute name="name">note-<xsl:number level="any" count='//tei:note[@place="foot" and (text() or *)]' format="1"/>-marker</xsl:attribute>
        <xsl:attribute name="href">#note-<xsl:number level="any" count='//tei:note[@place="foot" and (text() or *)]' format="1"/></xsl:attribute>
        <xsl:choose>
          <!-- manually numbered -->
          <xsl:when test="@n">
            <xsl:value-of select="@n"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:choose>
              <xsl:when test="$noteplacement = 'perpage'">
                <xsl:number level="any" count='//tei:note[@place="foot" and (text() or *) and not(@n)]' format="a"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:number level="any" count='//tei:note[@place="foot" and (text() or *) and not(@n)]' format="[1]"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:otherwise>
        </xsl:choose>
      </a>
      <!--<xsl:text> </xsl:text>-->
    </xsl:if>
  </xsl:template>

  <xsl:template match='tei:note[@place="end"]'>
    <a class="dta-fn-intext">
      <xsl:attribute name="name">endnote-<xsl:number level="any" count='//tei:note[@place="end" and (text() or *)]' format="1"/>-marker</xsl:attribute>
      <xsl:attribute name="href">#endnote-<xsl:number level="any" count='//tei:note[@place="end" and (text() or *)]' format="1"/></xsl:attribute>
      <xsl:choose>
        <!-- manually numbered -->
        <xsl:when test="@n">
          <xsl:value-of select="@n"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:number level="any" count='//tei:note[@place="end" and (text() or *) and not(@n)]' format="[I]"/>
        </xsl:otherwise>
      </xsl:choose>
    </a>
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
                <xsl:attribute name="name">note-<xsl:number level="any" count='//tei:note[@place="foot" and (text() or *)]' format="1"/></xsl:attribute>
                <xsl:attribute name="href">#note-<xsl:number level="any" count='//tei:note[@place="foot" and (text() or *)]' format="1"/>-marker</xsl:attribute>
                <xsl:choose>
                  <!-- manually numbered -->
                  <xsl:when test="@n">
                    <xsl:value-of select="@n"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:choose>
                      <xsl:when test="$noteplacement = 'perpage'">
                        <xsl:number level="any" count='//tei:note[@place="foot" and (text() or *) and not(@n)]' format="a"/>
                      </xsl:when>
                      <xsl:otherwise>
                        <xsl:number level="any" count='//tei:note[@place="foot" and (text() or *) and not(@n)]' format="[1]"/>
                      </xsl:otherwise>
                    </xsl:choose>
                  </xsl:otherwise>
                </xsl:choose>
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

  <xsl:template match='tei:note[@place="end"]' mode="footnotes">
    <div class="dta-endnote dta-endnote-indent">
      <a class="dta-fn-sign">
        <xsl:attribute name="name">endnote-<xsl:number level="any" count='//tei:note[@place="end" and (text() or *)]' format="1"/></xsl:attribute>
        <xsl:attribute name="href">#endnote-<xsl:number level="any" count='//tei:note[@place="end" and (text() or *)]' format="1"/>-marker</xsl:attribute>
        <xsl:choose>
          <!-- manually numbered -->
          <xsl:when test="@n">
            <xsl:value-of select="@n"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:number level="any" count='//tei:note[@place="end" and (text() or *) and not(@n)]' format="[I]"/>
          </xsl:otherwise>
        </xsl:choose>
      </a>
      <xsl:text> </xsl:text>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <!-- inline notes -->
  <xsl:template match='tei:note[@place="inline"]'>
    <span class="inline">
      <xsl:if test="@type='editorial'">
        <xsl:attribute name="class">editorial inline</xsl:attribute>
      </xsl:if>
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <!-- copied from dtabf_base.xsl to act as in dtabf_viewer.xsl -->

  <!-- we don't separate note-handling -->
  <xsl:template match="tei:text[not(descendant::tei:text)]">
    <xsl:apply-templates/>
    <xsl:if test='$noteplacement="perpage"'>
      <!-- notes for the last page -->
      <div style="height: 24px; width: 36px" />
      <xsl:for-each select="//tei:note[@place='foot' and string-length(@prev) > 0][not(./following::tei:pb)]">
        <xsl:apply-templates select="." mode="footnotes"/>
      </xsl:for-each>
      <xsl:for-each select="//tei:note[@place='foot' and string-length(@prev) = 0][not(./following::tei:pb)]">
        <xsl:apply-templates select="." mode="footnotes"/>
      </xsl:for-each>
    </xsl:if>
    <xsl:apply-templates select='//tei:fw[@place="bottom" and (text() or *)]' mode="signatures"/>
  </xsl:template>

  <xsl:template match='tei:pb'>
    <xsl:variable name="thisSite" select="."/>
    <xsl:if test="preceding::tei:note[@place='foot'][./preceding::tei:pb[. is $thisSite/preceding::tei:pb[1]]]">
      <div class="endnotes-wrapper" style="display:block">
        <div style="height: 24px; width: 36px" />
        <xsl:for-each select="preceding::tei:note[@place='foot' and string-length(@prev) > 0][./preceding::tei:pb[. is $thisSite/preceding::tei:pb[1]]]">
          <xsl:apply-templates select="." mode="footnotes"/>
        </xsl:for-each>
        <xsl:for-each select="preceding::tei:note[@place='foot' and string-length(@prev) = 0][./preceding::tei:pb[. is $thisSite/preceding::tei:pb[1]]]">
          <xsl:apply-templates select="." mode="footnotes"/>
        </xsl:for-each>
      </div>
    </xsl:if>
    <div class="dta-pb" style="margin-top: 2em; padding-left:15em">|<xsl:value-of select="@facs"/><xsl:if test="@n"> : <xsl:value-of select="@n"/></xsl:if>|</div>
    <br />
  </xsl:template>

  <!-- adapted from dtabf_base.xsl, expand for print -->
  <xsl:template match="tei:choice">
    <xsl:choose>
      <xsl:when test="./tei:reg">
        <xsl:apply-templates select="tei:orig"/>
        <xsl:element name="span">
          <xsl:attribute name="class">dta-reg</xsl:attribute>
          [<xsl:value-of select="tei:reg"/>]
        </xsl:element>
      </xsl:when>
      <xsl:when test="./tei:abbr">
      <xsl:apply-templates select="tei:abbr"/>
        <xsl:element name="span">
          <xsl:attribute name="class">dta-abbr</xsl:attribute>
          [<xsl:variable name="temp"><xsl:apply-templates select="tei:expan" mode="choice"/></xsl:variable><xsl:value-of select="normalize-space($temp)" />]
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

</xsl:stylesheet>

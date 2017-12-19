<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="tei"
  version="2.0">

<xsl:import href="dta-tools/dta-base.xsl"/>
<xsl:import href="dtabf_customize.xsl"/>

<xsl:output method="html" doctype-system=""/>

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

<xsl:template match='tei:note[@type="editorial"]'>
  <xsl:choose>
    <xsl:when test="@place='foot'"><a class="editorial-marker img-info-sign" href="#{generate-id()}">&#160;</a><span id="{generate-id()}" class="editorial foot"><xsl:apply-templates/></span>
    </xsl:when>
    <xsl:otherwise>
      <span class="editorial inline"><xsl:apply-templates/></span>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match='tei:note[@place="foot" and @type="editorial"]' mode="footnotes">
<!-- we show these inline -->
</xsl:template>

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
          <xsl:attribute name="title"><xsl:variable name="temp"><xsl:apply-templates select="tei:expan" mode="choice"/></xsl:variable><xsl:value-of select="normalize-space($temp)" /></xsl:attribute>
          <xsl:attribute name="class">dta-abbr</xsl:attribute>
          <xsl:apply-templates select="tei:abbr" mode="choice"/>
        </xsl:element>
      </xsl:when>
      <xsl:when test="./tei:corr">
        <xsl:element name="span">
          <xsl:attribute name="title"><xsl:call-template name="translate">
              <xsl:with-param name="label" select="'Schreibfehler'" />
            </xsl:call-template>: <xsl:apply-templates select="tei:sic" mode="choice"/></xsl:attribute>
          <xsl:attribute name="class">dta-corr</xsl:attribute>
          <xsl:apply-templates select="tei:corr" mode="choice"/>
        </xsl:element>
      </xsl:when>
    </xsl:choose>
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

<!-- dbu: add a section-id for ToC -->
  <xsl:template name="applyRendition">
    <xsl:param name="class" select="'noClass'"/>
    <xsl:param name="id" select="''"/>
    <xsl:if test="@rend or @rendition or ($id != '') or ($class != 'noClass' and normalize-space($class)!='')">
      <xsl:if test="@rend">
        <xsl:attribute name="title">
          <xsl:value-of select="@rend"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="$id">
        <xsl:attribute name="id">
          <xsl:value-of select="$id"/>
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

  <xsl:template match="tei:head">
    <xsl:choose>
      <!-- if embedded in a <figure>: create span (figdesc) -->
      <xsl:when test="ancestor::tei:figure">
        <span>
          <xsl:call-template name="applyRendition">
            <xsl:with-param name="class" select="'dta-figdesc'"/>
          </xsl:call-template>
          <xsl:apply-templates/>
        </span>
      </xsl:when>
      <!-- if embedded in a <list> or child of <lg>: create div-block (dta-head) -->
      <xsl:when test="ancestor::tei:list or parent::tei:lg">
        <div>
          <xsl:call-template name="applyRendition">
            <xsl:with-param name="class" select="'dta-head'"/>
          </xsl:call-template>
          <xsl:apply-templates/>
        </div>
      </xsl:when>
      <!-- if no <lb/> at the end or after the head: embed directly -->
      <xsl:when
        test="(local-name(./*[position()=last()]) != 'lb' or normalize-space(./tei:lb[position()=last()]/following-sibling::text()[1]) != '') and local-name(following::*[1]) != 'lb'">
        <xsl:apply-templates/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:choose> <!-- TODO: why the second choose? -->
          <xsl:when test="parent::tei:div/@n or parent::tei:div">
            <xsl:choose>
              <!-- if the embedding div-block's n-attribute is greater 6 or does not exist: create div-block (dta-head)  -->
              <xsl:when test="parent::tei:div/@n > 6 or not(parent::tei:div/@n)">
                <div>
                  <xsl:call-template name="applyRendition">
                    <xsl:with-param name="class" select="'dta-head'"/>
                  </xsl:call-template>
                  <xsl:apply-templates/>
                </div>
              </xsl:when>
              <!-- if the embedding div-block's n-attribute is lesser than 7: create h(@n)-block -->
              <xsl:otherwise>
                <xsl:element name="h{parent::tei:div/@n}">
                  <xsl:call-template name="applyRendition">
                    <xsl:with-param name="class" select="'dta-head'"/>
                    <xsl:with-param name="id">section-<xsl:value-of select="count(../preceding-sibling::tei:div) + 1"/></xsl:with-param>
                  </xsl:call-template>
                  <xsl:apply-templates/>
                </xsl:element>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:when>
          <!-- WARNING: never used (because of xsl:when test="ancestor::tei:list above -->
          <xsl:when test="parent::tei:list">
            <xsl:apply-templates/>
          </xsl:when>
          <!-- default -->
          <xsl:otherwise>
            <h2>
              <xsl:call-template name="applyRendition"/>
              <xsl:apply-templates/>
            </h2>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>


<!-- copied from dtabf_base.xsl to act as in dtabf_viewer.xsl -->
<xsl:template match='tei:pb'>
  <xsl:variable name="thisSite" select="."/>
  <xsl:if test="preceding::tei:note[@place='foot'][./preceding::tei:pb[. is $thisSite/preceding::tei:pb[1]]]">
    <span style="display:block; margin-left:1em">
      <xsl:for-each select="preceding::tei:note[@place='foot' and string-length(@prev) > 0][./preceding::tei:pb[. is $thisSite/preceding::tei:pb[1]]]">
        <xsl:apply-templates select="." mode="footnotes"/>
      </xsl:for-each>
      <xsl:for-each select="preceding::tei:note[@place='foot' and string-length(@prev) = 0][./preceding::tei:pb[. is $thisSite/preceding::tei:pb[1]]]">
        <xsl:apply-templates select="." mode="footnotes"/>
      </xsl:for-each>
    </span>
  </xsl:if>
  <span class="dta-pb" style="padding-left:15em">|<xsl:value-of select="@facs"/><xsl:if test="@n"> : <xsl:value-of select="@n"/></xsl:if>|</span>
  <br />
</xsl:template>

</xsl:stylesheet>

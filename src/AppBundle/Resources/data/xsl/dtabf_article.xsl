<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="tei"
  version="2.0">

<xsl:import href="dtabf_base.xsl"/>

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

<xsl:template match="tei:choice">
  <xsl:choose>
    <xsl:when test="./tei:reg">
      <xsl:element name="span">
        <xsl:attribute name="title">Original: <xsl:value-of select="tei:orig"/></xsl:attribute>
        <xsl:attribute name="class">dta-reg</xsl:attribute>
        <xsl:apply-templates select="tei:reg"/>
      </xsl:element>
    </xsl:when>
    <xsl:when test="./tei:abbr">
      <xsl:element name="span">
        <xsl:attribute name="title"><xsl:value-of select="tei:expan"/></xsl:attribute>
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

<xsl:template match='tei:figure'>
  <xsl:choose>
    <xsl:when test="tei:media/@mimeType='audio/mpeg'">
      <!-- custom code for audio/video -->
      <audio controls="controls">
        <source>
          <xsl:attribute name="src"><xsl:value-of select='tei:media/@url' /></xsl:attribute>
          <xsl:attribute name="type"><xsl:value-of select='tei:media/@mimeType' /></xsl:attribute>
        </source>
      </audio>
      <xsl:if test="tei:figDesc"><xsl:text> </xsl:text><xsl:apply-templates select="tei:figDesc" mode="figdesc"/></xsl:if>
    </xsl:when>
    <xsl:when test="tei:media/@mimeType='video/mp4'">
      <!-- custom code for audio/video -->
      <div class="embed-responsive embed-responsive-16by9">
      <video controls="controls" preload="none" class="embed-responsive-item">
        <source>
          <xsl:attribute name="src"><xsl:value-of select='tei:media/@url' /></xsl:attribute>
          <xsl:attribute name="type"><xsl:value-of select='tei:media/@mimeType' /></xsl:attribute>
        </source>
      </video>
      </div>
      <xsl:if test="tei:figDesc"><xsl:text> </xsl:text><xsl:apply-templates select="tei:figDesc" mode="figdesc"/></xsl:if>
    </xsl:when>
    <xsl:when test="(local-name(preceding-sibling::node()[1]) = 'lb' and local-name(following-sibling::node()[1]) = 'lb') or @rendition='#c'">
      <xsl:element name="div">
        <xsl:attribute name="class">phbl dta-figure</xsl:attribute>
        <xsl:attribute name="type"><xsl:value-of select="count(preceding::tei:figure)+1"/></xsl:attribute>
        <xsl:if test="@rendition='#c'">
          <xsl:attribute name="style">text-align:center</xsl:attribute>
        </xsl:if>
        <xsl:if test="@facs">
          <xsl:element name="img">
            <xsl:attribute name="src"><xsl:value-of select="@facs"/></xsl:attribute>
          </xsl:element><br />
        </xsl:if>
        [<xsl:choose>
          <xsl:when test="@type='notatedMusic'">Musik</xsl:when>
          <xsl:otherwise>Abbildung</xsl:otherwise>
        </xsl:choose>
        <xsl:if test="tei:figDesc"><xsl:text> </xsl:text><xsl:apply-templates select="tei:figDesc" mode="figdesc"/></xsl:if>]
        <xsl:apply-templates/>
      </xsl:element>
    </xsl:when>
    <xsl:otherwise>
      <xsl:element name="span">
        <xsl:attribute name="class">ph dta-figure</xsl:attribute>
        <xsl:attribute name="type"><xsl:value-of select="count(preceding::tei:figure)+1"/></xsl:attribute>
        <xsl:if test="@facs">
          <xsl:element name="img">
            <xsl:attribute name="class">img-responsive</xsl:attribute>
            <xsl:attribute name="src"><xsl:value-of select="@facs"/></xsl:attribute>
          </xsl:element><br />
        </xsl:if>
        <!--[<xsl:choose>
          <xsl:when test="@type='notatedMusic'">Musik</xsl:when>
          <xsl:otherwise>Abbildung</xsl:otherwise>
        </xsl:choose>-->
        <xsl:if test="tei:figDesc"><xsl:text> </xsl:text><xsl:apply-templates select="tei:figDesc" mode="figdesc"/></xsl:if><!--]-->
        <xsl:apply-templates/>
      </xsl:element>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

</xsl:stylesheet>

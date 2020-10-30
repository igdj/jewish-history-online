<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="tei"
  version="2.0">

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

  <xsl:template match='tei:gap'>
    <span class="gap">
      <xsl:text>[</xsl:text>
      <xsl:if test="@reason='lost'"><xsl:call-template name="translate">
        <xsl:with-param name="label" select="'verlorenes Material'" />
      </xsl:call-template></xsl:if>
      <xsl:if test="@reason='insignificant'"><span><xsl:attribute name="title">
          <xsl:call-template name="translate">
              <xsl:with-param name="label" select="'irrelevantes Material'" />
          </xsl:call-template>
        </xsl:attribute>&#x2026;</span></xsl:if>
      <xsl:if test="@reason='fm'">fremdsprachliches Material</xsl:if>
      <xsl:if test="@reason='illegible'"><xsl:call-template name="translate">
                <xsl:with-param name="label" select="'unleserliches Material'" />
      </xsl:call-template></xsl:if>
      <xsl:if test="@unit"><xsl:text> – </xsl:text></xsl:if>
      <xsl:choose>
        <xsl:when test="@unit">
          <xsl:if test="@quantity">
            <xsl:value-of select="@quantity"/><xsl:text> </xsl:text>
          </xsl:if>
          <xsl:choose>
            <xsl:when test="@unit='pages' and @quantity!=1">Seiten</xsl:when>
            <xsl:when test="@unit='pages' and @quantity=1">Seite</xsl:when>
            <xsl:when test="@unit='lines' and @quantity!=1">Zeilen</xsl:when>
            <xsl:when test="@unit='lines' and @quantity=1">Zeile</xsl:when>
            <xsl:when test="@unit='words' and @quantity!=1">Wörter</xsl:when>
            <xsl:when test="@unit='words' and @quantity=1">Wort</xsl:when>
            <xsl:when test="@unit='chars'">Zeichen</xsl:when>
          </xsl:choose>
          <xsl:text> fehl</xsl:text>
          <xsl:if test="@quantity=1 or not(@quantity)">t</xsl:if>
          <xsl:if test="@quantity!=1">en</xsl:if>
        </xsl:when>
      </xsl:choose>
      <xsl:text>]</xsl:text>
    </span>
  </xsl:template>

  <xsl:template match="tei:foreign">
    <span class="dta-foreign">
     <xsl:if test="@dir">
       <xsl:attribute name="dir"><xsl:value-of select="@dir"/></xsl:attribute>
     </xsl:if>
     <xsl:attribute name="title">
        <xsl:call-template name="translate">
            <xsl:with-param name="label" select="'fremdsprachliches Material'" />
        </xsl:call-template>
     </xsl:attribute>
     <xsl:choose>
      <xsl:when test="@xml:lang">
        <xsl:attribute name="xml:lang">
          <xsl:value-of select="@xml:lang"/>
        </xsl:attribute>
        <xsl:choose>
          <xsl:when test="not(child::*) and not(child::text())">
            <xsl:text>FM: </xsl:text>
            <xsl:choose>
              <xsl:when test="@xml:lang='he' or @xml:lang='heb' or @xml:lang='hbo'">
                <xsl:text>hebräisch</xsl:text>
              </xsl:when>
              <xsl:when test="@xml:lang='el' or @xml:lang='grc' or @xml:lang='ell'">
                <xsl:text>griechisch</xsl:text>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="@xml:lang"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
       <xsl:otherwise>
         <xsl:apply-templates/>
       </xsl:otherwise>
     </xsl:choose>
    </span>
  </xsl:template>

  <xsl:template match='tei:cb'>
    <div class="dta-cb">
      <xsl:choose>
        <xsl:when test="@type='start'">[<xsl:call-template name="translate">
                <xsl:with-param name="label" select="'Beginn Spaltensatz'" />
      </xsl:call-template>]</xsl:when>
        <xsl:when test="@type='end'">[<xsl:call-template name="translate">
                <xsl:with-param name="label" select="'Ende Spaltensatz'" />
      </xsl:call-template>]</xsl:when>
        <xsl:otherwise>[<xsl:call-template name="translate">
                <xsl:with-param name="label" select="'Spaltenumbruch'" />
      </xsl:call-template>]</xsl:otherwise>
      </xsl:choose>
    </div>
  </xsl:template>

  <xsl:template match="tei:quote">
    <blockquote class="dta-quote">
      <xsl:apply-templates/>
    </blockquote>
  </xsl:template>

  <!-- we do separate note-handling -->
  <xsl:template match="tei:text[not(descendant::tei:text)]">
    <xsl:apply-templates/>
    <!--
    <xsl:if test='//tei:note[@place="foot"]'>
      <div class="dta-footnotesep"/>
      <xsl:apply-templates select='//tei:note[@place="foot" and text()]' mode="footnotes"/>
    </xsl:if>
    <xsl:apply-templates select='//tei:fw[@place="bottom" and (text() or *)]' mode="signatures"/>
    -->
  </xsl:template>

  <!-- add shared overrides and extensions to the dtabf-base rules -->
  <xsl:template match="tei:sic">
    <xsl:apply-templates/> [sic]<!--
--></xsl:template>

  <xsl:template match='tei:persName'>
    <xsl:call-template name="entity-ref">
      <xsl:with-param name="value">
        <xsl:value-of select="@ref"/>
      </xsl:with-param>
      <xsl:with-param name="type">person</xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match='tei:placeName'>
    <xsl:call-template name="entity-ref">
      <xsl:with-param name="value">
        <xsl:value-of select="@ref"/>
      </xsl:with-param>
      <xsl:with-param name="type">place</xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match='tei:orgName'>
    <xsl:call-template name="entity-ref">
      <xsl:with-param name="value">
        <xsl:value-of select="@ref"/>
      </xsl:with-param>
      <xsl:with-param name="type">organization</xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="tei:date">
    <xsl:call-template name="entity-ref">
      <xsl:with-param name="value">
        <xsl:value-of select="@corresp"/>
      </xsl:with-param>
      <xsl:with-param name="type">date</xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template name="entity-ref">
    <xsl:param name="value"/>
    <xsl:param name="type"/>
    <xsl:choose>
      <xsl:when test="$value and (starts-with($value,'http') or starts-with($value,'geo:'))">
        <xsl:element name="span">
          <xsl:attribute name="class">entity-ref</xsl:attribute>
          <xsl:attribute name="data-type"><xsl:value-of select="$type" /></xsl:attribute>
          <xsl:attribute name="data-uri">
            <xsl:choose>
              <xsl:when test="contains($value,' ')">
                <xsl:value-of select="substring-before($value,' ')"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="$value"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
          <xsl:apply-templates/>
        </xsl:element>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="tei:bibl">
    <span>
      <xsl:if test="@corresp">
        <xsl:attribute name="data-corresp" select="@corresp" />
      </xsl:if>
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-bibl'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </span>
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

  <!-- override version from dta-base.xsl to add support for @dir -->
  <xsl:template match="tei:p">
   <xsl:choose>
     <xsl:when test="ancestor::tei:sp">
       <xsl:variable name="class">
         <xsl:choose>
           <xsl:when test="@prev">dta-p-in-sp dta-no-indent</xsl:when>
           <xsl:when test="descendant::tei:pb">dta-p-in-sp dta-no-indent</xsl:when>
           <xsl:otherwise>dta-p-in-sp</xsl:otherwise>
         </xsl:choose>
       </xsl:variable>
       <span>
         <xsl:call-template name="applyRendition">
           <xsl:with-param name="class" select="$class"/>
         </xsl:call-template>
         <xsl:apply-templates/>
       </span>
     </xsl:when>
     <xsl:otherwise>
       <xsl:variable name="class">
         <xsl:choose>
           <xsl:when test="descendant::tei:pb">dta-p dta-no-indent</xsl:when>
           <xsl:when test="@prev">dta-p dta-no-indent</xsl:when>
           <xsl:otherwise>dta-p</xsl:otherwise>
         </xsl:choose>
       </xsl:variable>
       <p>
         <xsl:if test="@dir">
          <xsl:attribute name="dir"><xsl:value-of select="@dir"/></xsl:attribute>
         </xsl:if>
         <xsl:call-template name="applyRendition">
           <xsl:with-param name="class"><xsl:value-of select="$class" /><xsl:if test="@dir"> dta-p-<xsl:value-of select="@dir"></xsl:value-of></xsl:if></xsl:with-param>
         </xsl:call-template>
         <xsl:apply-templates/>
       </p>
     </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match='tei:figure'>
    <xsl:choose>
      <xsl:when test="tei:media/@mimeType='audio/mpeg'">
        <!-- custom code for audio/video -->
        <audio controls="controls">
          <xsl:if test="@facs">
              <xsl:attribute name="class">bootstrap3</xsl:attribute>
              <xsl:attribute name="data-info-album-art"><xsl:value-of select='@facs' /></xsl:attribute>
              <xsl:if test="tei:figDesc">
                  <xsl:attribute name="data-info-album-art-caption">
                      <xsl:apply-templates select="tei:figDesc" mode="figdesc"/>
                  </xsl:attribute>
              </xsl:if>
          </xsl:if>
          <source>
            <xsl:attribute name="src"><xsl:value-of select='tei:media/@url' /></xsl:attribute>
            <xsl:attribute name="type"><xsl:value-of select='tei:media/@mimeType' /></xsl:attribute>
          </source>
        </audio>
        <xsl:if test="not(@facs)">
          <xsl:if test="tei:figDesc"><xsl:text> </xsl:text><xsl:apply-templates select="tei:figDesc" mode="figdesc"/></xsl:if>
        </xsl:if>
      </xsl:when>
      <xsl:when test="tei:media/@mimeType='model/stl'">
        <!-- custom code for object to be passed on to three.js -->
        <div class="embed-responsive">
        <object>
          <!--
          <xsl:if test="@facs">
            <xsl:attribute name="data-poster"><xsl:value-of select='@facs' /></xsl:attribute>
          </xsl:if>
          -->
          <xsl:attribute name="data"><xsl:value-of select='tei:media/@url' /></xsl:attribute>
          <xsl:attribute name="type"><xsl:value-of select='tei:media/@mimeType' /></xsl:attribute>
        </object>
        </div>
        <xsl:if test="tei:figDesc"><xsl:text> </xsl:text><xsl:apply-templates select="tei:figDesc" mode="figdesc"/></xsl:if>
      </xsl:when>
      <xsl:when test="tei:media/@mimeType='video/mp4'">
        <!-- custom code for audio/video -->
        <div class="embed-responsive embed-responsive-16by9">
        <video controls="controls" preload="none" class="embed-responsive-item">
          <xsl:if test="@facs">
            <xsl:attribute name="poster"><xsl:value-of select='@facs' /></xsl:attribute>
          </xsl:if>
          <source>
            <xsl:attribute name="src"><xsl:value-of select='tei:media/@url' /></xsl:attribute>
            <xsl:attribute name="type"><xsl:value-of select='tei:media/@mimeType' /></xsl:attribute>
          </source>
        </video>
        </div>
        <xsl:if test="tei:figDesc"><xsl:text> </xsl:text><xsl:apply-templates select="tei:figDesc" mode="figdesc"/></xsl:if>
      </xsl:when>
      <xsl:when test="tei:media/@mimeType='text/html'">
        <!-- custom code for iframe -->
        <div class="embed-responsive embed-responsive-4by3"><!-- todo: get from width/height -->
        <iframe class="embed-responsive-item" allowFullScreen="allowFullScreen">
          <xsl:attribute name="src"><xsl:value-of select='tei:media/@url' /></xsl:attribute>
        </iframe>
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
        <xsl:element name="div">
          <xsl:attribute name="class">ph dta-figure</xsl:attribute>
          <xsl:attribute name="type"><xsl:value-of select="count(preceding::tei:figure)+1"/></xsl:attribute>
          <xsl:if test="@facs">
            <xsl:element name="img">
              <!--<xsl:attribute name="class">img-responsive</xsl:attribute>-->
              <xsl:attribute name="src"><xsl:value-of select="@facs"/></xsl:attribute>
            </xsl:element><!--<br />-->
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

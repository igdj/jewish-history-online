<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="tei"
  version="2.0">

<!--
<xsl:output method="html"
  doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
  doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" indent="yes"/>-->
<xsl:output method="html" doctype-system="about:legacy-compat"/>

<xsl:template match="tei:TEI">
  <html>
    <head>
      <meta http-equiv="content-type" content="text/html; charset=UTF-8" />

      <!-- dbu -->
      <xsl:apply-templates select=".//tei:titleStmt" mode="head" />
      <link rel="stylesheet" type="text/css" href="./vendor/tooltipster-master/css/tooltipster.css" />
      <script type="text/javascript" src="./script/jquery-1.11.0.min.js"></script>
      <script type="text/javascript" src="./vendor/tooltipster-master/js/jquery.tooltipster.min.js"></script>
      <script>
        $(document).ready(function() {
            $('.editorial-marker').each(function( index ) {
              var id_sel = $( this ).attr('href');
              $(this).tooltipster({
                content: $('<span>' + $(id_sel).html() + '</span>'),
                interactive: true
              });
            });
        });
      </script>

      <style type="text/css">
        body { font-size:14pt; margin-left:1em; margin-right:1em; max-width:1000px }
        .head  { text-align:center; font-size:1.2em; margin-top:1em }
        .dta-head  { text-align:center; font-size:1.2em; margin-bottom:.5em }

        .fw-top          { text-align:center; margin-bottom:2em; color:#666 }
        .fw-pageNum      { display:none }
        .fw-bottom-sig   { margin-top:1em; font-size:.8em; color:#666 }
        .fw-bottom-catch { text-align:right; margin-top:1em; margin-right:1em; font-size:.8em; color:#666 }

        /* quote mess */
        blockquote:before, blockquote:after, q:before, q:after {
          /* see http://www.paulchaplin.com/blog/css-reset-and-quirky-quotes */
          content:""; content:none;
        }

        /* place holders */
        .ph, .phbl { color:#666 }
        .phbl      { display:block; text-align:center }

        .titlepage   { text-align:center }
        .byline      { font-size:.9em; margin:1em 0 }
        .dta-anzeige { color:#aaa }
        .dedication  { padding-left:2em }

        .footnote       { color:#333; font-size:.8em; margin-top:.5em; margin-left:1em }
        .endnote        { color:#333; font-size:.8em; margin-top:.5em; margin-bottom:.5em }
        .endnote-indent { text-indent:1em }
        .fn-intext      { vertical-align:super; font-size:.8em }
        .fn-sign        { vertical-align:super; font-size:.8em }

        .dta-argument { text-align:center; font-size:.9em }

        .dta-cb { font-size:.8em; color:#666; text-align:center; display:block; margin:5px }

        .poem       { padding-left:2em; margin-bottom:1em }
        .dta-salute { margin-top:1em; display:inline }
        .speaker    { font-weight:bold }
        .stage      { font-style:italic; font-size:.9em }
        .stage .c   { font-style:italic; font-size:.9em }
        div.stage   { margin-bottom:.5em }

        div.dta-figure { font-size:.9em; margin-top:1em; margin-bottom:1em }
        div.dta-figure p { margin-left:1em; display:inline }
        .dta-figure img {  }

        .titlepart           { font-size:1em }
        .titlepart-main      { margin-bottom:1em; font-size:1.6em }
        .titlepart-volume    { font-size:1em }
        .titlepart-edition   { font-size:1em }
        .titlepart-copyright { font-size:1em }
        .titlepart-desc      { font-size:1em }
        .titlepart-sub       { font-size:1.3em; margin-bottom:.5em }

        .docauthor { font-size:1em; margin-bottom:.5em }

        .gap       { color:#666 }

        .dta-foreign { color:#666 }
        .dta-foreign:before { content:"[" }
        .dta-foreign:after { content:"]" }

        .dta-corr { border-bottom:dotted 2px #97002d }
        .dta-reg  { border-bottom:dotted 2px #2d9700 }
        .dta-abbr { border-bottom:dotted 2px #002D97 }
        .dta-supplied { color:#2D9700 }

        /* dramae */
        .dta-sp    { margin-bottom:1em }
        .dta-in-sp { display:inline }
        .dta-actor { float:right }

        /* lb @n */
        .dta-lb-n { float:right }

        /* renditions inline */
        .aq       { font-family:sans-serif }
        .b        { font-weight:bold }
        .blue     { color:blue }
        .fr       { border:1px dotted silver }
        .g        { letter-spacing:0.125em }
        .g:before { content:''; margin-left:0.125em }
        .g:after  { content:''; margin-right:0em }
        .i        { font-style:italic }
        .in       { font-size:150% }
        .k        { font-variant:small-caps }
        .larger   { font-size:larger }
        .red      { color:red }
        .s        { text-decoration: line-through }
        .smaller  { font-size:smaller }
        .sub      { vertical-align:sub; font-size:.7em }
        .sup      { vertical-align:sup; font-size:.7em }
        .u        { text-decoration:underline }
        .uu       { border-bottom:double 3px #000 }

        /* renditions block */
        .c     { display:block; text-align:center }
        .et    { display:block; margin-left:2em; text-indent:0 }
        .et2   { display:block; margin-left:4em; text-indent:0 }
        .et3   { display:block; margin-left:6em; text-indent:0 }
        .dta-in-sp .et { display:inline; text-indent:2em }
        .right { display:block; text-align:right }
        .cw    { text-align:right }

        /* cast lists */
        table.dta-castgroup { border-collapse:collapse; border-spacing:0; margin:0; width:100% }
        td.castitem         { border-right:1px solid #333; padding-right:10px; padding-left:0; padding-bottom:5px }
        .castitem           { margin-bottom:5px }
        td.roledesc         { vertical-align:middle; padding-left:5px }

        /* tables */
        .dta-table      { margin-top:0; margin-left:auto; margin-right:auto; background:#fff; border-collapse:collapse }
        .dta-table td   { vertical-align:top; border:1px solid #ccc; padding:3px }
        caption h1,
        caption h2,
        caption h3,
        caption h4,
        caption h5,
        caption h6 { font-size:1em; white-space:nowrap; padding-bottom:5px }

        /* lists */
        ul.dta    { list-style-type:none; padding-left:2em }
        ul.dta li { margin-bottom:3px }

        .dta-bibl { font-size:.9em }

        .dta-columntext { white-space:normal }
        .dta-columntext td { padding-left:10px; padding-right:2em }

        table.list          { border-collapse:collapse; border-spacing:0; margin:0 }
        td.item-right       { border-left:1px solid #333; padding-right:10px; padding-left:0; padding-bottom:5px; padding-left:2em }
        td.item-left        { border-right:1px solid #333; padding-right:10px; padding-left:0; padding-bottom:5px; padding-left:2em }
        td.dta-list-trailer { vertical-align:middle; padding-left:5px; text-indent:0 !important }
        td.dta-list-head    { vertical-align:middle; padding-right:2em }
        .dta-list           { padding-left:2em; margin-bottom:1em }
        .dta-list-item      { text-indent:-1em; margin-bottom:.5em }
        .dta-list-item-noindent { text-indent:0em; margin-bottom:.5em !important }
        .dta-list-item table { text-indent:0em }

        /* all things brace ... */
        .braced-base       { display:inline-block; vertical-align:middle; padding:0 5px 0 5px }
        p .braced-base     { text-indent:0 !important }
        .braced-left-right { border-left:1px solid #333; border-right:1px solid #333; margin-left:1em }
        .braced-left       { border-left:1px solid #333; margin-left:1em }
        .braced-right      { border-right:1px solid #333 }
        .braced-base .dta-list-item { text-indent:0; margin-bottom:0 }

        .dta-pb { color:#666; font-size:.9em }
        .dta-p { text-indent:1em; margin:0px 0 }
        p {
          -webkit-margin-before: 0em;
          -webkit-margin-after: 0em;
          -webkit-margin-start: 0px;
          -webkit-margin-end: 0px;
        }

        /* dbu */
        .editorial.inline {
          color: #909090;
        }
        .editorial.foot {
          display: none;
        }
        span.tooltipster-icon {
          /* display: inline-block; */
          color: #0078c9;
          /* border: 1px solid #0078c9;
          border-radius: 50%;
          cursor: help;
          padding-left: 0.4em;
          padding-right: 0.4em; */
       }
      </style>
    </head>
    <body>
      <xsl:apply-templates/>
    </body>
  </html>
</xsl:template>

<xsl:template match='tei:title' mode="head">
  <title><xsl:apply-templates select=".//text()"/></title>
</xsl:template>

<xsl:template match='tei:teiHeader'/>

<xsl:template match='tei:cb'>
  <span class="dta-cb">
    <xsl:choose>
      <xsl:when test="@type='start'">[Beginn Spaltensatz]</xsl:when>
      <xsl:when test="@type='end'">[Ende Spaltensatz]</xsl:when>
      <xsl:otherwise>[Spaltenumbruch]</xsl:otherwise>
    </xsl:choose>
  </span>
</xsl:template>

<xsl:template match='tei:text[not(descendant::tei:text)]'>
  <xsl:apply-templates/>
  <xsl:for-each select="//tei:note[@place='foot' and string-length(@prev) > 0][not(./following::tei:pb)]">
    <xsl:apply-templates select="." mode="footnotes"/>
  </xsl:for-each>
  <xsl:for-each select="//tei:note[@place='foot' and string-length(@prev) = 0][not(./following::tei:pb)]">
    <xsl:apply-templates select="." mode="footnotes"/>
  </xsl:for-each>
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
        <xsl:attribute name="title"><xsl:value-of select="tei:abbr"/></xsl:attribute>
        <xsl:attribute name="class">dta-abbr</xsl:attribute>
        <xsl:apply-templates select="tei:expan"/>
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

<xsl:template match="tei:corr">
  <xsl:choose>
    <xsl:when test="not(string(.))">
      <xsl:text>[&#8230;]</xsl:text>
    </xsl:when>
    <xsl:otherwise>
      <xsl:apply-templates/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match='tei:fw[@place="top"]'>
  <div>
    <xsl:attribute name="class">fw-top fw-<xsl:value-of select="@type"/></xsl:attribute>
    <xsl:apply-templates/>
  </div>
</xsl:template>

<xsl:template match='tei:fw[@place="bottom"][not(./ancestor::tei:note)]'>
  <xsl:if test="not(@type='page number')">
    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:choose>
          <xsl:when test='@type="sig"'>
            fw-bottom-sig
          </xsl:when>
          <xsl:when test='@type="catch"'>
            fw-bottom-catch
          </xsl:when>
        </xsl:choose>
      </xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:if>
</xsl:template>

<xsl:template match='tei:fw[@type="page number"]'/>

<xsl:template match='tei:milestone'>
  <xsl:if test="contains(@rendition, '#hrRed') or contains(@rendition, '#hrBlue') or contains(@rendition, '#hr')">
    <xsl:element name="hr">
      <xsl:choose>
        <xsl:when test="contains(@rendition, '#red') or contains(@rendition, '#hrRed')">
          <xsl:attribute name="class">red</xsl:attribute>
        </xsl:when>
        <xsl:when test="contains(@rendition, '#blue') or contains(@rendition, '#hrBlue')">
          <xsl:attribute name="class">blue</xsl:attribute>
        </xsl:when>
      </xsl:choose>
    </xsl:element>
  </xsl:if>
</xsl:template>

<!-- place holders -->
<xsl:template match='tei:formula'>
  <xsl:choose>
    <xsl:when test="@notation='TeX'">
      <xsl:element name="span">
        <xsl:attribute name="class">formula</xsl:attribute>
        <xsl:if test="@rendition='#c'">
          <xsl:attribute name="style">display:block; text-align:center</xsl:attribute>
        </xsl:if>
        <xsl:element name="img">
          <xsl:attribute name="style">vertical-align:middle; -moz-transform:scale(0.7); -webkit-transform:scale(0.7); transform:scale(0.7)</xsl:attribute>
          <xsl:attribute name="src">
            <xsl:text>http://dinglr.de/formula/</xsl:text><xsl:value-of select="encode-for-uri(.)"/>
          </xsl:attribute>
        </xsl:element>
      </xsl:element>
    </xsl:when>
    <xsl:when test="string-length(.) &gt; 0"><xsl:apply-templates/></xsl:when>
    <xsl:otherwise>
      <xsl:element name="span">
        <xsl:attribute name="class">ph formula-<xsl:value-of select="count(preceding::tei:formula)+1"/></xsl:attribute>
        <xsl:attribute name="onclick">editFormula(<xsl:value-of select="count(preceding::tei:formula)+1"/>)</xsl:attribute>
        <xsl:attribute name="style">cursor:pointer</xsl:attribute>
        [Formel <xsl:value-of select="count(preceding::tei:formula)+1"/>]
      </xsl:element>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match='tei:figure'>
  <xsl:choose>
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
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match='tei:figDesc'/>
<xsl:template match='tei:figDesc' mode="figdesc">
  <xsl:apply-templates/>
</xsl:template>
<!-- end place holders -->

<!-- editorial notes -->
<xsl:template match='tei:note[@type="editorial"]'>
  <xsl:choose>
    <xsl:when test="@place='foot'">
      <span class="editorial-marker tooltipster-icon" href="#{generate-id()}">(i)</span><span id="{generate-id()}" class="editorial foot"><xsl:apply-templates/></span>
    </xsl:when>
    <xsl:otherwise>
      <span class="editorial inline"><xsl:apply-templates/></span>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- footnotes -->
<xsl:template match='tei:note[@place="foot" and not(@type)]'>
  <xsl:if test="string-length(@prev)=0">
    <span class="fn-intext"><xsl:value-of select='@n'/></span>
  </xsl:if>
</xsl:template>

<xsl:template match='tei:note[@place="foot"]' mode="footnotes">
  <xsl:if test="not(@type='editorial')">
  <div class="footnote" style="margin-bottom:1em">
    <xsl:choose>
      <xsl:when test="string-length(@prev)!=0 or string-length(@sameAs)!=0"></xsl:when>
      <xsl:otherwise>
        <span class="fn-sign"><xsl:value-of select='@n'/></span>
      </xsl:otherwise>
    </xsl:choose>
    <xsl:text> </xsl:text>
    <xsl:apply-templates/>
    <xsl:apply-templates select='tei:fw[@place="bottom"][@type="catch"]' mode="fn-catch"/>
  </div>
  </xsl:if>
</xsl:template>

<xsl:template match="tei:note/tei:fw"/>
<xsl:template match="tei:note/tei:fw" mode="fn-catch">
  <div class="fw-bottom-catch"><xsl:apply-templates/></div>
</xsl:template>
<!-- end footnotes -->

<!-- end notes -->
<xsl:template match='tei:note[@place="end"]'>
  <xsl:choose>
    <xsl:when test="string-length(.) &gt; 0">
      <xsl:choose>
        <xsl:when test="local-name(*[1])!='pb'">
          <div class="endnote endnote-indent">
            <span class="fn-sign"><xsl:value-of select='@n'/></span>
            <xsl:text> </xsl:text>
            <xsl:apply-templates/>
          </div>
        </xsl:when>
        <xsl:otherwise>
          <div class="endnote">
            <xsl:apply-templates/>
          </div>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:otherwise>
      <span class="fn-sign"><xsl:value-of select='@n'/></span>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>
<!-- end end notes -->

<!-- marginals -->
<xsl:template match='tei:note[@place="right" and not(@type)]'>
  <xsl:value-of select='@n'/>
  <span class="dta-marginal dta-marginal-right"><xsl:apply-templates/></span>
</xsl:template>

<xsl:template match='tei:note[@place="left" and not(@type)]'>
  <xsl:value-of select='@n'/>
  <span class="dta-marginal dta-marginal-left"><xsl:apply-templates/></span>
</xsl:template>
<!-- end marginals -->

<xsl:template match='tei:gap'>
  <span class="gap">
    <xsl:text>[</xsl:text>
    <xsl:if test="@reason='lost'">verlorenes Material</xsl:if>
    <xsl:if test="@reason='insignificant'">irrelevantes Material</xsl:if>
    <xsl:if test="@reason='fm'">fremdsprachliches Material</xsl:if>
    <xsl:if test="@reason='illegible'">unleserliches Material</xsl:if>
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

<xsl:template match='tei:titlePage'>
  <div class="titlepage"><xsl:apply-templates/></div>
</xsl:template>

<xsl:template match='tei:titlePart'>
  <xsl:element name="div">
    <xsl:attribute name="class">titlepart titlepart-<xsl:value-of select="@type"/></xsl:attribute>
    <xsl:apply-templates/>
  </xsl:element>
</xsl:template>

<xsl:template match='tei:docImprint'>
  <xsl:apply-templates/>
</xsl:template>

<xsl:template match='tei:docAuthor'>
  <span class="docauthor">
    <xsl:call-template name="applyRendition"/>
    <xsl:apply-templates/>
  </span>
</xsl:template>

<xsl:template match='tei:docDate'>
  <xsl:apply-templates/>
</xsl:template>

<xsl:template match='tei:byline'>
  <div class="byline">
    <xsl:call-template name="applyRendition"/>
    <xsl:apply-templates/>
  </div>
</xsl:template>

<xsl:template match='tei:publisher'>
  <xsl:element name="span">
    <xsl:attribute name="class">dta-publisher
    <xsl:choose>
      <xsl:when test="@rendition=''"/>
      <xsl:when test="contains(normalize-space(@rendition),' ')">
        <xsl:call-template name="splitRendition">
          <xsl:with-param name="value">
            <xsl:value-of select="normalize-space(@rendition)"/>
          </xsl:with-param>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="findRendition">
          <xsl:with-param name="value">
            <xsl:value-of select="@rendition"/>
          </xsl:with-param>
        </xsl:call-template>
      </xsl:otherwise>
     </xsl:choose>
    </xsl:attribute>
    <xsl:apply-templates />
  </xsl:element>
</xsl:template>

<xsl:template match='tei:head'>
  <xsl:choose>
    <xsl:when test='ancestor::tei:figure'>
      <span class='figdesc'><xsl:apply-templates/></span>
    </xsl:when>
    <xsl:when test="ancestor::tei:list or parent::tei:lg">
      <div class="dta-head"><xsl:apply-templates/></div>
    </xsl:when>
    <xsl:when test="local-name(./*[position()=last()]) != 'lb' and local-name(following::*[1]) != 'lb'">
      <xsl:apply-templates/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:choose>
        <xsl:when test='parent::tei:div/@n or parent::tei:div'>
          <xsl:choose>
            <xsl:when test="parent::tei:div/@n > 6 or not(@n)">
              <div class="dta-head"><xsl:apply-templates/></div>
            </xsl:when>
            <xsl:otherwise>
              <xsl:text disable-output-escaping="yes">&lt;h</xsl:text>
              <xsl:value-of select="parent::tei:div/@n"/>
              <xsl:text disable-output-escaping="yes"> class="dta-head"&gt;</xsl:text>
              <xsl:apply-templates/>
              <xsl:text disable-output-escaping="yes">&lt;/h</xsl:text>
              <xsl:value-of select="parent::tei:div/@n"/>
              <xsl:text disable-output-escaping="yes">&gt;</xsl:text>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:when>
        <xsl:when test='parent::tei:list'>
          <xsl:apply-templates/>
        </xsl:when>
        <xsl:otherwise>
          <h2><xsl:apply-templates/></h2>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- dramae -->
<xsl:template match='tei:castList'>
  <div class="castlist"><xsl:apply-templates/></div>
</xsl:template>

<xsl:template match='tei:castGroup'>
  <xsl:choose>
    <!-- nested castGroups, e. g. http://www.deutschestextarchiv.de/dtaq/book/view/16258?p=10 -->
    <xsl:when test="tei:castGroup">
      <table class="dta-castgroup">
        <td><xsl:apply-templates/></td>
        <td class="roledesc"><xsl:apply-templates select="tei:roleDesc"/></td>
      </table>
    </xsl:when>
    <xsl:otherwise>
      <table class="dta-castgroup">
        <xsl:for-each select='tei:castItem'>
          <tr>
            <td class="castitem"><xsl:apply-templates/></td>
            <xsl:if test="position()=1">
              <xsl:element name="td">
                <xsl:attribute name="class">roledesc</xsl:attribute>
                <xsl:attribute name="rowspan"><xsl:value-of select="count(../tei:castItem)"/></xsl:attribute>
                <xsl:apply-templates select="../tei:roleDesc"/>
              </xsl:element>
            </xsl:if>
            <xsl:if test="tei:actor">
              <td class="dta-actor"><xsl:apply-templates select="tei:actor"/></td>
            </xsl:if>
          </tr>
        </xsl:for-each>
      </table>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="tei:actor">
  <span class="dta-actor"><xsl:apply-templates/></span>
</xsl:template>

<xsl:template match='tei:castItem[not(parent::tei:castGroup)]'>
  <div class="castitem"><xsl:apply-templates/></div>
</xsl:template>

<xsl:template match='tei:castList/tei:head'>
  <h2 class="head"><xsl:apply-templates/></h2>
</xsl:template>

<xsl:template match='tei:role'>
  <xsl:apply-templates/>
</xsl:template>

<xsl:template match='tei:speaker'>
  <span class="speaker"><xsl:text> </xsl:text><xsl:apply-templates/><xsl:text> </xsl:text></span>
</xsl:template>

<xsl:template match='tei:stage'>
  <xsl:choose>
    <xsl:when test="ancestor::tei:sp">
      <span class="stage"><xsl:text> </xsl:text><xsl:apply-templates/><xsl:text> </xsl:text></span>
    </xsl:when>
    <xsl:otherwise>
      <div class="stage"><xsl:apply-templates/></div>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>
<!-- end dramae -->

<!-- poems -->
<xsl:template match='tei:lg[@type="poem"]/tei:head'>
  <div class="head"><xsl:apply-templates/></div>
</xsl:template>

<xsl:template match='tei:lg[@type="poem"]'>
  <div class="poem"><xsl:apply-templates/></div>
</xsl:template>

<xsl:template match='tei:lg[not(@type="poem")]'>
  <div class="dta-lg"><xsl:apply-templates/></div>
</xsl:template>
<!-- end poems -->

<!-- letters -->
<xsl:template match='tei:salute'>
  <xsl:element name="div">
    <xsl:attribute name="class">dta-salute
    <xsl:choose>
      <xsl:when test="@rendition=''"/>
      <xsl:when test="contains(normalize-space(@rendition),' ')">
        <xsl:call-template name="splitRendition">
          <xsl:with-param name="value">
            <xsl:value-of select="normalize-space(@rendition)"/>
          </xsl:with-param>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="findRendition">
          <xsl:with-param name="value">
            <xsl:value-of select="@rendition"/>
          </xsl:with-param>
        </xsl:call-template>
      </xsl:otherwise>
     </xsl:choose>
    </xsl:attribute>
    <xsl:apply-templates />
  </xsl:element>
</xsl:template>

<xsl:template match='tei:dateline'>
  <span class="dta-dateline">
    <xsl:call-template name="applyRendition"/>
    <xsl:apply-templates/>
  </span>
</xsl:template>

<xsl:template match='tei:closer'>
  <div class="dta-closer">
    <xsl:call-template name="applyRendition"/>
    <xsl:apply-templates/>
  </div>
</xsl:template>
<!-- end letters -->

<xsl:template match='tei:div'>
  <xsl:element name="div">
    <xsl:choose>
      <xsl:when test="@type='advertisment' or @type='advertisement'">
        <div class="dta-anzeige"><xsl:apply-templates/></div>
      </xsl:when>
      <xsl:otherwise>
        <xsl:attribute name="class">
          <xsl:value-of select="@type"/>
        </xsl:attribute>
        <xsl:apply-templates/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:element>
</xsl:template>

<xsl:template match="tei:sp">
  <div class="dta-sp"><xsl:apply-templates/></div>
</xsl:template>

<xsl:template match="tei:spGrp">
  <xsl:choose>
    <xsl:when test="child::*[1][self::tei:stage][@rendition='#rightBraced']">
      <table>
        <tr>
          <td style="vertical-align:middle"><xsl:apply-templates select="child::*[1]"/></td>
          <td class="braced-base braced-left">
            <xsl:for-each select="tei:sp">
              <div class="dta-sp"><xsl:apply-templates/></div>
            </xsl:for-each>
          </td>
        </tr>
      </table>
    </xsl:when>
    <xsl:when test="child::*[last()][self::tei:stage][@rendition='#leftBraced']">
      <table>
        <tr>
          <td class="braced-base braced-right">
            <xsl:for-each select="tei:sp">
              <div class="dta-sp"><xsl:apply-templates/></div>
            </xsl:for-each>
          </td>
          <td style="vertical-align:middle"><xsl:apply-templates select="child::*[last()]"/></td>
        </tr>
      </table>
    </xsl:when>
    <xsl:otherwise>
      <xsl:apply-templates/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

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
        <xsl:apply-templates/>
      </p>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match='tei:argument'>
  <div class="dta-argument"><xsl:apply-templates/></div>
</xsl:template>

<xsl:template match='tei:c'>
  <xsl:element name="span">
    <xsl:attribute name="id"><xsl:value-of select="@xml:id"/></xsl:attribute>
    <xsl:apply-templates/>
  </xsl:element>
</xsl:template>

<xsl:template match='tei:l'>
  <xsl:choose>
    <xsl:when test="contains(@rendition,'#c') or contains(@rendition,'#et') or contains(@rendition,'#right')">
      <xsl:element name="div">
        <xsl:if test="@rendition">
          <xsl:call-template name="applyRendition"/>
        </xsl:if>
        <xsl:element name="span">
          <xsl:call-template name="applyXmlId"/>
          <xsl:call-template name="applyPrev"/>
          <xsl:call-template name="applyNext"/>
          <xsl:apply-templates />
        </xsl:element>
      </xsl:element>
    </xsl:when>
    <xsl:otherwise>
      <xsl:element name="span">
        <xsl:if test="@rendition">
          <xsl:call-template name="applyRendition"/>
        </xsl:if>
        <xsl:call-template name="applyXmlId"/>
        <xsl:call-template name="applyPrev"/>
        <xsl:call-template name="applyNext"/>
        <xsl:apply-templates />
      </xsl:element>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match='tei:lb'>
  <xsl:if test="@n">
    <span class="dta-lb-n"><xsl:apply-templates select="@n"/></span>
  </xsl:if>
  <br />
  <xsl:apply-templates />
</xsl:template>

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


<xsl:template match='tei:floatingText'>
  <xsl:element name="div">
    <xsl:attribute name="class">
     dta-floatingtext
     <xsl:choose>
      <xsl:when test="@rendition=''"/>
      <xsl:when test="contains(normalize-space(@rendition),' ')">
        <xsl:call-template name="splitRendition">
          <xsl:with-param name="value">
            <xsl:value-of select="normalize-space(@rendition)"/>
          </xsl:with-param>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="findRendition">
          <xsl:with-param name="value">
            <xsl:value-of select="@rendition"/>
          </xsl:with-param>
        </xsl:call-template>
      </xsl:otherwise>
     </xsl:choose>
    </xsl:attribute>
    <xsl:apply-templates />
  </xsl:element>
</xsl:template>

<!-- @prev/@next stuff -->
<xsl:template name="applyPrev">
  <xsl:if test="@prev">
    <xsl:attribute name="data-prev"><xsl:value-of select="@prev"/></xsl:attribute>
  </xsl:if>
</xsl:template>

<xsl:template name="applyNext">
  <xsl:if test="@next">
    <xsl:attribute name="data-next"><xsl:value-of select="@next"/></xsl:attribute>
  </xsl:if>
</xsl:template>

<xsl:template name="applyXmlId">
  <xsl:if test="@xml:id">
    <xsl:attribute name="data-xmlid"><xsl:value-of select="@xml:id"/></xsl:attribute>
  </xsl:if>
</xsl:template>

<!-- renditions -->
<xsl:template match='tei:hi'>
  <xsl:element name="span">
    <xsl:if test="@rendition">
      <xsl:call-template name="applyRendition"/>
    </xsl:if>
    <xsl:if test="@rend">
      <xsl:attribute name="class">dta-rend</xsl:attribute>
    </xsl:if>
    <xsl:apply-templates/>
  </xsl:element>
</xsl:template>

<xsl:template name="applyRendition">
  <xsl:attribute name="class">
    <xsl:choose>
      <xsl:when test="@rendition=''"/>
      <xsl:when test="contains(normalize-space(@rendition),' ')">
        <xsl:call-template name="splitRendition">
          <xsl:with-param name="value">
            <xsl:value-of select="normalize-space(@rendition)"/>
          </xsl:with-param>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="findRendition">
          <xsl:with-param name="value">
            <xsl:value-of select="@rendition"/>
          </xsl:with-param>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:attribute>
</xsl:template>

<xsl:template name="splitRendition">
  <xsl:param name="value"/>
  <xsl:choose>
    <xsl:when test="$value=''"/>
    <xsl:when test="contains($value,' ')">
      <xsl:call-template name="findRendition">
        <xsl:with-param name="value">
          <xsl:value-of select="substring-before($value,' ')"/>
        </xsl:with-param>
      </xsl:call-template>
      <xsl:call-template name="splitRendition">
        <xsl:with-param name="value">
          <xsl:value-of select="substring-after($value,' ')"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:call-template name="findRendition">
        <xsl:with-param name="value">
          <xsl:value-of select="$value"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="findRendition">
  <xsl:param name="value"/>
  <xsl:choose>
    <xsl:when test="starts-with($value,'#')">
      <xsl:value-of select="substring-after($value,'#')"/>
      <xsl:text> </xsl:text>
    </xsl:when>
    <xsl:otherwise>
      <xsl:for-each select="document($value)">
        <xsl:apply-templates select="@xml:id"/>
        <xsl:text> </xsl:text>
      </xsl:for-each>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- end renditions -->

<xsl:template match='tei:cit'>
  <span class="dta-cit">
    <xsl:if test="@xml:id">
      <xsl:attribute name="data-id"><xsl:value-of select="@xml:id"/></xsl:attribute>
    </xsl:if>
    <xsl:if test="@prev">
      <xsl:attribute name="data-prev"><xsl:value-of select="@prev"/></xsl:attribute>
    </xsl:if>
    <xsl:if test="@next">
      <xsl:attribute name="data-next"><xsl:value-of select="@next"/></xsl:attribute>
    </xsl:if>
    <xsl:call-template name="applyRendition"/>
    <xsl:apply-templates/>
  </span>
</xsl:template>

<xsl:template match='tei:epigraph'>
  <blockquote class="quote"><xsl:apply-templates/></blockquote>
</xsl:template>

<xsl:template match='tei:quote'>
  <q class="quote"><xsl:apply-templates/></q>
</xsl:template>

<xsl:template match='tei:q'>
  <q class="quote"><xsl:apply-templates/></q>
</xsl:template>

<xsl:template match="tei:list">
  <xsl:choose>
    <xsl:when test='@rend="braced"'>
      <table class="list">
        <xsl:choose>
          <xsl:when test="tei:trailer">
            <xsl:for-each select='tei:item'>
              <tr>
                <td class="item-left"><xsl:apply-templates/></td>
                <xsl:if test="position()=1">
                  <xsl:element name="td">
                  <xsl:attribute name="class">dta-list-trailer</xsl:attribute>
                  <xsl:attribute name="rowspan"><xsl:value-of select="count(../tei:item)"/></xsl:attribute>
                  <xsl:apply-templates select="../tei:trailer"/>
                  </xsl:element>
                </xsl:if>
              </tr>
            </xsl:for-each>
          </xsl:when>
          <xsl:otherwise><!-- tei:head -->
            <xsl:for-each select='tei:item'>
              <tr>
                <xsl:if test="position()=1">
                  <xsl:element name="td">
                  <xsl:attribute name="class">dta-list-head</xsl:attribute>
                  <xsl:attribute name="rowspan"><xsl:value-of select="count(../tei:item)"/></xsl:attribute>
                  <xsl:apply-templates select="../tei:head"/>
                  </xsl:element>
                </xsl:if>
                <td class="item-right"><xsl:apply-templates/></td>
              </tr>
            </xsl:for-each>
          </xsl:otherwise>
        </xsl:choose>
      </table>
    </xsl:when>
    <xsl:when test='@rendition="#leftBraced"'>
      <span class="braced-base braced-left"><xsl:apply-templates/></span>
    </xsl:when>
    <xsl:when test='@rendition="#rightBraced"'>
      <span class="braced-base braced-right"><xsl:apply-templates/></span>
    </xsl:when>
    <xsl:when test='@rendition="#leftBraced #rightBraced"'>
      <span class="braced-base braced-left-right"><xsl:apply-templates/></span>
    </xsl:when>
    <xsl:otherwise>
      <div class="dta-list">
        <xsl:apply-templates/>
      </div>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="tei:item">
  <xsl:choose>
    <xsl:when test="ancestor::tei:p">
      <span class="dta-list-item"><xsl:apply-templates/></span>
    </xsl:when>
    <xsl:otherwise>
      <div class="dta-list-item"><xsl:apply-templates/></div>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match='tei:table'>
  <xsl:choose>
    <xsl:when test="not(string(.)) or not(normalize-space(.))">
      <div class="gap">[Tabelle]</div>
    </xsl:when>
    <xsl:otherwise>
      <table class="dta-table">
      <xsl:if test="tei:head">
        <caption><xsl:apply-templates select="tei:head"/></caption>
      </xsl:if>
      <xsl:for-each select="tei:row">
        <tr>
        <xsl:for-each select="tei:cell">
          <xsl:choose>
            <xsl:when test="../@role='label'">
              <xsl:element name="th">
                <xsl:apply-templates/>
              </xsl:element>
            </xsl:when>
            <xsl:otherwise>
              <xsl:element name="td">
                <xsl:if test="@cols">
                  <xsl:attribute name="colspan"><xsl:value-of select="@cols"/></xsl:attribute>
                </xsl:if>
                <xsl:if test="@rows">
                  <xsl:attribute name="rowspan"><xsl:value-of select="@rows"/></xsl:attribute>
                </xsl:if>
                <xsl:if test="@rendition='#c'">
                  <xsl:attribute name="style">text-align:center</xsl:attribute>
                </xsl:if>
                <xsl:if test="@rendition='#right'">
                  <xsl:attribute name="style">text-align:right</xsl:attribute>
                </xsl:if>
                <xsl:if test="@rendition='#et'">
                  <xsl:attribute name="style">padding-left:2em</xsl:attribute>
                </xsl:if>
                <xsl:apply-templates/>
              </xsl:element>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:for-each>
        </tr>
      </xsl:for-each>
      </table>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match='tei:opener'>
  <span class="dta-opener">
    <xsl:call-template name="applyRendition"/>
    <xsl:apply-templates/>
  </span>
</xsl:template>

<xsl:template match='tei:trailer'>
  <span class="dta-trailer">
    <xsl:call-template name="applyRendition"/>
    <xsl:apply-templates/>
  </span>
</xsl:template>

<xsl:template match='tei:ref'>
  <xsl:element name="span">
    <xsl:attribute name="class">ref</xsl:attribute>
    <xsl:if test="starts-with(@target, 'http')">
      <xsl:attribute name="target"><xsl:value-of select="@target"/></xsl:attribute>
    </xsl:if>
    <xsl:apply-templates/>
  </xsl:element>
</xsl:template>

<xsl:template match='tei:bibl'>
  <span class="dta-bibl">
    <xsl:call-template name="applyRendition"/>
    <xsl:apply-templates/>
  </span>
</xsl:template>

<xsl:template match='tei:space[@dim="horizontal"]'>
  <xsl:text disable-output-escaping="yes">&amp;nbsp;&amp;nbsp;&amp;nbsp;</xsl:text><xsl:apply-templates/>
</xsl:template>

<xsl:template match='tei:space[@dim="vertical"]'>
  <br class="space"/>
</xsl:template>

<xsl:template match='tei:supplied'>
  <span class="dta-supplied"><xsl:text>[</xsl:text><xsl:apply-templates/><xsl:text>]</xsl:text></span>
</xsl:template>

<xsl:template match='tei:foreign'>
  <xsl:choose>
    <xsl:when test="not(child::node()) and @xml:lang">
      <span class="dta-foreign" title="fremdsprachliches Material">FM:
        <xsl:choose>
          <xsl:when test="@xml:lang='he' or @xml:lang='heb' or @xml:lang='hbo'">hebräisch</xsl:when>
          <xsl:when test="@xml:lang='el' or @xml:lang='grc' or @xml:lang='ell'">griechisch</xsl:when>
          <xsl:otherwise><xsl:value-of select="@xml:lang"/></xsl:otherwise>
        </xsl:choose>
      </span>
    </xsl:when>
    <xsl:otherwise>
      <xsl:apply-templates/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match='tei:name[@type="artificialWork"]'>
  <span title="Kunstwerk oder Gebäude">
    <xsl:call-template name="link-ref">
      <xsl:with-param name="value">
        <xsl:value-of select="@ref"/>
      </xsl:with-param>
    </xsl:call-template>
  </span>
</xsl:template>

<xsl:template match='tei:persName'>
  <span title="Personenname">
    <xsl:call-template name="link-ref">
      <xsl:with-param name="value">
        <xsl:value-of select="@ref"/>
      </xsl:with-param>
    </xsl:call-template>
  </span>
</xsl:template>

<xsl:template match='tei:placeName'>
  <span title="Ortsname">
    <xsl:call-template name="link-ref">
      <xsl:with-param name="value">
        <xsl:value-of select="@ref"/>
      </xsl:with-param>
    </xsl:call-template>
  </span>
</xsl:template>

<xsl:template name="link-ref">
  <xsl:param name="value"/>
  <xsl:choose>
    <xsl:when test="$value and starts-with($value,'http')">
      <xsl:element name="a">
        <xsl:attribute name="href">
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

<xsl:template match="text()">
  <xsl:value-of select="."/>
</xsl:template>

</xsl:stylesheet>

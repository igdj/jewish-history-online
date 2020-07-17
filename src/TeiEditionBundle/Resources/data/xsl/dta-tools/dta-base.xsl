<?xml version="1.0" encoding="utf-8"?>

<!--perhaps a PROBLEM: xpath-default-namespace is an XSLT 2.0 feature -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0"
  xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:dta="urn:dta" exclude-result-prefixes="dta tei"
  xpath-default-namespace="http://www.tei-c.org/ns/1.0">
  <!-- <xsl:include href="uri-encode.xsl"/> -->
  <xsl:include href="dta-base-helper.xsl"/>
  <xsl:output method="xml" cdata-section-elements="script style" indent="no" encoding="utf-8"/>

  <xsl:template match="tei:teiHeader"/>



  <xsl:template match="tei:text[not(descendant::tei:text)]">
    <xsl:apply-templates/>
    <xsl:if test='//tei:note[@place="foot"]'>
      <div class="dta-footnotesep"/>
      <xsl:apply-templates select='//tei:note[@place="foot" and text()]' mode="footnotes"/>
    </xsl:if>
    <xsl:apply-templates select='//tei:fw[@place="bottom" and (text() or *)]' mode="signatures"/>
  </xsl:template>


  <!-- begin DOCUMENT STUCTURE ELEMENTS -->

  <xsl:template match="tei:pb"/>

  <!-- begin titlepage -->
  <xsl:template match="tei:titlePage">
    <div class="dta-titlepage">
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="tei:docTitle">
    <span class="dta-doctitle">
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="tei:titlePart">
    <xsl:element name="div">
      <xsl:attribute name="class">dta-titlepart dta-titlepart-<xsl:value-of select="@type"/></xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="tei:byline">
    <div>
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-byline'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="tei:docAuthor">
    <span>
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-docauthor'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="tei:docEdition">
    <span class="dta-docedition">
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <!-- begin imprint -->
  <xsl:template match="tei:docImprint">
    <span class="dta-docimprint">
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="tei:docDate">
    <span class="dta-docdate">
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="tei:pubPlace">
    <span class="dta-pubplace">
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="tei:publisher">
    <xsl:element name="span">
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-publisher'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>
  <!-- end imprint -->
  <!-- end titlepage -->

  <!-- end DOCUMENT STUCTURE ELEMENTS -->

  <!-- ______________________________ -->

  <!-- begin TEXT STUCTURE ELEMENTS   -->

  <!-- begin general -->
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

  <xsl:template match="tei:castList/tei:head">
    <h2 class="dta-head">
      <xsl:apply-templates/>
    </h2>
  </xsl:template>

  <xsl:template match="tei:imprimatur">
    <span class="dta-imprimatur">
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="tei:argument">
    <div class="dta-argument">
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="tei:trailer">
    <span>
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-trailer'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </span>
  </xsl:template>
  <!-- end general -->

  <!-- begin letter -->
  <xsl:template match="tei:dateline">
    <span>
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-dateline'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="tei:salute">
    <xsl:element name="div">
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-salute'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="tei:opener">
    <span>
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-opener'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="tei:closer">
    <div>
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-closer'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="tei:signed">
    <span class="dta-signed">
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="tei:postscript">
    <span class="dta-postscript">
      <xsl:apply-templates/>
    </span>
  </xsl:template>
  <!-- end letter -->

  <!-- begin drama -->
  <xsl:template match="tei:castList">
    <div class="dta-castlist">
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match='tei:castGroup'>
    <xsl:choose>
      <!-- nested castGroups, e. g. http://www.deutschestextarchiv.de/dtaq/book/view/16258?p=10 -->
      <xsl:when test="tei:castGroup">
        <table class="dta-castgroup">
          <td><xsl:apply-templates/></td>
          <td><xsl:apply-templates select="tei:roleDesc"/></td>
        </table>
      </xsl:when>
      <xsl:otherwise>
        <table class="dta-castgroup">
          <xsl:for-each select='tei:castItem'>
            <tr>
              <td class="dta-castitem"><xsl:apply-templates/></td>
              <xsl:if test="position()=1">
                <xsl:element name="td">
                  <xsl:attribute name="rowspan"><xsl:value-of select="count(../tei:castItem)"/></xsl:attribute>
                  <xsl:apply-templates select="../tei:roleDesc"/>
                </xsl:element>
              </xsl:if>
            </tr>
          </xsl:for-each>
        </table>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="tei:castItem[not(parent::tei:castGroup)]">
    <div class="dta-castitem">
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="tei:actor">
    <span class="dta-actor">
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="tei:role">
    <span class="dta-role">
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="tei:roleDesc">
    <span class="dta-roledesc">
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="tei:speaker">
    <span class="dta-speaker">
      <xsl:text> </xsl:text>
      <xsl:apply-templates/>
      <xsl:text> </xsl:text>
    </span>
  </xsl:template>

  <xsl:template match="tei:sp">
    <div class="dta-sp">
      <xsl:for-each select="child::*">
        <xsl:choose>
          <xsl:when test="local-name(current())='stage' and not(local-name(current()/preceding-sibling::*[1])='p') and current()/following-sibling::tei:p and not(local-name(current()/following-sibling::*[1])='lb') ">
             <!-- OPEN_P_AT_STAGE -->
            <xsl:text disable-output-escaping="yes">&lt;p class="dta-sp-p"&gt;</xsl:text>
            <xsl:apply-templates select="."/>
          </xsl:when>
          <xsl:when test="local-name(current())='p' and local-name(current()/preceding-sibling::*[1])='stage'">
            <!-- P_AFTER_STAGE -->
            <xsl:text> </xsl:text>
            <xsl:apply-templates select="."/>
            <xsl:if test="local-name(current()/following-sibling::*[1])='lb' or local-name(current()/following-sibling::*[1]) = 'p' or not(current()/following-sibling::tei:p or current()/following-sibling::tei:stage)">
              <!-- CLOSE_P_AT_P -->
              <xsl:text disable-output-escaping="yes">&lt;/p&gt;</xsl:text>
            </xsl:if>
          </xsl:when>
          <xsl:when test="local-name(current())='p' and local-name(current()/following-sibling::*[1])='stage'">
            <!-- OPEN_P_BEFORE_STAGE -->
            <xsl:text disable-output-escaping="yes">&lt;p class="dta-sp-p"&gt;</xsl:text>
            <xsl:apply-templates select="."/>
            <xsl:text> </xsl:text>
          </xsl:when>
          <xsl:when test="local-name(current())='stage' and local-name(current()/preceding-sibling::*[1])='p'">
            <!-- STAGE_AFTER_P -->
            <xsl:apply-templates select="."/>
            <xsl:if test="local-name(current()/following-sibling::*[1])='lb' or not(local-name(current()/following-sibling::*[1]) = 'p')">
              <!-- CLOSE_P_AT_STAGE -->
              <xsl:text disable-output-escaping="yes">&lt;/p&gt;</xsl:text>
            </xsl:if>
          </xsl:when>
          <xsl:when test="local-name(current())='stage'">
            <!-- STAGE_SINGLE -->
            <xsl:apply-templates select="."/>
          </xsl:when>
          <xsl:when test="local-name(current())='p'">
            <!-- P_SINGLE -->
            <p class="dta-sp-p">
              <xsl:apply-templates select="."/>
            </p>
          </xsl:when>
          <xsl:otherwise>
            <!-- OTHER  -->
            <xsl:apply-templates select="current()"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:for-each>

      <!-- <xsl:apply-templates/> -->
    </div>
  </xsl:template>

  <xsl:template match="tei:spGrp">
    <xsl:choose>
      <xsl:when test="child::*[1][self::tei:stage][@rendition='#rightBraced']">
        <table>
          <tr>
            <td style="vertical-align:middle"><xsl:apply-templates select="child::*[1]"/></td>
            <td class="dta-braced-base dta-braced-left">
              <xsl:for-each select="tei:sp">
                <xsl:apply-templates select="current()"/>
              </xsl:for-each>
            </td>
          </tr>
        </table>
      </xsl:when>
      <xsl:when test="child::*[last()][self::tei:stage][@rendition='#leftBraced']">
        <table>
          <tr>
            <td class="dta-braced-base dta-braced-right">
              <xsl:for-each select="tei:sp">
                <xsl:apply-templates select="current()"/>
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

  <!-- stage direction -->
  <xsl:template match="tei:stage">
    <xsl:variable name="nodetype">
      <xsl:choose>
        <xsl:when test="ancestor::tei:sp">span</xsl:when>
        <xsl:otherwise>div</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:element name="{$nodetype}">
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-stage'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>
  <!-- end drama -->

  <!-- poems -->
  <xsl:template match='tei:l'>
    <xsl:choose>
      <xsl:when test="contains(@rendition,'#c') or contains(@rendition,'#et') or contains(@rendition,'#right')">
        <xsl:element name="div">
          <xsl:call-template name="applyRendition">
            <xsl:with-param name="class" select="'dta-l'"/>
          </xsl:call-template>
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
          <xsl:call-template name="applyRendition">
            <xsl:with-param name="class" select="'dta-l'"/>
          </xsl:call-template>
          <xsl:call-template name="applyXmlId"/>
          <xsl:call-template name="applyPrev"/>
          <xsl:call-template name="applyNext"/>
          <xsl:apply-templates />
        </xsl:element>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match='tei:lg[@type="poem"]/tei:head'>
    <div>
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-head'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match='tei:lg[@type="poem"]'>
    <div>
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-poem'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match='tei:lg[not(@type="poem")]'>
    <div>
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-lg'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </div>
  </xsl:template>
  <!-- end poems -->

  <!-- begin citations (1) -->
  <xsl:template match="tei:cit">
    <span>
      <xsl:if test="@xml:id">
        <xsl:attribute name="data-id">
          <xsl:value-of select="@xml:id"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@prev">
        <xsl:attribute name="data-prev">
          <xsl:value-of select="@prev"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@next">
        <xsl:attribute name="data-next">
          <xsl:value-of select="@next"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-cit'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="tei:epigraph">
    <blockquote class="dta-quote">
      <xsl:apply-templates/>
    </blockquote>
  </xsl:template>

  <xsl:template match="tei:bibl">
    <span>
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-bibl'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match="tei:listBibl">
    <div class="dta-list-bibl">
      <xsl:apply-templates/>
    </div>
  </xsl:template>
  <!-- end citations (1) -->

  <!-- begin structural -->
  <xsl:template match="tei:lb">
    <xsl:if test="@n">
      <span class="dta-lb-n">
        <xsl:apply-templates select="@n"/>
      </span>
    </xsl:if>
    <br/>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match='tei:space'>
    <xsl:choose>
      <xsl:when test="@dim='horizontal'">
        <xsl:text disable-output-escaping="yes">&amp;nbsp;&amp;nbsp;&amp;nbsp;</xsl:text>
      </xsl:when>
      <xsl:when test="@dim='vertical'">
        <br class="dta-space"/>
      </xsl:when>
    </xsl:choose>
  </xsl:template>


  <xsl:template match="tei:milestone">
    <xsl:if
      test="contains(@rendition, '#hrRed') or contains(@rendition, '#hrBlue') or contains(@rendition, '#hr')">
      <xsl:element name="hr">
        <xsl:choose>
          <xsl:when test="contains(@rendition, '#red') or contains(@rendition, '#hrRed')">
            <xsl:attribute name="class">dta-red</xsl:attribute>
          </xsl:when>
          <xsl:when test="contains(@rendition, '#blue') or contains(@rendition, '#hrBlue')">
            <xsl:attribute name="class">dta-blue</xsl:attribute>
          </xsl:when>
        </xsl:choose>
      </xsl:element>
    </xsl:if>
  </xsl:template>

  <xsl:template match="tei:div">
    <xsl:element name="div">
      <xsl:choose>
        <xsl:when test="@type='advertisment' or @type='advertisement'">
          <xsl:call-template name="applyRendition">
            <xsl:with-param name="class" select="'dta-anzeige'"/>
          </xsl:call-template>
          <xsl:apply-templates/>
        </xsl:when>
        <xsl:when test="@type">
          <xsl:call-template name="applyRendition">
            <xsl:with-param name="class">dta-<xsl:value-of select="@type"/></xsl:with-param>
          </xsl:call-template>
          <xsl:apply-templates/>
        </xsl:when>
        <xsl:otherwise>
          <!-- assign no class if no type-attribute is given -->
          <xsl:call-template name="applyRendition"/>
          <xsl:apply-templates/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:element>
    <!--  <xsl:call-template name="close-cb"/>-->
  </xsl:template>

  <!-- embedded in sp vs. not and indent vs. no indent -->
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
         <xsl:call-template name="applyRendition">
           <xsl:with-param name="class" select="$class"/>
         </xsl:call-template>
         <xsl:apply-templates/>
       </p>
     </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="tei:cb">
    <span class="dta-cb">
      <xsl:choose>
        <xsl:when test="@type='start'">[Beginn Spaltensatz]</xsl:when>
        <xsl:when test="@type='end'">[Ende Spaltensatz]</xsl:when>
        <xsl:otherwise>[Spaltenumbruch]</xsl:otherwise>
      </xsl:choose>
    </span>
  </xsl:template>

  <!-- DONT TOUCH -->
  <!-- column breaks, EXPERIMENTAL -->
  <!--
<img src="static/images/cb.png" alt="Spaltenumbruch" title="Spaltenumbruch" /></xsl:template>
<xsl:template match='tei:cb'>
  <xsl:if test='.. = (//tei:cb)[1]/.. and .. = (//tei:cb)[last()]/..'>
    <xsl:choose>
      <xsl:when test='count( (//tei:cb)[1] | . ) = 1'>
        <xsl:text disable-output-escaping="yes">
          &lt;table class="dta-columntext"&gt;
            &lt;tr&gt;
              &lt;td&gt;
        </xsl:text>
      </xsl:when>
      <xsl:when test='@type="end"'>
        <xsl:text disable-output-escaping="yes">
              &lt;/td&gt;
            &lt;/tr&gt;
          &lt;/table&gt;
        </xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text disable-output-escaping="yes">
          &lt;/td&gt;
          &lt;td style="border-left:1px solid #666"&gt;
        </xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:if>
</xsl:template>

<xsl:template name="close-cb">
  <xsl:if test='tei:cb and (not(tei:cb[last()][@type]) or tei:cb[last()][@type!="end"]) and (//tei:cb)[1]/.. = (//tei:cb)[last()]/..'>
    <xsl:text disable-output-escaping="yes">
          &lt;/td&gt;
        &lt;/tr&gt;
      &lt;/table&gt;
    </xsl:text>
  </xsl:if>
</xsl:template>
-->
  <!-- end column breaks -->

  <xsl:template match="tei:list">
    <xsl:choose>
      <!-- old: TODO: change all occurrences in xml fils to new version -->
      <xsl:when test='@rend="braced"'>
        <table class="dta-list">
          <xsl:choose>
            <xsl:when test="tei:trailer">
              <xsl:for-each select="tei:item">
                <tr>
                  <td class="dta-item-left">
                    <xsl:apply-templates/>
                  </td>
                  <xsl:if test="position()=1">
                    <xsl:element name="td">
                      <xsl:attribute name="class">dta-list-trailer</xsl:attribute>
                      <xsl:attribute name="rowspan">
                        <xsl:value-of select="count(../tei:item)"/>
                      </xsl:attribute>
                      <xsl:apply-templates select="../tei:trailer"/>
                    </xsl:element>
                  </xsl:if>
                </tr>
              </xsl:for-each>
            </xsl:when>
            <xsl:otherwise>
              <!-- tei:head -->
              <xsl:for-each select="tei:item">
                <tr>
                  <xsl:if test="position()=1">
                    <xsl:element name="td">
                      <xsl:attribute name="class">dta-list-head</xsl:attribute>
                      <xsl:attribute name="rowspan">
                        <xsl:value-of select="count(../tei:item)"/>
                      </xsl:attribute>
                      <xsl:apply-templates select="../tei:head"/>
                    </xsl:element>
                  </xsl:if>
                  <td class="dta-item-right">
                    <xsl:apply-templates/>
                  </td>
                </tr>
              </xsl:for-each>
            </xsl:otherwise>
          </xsl:choose>
        </table>
      </xsl:when>
      <!-- end of old -->
      <xsl:when test='contains(@rendition, "#leftBraced") and contains(@rendition, "#rightBraced")'>
        <span class="dta-braced-base dta-braced-left-right">
          <xsl:apply-templates/>
        </span>
      </xsl:when>
      <xsl:when test='contains(@rendition,"#leftBraced")'>
        <span class="dta-braced-base dta-braced-left">
          <xsl:apply-templates/>
        </span>
      </xsl:when>
      <xsl:when test='contains(@rendition,"#rightBraced")'>
        <span class="dta-braced-base dta-braced-right">
          <xsl:apply-templates/>
        </span>
      </xsl:when>

      <xsl:otherwise>
        <div class="dta-list">
          <xsl:apply-templates/>
        </div>
      </xsl:otherwise>
    </xsl:choose>
    <!--  <xsl:call-template name="close-cb"/>-->
  </xsl:template>

  <xsl:template match="tei:item">
    <xsl:choose>
      <xsl:when test="ancestor::tei:p">
        <span class="dta-list-item">
          <xsl:apply-templates/>
        </span>
      </xsl:when>
      <xsl:when test="descendant::tei:pb">
        <div class="dta-list-item-noindent">
          <xsl:apply-templates/>
        </div>
      </xsl:when>
      <xsl:otherwise>
        <div class="dta-list-item">
          <xsl:apply-templates/>
        </div>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- begin floats -->
  <xsl:template match="tei:table">
    <xsl:choose>
      <xsl:when test="not(string(.)) or not(normalize-space(.))">
        <div class="dta-gap">[Tabelle]</div>
      </xsl:when>
      <xsl:otherwise>
        <table class="dta-table">
          <xsl:if test="tei:head">
            <caption>
              <xsl:apply-templates select="tei:head"/>
            </caption>
          </xsl:if>
          <xsl:for-each select="tei:row">
            <tr>
              <xsl:for-each select="tei:cell">
                <xsl:choose>
                  <xsl:when test="../@role='label'">
                    <xsl:call-template name="applyCell">
                      <xsl:with-param name="node">th</xsl:with-param>
                    </xsl:call-template>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:call-template name="applyCell"/>
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:for-each>
            </tr>
          </xsl:for-each>
        </table>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="applyCell">
    <xsl:param name="node" select="'td'"/>
    <xsl:element name="{$node}">
      <xsl:if test="@cols">
        <xsl:attribute name="colspan">
          <xsl:value-of select="@cols"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@rows">
        <xsl:attribute name="rowspan">
          <xsl:value-of select="@rows"/>
        </xsl:attribute>
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
  </xsl:template>

  <xsl:template match="tei:floatingText">
    <xsl:element name="div">
      <xsl:call-template name="applyRendition">
        <xsl:with-param name="class" select="'dta-floatingtext'"/>
      </xsl:call-template>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match='tei:fw[@place="bottom"]' mode="signatures">
    <xsl:if test="@type='sig' or @type='catch'">
      <xsl:element name="div">
        <xsl:attribute name="class">
          <xsl:text>dta-fw-bottom-</xsl:text><xsl:value-of select="@type"/></xsl:attribute>
        <xsl:apply-templates/>
      </xsl:element>
    </xsl:if>
  </xsl:template>

  <xsl:template match='tei:fw'>
    <xsl:choose>
      <xsl:when test="@place='top'">
        <div>
          <xsl:call-template name="applyRendition">
            <xsl:with-param name="class">dta-fw-top dta-fw-<xsl:value-of select="@type"/></xsl:with-param>
          </xsl:call-template>
          <xsl:apply-templates/>
        </div>
      </xsl:when>
      <xsl:when test="@place='bottom'"/>
      <xsl:when test="@type='pageNum'"/>
    </xsl:choose>
  </xsl:template>

  <!-- begin notes -->
  <!-- editorial notes -->
  <xsl:template match='tei:note[@type="editorial"]'/>

  <!-- begin footnotes -->
  <xsl:template match='tei:note[@place="foot"]'>
    <xsl:if test="string-length(@prev)=0">
      <span class="dta-fn-intext">
        <xsl:value-of select="@n"/>
      </span>
      <xsl:text> </xsl:text>
    </xsl:if>
  </xsl:template>

  <xsl:template match='tei:note[@place="foot"]' mode="footnotes">
    <div class="dta-footnote">
      <xsl:variable name="prev" select="@prev"/>
      <xsl:choose>
        <!-- if previous is not empty or sameAs is set: -->
        <xsl:when test="(string-length(@prev)!=0 and //*[@xml:id=$prev][1]/text()) or string-length(@sameAs)!=0"/>
        <xsl:otherwise>
          <span class="dta-fn-sign">
            <xsl:value-of select="@n"/>
          </span>
        </xsl:otherwise>
      </xsl:choose>
      <!--<span class="dta-fn-sign"><xsl:value-of select='@n'/></span>-->
      <xsl:text> </xsl:text>
      <xsl:apply-templates/>
      <xsl:apply-templates select='tei:fw[@place="bottom"][@type="catch"]' mode="signatures"/>
    </div>
  </xsl:template>
  <!-- end footnotes -->

  <!-- begin end notes -->
  <xsl:template match='tei:note[@place="end"]'>
    <xsl:choose>
      <!-- occurance at the end (content of the endnote) -->
      <xsl:when test="string-length(.) &gt; 0">
        <xsl:choose>
          <!-- doesn't contain pagebreak -->
          <xsl:when test="local-name(*[1])!='pb'">
            <div class="dta-endnote dta-endnote-indent">
              <span class="dta-fn-sign">
                <xsl:value-of select="@n"/>
              </span>
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
          <xsl:value-of select="@n"/>
        </span>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- end end notes -->

  <!-- begin marginals -->
  <xsl:template match='tei:note[@place="right" and not(@type)]'>
    <xsl:value-of select="@n"/>
    <span class="dta-marginal dta-marginal-right">
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <xsl:template match='tei:note[@place="left" and not(@type)]'>
    <xsl:value-of select="@n"/>
    <span class="dta-marginal dta-marginal-left">
      <xsl:apply-templates/>
    </span>
  </xsl:template>
  <!-- end marginals -->

  <!-- end notes -->

  <xsl:template match="tei:figure">
    <xsl:choose>
      <xsl:when
        test="((local-name(preceding-sibling::*[1]) = 'lb'
            and not(normalize-space(preceding-sibling::*[1]/following-sibling::text()[1]))
          or not(preceding-sibling::* or normalize-space(preceding-sibling::text())))
        and (local-name(following-sibling::*[1]) = 'lb'
            and not(normalize-space(following-sibling::*[1]/preceding-sibling::text()[1]))
            or not(following-sibling::* or normalize-space(following-sibling::text()))))
              or @rendition='#c'">
        <xsl:call-template name="applyFigure">
          <xsl:with-param name="node">div</xsl:with-param>
          <xsl:with-param name="class">dta-phbl dta-figure</xsl:with-param>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="applyFigure">
          <xsl:with-param name="node">span</xsl:with-param>
          <xsl:with-param name="class">dta-ph dta-figure</xsl:with-param>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="applyFigure">
    <xsl:param name="node"/>
    <xsl:param name="class"/>
    <xsl:element name="{$node}">
      <xsl:attribute name="class"><xsl:value-of select="$class"/></xsl:attribute>
      <xsl:attribute name="type"><xsl:value-of select="count(preceding::tei:figure)+1"
      /></xsl:attribute>
      <xsl:if test="@rendition='#c'">
        <xsl:attribute name="style">text-align:center</xsl:attribute>
      </xsl:if>
      <xsl:if test="@facs">
        <xsl:element name="img">
          <xsl:attribute name="src"><xsl:value-of select="@facs"/></xsl:attribute>
        </xsl:element><br/>
      </xsl:if> [<xsl:choose>
        <xsl:when test="@type='notatedMusic'">Musik</xsl:when>
        <xsl:otherwise>Abbildung</xsl:otherwise>
      </xsl:choose>
      <xsl:if test="tei:figDesc"><xsl:text> </xsl:text><xsl:apply-templates select="tei:figDesc"
        mode="figdesc"/></xsl:if>] <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="tei:figDesc"/>
  <xsl:template match="tei:figDesc" mode="figdesc">
    <xsl:apply-templates/>
  </xsl:template>

  <!-- end floats -->

  <!-- end structural -->

  <!-- end TEXT STUCTURE ELEMENTS -->

  <!-- ____________________________________ -->

  <!-- begin PHRASE STUCTURE ELEMENTS -->

  <!-- begin citations (2) -->
  <xsl:template match="tei:quote">
    <q class="dta-quote">
      <xsl:apply-templates/>
    </q>
  </xsl:template>

  <xsl:template match="tei:q">
    <q class="dta-quote">
      <xsl:apply-templates/>
    </q>
  </xsl:template>
  <!-- end citations (2) -->

  <!-- renditions -->
  <xsl:template match="tei:hi">
    <xsl:element name="span">
      <xsl:call-template name="applyRendition"/>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>
  <!-- end renditions -->

  <xsl:template match="tei:formula">
    <xsl:choose>
      <xsl:when test="@notation='TeX'">
        <xsl:element name="span">
          <xsl:attribute name="class">dta-formula</xsl:attribute>
          <xsl:if test="@rendition='#c'">
            <xsl:attribute name="style">display:block; text-align:center</xsl:attribute>
          </xsl:if>
          <xsl:element name="img">
            <xsl:attribute name="style">vertical-align:middle; -moz-transform:scale(0.7); -webkit-transform:scale(0.7); transform:scale(0.7)</xsl:attribute>
            <!--          <xsl:choose>
            <xsl:when test="@rendition">
              <xsl:call-template name="applyRendition"/>
              <xsl:attribute name="src">
                <xsl:text>http://dinglr.de/formula/</xsl:text><xsl:value-of select="dta:urlencode(.)"/>
              </xsl:attribute>
            </xsl:when>
            <xsl:otherwise>-->
            <xsl:attribute name="src">
              <xsl:text>http://dinglr.de/formula/</xsl:text>
              <xsl:call-template name="url-encode">
                <xsl:with-param name="str" select="string(.)"/>
              </xsl:call-template>
              <!-- <xsl:value-of select="custom:uriencode(string(.))"/>   -->
            </xsl:attribute>
            <!--            </xsl:otherwise>
          </xsl:choose>-->
          </xsl:element>
        </xsl:element>
      </xsl:when>
      <xsl:when test="string-length(.) &gt; 0">
        <!-- TODO: no span? (applyRendition) no occurences found!! -->
        <xsl:apply-templates/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:element name="span">
          <xsl:call-template name="applyRendition">
            <xsl:with-param name="class">dta-ph dta-formula-<xsl:value-of
              select="count(preceding::tei:formula)+1"/></xsl:with-param>
          </xsl:call-template>
          <xsl:attribute name="onclick">editFormula(<xsl:value-of
            select="count(preceding::tei:formula)+1"/>)</xsl:attribute>
          <xsl:attribute name="style">cursor:pointer</xsl:attribute> [Formel <xsl:value-of
            select="count(preceding::tei:formula)+1"/>] </xsl:element>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="tei:foreign">
    <span class="dta-foreign" title="fremdsprachliches Material">
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

  <xsl:template match="tei:ref">
    <xsl:element name="span">
      <xsl:attribute name="class">dta-ref</xsl:attribute>
      <xsl:choose>
        <xsl:when
          test="starts-with(@target, '#f') or starts-with(@target, 'http') or starts-with(@target, 'BrN3E.htm') or starts-with(@target, 'ZgZuE.htm')">
          <xsl:attribute name="data-target">
            <xsl:value-of select="@target"/>
          </xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
         <!-- no operation -->
        </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="tei:date">
    <span class="dta-date">
      <xsl:apply-templates/>
    </span>
  </xsl:template>


  <xsl:template match="tei:name">
    <span class="dta-name">
      <xsl:apply-templates/>
    </span>
  </xsl:template>


  <xsl:template match="tei:orgName">
    <span class="dta-orgname">
      <xsl:apply-templates/>
    </span>
  </xsl:template>


  <xsl:template match="tei:persName">
    <span class="dta-persname">
      <xsl:apply-templates/>
    </span>
  </xsl:template>


  <xsl:template match="tei:placeName">
    <span class="dta-placename">
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <!-- end PHRASE STUCTURE ELEMENTS -->

  <!-- ____________________________________ -->

  <!-- begin NO CERTAIN STRUCTURE ELEMENTS -->

  <!-- begin editorial -->

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
          <xsl:attribute name="title"><xsl:apply-templates select="tei:expan" mode="choice"/></xsl:attribute>
          <xsl:attribute name="class">dta-abbr</xsl:attribute>
          <xsl:apply-templates select="tei:abbr" mode="choice"/>
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

  <xsl:template match="tei:reg" mode="choice">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="tei:orig" mode="choice">
    <!-- used as attribute -->
    <xsl:value-of select="string(.)"/>
  </xsl:template>

  <xsl:template match="tei:abbr" mode="choice">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="tei:expan" mode="choice">
    <!-- used as attribute -->
    <xsl:value-of select="string(.)"/>
  </xsl:template>

  <xsl:template match="tei:corr" mode="choice">
    <xsl:choose>
      <xsl:when test="not(string(.))">
        <xsl:text>[&#8230;]</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="tei:sic" mode="choice">
    <!-- used as attribute -->
    <xsl:value-of select="string(.)"/>
  </xsl:template>

  <xsl:template match="tei:gap">
    <span class="dta-gap">
      <xsl:text>[</xsl:text>
      <xsl:if test="contains(concat(' ', @reason, ' '), ' lost ')">verlorenes </xsl:if>
      <xsl:if test="contains(concat(' ', @reason, ' '), ' insignificant ')">irrelevantes </xsl:if>
      <xsl:if test="contains(concat(' ', @reason, ' '), ' fm ')">fremdsprachliches </xsl:if>
      <xsl:if test="contains(concat(' ', @reason, ' '), ' illegible ')">unleserliches </xsl:if>
      <xsl:if test="@reason">Material</xsl:if>
      <xsl:if test="@unit and @reason">
        <xsl:text> – </xsl:text>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="@unit">
          <xsl:if test="@quantity">
            <xsl:value-of select="@quantity"/>
            <xsl:text> </xsl:text>
          </xsl:if>
          <xsl:choose>
            <xsl:when test="@unit='pages' and @quantity!=1">Seiten</xsl:when>
            <xsl:when test="@unit='pages' and (@quantity=1 or not(@quantity))">Seite</xsl:when>
            <xsl:when test="@unit='lines' and @quantity!=1">Zeilen</xsl:when>
            <xsl:when test="@unit='lines' and (@quantity=1 or not(@quantity))">Zeile</xsl:when>
            <xsl:when test="@unit='words' and @quantity!=1">Wörter</xsl:when>
            <xsl:when test="@unit='words' and (@quantity=1 or not(@quantity))">Wort</xsl:when>
            <xsl:when test="@unit='chars'">Zeichen</xsl:when>
          </xsl:choose>
          <xsl:text> fehl</xsl:text>
          <xsl:if test="@quantity=1 or not(@quantity)">t</xsl:if>
          <xsl:if test="@quantity!=1">en</xsl:if>
        </xsl:when>
        <!--      <xsl:otherwise>
        <xsl:text> ...</xsl:text>
      </xsl:otherwise>-->
      </xsl:choose>
      <xsl:text>]</xsl:text>
    </span>
  </xsl:template>

  <xsl:template match="tei:supplied">
    <span class="dta-supplied">
      <xsl:text>[</xsl:text>
      <xsl:apply-templates/>
      <xsl:text>]</xsl:text>
    </span>
    <!--<span class="dta-supplied"><xsl:apply-templates/></span>-->
  </xsl:template>

  <!-- end editorial -->

  <!-- end NO CERTAIN STRUCTURE ELEMENTS -->

  <!-- ____________________________________ -->



  <!-- place holders -->

  <!-- end place holders -->



  <xsl:template match="text()">
      <xsl:value-of select="."/>
  </xsl:template>

</xsl:stylesheet>

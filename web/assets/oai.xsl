<?xml version="1.0" encoding="utf-8"?>

<!--

  XSL Transform to convert OAI 2.0 responses into XHTML

  By Christopher Gutteridge, University of Southampton

-->

<!-- 

Derivative work Copyright (C) 2011 by Thomas Berger ThB <at> gymel.com 
cf. http://svn.gymel.com/viewvc/allegro/oai/trunk/fixoai/styles/ 
or  $HeadURL: https://svn.extra.gymel.com/repos/allegro/oai/trunk/fixoai/styles/oai2.xsl $

This stylesheet is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This stylesheet is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this stylesheet.  If not, see <http://www.gnu.org/licenses/>.

Original work loaded from http://www.eprints.org/files/xslt/oai2.xsl.v1.0
Orignal Copyright notice as follows:

-->
<!-- 
  
Copyright (c) 2000-2004 University of Southampton, UK. SO17 1BJ.

EPrints 2 is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

EPrints 2 is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with EPrints 2; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

-->
   
<!--
  
  All the elements really needed for EPrints are done but if
  you want to use this XSL for other OAI archive you may want
  to make some minor changes or additions.

  Not Done
    The 'compession' part of 'identify'
    Provenance

  Many links just link to oai_dc versions of records.

-->
<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:oai="http://www.openarchives.org/OAI/2.0/"
>

<xsl:output method="html"/>

<xsl:param name="identify-doc" select="concat(normalize-space(//oai:OAI-PMH/oai:request), '?verb=Identify')"/>
<xsl:variable name="self" select="document($identify-doc)/oai:OAI-PMH/oai:Identify" />

<xsl:variable name="icon" select="($self/oai:description/x:branding)[1]" xmlns:x="http://www.openarchives.org/OAI/2.0/branding/" />
<xsl:param name="favicon" select="($self/oai:description/x:branding/x:collectionIcon[contains(concat(x:url, '!!!'), '.ico!!!')])[1]/x:url" xmlns:x="http://www.openarchives.org/OAI/2.0/branding/" />

<xsl:param name="BLtemplate" select="($self/oai:description/x:backlinks/x:urlTemplate[@type='text/html'])[1]" xmlns:x="http://www.findbuch.de/OAI/2.0/backlinks/" />

<xsl:variable name="granlength">
  <xsl:choose>
    <xsl:when test="$self/oai:granularity">
      <xsl:value-of select="string-length(normalize-space($self/oai:granularity))"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="20"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:variable>

<xsl:variable name="meta" select="($self/oai:description/x:dc)[1]" xmlns:x="http://www.openarchives.org/OAI/2.0/oai_dc/" />

<xsl:variable name='identifier' select="substring-before(concat(substring-after(/oai:OAI-PMH/oai:request,'identifier='),'&amp;'),'&amp;')" />

<!-- MAB display constants -->
<xsl:variable name="CRLF" select="'&#x0D;&#x0A;'" />
<xsl:variable name="UFZVisual" select="'&#x25BE;'" />
<xsl:variable name="TFZ" select="'&#x2021;'" />
<xsl:variable name="NSB" select="'&#xAC;'" />
<xsl:variable name="NSE" select="'&#x2319;'" />
<xsl:variable name="SWB" select="'{'" />
<xsl:variable name="SWE" select="'}'" />

<xsl:template name="style">
td.value {
	vertical-align: top;
	padding-left: 1em;
	padding: 3px;
}
td.errval {
	background-color: #ffc0c0;
	vertical-align: top;
	padding-left: 1em;
	padding: 3px;
}
td.key {
	background-color: #e0e0ff;
	padding: 3px;
	text-align: right;
	border: 1px solid #c0c0c0;
	white-space: nowrap;
	font-weight: bold;
	vertical-align: top;
}
.dcdata td.key {
	background-color: #ffffe0;
}
div.mabdump {
	background-color: #ffe0ff;
	white-space: pre;
	font-family: monospace;
	font-size: 70%;
	border: solid #c0c0a0 1px;
	background-color: #ffffe0;
	padding: 2em 2em 2em 0em;
	overflow: auto;
}
span.mabtag { color: #282; }
span.mabsubtag {
	color: #822;
	padding: 0ex 1ex;
}

body { 
	margin: 1em 2em 1em 2em;
}
h1, h2, h3 {
	font-family: sans-serif;
	clear: left;
}
h1 {
	padding-bottom: 4px;
	margin-bottom: 0px;
}
h2 {
	margin-bottom: 0.5em;
}
h3 {
	margin-bottom: 0.3em;
	font-size: medium;
}
.link {
	border: 1px outset #88f;
	background-color: #c0c0ff;
	padding: 1px 4px 1px 4px;
	font-size: 80%;
	text-decoration: none;
	font-weight: bold;
	font-family: sans-serif;
	color: black;
}
.link:hover {
	color: red;
}
.link:active {
	color: red;
	border: 1px inset #88f;
	background-color: #a0a0df;
}
.oaiRecord, .oaiRecordTitle {
	background-color: #f0f0ff;
	border-style: solid;
	border-color: #d0d0d0;
}
h2.oaiRecordTitle {
	background-color: #e0e0ff;
	font-size: medium;
	font-weight: bold;
	padding: 10px;
	border-width: 2px 2px 0px 2px;
	margin: 0px;
}
.oaiRecord {
	margin-bottom: 3em;
	border-width: 2px;
	padding: 10px;
}

.results {
	margin-bottom: 1.5em;
}
ul.quicklinks {
	margin-top: 2px;
	padding: 4px;
	text-align: left;
	border-bottom: 2px solid #ccc;
	border-top: 2px solid #ccc;
	clear: left;
}
ul.quicklinks li {
	font-size: 80%;
	display: inline;
	list-style: none;
	font-family: sans-serif;
}
p.intro {
	font-size: 80%;
}
div.orga {
	margin-top: 2px;
	padding: 4px;
	text-align: right;
	border-left: 2px solid #ccc;
	float: right;
}
div.orga p {
	float: left;
}

body {
 <xsl:choose>
   <xsl:when test="//oai:resumptionToken/@cursor">
	counter-reset: list <xsl:value-of select="//oai:resumptionToken/@cursor" />;
   </xsl:when>
   <xsl:otherwise>
	counter-reset: list 0;
   </xsl:otherwise>
 </xsl:choose>
}

h2.counted:before, h3.counted:before {
	counter-increment: list;
	content: "(" counter(list) ") ";
}
<xsl:call-template name='xmlstyle' />
</xsl:template>

<xsl:template match="/">
<html>
  <head>
    <title>OAI 2.0 Request Results - <xsl:value-of select="$self/oai:repositoryName" /></title>
    <xsl:if test="$favicon">
      <link rel="shortcut icon" type="image/x-icon" href="{$favicon}" />
    </xsl:if>
    <style><xsl:call-template name="style"/></style>
    <meta http-equiv="Content-Script-Type" content="text/javascript"></meta>
  </head>
  <body>
    <h1>OAI 2.0 Request Results</h1>
    <p>
      <xsl:choose>
	<xsl:when test="$meta/dc:title" xmlns:dc="http://purl.org/dc/elements/1.1/">
	  <xsl:value-of select="$meta/dc:title" />
	</xsl:when>
	<xsl:otherwise>
	  <xsl:value-of select="$self/oai:repositoryName" />
	</xsl:otherwise>
      </xsl:choose>
    </p>

    <xsl:apply-templates mode="brandit" select="$icon" />

    <xsl:call-template name="quicklinks"/>
    <p class="intro">You are viewing an HTML version of the XML OAI response. To see the underlying XML use your web browsers view source option. More information about this XSLT is at the <a href="#moreinfo">bottom of the page</a>.</p>
    <xsl:apply-templates select="/oai:OAI-PMH" />

    <div class="orga">
      <a href="{concat('mailto:', $self/oai:adminEmail[1])}">Contact</a>
    </div>
    <xsl:apply-templates mode="copystring" select="$meta/dc:creator" xmlns:dc="http://purl.org/dc/elements/1.1/" />

    <xsl:call-template name="quicklinks"/>
    <h2><a name="moreinfo">About the XSLT</a></h2>
    <p>An XSLT file has converted the <a href="http://www.openarchives.org">OAI-PMH 2.0</a> responses into XHTML which looks nice in a browser which supports XSLT such as Mozilla, Firebird and Internet Explorer. The XSLT file was originally created by <a href="http://www.ecs.soton.ac.uk/people/cjg">Christopher Gutteridge</a> at the University of Southampton as part of the <a href="http://software.eprints.org">GNU EPrints system</a>, and is freely redistributable under the <a href="http://www.gnu.org">GPL</a>.</p><p>If you want to use the XSL file on your own OAI interface you may but due to the way XSLT works you must install the XSL file on the same server as the OAI script, you can't just link to this copy.</p><p>For more information or to download the XSL file please see the <a href="http://software.eprints.org/xslt.php">OAI to XHTML XSLT homepage</a>.</p>
    <p>Or, see the <a href="http://svn.gymel.com/viewvc/allegro/oai/trunk/fixoai/styles/">home of this adapted version</a> of the stylesheet.</p>
  </body>
</html>
</xsl:template>

<xsl:template name="quicklinks">
    <ul class="quicklinks">
      <li><a href="?verb=Identify">Identify</a> | </li> 
      <li><a href="?verb=ListRecords&amp;metadataPrefix=oai_dc">ListRecords</a> | </li>
      <li><a href="?verb=ListSets">ListSets</a> | </li>
      <li><a href="?verb=ListMetadataFormats">ListMetadataFormats</a> | </li>
      <li><a href="?verb=ListIdentifiers&amp;metadataPrefix=oai_dc">ListIdentifiers</a></li>
    </ul>
</xsl:template>

<xsl:template mode="copystring" match="dc:creator" xmlns:dc="http://purl.org/dc/elements/1.1/">
    <div class="orga">&#xA9;
      <xsl:if test="../dc:date">
	<xsl:value-of select="concat(../dc:date, ', ')"/>
      </xsl:if>
      <xsl:value-of select="."/>
    </div>
</xsl:template>

<xsl:template mode="brandit" match="br:branding" xmlns:br="http://www.openarchives.org/OAI/2.0/branding/">
    <div class="orga">
      <xsl:apply-templates mode="brand" select="./br:collectionIcon" />
    </div>
</xsl:template>


<xsl:template match="/oai:OAI-PMH">
  <table class="values">
    <tr><td class="key">Datestamp of response</td>
    <td class="value"><xsl:value-of select="oai:responseDate"/></td></tr>
    <tr><td class="key">Request URL</td>
    <td class="value"><xsl:value-of select="oai:request"/></td></tr>
  </table>
<!--  verb: [<xsl:value-of select="oai:request/@verb" />]<br /> -->
  <xsl:choose>
    <xsl:when test="oai:error">
      <p>The request could not be completed due to the following error or errors.</p>
      <h2>OAI Error(s)</h2>
      <div class="results">
	<xsl:apply-templates select="oai:error"/>
      </div>
      <xsl:if test="(count(oai:error) = 1) and (oai:error/@code = 'noRecordsMatch')">
	<xsl:apply-templates mode="detailsmod" select="./oai:request" />
      </xsl:if>
    </xsl:when>
    <xsl:otherwise>
      <xsl:choose>
	<xsl:when test="oai:request/@identifier">
	  <xsl:choose>
	    <xsl:when test="count(oai:request/@metadataPrefix) &gt; 0">
	      <p>Request was of type <strong><xsl:value-of select="oai:request/@verb"/></strong>
		 for the identifier "<xsl:value-of select="oai:request/@identifier"/>"
		 with format "<xsl:value-of select="oai:request/@metadataPrefix"/>".
	      </p>
	    </xsl:when>
	    <xsl:otherwise>
	      <p>Request was of type <strong><xsl:value-of select="oai:request/@verb"/></strong>
		 for the identifier "<xsl:value-of select="oai:request/@identifier"/>".
	      </p> 
	    </xsl:otherwise>
	  </xsl:choose>
	</xsl:when>
	<xsl:when test="oai:request/@resumptionToken">
	  <p>Request was a resumption of type <xsl:value-of select="oai:request/@verb"/>.</p>
	</xsl:when>
	<xsl:otherwise>
	  <p>Request was of type <xsl:value-of select="oai:request/@verb"/>.</p>
	  <xsl:apply-templates mode="detailsmod" select="./oai:request" />
	</xsl:otherwise>
      </xsl:choose>
      <div class="results">
	<xsl:apply-templates select="oai:Identify" />
	<xsl:apply-templates select="oai:GetRecord"/>
	<xsl:apply-templates select="oai:ListRecords"/>
	<xsl:apply-templates select="oai:ListSets"/>
	<xsl:apply-templates select="oai:ListMetadataFormats"/>
	<xsl:apply-templates select="oai:ListIdentifiers"/>
      </div>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>


<!-- ERROR -->

<xsl:template match="/oai:OAI-PMH/oai:error">
  <table class="values">
    <tr><td class="key">Error Code</td>
      <td class="errval"><xsl:value-of select="@code"/></td></tr>
    <tr><td class="key">Additional Info</td>
      <td class="value"><xsl:value-of select="."/></td></tr>
  </table>
</xsl:template>


<!-- Request details -->

<xsl:template mode="detailsmod" match="oai:request[(@verb='ListIdentifiers') or (@verb='ListRecords')]">
 <h3>Request Details</h3>
 <form action="" method="get">
  <table>
   <tr>
    <td class="key" align="left">verb</td>
    <td class="key" align="left">from</td>
    <td class="key" align="left">until</td>
    <td class="key" align="left">set</td>
    <td class="key" align="left">metadataPrefix</td>
    <td class="key">&#160;</td>
   </tr>
   <tr>
    <td>
     <select name="verb">
      <xsl:element name="option">
	<xsl:attribute name="value">ListIdentifiers</xsl:attribute>
	  <xsl:if test="@verb='ListIdentifiers'">
	    <xsl:attribute name="selected">selected</xsl:attribute>
	  </xsl:if>
	<xsl:text>List Identifiers</xsl:text>
      </xsl:element>
      <xsl:element name="option">
	<xsl:attribute name="value">ListRecords</xsl:attribute>
	  <xsl:if test="@verb='ListRecords'">
	    <xsl:attribute name="selected">selected</xsl:attribute>
	  </xsl:if>
	<xsl:text>List Records</xsl:text>
      </xsl:element>
     </select>
    </td>
    <td><input type="text" name="from" value="{@from}" size="20" maxlength="{$granlength}"/></td>
    <td><input type="text" name="until" value="{@until}" size="20" maxlength="{$granlength}"/></td>
    <td><input type="text" name="set" value="{@set}" size="10" /> <a class="link" href="?verb=ListSets">sets</a></td>
    <td><input type="text" name="metadataPrefix" value="{@metadataPrefix}" size="10" /> <a class="link" href="?verb=ListMetadataFormats">formats</a></td>
    <td><input type="button" name="doit" value="submit" onClick="this.form.submit()" /></td>
   </tr>
  </table>
 </form>
</xsl:template>

<xsl:template mode="detailsmod" match="oai:request" >
</xsl:template>


<!-- IDENTIFY -->

<xsl:template match="/oai:OAI-PMH/oai:Identify">
  <h2>Identification of the OAI 2.0 Repository</h2>
  <h3>Basic Information</h3>
  <table class="values">
    <tr><td class="key">Repository Name</td>
    <td class="value"><xsl:value-of select="oai:repositoryName"/></td></tr>
    <tr><td class="key">Base URL</td>
    <td class="value"><xsl:value-of select="oai:baseURL"/></td></tr>
    <tr><td class="key">Protocol Version</td>
    <td class="value"><xsl:value-of select="oai:protocolVersion"/></td></tr>
    <tr><td class="key">Earliest Datestamp</td>
    <td class="value"><xsl:value-of select="oai:earliestDatestamp"/></td></tr>
    <tr><td class="key">Deleted Record Policy</td>
    <td class="value"><xsl:value-of select="oai:deletedRecord"/></td></tr>
    <tr><td class="key">Granularity</td>
    <td class="value"><xsl:value-of select="oai:granularity"/></td></tr>
    <xsl:apply-templates select="oai:adminEmail"/>
  </table>
  <xsl:apply-templates select="oai:description"/>
<!--no warning about unsupported descriptions -->
</xsl:template>

<xsl:template match="/oai:OAI-PMH/oai:Identify/oai:adminEmail">
    <tr><td class="key">Admin Email</td>
    <td class="value"><xsl:value-of select="."/></td></tr>
</xsl:template>

<!--
   Identify / Unsupported Description
-->

<xsl:template match="oai:description/*" priority="-100">
  <h3>Unsupported Description Type</h3>
  <p>The XSL currently does not support this type of description.</p>
  <div class="xmlSource">
    <xsl:apply-templates select="." mode='xmlMarkup' />
  </div>
</xsl:template>


<!--
   Identify / OAI-Identifier
-->

<xsl:template match="id:oai-identifier" xmlns:id="http://www.openarchives.org/OAI/2.0/oai-identifier">
  <h2>OAI-Identifier</h2>
  The Identifiers used for the purpose of this repository are formed according to the following structure:
  <table class="values">
    <tr><td class="key">Scheme</td>
    <td class="value"><xsl:value-of select="id:scheme"/></td></tr>
    <tr><td class="key">Repository Identifier</td>
    <td class="value"><xsl:value-of select="id:repositoryIdentifier"/></td></tr>
    <tr><td class="key">Delimiter</td>
    <td class="value"><xsl:value-of select="id:delimiter"/></td></tr>
    <tr><td class="key">Sample OAI Identifier</td>
    <td class="value"><xsl:value-of select="id:sampleIdentifier"/>
      <xsl:variable name="escapedid">
	<xsl:call-template name="escapeURL">
	  <xsl:with-param name="string" select="id:sampleIdentifier" />
	</xsl:call-template>
      </xsl:variable>
      <xsl:text> </xsl:text><a class="link" href="?verb=GetRecord&amp;metadataPrefix=oai_dc&amp;identifier={$escapedid}">oai_dc</a>
      <xsl:text> </xsl:text><a class="link" href="?verb=ListMetadataFormats&amp;identifier={$escapedid}">formats</a>
    </td>
   </tr>
  </table>
</xsl:template>


<!--
   Identify / EPrints
-->

<xsl:template match="ep:eprints" xmlns:ep="http://www.openarchives.org/OAI/1.1/eprints">
  <h2>EPrints Description</h2>
  <h3>Content</h3>
  <xsl:apply-templates select="ep:content"/>
  <xsl:if test="ep:submissionPolicy">
    <h3>Submission Policy</h3>
    <xsl:apply-templates select="ep:submissionPolicy"/>
  </xsl:if>
  <h3>Metadata Policy</h3>
  <xsl:apply-templates select="ep:metadataPolicy"/>
  <h3>Data Policy</h3>
  <xsl:apply-templates select="ep:dataPolicy"/>
  <xsl:if test="ep:content">
    <h3>Content</h3>
    <xsl:apply-templates select="ep:content"/>
  </xsl:if>
  <xsl:apply-templates select="ep:comment"/>
</xsl:template>

<xsl:template match="ep:content|ep:dataPolicy|ep:metadataPolicy|ep:submissionPolicy" xmlns:ep="http://www.openarchives.org/OAI/1.1/eprints">
  <xsl:if test="ep:text">
    <p><xsl:value-of select="ep:text" /></p>
  </xsl:if>
  <xsl:if test="ep:URL">
    <div><a href="{ep:URL}"><xsl:value-of select="ep:URL" /></a></div>
  </xsl:if>
</xsl:template>

<xsl:template match="ep:comment" xmlns:ep="http://www.openarchives.org/OAI/1.1/eprints">
  <h3>Comment</h3>
  <div><xsl:value-of select="."/></div>
</xsl:template>


<!--
   Identify / Friends
-->

<xsl:template match="fr:friends" xmlns:fr="http://www.openarchives.org/OAI/2.0/friends/">
  <h2>Friends</h2>
  <ul>
    <xsl:apply-templates select="fr:baseURL"/>
  </ul>
</xsl:template>

<xsl:template match="fr:baseURL" xmlns:fr="http://www.openarchives.org/OAI/2.0/friends/">
  <li><xsl:value-of select="."/> 
<xsl:text> </xsl:text>
<a class="link" href="{.}?verb=Identify">Identify</a></li>
</xsl:template>


<!--
   Identify / Branding
-->

<xsl:template match="br:branding" xmlns:br="http://www.openarchives.org/OAI/2.0/branding/">
  <h2>Branding</h2>
  <xsl:apply-templates select="br:collectionIcon"/>
  <xsl:apply-templates select="br:metadataRendering"/>
</xsl:template>

<xsl:template match="br:collectionIcon" xmlns:br="http://www.openarchives.org/OAI/2.0/branding/">
  <h3>Icon</h3>
  <xsl:apply-templates mode="brand" select="."/>
</xsl:template>

<xsl:template mode="brand" match="br:collectionIcon" xmlns:br="http://www.openarchives.org/OAI/2.0/branding/">
  <xsl:choose>
    <xsl:when test="br:link!=''">
      <a href="{br:link}" title="{br:title}"><img src="{br:url}" width="{br:width}" height="{br:height}" border="0" /></a>
    </xsl:when>
    <xsl:otherwise>
      <img src="{br:url}" alt="{br:title}" width="{br:width}" height="{br:height}" border="0" />
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="br:metadataRendering" xmlns:br="http://www.openarchives.org/OAI/2.0/branding/">
  <h3>Metadata Rendering Rule</h3>
  <table class="values">
    <tr><td class="key">URL</td>
    <td class="value"><xsl:value-of select="."/></td></tr>
    <tr><td class="key">Namespace</td>
    <td class="value"><xsl:value-of select="@metadataNamespace"/></td></tr>
    <tr><td class="key">Mime Type</td>
    <td class="value"><xsl:value-of select="@mimeType"/></td></tr>
  </table>
</xsl:template>



<!--
   Identify / Gateway
-->

<xsl:template match="gw:gateway" xmlns:gw="http://www.openarchives.org/OAI/2.0/gateway/">
  <h2>Gateway Information</h2>
  <table class="values">
    <tr><td class="key">Source</td>
    <td class="value"><xsl:value-of select="gw:source"/></td></tr>
    <tr><td class="key">Description</td>
    <td class="value"><xsl:value-of select="gw:gatewayDescription"/></td></tr>
    <xsl:apply-templates select="gw:gatewayAdmin"/>
    <xsl:if test="gw:gatewayURL">
      <tr><td class="key">URL</td>
      <td class="value"><xsl:value-of select="gw:gatewayURL"/></td></tr>
    </xsl:if>
    <xsl:if test="gw:gatewayNotes">
      <tr><td class="key">Notes</td>
      <td class="value"><xsl:value-of select="gw:gatewayNotes"/></td></tr>
    </xsl:if>
  </table>
</xsl:template>

<xsl:template match="gw:gatewayAdmin" xmlns:gw="http://www.openarchives.org/OAI/2.0/gateway/">
  <tr><td class="key">Admin</td>
  <td class="value"><xsl:value-of select="."/></td></tr>
</xsl:template>


<!--
   Identify / rightsManifest + GetRecord / rights
-->

<xsl:template match="ri:rightsManifest" xmlns:ri="http://www.openarchives.org/OAI/2.0/rights/">
  <h2>Rights Manifest</h2>
  <p>List of all the rights expressions that apply to metadata disseminated by this repository.</p>
  <table class="values">
    <xsl:apply-templates select="ri:rights" />
  </table>
</xsl:template>

<xsl:template match="oai:about/ri:rights" xmlns:ri="http://www.openarchives.org/OAI/2.0/rights/">
  <table class="values">
    <xsl:apply-templates />
  </table>
</xsl:template>

<xsl:template match="ri:rightsReference" xmlns:ri="http://www.openarchives.org/OAI/2.0/rights/">
  <tr>
    <td class="key">License document</td>
    <td class="value"><a href="{@ref}"><xsl:value-of select="@ref" /></a></td>
  </tr>
</xsl:template>

<xsl:template match="ri:rightsDefinition" xmlns:ri="http://www.openarchives.org/OAI/2.0/rights/">
  <tr>
    <td class="key">License Terms</td>
    <td class="value">
      <xsl:apply-templates select="*" mode="rights" />
    </td>
  </tr>
</xsl:template>

<xsl:template match="oai_dc:dc" mode="rights" xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" >
    <table class="dcdata">
      <xsl:apply-templates select="*" />
    </table>
</xsl:template>

<xsl:template match="*" mode="rights">
  <!-- "de"-mode -->
  <xsl:apply-templates select="." />
</xsl:template>

<!--
   Identify + GetRecord / backlink
-->

<xsl:template match="bl:backlinks" xmlns:bl="http://www.findbuch.de/OAI/2.0/backlinks/" >
  <xsl:choose>
    <xsl:when test="count(./bl:backReference) &gt; 0">
      <h3>Backlinks</h3>
      <p>This record in other contexts or formats:
	<xsl:for-each select="./bl:backReference">
	  <xsl:text> </xsl:text><a class="link" title="{@rel}" href="{@ref}"><xsl:value-of select="@type" /></a>
	</xsl:for-each>
      </p>
    </xsl:when>
    <xsl:when test="count(./bl:urlTemplate) &gt; 0">
      <h2>Backlinks</h2>
      <p>You may access individual records in other formats or contexts by substituting the indicated placeholder by the OAI Identifier.</p>
      <xsl:apply-templates />
    </xsl:when>
  </xsl:choose>
</xsl:template>

<xsl:template match="bl:urlTemplate" xmlns:bl="http://www.findbuch.de/OAI/2.0/backlinks/" >
  <h3>Back link template</h3>
  <table class="values">
    <tr><td class="key">Mime Type</td><td class="value"><xsl:value-of select="@type" /></td></tr>
    <tr><td class="key">Relation</td><td class="value"><xsl:value-of select="@rel" /></td></tr>
    <tr><td class="key">Reverse relation</td><td class="value"><xsl:value-of select="@rev" /></td></tr>
    <tr><td class="key">Placeholder</td><td class="value"><kbd><xsl:value-of select="@placeHolder" /></kbd></td></tr>
    <tr><td class="key">URL Template</td><td class="value"><xsl:value-of select="." /></td></tr>
  </table>
</xsl:template>


<!--
   Identify / Toolkit
-->

<xsl:template match="tk:toolkit" xmlns:tk="http://oai.dlib.vt.edu/OAI/metadata/toolkit">
  <h2>Toolkit</h2>
  <table class="values">
    <tr><td class="key">Title</td>
      <td class="value"><xsl:value-of select="tk:title" /></td></tr>
    <tr><td class="key">Author</td>
      <td class="value"><xsl:apply-templates select="tk:author" /></td></tr>
    <tr><td class="key">Version</td>
      <td class="value"><xsl:value-of select="tk:version" /></td></tr>
    <tr><td class="key">Icon</td>
      <td class="value"><xsl:apply-templates select="tk:toolkitIcon" /></td></tr>
    <tr><td class="key">URL</td>
      <td class="value"><xsl:apply-templates select="tk:URL" /></td></tr>
  </table>
</xsl:template>

<xsl:template match="tk:author" xmlns:tk="http://oai.dlib.vt.edu/OAI/metadata/toolkit">
  <xsl:choose>
    <xsl:when test="tk:name">
      <xsl:value-of select="tk:name" />
      <xsl:if test="tk:institution">
	<xsl:value-of select="concat(' (', tk:institution, ')')" />
      </xsl:if>
      <xsl:if test="tk:email">
	<xsl:value-of select="concat(' &lt; ', tk:email, ' &gt;')" />
      </xsl:if>
    </xsl:when>
    <xsl:when test="tk:institution">
      <xsl:value-of select="tk:institution" />
      <xsl:if test="tk:email">
	<xsl:value-of select="concat(' &lt; ', tk:email, ' &gt;')" />
      </xsl:if>
    </xsl:when>
    <xsl:when test="tk:email">
      <xsl:value-of select="tk:email" />
    </xsl:when>
  </xsl:choose>
</xsl:template>

<xsl:template match="tk:toolkitIcon" xmlns:tk="http://oai.dlib.vt.edu/OAI/metadata/toolkit">
  <xsl:value-of select="." /><xsl:text> </xsl:text><img alt="toolkitIcon" src="{.}"/>
</xsl:template>

<xsl:template match="tk:URL" xmlns:tk="http://oai.dlib.vt.edu/OAI/metadata/toolkit">
  <a href="{.}"><xsl:value-of select="." /></a>
</xsl:template>


<!-- GetRecord -->

<xsl:template match="oai:GetRecord">
  <xsl:apply-templates select="oai:record" />
</xsl:template>

<!-- ListRecords -->

<xsl:template match="oai:ListRecords">
  <h2>List of Records</h2>
  <p>The following lists for all records requested 
     the OAI Record <em>Headers</em> <!-- as in <kbd>ListIdentifiers</kbd> -->
     accompanied by the <em>metadata</em> in the format specified
     and optionally gives information <em>about</em> the metadata.
  </p>
  <xsl:apply-templates select="oai:record">
    <xsl:with-param name="enum" select="'counted'" />
  </xsl:apply-templates>
  <xsl:apply-templates select="oai:resumptionToken" />
</xsl:template>

<!-- ListIdentifiers -->

<xsl:template match="oai:ListIdentifiers">
  <h2>List of Identifiers</h2>
  <p>The following list contains the OAI Record <em>Headers</em> for your selection,
     consisting of the identifier, 
     the date of creation or modification (with respect to the <em>format</em> given)
     and the list of all <em>set</em>s defined in the repository which contain the record.
     <em>Metadata</em> may be retrieved individually for each record.
  </p>
  <xsl:apply-templates select="oai:header">
    <xsl:with-param name="enum" select="'counted'" />
  </xsl:apply-templates>
  <xsl:apply-templates select="oai:resumptionToken" />
</xsl:template>

<!-- ListSets -->

<xsl:template match="oai:ListSets">
  <h2>List of Sets</h2>
  <p>The following is an enumeration of all <em>Set</em>s defined in the repository.
     The colon <kbd>:</kbd> acts as the separator character indicating hierarchical sets.
  </p>
  <xsl:apply-templates select="oai:set">
    <xsl:with-param name="enum" select="'counted'" />
  </xsl:apply-templates>
  <xsl:apply-templates select="oai:resumptionToken" />
</xsl:template>

<xsl:template match="oai:set">
  <xsl:param name="enum" select="'uncounted'" />
  <h3 class="{$enum}">Set</h3>
  <table class="values">
    <xsl:apply-templates select="oai:setSpec" />
    <tr><td class="key">setName</td>
    <td class="value"><xsl:value-of select="oai:setName"/></td></tr>
    <xsl:apply-templates select="oai:setDescription" />
  </table>
</xsl:template>

<xsl:template match="oai:setDescription">
  <tr>
    <td class="key">Description</td>
    <td class="value">
      <xsl:apply-templates select="*" mode="setdesc" />
    </td>
  </tr>
</xsl:template>

<xsl:template match="oai_dc:dc" mode="setdesc" xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" >
    <table class="dcdata">
      <xsl:apply-templates select="*" />
    </table>
</xsl:template>

<xsl:template match="*" mode="setdesc">
  <!-- "de"-mode -->
  <xsl:apply-templates select="." />
</xsl:template>

<xsl:template match="oai:setDescription/*" priority="-100">
  <h2>Unsupported Description Type</h2>
  <p>The XSL currently does not support this type of description.</p>
  <div class="xmlSource">
    <xsl:apply-templates select="." mode='xmlMarkup' />
  </div>
</xsl:template>


<!-- ListMetadataFormats -->

<xsl:template match="oai:ListMetadataFormats">
  <xsl:param name="identifier" select="../oai:request/@identifier" />
  <h2>List of Metadata Formats</h2>
  <xsl:choose>
    <xsl:when test="$identifier">
      <p>This is a list of metadata formats available for the record "<xsl:value-of select='$identifier' />". <!-- Use the links below to view the metadata: 
	<xsl:apply-templates select="oai:metadataFormat/oai:metadataPrefix">
	  <xsl:with-param name="identifier" select="$identifier" />
	</xsl:apply-templates -->
      </p>
    </xsl:when>
    <xsl:otherwise>
      <p>This is a list of metadata formats available from this archive.</p>
    </xsl:otherwise>
  </xsl:choose>
  <xsl:apply-templates select="oai:metadataFormat">
    <xsl:with-param name="enum" select="'counted'" />
  </xsl:apply-templates>
</xsl:template>

<xsl:template match="oai:metadataFormat">
  <xsl:param name="enum" select="'uncounted'" />
  <h3 class="{$enum}">Metadata Format</h3>
  <table class="values">
    <tr>
      <td class="key">metadataPrefix</td>
      <td class="value">
	<xsl:variable name="prefix">
	  <xsl:value-of select="oai:metadataPrefix"/>
	</xsl:variable>
	<xsl:value-of select="$prefix" />
	<xsl:choose>
	  <xsl:when test="count(../../oai:request/@identifier) &gt; 0">
	    <xsl:variable name="escapedid">
	      <xsl:call-template name="escapeURL">
		<xsl:with-param name="string" select="../../oai:request/@identifier" />
	      </xsl:call-template>
	    </xsl:variable>
	    <xsl:text> </xsl:text><a class="link" href="?verb=GetRecord&amp;metadataPrefix={$prefix}&amp;identifier={$escapedid}">show</a>
	  </xsl:when>
	  <xsl:otherwise>
	    <xsl:text> </xsl:text><a class="link" href="?verb=ListIdentifiers&amp;metadataPrefix={$prefix}">Identifiers</a>
	    <xsl:text> </xsl:text><a class="link" href="?verb=ListRecords&amp;metadataPrefix={$prefix}">Records</a>
	  </xsl:otherwise>
	</xsl:choose>
      </td>
    </tr>
    <tr><td class="key">metadataNamespace</td>
    <td class="value"><xsl:value-of select="oai:metadataNamespace"/></td></tr>
    <tr><td class="key">schema</td>
    <td class="value"><a href="{oai:schema}"><xsl:value-of select="oai:schema"/></a></td></tr>
  </table>
</xsl:template>

<xsl:template match="oai:metadataPrefix">
      <xsl:param name="identifier"/>
      <xsl:variable name="escapedid">
	<xsl:call-template name="escapeURL">
	  <xsl:with-param name="string" select="$identifier" />
	</xsl:call-template>
      </xsl:variable>
      <xsl:text> </xsl:text><a class="link" href="?verb=GetRecord&amp;metadataPrefix={.}&amp;identifier={$escapedid}"><xsl:value-of select='.' /></a>
</xsl:template>

<!-- record object -->

<xsl:template match="oai:record">
  <xsl:param name="enum" select="'uncounted'" />
  <h2 class="oaiRecordTitle {$enum}">OAI Record: <xsl:value-of select="oai:header/oai:identifier"/></h2>
  <div class="oaiRecord">
    <xsl:apply-templates select="oai:header" />
    <xsl:apply-templates select="oai:metadata" />
    <xsl:apply-templates select="oai:about" />
  </div>
</xsl:template>

<xsl:template match="oai:header">
  <xsl:param name="enum" select="'uncounted'" />
  <xsl:param name="format" select="/oai:OAI-PMH/oai:request/@metadataPrefix" />
  <h3 class="{$enum}">OAI Record Header</h3>
  <table class="values">
    <tr><td class="key">OAI Identifier</td>
    <td class="value">
      <xsl:value-of select="oai:identifier"/>
      <xsl:variable name="escapedid">
	<xsl:call-template name="escapeURL">
	  <xsl:with-param name="string" select="oai:identifier" />
	</xsl:call-template>
      </xsl:variable>
      <xsl:if test="(string-length($format) &gt; 0) and not($format = 'oai_dc')">
	<xsl:text> </xsl:text><a class="link" href="?verb=GetRecord&amp;metadataPrefix={$format}&amp;identifier={$escapedid}"><xsl:value-of select="$format" /></a>
      </xsl:if>
      <xsl:text> </xsl:text><a class="link" href="?verb=GetRecord&amp;metadataPrefix=oai_dc&amp;identifier={$escapedid}">oai_dc</a>
      <xsl:text> </xsl:text><a class="link" href="?verb=ListMetadataFormats&amp;identifier={$escapedid}">formats</a>
      <xsl:if test="string-length($BLtemplate) &gt; 0">
	<xsl:text> External: </xsl:text>
	<a class="link" href="{concat(substring-before($BLtemplate, '{ID}'), $escapedid, substring-after($BLtemplate, '{ID}'))}">
	  <xsl:choose>
	    <xsl:when test="string-length($BLtemplate/@rel) &gt; 0">
	      <xsl:value-of select="$BLtemplate/@rel" />
	    </xsl:when>
	    <xsl:otherwise>
	      <xsl:value-of select="'visit at home'" />
	    </xsl:otherwise>
	  </xsl:choose>
	</a>
      </xsl:if>
    </td></tr>
    <tr><td class="key">Datestamp</td>
    <td class="value"><xsl:value-of select="oai:datestamp"/></td></tr>
    <xsl:apply-templates select="oai:setSpec" />
  </table>
  <xsl:if test="@status='deleted'">
    <p>This record has been deleted.</p>
  </xsl:if>
</xsl:template>

<xsl:template match="oai:about">
  <xsl:if test="position()=1">
    <h3>Information <em>about</em> the metadata</h3>
  </xsl:if>
  <xsl:apply-templates/>
</xsl:template>

<xsl:template match="oai:about/*" priority="-100">
  <h2>Unsupported Description Type</h2>
  <p>The XSL currently does not support this type of description.</p>
  <div class="xmlSource">
    <xsl:apply-templates select="." mode='xmlMarkup' />
  </div>
</xsl:template>


<xsl:template match="oai:metadata">
  &#160;
  <div class="metadata">
    <xsl:apply-templates select="*" />
  </div>
</xsl:template>




<!-- oai setSpec object -->

<xsl:template match="oai:setSpec">
  <tr><td class="key">setSpec</td>
  <td class="value"><xsl:value-of select="."/>
    <xsl:text> </xsl:text><a class="link" href="?verb=ListIdentifiers&amp;metadataPrefix=oai_dc&amp;set={.}">Identifiers</a>
    <xsl:text> </xsl:text><a class="link" href="?verb=ListRecords&amp;metadataPrefix=oai_dc&amp;set={.}">Records</a>
  </td></tr>
</xsl:template>



<!-- oai resumptionToken -->

<xsl:template match="oai:resumptionToken">
 <h3>Resumption Token</h3>
 <xsl:choose>
  <xsl:when test="string-length(normalize-space(.)) &gt; 0">
   <p>There are more results.</p>
   <table class="values">
     <tr><td class="key">resumptionToken:</td>
     <td class="value"><xsl:value-of select="."/>
<xsl:text> </xsl:text>
<a class="link" href="?verb={/oai:OAI-PMH/oai:request/@verb}&amp;resumptionToken={.}">Resume</a></td></tr>
   </table>
  </xsl:when>
  <xsl:otherwise>
   <p>There are no more results.</p>
  </xsl:otherwise>
 </xsl:choose>
 <xsl:if test="count(./@*) &gt; 0">
  <p>Additional information in the resumption token:</p>
  <table>
   <xsl:for-each select="./@*">
    <tr>
     <td class="key"><xsl:value-of select="local-name()" /></td>
     <td class="value"><xsl:value-of select="." /></td>
    </tr>
   </xsl:for-each>
  </table>
 </xsl:if>
</xsl:template>

<!-- unknown metadata format -->

<xsl:template match="oai:metadata/*" priority='-100'>
  <h3>Unknown Metadata Format (<xsl:value-of select="namespace-uri(.)"/> requested as "<xsl:value-of select="/oai:OAI-PMH/oai:request/@metadataPrefix" />")</h3>
  <div class="xmlSource">
    <xsl:apply-templates select="." mode='xmlMarkup' />
  </div>
</xsl:template>

<!-- oai_dc record -->

<xsl:template match="oai:metadata/oai_dc:dc" xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" >
  <div class="dcdata">
    <h3>Dublin Core Metadata (oai_dc requested as "<xsl:value-of select="/oai:OAI-PMH/oai:request/@metadataPrefix" />")</h3>
    <table class="dcdata">
      <xsl:apply-templates select="*" />
    </table>
  </div>
</xsl:template>

<xsl:template match="oai_dc:dc" xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" >
  <div class="dcdata">
    <h3>Dublin Core Metadata</h3>
    <table class="dcdata">
      <xsl:apply-templates select="*" />
    </table>
  </div>
</xsl:template>

<xsl:template match="srw_dc:dc" xmlns:srw_dc="info:srw/schema/1/dc-schema" >
  <div class="dcdata">
    <h3>Dublin Core Metadata (srw_dc requested as "<xsl:value-of select="/oai:OAI-PMH/oai:request/@metadataPrefix" />")</h3>
    <table class="dcdata">
      <xsl:apply-templates select="*" />
    </table>
  </div>
</xsl:template>

<xsl:template match="dc:title" xmlns:dc="http://purl.org/dc/elements/1.1/">
<tr><td class="key">Title</td><td class="value"><xsl:value-of select="."/></td></tr></xsl:template>

<xsl:template match="dc:creator" xmlns:dc="http://purl.org/dc/elements/1.1/">
<tr><td class="key">Author or Creator</td><td class="value"><xsl:value-of select="."/></td></tr></xsl:template>

<xsl:template match="dc:subject" xmlns:dc="http://purl.org/dc/elements/1.1/">
<tr><td class="key">Subject and Keywords</td><td class="value"><xsl:value-of select="."/></td></tr></xsl:template>

<xsl:template match="dc:description" xmlns:dc="http://purl.org/dc/elements/1.1/">
<tr><td class="key">Description</td><td class="value"><xsl:value-of select="."/></td></tr></xsl:template>

<xsl:template match="dc:publisher" xmlns:dc="http://purl.org/dc/elements/1.1/">
<tr><td class="key">Publisher</td><td class="value"><xsl:value-of select="."/></td></tr></xsl:template>

<xsl:template match="dc:contributor" xmlns:dc="http://purl.org/dc/elements/1.1/">
<tr><td class="key">Other Contributor</td><td class="value"><xsl:value-of select="."/></td></tr></xsl:template>

<xsl:template match="dc:date" xmlns:dc="http://purl.org/dc/elements/1.1/">
<tr><td class="key">Date</td><td class="value"><xsl:value-of select="."/></td></tr></xsl:template>

<xsl:template match="dc:type" xmlns:dc="http://purl.org/dc/elements/1.1/">
<tr><td class="key">Resource Type</td><td class="value"><xsl:value-of select="."/></td></tr></xsl:template>

<xsl:template match="dc:format" xmlns:dc="http://purl.org/dc/elements/1.1/">
<tr><td class="key">Format</td><td class="value"><xsl:value-of select="."/></td></tr></xsl:template>

<xsl:template match="dc:identifier" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <tr>
    <td class="key">Resource Identifier</td>
    <td class="value">
      <xsl:choose>
	<xsl:when test="contains(substring-before(concat(., ' '), ' '), '://')">
	  <a href="{substring-before(concat(., ' '), ' ')}"><xsl:value-of select="substring-before(concat(., ' '), ' ')" /></a>
	  <xsl:value-of select="substring-after(., ' ')"  />
	</xsl:when>
	<xsl:otherwise>
	  <xsl:value-of select="."/>
	</xsl:otherwise>
      </xsl:choose>
    </td>
  </tr>
</xsl:template>

<xsl:template match="dc:source" xmlns:dc="http://purl.org/dc/elements/1.1/">
<tr><td class="key">Source</td><td class="value"><xsl:value-of select="."/></td></tr></xsl:template>

<xsl:template match="dc:language" xmlns:dc="http://purl.org/dc/elements/1.1/">
<tr><td class="key">Language</td><td class="value"><xsl:value-of select="."/></td></tr></xsl:template>

<xsl:template match="dc:relation" xmlns:dc="http://purl.org/dc/elements/1.1/">
<tr><td class="key">Relation</td><td class="value">
  <xsl:choose>
    <xsl:when test='starts-with(.,"http" )'>
      <xsl:choose>
	<xsl:when test='string-length(.) &gt; 50'>
	  <a class="link" href="{.}">URL</a>
	  <i> URL not shown as it is very long.</i>
	</xsl:when>
	<xsl:otherwise>
	  <a href="{.}"><xsl:value-of select="."/></a>
	</xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="."/>
    </xsl:otherwise>
  </xsl:choose>
</td></tr></xsl:template>

<xsl:template match="dc:coverage" xmlns:dc="http://purl.org/dc/elements/1.1/">
<tr><td class="key">Coverage</td><td class="value"><xsl:value-of select="."/></td></tr></xsl:template>

<xsl:template match="dc:rights" xmlns:dc="http://purl.org/dc/elements/1.1/">
<tr><td class="key">Rights Management</td><td class="value"><xsl:value-of select="."/></td></tr></xsl:template>

<!-- mabxml record -->

<xsl:template match="mx:datensatz" xmlns:mx="http://www.ddb.de/professionell/mabxml/mabxml-1.xsd">
  <div class="mabdata">
    <h3>MAB2 Metadata (MABxml-1.x requested as "<xsl:value-of select="/oai:OAI-PMH/oai:request/@metadataPrefix" />")</h3>
    <div class="mabdump">
      <xsl:value-of select="concat('### ',
				   '00000',
	 substring(concat(@status, '?'), 1, 1),
     substring(concat(@mabVersion, '????'), 1, 4),
				   '1',
				   '1',
				   '00024',
				   '||||||',
	    substring(concat(@typ, '?'), 1, 1),
				   $CRLF)" />

      <xsl:apply-templates select="mx:feld" />
    </div>
  </div>
</xsl:template>

<xsl:template match="mx:feld" xmlns:mx="http://www.ddb.de/professionell/mabxml/mabxml-1.xsd">
  <span class="mabtag">
    <xsl:value-of select="concat(./@nr, ./@ind)" />
  </span>
  <xsl:apply-templates />
  <xsl:value-of select="$CRLF" />
</xsl:template>

<xsl:template match="mx:feld[@nr='655' and @ind='e']/mx:uf[@code='u']" xmlns:mx="http://www.ddb.de/professionell/mabxml/mabxml-1.xsd">
  <span class="mabsubtag">
    <xsl:value-of select="concat($UFZVisual, ./@code)" />
  </span>
  <a href="{normalize-space(.)}">
     <xsl:apply-templates />
  </a>
</xsl:template>

<xsl:template match="mx:uf" xmlns:mx="http://www.ddb.de/professionell/mabxml/mabxml-1.xsd">
  <span class="mabsubtag">
    <xsl:value-of select="concat($UFZVisual, ./@code)" />
  </span>
  <xsl:apply-templates />
</xsl:template>

<xsl:template match="mx:tf" xmlns:mx="http://www.ddb.de/professionell/mabxml/mabxml-1.xsd">
  <span class="mabsubtag">
    <xsl:value-of select="$TFZ" />
  </span>
</xsl:template>

<xsl:template match="mx:ns" xmlns:mx="http://www.ddb.de/professionell/mabxml/mabxml-1.xsd">
  <xsl:value-of select="$NSB" />
  <xsl:apply-templates />
  <xsl:value-of select="$NSE" />
</xsl:template>

<xsl:template match="mx:stw" xmlns:mx="http://www.ddb.de/professionell/mabxml/mabxml-1.xsd">
  <xsl:value-of select="$SWB" />
  <xsl:apply-templates />
  <xsl:value-of select="$SWE" />
</xsl:template>

<xsl:template match="mx:feld/text()[normalize-space(.)='']" xmlns:mx="http://www.ddb.de/professionell/mabxml/mabxml-1.xsd" />


<!-- XML Pretty Maker -->

<xsl:template match="node()" mode='xmlMarkup'>
  <div class="xmlBlock">
    &lt;<span class="xmlTagName"><xsl:value-of select='name(.)' /></span><xsl:apply-templates select="@*" mode='xmlMarkup'/>&gt;<xsl:apply-templates select="node()" mode='xmlMarkup' />&lt;/<span class="xmlTagName"><xsl:value-of select='name(.)' /></span>&gt;
  </div>
</xsl:template>

<xsl:template match="text()" mode='xmlMarkup'><span class="xmlText"><xsl:value-of select='.' /></span></xsl:template>

<xsl:template match="@*" mode='xmlMarkup'>
  <xsl:text> </xsl:text><span class="xmlAttrName"><xsl:value-of select='name()' /></span>="<span class="xmlAttrValue"><xsl:value-of select='.' /></span>"
</xsl:template>

<xsl:template name="xmlstyle">
.xmlSource {
	font-size: 70%;
	border: solid #c0c0a0 1px;
	background-color: #ffffe0;
	padding: 2em 2em 2em 0em;
}
.xmlBlock {
	padding-left: 2em;
}
.xmlTagName {
	color: #800000;
	font-weight: bold;
}
.xmlAttrName {
	font-weight: bold;
}
.xmlAttrValue {
	color: #0000c0;
}
</xsl:template>

<!-- especially OAIIdentifier allows characters which have to be urlencoded before transporting
     The XSL spec states (for the HTML method) non-ASCII characters in href attributes to be escaped
     automatically, we still have to process manually the following list resulting from comparing
     the RFC 1737 (URN) based list in OAI Identifier:
       allowed are "-" "_" "." "!" "~" "*" "'" "(" ")" ";" "/" "?" ":" "@" "&amp;" "=" "+" "$" "," [%]
     and the RFC 3986 based list of "sub-delims" modern infrastructure will depend on:
       not allowed are ":" "/" "?" "#" "[" "]" "@" "!" "$" "&amp;" "'" "(" ")" "*" "+" "," ";" "="
       except for "?" "/" ":" "@"
     results in:
       to be escaped are "!" "*" "'" "(" ")" ";" "&amp;" "=" "+" "$" "," [%]
     
-->
<tmp:escapelist xmlns:tmp="http://www.findbuch.de/scratchpad">
  <tmp:rule c="%" repl="%25"/>
  <tmp:rule c="!" repl="%21"/>
  <tmp:rule c="*" repl="%3A"/>
  <tmp:rule c="'" repl="%37"/>
  <tmp:rule c="(" repl="%38"/>
  <tmp:rule c=")" repl="%39"/>
  <tmp:rule c=";" repl="%3B"/>
  <tmp:rule c="&amp;" repl="%26"/>
  <tmp:rule c="=" repl="%3D"/>
  <tmp:rule c="+" repl="%2B"/>
  <tmp:rule c="$" repl="%24"/>
  <tmp:rule c="," repl="%2C"/>
</tmp:escapelist>

<xsl:template name="escapeURL" xmlns:tmp="http://www.findbuch.de/scratchpad">
  <xsl:param name="string" select="." />
  <xsl:param name="searchlist" select="document('')/*/tmp:escapelist/tmp:rule" />
  <xsl:variable name="replaced">
    <xsl:call-template name="replacechar">
      <xsl:with-param name="string" select="$string" />
      <xsl:with-param name="from" select="$searchlist[1]/@c" />
      <xsl:with-param name="to" select="$searchlist[1]/@repl" />
    </xsl:call-template>
  </xsl:variable>
  <xsl:choose>
    <xsl:when test="count($searchlist[2]) &gt; 0">
      <xsl:call-template name="escapeURL">
	<xsl:with-param name="string" select="$replaced" />
	<xsl:with-param name="searchlist" select="$searchlist[position() &gt; 1]" />
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$replaced" />
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="replacechar">
  <xsl:param name="string" select="''" />
  <xsl:param name="from" select="''" />
  <xsl:param name="to" select="''" />
  <xsl:param name="done" select="''" />
  <xsl:choose>
    <xsl:when test="contains($string, $from)">
      <xsl:call-template name="replacechar">
	<xsl:with-param name="string" select="substring-after($string, $from)" />
	<xsl:with-param name="from" select="$from" />
	<xsl:with-param name="to" select="$to" />
		<xsl:with-param name="done" select="concat($done, substring-before($string, $from), $to)" />
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="concat($done, $string)" />
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

</xsl:stylesheet>


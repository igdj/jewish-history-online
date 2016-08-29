<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="tei"
  version="2.0">

<xsl:import href="dtabf_base.xsl"/>
<xsl:import href="dtabf_customize.xsl"/>

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

</xsl:stylesheet>

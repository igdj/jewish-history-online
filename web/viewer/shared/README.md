MyCoRe-Viewer
=============

iview2-VERSION/ contains the code for the MyCoRe-Viewer
(https://www.mycore.de/documentation/frontend/frontend_image_viewer/) used to display the source images as well as the TEI-transcription and possible translations as described by the METS-Container located in web/viewer/source-{id}.

The repository for the MyCoRE-Viewer is https://github.com/MyCoRe-Org/mycore/tree/master/mycore-viewer

It is mostly written in Typescript and uses Maven to build. The Typescript compiler runs in Node.js. To build it on your own, you therefore need Java, Maven
and Node.js. After checking it out, you can run

    mvn package

Pre-built packages can be downloaded from https://search.maven.org/artifact/org.mycore/mycore-viewer, e.g  mycore-viewer-2018.06.0.4.

You can rename it to mycore-viewer-2018.06.0.4.zip and then extract META-INF/resources/modules/iview2 into the current directory.

iview2-i18n contains the translations as set in the viewer-configuration through:

    i18nURL: "{{ app.request.basepath }}/viewer/shared/iview2-i18n/{lang}.json"

Initial versions of de.json and en.json can be pulled from

    https://archive.thulb.uni-jena.de/staatsarchive/rsc/locale/translate/de/component.mets.*,component.viewer.*

and

    https://archive.thulb.uni-jena.de/staatsarchive/rsc/locale/translate/en/component.mets.*,component.viewer.*

Alternatively, you can build them from or convert from message_de.properties and message_en.properties in

    https://github.com/MyCoRe-Org/mycore/tree/master/mycore-viewer/src/main/resources/components/viewer/config

The only change currently needed to make iview2 work on this site is an adjustment of the hardwired path used for HTML-renditions of the individual pages in the TEI-files:

In

    iview2/js/iview-client-tei.js

replace the line

    this.contentLocation = this._settings.webApplicationBaseURL + "servlets/MCRDerivateContentTransformerServlet/"

by

    if (this._settings.derivateContentTransformerServlet == null) {
        this._settings.derivateContentTransformerServlet =
        this._settings.webApplicationBaseURL + "servlets/MCRDerivateContentTransformerServlet/";
    }
    this.contentLocation = this._settings.derivateContentTransformerServlet + this._settings.derivate + "/";

so our viewer-setting

    derivateContentTransformerServlet: "{{ path('tei2html', {'path' : ''}) }}"

is properly picked up. For additional info about the viewer, have a look at the examples in https://github.com/MyCoRe-Org/mycore/tree/master/mycore-viewer/src/main/resources/example

## TODO: Upgrade to 2019.06

Switch to Bootstrap 4 / Fontawesome, see https://github.com/MyCoRe-Org/mycore/commit/b184a4a082b0f8a58d2b024c3cc89282052eaf1c#diff-5ddc56ba3dfd307bcff1b8c1bc4f9157

## Upgrade to 2018.06

Incorporate changes from https://github.com/MyCoRe-Org/mycore/commit/9bf43152995c83e24dc119487a4486e9db097f95#diff-17745d4c6db86367f5e9ece254c97e84

    ## mycore-mets

    The fileGroups for TEI changed from

    ```
    <!-- 2017.06 -->
    <mets:fileGrp USE="TRANSCRIPTION" />
    <mets:fileGrp USE="TRANSLATION"/>
    ```
    to
    ```
    <!-- 2018.06 -->
    <mets:fileGrp USE="TEI.TRANSCRIPTION" />
    <mets:fileGrp USE="TEI.TRANSLATION.DE" />
    <mets:fileGrp USE="TEI.TRANSLATION.EN" />

Check https://archive.thulb.uni-jena.de/staatsarchive/rsc/viewer/stat_derivate_00010626/BACZ%2011087_1.tif for an example
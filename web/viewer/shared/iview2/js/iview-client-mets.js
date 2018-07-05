var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var mets;
            (function (mets) {
                var MetsStructureModel = (function (_super) {
                    __extends(MetsStructureModel, _super);
                    function MetsStructureModel(_rootChapter, _imageList, _chapterToImageMap, _imageToChapterMap, _imageHrefImageMap, altoPresent) {
                        _super.call(this, _rootChapter, _imageList, _chapterToImageMap, _imageToChapterMap, _imageHrefImageMap, altoPresent);
                        this.altoPresent = altoPresent;
                    }
                    return MetsStructureModel;
                }(viewer.model.StructureModel));
                mets.MetsStructureModel = MetsStructureModel;
            })(mets = widgets.mets || (widgets.mets = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var mets;
            (function (mets) {
                var MetsStructureBuilder = (function () {
                    function MetsStructureBuilder(metsDocument, tilePathBuilder) {
                        this.metsDocument = metsDocument;
                        this.tilePathBuilder = tilePathBuilder;
                        this.hrefResolverElement = document.createElement("a");
                    }
                    MetsStructureBuilder.prototype.processMets = function () {
                        var logicalStructMap = this.getStructMap("LOGICAL");
                        var physicalStructMap = this.getStructMap("PHYSICAL");
                        var files = this.getFiles("IVIEW2");
                        if (files.length == 0) {
                            files = this.getFiles("MASTER");
                        }
                        var altoFiles = this.getFiles("ALTO");
                        var teiTranscriptionFiles = this.getFiles("TRANSCRIPTION");
                        var teiTranslationFiles = this.getFiles("TRANSLATION");
                        this._chapterIdMap = new MyCoReMap();
                        this._idFileMap = this.getIdFileMap(files);
                        this._idPhysicalFileMap = this.getIdPhysicalFileMap();
                        if (altoFiles != null) {
                            this._idFileMap.mergeIn(this.getIdFileMap(altoFiles));
                        }
                        if (teiTranscriptionFiles != null) {
                            this._idFileMap.mergeIn(this.getIdFileMap(teiTranscriptionFiles));
                        }
                        if (teiTranslationFiles != null) {
                            this._idFileMap.mergeIn(this.getIdFileMap(teiTranslationFiles));
                        }
                        this._chapterImageMap = new MyCoReMap();
                        this._imageChapterMap = new MyCoReMap();
                        this._improvisationMap = new MyCoReMap();
                        this._metsChapter = this.processChapter(null, this.getFirstElementChild(this.getStructMap("LOGICAL")), 1);
                        this._imageHrefImageMap = new MyCoReMap();
                        this._imageList = new Array();
                        this._idImageMap = new MyCoReMap();
                        this.processImages();
                        this._structureModel = new widgets.mets.MetsStructureModel(this._metsChapter, this._imageList, this._chapterImageMap, this._imageChapterMap, this._imageHrefImageMap, altoFiles != null && altoFiles.length > 0);
                        return this._structureModel;
                    };
                    MetsStructureBuilder.prototype.getStructMap = function (type) {
                        var logicalStructMapPath = "//mets:structMap[@TYPE='" + type + "']";
                        return singleSelectShim(this.metsDocument, logicalStructMapPath, MetsStructureBuilder.NS_MAP);
                    };
                    MetsStructureBuilder.prototype.getFiles = function (group) {
                        var fileGroupPath = "//mets:fileSec//mets:fileGrp[@USE='" + group + "']";
                        var fileSectionResult = singleSelectShim(this.metsDocument, fileGroupPath, MetsStructureBuilder.NS_MAP);
                        if (fileSectionResult != null) {
                            var nodeArray = XMLUtil.nodeListToNodeArray(fileSectionResult.childNodes);
                        }
                        else {
                            nodeArray = new Array();
                        }
                        return nodeArray;
                    };
                    MetsStructureBuilder.prototype.getStructLinks = function () {
                        var structLinkPath = "//mets:structLink";
                        var structLinkResult = singleSelectShim(this.metsDocument, structLinkPath, MetsStructureBuilder.NS_MAP);
                        var nodeArray = new Array();
                        XMLUtil.iterateChildNodes(structLinkResult, function (currentChild) {
                            if (currentChild instanceof Element || "getAttribute" in currentChild) {
                                nodeArray.push(currentChild);
                            }
                        });
                        return nodeArray;
                    };
                    MetsStructureBuilder.prototype.processChapter = function (parent, chapter, defaultOrder) {
                        if (chapter.nodeName.toString() == "mets:mptr") {
                            return;
                        }
                        var chapterObject = new viewer.model.StructureChapter(parent, chapter.getAttribute("TYPE"), chapter.getAttribute("ID"), chapter.getAttribute("LABEL"));
                        var chapterChildren = chapter.childNodes;
                        this._chapterIdMap.set(chapterObject.id, chapterObject);
                        var that = this;
                        for (var i = 0; i < chapterChildren.length; i++) {
                            var elem = chapterChildren[i];
                            if ((elem instanceof Element || "getAttribute" in elem)) {
                                if (elem.nodeName.indexOf("fptr") != -1) {
                                    this.processFPTR(chapterObject, elem);
                                }
                                else if (elem.nodeName.indexOf("div")) {
                                    chapterObject.chapter.push(that.processChapter(chapterObject, elem, i + 1));
                                }
                            }
                        }
                        return chapterObject;
                    };
                    MetsStructureBuilder.prototype.processFPTR = function (parent, fptrElem) {
                        var _this = this;
                        var elem = this.getFirstElementChild(fptrElem);
                        if (elem.nodeName.indexOf("seq")) {
                            XMLUtil.iterateChildNodes(elem, function (child) {
                                if ((child instanceof Element || "getAttribute" in child)) {
                                    var elem = child;
                                    _this.parseArea(parent, elem);
                                }
                            });
                        }
                        else if (elem.nodeName.indexOf("area")) {
                            this.parseArea(parent, elem);
                        }
                    };
                    MetsStructureBuilder.prototype.parseArea = function (parent, area) {
                        var blockList;
                        if (!parent.additional.has("blocklist")) {
                            blockList = new Array();
                            parent.additional.set("blocklist", blockList);
                        }
                        else {
                            blockList = parent.additional.get("blocklist");
                        }
                        var beType = area.getAttribute("BETYPE");
                        if (beType == "IDREF") {
                            var href = this.getAttributeNs(this.getFirstElementChild(this._idFileMap.get(area.getAttribute("FILEID"))), "xlink", "href");
                            blockList.push({
                                fileId: href,
                                fromId: area.getAttribute("BEGIN"),
                                toId: area.getAttribute("END")
                            });
                        }
                        else {
                            throw "unknown beType found! " + beType;
                        }
                    };
                    MetsStructureBuilder.prototype.getIdFileMap = function (fileGrpChildren) {
                        var map = new MyCoReMap();
                        fileGrpChildren.forEach(function (node, childrenIndex) {
                            if (node instanceof Element || "getAttribute" in node) {
                                var element = node;
                                map.set(element.getAttribute("ID"), element);
                            }
                        });
                        return map;
                    };
                    MetsStructureBuilder.prototype.getIdPhysicalFileMap = function () {
                        var map = new MyCoReMap();
                        var physicalStructMap = this.getStructMap("PHYSICAL");
                        var metsDivs = this.getFirstElementChild(physicalStructMap).childNodes;
                        for (var i = 0; i < metsDivs.length; i++) {
                            var child = metsDivs[i];
                            if ("getAttribute" in child) {
                                map.set(child.getAttribute("ID"), child);
                            }
                        }
                        return map;
                    };
                    MetsStructureBuilder.prototype.getFirstElementChild = function (node) {
                        if ("firstElementChild" in node) {
                            return node.firstElementChild;
                        }
                        else {
                            return node.firstChild;
                        }
                    };
                    MetsStructureBuilder.prototype.getAttributeNs = function (element, namespaceKey, attribute) {
                        if ("getAttributeNS" in element) {
                            return element.getAttributeNS(MetsStructureBuilder.NS_MAP.get(namespaceKey), attribute);
                        }
                        else {
                            return element.getAttribute(namespaceKey + ":" + attribute);
                        }
                    };
                    MetsStructureBuilder.prototype.processImages = function () {
                        var _this = this;
                        var count = 1;
                        this._idPhysicalFileMap.forEach(function (k, v) {
                            var physFileDiv = _this._idPhysicalFileMap.get(k);
                            var image = _this.parseFile(physFileDiv, count++);
                            _this._imageList.push(image);
                            _this._idImageMap.set(k, image);
                        });
                        this._imageList = this._imageList.sort(function (x, y) { return x.order - y.order; });
                        this.makeLinks();
                        this._imageList = this._imageList.filter((function (el) { return _this._imageChapterMap.has(el.id); }));
                        this._imageList.forEach(function (image, i) {
                            image.order = i + 1;
                            _this._imageHrefImageMap.set(image.href, image);
                        });
                    };
                    MetsStructureBuilder.prototype.makeLinks = function () {
                        var _this = this;
                        var structLinkChildren = this.getStructLinks();
                        structLinkChildren.forEach(function (elem) {
                            var chapterId = _this.getAttributeNs(elem, "xlink", "from");
                            var physFileId = _this.getAttributeNs(elem, "xlink", "to");
                            _this.makeLink(_this._chapterIdMap.get(chapterId), _this._idImageMap.get(physFileId));
                        });
                    };
                    MetsStructureBuilder.prototype.makeLink = function (chapter, image) {
                        if (chapter.parent != null && !this._chapterImageMap.has(chapter.parent.id)) {
                            this._improvisationMap.set(chapter.parent.id, true);
                            this._chapterImageMap.set(chapter.parent.id, image);
                        }
                        if (!this._chapterImageMap.has(chapter.id) || this._imageList.indexOf(this._chapterImageMap.get(chapter.id)) > this._imageList.indexOf(image) || (this._improvisationMap.has(chapter.id) && this._improvisationMap.get(chapter.id))) {
                            this._chapterImageMap.set(chapter.id, image);
                            this._improvisationMap.set(chapter.id, false);
                        }
                        if (!this._imageChapterMap.has(image.id)) {
                            this._imageChapterMap.set(image.id, chapter);
                        }
                    };
                    MetsStructureBuilder.prototype.extractTranslationLanguage = function (href) {
                        return href.split("/")[1].split(".")[1];
                    };
                    MetsStructureBuilder.prototype.parseFile = function (physFileDiv, defaultOrder) {
                        var _this = this;
                        var img;
                        var type = physFileDiv.getAttribute("TYPE");
                        var id = physFileDiv.getAttribute("ID");
                        var order = parseInt(physFileDiv.getAttribute("ORDER") || "" + defaultOrder, 10);
                        var orderLabel = physFileDiv.getAttribute("ORDERLABEL");
                        var contentIds = physFileDiv.getAttribute("CONTENTIDS");
                        var additionalHrefs = new MyCoReMap();
                        var imgHref = null;
                        var imgMimeType = null;
                        this.hrefResolverElement.href = "./";
                        var base = this.hrefResolverElement.href;
                        XMLUtil.iterateChildNodes(physFileDiv, function (child) {
                            if (child instanceof Element || "getAttribute" in child) {
                                var childElement = child;
                                var fileId = childElement.getAttribute("FILEID");
                                var file = _this._idFileMap.get(fileId);
                                var href = _this.getAttributeNs(_this.getFirstElementChild(file), "xlink", "href");
                                var mimetype = file.getAttribute("MIMETYPE");
                                _this.hrefResolverElement.href = href;
                                href = _this.hrefResolverElement.href.substr(base.length);
                                var use = file.parentNode.getAttribute("USE");
                                if (use == "MASTER" || use == "IVIEW2") {
                                    imgHref = href;
                                    imgMimeType = mimetype;
                                }
                                else if (use == "ALTO") {
                                    additionalHrefs.set(MetsStructureBuilder.ALTO_TEXT, href);
                                }
                                else if (use == "TRANSCRIPTION") {
                                    additionalHrefs.set(MetsStructureBuilder.TEI_TRANSCRIPTION, href);
                                }
                                else if (use == "TRANSLATION") {
                                    additionalHrefs.set(MetsStructureBuilder.TEI_TRANSLATION + "." + _this.extractTranslationLanguage(href), href);
                                }
                                else {
                                    console.log("Unknown File Group : " + use);
                                }
                            }
                        });
                        if (imgHref.indexOf("http:") + imgHref.indexOf("file:") + imgHref.indexOf("urn:") != -3) {
                            var parser = document.createElement('a');
                            parser.href = imgHref;
                            imgHref = parser.pathname;
                        }
                        var that = this;
                        return new viewer.model.StructureImage(type, id, order, orderLabel, imgHref, imgMimeType, function (cb) {
                            cb(that.tilePathBuilder(imgHref));
                        }, additionalHrefs, contentIds);
                    };
                    MetsStructureBuilder.METS_NAMESPACE_URI = "http://www.loc.gov/METS/";
                    MetsStructureBuilder.XLINK_NAMESPACE_URI = "http://www.w3.org/1999/xlink";
                    MetsStructureBuilder.ALTO_TEXT = "AltoHref";
                    MetsStructureBuilder.TEI_TRANSCRIPTION = "TeiTranscriptionHref";
                    MetsStructureBuilder.TEI_TRANSLATION = "TeiTranslationHref";
                    MetsStructureBuilder.NS_RESOLVER = {
                        lookupNamespaceURI: function (nsPrefix) {
                            if (nsPrefix == "mets") {
                                return MetsStructureBuilder.METS_NAMESPACE_URI;
                            }
                            return null;
                        }
                    };
                    MetsStructureBuilder.NS_MAP = (function () {
                        var nsMap = new MyCoReMap();
                        nsMap.set("mets", MetsStructureBuilder.METS_NAMESPACE_URI);
                        nsMap.set("xlink", MetsStructureBuilder.XLINK_NAMESPACE_URI);
                        return nsMap;
                    })();
                    return MetsStructureBuilder;
                }());
                mets.MetsStructureBuilder = MetsStructureBuilder;
            })(mets = widgets.mets || (widgets.mets = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var mets;
            (function (mets) {
                var IviewMetsProvider = (function () {
                    function IviewMetsProvider() {
                    }
                    IviewMetsProvider.loadModel = function (metsDocumentLocation, tilePathBuilder) {
                        var promise = new ViewerPromise();
                        var settings = {
                            url: metsDocumentLocation,
                            success: function (response) {
                                var builder = new mets.MetsStructureBuilder(response, tilePathBuilder);
                                promise.resolve({ model: builder.processMets(), document: response });
                            },
                            error: function (request, status, exception) {
                                promise.reject(exception);
                            }
                        };
                        jQuery.ajax(settings);
                        return promise;
                    };
                    return IviewMetsProvider;
                }());
                mets.IviewMetsProvider = IviewMetsProvider;
            })(mets = widgets.mets || (widgets.mets = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var events;
            (function (events) {
                var MetsLoadedEvent = (function (_super) {
                    __extends(MetsLoadedEvent, _super);
                    function MetsLoadedEvent(component, mets) {
                        _super.call(this, component, MetsLoadedEvent.TYPE);
                        this.mets = mets;
                    }
                    MetsLoadedEvent.TYPE = "MetsLoadedEvent";
                    return MetsLoadedEvent;
                }(events.MyCoReImageViewerEvent));
                events.MetsLoadedEvent = MetsLoadedEvent;
            })(events = components.events || (components.events = {}));
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var ShowContentEvent = mycore.viewer.components.events.ShowContentEvent;
            var MyCoReMetsComponent = (function (_super) {
                __extends(MyCoReMetsComponent, _super);
                function MyCoReMetsComponent(_settings, container) {
                    var _this = this;
                    _super.call(this);
                    this._settings = _settings;
                    this.container = container;
                    this.errorSync = Utils.synchronize([function (context) {
                            return context.lm != null && context.error;
                        }], function (context) {
                        new mycore.viewer.widgets.modal.ViewerErrorModal(_this._settings.mobile, context.lm.getTranslation("noMetsShort"), context.lm.getFormatedTranslation("noMets", "<a href='mailto:"
                            + _this._settings.adminMail + "'>" + _this._settings.adminMail + "</a>"), _this._settings.webApplicationBaseURL + "/modules/iview2/img/sad-emotion-egg.jpg", _this.container[0]).show();
                        context.trigger(new ShowContentEvent(_this, jQuery(), mycore.viewer.widgets.layout.IviewBorderLayout.DIRECTION_WEST, 0));
                    });
                    this.metsAndLanguageSync = Utils.synchronize([
                        function (context) { return context.mm != null; },
                        function (context) { return context.lm != null; }
                    ], function (context) {
                        _this.metsLoaded(_this.mm.model);
                        _this.trigger(new components.events.MetsLoadedEvent(_this, _this.mm));
                    });
                    this.error = false;
                    this.lm = null;
                    this.mm = null;
                }
                MyCoReMetsComponent.prototype.init = function () {
                    var _this = this;
                    var settings = this._settings;
                    if (settings.doctype == "mets") {
                        if ((settings.imageXmlPath.charAt(settings.imageXmlPath.length - 1) != '/')) {
                            settings.imageXmlPath = settings.imageXmlPath + "/";
                        }
                        if ((settings.tileProviderPath.charAt(settings.tileProviderPath.length - 1) != '/')) {
                            settings.tileProviderPath = settings.tileProviderPath + "/";
                        }
                        var that = this;
                        this._metsLoaded = false;
                        var tilePathBuilder = function (image) {
                            return that._settings.tileProviderPath.split(",")[0] + that._settings.derivate + "/" + image + "/0/0/0.jpg";
                        };
                        var metsPromise = mycore.viewer.widgets.mets.IviewMetsProvider.loadModel(this._settings.metsURL, tilePathBuilder);
                        metsPromise.then(function (resolved) {
                            var model = resolved.model;
                            _this.trigger(new components.events.WaitForEvent(_this, components.events.LanguageModelLoadedEvent.TYPE));
                            if (model == null) {
                                _this.error = true;
                                _this.errorSync(_this);
                                return;
                            }
                            _this.mm = resolved;
                            _this.metsAndLanguageSync(_this);
                        });
                        metsPromise.onreject(function () {
                            _this.trigger(new components.events.WaitForEvent(_this, components.events.LanguageModelLoadedEvent.TYPE));
                            _this.error = true;
                            _this.errorSync(_this);
                        });
                        this.trigger(new components.events.ComponentInitializedEvent(this));
                    }
                };
                MyCoReMetsComponent.prototype.postProcessChapter = function (chapter) {
                    var _this = this;
                    if (chapter.label == null || typeof chapter.label == "undefined" || chapter.label == "") {
                        if (chapter.type != null && typeof chapter.type != "undefined" && chapter.type != "") {
                            var translationKey = this.buildTranslationKey(chapter.type || "");
                            if (this.lm.hasTranslation(translationKey)) {
                                chapter._label = this.lm.getTranslation(translationKey);
                            }
                        }
                    }
                    chapter.chapter.forEach(function (chapter) {
                        _this.postProcessChapter(chapter);
                    });
                };
                MyCoReMetsComponent.prototype.buildTranslationKey = function (type) {
                    return "dfgStructureSet." + type.replace('- ', '');
                };
                MyCoReMetsComponent.prototype.metsLoaded = function (structureModel) {
                    this.postProcessChapter(structureModel._rootChapter);
                    var ev = new components.events.StructureModelLoadedEvent(this, structureModel);
                    this.trigger(ev);
                    this._metsLoaded = true;
                    this._eventToTrigger = ev;
                    var href = this._settings.filePath;
                    var currentImage = null;
                    structureModel._imageList.forEach(function (image) {
                        if ("/" + image.href == href || image.href == href) {
                            currentImage = image;
                        }
                    });
                    if (currentImage != null) {
                        this.trigger(new components.events.ImageSelectedEvent(this, currentImage));
                    }
                };
                Object.defineProperty(MyCoReMetsComponent.prototype, "handlesEvents", {
                    get: function () {
                        return [components.events.LanguageModelLoadedEvent.TYPE];
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReMetsComponent.prototype.handle = function (e) {
                    if (e.type == components.events.LanguageModelLoadedEvent.TYPE) {
                        var languageModelLoadedEvent = e;
                        this.lm = languageModelLoadedEvent.languageModel;
                        this.errorSync(this);
                        this.metsAndLanguageSync(this);
                    }
                    return;
                };
                return MyCoReMetsComponent;
            }(components.ViewerComponent));
            components.MyCoReMetsComponent = MyCoReMetsComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReMetsComponent);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var image;
            (function (image) {
                var XMLImageInformationProvider = (function () {
                    function XMLImageInformationProvider() {
                    }
                    XMLImageInformationProvider.getInformation = function (basePath, href, callback, errorCallback) {
                        if (errorCallback === void 0) { errorCallback = function (err) {
                            return;
                        }; }
                        var settings = {
                            url: basePath + href + "/imageinfo.xml",
                            async: true,
                            success: function (response) {
                                var imageInformation = XMLImageInformationProvider.proccessXML(response, href);
                                callback(imageInformation);
                            },
                            error: function (request, status, exception) {
                                errorCallback(exception);
                            }
                        };
                        jQuery.ajax(settings);
                    };
                    XMLImageInformationProvider.proccessXML = function (imageInfo, path) {
                        var node = jQuery(imageInfo.childNodes[0]);
                        return new XMLImageInformation(node.attr("derivate"), path, parseInt(node.attr("tiles")), parseInt(node.attr("width")), parseInt(node.attr("height")), parseInt(node.attr("zoomLevel")));
                    };
                    return XMLImageInformationProvider;
                }());
                image.XMLImageInformationProvider = XMLImageInformationProvider;
                var XMLImageInformation = (function () {
                    function XMLImageInformation(_derivate, _path, _tiles, _width, _height, _zoomlevel) {
                        this._derivate = _derivate;
                        this._path = _path;
                        this._tiles = _tiles;
                        this._width = _width;
                        this._height = _height;
                        this._zoomlevel = _zoomlevel;
                    }
                    Object.defineProperty(XMLImageInformation.prototype, "derivate", {
                        get: function () {
                            return this._derivate;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(XMLImageInformation.prototype, "path", {
                        get: function () {
                            return this._path;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(XMLImageInformation.prototype, "tiles", {
                        get: function () {
                            return this._tiles;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(XMLImageInformation.prototype, "width", {
                        get: function () {
                            return this._width;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(XMLImageInformation.prototype, "height", {
                        get: function () {
                            return this._height;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(XMLImageInformation.prototype, "zoomlevel", {
                        get: function () {
                            return this._zoomlevel;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return XMLImageInformation;
                }());
                image.XMLImageInformation = XMLImageInformation;
            })(image = widgets.image || (widgets.image = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var canvas;
            (function (canvas) {
                var TileImagePage = (function () {
                    function TileImagePage(id, _width, _height, _tilePaths) {
                        this.id = id;
                        this._width = _width;
                        this._height = _height;
                        this._tiles = new MyCoReMap();
                        this._loadingTiles = new MyCoReMap();
                        this._backBuffer = document.createElement("canvas");
                        this._backBufferArea = null;
                        this._backBufferAreaZoom = null;
                        this._previewBackBuffer = document.createElement("canvas");
                        this._previewBackBufferArea = null;
                        this._previewBackBufferAreaZoom = null;
                        this._imgPreviewLoaded = false;
                        this._imgNotPreviewLoaded = false;
                        this._tilePath = _tilePaths;
                        this.loadTile(new Position3D(0, 0, 0));
                    }
                    Object.defineProperty(TileImagePage.prototype, "size", {
                        get: function () {
                            return new Size2D(this._width, this._height);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    TileImagePage.prototype.draw = function (ctx, rect, scale, overview) {
                        if (rect.pos.x < 0 || rect.pos.y < 0) {
                            rect = new Rect(rect.pos.max(0, 0), rect.size);
                        }
                        var zoomLevel = Math.min(this.getZoomLevel(scale), this.maxZoomLevel());
                        var zoomLevelScale = this.scaleForLevel(zoomLevel);
                        var diff = scale / zoomLevelScale;
                        var tileSizeInZoomLevel = TileImagePage.TILE_SIZE / zoomLevelScale;
                        var startX = Math.floor(rect.pos.x / tileSizeInZoomLevel);
                        var startY = Math.floor(rect.pos.y / tileSizeInZoomLevel);
                        var endX = Math.ceil(Math.min(rect.pos.x + rect.size.width, this.size.width) / tileSizeInZoomLevel);
                        var endY = Math.ceil(Math.min(rect.pos.y + rect.size.height, this.size.height) / tileSizeInZoomLevel);
                        this._updateBackbuffer(startX, startY, endX, endY, zoomLevel, overview);
                        ctx.save();
                        {
                            var xBase = (startX * tileSizeInZoomLevel - rect.pos.x) * scale;
                            var yBase = (startY * tileSizeInZoomLevel - rect.pos.y) * scale;
                            ctx.translate(xBase, yBase);
                            ctx.scale(diff, diff);
                            if (overview) {
                                ctx.drawImage(this._previewBackBuffer, 0, 0);
                            }
                            else {
                                ctx.drawImage(this._backBuffer, 0, 0);
                            }
                        }
                        ctx.restore();
                    };
                    TileImagePage.prototype.setAltoContent = function (value) {
                        if (value != this._altoContent) {
                            this._altoContent = value;
                            this.updateHTML();
                        }
                    };
                    TileImagePage.prototype.registerHTMLPage = function (elem) {
                        this._rootElem = elem;
                        this.updateHTML();
                    };
                    TileImagePage.prototype.updateHTML = function () {
                        if (this._altoContent != null && this._rootElem != null) {
                            while (this._rootElem.children.length > 0) {
                                this._rootElem.removeChild(this._rootElem.children.item(0));
                            }
                            this._rootElem.appendChild(this._altoContent);
                        }
                        if (typeof this.refreshCallback != "undefined" && this.refreshCallback != null) {
                            this.refreshCallback();
                        }
                    };
                    TileImagePage.prototype.clear = function () {
                        this._abortLoadingTiles();
                        this._backBuffer.width = 1;
                        this._backBuffer.height = 1;
                        this._backBufferAreaZoom = null;
                        var previewTilePos = new Position3D(0, 0, 0);
                        var hasPreview = this._tiles.has(previewTilePos);
                        if (hasPreview) {
                            var tile = this._tiles.get(previewTilePos);
                        }
                        this._tiles.clear();
                        if (hasPreview) {
                            this._tiles.set(previewTilePos, tile);
                        }
                        this._loadingTiles.clear();
                    };
                    TileImagePage.prototype._updateBackbuffer = function (startX, startY, endX, endY, zoomLevel, overview) {
                        var newBackBuffer = new Rect(new Position2D(startX, startY), new Size2D(endX - startX, endY - startY));
                        if (overview) {
                            if (this._previewBackBufferArea !== null && !this._imgPreviewLoaded && this._previewBackBufferArea.equals(newBackBuffer) && zoomLevel == this._previewBackBufferAreaZoom) {
                                return;
                            }
                            else {
                                this._previewBackBuffer.width = newBackBuffer.size.width * 256;
                                this._previewBackBuffer.height = newBackBuffer.size.height * 256;
                                this._drawToBackbuffer(startX, startY, endX, endY, zoomLevel, true);
                            }
                            this._previewBackBufferArea = newBackBuffer;
                            this._previewBackBufferAreaZoom = zoomLevel;
                            this._imgPreviewLoaded = false;
                        }
                        else {
                            if (this._backBufferArea !== null && !this._imgNotPreviewLoaded && this._backBufferArea.equals(newBackBuffer) && zoomLevel == this._backBufferAreaZoom) {
                                return;
                            }
                            else {
                                this._abortLoadingTiles();
                                this._backBuffer.width = newBackBuffer.size.width * 256;
                                this._backBuffer.height = newBackBuffer.size.height * 256;
                                this._drawToBackbuffer(startX, startY, endX, endY, zoomLevel, false);
                            }
                            this._backBufferArea = newBackBuffer;
                            this._backBufferAreaZoom = zoomLevel;
                            this._imgNotPreviewLoaded = false;
                        }
                    };
                    TileImagePage.prototype._abortLoadingTiles = function () {
                        this._loadingTiles.forEach(function (k, v) {
                            v.onerror = TileImagePage.EMPTY_FUNCTION;
                            v.onload = TileImagePage.EMPTY_FUNCTION;
                            v.src = "#";
                        });
                        this._loadingTiles.clear();
                    };
                    TileImagePage.prototype._drawToBackbuffer = function (startX, startY, endX, endY, zoomLevel, _overview) {
                        var ctx;
                        if (_overview) {
                            ctx = this._previewBackBuffer.getContext("2d");
                        }
                        else {
                            ctx = this._backBuffer.getContext("2d");
                        }
                        for (var x = startX; x < endX; x++) {
                            for (var y = startY; y < endY; y++) {
                                var tilePosition = new Position3D(x, y, zoomLevel);
                                var tile = this.loadTile(tilePosition);
                                var rasterPositionX = (x - startX) * 256;
                                var rasterPositionY = (y - startY) * 256;
                                if (tile != null) {
                                    ctx.drawImage(tile, Math.floor(rasterPositionX), rasterPositionY, tile.naturalWidth, tile.naturalHeight);
                                }
                                else {
                                    var preview = this.getPreview(tilePosition);
                                    if (preview != null) {
                                        this.drawPreview(ctx, new Position2D(rasterPositionX, rasterPositionY), preview);
                                    }
                                }
                            }
                        }
                    };
                    TileImagePage.prototype.drawPreview = function (ctx, targetPosition, tile) {
                        tile.areaToDraw.size.width = Math.min(tile.areaToDraw.pos.x + tile.areaToDraw.size.width, tile.tile.naturalWidth) - tile.areaToDraw.pos.x;
                        tile.areaToDraw.size.height = Math.min(tile.areaToDraw.pos.y + tile.areaToDraw.size.height, tile.tile.naturalHeight) - tile.areaToDraw.pos.y;
                        ctx.drawImage(tile.tile, tile.areaToDraw.pos.x, tile.areaToDraw.pos.y, tile.areaToDraw.size.width, tile.areaToDraw.size.height, targetPosition.x, targetPosition.y, tile.areaToDraw.size.width * tile.scale, tile.areaToDraw.size.height * tile.scale);
                    };
                    TileImagePage.prototype.loadTile = function (tilePos) {
                        var _this = this;
                        if (this._tiles.has(tilePos)) {
                            return this._tiles.get(tilePos);
                        }
                        else {
                            if (!this._loadingTiles.has(tilePos)) {
                                this._loadTile(tilePos, function (img) {
                                    _this._tiles.set(tilePos, img);
                                    if (typeof _this.refreshCallback != "undefined" && _this.refreshCallback != null) {
                                        _this._imgPreviewLoaded = true;
                                        _this._imgNotPreviewLoaded = true;
                                        _this.refreshCallback();
                                    }
                                }, function () {
                                    console.error("Could not load tile : " + tilePos.toString());
                                });
                            }
                        }
                        return null;
                    };
                    TileImagePage.prototype.getPreview = function (tilePos, scale) {
                        if (scale === void 0) { scale = 1; }
                        if (this._tiles.has(tilePos)) {
                            var tile = this._tiles.get(tilePos);
                            return { tile: tile, areaToDraw: new Rect(new Position2D(0, 0), new Size2D(256, 256)), scale: scale };
                        }
                        else {
                            var newZoom = tilePos.z - 1;
                            if (newZoom < 0) {
                                return null;
                            }
                            var newPos = new Position2D(Math.floor(tilePos.x / 2), Math.floor(tilePos.y / 2));
                            var xGridPos = tilePos.x % 2;
                            var yGridPos = tilePos.y % 2;
                            var prev = this.getPreview(new Position3D(newPos.x, newPos.y, newZoom), scale * 2);
                            if (prev != null) {
                                var newAreaSize = new Size2D(prev.areaToDraw.size.width / 2, prev.areaToDraw.size.height / 2);
                                var newAreaPos = new Position2D(prev.areaToDraw.pos.x + (newAreaSize.width * xGridPos), prev.areaToDraw.pos.y + (newAreaSize.height * yGridPos));
                                return {
                                    tile: prev.tile,
                                    areaToDraw: new Rect(newAreaPos, newAreaSize),
                                    scale: prev.scale
                                };
                            }
                            else {
                                return null;
                            }
                        }
                    };
                    TileImagePage.prototype.maxZoomLevel = function () {
                        return Math.max(Math.ceil(Math.log(Math.max(this._width, this._height) / TileImagePage.TILE_SIZE) / Math.LN2), 0);
                    };
                    TileImagePage.prototype.getZoomLevel = function (scale) {
                        return Math.max(0, Math.ceil(this.maxZoomLevel() - Math.log(scale) / Utils.LOG_HALF));
                    };
                    TileImagePage.prototype.scaleForLevel = function (level) {
                        return Math.pow(0.5, this.maxZoomLevel() - level);
                    };
                    TileImagePage.prototype._loadTile = function (tilePos, okCallback, errorCallback) {
                        var _this = this;
                        var pathSelect = Utils.hash(tilePos.toString()) % this._tilePath.length;
                        var path = this._tilePath[pathSelect];
                        var image = new Image();
                        image.onload = function () {
                            _this._loadingTiles.remove(tilePos);
                            okCallback(image);
                        };
                        image.onerror = function () {
                            errorCallback();
                        };
                        image.src = ViewerFormatString(path, tilePos);
                        this._loadingTiles.set(tilePos, image);
                    };
                    TileImagePage.prototype.toString = function () {
                        return this._tilePath[0];
                    };
                    TileImagePage.TILE_SIZE = 256;
                    TileImagePage.EMPTY_FUNCTION = function () {
                    };
                    return TileImagePage;
                }());
                canvas.TileImagePage = TileImagePage;
            })(canvas = widgets.canvas || (widgets.canvas = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var json = {
    "resources": {
        "script": ["http://archive.thulb.uni-jena.de/hisbest/modules/iview2/js/iview-client-base.js", "http://archive.thulb.uni-jena.de/hisbest/modules/iview2/js/iview-client-desktop.js", "http://archive.thulb.uni-jena.de/hisbest/modules/iview2/js/iview-client-mets.js", "http://archive.thulb.uni-jena.de/hisbest/modules/iview2/js/iview-client-logo.js", "http://archive.thulb.uni-jena.de/hisbest/modules/iview2/js/iview-client-metadata.js"],
        "css": ["http://archive.thulb.uni-jena.de/hisbest/modules/iview2/css/default.css", "http://archive.thulb.uni-jena.de/hisbest/css/urmelLogo.css"]
    },
    "properties": {
        "derivateURL": "http://archive.thulb.uni-jena.de/hisbest/servlets/MCRFileNodeServlet/HisBest_derivate_00016280/",
        "metsURL": "http://archive.thulb.uni-jena.de/hisbest/servlets/MCRMETSServlet/HisBest_derivate_00016280",
        "i18nURL": "http://archive.thulb.uni-jena.de/hisbest/servlets/MCRLocaleServlet/{lang}/component.iview2.*",
        "derivate": "HisBest_derivate_00016280",
        "filePath": "/2_8_30.tif",
        "mobile": false,
        "tileProviderPath": "http://archive.thulb.uni-jena.de/hisbest/servlets/MCRTileServlet/",
        "imageXmlPath": "http://archive.thulb.uni-jena.de/hisbest/servlets/MCRTileServlet/",
        "pdfCreatorURI": "http://wrackdm17.thulb.uni-jena.de/mets-printer/pdf",
        "text.enabled": "false",
        "logoURL": "http://archive.thulb.uni-jena.de/hisbest/images/Urmel_Logo_leicht_grau.svg",
        "doctype": "mets",
        "webApplicationBaseURL": "http://archive.thulb.uni-jena.de/hisbest/",
        "metadataURL": "http://archive.thulb.uni-jena.de/hisbest/receive/HisBest_cbu_00029645?XSL.Transformer\u003dmycoreobject-viewer",
        "pdfCreatorStyle": "pdf",
        "objId": "HisBest_cbu_00029645",
        "lang": "de"
    }
};
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var alto;
            (function (alto) {
                var AltoStyle = (function () {
                    function AltoStyle(_id, _fontFamily, _fontSize, _fontStyle) {
                        this._id = _id;
                        this._fontFamily = _fontFamily;
                        this._fontSize = _fontSize;
                        this._fontStyle = _fontStyle;
                    }
                    AltoStyle.prototype.getId = function () {
                        return this._id;
                    };
                    AltoStyle.prototype.getFontFamily = function () {
                        return this._fontFamily;
                    };
                    AltoStyle.prototype.getFontSize = function () {
                        return this._fontSize;
                    };
                    AltoStyle.prototype.getFontStyle = function () {
                        return this._fontStyle;
                    };
                    return AltoStyle;
                }());
                alto.AltoStyle = AltoStyle;
            })(alto = widgets.alto || (widgets.alto = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var AltoElementType;
(function (AltoElementType) {
    AltoElementType[AltoElementType["ComposedBlock"] = 0] = "ComposedBlock";
    AltoElementType[AltoElementType["Illustration"] = 1] = "Illustration";
    AltoElementType[AltoElementType["GraphicalElement"] = 2] = "GraphicalElement";
    AltoElementType[AltoElementType["TextBlock"] = 3] = "TextBlock";
    AltoElementType[AltoElementType["TextLine"] = 4] = "TextLine";
    AltoElementType[AltoElementType["String"] = 5] = "String";
    AltoElementType[AltoElementType["SP"] = 6] = "SP";
    AltoElementType[AltoElementType["HYP"] = 7] = "HYP";
})(AltoElementType || (AltoElementType = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var alto;
            (function (alto) {
                var AltoElement = (function () {
                    function AltoElement(_parent, _type, _id, _width, _height, _hpos, _vpos) {
                        this._parent = _parent;
                        this._type = _type;
                        this._id = _id;
                        this._width = _width;
                        this._height = _height;
                        this._hpos = _hpos;
                        this._vpos = _vpos;
                        this._children = new Array();
                        this._content = null;
                        this._style = null;
                    }
                    AltoElement.prototype.getHeight = function () {
                        return this._height;
                    };
                    AltoElement.prototype.getHPos = function () {
                        return this._hpos;
                    };
                    AltoElement.prototype.getId = function () {
                        return this._id;
                    };
                    AltoElement.prototype.getType = function () {
                        return this._type;
                    };
                    AltoElement.prototype.getVPos = function () {
                        return this._vpos;
                    };
                    AltoElement.prototype.getWidth = function () {
                        return this._width;
                    };
                    AltoElement.prototype.getChildren = function () {
                        return this._children;
                    };
                    AltoElement.prototype.setChildren = function (childs) {
                        this._children = childs;
                    };
                    AltoElement.prototype.getContent = function () {
                        return this._content;
                    };
                    AltoElement.prototype.setContent = function (content) {
                        this._content = content;
                    };
                    AltoElement.prototype.getStyle = function () {
                        return this._style;
                    };
                    AltoElement.prototype.setAltoStyle = function (style) {
                        this._style = style;
                    };
                    AltoElement.prototype.getParent = function () {
                        return this._parent;
                    };
                    AltoElement.prototype.getBlockHPos = function () {
                        return this._hpos;
                    };
                    AltoElement.prototype.getBlockVPos = function () {
                        return this._vpos;
                    };
                    return AltoElement;
                }());
                alto.AltoElement = AltoElement;
            })(alto = widgets.alto || (widgets.alto = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var alto;
            (function (alto) {
                var AltoFile = (function () {
                    function AltoFile(styles, layout) {
                        this._allStyles = {};
                        this._rootChilds = new Array();
                        this._allElements = new Array();
                        this._allTextBlocks = new Array();
                        this._allIllustrations = new Array();
                        this._allLines = new Array();
                        this._allComposedBlock = new Array();
                        this._allGraphicalElements = new Array();
                        this._pageWidth = -1;
                        this._pageHeight = -1;
                        var styleList = styles.getElementsByTagName("TextStyle");
                        for (var index = 0; index < styleList.length; index++) {
                            var style = styleList.item(index);
                            var altoStyle = this.createAltoStyle(style);
                            this._allStyles[altoStyle.getId()] = altoStyle;
                        }
                        var pages = layout.getElementsByTagName("Page");
                        var page = pages.item(0);
                        if (page == null) {
                            return;
                        }
                        this._pageWidth = parseInt(page.getAttribute("WIDTH"));
                        this._pageHeight = parseInt(page.getAttribute("HEIGHT"));
                        var printSpaces = page.getElementsByTagName("PrintSpace");
                        var printSpace = printSpaces.item(0);
                        if (printSpace == null) {
                            return;
                        }
                        this._rootChilds = this.extractElements(printSpace);
                        this._allElements = this._allTextBlocks.concat(this._allIllustrations).concat(this._allComposedBlock).concat(this._allLines).concat(this._allGraphicalElements);
                    }
                    Object.defineProperty(AltoFile.prototype, "allElements", {
                        get: function () {
                            return this._allElements;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    AltoFile.prototype.createAltoStyle = function (src) {
                        var id = src.getAttribute("ID");
                        var fontFamily = src.getAttribute("FONTFAMILY");
                        var fontSize = parseFloat(src.getAttribute("FONTSIZE"));
                        var fontStyle = src.getAttribute("FONTSTYLE");
                        return new alto.AltoStyle(id, fontFamily, fontSize, fontStyle);
                    };
                    AltoFile.prototype.createAltoElement = function (src, type, parent) {
                        var width = parseFloat(src.getAttribute("WIDTH"));
                        var height = parseFloat(src.getAttribute("HEIGHT"));
                        var hpos = parseFloat(src.getAttribute("HPOS"));
                        var vpos = parseFloat(src.getAttribute("VPOS"));
                        var id = src.getAttribute("ID");
                        var styleID = src.getAttribute("STYLEREFS");
                        var altoElement = new alto.AltoElement(parent, type, id, width, height, hpos, vpos);
                        if (styleID != null) {
                            var style = this._allStyles[styleID];
                            if (style != null) {
                                altoElement.setAltoStyle(style);
                            }
                        }
                        return altoElement;
                    };
                    AltoFile.prototype.extractElements = function (elem, parent) {
                        if (parent === void 0) { parent = null; }
                        var childrenOfElement = new Array();
                        var childList = elem.childNodes;
                        for (var index = 0; index < childList.length; index++) {
                            var currentElement = childList.item(index);
                            if (currentElement instanceof Element) {
                                var elementType = this.detectElementType(currentElement);
                                if (elementType != null) {
                                    var currentAltoElement = this.createAltoElement(currentElement, elementType, parent);
                                    switch (elementType) {
                                        case AltoElementType.ComposedBlock:
                                        case AltoElementType.TextBlock:
                                            var blockChildren = this.extractElements(currentElement, currentAltoElement);
                                            currentAltoElement.setChildren(blockChildren);
                                            childrenOfElement.push(currentAltoElement);
                                            if (elementType == AltoElementType.TextBlock) {
                                                this._allTextBlocks.push(currentAltoElement);
                                            }
                                            if (elementType == AltoElementType.ComposedBlock) {
                                                this._allComposedBlock.push(currentAltoElement);
                                            }
                                            break;
                                        case AltoElementType.Illustration:
                                        case AltoElementType.GraphicalElement:
                                            if (elementType == AltoElementType.Illustration) {
                                                this._allIllustrations.push(currentAltoElement);
                                            }
                                            if (elementType == AltoElementType.GraphicalElement) {
                                                this._allGraphicalElements.push(currentAltoElement);
                                            }
                                            break;
                                        case AltoElementType.TextLine:
                                            var listChildrens = this.extractElements(currentElement, currentAltoElement);
                                            currentAltoElement.setChildren(listChildrens);
                                            childrenOfElement.push(currentAltoElement);
                                            this._allLines.push(currentAltoElement);
                                            break;
                                        case AltoElementType.String:
                                        case AltoElementType.SP:
                                        case AltoElementType.HYP:
                                            currentAltoElement.setContent(currentElement.getAttribute("CONTENT"));
                                            childrenOfElement.push(currentAltoElement);
                                            break;
                                    }
                                }
                            }
                        }
                        return childrenOfElement;
                    };
                    AltoFile.prototype.getBlocks = function () {
                        return this._allTextBlocks;
                    };
                    AltoFile.prototype.getBlockContent = function (id) {
                        var content = "";
                        for (var index = 0; index < this._allTextBlocks.length; index++) {
                            if (this._allTextBlocks[index].getId() == id) {
                                var lines = this._allTextBlocks[index].getChildren();
                                for (var i = 0; i < lines.length; i++) {
                                    content += this.getContainerContent(lines[i].getId(), this._allLines);
                                }
                                break;
                            }
                        }
                        return content;
                    };
                    AltoFile.prototype.getContainerContent = function (id, container) {
                        var content = "";
                        for (var index = 0; index < container.length; index++) {
                            if (container[index].getId() == id) {
                                var elements = container[index].getChildren();
                                for (var i = 0; i < elements.length; i++) {
                                    var childs = elements[i].getChildren();
                                    content += "<span data-id=" + elements[i].getId() + ">";
                                    for (var j = 0; j < childs.length; j++) {
                                        content += childs[j].getContent() + " ";
                                    }
                                    content += "</span>";
                                }
                                content.trim();
                                break;
                            }
                        }
                        return content;
                    };
                    AltoFile.prototype.getLines = function () {
                        return this._allLines;
                    };
                    Object.defineProperty(AltoFile.prototype, "pageWidth", {
                        get: function () {
                            return this._pageWidth;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(AltoFile.prototype, "pageHeight", {
                        get: function () {
                            return this._pageHeight;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    AltoFile.prototype.detectElementType = function (currentElement) {
                        if (currentElement.nodeName.toLowerCase() == "string") {
                            return AltoElementType.String;
                        }
                        if (currentElement.nodeName.toLowerCase() == "sp") {
                            return AltoElementType.SP;
                        }
                        if (currentElement.nodeName.toLowerCase() == "hyp") {
                            return AltoElementType.HYP;
                        }
                        if (currentElement.nodeName.toLowerCase() == "textline") {
                            return AltoElementType.TextLine;
                        }
                        if (currentElement.nodeName.toLowerCase() == "textblock") {
                            return AltoElementType.TextBlock;
                        }
                        if (currentElement.nodeName.toLowerCase() == "composedblock") {
                            return AltoElementType.ComposedBlock;
                        }
                        if (currentElement.nodeName.toLowerCase() == "illustration") {
                            return AltoElementType.Illustration;
                        }
                        if (currentElement.nodeName.toLowerCase() == "graphicalelement") {
                            return AltoElementType.GraphicalElement;
                        }
                        return null;
                    };
                    return AltoFile;
                }());
                alto.AltoFile = AltoFile;
            })(alto = widgets.alto || (widgets.alto = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var events;
            (function (events) {
                var RequestAltoModelEvent = (function (_super) {
                    __extends(RequestAltoModelEvent, _super);
                    function RequestAltoModelEvent(component, _href, _onResolve) {
                        _super.call(this, component, RequestAltoModelEvent.TYPE);
                        this._href = _href;
                        this._onResolve = _onResolve;
                    }
                    RequestAltoModelEvent.TYPE = "RequestAltoModelEvent";
                    return RequestAltoModelEvent;
                }(events.MyCoReImageViewerEvent));
                events.RequestAltoModelEvent = RequestAltoModelEvent;
            })(events = components.events || (components.events = {}));
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReAltoModelProvider = (function (_super) {
                __extends(MyCoReAltoModelProvider, _super);
                function MyCoReAltoModelProvider(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this.structureModel = null;
                    this.pageHrefAltoHrefMap = new MyCoReMap();
                    this.altoHrefPageHrefMap = new MyCoReMap();
                    this.altoModelRequestTempStore = new Array();
                }
                MyCoReAltoModelProvider.prototype.init = function () {
                    if (this._settings.doctype == "mets") {
                        this.trigger(new components.events.WaitForEvent(this, components.events.StructureModelLoadedEvent.TYPE));
                        this.trigger(new components.events.WaitForEvent(this, components.events.RequestAltoModelEvent.TYPE));
                    }
                };
                MyCoReAltoModelProvider.prototype.handle = function (e) {
                    var _this = this;
                    if (e.type == components.events.RequestAltoModelEvent.TYPE) {
                        if (this.structureModel == null || this.structureModel._textContentPresent) {
                            var rtce = e;
                            var _a = this.detectHrefs(rtce._href), altoHref_1 = _a.altoHref, imgHref_1 = _a.imgHref;
                            if (this.pageHrefAltoHrefMap.has(imgHref_1)) {
                                this.resolveAltoModel(imgHref_1, function (mdl) {
                                    rtce._onResolve(imgHref_1, altoHref_1, mdl);
                                });
                            }
                            else if (this.structureModel == null) {
                                this.altoModelRequestTempStore.push(rtce);
                            }
                        }
                    }
                    if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                        var smle = e;
                        this.structureModel = smle.structureModel;
                        if (smle.structureModel._textContentPresent) {
                            this.fillAltoHrefMap();
                            for (var rtceIndex in this.altoModelRequestTempStore) {
                                var rtce = this.altoModelRequestTempStore[rtceIndex];
                                var _b = this.detectHrefs(rtce._href), altoHref = _b.altoHref, imgHref = _b.imgHref;
                                (function (altoHref, imgHref, cb) {
                                    if (_this.pageHrefAltoHrefMap.has(imgHref)) {
                                        _this.resolveAltoModel(imgHref, function (mdl) {
                                            cb(imgHref, altoHref, mdl);
                                        });
                                    }
                                    else {
                                        console.warn("RPE : altoHref not found!");
                                    }
                                })(altoHref, imgHref, rtce._onResolve);
                            }
                            this.altoModelRequestTempStore = [];
                            this.trigger(new components.events.WaitForEvent(this, components.events.RequestTextContentEvent.TYPE));
                        }
                    }
                    return;
                };
                MyCoReAltoModelProvider.prototype.detectHrefs = function (href) {
                    var altoHref, imgHref;
                    if (this.altoHrefPageHrefMap.has(href)) {
                        altoHref = href;
                        imgHref = this.altoHrefPageHrefMap.get(altoHref);
                    }
                    else {
                        imgHref = href;
                        altoHref = this.pageHrefAltoHrefMap.get(imgHref);
                    }
                    return { altoHref: altoHref, imgHref: imgHref };
                };
                MyCoReAltoModelProvider.prototype.fillAltoHrefMap = function () {
                    var _this = this;
                    this.structureModel.imageList.forEach(function (image) {
                        var hasTextHref = image.additionalHrefs.has(MyCoReAltoModelProvider.TEXT_HREF);
                        if (hasTextHref) {
                            var altoHref = image.additionalHrefs.get(MyCoReAltoModelProvider.TEXT_HREF);
                            _this.pageHrefAltoHrefMap.set(image.href, altoHref);
                            _this.altoHrefPageHrefMap.set(altoHref, image.href);
                        }
                    });
                };
                Object.defineProperty(MyCoReAltoModelProvider.prototype, "handlesEvents", {
                    get: function () {
                        if (this._settings.doctype == "mets") {
                            return [components.events.RequestAltoModelEvent.TYPE, components.events.StructureModelLoadedEvent.TYPE];
                        }
                        else {
                            return [];
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReAltoModelProvider.prototype.resolveAltoModel = function (pageId, callback) {
                    var _this = this;
                    var altoHref = this.pageHrefAltoHrefMap.get(pageId);
                    if (MyCoReAltoModelProvider.altoHrefModelMap.has(altoHref)) {
                        callback(MyCoReAltoModelProvider.altoHrefModelMap.get(altoHref));
                    }
                    else {
                        this.loadAltoXML(this._settings.derivateURL + altoHref, function (result) {
                            _this.loadedAltoModel(pageId, altoHref, result, callback);
                        }, function (e) {
                            console.error("Failed to receive alto from server... ", e);
                        });
                    }
                };
                MyCoReAltoModelProvider.prototype.loadAltoXML = function (altoPath, successCallback, errorCallback) {
                    var requestObj = {
                        url: altoPath,
                        type: "GET",
                        dataType: "xml",
                        async: true,
                        success: successCallback,
                        error: errorCallback
                    };
                    jQuery.ajax(requestObj);
                };
                MyCoReAltoModelProvider.prototype.loadedAltoModel = function (parentId, altoHref, xml, callback) {
                    var pageStyles = xml.getElementsByTagName("Styles");
                    var styles = pageStyles.item(0);
                    var layouts = xml.getElementsByTagName("Layout");
                    var layout = layouts.item(0);
                    if (styles != null && layout != null) {
                        var altoContainer = new viewer.widgets.alto.AltoFile(styles, layout);
                        MyCoReAltoModelProvider.altoHrefModelMap.set(altoHref, altoContainer);
                        callback(altoContainer);
                    }
                };
                MyCoReAltoModelProvider.altoHrefModelMap = new MyCoReMap();
                MyCoReAltoModelProvider.TEXT_HREF = "AltoHref";
                return MyCoReAltoModelProvider;
            }(components.ViewerComponent));
            components.MyCoReAltoModelProvider = MyCoReAltoModelProvider;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReAltoModelProvider);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var alto;
            (function (alto_1) {
                var AltoHTMLGenerator = (function () {
                    function AltoHTMLGenerator() {
                    }
                    AltoHTMLGenerator.prototype.generateHtml = function (alto) {
                        var _this = this;
                        var fontFamily = "sans-serif";
                        var element = document.createElement("div");
                        element.style.position = "absolute";
                        element.style.whiteSpace = "nowrap";
                        element.style.fontFamily = "sans-serif";
                        var endecoderElem = document.createElement("span");
                        var mesureCanvas = document.createElement("canvas");
                        var ctx = mesureCanvas.getContext("2d");
                        var outline = alto.pageHeight * 0.002;
                        var blockBefore = null;
                        var buff = alto.getBlocks().map(function (block) {
                            var drawOutline = blockBefore !== null &&
                                (blockBefore.getVPos() + blockBefore.getHeight() + outline < block.getVPos() ||
                                    blockBefore.getHPos() + blockBefore.getWidth() + outline < block.getHPos());
                            var blockFontSize = _this.getFontSize(ctx, block, fontFamily);
                            blockFontSize *= 0.9;
                            var blockDiv = "<div";
                            blockDiv += " class='altoBlock'";
                            blockDiv += " style='top: " + block.getVPos() + "px;";
                            blockDiv += " left: " + block.getHPos() + "px;";
                            blockDiv += " width: " + block.getWidth() + "px;";
                            blockDiv += " height: " + block.getHeight() + "px;";
                            blockDiv += " font-size: " + blockFontSize + "px;";
                            if (drawOutline) {
                                blockDiv += " outline: " + outline + "px solid white;";
                            }
                            blockDiv += "'>";
                            block.getChildren().map(function (line) {
                                endecoderElem.innerHTML = _this.getLineAsString(line);
                                var lineDiv = "<p";
                                lineDiv += " class='altoLine'";
                                lineDiv += " style='height: " + line.getHeight() + "px;";
                                lineDiv += " width: " + line.getWidth() + "px;";
                                lineDiv += " left: " + line.getHPos() + "px;";
                                lineDiv += " top: " + line.getVPos() + "px;";
                                var lineStyle = line.getStyle();
                                if (lineStyle != null) {
                                    var lineFontStyle = lineStyle.getFontStyle();
                                    if (lineFontStyle != null) {
                                        if (lineFontStyle == "italic") {
                                            lineDiv += " font-style: italic;";
                                        }
                                        else if (lineFontStyle == "bold") {
                                            lineDiv += " font-weight: bold;";
                                        }
                                    }
                                }
                                lineDiv += "'>" + endecoderElem.innerHTML + "</p>";
                                blockDiv += lineDiv;
                            });
                            blockDiv += "</div>";
                            blockBefore = block;
                            return blockDiv;
                        });
                        element.innerHTML = buff.join("");
                        return element;
                    };
                    AltoHTMLGenerator.prototype.getWordsArray = function (line) {
                        var tmpElement = document.createElement("span");
                        return line.getChildren()
                            .filter(function (elementInLine) { return elementInLine.getType() === AltoElementType.String; })
                            .map(function (word, wordCount, allWords) {
                            tmpElement.innerText = word.getContent();
                            return tmpElement.innerHTML;
                        });
                    };
                    AltoHTMLGenerator.prototype.getLineAsString = function (line) {
                        return this.getWordsArray(line).join(" ");
                    };
                    AltoHTMLGenerator.prototype.getFontSize = function (ctx, block, fontFamily) {
                        var _this = this;
                        var getFontStyle = function (line) {
                            var lineStyle = line.getStyle();
                            if (lineStyle !== null) {
                                var lineFontStyle = lineStyle.getFontStyle();
                                return lineFontStyle !== null ? (lineFontStyle + " ") : "";
                            }
                            return "";
                        };
                        var getLineHeight = function (line, startSize) {
                            var lineString = _this.getLineAsString(line);
                            ctx.font = getFontStyle(line) + startSize + "px " + fontFamily;
                            var widthScale = block.getWidth() / ctx.measureText(lineString).width;
                            return widthScale > 1 ? startSize : startSize * widthScale;
                        };
                        if (block.getChildren().length === 1) {
                            var line = block.getChildren()[0];
                            return getLineHeight(line, line.getHeight());
                        }
                        var maxSize = 9999;
                        block.getChildren().forEach(function (line) {
                            maxSize = getLineHeight(line, maxSize);
                        });
                        return maxSize;
                    };
                    return AltoHTMLGenerator;
                }());
                alto_1.AltoHTMLGenerator = AltoHTMLGenerator;
            })(alto = widgets.alto || (widgets.alto = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var RequestAltoModelEvent = mycore.viewer.components.events.RequestAltoModelEvent;
            var AltoHTMLGenerator = mycore.viewer.widgets.alto.AltoHTMLGenerator;
            var MyCoReMetsPageProviderComponent = (function (_super) {
                __extends(MyCoReMetsPageProviderComponent, _super);
                function MyCoReMetsPageProviderComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this._imageInformationMap = new MyCoReMap();
                    this._imagePageMap = new MyCoReMap();
                    this._altoHTMLGenerator = new AltoHTMLGenerator();
                }
                MyCoReMetsPageProviderComponent.prototype.init = function () {
                    if (this._settings.doctype == 'mets') {
                        this.trigger(new components.events.WaitForEvent(this, components.events.RequestPageEvent.TYPE));
                    }
                };
                MyCoReMetsPageProviderComponent.prototype.getPage = function (image, resolve) {
                    var _this = this;
                    if (this._imagePageMap.has(image)) {
                        resolve(this.createPageFromMetadata(image, this._imageInformationMap.get(image)));
                    }
                    else {
                        this.getPageMetadata(image, function (metadata) {
                            resolve(_this.createPageFromMetadata(image, metadata));
                        });
                    }
                };
                MyCoReMetsPageProviderComponent.prototype.createPageFromMetadata = function (imageId, metadata) {
                    var _this = this;
                    var tiles = this._settings.tileProviderPath.split(",");
                    var paths = new Array();
                    tiles.forEach(function (path) {
                        paths.push(path + _this._settings.derivate + metadata.path + "/{z}/{y}/{x}.jpg");
                    });
                    return new viewer.widgets.canvas.TileImagePage(imageId, metadata.width, metadata.height, paths);
                };
                MyCoReMetsPageProviderComponent.prototype.getPageMetadata = function (image, resolve) {
                    var _this = this;
                    image = (image.charAt(0) == "/") ? image.substr(1) : image;
                    if (this._imageInformationMap.has(image)) {
                        resolve(this._imageInformationMap.get(image));
                    }
                    else {
                        var path = "/" + image;
                        mycore.viewer.widgets.image.XMLImageInformationProvider.getInformation(this._settings.imageXmlPath + this._settings.derivate, path, function (info) {
                            _this._imageInformationMap.set(image, info);
                            resolve(info);
                        }, function (error) {
                            console.log("Error while loading ImageInformations", +error.toString());
                        });
                    }
                };
                Object.defineProperty(MyCoReMetsPageProviderComponent.prototype, "handlesEvents", {
                    get: function () {
                        if (this._settings.doctype == 'mets') {
                            return [components.events.RequestPageEvent.TYPE];
                        }
                        else {
                            return [];
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReMetsPageProviderComponent.prototype.handle = function (e) {
                    var _this = this;
                    if (e.type == components.events.RequestPageEvent.TYPE) {
                        var rpe = e;
                        var pageAltoSynchronize = Utils.synchronize([
                            function (synchronizeObj) { return synchronizeObj.page != null; },
                            function (synchronizeObj) { return synchronizeObj.altoModel != null; },
                        ], function (synchronizeObj) {
                            var htmlElement = _this._altoHTMLGenerator.generateHtml(synchronizeObj.altoModel);
                            synchronizeObj.page.setAltoContent(htmlElement);
                        });
                        var synchronizeObj = { page: null, altoModel: null };
                        this.getPage(rpe._pageId, function (page) {
                            synchronizeObj.page = page;
                            pageAltoSynchronize(synchronizeObj);
                            rpe._onResolve(rpe._pageId, page);
                        });
                        this.trigger(new RequestAltoModelEvent(this, rpe._pageId, function (page, altoHref, altoModel) {
                            synchronizeObj.altoModel = altoModel;
                            pageAltoSynchronize(synchronizeObj);
                        }));
                    }
                    return;
                };
                return MyCoReMetsPageProviderComponent;
            }(components.ViewerComponent));
            components.MyCoReMetsPageProviderComponent = MyCoReMetsPageProviderComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReMetsPageProviderComponent);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var tei;
            (function (tei) {
                var TEILayer = (function () {
                    function TEILayer(_id, _label, mapping, contentLocation, teiStylesheet) {
                        this._id = _id;
                        this._label = _label;
                        this.mapping = mapping;
                        this.contentLocation = contentLocation;
                        this.teiStylesheet = teiStylesheet;
                    }
                    TEILayer.prototype.getId = function () {
                        return this._id;
                    };
                    TEILayer.prototype.getLabel = function () {
                        return this._label;
                    };
                    TEILayer.prototype.resolveLayer = function (pageHref, callback) {
                        if (this.mapping.has(pageHref)) {
                            var settings = {};
                            settings.async = true;
                            settings.success = function (data, textStatus, jqXHR) {
                                callback(true, jQuery(data));
                            };
                            jQuery.ajax(this.contentLocation + this.mapping.get(pageHref) + "?XSL.Style=" + this.teiStylesheet, settings);
                        }
                        else {
                            callback(false);
                        }
                    };
                    return TEILayer;
                }());
                tei.TEILayer = TEILayer;
            })(tei = widgets.tei || (widgets.tei = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReTEILayerProvider = (function (_super) {
                __extends(MyCoReTEILayerProvider, _super);
                function MyCoReTEILayerProvider(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this._model = null;
                    // dbu
                    if (this._settings.derivateContentTransformerServlet == null) {
                        this._settings.derivateContentTransformerServlet =
                        this._settings.webApplicationBaseURL + "servlets/MCRDerivateContentTransformerServlet/";
                    }
                    this.contentLocation = this._settings.derivateContentTransformerServlet + this._settings.derivate + "/";
                }
                MyCoReTEILayerProvider.prototype.init = function () {
                    if (this._settings.doctype == "mets") {
                        this.trigger(new components.events.WaitForEvent(this, components.events.StructureModelLoadedEvent.TYPE));
                    }
                };
                MyCoReTEILayerProvider.prototype.handle = function (e) {
                    var _this = this;
                    if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                        var smle = e;
                        this._model = smle.structureModel;
                        var transcriptions = new MyCoReMap();
                        var translations = new MyCoReMap();
                        var languages = new Array();
                        smle.structureModel._imageList.forEach(function (image) {
                            var additionalHrefs = image.additionalHrefs;
                            if (additionalHrefs.has(MyCoReTEILayerProvider.TEI_TRANSCRIPTION)) {
                                transcriptions.set(image.href, additionalHrefs.get(MyCoReTEILayerProvider.TEI_TRANSCRIPTION));
                            }
                            additionalHrefs.forEach(function (name, href) {
                                if (name.indexOf(MyCoReTEILayerProvider.TEI_TRANSLATION + ".") == 0) {
                                    var language = name.split(".")[1];
                                    if (!translations.has(language)) {
                                        translations.set(language, new MyCoReMap());
                                    }
                                    var idHrefTranslationMap = translations.get(language);
                                    idHrefTranslationMap.set(image.href, href);
                                    if (languages.indexOf(language) == -1) {
                                        languages.push(language);
                                    }
                                }
                            });
                        });
                        if (!transcriptions.isEmpty()) {
                            this.trigger(new components.events.ProvideLayerEvent(this, new viewer.widgets.tei.TEILayer("transcription", "transcription", transcriptions, this.contentLocation, this._settings.teiStylesheet || "html")));
                        }
                        var order = ["de", "en"];
                        if (languages.length != 0) {
                            languages
                                .sort(function (l1, l2) {
                                var l1Order = order.indexOf(l1);
                                var l2Order = order.indexOf(l2);
                                return l1Order - l2Order;
                            })
                                .forEach(function (language) {
                                var translationMap = translations.get(language);
                                _this.trigger(new components.events.ProvideLayerEvent(_this, new viewer.widgets.tei.TEILayer("translation_" + language, "translation_" + language, translationMap, _this.contentLocation, _this._settings.teiStylesheet || "html")));
                            });
                        }
                        return;
                    }
                };
                Object.defineProperty(MyCoReTEILayerProvider.prototype, "handlesEvents", {
                    get: function () {
                        if (this._settings.doctype == "mets") {
                            return [components.events.StructureModelLoadedEvent.TYPE];
                        }
                        else {
                            return [];
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReTEILayerProvider.TEI_TRANSCRIPTION = "TeiTranscriptionHref";
                MyCoReTEILayerProvider.TEI_TRANSLATION = "TeiTranslationHref";
                return MyCoReTEILayerProvider;
            }(components.ViewerComponent));
            components.MyCoReTEILayerProvider = MyCoReTEILayerProvider;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReTEILayerProvider);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var modal;
            (function (modal) {
                var IviewPrintModalWindow = (function (_super) {
                    __extends(IviewPrintModalWindow, _super);
                    function IviewPrintModalWindow(_mobile) {
                        _super.call(this, _mobile, "CreatePDF");
                        this.checkEventHandler = null;
                        this.rangeInputEventHandler = null;
                        this.okayClickHandler = null;
                        var that = this;
                        this._inputRow = jQuery("<div></div>");
                        this._inputRow.addClass("row");
                        this._inputRow.appendTo(this.modalBody);
                        this._previewBox = jQuery("<div></div>");
                        this._previewBox.addClass("printPreview");
                        this._previewBox.addClass("col-sm-6");
                        this._previewBox.addClass("thumbnail");
                        this._previewBox.appendTo(this._inputRow);
                        this._previewImage = jQuery("<img />");
                        this._previewImage.appendTo(this._previewBox);
                        this._pageSelectBox = jQuery("<form></form>");
                        this._pageSelectBox.addClass("printForm");
                        this._pageSelectBox.addClass("col-sm-6");
                        this._pageSelectBox.appendTo(this._inputRow);
                        this._selectGroup = jQuery("<div></div>");
                        this._selectGroup.addClass("form-group");
                        this._selectGroup.appendTo(this._pageSelectBox);
                        this._createRadioAllPages();
                        this._createRadioCurrentPage();
                        this._createRadioRangePages();
                        this._validationRow = jQuery("<div></div>");
                        this._validationRow.addClass("row");
                        this._validationRow.appendTo(this.modalBody);
                        this._validationMessage = jQuery("<p></p>");
                        this._validationMessage.addClass("col-sm-6");
                        this._validationMessage.addClass("pull-right");
                        this._validationMessage.appendTo(this._validationRow);
                        this._okayButton = jQuery("<a>OK</a>");
                        this._okayButton.attr("type", "button");
                        this._okayButton.addClass("btn btn-default");
                        this._okayButton.appendTo(this.modalFooter);
                        this._maximalPageMessage = jQuery("<div class='row'><span class='col-sm-12 message'></span></div>");
                        this._maximalPageMessage.appendTo(this.modalBody);
                        this._maximalPageNumber = jQuery("<span></span>");
                        this._maximalPageNumber.text("");
                        this._maximalPageMessage.children().append(this._maximalPageNumber);
                        var that = this;
                        this._okayButton.click(function () {
                            if (that.okayClickHandler != null) {
                                that.okayClickHandler();
                            }
                        });
                    }
                    IviewPrintModalWindow.prototype._createRadioAllPages = function () {
                        this._radioAllPages = jQuery("<div></div>");
                        this._radioAllPages.addClass("radio");
                        this._radioAllPagesLabelElement = jQuery("<label></label>");
                        this._radioAllPagesInput = jQuery("<input>");
                        this._radioAllPagesInput.attr("type", "radio");
                        this._radioAllPagesInput.attr("name", IviewPrintModalWindow.INPUT_IDENTIFIER);
                        this._radioAllPagesInput.attr("id", IviewPrintModalWindow.INPUT_IDENTIFIER);
                        this._radioAllPagesInput.attr("value", IviewPrintModalWindow.INPUT_ALL_VALUE);
                        this._radioAllPagesLabel = jQuery("<p></p>");
                        var that = this;
                        this._radioAllPagesInput.change(function () {
                            if (that.checkEventHandler != null) {
                                that.checkEventHandler(IviewPrintModalWindow.INPUT_ALL_VALUE);
                            }
                        });
                        this._radioAllPages.append(this._radioAllPagesLabelElement);
                        this._radioAllPagesLabelElement.append(this._radioAllPagesInput);
                        this._radioAllPagesLabelElement.append(this._radioAllPagesLabel);
                        this._radioAllPages.appendTo(this._selectGroup);
                    };
                    IviewPrintModalWindow.prototype._createRadioCurrentPage = function () {
                        this._radioCurrentPage = jQuery("<div></div>");
                        this._radioCurrentPage.addClass("radio");
                        this._radioCurrentPageLabelElement = jQuery("<label></label>");
                        this._radioCurrentPageInput = jQuery("<input>");
                        this._radioCurrentPageInput.attr("type", "radio");
                        this._radioCurrentPageInput.attr("name", IviewPrintModalWindow.INPUT_IDENTIFIER);
                        this._radioCurrentPageInput.attr("id", IviewPrintModalWindow.INPUT_IDENTIFIER);
                        this._radioCurrentPageInput.attr("value", IviewPrintModalWindow.INPUT_CURRENT_VALUE);
                        this._radioCurrentPageLabel = jQuery("<p></p>");
                        var that = this;
                        this._radioCurrentPageInput.change(function () {
                            if (that.checkEventHandler != null) {
                                that.checkEventHandler(IviewPrintModalWindow.INPUT_CURRENT_VALUE);
                            }
                        });
                        this._radioCurrentPage.append(this._radioCurrentPageLabelElement);
                        this._radioCurrentPageLabelElement.append(this._radioCurrentPageInput);
                        this._radioCurrentPageLabelElement.append(this._radioCurrentPageLabel);
                        this._radioCurrentPage.appendTo(this._selectGroup);
                    };
                    IviewPrintModalWindow.prototype._createRadioRangePages = function () {
                        var _this = this;
                        this._radioRangePages = jQuery("<div></div>");
                        this._radioRangePages.addClass("radio");
                        this._radioRangePagesLabelElement = jQuery("<label></label>");
                        this._radioRangePagesInput = jQuery("<input>");
                        this._radioRangePagesInput.attr("type", "radio");
                        this._radioRangePagesInput.attr("name", IviewPrintModalWindow.INPUT_IDENTIFIER);
                        this._radioRangePagesInput.attr("id", IviewPrintModalWindow.INPUT_IDENTIFIER);
                        this._radioRangePagesInput.attr("value", IviewPrintModalWindow.INPUT_RANGE_VALUE);
                        this._radioRangePagesLabel = jQuery("<p></p>");
                        this._radioRangePagesInputText = jQuery("<input>");
                        this._radioRangePagesInputText.addClass("form-control");
                        this._radioRangePagesInputText.attr("type", "text");
                        this._radioRangePagesInputText.attr("name", IviewPrintModalWindow.INPUT_RANGE_TEXT_IDENTIFIER);
                        this._radioRangePagesInputText.attr("id", IviewPrintModalWindow.INPUT_RANGE_TEXT_IDENTIFIER);
                        this._radioRangePagesInputText.attr("placeholder", "1,3-5,8");
                        var that = this;
                        var onActivateHandler = function () {
                            if (that.checkEventHandler != null) {
                                that.checkEventHandler(IviewPrintModalWindow.INPUT_RANGE_VALUE);
                            }
                            _this._radioRangePagesInputText.focus();
                        };
                        this._radioRangePagesInput.change(onActivateHandler);
                        this._radioRangePagesInput.click(onActivateHandler);
                        this._radioRangePagesInputText.click(function () {
                            _this.allChecked = false;
                            _this.currentChecked = false;
                            _this.rangeChecked = true;
                            onActivateHandler();
                            _this._radioRangePagesInputText.focus();
                        });
                        this._radioRangePagesInputText.keyup(function () {
                            if (that.rangeInputEventHandler != null) {
                                _this.rangeInputEventHandler(_this._radioRangePagesInputText.val());
                            }
                        });
                        this._radioRangePages.append(this._radioRangePagesLabelElement);
                        this._radioRangePagesLabelElement.append(this._radioRangePagesInput);
                        this._radioRangePagesLabelElement.append(this._radioRangePagesLabel);
                        this._radioRangePagesLabelElement.append(this._radioRangePagesInputText);
                        this._radioRangePages.appendTo(this._selectGroup);
                    };
                    Object.defineProperty(IviewPrintModalWindow.prototype, "rangeChecked", {
                        get: function () {
                            return this._radioRangePagesInput.prop("checked");
                        },
                        set: function (checked) {
                            this._radioRangePagesInput.prop("checked", checked);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewPrintModalWindow.prototype, "allChecked", {
                        get: function () {
                            return this._radioAllPagesInput.prop("checked");
                        },
                        set: function (checked) {
                            this._radioAllPagesInput.prop("checked", checked);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewPrintModalWindow.prototype, "currentChecked", {
                        get: function () {
                            return this._radioCurrentPageInput.prop("checked");
                        },
                        set: function (checked) {
                            this._radioCurrentPageInput.prop("checked", checked);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewPrintModalWindow.prototype, "validationResult", {
                        set: function (success) {
                            if (success) {
                                this._validationMessage.removeClass("text-danger");
                                this._validationMessage.addClass("text-success");
                                this._okayButton.removeClass("disabled");
                            }
                            else {
                                this._validationMessage.removeClass("text-success");
                                this._validationMessage.addClass("text-danger");
                                this._okayButton.addClass("disabled");
                            }
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewPrintModalWindow.prototype, "validationMessage", {
                        get: function () {
                            return this._validationMessage.text();
                        },
                        set: function (message) {
                            this._validationMessage.text(message);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewPrintModalWindow.prototype, "currentPageLabel", {
                        get: function () {
                            return this._radioCurrentPageLabel.text();
                        },
                        set: function (label) {
                            this._radioCurrentPageLabel.text(label);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewPrintModalWindow.prototype, "allPagesLabel", {
                        get: function () {
                            return this._radioAllPagesLabel.text();
                        },
                        set: function (label) {
                            this._radioAllPagesLabel.text(label);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewPrintModalWindow.prototype, "rangeLabel", {
                        get: function () {
                            return this._radioRangePagesLabel.text();
                        },
                        set: function (label) {
                            this._radioRangePagesLabel.text(label);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewPrintModalWindow.prototype, "previewImageSrc", {
                        get: function () {
                            return this._previewImage.attr("src");
                        },
                        set: function (src) {
                            this._previewImage.attr("src", src);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewPrintModalWindow.prototype, "rangeInputVal", {
                        get: function () {
                            return this._radioRangePagesInputText.val();
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewPrintModalWindow.prototype, "rangeInputEnabled", {
                        get: function () {
                            return this._radioRangePagesInputText.attr("enabled") == "true";
                        },
                        set: function (enabled) {
                            this._radioRangePagesInputText.val("");
                            this._radioRangePagesInputText.attr("enabled", enabled);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewPrintModalWindow.prototype, "maximalPages", {
                        set: function (number) {
                            this._maximalPageNumber.text(number);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewPrintModalWindow.prototype, "maximalPageMessage", {
                        set: function (message) {
                            this._maximalPageNumber.detach();
                            var messageDiv = this._maximalPageMessage.find(".message");
                            messageDiv.text(message + " ");
                            messageDiv.append(this._maximalPageNumber);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    IviewPrintModalWindow.INPUT_IDENTIFIER = "pages";
                    IviewPrintModalWindow.INPUT_RANGE_IDENTIFIER = "range";
                    IviewPrintModalWindow.INPUT_RANGE_TEXT_IDENTIFIER = IviewPrintModalWindow.INPUT_RANGE_IDENTIFIER + "-text";
                    IviewPrintModalWindow.INPUT_ALL_VALUE = "all";
                    IviewPrintModalWindow.INPUT_RANGE_VALUE = "range";
                    IviewPrintModalWindow.INPUT_CURRENT_VALUE = "current";
                    return IviewPrintModalWindow;
                }(modal.IviewModalWindow));
                modal.IviewPrintModalWindow = IviewPrintModalWindow;
            })(modal = widgets.modal || (widgets.modal = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoRePrintComponent = (function (_super) {
                __extends(MyCoRePrintComponent, _super);
                function MyCoRePrintComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this._enabled = (this._settings.pdfCreatorStyle != null && this._settings.pdfCreatorStyle.length != 0) ||
                        this._settings.pdfCreatorURI;
                }
                MyCoRePrintComponent.prototype.buildPDFRequestLink = function (pages) {
                    var metsLocationFormatString = "{metsURL}/mets.xml?XSL.Style={pdfCreatorStyle}";
                    var defaultFormatString = "{pdfCreatorURI}?mets={metsLocation}&pages={pages}";
                    var metsLocation = encodeURIComponent(ViewerFormatString(metsLocationFormatString, this._settings));
                    this._settings["metsLocation"] = metsLocation;
                    this._settings["pages"] = pages;
                    return ViewerFormatString(this._settings.pdfCreatorFormatString || defaultFormatString, this._settings);
                };
                MyCoRePrintComponent.prototype.buildRestrictionLink = function () {
                    var defaultFormatString = "{pdfCreatorURI}?getRestrictions";
                    return ViewerFormatString(this._settings.pdfCreatorRestrictionFormatString || defaultFormatString, this._settings);
                };
                MyCoRePrintComponent.prototype.init = function () {
                    if (this._settings.doctype == 'mets' && this._enabled) {
                        this._resolveMaxRequests();
                        this._modalWindow = new mycore.viewer.widgets.modal.IviewPrintModalWindow(this._settings.mobile);
                        this.trigger(new components.events.WaitForEvent(this, components.events.LanguageModelLoadedEvent.TYPE));
                        this.trigger(new components.events.WaitForEvent(this, components.events.StructureModelLoadedEvent.TYPE));
                        this.trigger(new components.events.WaitForEvent(this, components.events.ProvideToolbarModelEvent.TYPE));
                        this.trigger(new components.events.ComponentInitializedEvent(this));
                    }
                };
                MyCoRePrintComponent.prototype.handle = function (e) {
                    var _this = this;
                    if (e.type == components.events.ProvideToolbarModelEvent.TYPE) {
                        var ptme = e;
                        this._printButton = new viewer.widgets.toolbar.ToolbarButton("PrintButton", "PDF", "", "");
                        if (this._settings.mobile) {
                            this._printButton.icon = "file-pdf-o";
                            this._printButton.label = "";
                        }
                        if (ptme.model.name == "MyCoReFrameToolbar") {
                            ptme.model._zoomControllGroup.addComponent(this._printButton);
                        }
                        else {
                            ptme.model._actionControllGroup.addComponent(this._printButton);
                        }
                    }
                    if (e.type == components.events.LanguageModelLoadedEvent.TYPE) {
                        var languageModelLoadedEvent = e;
                        this._printButton.tooltip = languageModelLoadedEvent.languageModel.getTranslation("toolbar.pdf");
                        this._modalWindow.closeLabel = languageModelLoadedEvent.languageModel.getTranslation("createPdf.cancel");
                        this._modalWindow.currentPageLabel = languageModelLoadedEvent.languageModel.getTranslation("createPdf.range.currentPage");
                        this._modalWindow.allPagesLabel = languageModelLoadedEvent.languageModel.getTranslation("createPdf.range.allPages");
                        this._modalWindow.rangeLabel = languageModelLoadedEvent.languageModel.getTranslation("createPdf.range.manual");
                        this._modalWindow.title = languageModelLoadedEvent.languageModel.getTranslation("createPdf.title");
                        this._languageModel = languageModelLoadedEvent.languageModel;
                        this._modalWindow.maximalPageMessage = languageModelLoadedEvent.languageModel.getTranslation("createPdf.maximalPages");
                        var that = this;
                        this._modalWindow.checkEventHandler = function (wich) {
                            if (wich == "range") {
                                that._modalWindow.rangeInputEnabled = false;
                                _this._modalWindow.validationMessage = "";
                                that._modalWindow.previewImageSrc = null;
                                that._modalWindow.rangeInputEventHandler = function (ip) {
                                    var validationResult = that.validateRange(ip);
                                    if (validationResult.valid) {
                                        that._modalWindow.validationMessage = "";
                                        that._modalWindow.validationResult = true;
                                        that._structureModel.imageList[validationResult.firstPage].requestImgdataUrl(function (url) {
                                            that._modalWindow.previewImageSrc = url;
                                        });
                                    }
                                    else {
                                        that._modalWindow.validationMessage = validationResult.text;
                                        that._modalWindow.validationResult = validationResult.valid;
                                        that._modalWindow.previewImageSrc = null;
                                    }
                                };
                            }
                            else {
                                that._modalWindow.rangeInputEventHandler = null;
                                that._modalWindow.rangeInputEnabled = false;
                                if (wich == "all") {
                                    var allCount = _this._structureModel.imageList.length + 1;
                                    var maxRange = _this._maxPages;
                                    if (allCount > maxRange) {
                                        var msg = that._languageModel.getTranslation("createPdf.errors.tooManyPages");
                                        that._modalWindow.validationMessage = msg;
                                        that._modalWindow.validationResult = false;
                                        that._modalWindow.previewImageSrc = null;
                                    }
                                    else {
                                        that._modalWindow.validationResult = true;
                                        that._structureModel.imageList[0].requestImgdataUrl(function (url) {
                                            that._modalWindow.previewImageSrc = url;
                                        });
                                    }
                                }
                                else if (wich == "current") {
                                    that._modalWindow.validationMessage = "";
                                    _this._currentImage.requestImgdataUrl(function (url) {
                                        that._modalWindow.previewImageSrc = url;
                                    });
                                    that._modalWindow.validationResult = true;
                                }
                            }
                        };
                        this._modalWindow.okayClickHandler = function () {
                            var page;
                            if (that._modalWindow.currentChecked) {
                                page = that._currentImage.order;
                            }
                            if (that._modalWindow.allChecked) {
                                page = "1-" + that._structureModel._imageList.length;
                            }
                            if (that._modalWindow.rangeChecked) {
                                page = that._modalWindow.rangeInputVal;
                            }
                            window.location.href = that.buildPDFRequestLink(page);
                        };
                        this._modalWindow.currentChecked = true;
                    }
                    if (e.type == viewer.widgets.toolbar.events.ButtonPressedEvent.TYPE) {
                        var bpe = e;
                        if (bpe.button.id == "PrintButton") {
                            if (this._settings.doctype == 'pdf') {
                                window.location.href = this._settings.metsURL;
                            }
                            else {
                                this._modalWindow.show();
                            }
                        }
                    }
                    if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                        var smle = e;
                        this._structureModel = smle.structureModel;
                    }
                    if (e.type == components.events.ImageChangedEvent.TYPE) {
                        var ice = e;
                        this._currentImage = ice.image;
                        if (this._modalWindow.currentChecked) {
                            if (typeof this._currentImage != "undefined") {
                                this._currentImage.requestImgdataUrl(function (url) {
                                    _this._modalWindow.previewImageSrc = url;
                                });
                            }
                        }
                    }
                };
                MyCoRePrintComponent.prototype._resolveMaxRequests = function () {
                    var that = this;
                    jQuery.ajax({
                        type: 'GET',
                        dataType: 'json',
                        url: this.buildRestrictionLink(),
                        crossDomain: true,
                        complete: function (jqXHR, textStatus) {
                        },
                        success: function (data) {
                            that._maxPages = parseInt(data.maxPages);
                            that._modalWindow.maximalPages = that._maxPages.toString();
                        }
                    });
                };
                MyCoRePrintComponent.prototype.validateRange = function (range) {
                    var ranges = range.split(",");
                    var firstPage = 99999;
                    if (range.length == 0) {
                        return { valid: false, text: this._languageModel.getTranslation("createPdf.errors.noPages") };
                    }
                    var pc = 0;
                    var maxRange = this._maxPages;
                    for (var rangeIndex in ranges) {
                        var range = ranges[rangeIndex];
                        if (range.indexOf("-") == -1) {
                            if (!this.isValidPage(range)) {
                                return {
                                    valid: false,
                                    text: this._languageModel.getTranslation("createPdf.errors.rangeInvalid")
                                };
                            }
                            var page = parseInt(range);
                            if (page < firstPage) {
                                firstPage = page;
                            }
                            pc++;
                            continue;
                        }
                        else {
                            var pages = range.split("-");
                            if (pages.length != 2) {
                                return {
                                    valid: false,
                                    text: this._languageModel.getTranslation("createPdf.errors.rangeInvalid")
                                };
                            }
                            var startPageString = pages[0];
                            var endPageString = pages[1];
                            if (!this.isValidPage(startPageString)) {
                                var msg = ViewerFormatString(this._languageModel.getTranslation("createPdf.errors.rangeInvalid"), { "0": startPageString });
                                return { valid: false, text: msg };
                            }
                            if (!this.isValidPage(endPageString)) {
                                var msg = ViewerFormatString(this._languageModel.getTranslation("createPdf.errors.rangeInvalid"), { "0": endPageString });
                                return { valid: false, text: msg };
                            }
                            var startPage = parseInt(startPageString);
                            var endPage = parseInt(endPageString);
                            if (startPage >= endPage) {
                                return {
                                    valid: false,
                                    text: this._languageModel.getTranslation("createPdf.errors.rangeInvalid")
                                };
                            }
                            pc += endPage - startPage;
                            if (pc > maxRange) {
                                var msg = ViewerFormatString(this._languageModel.getTranslation("createPdf.errors.tooManyPages"), { "0": maxRange.toString() });
                                return { valid: false, text: msg };
                            }
                            if (startPage < firstPage) {
                                firstPage = startPage;
                            }
                            continue;
                        }
                    }
                    return { valid: true, text: "", firstPage: firstPage - 1 };
                };
                MyCoRePrintComponent.prototype.isValidPage = function (page) {
                    if (typeof this._structureModel._imageList[parseInt(page) - 1] != "undefined") {
                        return !isNaN(page);
                    }
                    return false;
                };
                Object.defineProperty(MyCoRePrintComponent.prototype, "handlesEvents", {
                    get: function () {
                        if (this._settings.doctype == 'mets' && this._enabled) {
                            return [viewer.widgets.toolbar.events.ButtonPressedEvent.TYPE, components.events.LanguageModelLoadedEvent.TYPE, components.events.StructureModelLoadedEvent.TYPE, components.events.ImageChangedEvent.TYPE, components.events.ProvideToolbarModelEvent.TYPE];
                        }
                        else {
                            return [];
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                return MyCoRePrintComponent;
            }(components.ViewerComponent));
            components.MyCoRePrintComponent = MyCoRePrintComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoRePrintComponent);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var canvas;
            (function (canvas) {
                var HighlightAltoCanvasPageLayer = (function () {
                    function HighlightAltoCanvasPageLayer() {
                        this.selectedChapter = null;
                        this.highlightedChapter = null;
                        this.fadeAnimation = null;
                        this.chaptersToClear = new MyCoReMap();
                    }
                    HighlightAltoCanvasPageLayer.prototype.draw = function (ctx, id, pageSize, drawOnHtml) {
                        if (drawOnHtml === void 0) { drawOnHtml = false; }
                        var selected = this.isChapterSelected();
                        var highlighted = this.isHighlighted();
                        var animated = this.fadeAnimation != null && this.fadeAnimation.isRunning;
                        if (!animated && !selected && !highlighted) {
                            this.chaptersToClear.clear();
                        }
                        if (selected) {
                            this.chaptersToClear.set("selected", this.selectedChapter);
                        }
                        if (highlighted) {
                            this.chaptersToClear.set("highlighted", this.highlightedChapter);
                        }
                        else if (selected) {
                            this.chaptersToClear.remove("highlighted");
                        }
                        if (animated || selected || highlighted) {
                            var rgba = selected ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)";
                            if (this.fadeAnimation != null) {
                                rgba = "rgba(0,0,0," + this.fadeAnimation.value + ")";
                            }
                            this.darkenPage(ctx, pageSize, rgba);
                            this.clearRects(ctx, id);
                        }
                        if (highlighted && selected) {
                            this.drawRects(ctx, id, this.highlightedChapter.pages, "rgba(0,0,0,0.2)");
                        }
                    };
                    HighlightAltoCanvasPageLayer.prototype.isChapterSelected = function () {
                        return this.selectedChapter != null && !this.selectedChapter.pages.isEmpty();
                    };
                    HighlightAltoCanvasPageLayer.prototype.isHighlighted = function () {
                        var highlighted = this.highlightedChapter != null && !this.highlightedChapter.pages.isEmpty();
                        if (highlighted && this.isChapterSelected()) {
                            return this.highlightedChapter.chapterId !== this.selectedChapter.chapterId;
                        }
                        return highlighted;
                    };
                    HighlightAltoCanvasPageLayer.prototype.darkenPage = function (ctx, pageSize, rgba) {
                        ctx.save();
                        {
                            ctx.strokeStyle = rgba;
                            ctx.fillStyle = rgba;
                            ctx.beginPath();
                            ctx.rect(0, 0, pageSize.width, pageSize.height);
                            ctx.closePath();
                            ctx.fill();
                        }
                        ctx.restore();
                    };
                    HighlightAltoCanvasPageLayer.prototype.clearRects = function (ctx, id) {
                        ctx.save();
                        {
                            this.chaptersToClear.values.forEach(function (chapterArea) {
                                chapterArea.pages.hasThen(id, function (rects) {
                                    rects.forEach(function (rect) {
                                        ctx.clearRect(rect.getX(), rect.getY(), rect.getWidth(), rect.getHeight());
                                    });
                                });
                            });
                        }
                        ctx.restore();
                    };
                    HighlightAltoCanvasPageLayer.prototype.drawRects = function (ctx, pageId, pages, rgba) {
                        ctx.save();
                        {
                            ctx.strokeStyle = rgba;
                            ctx.fillStyle = rgba;
                            ctx.beginPath();
                            pages.hasThen(pageId, function (rects) {
                                rects.forEach(function (rect) {
                                    ctx.rect(rect.getX(), rect.getY(), rect.getWidth(), rect.getHeight());
                                });
                            });
                            ctx.closePath();
                            ctx.fill();
                        }
                        ctx.restore();
                    };
                    return HighlightAltoCanvasPageLayer;
                }());
                canvas.HighlightAltoCanvasPageLayer = HighlightAltoCanvasPageLayer;
            })(canvas = widgets.canvas || (widgets.canvas = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var RequestAltoModelEvent = components.events.RequestAltoModelEvent;
            var WaitForEvent = components.events.WaitForEvent;
            var MyCoReHighlightAltoComponent = (function (_super) {
                __extends(MyCoReHighlightAltoComponent, _super);
                function MyCoReHighlightAltoComponent(_settings, container) {
                    _super.call(this);
                    this._settings = _settings;
                    this.container = container;
                    this.pageLayout = null;
                    this.highlightLayer = new viewer.widgets.canvas.HighlightAltoCanvasPageLayer();
                    this._chapterAreaContainer = null;
                    this.selectedChapter = null;
                    this.highlightedChapter = null;
                }
                MyCoReHighlightAltoComponent.prototype.init = function () {
                    if (this._settings.doctype == 'mets') {
                        this.trigger(new WaitForEvent(this, components.events.PageLayoutChangedEvent.TYPE));
                        this.trigger(new WaitForEvent(this, components.events.RequestPageEvent.TYPE));
                        this.trigger(new components.events.AddCanvasPageLayerEvent(this, 0, this.highlightLayer));
                    }
                };
                Object.defineProperty(MyCoReHighlightAltoComponent.prototype, "handlesEvents", {
                    get: function () {
                        if (this._settings.doctype == 'mets') {
                            return [components.events.ChapterChangedEvent.TYPE,
                                components.events.PageLayoutChangedEvent.TYPE,
                                components.events.RequestPageEvent.TYPE,
                                components.events.MetsLoadedEvent.TYPE
                            ];
                        }
                        else {
                            return [];
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReHighlightAltoComponent.prototype.getPageLayout = function () {
                    return this.pageLayout;
                };
                MyCoReHighlightAltoComponent.prototype.getPageController = function () {
                    return this.pageLayout.getPageController();
                };
                MyCoReHighlightAltoComponent.prototype.getChapterAreaContainer = function () {
                    return this._chapterAreaContainer;
                };
                MyCoReHighlightAltoComponent.prototype.setChapter = function (chapterId, triggerChapterChangeEvent, forceChange) {
                    if (triggerChapterChangeEvent === void 0) { triggerChapterChangeEvent = false; }
                    if (forceChange === void 0) { forceChange = false; }
                    if (!forceChange && this.selectedChapter === chapterId) {
                        return;
                    }
                    this.selectedChapter = chapterId;
                    if (this._chapterAreaContainer === null) {
                        return;
                    }
                    var chapterArea = chapterId != null ? this._chapterAreaContainer.chapters.get(chapterId) : null;
                    this.highlightLayer.selectedChapter = chapterArea;
                    this.handleDarkenPageAnimation();
                    this.trigger(new components.events.RedrawEvent(this));
                    if (triggerChapterChangeEvent) {
                        var chapter = this._chapterAreaContainer.getChapter(chapterId);
                        this.trigger(new components.events.ChapterChangedEvent(this, chapter));
                    }
                };
                MyCoReHighlightAltoComponent.prototype.setHighlightChapter = function (chapterId) {
                    if (this._chapterAreaContainer === null || this.highlightedChapter === chapterId) {
                        return;
                    }
                    var chapterArea = chapterId != null ? this._chapterAreaContainer.chapters.get(chapterId) : null;
                    this.highlightLayer.highlightedChapter = chapterArea;
                    this.highlightedChapter = chapterId;
                    if (this.selectedChapter == null) {
                        this.handleDarkenPageAnimation();
                    }
                    this.trigger(new components.events.RedrawEvent(this));
                };
                MyCoReHighlightAltoComponent.prototype.handleDarkenPageAnimation = function () {
                    var selected = this.selectedChapter != null;
                    var highlighted = this.highlightedChapter != null;
                    var oldValue = 0;
                    if (this.highlightLayer.fadeAnimation != null) {
                        oldValue = this.highlightLayer.fadeAnimation.value;
                        this.getPageController().removeAnimation(this.highlightLayer.fadeAnimation);
                    }
                    if (!selected && !highlighted) {
                        if (oldValue == 0) {
                            return;
                        }
                        this.highlightLayer.fadeAnimation = new viewer.widgets.canvas.InterpolationAnimation(1000, oldValue, 0);
                        this.getPageController().addAnimation(this.highlightLayer.fadeAnimation);
                        return;
                    }
                    var alpha = selected ? 0.4 : 0.15;
                    this.highlightLayer.fadeAnimation = new viewer.widgets.canvas.InterpolationAnimation(1000, oldValue, alpha);
                    this.getPageController().addAnimation(this.highlightLayer.fadeAnimation);
                };
                MyCoReHighlightAltoComponent.prototype.handle = function (e) {
                    var _this = this;
                    if (e.type == components.events.MetsLoadedEvent.TYPE) {
                        var mle = e;
                        this._model = mle.mets.model;
                        this._chapterAreaContainer = new ChapterAreaContainer(this._model);
                        if (this.selectedChapter != null) {
                            this.setChapter(this.selectedChapter, false, true);
                        }
                    }
                    if (e.type == components.events.RequestPageEvent.TYPE) {
                        var rpe_1 = e;
                        this.trigger(new RequestAltoModelEvent(this, rpe_1._pageId, function (page, altoHref, altoModel) {
                            _this._chapterAreaContainer.addPage(rpe_1._pageId, altoHref, altoModel);
                        }));
                    }
                    if (e.type == components.events.ChapterChangedEvent.TYPE) {
                        var cce = e;
                        if (cce == null || cce.chapter == null) {
                            return;
                        }
                        this.setChapter(cce.chapter.id);
                    }
                    if (e.type == components.events.PageLayoutChangedEvent.TYPE) {
                        this.pageLayout = e.pageLayout;
                        this.trigger(new components.events.RequestDesktopInputEvent(this, new HighlightAltoInputListener(this)));
                    }
                };
                return MyCoReHighlightAltoComponent;
            }(components.ViewerComponent));
            components.MyCoReHighlightAltoComponent = MyCoReHighlightAltoComponent;
            var HighlightAltoInputListener = (function (_super) {
                __extends(HighlightAltoInputListener, _super);
                function HighlightAltoInputListener(component) {
                    _super.call(this);
                    this.component = component;
                }
                HighlightAltoInputListener.prototype.mouseClick = function (position) {
                    var chapterId = this.getChapterId(position);
                    this.component.setChapter(chapterId, true);
                };
                HighlightAltoInputListener.prototype.mouseMove = function (position) {
                    var chapterId = this.getChapterId(position);
                    this.component.setHighlightChapter(chapterId);
                };
                HighlightAltoInputListener.prototype.getChapterId = function (position) {
                    var pageHitInfo = this.component.getPageLayout().getPageHitInfo(position);
                    if (pageHitInfo.id == null) {
                        return null;
                    }
                    var chapterAreaContainer = this.component.getChapterAreaContainer();
                    if (chapterAreaContainer === null) {
                        return null;
                    }
                    var chapters = chapterAreaContainer.chapters;
                    var pageChapterMap = chapterAreaContainer.pageChapterMap;
                    var chapterIdsOnPage = pageChapterMap.get(pageHitInfo.id);
                    if (chapterIdsOnPage == null || chapterIdsOnPage.length <= 0) {
                        return null;
                    }
                    for (var _i = 0, chapterIdsOnPage_1 = chapterIdsOnPage; _i < chapterIdsOnPage_1.length; _i++) {
                        var chapterId = chapterIdsOnPage_1[_i];
                        var chapterArea = chapters.get(chapterId);
                        var rectsOfChapter = chapterArea.pages.get(pageHitInfo.id);
                        if (rectsOfChapter == null) {
                            continue;
                        }
                        for (var _a = 0, rectsOfChapter_1 = rectsOfChapter; _a < rectsOfChapter_1.length; _a++) {
                            var rectOfChapter = rectsOfChapter_1[_a];
                            var rect = rectOfChapter.scale(pageHitInfo.pageAreaInformation.scale);
                            if (rect.intersects(pageHitInfo.hit)) {
                                return chapterId;
                            }
                        }
                    }
                    return null;
                };
                return HighlightAltoInputListener;
            }(viewer.widgets.canvas.DesktopInputAdapter));
            var ChapterAreaContainer = (function () {
                function ChapterAreaContainer(_model) {
                    var _this = this;
                    this._model = _model;
                    this.chapters = new MyCoReMap();
                    this.pageChapterMap = new MyCoReMap();
                    this._loadedPages = {};
                    this._model.chapterToImageMap.keys.forEach(function (chapterId) {
                        _this.chapters.set(chapterId, new ChapterArea(chapterId));
                    });
                    var blocklistChapters = this.getAllBlocklistChapters(this._model.rootChapter);
                    this._model.imageList.forEach(function (image) {
                        var chaptersOfPage = _this.pageChapterMap.get(image.href);
                        if (chaptersOfPage == null) {
                            chaptersOfPage = new Array();
                            _this.pageChapterMap.set(image.href, chaptersOfPage);
                        }
                        var altoHref = image.additionalHrefs.get("AltoHref");
                        blocklistChapters.filter(function (chapter) {
                            var blocklist = chapter.additional.get("blocklist");
                            for (var _i = 0, blocklist_1 = blocklist; _i < blocklist_1.length; _i++) {
                                var block = blocklist_1[_i];
                                if (block.fileId == altoHref) {
                                    return true;
                                }
                            }
                            return false;
                        }).forEach(function (chapter) {
                            chaptersOfPage.push(chapter.id);
                        });
                    });
                }
                ChapterAreaContainer.prototype.getBlocklistOfChapter = function (chapterId) {
                    var chapter = this.getChapter(chapterId);
                    if (chapter == null) {
                        return;
                    }
                    return chapter.additional.get("blocklist");
                };
                ChapterAreaContainer.prototype.getChapter = function (chapterId) {
                    return this.findChapter(this._model.rootChapter, chapterId);
                };
                ChapterAreaContainer.prototype.findChapter = function (from, chapterId) {
                    if (from.id == chapterId) {
                        return from;
                    }
                    for (var _i = 0, _a = from.chapter; _i < _a.length; _i++) {
                        var childChapter = _a[_i];
                        var foundChapter = this.findChapter(childChapter, chapterId);
                        if (foundChapter != null) {
                            return foundChapter;
                        }
                    }
                    return null;
                };
                ChapterAreaContainer.prototype.getBlocklistOfChapterAndAltoHref = function (chapterId, altoHref) {
                    return this.getBlocklistOfChapter(chapterId).filter(function (_a) {
                        var fileId = _a.fileId, fromId = _a.fromId, toId = _a.toId;
                        return fileId == altoHref;
                    });
                };
                ChapterAreaContainer.prototype.getAllBlocklistChapters = function (from) {
                    var _this = this;
                    var chapters = [];
                    if (from.additional.get("blocklist") != null) {
                        chapters.push(from);
                    }
                    from.chapter.forEach(function (childChapter) {
                        chapters = chapters.concat(_this.getAllBlocklistChapters(childChapter));
                    });
                    return chapters;
                };
                ChapterAreaContainer.prototype.addPage = function (pageId, altoHref, alto) {
                    var _this = this;
                    if (this._loadedPages[pageId] != null) {
                        return;
                    }
                    this._loadedPages[pageId] = true;
                    this.pageChapterMap.hasThen(pageId, function (chapterIds) {
                        chapterIds.map(function (chapterId) { return _this.chapters.get(chapterId); }).forEach(function (chapter) {
                            chapter.addPage(pageId, alto, _this.getBlocklistOfChapterAndAltoHref(chapter.chapterId, altoHref));
                        });
                    });
                };
                return ChapterAreaContainer;
            }());
            components.ChapterAreaContainer = ChapterAreaContainer;
            var ChapterArea = (function () {
                function ChapterArea(chapterId) {
                    this.chapterId = chapterId;
                    this.pages = new MyCoReMap();
                }
                ChapterArea.prototype.addPage = function (pageId, altoFile, metsBlocklist) {
                    var altoBlocks = this.getAltoBlocks(altoFile, metsBlocklist);
                    var areas = this.getAreas(altoFile, altoBlocks);
                    this.pages.set(pageId, areas);
                };
                ChapterArea.prototype.getAltoBlocks = function (altoFile, metsBlocklist) {
                    var allBlocks = altoFile.allElements;
                    var ids = allBlocks.map(function (block) { return block.getId(); });
                    var blocks = [];
                    metsBlocklist.map(function (blockFromTo) { return [ids.indexOf(blockFromTo.fromId), ids.indexOf(blockFromTo.toId)]; })
                        .forEach(function (_a) {
                        var fromIndex = _a[0], toIndex = _a[1];
                        for (var i = fromIndex; i <= toIndex; i++) {
                            var blockToHighlight = allBlocks[i];
                            if (blockToHighlight == null) {
                                continue;
                            }
                            blocks.push(blockToHighlight);
                        }
                    });
                    return blocks;
                };
                ChapterArea.prototype.getAreas = function (altoFile, blocks) {
                    var areas = [];
                    var area = null;
                    var maxBottom = null;
                    var maxRight = null;
                    var padding = Math.ceil(altoFile.pageHeight * 0.004);
                    var blockFaultiness = Math.ceil(altoFile.pageHeight * 0.005);
                    blocks.forEach(function (block) {
                        var blockX = block.getBlockHPos();
                        var blockY = block.getBlockVPos();
                        var blockW = block.getWidth();
                        var blockH = block.getHeight();
                        if (area == null) {
                            newArea();
                            return;
                        }
                        if (isAssignable()) {
                            area = area.maximize(blockX, blockY, blockW, blockH);
                            return;
                        }
                        area = area.increase(padding);
                        areas.push(area);
                        newArea();
                        function newArea() {
                            area = Rect.fromXYWH(blockX, blockY, blockW, blockH);
                            maxRight = area.getX() + area.getWidth();
                            maxBottom = area.getY() + area.getHeight();
                        }
                        function isAssignable() {
                            return (blockY >= maxBottom - blockFaultiness) && (blockX <= maxRight);
                        }
                    });
                    if (area != null) {
                        area = area.increase(padding);
                        areas.push(area);
                    }
                    return areas;
                };
                return ChapterArea;
            }());
            components.ChapterArea = ChapterArea;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReHighlightAltoComponent);
console.log("METS MODULE");

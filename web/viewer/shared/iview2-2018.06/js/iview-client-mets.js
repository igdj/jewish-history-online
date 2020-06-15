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
                    function MetsStructureModel(smLinkMap, _rootChapter, _imageList, _chapterToImageMap, _imageToChapterMap, _imageHrefImageMap, altoPresent) {
                        _super.call(this, _rootChapter, _imageList, _chapterToImageMap, _imageToChapterMap, _imageHrefImageMap, altoPresent);
                        this.smLinkMap = smLinkMap;
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
                        var _this = this;
                        var files = this.getFiles("IVIEW2");
                        if (files.length == 0) {
                            files = this.getFiles("MASTER");
                        }
                        this._idFileMap = this.getIdFileMap(files);
                        var useFilesMap = new MyCoReMap();
                        this.getGroups().map(function (node) {
                            return node.getAttribute("USE");
                        })
                            .map(function (s) { return s.toUpperCase(); })
                            .filter(function (s) { return s != "MASTER"; })
                            .forEach(function (s) {
                            var files = _this.getFiles(s);
                            useFilesMap.set(s, files);
                            _this._idFileMap.mergeIn(_this.getIdFileMap(files));
                        });
                        this._chapterIdMap = new MyCoReMap();
                        this._idPhysicalFileMap = this.getIdPhysicalFileMap();
                        this._smLinkMap = new MyCoReMap();
                        this._chapterImageMap = new MyCoReMap();
                        this._imageChapterMap = new MyCoReMap();
                        this._improvisationMap = new MyCoReMap();
                        this._metsChapter = this.processChapter(null, this.getFirstElementChild(this.getStructMap("LOGICAL")));
                        this._imageHrefImageMap = new MyCoReMap();
                        this._imageList = [];
                        this._idImageMap = new MyCoReMap();
                        this.processImages();
                        this._structureModel = new widgets.mets.MetsStructureModel(this._smLinkMap, this._metsChapter, this._imageList, this._chapterImageMap, this._imageChapterMap, this._imageHrefImageMap, useFilesMap.has("ALTO") && useFilesMap.get("ALTO").length > 0);
                        return this._structureModel;
                    };
                    MetsStructureBuilder.prototype.getStructMap = function (type) {
                        var logicalStructMapPath = "//mets:structMap[@TYPE='" + type + "']";
                        return singleSelectShim(this.metsDocument, logicalStructMapPath, MetsStructureBuilder.NS_MAP);
                    };
                    MetsStructureBuilder.prototype.getGroups = function () {
                        var fileGroupPath = '//mets:fileSec//mets:fileGrp';
                        return getNodesShim(this.metsDocument, fileGroupPath, this.metsDocument.documentElement, MetsStructureBuilder.NS_MAP, 4, null);
                    };
                    MetsStructureBuilder.prototype.getFiles = function (group) {
                        var fileGroupPath = "//mets:fileSec//mets:fileGrp[@USE='" + group + "']";
                        var fileSectionResult = singleSelectShim(this.metsDocument, fileGroupPath, MetsStructureBuilder.NS_MAP);
                        var nodeArray = [];
                        if (fileSectionResult != null) {
                            nodeArray = XMLUtil.nodeListToNodeArray(fileSectionResult.childNodes);
                        }
                        return nodeArray;
                    };
                    MetsStructureBuilder.prototype.getStructLinks = function () {
                        var structLinkPath = "//mets:structLink";
                        var structLinkResult = singleSelectShim(this.metsDocument, structLinkPath, MetsStructureBuilder.NS_MAP);
                        var nodeArray = [];
                        XMLUtil.iterateChildNodes(structLinkResult, function (currentChild) {
                            if (currentChild instanceof Element || "getAttribute" in currentChild) {
                                nodeArray.push(currentChild);
                            }
                        });
                        return nodeArray;
                    };
                    MetsStructureBuilder.prototype.processChapter = function (parent, chapter) {
                        if (chapter.nodeName.toString() == "mets:mptr") {
                            return;
                        }
                        var chapterObject = new viewer.model.StructureChapter(parent, chapter.getAttribute("TYPE"), chapter.getAttribute("ID"), chapter.getAttribute("LABEL"));
                        var chapterChildren = chapter.childNodes;
                        this._chapterIdMap.set(chapterObject.id, chapterObject);
                        for (var i = 0; i < chapterChildren.length; i++) {
                            var elem = chapterChildren[i];
                            if ((elem instanceof Element || "getAttribute" in elem)) {
                                if (elem.nodeName.indexOf("fptr") != -1) {
                                    this.processFPTR(chapterObject, elem);
                                }
                                else if (elem.nodeName.indexOf("div") != -1) {
                                    chapterObject.chapter.push(this.processChapter(chapterObject, elem));
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
                                    _this.parseArea(parent, child);
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
                            blockList = [];
                            parent.additional.set("blocklist", blockList);
                        }
                        else {
                            blockList = parent.additional.get("blocklist");
                        }
                        var fileID = area.getAttribute("FILEID");
                        if (fileID == null) {
                            throw "@FILEID of mets:area is required but not set!";
                        }
                        var href = this.getAttributeNs(this.getFirstElementChild(this._idFileMap.get(fileID)), "xlink", "href");
                        if (href == null) {
                            throw "couldn't find href of @FILEID in mets:area! " + fileID;
                        }
                        var blockEntry = {
                            fileId: href
                        };
                        var beType = area.getAttribute("BETYPE");
                        if (beType == "IDREF") {
                            blockEntry.fromId = area.getAttribute("BEGIN");
                            blockEntry.toId = area.getAttribute("END");
                        }
                        else {
                            console.warn("mets:area/@FILEID='" + href + "' has no BETYPE attribute");
                        }
                        blockList.push(blockEntry);
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
                            if (image != null) {
                                _this._imageList.push(image);
                                _this._idImageMap.set(k, image);
                            }
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
                        this.getStructLinks().forEach(function (elem) {
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
                        if (!this._smLinkMap.has(chapter.id)) {
                            this._smLinkMap.set(chapter.id, []);
                        }
                        this._smLinkMap.get(chapter.id).push(image.href);
                    };
                    MetsStructureBuilder.prototype.extractTranslationLanguage = function (href) {
                        return href.split("/")[1].split(".")[1];
                    };
                    MetsStructureBuilder.prototype.parseFile = function (physFileDiv, defaultOrder) {
                        var _this = this;
                        var type = physFileDiv.getAttribute('TYPE');
                        var id = physFileDiv.getAttribute('ID');
                        var order = parseInt(physFileDiv.getAttribute('ORDER') || '' + defaultOrder, 10);
                        var orderLabel = physFileDiv.getAttribute('ORDERLABEL');
                        var contentIds = physFileDiv.getAttribute('CONTENTIDS');
                        var additionalHrefs = new MyCoReMap();
                        var imgHref = null;
                        var imgMimeType = null;
                        this.hrefResolverElement.href = './';
                        var base = this.hrefResolverElement.href;
                        XMLUtil.iterateChildNodes(physFileDiv, function (child) {
                            if (child instanceof Element || 'getAttribute' in child) {
                                var childElement = child;
                                var fileId = childElement.getAttribute('FILEID');
                                var file = _this._idFileMap.get(fileId);
                                var href = _this.getAttributeNs(_this.getFirstElementChild(file), 'xlink', 'href');
                                var mimetype = file.getAttribute('MIMETYPE');
                                _this.hrefResolverElement.href = href;
                                href = _this.hrefResolverElement.href.substr(base.length);
                                var use = file.parentNode.getAttribute('USE');
                                if (use === 'MASTER' || use === 'IVIEW2') {
                                    imgHref = href;
                                    imgMimeType = mimetype;
                                }
                                else if (use === 'ALTO') {
                                    additionalHrefs.set(MetsStructureBuilder.ALTO_TEXT, href);
                                }
                                else if (use.indexOf("TEI.") == 0) {
                                    additionalHrefs.set(use, href);
                                }
                                else {
                                    console.warn('Unknown File Group : ' + use);
                                }
                            }
                        });
                        if (imgHref === null) {
                            console.warn('Unable to find MASTER|IVIEW2 file for ' + id);
                            return null;
                        }
                        if (imgHref.indexOf('http:') + imgHref.indexOf('file:') + imgHref.indexOf('urn:') !== -3) {
                            var parser = document.createElement('a');
                            parser.href = imgHref;
                            imgHref = parser.pathname;
                        }
                        return new viewer.model.StructureImage(type, id, order, orderLabel, imgHref, imgMimeType, function (cb) {
                            cb(_this.tilePathBuilder(imgHref));
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
        var widgets;
        (function (widgets) {
            var alto;
            (function (alto) {
                var AltoChange = (function () {
                    function AltoChange(file, type, pageOrder) {
                        this.file = file;
                        this.type = type;
                        this.pageOrder = pageOrder;
                    }
                    return AltoChange;
                }());
                alto.AltoChange = AltoChange;
                var AltoWordChange = (function (_super) {
                    __extends(AltoWordChange, _super);
                    function AltoWordChange(file, hpos, vpos, width, height, from, to, pageOrder) {
                        _super.call(this, file, AltoWordChange.TYPE, pageOrder);
                        this.hpos = hpos;
                        this.vpos = vpos;
                        this.width = width;
                        this.height = height;
                        this.from = from;
                        this.to = to;
                    }
                    AltoWordChange.TYPE = "AltoWordChange";
                    return AltoWordChange;
                }(AltoChange));
                alto.AltoWordChange = AltoWordChange;
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
                        this.htmlContent = new ViewerProperty(this, "htmlContent");
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
                    TileImagePage.prototype.getHTMLContent = function () {
                        return this.htmlContent;
                    };
                    TileImagePage.prototype.updateHTML = function () {
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
                    function AltoElement(_parent, _type, _id, _width, _height, _hpos, _vpos, _wc) {
                        this._parent = _parent;
                        this._type = _type;
                        this._id = _id;
                        this._width = _width;
                        this._height = _height;
                        this._hpos = _hpos;
                        this._vpos = _vpos;
                        this._wc = _wc;
                        this._children = [];
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
                    AltoElement.prototype.getWordConfidence = function () {
                        return this._wc;
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
                    AltoElement.prototype.asRect = function () {
                        return Rect.fromXYWH(this.getHPos(), this.getVPos(), this.getWidth(), this.getHeight());
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
                        var wc = parseFloat(src.getAttribute("WC"));
                        var id = src.getAttribute("ID");
                        var styleID = src.getAttribute("STYLEREFS");
                        var altoElement = new alto.AltoElement(parent, type, id, width, height, hpos, vpos, wc);
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
                    AltoHTMLGenerator.prototype.generateHtml = function (alto, altoID) {
                        var _this = this;
                        var fontFamily = "sans-serif";
                        var element = document.createElement("div");
                        element.style.position = "absolute";
                        element.style.whiteSpace = "nowrap";
                        element.style.fontFamily = "sans-serif";
                        element.setAttribute("data-id", altoID);
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
                            blockDiv += " style='";
                            blockDiv += " transform: translate(" + Math.round(block.getHPos()) + "px," + Math.round(block.getVPos()) + "px );";
                            blockDiv += " width: " + block.getWidth() + "px;";
                            blockDiv += " height: " + block.getHeight() + "px;";
                            blockDiv += " font-size: " + blockFontSize + "px;";
                            if (drawOutline) {
                                blockDiv += " outline: " + outline + "px solid white;";
                            }
                            blockDiv += "'>";
                            block.getChildren().map(function (line) {
                                var lineDiv = "<p";
                                lineDiv += " class='altoLine'";
                                lineDiv += " style='height: " + line.getHeight() + "px;";
                                lineDiv += " width: " + line.getWidth() + "px;";
                                lineDiv += " transform: translate(" + Math.round(line.getHPos() - block.getHPos()) + "px, " + Math.round(line.getVPos() - block.getVPos()) + "px);";
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
                                lineDiv += "'>" + _this.getLineAsElement(line) + "</p>";
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
                        return line.getChildren()
                            .filter(function (elementInLine) { return elementInLine.getType() === AltoElementType.String; });
                    };
                    AltoHTMLGenerator.prototype.getLineAsString = function (line) {
                        var span = document.createElement("span");
                        return this.getWordsArray(line).map(function (line) {
                            span.innerText = line.getContent();
                            return span.innerHTML;
                        }).join(" ");
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
                        var maxSize = block.getChildren().reduce(function (acc, line) {
                            return Math.max(acc, line.getHeight());
                        }, 0);
                        block.getChildren().forEach(function (line) {
                            maxSize = getLineHeight(line, maxSize);
                        });
                        return maxSize;
                    };
                    AltoHTMLGenerator.prototype.getLineAsElement = function (line) {
                        var span = document.createElement("word");
                        return this.getWordsArray(line).map(function (word) {
                            span.innerText = word.getContent();
                            return "<span data-vpos=\"" + word.getVPos() + "\"\n                            data-hpos=\"" + word.getHPos() + "\"\n                            data-word=\"" + word.getContent() + "\"\n                            data-width=\"" + word.getWidth() + "\"\n                            data-height=\"" + word.getHeight() + "\"\n                            data-wc=\"" + word.getWordConfidence() + "\"\n                        >" + span.innerHTML + "</span>";
                        }).join(" ");
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
            var PageLoadedEvent = mycore.viewer.components.events.PageLoadedEvent;
            var MyCoReMetsPageProviderComponent = (function (_super) {
                __extends(MyCoReMetsPageProviderComponent, _super);
                function MyCoReMetsPageProviderComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this._imageInformationMap = new MyCoReMap();
                    this._imagePageMap = new MyCoReMap();
                    this._altoHTMLGenerator = new AltoHTMLGenerator();
                    this._imageHTMLMap = new MyCoReMap();
                    this._imageCallbackMap = new MyCoReMap();
                }
                MyCoReMetsPageProviderComponent.prototype.init = function () {
                    if (this._settings.doctype == 'mets') {
                        this.trigger(new components.events.WaitForEvent(this, components.events.RequestPageEvent.TYPE));
                    }
                };
                MyCoReMetsPageProviderComponent.prototype.getPage = function (image, resolve) {
                    var _this = this;
                    if (this._imagePageMap.has(image)) {
                        resolve(this._imagePageMap.get(image));
                    }
                    else {
                        if (this._imageCallbackMap.has(image)) {
                            this._imageCallbackMap.get(image).push(resolve);
                        }
                        else {
                            var initialArray = new Array();
                            initialArray.push(resolve);
                            this._imageCallbackMap.set(image, initialArray);
                            this.getPageMetadata(image, function (metadata) {
                                var imagePage = _this.createPageFromMetadata(image, metadata);
                                if (!_this._imageHTMLMap.has(image)) {
                                    _this.trigger(new RequestAltoModelEvent(_this, image, function (page, altoHref, altoModel) {
                                        if (!_this._imageHTMLMap.has(image)) {
                                            var htmlElement = _this._altoHTMLGenerator.generateHtml(altoModel, altoHref);
                                            imagePage.getHTMLContent().value = htmlElement;
                                            _this._imageHTMLMap.set(image, htmlElement);
                                        }
                                    }));
                                }
                                var resolveList = _this._imageCallbackMap.get(image);
                                var pop;
                                while (pop = resolveList.pop()) {
                                    pop(imagePage);
                                }
                                _this._imagePageMap.set(image, imagePage);
                                _this.trigger(new PageLoadedEvent(_this, image, imagePage));
                            });
                        }
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
                    if (e.type == components.events.RequestPageEvent.TYPE) {
                        var rpe_1 = e;
                        this.getPage(rpe_1._pageId, function (page) {
                            rpe_1._onResolve(rpe_1._pageId, page);
                        });
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
            var modal;
            (function (modal) {
                var ViewerPrintModalWindow = (function (_super) {
                    __extends(ViewerPrintModalWindow, _super);
                    function ViewerPrintModalWindow(_mobile) {
                        var _this = this;
                        _super.call(this, _mobile, "CreatePDF");
                        this.checkEventHandler = null;
                        this.rangeInputEventHandler = null;
                        this.chapterInputEventHandler = null;
                        this.okayClickHandler = null;
                        this._inputRow = jQuery("<div></div>");
                        this._inputRow.addClass("row");
                        this._inputRow.appendTo(this.modalBody);
                        this._previewBox = jQuery("<div></div>");
                        this._previewBox.addClass("printPreview");
                        this._previewBox.addClass("col-sm-12");
                        this._previewBox.addClass("thumbnail");
                        this._previewBox.appendTo(this._inputRow);
                        this._previewImage = jQuery("<img />");
                        this._previewImage.appendTo(this._previewBox);
                        this._pageSelectBox = jQuery("<form></form>");
                        this._pageSelectBox.addClass("printForm");
                        this._pageSelectBox.addClass("col-sm-12");
                        this._pageSelectBox.appendTo(this._inputRow);
                        this._selectGroup = jQuery("<div></div>");
                        this._selectGroup.addClass("form-group");
                        this._selectGroup.appendTo(this._pageSelectBox);
                        this._createRadioAllPages();
                        this._createRadioCurrentPage();
                        this._createRadioRangePages();
                        this._createRadioChapters();
                        this._validationRow = jQuery("<div></div>");
                        this._validationRow.addClass("row");
                        this._validationRow.appendTo(this.modalBody);
                        this._validationMessage = jQuery("<p></p>");
                        this._validationMessage.addClass("col-sm-12");
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
                        this._okayButton.click(function () {
                            if (_this.okayClickHandler != null) {
                                _this.okayClickHandler();
                            }
                        });
                    }
                    ViewerPrintModalWindow.prototype._createRadioAllPages = function () {
                        var _this = this;
                        this._radioAllPages = jQuery("<div></div>");
                        this._radioAllPages.addClass("radio");
                        this._radioAllPagesLabelElement = jQuery("<label></label>");
                        this._radioAllPagesInput = jQuery("<input>");
                        this._radioAllPagesInput.attr("type", "radio");
                        this._radioAllPagesInput.attr("name", ViewerPrintModalWindow.INPUT_IDENTIFIER);
                        this._radioAllPagesInput.attr("id", ViewerPrintModalWindow.INPUT_IDENTIFIER);
                        this._radioAllPagesInput.attr("value", ViewerPrintModalWindow.INPUT_ALL_VALUE);
                        this._radioAllPagesLabel = jQuery("<p></p>");
                        this._radioAllPagesInput.change(function () {
                            if (_this.checkEventHandler != null) {
                                _this.checkEventHandler(ViewerPrintModalWindow.INPUT_ALL_VALUE);
                            }
                        });
                        this._radioAllPages.append(this._radioAllPagesLabelElement);
                        this._radioAllPagesLabelElement.append(this._radioAllPagesInput);
                        this._radioAllPagesLabelElement.append(this._radioAllPagesLabel);
                        this._radioAllPages.appendTo(this._selectGroup);
                    };
                    ViewerPrintModalWindow.prototype._createRadioCurrentPage = function () {
                        var _this = this;
                        this._radioCurrentPage = jQuery("<div></div>");
                        this._radioCurrentPage.addClass("radio");
                        this._radioCurrentPageLabelElement = jQuery("<label></label>");
                        this._radioCurrentPageInput = jQuery("<input>");
                        this._radioCurrentPageInput.attr("type", "radio");
                        this._radioCurrentPageInput.attr("name", ViewerPrintModalWindow.INPUT_IDENTIFIER);
                        this._radioCurrentPageInput.attr("id", ViewerPrintModalWindow.INPUT_IDENTIFIER);
                        this._radioCurrentPageInput.attr("value", ViewerPrintModalWindow.INPUT_CURRENT_VALUE);
                        this._radioCurrentPageLabel = jQuery("<p></p>");
                        this._radioCurrentPageInput.change(function () {
                            if (_this.checkEventHandler != null) {
                                _this.checkEventHandler(ViewerPrintModalWindow.INPUT_CURRENT_VALUE);
                            }
                        });
                        this._radioCurrentPage.append(this._radioCurrentPageLabelElement);
                        this._radioCurrentPageLabelElement.append(this._radioCurrentPageInput);
                        this._radioCurrentPageLabelElement.append(this._radioCurrentPageLabel);
                        this._radioCurrentPage.appendTo(this._selectGroup);
                    };
                    ViewerPrintModalWindow.prototype._createRadioRangePages = function () {
                        var _this = this;
                        this._radioRangePages = jQuery("<div></div>");
                        this._radioRangePages.addClass("radio");
                        this._radioRangePagesLabelElement = jQuery("<label></label>");
                        this._radioRangePagesInput = jQuery("<input>");
                        this._radioRangePagesInput.attr("type", "radio");
                        this._radioRangePagesInput.attr("name", ViewerPrintModalWindow.INPUT_IDENTIFIER);
                        this._radioRangePagesInput.attr("id", ViewerPrintModalWindow.INPUT_IDENTIFIER);
                        this._radioRangePagesInput.attr("value", ViewerPrintModalWindow.INPUT_RANGE_VALUE);
                        this._radioRangePagesLabel = jQuery("<p></p>");
                        this._radioRangePagesInputText = jQuery("<input>");
                        this._radioRangePagesInputText.addClass("form-control");
                        this._radioRangePagesInputText.attr("type", "text");
                        this._radioRangePagesInputText.attr("name", ViewerPrintModalWindow.INPUT_RANGE_TEXT_IDENTIFIER);
                        this._radioRangePagesInputText.attr("id", ViewerPrintModalWindow.INPUT_RANGE_TEXT_IDENTIFIER);
                        this._radioRangePagesInputText.attr("placeholder", "1,3-5,8");
                        var that = this;
                        var onActivateHandler = function () {
                            if (that.checkEventHandler != null) {
                                that.checkEventHandler(ViewerPrintModalWindow.INPUT_RANGE_VALUE);
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
                    ViewerPrintModalWindow.prototype._createRadioChapters = function () {
                        var _this = this;
                        this._radioChapter = jQuery("<div></div>");
                        this._radioChapter.addClass("radio");
                        this._radioChapterInput = jQuery("<input>");
                        this._radioChapterInput.attr("type", "radio");
                        this._radioChapterInput.attr("name", ViewerPrintModalWindow.INPUT_IDENTIFIER);
                        this._radioChapterInput.attr("id", ViewerPrintModalWindow.INPUT_IDENTIFIER);
                        this._radioChapterInput.attr("value", ViewerPrintModalWindow.INPUT_CHAPTER_VALUE);
                        this._chapterLabelElement = jQuery("<label></label>");
                        this._radioChapterLabel = jQuery("<p></p>");
                        this._chapterSelect = jQuery("<select></select>");
                        this._radioRangePages.append(this._chapterLabelElement);
                        this._chapterLabelElement.append(this._radioChapterInput);
                        this._chapterLabelElement.append(this._radioChapterLabel);
                        this._chapterLabelElement.append(this._chapterSelect);
                        this._radioChapter.appendTo(this._selectGroup);
                        var onActivate = function () {
                            if (_this.checkEventHandler != null) {
                                _this.checkEventHandler(ViewerPrintModalWindow.INPUT_CHAPTER_VALUE);
                            }
                        };
                        this._radioChapterInput.change(onActivate);
                        this._chapterSelect.change(function () {
                            onActivate();
                            _this.chapterChecked = true;
                            if (_this.chapterInputEventHandler != null) {
                                _this.chapterInputEventHandler(_this._chapterSelect.val());
                            }
                        });
                    };
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "rangeChecked", {
                        get: function () {
                            return this._radioRangePagesInput.prop("checked");
                        },
                        set: function (checked) {
                            this._radioRangePagesInput.prop("checked", checked);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "allChecked", {
                        get: function () {
                            return this._radioAllPagesInput.prop("checked");
                        },
                        set: function (checked) {
                            this._radioAllPagesInput.prop("checked", checked);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "currentChecked", {
                        get: function () {
                            return this._radioCurrentPageInput.prop("checked");
                        },
                        set: function (checked) {
                            this._radioCurrentPageInput.prop("checked", checked);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "chapterChecked", {
                        get: function () {
                            return this._radioChapterInput.prop("checked");
                        },
                        set: function (checked) {
                            this._radioChapterInput.prop("checked", checked);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "validationResult", {
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
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "validationMessage", {
                        get: function () {
                            return this._validationMessage.text();
                        },
                        set: function (message) {
                            this._validationMessage.text(message);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "currentPageLabel", {
                        get: function () {
                            return this._radioCurrentPageLabel.text();
                        },
                        set: function (label) {
                            this._radioCurrentPageLabel.text(label);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "allPagesLabel", {
                        get: function () {
                            return this._radioAllPagesLabel.text();
                        },
                        set: function (label) {
                            this._radioAllPagesLabel.text(label);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "rangeLabel", {
                        get: function () {
                            return this._radioRangePagesLabel.text();
                        },
                        set: function (label) {
                            this._radioRangePagesLabel.text(label);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "previewImageSrc", {
                        get: function () {
                            return this._previewImage.attr("src");
                        },
                        set: function (src) {
                            this._previewImage.attr("src", src);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "rangeInputVal", {
                        get: function () {
                            return this._radioRangePagesInputText.val();
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "rangeInputEnabled", {
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
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "chapterLabel", {
                        get: function () {
                            return this._radioChapterLabel.text();
                        },
                        set: function (label) {
                            this._radioChapterLabel.text(label);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "maximalPages", {
                        set: function (number) {
                            this._maximalPageNumber.text(number);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "maximalPageMessage", {
                        set: function (message) {
                            this._maximalPageNumber.detach();
                            var messageDiv = this._maximalPageMessage.find(".message");
                            messageDiv.text(message + " ");
                            messageDiv.append(this._maximalPageNumber);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    ViewerPrintModalWindow.prototype.setChapterTree = function (chapters) {
                        this._chapterSelect.html(chapters.map(function (entry) {
                            return "<option value=\"" + entry.id + "\">" + entry.label + "</option>";
                        }).join(""));
                    };
                    Object.defineProperty(ViewerPrintModalWindow.prototype, "chapterInputVal", {
                        get: function () {
                            return this._chapterSelect.val();
                        },
                        enumerable: true,
                        configurable: true
                    });
                    ViewerPrintModalWindow.INPUT_IDENTIFIER = "pages";
                    ViewerPrintModalWindow.INPUT_RANGE_IDENTIFIER = "range";
                    ViewerPrintModalWindow.INPUT_RANGE_TEXT_IDENTIFIER = ViewerPrintModalWindow.INPUT_RANGE_IDENTIFIER + "-text";
                    ViewerPrintModalWindow.INPUT_CHAPTER_VALUE = "chapter";
                    ViewerPrintModalWindow.INPUT_ALL_VALUE = "all";
                    ViewerPrintModalWindow.INPUT_RANGE_VALUE = "range";
                    ViewerPrintModalWindow.INPUT_CURRENT_VALUE = "current";
                    return ViewerPrintModalWindow;
                }(modal.IviewModalWindow));
                modal.ViewerPrintModalWindow = ViewerPrintModalWindow;
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
                MyCoRePrintComponent.prototype.init = function () {
                    if (this._settings.doctype == 'mets' && this._enabled) {
                        this._resolveMaxRequests();
                        this.initModalWindow();
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
                        var languageModel = languageModelLoadedEvent.languageModel;
                        this._printButton.tooltip = languageModel.getTranslation("toolbar.pdf");
                        this._modalWindow.closeLabel = languageModel.getTranslation("createPdf.cancel");
                        this._modalWindow.currentPageLabel = languageModel.getTranslation("createPdf.range.currentPage");
                        this._modalWindow.allPagesLabel = languageModel.getTranslation("createPdf.range.allPages");
                        this._modalWindow.rangeLabel = languageModel.getTranslation("createPdf.range.manual");
                        this._modalWindow.chapterLabel = languageModel.getTranslation("createPdf.range.chapter");
                        this._modalWindow.title = languageModel.getTranslation("createPdf.title");
                        this._languageModel = languageModel;
                        this._modalWindow.maximalPageMessage = languageModel.getTranslation("createPdf.maximalPages");
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
                        this._modalWindow.setChapterTree(this.getChapterViewModel());
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
                MyCoRePrintComponent.prototype.getChapterViewModel = function (chapter, indent) {
                    if (chapter === void 0) { chapter = this._structureModel.rootChapter; }
                    if (indent === void 0) { indent = 0; }
                    var chapterVM = [];
                    var indentStr = "";
                    for (var i = 0; i < indent; i++) {
                        indentStr += "&nbsp;&nbsp;";
                    }
                    var combinedLabel = indentStr + chapter.label;
                    var MAX_LENGHT = 25 + indentStr.length;
                    if (combinedLabel.length > MAX_LENGHT) {
                        combinedLabel = combinedLabel.substr(0, MAX_LENGHT) + "...";
                    }
                    chapterVM.push({ id: chapter.id, label: combinedLabel });
                    var indentIncr = indent + 1;
                    for (var _i = 0, _a = chapter.chapter; _i < _a.length; _i++) {
                        var childChapter = _a[_i];
                        chapterVM.push.apply(chapterVM, this.getChapterViewModel(childChapter, indentIncr));
                    }
                    return chapterVM;
                };
                MyCoRePrintComponent.prototype.initModalWindow = function () {
                    var _this = this;
                    this._modalWindow = new mycore.viewer.widgets.modal.ViewerPrintModalWindow(this._settings.mobile);
                    this._modalWindow.checkEventHandler = function (wich) {
                        if (wich == "range") {
                            _this.handleRangeChecked();
                        }
                        else if (wich == "chapter") {
                            _this.handleChapterChecked();
                        }
                        else {
                            _this._modalWindow.rangeInputEventHandler = null;
                            _this._modalWindow.chapterInputEventHandler = null;
                            _this._modalWindow.rangeInputEnabled = false;
                            if (wich == "all") {
                                _this.handleAllChecked();
                            }
                            else if (wich == "current") {
                                _this.handleCurrentChecked();
                            }
                        }
                    };
                    this._modalWindow.okayClickHandler = function () {
                        var page;
                        if (_this._modalWindow.currentChecked) {
                            page = _this._currentImage.order;
                        }
                        if (_this._modalWindow.allChecked) {
                            page = "1-" + _this._structureModel._imageList.length;
                        }
                        if (_this._modalWindow.rangeChecked) {
                            page = _this._modalWindow.rangeInputVal;
                        }
                        if (_this._modalWindow.chapterChecked) {
                            var chapter = _this.findChapterWithID(_this._modalWindow.chapterInputVal);
                            page = _this.getRangeOfChapter(chapter);
                        }
                        window.location.href = _this.buildPDFRequestLink(page);
                    };
                    this._modalWindow.currentChecked = true;
                };
                MyCoRePrintComponent.prototype.handleChapterChecked = function () {
                    var _this = this;
                    this._modalWindow.rangeInputEnabled = false;
                    this._modalWindow.validationMessage = "";
                    this._modalWindow.previewImageSrc = null;
                    this._modalWindow.chapterInputEventHandler = function (chapterID) {
                        var chapter = _this.findChapterWithID(chapterID);
                        var range = _this.getRangeOfChapter(chapter);
                        var validationResult = _this.validateRange(range);
                        if (validationResult.valid) {
                            _this._modalWindow.validationMessage = "";
                            _this._modalWindow.validationResult = true;
                            _this._structureModel.imageList[validationResult.firstPage].requestImgdataUrl(function (url) {
                                _this._modalWindow.previewImageSrc = url;
                            });
                        }
                        else {
                            _this._modalWindow.validationMessage = validationResult.text;
                            _this._modalWindow.validationResult = validationResult.valid;
                            _this._modalWindow.previewImageSrc = null;
                        }
                    };
                    this._modalWindow.chapterInputEventHandler(this._modalWindow.chapterInputVal);
                };
                MyCoRePrintComponent.prototype.handleCurrentChecked = function () {
                    var _this = this;
                    this._modalWindow.validationMessage = "";
                    this._currentImage.requestImgdataUrl(function (url) {
                        _this._modalWindow.previewImageSrc = url;
                    });
                    this._modalWindow.validationResult = true;
                };
                MyCoRePrintComponent.prototype.handleAllChecked = function () {
                    var _this = this;
                    var allCount = this._structureModel.imageList.length + 1;
                    var maxRange = this._maxPages;
                    if (allCount > maxRange) {
                        this._modalWindow.validationMessage = this._languageModel.getTranslation("createPdf.errors.tooManyPages");
                        this._modalWindow.validationResult = false;
                        this._modalWindow.previewImageSrc = null;
                    }
                    else {
                        this._modalWindow.validationResult = true;
                        this._structureModel.imageList[0].requestImgdataUrl(function (url) {
                            _this._modalWindow.previewImageSrc = url;
                        });
                    }
                };
                MyCoRePrintComponent.prototype.handleRangeChecked = function () {
                    var _this = this;
                    this._modalWindow.rangeInputEnabled = true;
                    this._modalWindow.validationMessage = "";
                    this._modalWindow.previewImageSrc = null;
                    this._modalWindow.rangeInputEventHandler = function (ip) {
                        var validationResult = _this.validateRange(ip);
                        if (validationResult.valid) {
                            _this._modalWindow.validationMessage = "";
                            _this._modalWindow.validationResult = true;
                            _this._structureModel.imageList[validationResult.firstPage].requestImgdataUrl(function (url) {
                                _this._modalWindow.previewImageSrc = url;
                            });
                        }
                        else {
                            _this._modalWindow.validationMessage = validationResult.text;
                            _this._modalWindow.validationResult = validationResult.valid;
                            _this._modalWindow.previewImageSrc = null;
                        }
                    };
                };
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
                MyCoRePrintComponent.prototype.findChapterWithID = function (id, chapter) {
                    if (chapter === void 0) { chapter = this._structureModel.rootChapter; }
                    if (chapter.id == id)
                        return chapter;
                    for (var _i = 0, _a = chapter.chapter; _i < _a.length; _i++) {
                        var child = _a[_i];
                        var foundChapter = this.findChapterWithID(id, child);
                        if (foundChapter != null) {
                            return foundChapter;
                        }
                    }
                    return null;
                };
                MyCoRePrintComponent.prototype.validateRange = function (range) {
                    var ranges = range.split(",");
                    var firstPage = 99999;
                    if (range.length == 0) {
                        return { valid: false, text: this._languageModel.getTranslation("createPdf.errors.noPages") };
                    }
                    var pc = 0;
                    var maxRange = this._maxPages;
                    for (var _i = 0, ranges_1 = ranges; _i < ranges_1.length; _i++) {
                        var range_1 = ranges_1[_i];
                        if (range_1.indexOf("-") == -1) {
                            if (!this.isValidPage(range_1)) {
                                return {
                                    valid: false,
                                    text: this._languageModel.getTranslation("createPdf.errors.rangeInvalid")
                                };
                            }
                            var page = parseInt(range_1);
                            if (page < firstPage) {
                                firstPage = page;
                            }
                            pc++;
                        }
                        else {
                            var pages = range_1.split("-");
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
                MyCoRePrintComponent.prototype.getRangeOfChapter = function (chapter) {
                    var imageToChapterMap = this._structureModel._imageToChapterMap;
                    var ranges = [];
                    var chapterEqOrContains = function (root, child) {
                        if (root == child) {
                            return true;
                        }
                        if (child.parent != null) {
                            return chapterEqOrContains(root, child.parent);
                        }
                        return false;
                    };
                    var start = null;
                    var last = null;
                    for (var _i = 0, _a = this._structureModel.imageList; _i < _a.length; _i++) {
                        var img = _a[_i];
                        if (imageToChapterMap.has(img.id)) {
                            var linkedChapter = imageToChapterMap.get(img.id);
                            if (chapterEqOrContains(chapter, linkedChapter)) {
                                if (start == null) {
                                    start = img;
                                }
                                else {
                                    last = img;
                                }
                                continue;
                            }
                        }
                        if (start != null && last != null) {
                            ranges.push(start.order + "-" + last.order);
                        }
                        else if (start != null) {
                            ranges.push((start.order) + "");
                        }
                        else {
                        }
                        start = last = null;
                    }
                    if (start != null && last != null) {
                        ranges.push((start.order + 1) + "-" + (last.order + 1));
                    }
                    else if (start != null) {
                        ranges.push((start.order + 1) + "");
                    }
                    else {
                    }
                    return ranges.join(",");
                };
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
                var HighlightAltoChapterCanvasPageLayer = (function () {
                    function HighlightAltoChapterCanvasPageLayer() {
                        this.selectedChapter = null;
                        this.highlightedChapter = null;
                        this.fadeAnimation = null;
                        this.chaptersToClear = new MyCoReMap();
                        this.enabled = true;
                    }
                    HighlightAltoChapterCanvasPageLayer.prototype.isEnabled = function () {
                        return this.enabled;
                    };
                    HighlightAltoChapterCanvasPageLayer.prototype.setEnabled = function (enabled) {
                        this.enabled = enabled;
                    };
                    HighlightAltoChapterCanvasPageLayer.prototype.draw = function (ctx, id, pageSize, drawOnHtml) {
                        if (drawOnHtml === void 0) { drawOnHtml = false; }
                        if (!this.isEnabled()) {
                            return;
                        }
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
                            if (!this.isLinkedWithoutBlocks(id)) {
                                this.darkenPage(ctx, pageSize, rgba);
                            }
                            this.clearRects(ctx, id);
                        }
                        if (highlighted && selected) {
                            this.drawRects(ctx, id, this.highlightedChapter.boundingBoxMap, "rgba(0,0,0,0.2)");
                        }
                    };
                    HighlightAltoChapterCanvasPageLayer.prototype.isChapterSelected = function () {
                        return this.selectedChapter != null && !this.selectedChapter.boundingBoxMap.isEmpty();
                    };
                    HighlightAltoChapterCanvasPageLayer.prototype.isHighlighted = function () {
                        var highlighted = this.highlightedChapter != null && !this.highlightedChapter.boundingBoxMap.isEmpty();
                        if (highlighted && this.isChapterSelected()) {
                            return this.highlightedChapter.chapterId !== this.selectedChapter.chapterId;
                        }
                        return highlighted;
                    };
                    HighlightAltoChapterCanvasPageLayer.prototype.isLinkedWithoutBlocks = function (fileID) {
                        return !this.chaptersToClear.filter(function (id, area) {
                            var rects = area.boundingBoxMap.get(fileID);
                            return rects != null && rects.length === 0;
                        }).isEmpty();
                    };
                    HighlightAltoChapterCanvasPageLayer.prototype.darkenPage = function (ctx, pageSize, rgba) {
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
                    HighlightAltoChapterCanvasPageLayer.prototype.clearRects = function (ctx, id) {
                        ctx.save();
                        {
                            this.chaptersToClear.values.forEach(function (chapterArea) {
                                chapterArea.boundingBoxMap.hasThen(id, function (rects) {
                                    rects.forEach(function (rect) {
                                        ctx.clearRect(rect.getX(), rect.getY(), rect.getWidth(), rect.getHeight());
                                    });
                                });
                            });
                        }
                        ctx.restore();
                    };
                    HighlightAltoChapterCanvasPageLayer.prototype.drawRects = function (ctx, pageId, pages, rgba) {
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
                    return HighlightAltoChapterCanvasPageLayer;
                }());
                canvas.HighlightAltoChapterCanvasPageLayer = HighlightAltoChapterCanvasPageLayer;
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
                    this.highlightLayer = new viewer.widgets.canvas.HighlightAltoChapterCanvasPageLayer();
                    this._altoChapterContainer = null;
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
                                components.events.MetsLoadedEvent.TYPE,
                                components.events.TextEditEvent.TYPE
                            ];
                        }
                        else {
                            return [];
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(MyCoReHighlightAltoComponent.prototype, "isEnabled", {
                    get: function () {
                        return this._model != null && this._model._textContentPresent;
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
                MyCoReHighlightAltoComponent.prototype.getAltoChapterContainer = function () {
                    return this._altoChapterContainer;
                };
                MyCoReHighlightAltoComponent.prototype.setChapter = function (chapterId, triggerChapterChangeEvent, forceChange) {
                    if (triggerChapterChangeEvent === void 0) { triggerChapterChangeEvent = false; }
                    if (forceChange === void 0) { forceChange = false; }
                    if (!forceChange && this.selectedChapter === chapterId) {
                        return;
                    }
                    this.selectedChapter = chapterId;
                    if (this._altoChapterContainer === null || !this._altoChapterContainer.hasLoadedPages()) {
                        return;
                    }
                    this.highlightLayer.selectedChapter = chapterId != null ? this._altoChapterContainer.chapters.get(chapterId) : null;
                    this.handleDarkenPageAnimation();
                    this.trigger(new components.events.RedrawEvent(this));
                    if (triggerChapterChangeEvent) {
                        var chapter = this._altoChapterContainer.getChapter(chapterId);
                        this.trigger(new components.events.ChapterChangedEvent(this, chapter));
                    }
                };
                MyCoReHighlightAltoComponent.prototype.setHighlightChapter = function (chapterId) {
                    if (this._altoChapterContainer === null ||
                        !this._altoChapterContainer.hasLoadedPages() ||
                        this.highlightedChapter === chapterId) {
                        return;
                    }
                    this.highlightLayer.highlightedChapter = chapterId != null ? this._altoChapterContainer.chapters.get(chapterId) : null;
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
                        if (!this.isEnabled) {
                            return;
                        }
                        this._altoChapterContainer = new AltoChapterContainer(this._model);
                        if (this.selectedChapter != null) {
                            this.setChapter(this.selectedChapter, false, true);
                        }
                        this.trigger(new components.events.RequestDesktopInputEvent(this, new HighlightAltoInputListener(this)));
                    }
                    if (e.type == components.events.RequestPageEvent.TYPE) {
                        var rpe_2 = e;
                        this.trigger(new RequestAltoModelEvent(this, rpe_2._pageId, function (page, altoHref, altoModel) {
                            _this._altoChapterContainer.addPage(rpe_2._pageId, altoHref, altoModel);
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
                    }
                    if (e.type == components.events.TextEditEvent.TYPE) {
                        var tee = e;
                        this.highlightLayer.setEnabled(!tee.edit);
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
                    var pageLayout = this.component.getPageLayout();
                    if (pageLayout == null) {
                        return null;
                    }
                    var pageHitInfo = pageLayout.getPageHitInfo(position);
                    if (pageHitInfo.id == null) {
                        return null;
                    }
                    var altoChapterContainer = this.component.getAltoChapterContainer();
                    if (altoChapterContainer === null) {
                        return null;
                    }
                    var chapters = altoChapterContainer.chapters;
                    var pageChapterMap = altoChapterContainer.pageChapterMap;
                    var chapterIdsOnPage = pageChapterMap.get(pageHitInfo.id);
                    if (chapterIdsOnPage == null || chapterIdsOnPage.length <= 0) {
                        return null;
                    }
                    for (var _i = 0, chapterIdsOnPage_1 = chapterIdsOnPage; _i < chapterIdsOnPage_1.length; _i++) {
                        var chapterId = chapterIdsOnPage_1[_i];
                        var altoChapter = chapters.get(chapterId);
                        var rectsOfChapter = altoChapter.boundingBoxMap.get(pageHitInfo.id);
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
            var AltoChapterContainer = (function () {
                function AltoChapterContainer(_model) {
                    var _this = this;
                    this._model = _model;
                    this.chapters = new MyCoReMap();
                    this.pageChapterMap = new MyCoReMap();
                    this._loadedPages = {};
                    this._model.smLinkMap.forEach(function (chapterId, linkedImages) {
                        _this.chapters.set(chapterId, new AltoChapter(chapterId));
                        for (var _i = 0, linkedImages_1 = linkedImages; _i < linkedImages_1.length; _i++) {
                            var imageHref = linkedImages_1[_i];
                            if (!_this.pageChapterMap.has(imageHref)) {
                                _this.pageChapterMap.set(imageHref, []);
                            }
                            _this.pageChapterMap.get(imageHref).push(chapterId);
                        }
                    });
                }
                AltoChapterContainer.prototype.hasLoadedPages = function () {
                    return Object.keys(this._loadedPages).length > 0;
                };
                AltoChapterContainer.prototype.getAreaListOfChapter = function (chapter) {
                    var blocklist = chapter.additional.get("blocklist");
                    if (blocklist == null) {
                        return [];
                    }
                    return blocklist.map(function (block) {
                        return new MetsArea(block.fileId, block.fromId, block.toId);
                    });
                };
                AltoChapterContainer.prototype.getChapter = function (chapterId) {
                    return this.findChapter(this._model.rootChapter, chapterId);
                };
                AltoChapterContainer.prototype.findChapter = function (from, chapterId) {
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
                AltoChapterContainer.prototype.getBlocklistOfChapterAndAltoHref = function (chapterId, altoHref) {
                    var chapter = this.getChapter(chapterId);
                    if (chapter == null) {
                        return [];
                    }
                    return this.getAreaListOfChapter(chapter).filter(function (area) {
                        return altoHref === area.altoRef;
                    });
                };
                AltoChapterContainer.prototype.getAllBlocklistChapters = function (from) {
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
                AltoChapterContainer.prototype.addPage = function (pageId, altoHref, alto) {
                    var _this = this;
                    if (this._loadedPages[pageId] != null) {
                        return;
                    }
                    this._loadedPages[pageId] = true;
                    this.pageChapterMap.hasThen(pageId, function (chapterIds) {
                        chapterIds.map(function (chapterId) { return _this.chapters.get(chapterId); }).forEach(function (chapter) {
                            chapter.addPage(pageId, alto, _this.getBlocklistOfChapterAndAltoHref(chapter.chapterId, altoHref));
                        });
                        chapterIds.map(function (chapterId) { return _this.chapters.get(chapterId); }).forEach(function (chapter, i, chapters) {
                            var maximizedRect = chapter.maximize(pageId);
                            if (maximizedRect == null) {
                                return;
                            }
                            chapter.boundingBoxMap.set(pageId, [maximizedRect]);
                            for (var j = 0; j < chapters.length; j++) {
                                if (i == j) {
                                    continue;
                                }
                                var otherBoundingBox = chapters[j].maximize(pageId);
                                chapter.fixBoundingBox(pageId, otherBoundingBox);
                                chapter.fixIntersections(pageId, chapters[j]);
                            }
                            var altoRects = chapter.altoRectMap.get(pageId);
                            chapter.cutVerticalBoundingBox(pageId, altoRects[0].getY());
                            chapter.cutVerticalBoundingBox(pageId, altoRects[altoRects.length - 1].getY() + altoRects[altoRects.length - 1].getHeight());
                            chapter.fixEmptyAreas(pageId, alto);
                        });
                    });
                };
                return AltoChapterContainer;
            }());
            components.AltoChapterContainer = AltoChapterContainer;
            var AltoChapter = (function () {
                function AltoChapter(chapterId) {
                    this.chapterId = chapterId;
                    this.boundingBoxMap = new MyCoReMap();
                    this.altoRectMap = new MyCoReMap();
                    this.metsAreas = new MyCoReMap();
                }
                AltoChapter.prototype.addPage = function (pageId, altoFile, metsAreas) {
                    var altoBlocks = this.getAltoBlocks(altoFile, metsAreas);
                    var areaRects = this.getAreaRects(altoFile, altoBlocks);
                    this.altoRectMap.set(pageId, areaRects);
                    this.boundingBoxMap.set(pageId, areaRects);
                    this.metsAreas.set(pageId, metsAreas);
                };
                AltoChapter.prototype.maximize = function (pageId) {
                    var boundingBox = this.boundingBoxMap.get(pageId);
                    if (boundingBox == null || boundingBox.length == 0) {
                        return null;
                    }
                    return boundingBox.reduce(function (a, b) {
                        return a.maximizeRect(b);
                    });
                };
                AltoChapter.prototype.fixBoundingBox = function (pageId, rect) {
                    if (rect == null) {
                        return;
                    }
                    var thisBoundingBox = this.boundingBoxMap.get(pageId);
                    var _loop_1 = function(thisBBRect) {
                        if (!thisBBRect.intersectsArea(rect) || this_1.intersectsText(pageId, rect)) {
                            return "continue";
                        }
                        thisBoundingBox = thisBoundingBox.filter(function (rect) { return rect !== thisBBRect; });
                        thisBBRect.difference(rect).forEach(function (rect) { return thisBoundingBox.push(rect); });
                        this_1.boundingBoxMap.set(pageId, thisBoundingBox);
                        this_1.fixBoundingBox(pageId, rect);
                    };
                    var this_1 = this;
                    for (var _i = 0, thisBoundingBox_1 = thisBoundingBox; _i < thisBoundingBox_1.length; _i++) {
                        var thisBBRect = thisBoundingBox_1[_i];
                        var state_1 = _loop_1(thisBBRect);
                        if (state_1 === "continue") continue;
                    }
                };
                AltoChapter.prototype.intersectsText = function (pageId, rect) {
                    var rects = this.altoRectMap.get(pageId);
                    for (var _i = 0, rects_1 = rects; _i < rects_1.length; _i++) {
                        var altoRect = rects_1[_i];
                        if (altoRect.intersectsArea(rect)) {
                            return true;
                        }
                    }
                    return false;
                };
                AltoChapter.prototype.fixIntersections = function (pageId, other) {
                    var thisAreas = this.boundingBoxMap.get(pageId);
                    var otherAreas = other.boundingBoxMap.get(pageId);
                    var _loop_2 = function(thisArea) {
                        for (var _i = 0, otherAreas_1 = otherAreas; _i < otherAreas_1.length; _i++) {
                            var otherArea = otherAreas_1[_i];
                            if (!thisArea.intersectsArea(otherArea)) {
                                continue;
                            }
                            thisAreas = thisAreas.filter(function (rect) { return rect !== thisArea; });
                            thisArea.difference(otherArea).forEach(function (rect) { return thisAreas.push(rect); });
                            this_2.boundingBoxMap.set(pageId, thisAreas);
                            this_2.fixIntersections(pageId, other);
                            return { value: void 0 };
                        }
                    };
                    var this_2 = this;
                    for (var _a = 0, thisAreas_1 = thisAreas; _a < thisAreas_1.length; _a++) {
                        var thisArea = thisAreas_1[_a];
                        var state_2 = _loop_2(thisArea);
                        if (typeof state_2 === "object") return state_2.value;
                    }
                };
                AltoChapter.prototype.cutVerticalBoundingBox = function (pageId, y) {
                    var thisAreas = this.boundingBoxMap.get(pageId);
                    var _loop_3 = function(thisArea) {
                        if (!thisArea.intersectsVertical(y)) {
                            return "continue";
                        }
                        thisAreas = thisAreas.filter(function (rect) { return rect !== thisArea; });
                        var cutY = y - thisArea.getY();
                        thisAreas.push(Rect.fromXYWH(thisArea.getX(), thisArea.getY(), thisArea.getWidth(), cutY));
                        thisAreas.push(Rect.fromXYWH(thisArea.getX(), thisArea.getY() + cutY + 1, thisArea.getWidth(), thisArea.getHeight() - (cutY + 1)));
                        this_3.boundingBoxMap.set(pageId, thisAreas);
                    };
                    var this_3 = this;
                    for (var _i = 0, thisAreas_2 = thisAreas; _i < thisAreas_2.length; _i++) {
                        var thisArea = thisAreas_2[_i];
                        var state_3 = _loop_3(thisArea);
                        if (state_3 === "continue") continue;
                    }
                };
                AltoChapter.prototype.fixEmptyAreas = function (pageId, alto) {
                    var thisAreas = this.boundingBoxMap.get(pageId);
                    var thisMetsAreas = this.metsAreas.get(pageId);
                    var textBlockIds = alto.allElements.map(function (block) { return block.getId(); });
                    var textAreas = alto.allElements
                        .filter(function (block) {
                        return thisMetsAreas.some(function (metsArea) { return metsArea.contains(textBlockIds, block.getId()); });
                    })
                        .map(function (block) { return block.asRect(); });
                    thisAreas = thisAreas.filter(function (area) {
                        for (var _i = 0, textAreas_1 = textAreas; _i < textAreas_1.length; _i++) {
                            var textArea = textAreas_1[_i];
                            if (area.intersectsArea(textArea)) {
                                return true;
                            }
                        }
                        return false;
                    });
                    this.boundingBoxMap.set(pageId, thisAreas);
                };
                AltoChapter.prototype.getAltoBlocks = function (altoFile, metsAreas) {
                    var allBlocks = altoFile.allElements;
                    var ids = allBlocks.map(function (block) { return block.getId(); });
                    var blocks = [];
                    metsAreas.map(function (metsArea) { return [ids.indexOf(metsArea.begin), ids.indexOf(metsArea.end)]; })
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
                AltoChapter.prototype.getAreaRects = function (altoFile, blocks) {
                    var padding = Math.ceil(altoFile.pageHeight * 0.004);
                    return blocks.map(function (block) {
                        return Rect
                            .fromXYWH(block.getBlockHPos(), block.getBlockVPos(), block.getWidth(), block.getHeight())
                            .increase(padding);
                    });
                };
                return AltoChapter;
            }());
            components.AltoChapter = AltoChapter;
            var MetsArea = (function () {
                function MetsArea(altoRef, begin, end) {
                    this.altoRef = altoRef;
                    this.begin = begin;
                    this.end = end;
                }
                MetsArea.prototype.contains = function (blockIds, paragraph) {
                    var index = blockIds.indexOf(paragraph);
                    return index >= blockIds.indexOf(this.begin) && index <= blockIds.indexOf(this.end);
                };
                return MetsArea;
            }());
            components.MetsArea = MetsArea;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReHighlightAltoComponent);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var alto;
            (function (alto) {
                var AltoEditorWidget = (function () {
                    function AltoEditorWidget(container, i18n) {
                        var _this = this;
                        this.i18n = i18n;
                        this.idChangeMap = new MyCoReMap();
                        this.fileChangeMap = new MyCoReMap();
                        this.idViewMap = new MyCoReMap();
                        this.changeClickHandler = new Array();
                        this.changeRemoveClickHandler = new Array();
                        this.submitClickHandler = new Array();
                        this.applyClickHandler = new Array();
                        this.deleteClickHandler = new Array();
                        this.downArrow = jQuery("\n<span class='glyphicon glyphicon-arrow-down sortArrow'>\n</span> \n");
                        this.upArrow = jQuery("    \n<span class='glyphicon glyphicon-arrow-up sortArrow'>\n</span> \n");
                        this.widgetElement = jQuery(this.createHTML());
                        this.widgetElement.appendTo(container);
                        this.tableContainer = this.widgetElement.find("tbody.table-line-container");
                        this.buttonContainer = this.widgetElement.find("div.button-group-container");
                        this.changeWordButton = this.widgetElement.find("button.changeWord");
                        this.submitButton = this.widgetElement.find(".submit-button");
                        this.applyButton = this.widgetElement.find(".apply-button");
                        this.deleteButton = this.widgetElement.find(".delete-button");
                        this.pageHeading = this.widgetElement.find("[data-sort=pageHeading]");
                        this.actionHeading = this.widgetElement.find("[data-sort=actionHeading]");
                        this.infoHeading = this.widgetElement.find("[data-sort=infoHeading]");
                        this.pageHeading.click(this.getSortClickEventHandler('pageHeading'));
                        this.actionHeading.click(this.getSortClickEventHandler('actionHeading'));
                        this.infoHeading.click(this.getSortClickEventHandler('infoHeading'));
                        this.submitButton.click(function () {
                            _this.submitClickHandler.forEach(function (e) {
                                e();
                            });
                        });
                        this.applyButton.click(function () {
                            _this.applyClickHandler.forEach(function (e) {
                                e();
                            });
                        });
                        this.deleteButton.click(function () {
                            _this.deleteClickHandler.forEach(function (e) {
                                e();
                            });
                        });
                    }
                    AltoEditorWidget.prototype.enableApplyButton = function (enabled) {
                        if (enabled === void 0) { enabled = true; }
                        if (enabled) {
                            this.applyButton.show();
                        }
                        else {
                            this.applyButton.hide();
                        }
                    };
                    AltoEditorWidget.prototype.addChangeClickedEventHandler = function (handler) {
                        this.changeClickHandler.push(handler);
                    };
                    AltoEditorWidget.prototype.addSubmitClickHandler = function (handler) {
                        this.submitClickHandler.push(handler);
                    };
                    AltoEditorWidget.prototype.addApplyClickHandler = function (handler) {
                        this.applyClickHandler.push(handler);
                    };
                    AltoEditorWidget.prototype.addDeleteClickHandler = function (handler) {
                        this.deleteClickHandler.push(handler);
                    };
                    AltoEditorWidget.prototype.addChangeRemoveClickHandler = function (handler) {
                        this.changeRemoveClickHandler.push(handler);
                    };
                    AltoEditorWidget.prototype.getSortClickEventHandler = function (byClicked) {
                        var _this = this;
                        return function (ev) {
                            var currentSort = _this.getCurrentSortMethod();
                            if (currentSort == null || currentSort.sortBy !== byClicked) {
                                _this.sortBy(byClicked, true);
                            }
                            else {
                                _this.sortBy(byClicked, !currentSort.down);
                            }
                        };
                    };
                    AltoEditorWidget.prototype.getCurrentSortMethod = function () {
                        var headerAttached, arrowAttached;
                        if ((headerAttached = (arrowAttached = this.downArrow).parent()).length > 0 ||
                            (headerAttached = (arrowAttached = this.upArrow).parent()).length > 0) {
                            var sortBy = headerAttached.attr("data-sort");
                            return { sortBy: sortBy, down: arrowAttached[0] === this.downArrow[0] };
                        }
                        return null;
                    };
                    AltoEditorWidget.prototype.sortBy = function (by, down) {
                        var _this = this;
                        this.downArrow.detach();
                        this.upArrow.detach();
                        var elem = this.widgetElement.find("[data-sort=" + by + "]");
                        if (down) {
                            elem.append(this.downArrow);
                        }
                        else {
                            elem.append(this.upArrow);
                        }
                        var sortedList = [];
                        this.idViewMap.forEach(function (k, v) {
                            v.detach();
                            sortedList.push(v);
                        });
                        sortedList.sort(this.getSortFn(by, down)).forEach(function (v) {
                            _this.tableContainer.append(v);
                        });
                    };
                    AltoEditorWidget.prototype.getSortFn = function (by, down) {
                        var _this = this;
                        var headerIndex = ["action", "pageHeading", "actionHeading", "infoHeading"];
                        switch (by) {
                            case headerIndex[1]:
                                return function (x, y) {
                                    var order1 = _this.idChangeMap.get(x.attr("data-id")).pageOrder;
                                    var order2 = _this.idChangeMap.get(y.attr("data-id")).pageOrder;
                                    return (down ? 1 : -1) * (order1 - order2);
                                };
                            case headerIndex[2]:
                            case headerIndex[3]:
                                return function (x, y) {
                                    var text1 = jQuery(x.children("td").get(headerIndex.indexOf(by))).text();
                                    var text2 = jQuery(y.children("td").get(headerIndex.indexOf(by))).text();
                                    return (down ? 1 : -1) * text1.localeCompare(text2);
                                };
                        }
                        return function (x, y) { return -1; };
                    };
                    AltoEditorWidget.prototype.createHTML = function () {
                        return "\n<div class=\"alto-editor-widget container-fluid\">\n    <h3 class=\"small-heading\">" + this.getLabel("altoWidget.heading") + "</h3>     \n    <div class=\"btn-toolbar edit\">\n        <div class=\"btn-group btn-group-xs button-group-container\">\n            <button type=\"button\" class=\"btn btn-default changeWord\">" + this.getLabel("altoWidget.changeWord") + "</button>\n        </div>\n    </div>\n    <h3 class=\"small-heading\">" + this.getLabel("altoWidget.changesHeading") + "</h3>\n    <div class=\"table-responsive\">\n        <table class=\"table table-condensed\">\n            <thead>\n                <tr>\n                    <th></th>\n                    <th data-sort=\"pageHeading\">" + this.getLabel("altoWidget.table.page") + "</th>\n                    <th data-sort=\"actionHeading\">" + this.getLabel("altoWidget.table.action") + "</th>\n                    <th data-sort=\"infoHeading\">" + this.getLabel("altoWidget.table.info") + "</th>\n                </tr>\n            </thead>\n            <tbody class=\"table-line-container\">\n                \n            </tbody>\n        </table>\n    </div>\n    <div class=\"btn-toolbar action\">\n        <div class=\"btn-group btn-group-xs button-group-container\">\n            <button type=\"button\" class=\"btn btn-primary apply-button\">" + this.getLabel("altoWidget.apply") + "</button>\n            <button type=\"button\" class=\"btn btn-success submit-button\">" + this.getLabel("altoWidget.submit") + "</button>\n            <button type=\"button\" class=\"btn btn-danger delete-button\">" + this.getLabel("altoWidget.delete") + "</button>\n        </div>\n    </div>\n</div>\n";
                    };
                    AltoEditorWidget.prototype.getLabel = function (id) {
                        return this.i18n.getTranslation(id);
                    };
                    AltoEditorWidget.prototype.hasChange = function (key) {
                        return this.idChangeMap.has(key);
                    };
                    AltoEditorWidget.prototype.getChange = function (key) {
                        return this.idChangeMap.get(key);
                    };
                    AltoEditorWidget.prototype.getChanges = function () {
                        return this.idChangeMap;
                    };
                    AltoEditorWidget.prototype.getChangesInFile = function (file) {
                        return this.fileChangeMap.get(file) || [];
                    };
                    AltoEditorWidget.prototype.addChange = function (key, change) {
                        if (this.idChangeMap.values.indexOf(change) != -1) {
                            return;
                        }
                        this.idChangeMap.set(key, change);
                        var changes = this.fileChangeMap.get(change.file);
                        if (!this.fileChangeMap.has(change.file)) {
                            changes = [];
                            this.fileChangeMap.set(change.file, changes);
                        }
                        changes.push(change);
                        this.addRow(key, change);
                    };
                    AltoEditorWidget.prototype.addRow = function (id, change) {
                        var _this = this;
                        var view = jQuery("\n<tr data-id=\"" + id + "\">\n    " + this.getChangeHTMLContent(change) + "\n</tr>\n");
                        var sortMethod = this.getCurrentSortMethod();
                        if (sortMethod != null) {
                            var sortFn_1 = this.getSortFn(sortMethod.sortBy, sortMethod.down);
                            var inserted_1 = false;
                            this.tableContainer.children("tr").each(function (i, elem) {
                                var jqElem = jQuery(elem);
                                if (!inserted_1 && sortFn_1(view, jqElem) == -1) {
                                    view.insertBefore(jqElem);
                                    inserted_1 = true;
                                }
                            });
                            if (!inserted_1) {
                                this.tableContainer.append(view);
                            }
                        }
                        else {
                            this.tableContainer.append(view);
                        }
                        view.click(function (e) {
                            if (jQuery(e.target).hasClass("remove")) {
                                _this.changeRemoveClickHandler.forEach(function (handler) {
                                    handler(change);
                                });
                            }
                            else {
                                _this.changeClickHandler.forEach(function (handler) {
                                    handler(change);
                                });
                            }
                        });
                        this.idViewMap.set(id, view);
                    };
                    AltoEditorWidget.prototype.getChangeText = function (change) {
                        if (change.type == alto.AltoWordChange.TYPE) {
                            var wc = change;
                            return wc.from + " => " + wc.to;
                        }
                    };
                    AltoEditorWidget.prototype.updateChange = function (change) {
                        var changeID = this.getChangeID(change);
                        this.idViewMap.get(changeID).html(this.getChangeHTMLContent(change));
                    };
                    AltoEditorWidget.prototype.getChangeID = function (change) {
                        var changeID = null;
                        this.idChangeMap.forEach(function (k, v) {
                            if (v == change) {
                                changeID = k;
                            }
                        });
                        return changeID;
                    };
                    AltoEditorWidget.prototype.getChangeHTMLContent = function (change) {
                        return "\n<td><span class=\"glyphicon glyphicon-remove remove\"></span></td>\n<td>" + change.pageOrder + "</td>\n<td>" + this.i18n.getTranslation("altoWidget.change." + change.type) + "</td>\n<td>" + this.getChangeText(change) + "</td>\n";
                    };
                    AltoEditorWidget.prototype.removeChange = function (wordChange) {
                        var changeID = this.getChangeID(wordChange);
                        this.idViewMap.get(changeID).remove();
                        this.idViewMap.remove(changeID);
                        this.idChangeMap.remove(changeID);
                        if (this.fileChangeMap.has(wordChange.file)) {
                            var changes = this.fileChangeMap.get(wordChange.file);
                            var index = 0;
                            while ((index = changes.indexOf(wordChange, index)) != -1) {
                                changes.splice(index, 1);
                            }
                        }
                    };
                    return AltoEditorWidget;
                }());
                alto.AltoEditorWidget = AltoEditorWidget;
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
            var WaitForEvent = mycore.viewer.components.events.WaitForEvent;
            var ShowContentEvent = mycore.viewer.components.events.ShowContentEvent;
            var AltoEditorWidget = mycore.viewer.widgets.alto.AltoEditorWidget;
            var AltoWordChange = mycore.viewer.widgets.alto.AltoWordChange;
            var DesktopInputAdapter = mycore.viewer.widgets.canvas.DesktopInputAdapter;
            var PageLoadedEvent = mycore.viewer.components.events.PageLoadedEvent;
            var MyCoReAltoEditorComponent = (function (_super) {
                __extends(MyCoReAltoEditorComponent, _super);
                function MyCoReAltoEditorComponent(_settings, _container) {
                    _super.call(this);
                    this._settings = _settings;
                    this._container = _container;
                    this.highlightWordLayer = new HighligtAltoWordCanvasPageLayer(this);
                    this.altoIDImageMap = new MyCoReMap();
                    this.imageHrefAltoContentMap = new MyCoReMap();
                    this.altoHrefImageHrefMap = new MyCoReMap();
                    this.imageHrefAltoHrefMap = new MyCoReMap();
                    this.initialHtmlApplyList = new Array();
                    this.everythingLoadedSynchronize = Utils.synchronize([
                        function (obj) { return obj._toolbarModel != null; },
                        function (obj) { return obj._languageModel != null; },
                        function (obj) { return obj._structureModel != null; },
                        function (obj) { return obj._altoPresent; }
                    ], function (obj) {
                        obj.completeLoaded();
                    });
                    this.currentEditWord = null;
                    this.beforeEditWord = null;
                }
                MyCoReAltoEditorComponent.prototype.init = function () {
                    var _this = this;
                    if (this.editorEnabled()) {
                        this.container = jQuery("<div></div>");
                        this.containerTitle = jQuery("<span>ALTO-Editor</span>");
                        this.trigger(new WaitForEvent(this, components.events.ProvideToolbarModelEvent.TYPE));
                        this.container.bind("iviewResize", function () {
                            _this.updateContainerSize();
                        });
                    }
                };
                MyCoReAltoEditorComponent.prototype.editorEnabled = function () {
                    return typeof this._settings.altoEditorPostURL !== "undefined" && this._settings.altoEditorPostURL != null;
                };
                MyCoReAltoEditorComponent.prototype.handle = function (e) {
                    var _this = this;
                    if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                        var structureModelLodedEvent = e;
                        this._structureModel = structureModelLodedEvent.structureModel;
                        this._structureImages = this._structureModel.imageList;
                        for (var imageIndex in this._structureImages) {
                            var image = this._structureImages[imageIndex];
                            var altoHref = image.additionalHrefs.get("AltoHref");
                            this._altoPresent = this._altoPresent || altoHref != null;
                            if (this._altoPresent) {
                                if (altoHref == null) {
                                    console.warn("there is no alto.xml for " + image.href);
                                    continue;
                                }
                                this.altoHrefImageHrefMap.set(altoHref, image.href);
                            }
                        }
                        this.everythingLoadedSynchronize(this);
                    }
                    if (e.type == components.events.LanguageModelLoadedEvent.TYPE) {
                        var lmle = e;
                        this._languageModel = lmle.languageModel;
                        this.everythingLoadedSynchronize(this);
                    }
                    if (e.type == components.events.ProvideToolbarModelEvent.TYPE) {
                        var ptme = e;
                        this._toolbarModel = ptme.model;
                        this._sidebarControllDropdownButton = ptme.model._sidebarControllDropdownButton;
                        this.everythingLoadedSynchronize(this);
                    }
                    if (e.type == viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE) {
                        var dbpe = e;
                        if (dbpe.childId === MyCoReAltoEditorComponent.DROP_DOWN_CHILD_ID) {
                            this.openEditor();
                        }
                    }
                    if (e.type == components.events.PageLoadedEvent.TYPE) {
                        var ple_1 = e;
                        var altoContent = ple_1.abstractPage.getHTMLContent();
                        if (altoContent.value != null) {
                            this.updateHTML(ple_1.abstractPage.id, altoContent.value);
                        }
                        else {
                            altoContent.addObserver({
                                propertyChanged: function (old, _new) {
                                    _this.updateHTML(ple_1.abstractPage.id, _new.value);
                                }
                            });
                        }
                    }
                    if (e.type == components.events.ShowContentEvent.TYPE) {
                        var sce = e;
                        if (sce.containerDirection == components.events.ShowContentEvent.DIRECTION_WEST) {
                            if (sce.size == 0) {
                                this.toggleEditWord(false);
                            }
                        }
                    }
                    if (e.type == components.events.RequestStateEvent.TYPE) {
                        var requestStateEvent = e;
                        if ("altoChangePID" in this._settings && this._settings.altoChangePID != null) {
                            requestStateEvent.stateMap.set("altoChangeID", this._settings.altoChangePID);
                        }
                    }
                };
                MyCoReAltoEditorComponent.prototype.openEditor = function () {
                    this.trigger(new ShowContentEvent(this, this.container, ShowContentEvent.DIRECTION_WEST, 400, this.containerTitle));
                };
                MyCoReAltoEditorComponent.prototype.updateHTML = function (pageId, element) {
                    var structureImage = this._structureModel.imageHrefImageMap.get(pageId);
                    var altoHref = structureImage.additionalHrefs.get("AltoHref");
                    this.altoIDImageMap.set(element.getAttribute("data-id"), structureImage);
                    this.imageHrefAltoContentMap.set(structureImage.href, element);
                    this.imageHrefAltoHrefMap.set(structureImage.href, altoHref);
                    this.syncChanges(element, altoHref);
                    if (this.isEditing()) {
                        this.applyConfidenceLevel(element);
                    }
                    else {
                        this.removeConfidenceLevel(element);
                    }
                };
                MyCoReAltoEditorComponent.prototype.mouseClick = function (position, ev) {
                    if (this.isEditing()) {
                        var element = ev.target;
                        var vpos = parseInt(element.getAttribute("data-vpos")), hpos = parseInt(element.getAttribute("data-hpos")), width = parseInt(element.getAttribute("data-width")), height = parseInt(element.getAttribute("data-height"));
                        if (!isNaN(vpos) && !isNaN(hpos)) {
                            if (this.currentEditWord !== element) {
                                this.editWord(element, vpos, hpos, width, height);
                                var range = document.createRange();
                                range.selectNodeContents(this.currentEditWord);
                                var selection = window.getSelection();
                                selection.removeAllRanges();
                                selection.addRange(range);
                            }
                            return;
                        }
                    }
                    ev.preventDefault();
                };
                MyCoReAltoEditorComponent.prototype.editWord = function (element, vpos, hpos, width, height) {
                    if (this.currentEditWord != null) {
                        this.applyEdit(this.currentEditWord, this.currentAltoID, this.currentOrder);
                    }
                    var findAltoID = function (el) {
                        return el.getAttribute("data-id") == null ? findAltoID(el.parentElement) : el.getAttribute("data-id");
                    };
                    var altoID = findAltoID(element);
                    this.currentAltoID = altoID;
                    this.currentOrder = this.altoIDImageMap.get(altoID).order;
                    this.currentEditWord = element;
                    this.beforeEditWord = element.innerText;
                    this.currentEditWord.setAttribute("contenteditable", "true");
                    this.highlightWordLayer.setHighlightedWord({
                        vpos: vpos,
                        hpos: hpos,
                        width: width,
                        height: height,
                        id: this.currentAltoID
                    });
                    this.trigger(new components.events.RedrawEvent(this));
                };
                MyCoReAltoEditorComponent.prototype.keyDown = function (e) {
                    if (this.currentEditWord != null) {
                        if (e.keyCode == MyCoReAltoEditorComponent.ENTER_KEY) {
                            this.applyEdit(this.currentEditWord, this.currentAltoID, this.currentOrder);
                            return;
                        }
                        if (e.keyCode == MyCoReAltoEditorComponent.ESC_KEY) {
                            this.abortEdit(this.currentEditWord);
                            return;
                        }
                    }
                };
                MyCoReAltoEditorComponent.prototype.abortEdit = function (element) {
                    element.innerText = this.beforeEditWord;
                    this.endEdit(element);
                };
                MyCoReAltoEditorComponent.prototype.resetWordEdit = function (element) {
                    if (this.currentEditWord == element) {
                        this.abortEdit(element);
                    }
                    element.innerText = element.getAttribute("data-word");
                    if (element.classList.contains("edited")) {
                        element.classList.remove("edited");
                    }
                };
                MyCoReAltoEditorComponent.prototype.applyEdit = function (element, altoID, order) {
                    var vpos = parseInt(element.getAttribute("data-vpos")), hpos = parseInt(element.getAttribute("data-hpos")), width = parseInt(element.getAttribute("data-width")), height = parseInt(element.getAttribute("data-height")), newWord = element.innerHTML;
                    var key = this.calculateChangeKey(altoID, vpos, hpos);
                    var oldWord = element.getAttribute("data-word");
                    if (!this.editorWidget.hasChange(key)) {
                        if (oldWord !== newWord) {
                            var wordChange = new AltoWordChange(altoID, hpos, vpos, width, height, oldWord, newWord, order);
                            this.editorWidget.addChange(key, wordChange);
                            element.classList.add("edited");
                        }
                    }
                    else {
                        var wordChange = this.editorWidget.getChange(key);
                        if (oldWord !== newWord) {
                            wordChange.to = newWord;
                            this.editorWidget.updateChange(wordChange);
                        }
                        else {
                            this.editorWidget.removeChange(wordChange);
                            if (element.classList.contains("edited")) {
                                element.classList.remove("edited");
                            }
                        }
                    }
                    this.endEdit(element);
                };
                MyCoReAltoEditorComponent.prototype.calculateChangeKey = function (altoID, vpos, hpos) {
                    return altoID + "_" + vpos + "_" + hpos;
                };
                MyCoReAltoEditorComponent.prototype.endEdit = function (element) {
                    this.currentEditWord = this.currentOrder = this.currentAltoID = this.beforeEditWord = null;
                    element.setAttribute("contenteditable", "false");
                    this.highlightWordLayer.setHighlightedWord(null);
                    viewerClearTextSelection();
                    this.trigger(new components.events.RedrawEvent(this));
                };
                Object.defineProperty(MyCoReAltoEditorComponent.prototype, "handlesEvents", {
                    get: function () {
                        return this.editorEnabled() ? [
                            components.events.StructureModelLoadedEvent.TYPE,
                            components.events.LanguageModelLoadedEvent.TYPE,
                            components.events.ProvideToolbarModelEvent.TYPE,
                            viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE,
                            components.events.ImageChangedEvent.TYPE,
                            components.events.PageLoadedEvent.TYPE,
                            components.events.ShowContentEvent.TYPE,
                            components.events.RequestStateEvent.TYPE
                        ] : [];
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReAltoEditorComponent.prototype.toggleEditWord = function (enable) {
                    var _this = this;
                    if (enable === void 0) { enable = null; }
                    if (this.editorWidget == null) {
                        return;
                    }
                    enable = enable == null ? !this.editorWidget.changeWordButton.hasClass("active") : enable;
                    var button = this.editorWidget.changeWordButton;
                    if (enable) {
                        button.addClass("active");
                        this.imageHrefAltoContentMap.values.forEach(function (html) {
                            _this.applyConfidenceLevel(html);
                        });
                    }
                    else {
                        button.removeClass("active");
                        if (this.currentEditWord != null) {
                            this.endEdit(this.currentEditWord);
                        }
                        this.imageHrefAltoContentMap.values.forEach(function (html) {
                            _this.removeConfidenceLevel(html);
                        });
                    }
                    this.trigger(new components.events.TextEditEvent(this, enable));
                    this.trigger(new components.events.RedrawEvent(this));
                };
                MyCoReAltoEditorComponent.prototype.isEditing = function () {
                    return this.editorWidget != null && this.editorWidget.changeWordButton.hasClass("active");
                };
                MyCoReAltoEditorComponent.prototype.completeLoaded = function () {
                    var _this = this;
                    this._altoDropdownChildItem = {
                        id: MyCoReAltoEditorComponent.DROP_DOWN_CHILD_ID,
                        label: this._languageModel.getTranslation("altoEditor")
                    };
                    this._sidebarControllDropdownButton.children.push(this._altoDropdownChildItem);
                    this._sidebarControllDropdownButton.children = this._sidebarControllDropdownButton.children;
                    this.editorWidget = new AltoEditorWidget(this.container, this._languageModel);
                    this.containerTitle.text("" + this._languageModel.getTranslation("altoEditor"));
                    if (typeof this._settings.altoReviewer !== "undefined" && this._settings.altoReviewer != null && this._settings.altoReviewer) {
                        this.editorWidget.enableApplyButton(true);
                    }
                    if (typeof this._settings.altoChanges != "undefined" && this._settings.altoChanges != null) {
                        if ("wordChanges" in this._settings.altoChanges && this._settings.altoChanges.wordChanges instanceof Array) {
                            this._settings.altoChanges.wordChanges.forEach(function (change) {
                                change.pageOrder = _this._structureModel.imageHrefImageMap.get(_this.altoHrefImageHrefMap.get(change.file)).order;
                                _this.editorWidget.addChange(_this.calculateChangeKey(change.file, change.hpos, change.vpos), change);
                                _this.initialHtmlApplyList.push(change);
                            });
                        }
                    }
                    this.editorWidget.changeWordButton.click(function (ev) {
                        _this.toggleEditWord();
                    });
                    this.editorWidget.addChangeClickedEventHandler(function (change) {
                        _this.trigger(new components.events.ImageSelectedEvent(_this, _this._structureModel.imageHrefImageMap.get(_this.altoHrefImageHrefMap.get(change.file))));
                    });
                    var submitSuccess = function (result) {
                        _this._settings.altoChangePID = result.pid;
                        var title = "altoChanges.save.successful.title";
                        var msg = "altoChanges.save.successful.message";
                        new mycore.viewer.widgets.modal.ViewerInfoModal(_this._settings.mobile, title, msg)
                            .updateI18n(_this._languageModel)
                            .show();
                    };
                    var applySuccess = function () {
                        _this._settings.altoChangePID = null;
                        _this.trigger(new components.events.UpdateURLEvent(_this));
                        window.location.reload(true);
                    };
                    var errorSaveCallback = function (jqXHR) {
                        console.log(jqXHR);
                        var img = _this._settings.webApplicationBaseURL + "/modules/iview2/img/sad-emotion-egg.jpg";
                        var title = "altoChanges.save.failed.title";
                        var msg = "altoChanges.save.failed.message";
                        new mycore.viewer.widgets.modal.ViewerErrorModal(_this._settings.mobile, title, msg, img)
                            .updateI18n(_this._languageModel)
                            .show();
                    };
                    var errorDeleteCallback = function (jqXHR) {
                        console.log(jqXHR);
                        var img = _this._settings.webApplicationBaseURL + "/modules/iview2/img/sad-emotion-egg.jpg";
                        var title = "altoChanges.delete.failed.title";
                        var msg = "altoChanges.delete.failed.message";
                        new mycore.viewer.widgets.modal.ViewerErrorModal(_this._settings.mobile, title, msg, img)
                            .updateI18n(_this._languageModel)
                            .show();
                    };
                    this.editorWidget.addSubmitClickHandler(function () {
                        _this.submitChanges(submitSuccess, errorSaveCallback);
                    });
                    this.editorWidget.addApplyClickHandler(function () {
                        var title = "altoChanges.applyChanges.title";
                        var msg = "altoChanges.applyChanges.message";
                        new mycore.viewer.widgets.modal.ViewerConfirmModal(_this._settings.mobile, title, msg, function (confirm) {
                            if (!confirm) {
                                return;
                            }
                            _this.submitChanges(function (result) {
                                _this._settings.altoChangePID = result.pid;
                                _this.applyChanges(applySuccess, errorSaveCallback);
                            }, errorSaveCallback);
                        }).updateI18n(_this._languageModel).show();
                    });
                    this.editorWidget.addDeleteClickHandler(function () {
                        var title = "altoChanges.removeChanges.title";
                        var msg = "altoChanges.removeChanges.message";
                        new mycore.viewer.widgets.modal.ViewerConfirmModal(_this._settings.mobile, title, msg, function (confirm) {
                            if (_this._settings.altoChangePID) {
                                var requestURL = _this._settings.altoEditorPostURL;
                                requestURL += "/delete/" + _this._settings.altoChangePID;
                                jQuery.ajax(requestURL, {
                                    contentType: "application/json",
                                    type: "POST",
                                    success: function () {
                                        _this._settings.altoChangePID = null;
                                        _this.trigger(new components.events.UpdateURLEvent(_this));
                                    },
                                    error: errorDeleteCallback
                                });
                            }
                            _this.editorWidget.getChanges().forEach(function (file, change) {
                                _this.removeChange(change);
                            });
                        }).updateI18n(_this._languageModel).show();
                    });
                    this.editorWidget.addChangeRemoveClickHandler(function (change) {
                        var title = "altoChanges.removeChange.title";
                        var msg = "altoChanges.removeChange.message";
                        new mycore.viewer.widgets.modal.ViewerConfirmModal(_this._settings.mobile, title, msg, function (confirm) {
                            if (!confirm) {
                                return;
                            }
                            _this.removeChange(change);
                        }).updateI18n(_this._languageModel).show();
                    });
                    this.trigger(new components.events.AddCanvasPageLayerEvent(this, 2, this.highlightWordLayer));
                    this.trigger(new components.events.RequestDesktopInputEvent(this, new EditAltoInputListener(this)));
                    this.trigger(new components.events.WaitForEvent(this, PageLoadedEvent.TYPE));
                    if (this._settings.leftShowOnStart === 'altoEditor') {
                        this.openEditor();
                    }
                    this.updateContainerSize();
                };
                MyCoReAltoEditorComponent.prototype.removeChange = function (change) {
                    this.editorWidget.removeChange(change);
                    var imageHref = this.altoHrefImageHrefMap.get(change.file);
                    if (this.imageHrefAltoContentMap.has(imageHref)) {
                        var altoContent = this.imageHrefAltoContentMap.get(imageHref);
                        if (change.type === AltoWordChange.TYPE) {
                            var wordChange = change;
                            var searchResult = this.findChange(wordChange, altoContent);
                            if (searchResult.length == 0) {
                                console.log("Could not find change " + wordChange);
                            }
                            else {
                                this.resetWordEdit(searchResult.get(0));
                            }
                        }
                    }
                    this.trigger(new components.events.RedrawEvent(this));
                };
                MyCoReAltoEditorComponent.prototype.applyChanges = function (successCallback, errorCallback) {
                    var requestURL = this._settings.altoEditorPostURL;
                    requestURL += "/apply/" + this._settings.altoChangePID;
                    jQuery.ajax(requestURL, {
                        contentType: "application/json",
                        type: "POST"
                    }).done(successCallback)
                        .fail(errorCallback);
                };
                MyCoReAltoEditorComponent.prototype.submitChanges = function (successCallback, errorCallback) {
                    var changeSet = {
                        "wordChanges": this.editorWidget.getChanges().values,
                        "derivateID": this._settings.derivate
                    };
                    var requestURL = this._settings.altoEditorPostURL;
                    if (typeof this._settings.altoChangePID !== "undefined" && this._settings.altoChangePID != null) {
                        requestURL += "/update/" + this._settings.altoChangePID;
                    }
                    else {
                        requestURL += "/store";
                    }
                    jQuery.ajax(requestURL, {
                        data: this.prepareData(changeSet),
                        contentType: "application/json",
                        type: "POST"
                    }).done(successCallback)
                        .fail(errorCallback);
                };
                MyCoReAltoEditorComponent.prototype.prepareData = function (changeSet) {
                    var copy = JSON.parse(JSON.stringify(changeSet));
                    copy.wordChanges.forEach(function (val) {
                        if ("pageOrder" in val) {
                            delete val.pageOrder;
                        }
                    });
                    return JSON.stringify(copy);
                };
                MyCoReAltoEditorComponent.prototype.findChange = function (wordChange, altoContent) {
                    var find = ("[data-hpos=" + wordChange.hpos + "][data-vpos=" + wordChange.vpos + "]") +
                        ("[data-width=" + wordChange.width + "][data-height=" + wordChange.height + "]");
                    var searchResult = jQuery(altoContent).find(find);
                    return searchResult;
                };
                MyCoReAltoEditorComponent.prototype.updateContainerSize = function () {
                    this.container.css({
                        "height": (this.container.parent().height() - this.containerTitle.parent().outerHeight()) + "px",
                        "overflow-y": "scroll"
                    });
                };
                MyCoReAltoEditorComponent.prototype.drag = function (currentPosition, startPosition, startViewport, e) {
                    if (e.target !== this.currentEditWord) {
                        e.preventDefault();
                    }
                };
                MyCoReAltoEditorComponent.prototype.mouseDown = function (position, e) {
                    if (e.target !== this.currentEditWord) {
                        e.preventDefault();
                    }
                };
                MyCoReAltoEditorComponent.prototype.syncChanges = function (altoContent, href) {
                    var _this = this;
                    var changesInFile = this.editorWidget.getChangesInFile(href);
                    changesInFile.forEach(function (change) {
                        if (change.type == AltoWordChange.TYPE) {
                            var wordChange = change;
                            var elementToChange = _this.findChange(wordChange, altoContent);
                            if (elementToChange.length > 0) {
                                elementToChange[0].innerText = wordChange.to;
                                elementToChange.addClass("edited");
                            }
                            else {
                                console.log("Could not find Change: " + change);
                            }
                        }
                    });
                };
                MyCoReAltoEditorComponent.prototype.applyConfidenceLevel = function (altoContent) {
                    jQuery(altoContent).find("[data-wc]:not([data-wc='1'])").each(function (i, e) {
                        var element = jQuery(e);
                        var wc = parseFloat(element.attr("data-wc"));
                        if (wc < 0.9) {
                            element.addClass('unconfident');
                        }
                    });
                };
                MyCoReAltoEditorComponent.prototype.removeConfidenceLevel = function (altoContent) {
                    jQuery(altoContent).find(".unconfident").removeClass("unconfident");
                };
                MyCoReAltoEditorComponent.DROP_DOWN_CHILD_ID = "altoButtonChild";
                MyCoReAltoEditorComponent.ENTER_KEY = 13;
                MyCoReAltoEditorComponent.ESC_KEY = 27;
                return MyCoReAltoEditorComponent;
            }(components.ViewerComponent));
            components.MyCoReAltoEditorComponent = MyCoReAltoEditorComponent;
            var EditAltoInputListener = (function (_super) {
                __extends(EditAltoInputListener, _super);
                function EditAltoInputListener(editAltoComponent) {
                    _super.call(this);
                    this.editAltoComponent = editAltoComponent;
                }
                EditAltoInputListener.prototype.mouseDown = function (position, e) {
                    if (this.editAltoComponent.isEditing()) {
                        this.editAltoComponent.mouseDown(position, e);
                    }
                };
                EditAltoInputListener.prototype.mouseUp = function (position, e) {
                };
                EditAltoInputListener.prototype.mouseMove = function (position, e) {
                };
                EditAltoInputListener.prototype.mouseClick = function (position, e) {
                    if (this.editAltoComponent.isEditing()) {
                        this.editAltoComponent.mouseClick(position, e);
                    }
                };
                EditAltoInputListener.prototype.mouseDoubleClick = function (position, e) {
                };
                EditAltoInputListener.prototype.keydown = function (e) {
                    this.editAltoComponent.keyDown(e);
                };
                EditAltoInputListener.prototype.mouseDrag = function (currentPosition, startPosition, startViewport, e) {
                    if (this.editAltoComponent.isEditing()) {
                        this.editAltoComponent.drag(currentPosition, startPosition, startViewport, e);
                    }
                };
                return EditAltoInputListener;
            }(DesktopInputAdapter));
            components.EditAltoInputListener = EditAltoInputListener;
            var HighligtAltoWordCanvasPageLayer = (function () {
                function HighligtAltoWordCanvasPageLayer(component) {
                    this.component = component;
                    this.highlightedWord = null;
                }
                HighligtAltoWordCanvasPageLayer.prototype.getHighlightedWord = function () {
                    return this.highlightedWord;
                };
                HighligtAltoWordCanvasPageLayer.prototype.setHighlightedWord = function (word) {
                    this.highlightedWord = word;
                };
                HighligtAltoWordCanvasPageLayer.prototype.draw = function (ctx, id, pageSize, drawOnHtml) {
                    var _this = this;
                    if (drawOnHtml) {
                        return;
                    }
                    ctx.save();
                    {
                        if (this.highlightedWord != null && id == this.component.altoHrefImageHrefMap.get(this.highlightedWord.id)) {
                            this.strokeWord(ctx, this.highlightedWord.hpos, this.highlightedWord.vpos, this.highlightedWord.width, this.highlightedWord.height, HighligtAltoWordCanvasPageLayer.EDIT_HIGHLIGHT_COLOR);
                        }
                        var file = this.component.imageHrefAltoHrefMap.get(id);
                        if (typeof file !== "undefined") {
                            this.component.editorWidget.getChangesInFile(file)
                                .forEach(function (change) {
                                if (change.type == AltoWordChange.TYPE) {
                                    var wordChange = change;
                                    _this.strokeWord(ctx, wordChange.hpos, wordChange.vpos, wordChange.width, wordChange.height, HighligtAltoWordCanvasPageLayer.EDITED_HIGHLIGHT_COLOR);
                                }
                            });
                        }
                    }
                    ctx.restore();
                };
                HighligtAltoWordCanvasPageLayer.prototype.strokeWord = function (ctx, hpos, vpos, wwidth, wheight, color) {
                    var width = 5 * window.devicePixelRatio;
                    var gap = width / 2 + 5 * devicePixelRatio;
                    ctx.rect(hpos - gap, vpos - gap, wwidth + (gap * 2), wheight + (gap * 2));
                    ctx.strokeStyle = color;
                    ctx.lineWidth = width;
                    ctx.stroke();
                };
                HighligtAltoWordCanvasPageLayer.EDIT_HIGHLIGHT_COLOR = "#90EE90";
                HighligtAltoWordCanvasPageLayer.EDITED_HIGHLIGHT_COLOR = "#ADD8E6";
                return HighligtAltoWordCanvasPageLayer;
            }());
            components.HighligtAltoWordCanvasPageLayer = HighligtAltoWordCanvasPageLayer;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReAltoEditorComponent);
console.log("METS MODULE");

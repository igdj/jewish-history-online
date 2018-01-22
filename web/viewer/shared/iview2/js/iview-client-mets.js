/// <reference path="..\..\..\js\iview-client-base.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
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
                    function MetsStructureModel(_rootChapter, _imageList, _chapterToImageMap, _imageToChapterMap, altoPresent) {
                        _super.call(this, _rootChapter, _imageList, _chapterToImageMap, _imageToChapterMap, altoPresent);
                        this.altoPresent = altoPresent;
                    }
                    return MetsStructureModel;
                })(viewer.model.StructureModel);
                mets.MetsStructureModel = MetsStructureModel;
            })(mets = widgets.mets || (widgets.mets = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
/// <reference path="..\..\..\js\iview-client-base.d.ts" />
/// <reference path="MetsStructureModel.ts" />
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
                    }
                    MetsStructureBuilder.prototype.processMets = function () {
                        var logicalStructMap = this.getStructMap("LOGICAL");
                        var physicalStructMap = this.getStructMap("PHYSICAL");
                        var files = this.getFiles("MASTER");
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
                        this._metsChapter = this.processChapter(null, this.getFirstElementChild(this.getStructMap("LOGICAL")));
                        this._imageList = new Array();
                        this._idImageMap = new MyCoReMap();
                        this.processImages();
                        this._structureModel = new mycore.viewer.widgets.mets.MetsStructureModel(this._metsChapter, this._imageList, this._chapterImageMap, this._imageChapterMap, altoFiles != null && altoFiles.length > 0);
                        return this._structureModel;
                    };
                    MetsStructureBuilder.prototype.getStructMap = function (type) {
                        var logicalStructMapPath = "//mets:structMap[@TYPE='" + type + "']";
                        return singleSelectShim(this.metsDocument, logicalStructMapPath, MetsStructureBuilder.NS_MAP);
                    };
                    /**
                     * Reads all files from a specific group
                     * @param group {string} the group from wich the files should be selected
                     * return the files a Array of nodes
                     */
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
                    MetsStructureBuilder.prototype.processChapter = function (parent, chapter) {
                        var chapterObject = new viewer.model.StructureChapter(parent, chapter.getAttribute("TYPE"), chapter.getAttribute("ID"), parseInt(chapter.getAttribute("ORDER")), chapter.getAttribute("LABEL"));
                        var chapterChildren = chapter.childNodes;
                        this._chapterIdMap.set(chapterObject.id, chapterObject);
                        var that = this;
                        for (var i = 0; i < chapterChildren.length; i++) {
                            var elem = chapterChildren[i];
                            if ((elem instanceof Element || "getAttribute" in elem)) {
                                if (elem.nodeName.indexOf("fptr") != -1) {
                                    this.processFPTR(parent, elem);
                                }
                                else if (elem.nodeName.indexOf("div")) {
                                    chapterObject.chapter.push(that.processChapter(chapterObject, elem));
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
                        // create blocklist if not exist
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
                            blockList.push({
                                fileId: area.getAttribute("FILEID"),
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
                        this._idPhysicalFileMap.forEach(function (k, v) {
                            var physFileDiv = _this._idPhysicalFileMap.get(k);
                            var image = _this.parseFile(physFileDiv);
                            _this._imageList.push(image);
                            _this._idImageMap.set(k, image);
                        });
                        this._imageList = this._imageList.sort(function (x, y) { return x.order - y.order; });
                        this._imageList.forEach(function (o, i) { return o.order = i + 1; });
                        this.makeLinks();
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
                            this._chapterImageMap.set(chapter.parent.id, image);
                        }
                        if (!this._chapterImageMap.has(chapter.id)) {
                            this._chapterImageMap.set(chapter.id, image);
                        }
                        if (!this._imageChapterMap.has(image.id)) {
                            this._imageChapterMap.set(image.id, chapter);
                        }
                    };
                    // tei/translation.de/THULB_129846422_1801_1802_LLZ_001_18010701_001.xml -> de
                    MetsStructureBuilder.prototype.extractTranslationLanguage = function (href) {
                        return href.split("/")[1].split(".")[1];
                    };
                    MetsStructureBuilder.prototype.parseFile = function (physFileDiv) {
                        var _this = this;
                        var img;
                        var type = physFileDiv.getAttribute("TYPE");
                        var id = physFileDiv.getAttribute("ID");
                        var order = parseInt(physFileDiv.getAttribute("ORDER"), 10);
                        var orderLabel = physFileDiv.getAttribute("ORDERLABEL");
                        var contentIds = physFileDiv.getAttribute("CONTENTIDS");
                        var additionalHrefs = new MyCoReMap();
                        var imgHref = null;
                        var imgMimeType = null;
                        XMLUtil.iterateChildNodes(physFileDiv, function (child) {
                            if (child instanceof Element || "getAttribute" in child) {
                                var childElement = child;
                                var fileId = childElement.getAttribute("FILEID");
                                var file = _this._idFileMap.get(fileId);
                                var href = _this.getAttributeNs(_this.getFirstElementChild(file), "xlink", "href");
                                var mimetype = file.getAttribute("MIMETYPE");
                                var use = file.parentNode.getAttribute("USE");
                                if (use == "MASTER") {
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
                        // TODO: Fix in mycore (we need a valid URL)
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
                })();
                mets.MetsStructureBuilder = MetsStructureBuilder;
            })(mets = widgets.mets || (widgets.mets = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
/// <reference path="..\..\..\js\iview-client-base.d.ts" />
/// <reference path="MetsStructureModel.ts" />
/// <reference path="MetsStructureBuilder.ts" />
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
                                (promise.resolve)({ model: builder.processMets(), metsObject: response });
                            },
                            error: function (request, status, exception) {
                                (promise.resolve)(exception);
                            }
                        };
                        jQuery.ajax(settings);
                        return promise;
                    };
                    return IviewMetsProvider;
                })();
                mets.IviewMetsProvider = IviewMetsProvider;
            })(mets = widgets.mets || (widgets.mets = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
/// <reference path="..\..\..\..\js\iview-client-base.d.ts" />
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
                })(events.MyCoReImageViewerEvent);
                events.MetsLoadedEvent = MetsLoadedEvent;
            })(events = components.events || (components.events = {}));
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
/// <reference path="..\..\..\js\iview-client-base.d.ts" />
/// <reference path="..\..\..\js\iview-client-base.d.ts" />
/// <reference path="../widgets/IviewMetsProvider.ts" />
/// <reference path="../components/events/MetsLoadedEvent.ts" />
/// <reference path="MetsSettings.ts" />
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReMetsComponent = (function (_super) {
                __extends(MyCoReMetsComponent, _super);
                function MyCoReMetsComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
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
                        metsPromise.resolve = function (resolved) {
                            var model = resolved.model;
                            if (model == null) {
                                console.log("mets model not found");
                                return;
                            }
                            that.metsLoaded(model);
                            _this.trigger(new components.events.MetsLoadedEvent(_this, resolved.metsObject));
                        };
                        this.trigger(new components.events.ComponentInitializedEvent(this));
                    }
                };
                MyCoReMetsComponent.prototype.metsLoaded = function (structureModel) {
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
                        return [];
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReMetsComponent.prototype.handle = function (e) {
                    return;
                };
                return MyCoReMetsComponent;
            })(components.ViewerComponent);
            components.MyCoReMetsComponent = MyCoReMetsComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReMetsComponent);
/// <reference path="..\..\..\js\iview-client-base.d.ts" />
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
                })();
                image.XMLImageInformationProvider = XMLImageInformationProvider;
                /**
                 * Represents information of a Image
                 */
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
                })();
                image.XMLImageInformation = XMLImageInformation;
            })(image = widgets.image || (widgets.image = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
/// <reference path="..\..\..\js\iview-client-base.d.ts" />
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
                                // backbuffer content is the same
                                return;
                            }
                            else {
                                this._abortLoadingTiles();
                                // need to draw the full buffer, because zoom level changed or never drawed before
                                this._backBuffer.width = newBackBuffer.size.width * 256;
                                this._backBuffer.height = newBackBuffer.size.height * 256;
                                this._drawToBackbuffer(startX, startY, endX, endY, zoomLevel, false);
                            }
                            this._backBufferArea = newBackBuffer;
                            this._backBufferAreaZoom = zoomLevel;
                            this._imgNotPreviewLoaded = false;
                        }
                        /*
                         else {
                         // zoom level is the same, so look for copy old contents
                         var reusableContent = this._backBufferArea.getIntersection(newBackBuffer);
                         if (reusableContent == null) {
                         // content complete changed :(
                         this._drawToBackbuffer(startX, startY, endX, endY, zoomLevel);
                         } else {
                         // we can copy old content \o/
                         // calculate were the old content is in the new backbuffer (in px)
                         var xTranslate = reusableContent.pos.x - newBackBuffer.pos.x * 256;
                         var yTranslate = reusableContent.pos.y - newBackBuffer.pos.y * 256;

                         var ctx = this._backBuffer.getContext("2d");
                         ctx.save();
                         ctx.translate(xTranslate, yTranslate);
                         this._drawToBackbuffer(reusableContent.pos.x, reusableContent.pos.y, reusableContent.pos.x + reusableContent.size.width, reusableContent.pos.y + reusableContent.size.height, zoomLevel);
                         ctx.restore();
                         }
                         }         */
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
                    /**
                     * Gets a preview draw instruction for a specific tile.
                     * @param tilePos the tile
                     * @returns { tile:HTMLImageElement; areaToDraw: Rect } tile contains the Image to draw and areaToDraw contains the coordinates in the Image.
                     */
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
                        return Math.ceil(Math.log(Math.max(this._width, this._height) / TileImagePage.TILE_SIZE) / Math.LN2);
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
                })();
                canvas.TileImagePage = TileImagePage;
            })(canvas = widgets.canvas || (widgets.canvas = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
/// <reference path="..\..\..\js\iview-client-base.d.ts" />
/// <reference path="../widgets/XMLImageInformationProvider.ts" />
/// <reference path="../widgets/TileImagePage.ts" />
/// <reference path="MetsSettings.ts" />
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReTiledImagePageProviderComponent = (function (_super) {
                __extends(MyCoReTiledImagePageProviderComponent, _super);
                function MyCoReTiledImagePageProviderComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this._imageInformationMap = new MyCoReMap();
                    this._imagePageMap = new MyCoReMap();
                }
                MyCoReTiledImagePageProviderComponent.prototype.init = function () {
                    if (this._settings.doctype == 'mets') {
                        this.trigger(new components.events.WaitForEvent(this, components.events.RequestPageEvent.TYPE));
                    }
                };
                MyCoReTiledImagePageProviderComponent.prototype.getPage = function (image, resolve) {
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
                MyCoReTiledImagePageProviderComponent.prototype.createPageFromMetadata = function (imageId, metadata) {
                    var _this = this;
                    var tiles = this._settings.tileProviderPath.split(",");
                    var paths = new Array();
                    tiles.forEach(function (path) {
                        paths.push(path + _this._settings.derivate + metadata.path + "/{z}/{y}/{x}.jpg");
                    });
                    return new viewer.widgets.canvas.TileImagePage(imageId, metadata.width, metadata.height, paths);
                };
                MyCoReTiledImagePageProviderComponent.prototype.getPageMetadata = function (image, resolve) {
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
                Object.defineProperty(MyCoReTiledImagePageProviderComponent.prototype, "handlesEvents", {
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
                MyCoReTiledImagePageProviderComponent.prototype.handle = function (e) {
                    if (e.type == components.events.RequestPageEvent.TYPE) {
                        var rpe = e;
                        this.getPage(rpe._pageId, function (page) {
                            rpe._onResolve(rpe._pageId, page);
                        });
                    }
                    return;
                };
                return MyCoReTiledImagePageProviderComponent;
            })(components.ViewerComponent);
            components.MyCoReTiledImagePageProviderComponent = MyCoReTiledImagePageProviderComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReTiledImagePageProviderComponent);
/// <reference path="..\..\..\..\js\iview-client-base.d.ts" />
var AltoPageElement;
(function (AltoPageElement) {
    AltoPageElement[AltoPageElement["ComposedBlock"] = 0] = "ComposedBlock";
    AltoPageElement[AltoPageElement["Illustration"] = 1] = "Illustration";
    AltoPageElement[AltoPageElement["GraphicalElement"] = 2] = "GraphicalElement";
    AltoPageElement[AltoPageElement["TextBlock"] = 3] = "TextBlock";
    AltoPageElement[AltoPageElement["TextLine"] = 4] = "TextLine";
    AltoPageElement[AltoPageElement["String"] = 5] = "String";
    AltoPageElement[AltoPageElement["SP"] = 6] = "SP";
    AltoPageElement[AltoPageElement["HYP"] = 7] = "HYP";
})(AltoPageElement || (AltoPageElement = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var alto;
            (function (alto) {
                var AltoElement = (function () {
                    function AltoElement(elementORtype, id, width, height, horizontalPositon, verticalPosition) {
                        if (typeof elementORtype === "number") {
                            this._type = elementORtype;
                            this._id = id;
                            this._height = height;
                            this._width = width;
                            this._hpos = horizontalPositon;
                            this._vpos = verticalPosition;
                        }
                        else {
                            this._type = elementORtype.getType();
                            this._id = elementORtype.getId();
                            this._height = elementORtype.getHeight();
                            this._width = elementORtype.getWidth();
                            this._hpos = elementORtype.getHPos();
                            this._vpos = elementORtype.getVPos();
                        }
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
                    return AltoElement;
                })();
                alto.AltoElement = AltoElement;
            })(alto = widgets.alto || (widgets.alto = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
/// <reference path="..\..\..\..\js\iview-client-base.d.ts" />
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var alto;
            (function (alto) {
                var AltoContainerElement = (function (_super) {
                    __extends(AltoContainerElement, _super);
                    function AltoContainerElement(elementORtpye, id, width, height, horizontalPositon, verticalPosition) {
                        if (typeof elementORtpye === "number") {
                            _super.call(this, elementORtpye, id, width, height, horizontalPositon, verticalPosition);
                        }
                        else {
                            _super.call(this, elementORtpye);
                        }
                        this._children = new Array();
                    }
                    AltoContainerElement.prototype.getChildren = function () {
                        return this._children;
                    };
                    AltoContainerElement.prototype.setChildren = function (childs) {
                        this._children = childs;
                    };
                    return AltoContainerElement;
                })(alto.AltoElement);
                alto.AltoContainerElement = AltoContainerElement;
            })(alto = widgets.alto || (widgets.alto = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
/// <reference path="..\..\..\..\js\iview-client-base.d.ts" />
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var alto;
            (function (alto) {
                var AltoContentElement = (function (_super) {
                    __extends(AltoContentElement, _super);
                    function AltoContentElement(content, elementORtpye, id, width, height, horizontalPositon, verticalPosition) {
                        if (typeof elementORtpye === "number") {
                            _super.call(this, elementORtpye, id, width, height, horizontalPositon, verticalPosition);
                        }
                        else {
                            _super.call(this, elementORtpye);
                        }
                        this._content = content;
                    }
                    AltoContentElement.prototype.getContent = function () {
                        return this._content;
                    };
                    AltoContentElement.prototype.setContent = function (content) {
                        this._content = content;
                    };
                    return AltoContentElement;
                })(alto.AltoElement);
                alto.AltoContentElement = AltoContentElement;
            })(alto = widgets.alto || (widgets.alto = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
/// <reference path="..\..\..\..\js\iview-client-base.d.ts" />
/// <reference path="AltoElement.ts" />
/// <reference path="AltoContainerElement.ts" />
/// <reference path="AltoContentElement.ts" />
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var alto;
            (function (alto) {
                var AltoContainer = (function () {
                    function AltoContainer() {
                        this._blocks = new Array();
                        this._lines = new Array();
                    }
                    //erstellt ein neues Alto-Element mit Mindestanforderungen
                    AltoContainer.prototype.createAltoElement = function (src, type) {
                        var width = parseFloat(src.getAttribute("WIDTH"));
                        var height = parseFloat(src.getAttribute("HEIGHT"));
                        var hpos = parseFloat(src.getAttribute("HPOS"));
                        var vpos = parseFloat(src.getAttribute("VPOS"));
                        var id = src.getAttribute("ID");
                        return new alto.AltoElement(type, id, width, height, hpos, vpos);
                    };
                    //Aufruf: PrintSpace->ermittle alle Kinder des Typs Textblock -> ermittle davon alle Kinder (TextLines) -> hole die Kinder der Textlines
                    AltoContainer.prototype.extractElements = function (elem, elementType) {
                        var childrenOfElement = new Array();
                        //da enums mit reverse mapping erstellt werden kann zu der passende Nummer der entsprechende String ausgegeben werden
                        var childList = elem.getElementsByTagName(AltoPageElement[elementType]);
                        //durchlaufe die Kinder
                        for (var index = 0; index < childList.length; index++) {
                            var currentElement = childList.item(index);
                            var item = this.createAltoElement(currentElement, elementType);
                            switch (elementType) {
                                case AltoPageElement.TextBlock:
                                    var blockChildren = this.extractElements(currentElement, AltoPageElement.TextLine);
                                    var newBlock = new alto.AltoContainerElement(item);
                                    newBlock.setChildren(blockChildren);
                                    childrenOfElement.push(newBlock);
                                    this._blocks.push(newBlock);
                                    break;
                                case AltoPageElement.TextLine:
                                    var listChildrens = this.extractElements(currentElement, AltoPageElement.String);
                                    var newList = new alto.AltoContainerElement(item);
                                    newList.setChildren(listChildrens);
                                    childrenOfElement.push(newList);
                                    this._lines.push(newList);
                                    break;
                                case AltoPageElement.String:
                                case AltoPageElement.SP:
                                case AltoPageElement.HYP:
                                    var newWord = new alto.AltoContentElement(currentElement.getAttribute("CONTENT"), item);
                                    childrenOfElement.push(newWord);
                                    break;
                            }
                        }
                        return childrenOfElement;
                    };
                    AltoContainer.prototype.getBlocks = function () {
                        return this._blocks;
                    };
                    AltoContainer.prototype.getBlockContent = function (id) {
                        var content = "";
                        for (var index = 0; index < this._blocks.length; index++) {
                            if (this._blocks[index].getId() == id) {
                                var lines = this._blocks[index].getChildren();
                                for (var i = 0; i < lines.length; i++) {
                                    content += this.getContainerContent(lines[i].getId(), this._lines);
                                }
                                break;
                            }
                        }
                        return content;
                    };
                    AltoContainer.prototype.getContainerContent = function (id, container) {
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
                    AltoContainer.prototype.getLines = function () {
                        return this._lines;
                    };
                    return AltoContainer;
                })();
                alto.AltoContainer = AltoContainer;
            })(alto = widgets.alto || (widgets.alto = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
/// <reference path="..\..\..\..\js\iview-client-base.d.ts" />
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
                })(events.MyCoReImageViewerEvent);
                events.RequestAltoModelEvent = RequestAltoModelEvent;
            })(events = components.events || (components.events = {}));
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
/// <reference path="..\..\..\js\iview-client-base.d.ts" />
/// <reference path="../widgets/XMLImageInformationProvider.ts" />
/// <reference path="../widgets/TileImagePage.ts" />
/// <reference path="MetsSettings.ts" />
/// <reference path="../widgets/alto/AltoContainer.ts" />
/// <reference path="events/RequestAltoModelEvent.ts" />
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
                }
                MyCoReAltoModelProvider.prototype.init = function () {
                    if (this._settings.doctype == "mets") {
                        this.trigger(new components.events.WaitForEvent(this, components.events.StructureModelLoadedEvent.TYPE));
                    }
                };
                MyCoReAltoModelProvider.prototype.handle = function (e) {
                    if (e.type == components.events.RequestAltoModelEvent.TYPE) {
                        if (this.structureModel == null || this.structureModel._textContentPresent) {
                            var rtce = e;
                            if (this.pageHrefAltoHrefMap.has(rtce._href)) {
                                this.resolveAltoModel(rtce._href, function (mdl) {
                                    rtce._onResolve(rtce._href, mdl);
                                });
                            }
                            else {
                                console.warn("RPE : altoHref not found!");
                            }
                        }
                    }
                    if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                        var smle = e;
                        this.structureModel = smle.structureModel;
                        if (smle.structureModel._textContentPresent) {
                            this.fillAltoHrefMap();
                            this.trigger(new components.events.WaitForEvent(this, components.events.RequestTextContentEvent.TYPE));
                        }
                    }
                    return;
                };
                MyCoReAltoModelProvider.prototype.fillAltoHrefMap = function () {
                    var _this = this;
                    this.structureModel.imageList.forEach(function (image) {
                        var hasTextHref = image.additionalHrefs.has(MyCoReAltoModelProvider.TEXT_HREF);
                        if (hasTextHref) {
                            _this.pageHrefAltoHrefMap.set(image.href, image.additionalHrefs.get(MyCoReAltoModelProvider.TEXT_HREF));
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
                    var altoContainer = new viewer.widgets.alto.AltoContainer();
                    var pageContent = xml.getElementsByTagName("PrintSpace");
                    var printSpace = pageContent.item(0);
                    if (printSpace != null) {
                        var elements = altoContainer.extractElements(printSpace, AltoPageElement.TextBlock);
                        MyCoReAltoModelProvider.altoHrefModelMap.set(altoHref, altoContainer);
                        callback(altoContainer);
                    }
                };
                MyCoReAltoModelProvider.altoHrefModelMap = new MyCoReMap();
                MyCoReAltoModelProvider.TEXT_HREF = "AltoHref";
                return MyCoReAltoModelProvider;
            })(components.ViewerComponent);
            components.MyCoReAltoModelProvider = MyCoReAltoModelProvider;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReAltoModelProvider);
/// <reference path="..\..\..\js\iview-client-base.d.ts" />
/// <reference path="../widgets/XMLImageInformationProvider.ts" />
/// <reference path="../widgets/TileImagePage.ts" />
/// <reference path="MetsSettings.ts" />
/// <reference path="../widgets/alto/AltoContainer.ts" />
/// <reference path="events/RequestAltoModelEvent.ts" />
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReAltoTextProvider = (function (_super) {
                __extends(MyCoReAltoTextProvider, _super);
                function MyCoReAltoTextProvider(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this._model = null;
                }
                MyCoReAltoTextProvider.prototype.init = function () {
                    if (this._settings.doctype == "mets") {
                        this.trigger(new components.events.WaitForEvent(this, components.events.StructureModelLoadedEvent.TYPE));
                    }
                };
                MyCoReAltoTextProvider.prototype.handle = function (e) {
                    if (e.type == components.events.RequestTextContentEvent.TYPE) {
                        if (this._model == null || this._model._textContentPresent) {
                            var rtce = e;
                            this.resolveTextContent(rtce._href, function (mdl) {
                                rtce._onResolve(rtce._href, mdl);
                            });
                        }
                    }
                    return;
                };
                Object.defineProperty(MyCoReAltoTextProvider.prototype, "handlesEvents", {
                    get: function () {
                        if (this._settings.doctype == "mets") {
                            return [components.events.RequestTextContentEvent.TYPE];
                        }
                        else {
                            return [];
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReAltoTextProvider.prototype.resolveTextContent = function (pageId, callback) {
                    var _this = this;
                    if (MyCoReAltoTextProvider._pageHrefTextContentModelMap.has(pageId)) {
                        callback(MyCoReAltoTextProvider._pageHrefTextContentModelMap.get(pageId));
                    }
                    else {
                        this.trigger(new components.events.RequestAltoModelEvent(this, pageId, function (href, content) {
                            _this.loadedAltoModelCallback(pageId, pageId, content, callback);
                        }));
                    }
                };
                MyCoReAltoTextProvider.prototype.loadedAltoModelCallback = function (parentId, altoHref, altoContainer, callback) {
                    var textContent = {
                        content: this.extractTextContent(parentId, altoContainer.getLines())
                    };
                    MyCoReAltoTextProvider._pageHrefTextContentModelMap.set(altoHref, textContent);
                    callback(textContent);
                };
                MyCoReAltoTextProvider.prototype.extractTextContent = function (parentId, lines) {
                    var textContentArray = new Array();
                    lines.forEach(function (line) { return line.getChildren().forEach(function (word, wordCount, allWords) {
                        var isLastWordInLine = allWords.length == wordCount;
                        var ele = new AltoTextContent(word, parentId, isLastWordInLine);
                        textContentArray.push(ele);
                    }); });
                    return textContentArray;
                };
                MyCoReAltoTextProvider._pageHrefTextContentModelMap = new MyCoReMap();
                MyCoReAltoTextProvider.TEXT_HREF = "AltoHref";
                return MyCoReAltoTextProvider;
            })(components.ViewerComponent);
            components.MyCoReAltoTextProvider = MyCoReAltoTextProvider;
            var AltoTextContent = (function () {
                function AltoTextContent(word, parentId, isLastWordInLine) {
                    this.angle = 0;
                    this.size = new Size2D(word.getWidth(), word.getHeight());
                    this.pos = new Position2D(word.getHPos(), word.getVPos());
                    this.fontFamily = "arial";
                    this.fontSize = word.getHeight();
                    this.fromBottomLeft = false;
                    this.pageHref = parentId;
                    this.text = word.getContent() + ((isLastWordInLine) ? "\n" : " ");
                }
                AltoTextContent.prototype.toString = function () {
                    return this.pageHref.toString + "-" + this.pos.toString() + "-" + this.size.toString();
                };
                return AltoTextContent;
            })();
            components.AltoTextContent = AltoTextContent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReAltoTextProvider);
/// <reference path="..\..\..\..\js\iview-client-base.d.ts" />
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var tei;
            (function (tei) {
                var TEILayer = (function () {
                    function TEILayer(_id, _label, mapping, contentLocation) {
                        this._id = _id;
                        this._label = _label;
                        this.mapping = mapping;
                        this.contentLocation = contentLocation;
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
                            jQuery.ajax(this.contentLocation + this.mapping.get(pageHref) + "?XSL.Style=html", settings);
                        }
                        else {
                            callback(false);
                        }
                    };
                    return TEILayer;
                })();
                tei.TEILayer = TEILayer;
            })(tei = widgets.tei || (widgets.tei = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
/// <reference path="..\..\..\js\iview-client-base.d.ts" />
/// <reference path="../widgets/XMLImageInformationProvider.ts" />
/// <reference path="../widgets/tei/TEILayer.ts" />
/// <reference path="MetsSettings.ts" />
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
                    this.contentLocation = null;
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
                        if (transcriptions.keys.length != 0) {
                            this.trigger(new components.events.ProvideLayerEvent(this, new viewer.widgets.tei.TEILayer("transcription", "transcription", transcriptions, this.contentLocation)));
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
                                _this.trigger(new components.events.ProvideLayerEvent(_this, new viewer.widgets.tei.TEILayer("translation_" + language, "translation_" + language, translationMap, _this.contentLocation)));
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
            })(components.ViewerComponent);
            components.MyCoReTEILayerProvider = MyCoReTEILayerProvider;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReTEILayerProvider);
/// <reference path="..\..\..\..\js\iview-client-base.d.ts" />
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var alto;
            (function (alto) {
                var AltoLayer = (function () {
                    function AltoLayer(_id, _label, mapping, altoTextProvider, markerCallback) {
                        this._id = _id;
                        this._label = _label;
                        this.mapping = mapping;
                        this.altoTextProvider = altoTextProvider;
                        this.markerCallback = markerCallback;
                    }
                    AltoLayer.prototype.getId = function () {
                        return this._id;
                    };
                    AltoLayer.prototype.getLabel = function () {
                        return this._label;
                    };
                    AltoLayer.prototype.resolveLayer = function (pageHref, callback) {
                        var _this = this;
                        if (this.mapping.has(pageHref)) {
                            this.altoTextProvider(pageHref, function (pageHref, textContent) {
                                var documentFragment = document.createDocumentFragment();
                                var idDataMap = new MyCoReMap();
                                textContent.content.forEach(function (te) {
                                    var spanElement = document.createElement("span");
                                    spanElement.innerText = spanElement.textContent = te.text;
                                    documentFragment.appendChild(spanElement);
                                    var id = Math.random().toString(36).substring(2, 15);
                                    idDataMap.set(id, te);
                                    te.mouseenter = function () {
                                        spanElement.classList.add("highlight");
                                    };
                                    te.mouseleave = function () {
                                        if (spanElement.classList.contains("highlight")) {
                                            spanElement.classList.remove("highlight");
                                        }
                                    };
                                    spanElement.setAttribute("data-id", id);
                                });
                                var content = jQuery("<div></div>");
                                content.append(documentFragment);
                                content.mousemove(function (e) {
                                    var id = jQuery(e.target).attr("data-id");
                                    if (idDataMap.has(id)) {
                                        var workMarker = new MyCoReMap();
                                        var word = idDataMap.get(id);
                                        _this.markerCallback([word]);
                                    }
                                });
                                //jQuery(window).mousedown((e)=> {
                                //    this.markerCallback([]);
                                //});
                                callback(true, content);
                            });
                        }
                        else {
                            callback(false);
                        }
                    };
                    return AltoLayer;
                })();
                alto.AltoLayer = AltoLayer;
            })(alto = widgets.alto || (widgets.alto = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
/// <reference path="..\..\..\js\iview-client-base.d.ts" />
/// <reference path="../widgets/XMLImageInformationProvider.ts" />
/// <reference path="../widgets/alto/AltoLayer.ts" />
/// <reference path="MetsSettings.ts" />
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReAltoLayerProvider = (function (_super) {
                __extends(MyCoReAltoLayerProvider, _super);
                function MyCoReAltoLayerProvider(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this._model = null;
                }
                MyCoReAltoLayerProvider.prototype.init = function () {
                    if (this._settings.doctype == "mets") {
                        this.trigger(new components.events.WaitForEvent(this, components.events.StructureModelLoadedEvent.TYPE));
                    }
                };
                MyCoReAltoLayerProvider.prototype.handle = function (e) {
                    var _this = this;
                    if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                        var smle = e;
                        this._model = smle.structureModel;
                        var altos = new MyCoReMap();
                        var hasAny = false;
                        smle.structureModel._imageList.forEach(function (image) {
                            var additionalHrefs = image.additionalHrefs;
                            additionalHrefs.forEach(function (name, href) {
                                if (name == MyCoReAltoLayerProvider.TEXT_HREF) {
                                    altos.set(image.href, href);
                                    hasAny = true;
                                }
                            });
                        });
                        var altoLayer = new viewer.widgets.alto.AltoLayer(MyCoReAltoLayerProvider.TEXT_HREF, "ALTO", altos, function (pageHref, callback) {
                            _this.trigger(new components.events.RequestTextContentEvent(_this, pageHref, callback));
                        }, function (textToMark) {
                            _this.trigger(new components.events.HighlightTextEvent(_this, textToMark));
                        });
                        if (hasAny) {
                            this.trigger(new components.events.ProvideLayerEvent(this, altoLayer));
                        }
                        return;
                    }
                };
                Object.defineProperty(MyCoReAltoLayerProvider.prototype, "handlesEvents", {
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
                MyCoReAltoLayerProvider.TEXT_HREF = "AltoHref";
                return MyCoReAltoLayerProvider;
            })(components.ViewerComponent);
            components.MyCoReAltoLayerProvider = MyCoReAltoLayerProvider;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReAltoLayerProvider);
/// <reference path="..\..\..\..\js\iview-client-base.d.ts" />
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
                        /*this.wrapper.removeClass("bs-modal-sm")
                        this.wrapper.addClass("bs-modal-lg")

                        this.box.removeClass("modal-sm")
                        this.box.addClass("modal-lg")
                         */
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
                })(modal.IviewModalWindow);
                modal.IviewPrintModalWindow = IviewPrintModalWindow;
            })(modal = widgets.modal || (widgets.modal = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
/// <reference path="..\..\..\js\iview-client-base.d.ts" />
/// <reference path="MetsSettings.ts" />
/// <reference path="../widgets/modal/IviewPrintModalWindow.ts" />
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
                    this._enabled = this._settings.pdfCreatorStyle != null && this._settings.pdfCreatorStyle.length != 0;
                }
                MyCoRePrintComponent.prototype.buildRequestLink = function (pages) {
                    var metsLocation = "{location}/mets.xml?XSL.Style={creatorStyle}";
                    var formatString = "{creator}?mets={metsLocation}&pages={pages}";
                    var params = {
                        creator: this._settings.pdfCreatorURI,
                        metsLocation: encodeURIComponent(ViewerFormatString(metsLocation, {
                            location: this._settings.metsURL,
                            creatorStyle: this._settings.pdfCreatorStyle
                        })),
                        pages: pages
                    };
                    return ViewerFormatString(formatString, params);
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
                        ptme.model._actionControllGroup.addComponent(this._printButton);
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
                            window.location.href = that.buildRequestLink(page);
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
                        url: this._settings.pdfCreatorURI + "?getRestrictions",
                        crossDomain: true,
                        complete: function (jqXHR, textStatus) {
                            //jQuery.support.cors = corsSupport;
                        },
                        success: function (data) {
                            that._maxPages = parseInt(data.maxPages);
                            that._modalWindow.maximalPages = that._maxPages.toString();
                        }
                    });
                };
                /**
                 * Validates the range input
                 * ranges: range+;
                 * range:  page | pageRange;
                 * pageRange: page + ' '* + '-' + ' '* + page;
                 * page: [0-10]+;
                 *
                 * @param range
                 * @returns {valid:boolean;text:string;firstPage?:number}
                 */
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
                        // check page or pageRange
                        if (range.indexOf("-") == -1) {
                            // page
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
            })(components.ViewerComponent);
            components.MyCoRePrintComponent = MyCoRePrintComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoRePrintComponent);
/// <reference path="..\..\js\iview-client-base.d.ts" />
/// <reference path="components/MyCoReMetsComponent.ts" />
/// <reference path="components/MyCoReTiledImagePageProviderComponent.ts" />
/// <reference path="components/MyCoReAltoModelProvider.ts" />
/// <reference path="components/MyCoReAltoTextProvider.ts" />
/// <reference path="components/MyCoReTEILayerProvider.ts" />
/// <reference path="components/MyCoReAltoLayerProvider.ts" />
/// <reference path="components/MyCoRePrintComponent.ts" />
console.log("METS MODULE");
//# sourceMappingURL=iview-client-mets.js.map
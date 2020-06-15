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
            var pdf;
            (function (pdf) {
                var PDFStructureModel = (function (_super) {
                    __extends(PDFStructureModel, _super);
                    function PDFStructureModel(_rootChapter, _imageList, _chapterToImageMap, _imageToChapterMap, _imageHrefImageMap, refPageMap) {
                        _super.call(this, _rootChapter, _imageList, _chapterToImageMap, _imageToChapterMap, _imageHrefImageMap, true);
                        this.refPageMap = refPageMap;
                    }
                    return PDFStructureModel;
                }(viewer.model.StructureModel));
                pdf.PDFStructureModel = PDFStructureModel;
            })(pdf = widgets.pdf || (widgets.pdf = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var pdf;
            (function (pdf) {
                var PDFStructureBuilder = (function () {
                    function PDFStructureBuilder(_document, _name) {
                        this._document = _document;
                        this._name = _name;
                        this._structureModel = null;
                        this._chapterPageMap = new MyCoReMap();
                        this._pages = new Array();
                        this._pageCount = 0;
                        this._refPageMap = new MyCoReMap();
                        this._idPageMap = new MyCoReMap();
                        this._promise = new ViewerPromise();
                        this._outlineTodoCount = 0;
                        this._pageCount = (this._document.numPages);
                    }
                    PDFStructureBuilder.prototype.resolve = function () {
                        this._resolvePages();
                        this._resolveOutline();
                        return this._promise;
                    };
                    PDFStructureBuilder.prototype._resolvePages = function () {
                        var that = this;
                        this._loadedPageCount = 0;
                        for (var i = 1; i <= that._pageCount; i++) {
                            var callback = this._createThumbnailDrawer(i);
                            var additionalHref = new MyCoReMap();
                            additionalHref.set(PDFStructureBuilder.PDF_TEXT_HREF, i + "");
                            var structureImage = new viewer.model.StructureImage("pdfPage", i + "", i, null, i + "", "pdfPage", callback, additionalHref);
                            that._pages.push(structureImage);
                            that._idPageMap.set(i, structureImage);
                        }
                    };
                    PDFStructureBuilder.prototype._createThumbnailDrawer = function (i) {
                        var that = this;
                        var imgData = null;
                        var collectedCallbacks = new Array();
                        return function (callback) {
                            if (imgData == null) {
                                collectedCallbacks.push(function (url) {
                                    if (imgData == null) {
                                        imgData = url;
                                    }
                                    callback(url);
                                });
                                if (collectedCallbacks.length == 1) {
                                    that._document.getPage(i).then(function (page) {
                                        that._renderPage(collectedCallbacks, page);
                                    });
                                }
                            }
                            else {
                                callback(imgData);
                            }
                        };
                    };
                    PDFStructureBuilder.prototype._renderPage = function (callbacks, page) {
                        var _this = this;
                        var originalSize = new Size2D(page.view[2] - page.view[0], page.view[3] - page.view[1]);
                        var largest = Math.max(originalSize.width, originalSize.height);
                        var vpScale = 256 / largest;
                        var vp = page.getViewport(vpScale);
                        var thumbnailDrawCanvas = document.createElement("canvas");
                        var thumbnailCanvasCtx = thumbnailDrawCanvas.getContext("2d");
                        thumbnailDrawCanvas.width = (originalSize.width) * vpScale;
                        thumbnailDrawCanvas.height = (originalSize.height) * vpScale;
                        var task = page.render({ canvasContext: thumbnailCanvasCtx, viewport: vp });
                        task.promise.then(function (onErr) {
                            _this._loadedPageCount++;
                            var imgUrl = thumbnailDrawCanvas.toDataURL();
                            thumbnailDrawCanvas = null;
                            thumbnailCanvasCtx = null;
                            for (var callbackIndex in callbacks) {
                                var callback = callbacks[callbackIndex];
                                callback(imgUrl);
                            }
                        });
                    };
                    PDFStructureBuilder.prototype._resolveOutline = function () {
                        var that = this;
                        this._document.getOutline().then(function (nodes) {
                            that._outline = nodes;
                            that.resolveStructure();
                        });
                    };
                    PDFStructureBuilder.prototype.getPageNumberFromDestination = function (dest, callback) {
                        var _this = this;
                        var promise;
                        if (typeof dest === 'string') {
                            promise = this._document.getDestination(dest);
                        }
                        else {
                            promise = window.Promise.resolve(dest);
                        }
                        promise.then(function (destination) {
                            if (!(destination instanceof Array)) {
                                console.error("Invalid destination " + destination);
                                return;
                            }
                            else {
                                _this._document.getPageIndex(destination[0]).then(function (pageNumber) {
                                    if (typeof pageNumber != "undefined" && pageNumber != null) {
                                        if (pageNumber > _this._pageCount) {
                                            console.error("Destination outside of Document! (" + pageNumber + ")");
                                        }
                                        else {
                                            callback(pageNumber + 1);
                                        }
                                    }
                                });
                            }
                        });
                    };
                    PDFStructureBuilder.prototype.getChapterFromOutline = function (parent, nodes, currentCount) {
                        var _this = this;
                        var chapterArr = new Array();
                        for (var nodeIndex in nodes) {
                            var currentNode = nodes[nodeIndex];
                            var destResolver = (function (copyChapter) { return function (callback) {
                                _this.getPageNumberFromDestination(copyChapter.dest, callback);
                            }; })(currentNode);
                            var chapter = new viewer.model.StructureChapter(parent, "pdfChapter", Utils.hash(currentNode.title + currentCount++).toString(), currentNode.title, null, null, destResolver);
                            var children = this.getChapterFromOutline(chapter, currentNode.items, currentCount++);
                            chapter.chapter = children;
                            chapterArr.push(chapter);
                        }
                        return chapterArr;
                    };
                    PDFStructureBuilder.prototype.checkResolvable = function () {
                        if (this._structureModel != null && this._outlineTodoCount == 0)
                            this._promise.resolve(this._structureModel);
                    };
                    PDFStructureBuilder.prototype.resolveStructure = function () {
                        if (typeof this._outline != "undefined") {
                            var that = this;
                            this._rootChapter = new viewer.model.StructureChapter(null, "pdf", "0", this._name, null, null, function () { return 1; });
                            this._rootChapter.chapter = this.getChapterFromOutline(this._rootChapter, this._outline, 1);
                            this._structureModel = new pdf.PDFStructureModel(this._rootChapter, this._pages, this._chapterPageMap, new MyCoReMap(), new MyCoReMap(), this._refPageMap);
                            this.checkResolvable();
                        }
                    };
                    PDFStructureBuilder.destToString = function (ref) {
                        return ref.gen + " " + ref.num;
                    };
                    PDFStructureBuilder.PDF_TEXT_HREF = "pdfText";
                    return PDFStructureBuilder;
                }());
                pdf.PDFStructureBuilder = PDFStructureBuilder;
            })(pdf = widgets.pdf || (widgets.pdf = {}));
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
                var PDFPage = (function () {
                    function PDFPage(id, pdfPage, builder) {
                        this.id = id;
                        this.pdfPage = pdfPage;
                        this.builder = builder;
                        this._frontBuffer = document.createElement("canvas");
                        this._backBuffer = document.createElement("canvas");
                        this._timeOutIDHolder = null;
                        this._bbScale = -1;
                        this._fbScale = -1;
                        this._promiseRunning = false;
                        this._textData = null;
                        var width = (this.pdfPage.view[2] - this.pdfPage.view[0]) * PDFPage.CSS_UNITS;
                        var height = (this.pdfPage.view[3] - this.pdfPage.view[1]) * PDFPage.CSS_UNITS;
                        var pageRotation = pdfPage.pageInfo.rotate;
                        if (pageRotation == 90 || pageRotation == 270) {
                            width = width ^ height;
                            height = height ^ width;
                            width = width ^ height;
                        }
                        this._rotation = pageRotation;
                        this.size = new Size2D(width, height);
                    }
                    PDFPage.prototype.resolveTextContent = function (callback) {
                        var _this = this;
                        if (this._textData == null) {
                            var textContent = {
                                content: [],
                                links: [],
                                internLinks: []
                            };
                            this._textData = textContent;
                            var contentReady_1 = false, linksReady_1 = false;
                            var completeCall_1 = function () { return (contentReady_1 && linksReady_1) ? callback(textContent) : null; };
                            this.pdfPage.getAnnotations().then(function (anotations) {
                                linksReady_1 = true;
                                if (anotations.length > 0) {
                                    for (var _i = 0, anotations_1 = anotations; _i < anotations_1.length; _i++) {
                                        var annotation = anotations_1[_i];
                                        if (annotation.annotationType == 2 && annotation.subtype == 'Link') {
                                            if ("url" in annotation) {
                                                textContent.links.push({
                                                    rect: _this.getRectFromAnnotation(annotation),
                                                    url: annotation.url
                                                });
                                            }
                                            else if ("dest" in annotation) {
                                                var numberResolver = (function (annotation) {
                                                    return function (callback) {
                                                        _this.builder.getPageNumberFromDestination(annotation.dest, function (pageNumber) {
                                                            callback(pageNumber + "");
                                                        });
                                                    };
                                                })(annotation);
                                                textContent.internLinks.push({
                                                    rect: _this.getRectFromAnnotation(annotation),
                                                    pageNumberResolver: numberResolver
                                                });
                                            }
                                        }
                                    }
                                }
                                completeCall_1();
                            });
                            this.pdfPage.getTextContent().then(function (textData) {
                                contentReady_1 = true;
                                textData.items.forEach(function (e) {
                                    var vp = _this.pdfPage.getViewport(1);
                                    var transform = PDFJS.Util.transform(vp.transform, e.transform);
                                    var style = textData.styles[e.fontName];
                                    var angle = Math.atan2(transform[1], transform[0]) + ((style.vertical == true) ? Math.PI / 2 : 0);
                                    var fontHeight = Math.sqrt((transform[2] * transform[2]) + (transform[3] * transform[3]));
                                    var fontAscent = fontHeight;
                                    if (style.ascent) {
                                        fontAscent = style.ascent * fontAscent;
                                    }
                                    else if (style.descent) {
                                        fontAscent = (1 + style.descent) * fontAscent;
                                    }
                                    var x;
                                    var y;
                                    x = transform[4] * PDFPage.CSS_UNITS;
                                    y = transform[5] * PDFPage.CSS_UNITS;
                                    var textElement = new PDFTextElement(angle, new Size2D(e.width, e.height).scale(PDFPage.CSS_UNITS).roundDown(), fontHeight, e.str, new Position2D(x, y), style.fontFamily, _this.id);
                                    textContent.content.push(textElement);
                                });
                                completeCall_1();
                            }, function (reason) {
                                contentReady_1 = true;
                                console.error("PDF Page Text Content rejected");
                                console.error("Reason: " + reason);
                                completeCall_1();
                            });
                        }
                        else {
                            callback(this._textData);
                        }
                    };
                    PDFPage.prototype.getRectFromAnnotation = function (annotation) {
                        return new Rect(new Position2D(annotation.rect[0] * PDFPage.CSS_UNITS, this.size.height - (annotation.rect[1] * PDFPage.CSS_UNITS) - ((annotation.rect[3] - annotation.rect[1]) * PDFPage.CSS_UNITS)), new Size2D((annotation.rect[2] - annotation.rect[0]) * PDFPage.CSS_UNITS, (annotation.rect[3] - annotation.rect[1]) * PDFPage.CSS_UNITS));
                    };
                    PDFPage.prototype.draw = function (ctx, rect, sourceScale, overview, infoScale) {
                        if (!overview && sourceScale != this._fbScale) {
                            if (!this._promiseRunning) {
                                this._updateBackBuffer(sourceScale);
                            }
                        }
                        if (this._fbScale == -1) {
                            return;
                        }
                        var scaledRect = rect.scale(this._fbScale);
                        var sourceScaleRect = rect.scale(sourceScale);
                        var sw = scaledRect.size.width;
                        var sh = scaledRect.size.height;
                        if (sw > 0 && sh > 0) {
                            ctx.save();
                            {
                                ctx.drawImage(this._frontBuffer, scaledRect.pos.x, scaledRect.pos.y, Math.min(sw, this._frontBuffer.width), Math.min(sh, this._frontBuffer.height), 0, 0, sourceScaleRect.size.width, sourceScaleRect.size.height);
                            }
                            ctx.restore();
                        }
                    };
                    PDFPage.prototype._updateBackBuffer = function (newScale) {
                        var _this = this;
                        var vp = this.pdfPage.getViewport(newScale * PDFPage.CSS_UNITS, this._rotation);
                        var task = this.pdfPage.render({
                            canvasContext: this._backBuffer.getContext('2d'),
                            viewport: vp
                        });
                        this._bbScale = newScale;
                        this._promiseRunning = true;
                        this._backBuffer.width = this.size.width * newScale;
                        this._backBuffer.height = this.size.height * newScale;
                        var resolve = function (page) {
                            _this._promiseRunning = false;
                            _this._swapBuffers();
                            _this.refreshCallback();
                        };
                        var error = function (err) {
                            console.log("Render Error", err);
                        };
                        task.promise.then(resolve, error);
                    };
                    PDFPage.prototype._swapBuffers = function () {
                        var swap = null;
                        swap = this._backBuffer;
                        this._backBuffer = this._frontBuffer;
                        this._frontBuffer = swap;
                        swap = this._bbScale;
                        this._bbScale = this._fbScale;
                        this._fbScale = swap;
                    };
                    PDFPage.prototype.toString = function () {
                        return this.pdfPage.pageNumber;
                    };
                    PDFPage.prototype.clear = function () {
                        this._frontBuffer.width = this._backBuffer.width = 1;
                        this._frontBuffer.width = this._backBuffer.width = 1;
                        this._bbScale = -1;
                        this._fbScale = -1;
                        this._promiseRunning = false;
                    };
                    PDFPage.CSS_UNITS = 96.0 / 72.0;
                    return PDFPage;
                }());
                canvas.PDFPage = PDFPage;
                var PDFTextElement = (function () {
                    function PDFTextElement(angle, size, fontSize, text, pos, fontFamily, pageHref) {
                        this.angle = angle;
                        this.size = size;
                        this.fontSize = fontSize;
                        this.text = text;
                        this.fontFamily = fontFamily;
                        this.pageHref = pageHref;
                        this.fromBottomLeft = false;
                        this.pos = new Position2D(pos.x, pos.y - fontSize);
                    }
                    PDFTextElement.prototype.toString = function () {
                        return this.pageHref.toString + "-" + this.pos.toString() + "-" + this.text.toString() + "-" + this.angle.toString();
                    };
                    return PDFTextElement;
                }());
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
            var MyCoRePDFViewerComponent = (function (_super) {
                __extends(MyCoRePDFViewerComponent, _super);
                function MyCoRePDFViewerComponent(_settings, container) {
                    var _this = this;
                    _super.call(this);
                    this._settings = _settings;
                    this.container = container;
                    this._structure = null;
                    this._pageCache = new MyCoReMap();
                    this._errorModalSynchronize = Utils.synchronize([function (context) {
                            return context._languageModel != null && context.error;
                        }], function (context) {
                        var errorText = context._languageModel.getFormatedTranslation("noPDF", "<a href='mailto:"
                            + _this._settings.adminMail + "'>" + _this._settings.adminMail + "</a>");
                        var messageBoxTitle = context._languageModel.getTranslation("noPDFShort");
                        new mycore.viewer.widgets.modal.ViewerErrorModal(_this._settings.mobile, messageBoxTitle, errorText, _this._settings.webApplicationBaseURL + "/modules/iview2/img/sad-emotion-egg.jpg", _this.container[0]).show();
                        context.trigger(new mycore.viewer.components.events.ShowContentEvent(_this, jQuery(), mycore.viewer.widgets.layout.IviewBorderLayout.DIRECTION_WEST, 0));
                    });
                    this.error = false;
                    this.toolbarLanguageSync = Utils.synchronize([function (_self) { return _self._toolbarModel != null; }, function (_self) { return _self._languageModel != null; }], function (_self) {
                        _self.addDownloadButton();
                    });
                    this._toolbarModel = null;
                    this._languageModel = null;
                    var that = this;
                    PDFJS.disableAutoFetch = true;
                }
                MyCoRePDFViewerComponent.prototype.init = function () {
                    var _this = this;
                    if (this._settings.doctype == "pdf") {
                        this._pdfUrl = ViewerFormatString(this._settings.pdfProviderURL, { filePath: this._settings.filePath, derivate: this._settings.derivate });
                        var workerURL = this._settings.pdfWorkerURL;
                        PDFJS.workerSrc = workerURL;
                        var that = this;
                        var pdfLocation = this._pdfUrl;
                        PDFJS.getDocument(pdfLocation).then(function (pdfDoc) {
                            _this._pdfDocument = pdfDoc;
                            that._structureBuilder = new mycore.viewer.widgets.pdf.PDFStructureBuilder(that._pdfDocument, _this._settings.filePath);
                            var promise = that._structureBuilder.resolve();
                            promise.then(function (structure) {
                                that._structure = structure;
                                var smle = new components.events.StructureModelLoadedEvent(that, that._structure);
                                that._structureModelLoadedEvent = smle;
                                that._pageCount = structure._imageList.length;
                                that.trigger(smle);
                            });
                            promise.onreject(function (err) {
                                _this.error = true;
                                _this._errorModalSynchronize(_this);
                            });
                        }, function (errorReason) {
                            console.log("error");
                        });
                        this.trigger(new components.events.WaitForEvent(this, components.events.ProvideToolbarModelEvent.TYPE));
                        this.trigger(new components.events.WaitForEvent(this, components.events.LanguageModelLoadedEvent.TYPE));
                    }
                };
                MyCoRePDFViewerComponent.prototype.handle = function (e) {
                    var _this = this;
                    if (e.type == components.events.RequestPageEvent.TYPE) {
                        var rpe = e;
                        var pageID = rpe._pageId;
                        if (!this._pageCache.has(Number(pageID))) {
                            var promise = this._pdfDocument.getPage(Number(pageID));
                            promise.then(function (page) {
                                var pdfPage = new viewer.widgets.canvas.PDFPage(rpe._pageId, page, _this._structureBuilder);
                                _this._pageCache.set(Number(rpe._pageId), pdfPage);
                                rpe._onResolve(rpe._pageId, pdfPage);
                            }, function (reason) {
                                console.error("PDF Page Request rejected");
                                console.error("Reason: " + reason);
                            });
                        }
                        else {
                            rpe._onResolve(pageID, this._pageCache.get(Number(pageID)));
                        }
                    }
                    if (e.type == components.events.RequestTextContentEvent.TYPE) {
                        var rtce = e;
                        this.handle(new components.events.RequestPageEvent(this, rtce._href, function (pageId, abstractPage) {
                            var page = abstractPage;
                            page.resolveTextContent(function (tc) {
                                rtce._onResolve(rtce._href, tc);
                            });
                        }));
                    }
                    if (e.type == components.events.ProvideToolbarModelEvent.TYPE) {
                        var ptme = e;
                        this._toolbarModel = ptme.model;
                        this.toolbarLanguageSync(this);
                    }
                    if (e.type == components.events.LanguageModelLoadedEvent.TYPE) {
                        var lmle = e;
                        this._languageModel = lmle.languageModel;
                        this.toolbarLanguageSync(this);
                        this._errorModalSynchronize(this);
                    }
                    if (e.type == viewer.widgets.toolbar.events.ButtonPressedEvent.TYPE) {
                        var bpe = e;
                        if (bpe.button.id == "PdfDownloadButton") {
                            window.location.assign(this._pdfUrl + "?dl");
                        }
                    }
                    return;
                };
                Object.defineProperty(MyCoRePDFViewerComponent.prototype, "handlesEvents", {
                    get: function () {
                        if (this._settings.doctype == "pdf") {
                            return [components.events.RequestPageEvent.TYPE, components.events.ProvideToolbarModelEvent.TYPE, components.events.LanguageModelLoadedEvent.TYPE, viewer.widgets.toolbar.events.ButtonPressedEvent.TYPE, components.events.RequestTextContentEvent.TYPE];
                        }
                        return [];
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoRePDFViewerComponent.prototype.addDownloadButton = function () {
                    this._toolbarModel._actionControllGroup.addComponent(new mycore.viewer.widgets.toolbar.ToolbarButton("PdfDownloadButton", "", this._languageModel.getTranslation("toolbar.pdfDownload"), "download"));
                };
                return MyCoRePDFViewerComponent;
            }(components.ViewerComponent));
            components.MyCoRePDFViewerComponent = MyCoRePDFViewerComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoRePDFViewerComponent);
console.log("PDF MODULE");

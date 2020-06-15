var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var model;
        (function (model) {
            var MyCoReDesktopToolbarModel = (function (_super) {
                __extends(MyCoReDesktopToolbarModel, _super);
                function MyCoReDesktopToolbarModel(name) {
                    if (name === void 0) { name = "MyCoReDesktopToolbar"; }
                    _super.call(this, name);
                }
                MyCoReDesktopToolbarModel.prototype.addComponents = function () {
                    this._viewSelectGroup = new viewer.widgets.toolbar.ToolbarGroup("viewSelectGroup");
                    this.addGroup(this._sidebarControllGroup);
                    this.addGroup(this._zoomControllGroup);
                    this.addGroup(this._layoutControllGroup);
                    this.addGroup(this._viewSelectGroup);
                    this.addGroup(this._imageChangeControllGroup);
                    this.addGroup(this._actionControllGroup);
                    this.addGroup(this._closeViewerGroup);
                    this.addGroup(this._searchGroup);
                };
                MyCoReDesktopToolbarModel.prototype.addViewSelectButton = function () {
                    this.viewSelectChilds = new Array();
                    this.viewSelectChilds.push({
                        id: "imageView",
                        label: "imageView"
                    });
                    this.viewSelectChilds.push({
                        id: "mixedView",
                        label: "mixedView"
                    });
                    this.viewSelectChilds.push({
                        id: "textView",
                        label: "textView"
                    });
                    this.viewSelect = new viewer.widgets.toolbar.ToolbarDropdownButton("viewSelect", "viewSelect", this.viewSelectChilds, "eye-open");
                    this._viewSelectGroup.addComponent(this.viewSelect);
                };
                MyCoReDesktopToolbarModel.prototype.addSelectionSwitchButton = function () {
                    this.selectionSwitchButton = new viewer.widgets.toolbar.ToolbarButton("selectionSwitchButton", "", "");
                    this.selectionSwitchButton.icon = "text-width";
                };
                return MyCoReDesktopToolbarModel;
            }(model.MyCoReBasicToolbarModel));
            model.MyCoReDesktopToolbarModel = MyCoReDesktopToolbarModel;
        })(model = viewer.model || (viewer.model = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReDesktopToolbarProviderComponent = (function (_super) {
                __extends(MyCoReDesktopToolbarProviderComponent, _super);
                function MyCoReDesktopToolbarProviderComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                }
                Object.defineProperty(MyCoReDesktopToolbarProviderComponent.prototype, "handlesEvents", {
                    get: function () {
                        return [];
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReDesktopToolbarProviderComponent.prototype.init = function () {
                    this.trigger(new components.events.ProvideToolbarModelEvent(this, new mycore.viewer.model.MyCoReDesktopToolbarModel()));
                };
                return MyCoReDesktopToolbarProviderComponent;
            }(components.ViewerComponent));
            components.MyCoReDesktopToolbarProviderComponent = MyCoReDesktopToolbarProviderComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReDesktopToolbarProviderComponent);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReImageInformationComponent = (function (_super) {
                __extends(MyCoReImageInformationComponent, _super);
                function MyCoReImageInformationComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this._currentZoom = -1;
                    this._currentRotation = -1;
                }
                MyCoReImageInformationComponent.prototype.init = function () {
                    this._informationBar = jQuery("<div></div>");
                    this._informationBar.addClass("informationBar");
                    this._scale = jQuery("<span></span>");
                    this._scale.addClass("scale");
                    this._scale.appendTo(this._informationBar);
                    this._scaleEditForm = jQuery("<div class='form-group'></div>");
                    this._scaleEdit = jQuery("<input type='text'>");
                    this._scaleEdit.addClass("scale form-control");
                    this._scaleEdit.appendTo(this._scaleEditForm);
                    this.initScaleChangeLogic();
                    this._informationBar.addClass("well");
                    this._imageLabel = jQuery("<span></span>");
                    this._imageLabel.addClass("imageLabel");
                    this._imageLabel.appendTo(this._informationBar);
                    this._imageLabel.mousedown(Utils.stopPropagation).mousemove(Utils.stopPropagation).mouseup(Utils.stopPropagation);
                    this._rotation = jQuery("<span>0 °</span>");
                    this._rotation.addClass("rotation");
                    this._rotation.appendTo(this._informationBar);
                    this.trigger(new components.events.ComponentInitializedEvent(this));
                    this.trigger(new components.events.ShowContentEvent(this, this._informationBar, components.events.ShowContentEvent.DIRECTION_SOUTH, 30));
                    this.trigger(new components.events.WaitForEvent(this, components.events.PageLayoutChangedEvent.TYPE));
                    this.trigger(new components.events.WaitForEvent(this, components.events.ImageChangedEvent.TYPE));
                    this.trigger(new components.events.WaitForEvent(this, components.events.ViewportInitializedEvent.TYPE));
                    this.trigger(new components.events.WaitForEvent(this, components.events.StructureModelLoadedEvent.TYPE));
                };
                MyCoReImageInformationComponent.prototype.initScaleChangeLogic = function () {
                    var _this = this;
                    this._scale.click(function () {
                        _this._scale.detach();
                        _this._scaleEdit.val(_this._pageLayout.getCurrentPageZoom() * 100 + "");
                        _this._scaleEdit.appendTo(_this._informationBar);
                        Utils.selectElementText(_this._scaleEdit.get(0));
                        _this._scaleEdit.keyup(function (ev) {
                            var isValid = _this.validateScaleEdit();
                            if (ev.keyCode == 13) {
                                if (isValid) {
                                    _this.applyNewZoom();
                                    _this.endEdit();
                                }
                            }
                            else if (ev.keyCode == 27) {
                                _this.endEdit();
                            }
                        });
                    });
                };
                MyCoReImageInformationComponent.prototype.endEdit = function () {
                    this._scaleEdit.remove();
                    this._scale.appendTo(this._informationBar);
                };
                MyCoReImageInformationComponent.prototype.applyNewZoom = function () {
                    var zoom = this._scaleEdit.val().trim();
                    if (typeof this._pageLayout != "undefined" && this._pageLayout != null) {
                        this._pageLayout.setCurrentPageZoom(zoom / 100);
                    }
                };
                MyCoReImageInformationComponent.prototype.validateScaleEdit = function () {
                    var zoom = this._scaleEdit.val().trim();
                    if (isNaN(zoom)) {
                        this._scaleEdit.addClass("error");
                        return false;
                    }
                    var zoomNumber = (zoom * 1);
                    if (zoomNumber < 50 || zoomNumber > 400) {
                        this._scaleEdit.addClass("error");
                        return false;
                    }
                    this._scaleEdit.removeClass("error");
                    return true;
                };
                Object.defineProperty(MyCoReImageInformationComponent.prototype, "handlesEvents", {
                    get: function () {
                        var handles = new Array();
                        handles.push(components.events.ImageChangedEvent.TYPE);
                        handles.push(components.events.StructureModelLoadedEvent.TYPE);
                        handles.push(components.events.ViewportInitializedEvent.TYPE);
                        handles.push(components.events.PageLayoutChangedEvent.TYPE);
                        return handles;
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReImageInformationComponent.prototype.handle = function (e) {
                    var _this = this;
                    if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                        this.updateLayoutInformation();
                    }
                    if (e.type == components.events.ViewportInitializedEvent.TYPE) {
                        var vie = e;
                        vie.viewport.scaleProperty.addObserver({
                            propertyChanged: function (oldScale, newScale) {
                                _this.updateLayoutInformation();
                            }
                        });
                        vie.viewport.rotationProperty.addObserver({
                            propertyChanged: function (oldRotation, newRotation) {
                                _this.updateLayoutInformation();
                            }
                        });
                        vie.viewport.positionProperty.addObserver({
                            propertyChanged: function (oldPos, newPos) {
                                _this.updateLayoutInformation();
                            }
                        });
                        vie.viewport.sizeProperty.addObserver({
                            propertyChanged: function (oldSize, newSize) {
                                _this.updateLayoutInformation();
                            }
                        });
                    }
                    if (e.type == components.events.PageLayoutChangedEvent.TYPE) {
                        var plce = e;
                        this._pageLayout = plce.pageLayout;
                        this.updateLayoutInformation();
                    }
                    if (e.type == components.events.ImageChangedEvent.TYPE) {
                        var imageChangedEvent = e;
                        if (typeof imageChangedEvent.image != "undefined" && imageChangedEvent.image != null) {
                            var text = imageChangedEvent.image.orderLabel || imageChangedEvent.image.order;
                            if (imageChangedEvent.image.uniqueIdentifier != null) {
                                text += " - " + imageChangedEvent.image.uniqueIdentifier;
                            }
                            this._imageLabel.text(text);
                        }
                        this.updateLayoutInformation();
                    }
                };
                MyCoReImageInformationComponent.prototype.updateLayoutInformation = function () {
                    if (typeof this._pageLayout != "undefined") {
                        var currentPageZoom = this._pageLayout.getCurrentPageZoom();
                        if (this._currentZoom != currentPageZoom) {
                            this._scale.text(Math.round(currentPageZoom * 100) + "%");
                            this._currentZoom = currentPageZoom;
                        }
                        var currentPageRotation = this._pageLayout.getCurrentPageRotation();
                        if (this._currentRotation != currentPageRotation) {
                            this._rotation.text(currentPageRotation + " °");
                            this._currentRotation = currentPageRotation;
                        }
                    }
                };
                Object.defineProperty(MyCoReImageInformationComponent.prototype, "container", {
                    get: function () {
                        return this._informationBar;
                    },
                    enumerable: true,
                    configurable: true
                });
                return MyCoReImageInformationComponent;
            }(components.ViewerComponent));
            components.MyCoReImageInformationComponent = MyCoReImageInformationComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReImageInformationComponent);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var canvas;
            (function (canvas) {
                var DoublePageLayout = (function (_super) {
                    __extends(DoublePageLayout, _super);
                    function DoublePageLayout() {
                        _super.apply(this, arguments);
                        this._rotation = 0;
                        this._currentPage = 0;
                    }
                    Object.defineProperty(DoublePageLayout.prototype, "relocated", {
                        get: function () {
                            return false;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    DoublePageLayout.prototype.syncronizePages = function () {
                        var _this = this;
                        var vp = this._pageController.viewport;
                        var pageSizeWithSpace = this.getPageHeightWithSpace();
                        var rowCount = this._model.pageCount / 2;
                        this.correctViewport();
                        var widthMultiplicator = (this._rotation == 90 || this._rotation == 270) ? 1 : 2;
                        var widthDivisor = (widthMultiplicator == 1) ? 2 : 1;
                        this._horizontalScrollbar.areaSize = this._pageDimension.width * widthMultiplicator;
                        this._verticalScrollbar.areaSize = rowCount * this.getPageHeightWithSpace();
                        this._horizontalScrollbar.viewSize = this._pageController.viewport.size.width / this._pageController.viewport.scale;
                        this._verticalScrollbar.viewSize = this._pageController.viewport.size.height / this._pageController.viewport.scale;
                        this._horizontalScrollbar.position = vp.position.x - (vp.size.width / vp.scale / 2) + (this._pageDimension.width / widthDivisor);
                        this._verticalScrollbar.position = vp.position.y - (vp.size.height / vp.scale / 2);
                        var pagesPerLine = 2;
                        var vpSizeInArea = vp.size.height / vp.scale;
                        var yStart = vp.position.y - (vpSizeInArea / 2);
                        var yEnd = vp.position.y + (vpSizeInArea / 2);
                        var yStartOrder = Math.floor(yStart / pageSizeWithSpace) * pagesPerLine;
                        var yEndOrder = Math.ceil(yEnd / pageSizeWithSpace) * pagesPerLine + (this.relocated ? 1 : 0);
                        var pagesToCheck = this._insertedPages.slice(0);
                        for (var y = yStartOrder; y <= yEndOrder; y++) {
                            if (this._model.children.has(y) && pagesToCheck.indexOf(y) == -1) {
                                pagesToCheck.push(y);
                            }
                            else if (0 < y && y <= this._model.pageCount) {
                                this._pageLoader(y);
                            }
                        }
                        pagesToCheck.forEach(function (img) {
                            _this.updatePage(img);
                        });
                    };
                    DoublePageLayout.prototype.clear = function () {
                        var _this = this;
                        var pages = this._pageController.getPages().slice(0);
                        this._insertedPages.splice(0, this._insertedPages.length);
                        pages.forEach(function (p) {
                            _this._pageController.removePage(p);
                        });
                    };
                    DoublePageLayout.prototype.fitToScreen = function () {
                        var vp = this._pageController.viewport;
                        if (vp.size.width != 0 && vp.size.height != 0) {
                            var dpRect = this.getDoublePageRect(this.getCurrentPage());
                            vp.setRect(dpRect);
                        }
                    };
                    DoublePageLayout.prototype.calculatePageAreaInformation = function (order) {
                        var imgSize = this._model.children.get(order).size;
                        var pai = new widgets.canvas.PageAreaInformation();
                        var pr = this.getPageRect(order);
                        var page = this._model.children.get(order);
                        pai.scale = Math.min(this._originalPageDimension.width / imgSize.width, this._originalPageDimension.height / imgSize.height);
                        var realPageDimension = page.size.scale(pai.scale);
                        pai.position = new Position2D(pr.pos.x + realPageDimension.width / 2, pr.pos.y + realPageDimension.height / 2);
                        pai.rotation = this._rotation;
                        return pai;
                    };
                    DoublePageLayout.prototype.checkShouldBeInserted = function (order) {
                        var vpRect = this._pageController.viewport.asRectInArea();
                        var imagePos = this.getImageMiddle(order);
                        var imageRect = new Rect(new Position2D(imagePos.x - (this._pageDimension.width), imagePos.y - (this._pageDimension.height / 2)), new Size2D(this._pageDimension.width * 2, this._pageDimension.height));
                        return vpRect.getIntersection(imageRect) != null || this.getCurrentOverview().getIntersection(imageRect) != null;
                    };
                    DoublePageLayout.prototype.fitToWidth = function (attop) {
                        if (attop === void 0) { attop = false; }
                        var pr = this.getDoublePageRect(this.getCurrentPage());
                        this._pageController.viewport.position = pr.getMiddlePoint();
                        this._pageController.viewport.scale = this._pageController.viewport.size.width / pr.size.width;
                    };
                    DoublePageLayout.prototype.getCurrentPage = function () {
                        var pagesPerLine = 2;
                        var vp = this._pageController.viewport;
                        var pageSizeWithSpace = this.getPageHeightWithSpace();
                        var rowCount = this._model.pageCount / 2;
                        var vpSizeInArea = vp.size.height / vp.scale;
                        var yStart = vp.position.y - (vpSizeInArea / 2);
                        var yEnd = vp.position.y + (vpSizeInArea / 2);
                        var yStartOrder = Math.floor(yStart / pageSizeWithSpace) * pagesPerLine;
                        var yEndOrder = Math.ceil(yEnd / pageSizeWithSpace) * pagesPerLine + (this.relocated ? 1 : 0);
                        var maxPage = -1;
                        var maxCount = -1;
                        var maxIsMiddle = false;
                        var vpRect = vp.asRectInArea();
                        for (var y = yStartOrder; y <= yEndOrder; y++) {
                            var curRect = this.getPageRect(y).getIntersection(vpRect);
                            if (curRect != null && (!maxIsMiddle || y == this._currentPage)) {
                                var curCount = curRect.size.getSurface();
                                if (maxCount < curCount) {
                                    maxPage = y;
                                    maxCount = curCount;
                                    if (curRect.intersects(vp.position)) {
                                        maxIsMiddle = true;
                                    }
                                }
                            }
                        }
                        return Math.max(-1, maxPage);
                    };
                    DoublePageLayout.prototype.jumpToPage = function (order) {
                        var middle = this.getImageMiddle(order);
                        this._currentPage = order;
                        this._pageController.viewport.setRect(this.getPageRect(order));
                    };
                    DoublePageLayout.prototype.getPageHeightSpace = function () {
                        return ((this._pageDimension.height / 100) * 10);
                    };
                    DoublePageLayout.prototype.getPageHeightWithSpace = function () {
                        var rotationMultiplicator = (this._rotation == 90 || this._rotation == 270) ? 2 : 1;
                        return (this._pageDimension.height * rotationMultiplicator) + this.getPageHeightSpace();
                    };
                    DoublePageLayout.prototype.getImageMiddle = function (order) {
                        var pageRect = this.getPageRect(order);
                        return pageRect.getMiddlePoint();
                    };
                    DoublePageLayout.prototype.correctViewport = function () {
                        var vp = this._pageController.viewport;
                        var widthMultiplicator = (this._rotation == 90 || this._rotation == 270) ? 1 : 2;
                        var pageScaling = this.getCurrentPageScaling();
                        if (pageScaling != -1) {
                            var minWidthScale = this._pageController.viewport.size.width / (this._pageDimension.width * widthMultiplicator);
                            var minScale = Math.min(this._pageController.viewport.size.height / (this._pageDimension.height * 2), minWidthScale);
                            if (vp.scale < minScale) {
                                vp.stopAnimation();
                                vp.scale = minScale;
                            }
                            var completeScale = vp.scale * pageScaling;
                            if (completeScale > 4) {
                                vp.stopAnimation();
                                vp.scale = 4 / pageScaling;
                            }
                        }
                        var scaledViewport = vp.size.scale(1 / vp.scale);
                        var minY = 1;
                        var maxY = this._model.pageCount / 2 * this.getPageHeightWithSpace();
                        var correctedY = Math.min(Math.max(vp.position.y, minY), maxY);
                        if (scaledViewport.width > (this._pageDimension.width * widthMultiplicator)) {
                            var corrected = new Position2D(0, correctedY);
                            if (!vp.position.equals(corrected)) {
                                vp.position = new Position2D(0, correctedY);
                            }
                        }
                        else {
                            var minimalX = -this._pageDimension.width + scaledViewport.width / 2;
                            var maximalX = this._pageDimension.width - scaledViewport.width / 2;
                            var correctedX = Math.max(minimalX, Math.min(maximalX, vp.position.x));
                            var corrected = new Position2D(correctedX, correctedY);
                            if (!vp.position.equals(corrected)) {
                                vp.position = corrected;
                            }
                        }
                    };
                    DoublePageLayout.prototype.scrollhandler = function () {
                        if (this._pageController.viewport.currentAnimation == null) {
                            var widthDivisor = (this._rotation == 90 || this._rotation == 270) ? 2 : 1;
                            var vp = this._pageController.viewport;
                            var scrollPos = new Position2D(this._horizontalScrollbar.position, this._verticalScrollbar.position);
                            var xPos = scrollPos.x + (vp.size.width / vp.scale / 2) - (this._pageDimension.width / widthDivisor);
                            vp.position = new Position2D(xPos, scrollPos.y + (vp.size.height / vp.scale / 2));
                        }
                    };
                    DoublePageLayout.prototype.rotate = function (deg) {
                        var currentPage = this.getCurrentPage();
                        this._pageDimension = this._originalPageDimension.getRotated(deg);
                        this._rotation = deg;
                        this.clear();
                        this.syncronizePages();
                        this.jumpToPage(currentPage);
                    };
                    DoublePageLayout.prototype.getLabelKey = function () {
                        return "doublePageLayout";
                    };
                    DoublePageLayout.prototype.getCurrentOverview = function () {
                        var doublePageRect = this.getDoublePageRect(this.getCurrentPage());
                        return doublePageRect;
                    };
                    DoublePageLayout.prototype.getDoublePageRect = function (order) {
                        var row = Math.floor(((order - 1) + (this.relocated ? 1 : 0)) / 2);
                        var firstPage = (order - 1 + (this.relocated ? 1 : 0)) % 2 == 0;
                        var start;
                        if (firstPage) {
                            start = order;
                        }
                        else {
                            start = order - 1;
                        }
                        var p1Rect = this.getPageRect(start);
                        var p2Rect = this.getPageRect(start + 1);
                        var bounding = Rect.getBounding(p1Rect, p2Rect);
                        return bounding;
                    };
                    DoublePageLayout.prototype.getPageRect = function (order) {
                        var row = Math.floor(((order - 1) + (this.relocated ? 1 : 0)) / 2);
                        var firstPage = (order - 1 + (this.relocated ? 1 : 0)) % 2 == 0;
                        var pageDimension = this.getRealPageDimension(order);
                        var yPos = (row * this.getPageHeightWithSpace());
                        switch (this._rotation) {
                            case 0:
                            case 180:
                                if (this._rotation == 0 ? firstPage : !firstPage) {
                                    return new Rect(new Position2D(-pageDimension.width, yPos), pageDimension);
                                }
                                else {
                                    return new Rect(new Position2D(0, yPos), pageDimension);
                                }
                            case 90:
                            case 270:
                                if (this._rotation == 90 ? firstPage : !firstPage) {
                                    return new Rect(new Position2D(-pageDimension.width / 2, yPos - (pageDimension.height / 2)), pageDimension);
                                }
                                else {
                                    return new Rect(new Position2D(-pageDimension.width / 2, yPos + (this._pageDimension.height) - (pageDimension.height / 2)), pageDimension);
                                }
                        }
                    };
                    DoublePageLayout.prototype.next = function () {
                        var page = this.getCurrentPage();
                        var firstPage = (page - 1 + (this.relocated ? 1 : 0)) % 2 == 0 && (this._rotation == 0 || this._rotation == 180);
                        var nextPage = Math.max(Math.min(page + (firstPage ? 2 : 1), this._model.pageCount), 0);
                        this.jumpToPage(nextPage);
                    };
                    DoublePageLayout.prototype.previous = function () {
                        var page = this.getCurrentPage();
                        var firstPage = (page - 1 + (this.relocated ? 1 : 0)) % 2 == 0 && (this._rotation == 0 || this._rotation == 180);
                        var previousPage = Math.max(Math.min(page - (firstPage ? 1 : 2), this._model.pageCount), 0);
                        this.jumpToPage(previousPage);
                    };
                    DoublePageLayout.prototype.getCurrentPageRotation = function () {
                        return this._rotation;
                    };
                    DoublePageLayout.prototype.getCurrentPageZoom = function () {
                        var scaling = this.getCurrentPageScaling();
                        if (scaling !== -1) {
                            return this._pageController.viewport.scale * scaling;
                        }
                        return this._pageController.viewport.scale;
                    };
                    DoublePageLayout.prototype.setCurrentPageZoom = function (zoom) {
                        if (typeof this._pageController == "undefined") {
                            return;
                        }
                        var scaling = this.getCurrentPageScaling();
                        this._pageController.viewport.scale = zoom / scaling;
                    };
                    DoublePageLayout.prototype.getCurrentPageScaling = function () {
                        if (typeof this._model == "undefined") {
                            return -1;
                        }
                        var pageNumber = this.getCurrentPage();
                        if (pageNumber != -1 && this._model.children.has(pageNumber)) {
                            var page = this._model.children.get(pageNumber);
                            var pageArea = this._pageController.getPageAreaInformation(page);
                            if (typeof pageArea != "undefined") {
                                return pageArea.scale;
                            }
                        }
                        return -1;
                    };
                    DoublePageLayout.prototype.setCurrentPositionInPage = function (pos) {
                        var vpRect = this._pageController.viewport.asRectInArea();
                        var page = this.getCurrentPage();
                        var middle = this.getImageMiddle(page);
                        var pageSize = this._pageDimension;
                        var pagePos = new Position2D(middle.x - (pageSize.width / 2), middle.y - (pageSize.height / 2));
                        this._pageController.viewport.position = new Position2D(pagePos.x + pos.x + (vpRect.size.width / 2), pagePos.y + pos.y + (vpRect.size.height / 2));
                    };
                    return DoublePageLayout;
                }(canvas.PageLayout));
                canvas.DoublePageLayout = DoublePageLayout;
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
            var canvas;
            (function (canvas) {
                var DoublePageRelocatedLayout = (function (_super) {
                    __extends(DoublePageRelocatedLayout, _super);
                    function DoublePageRelocatedLayout() {
                        _super.apply(this, arguments);
                    }
                    Object.defineProperty(DoublePageRelocatedLayout.prototype, "relocated", {
                        get: function () {
                            return true;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    DoublePageRelocatedLayout.prototype.getLabelKey = function () {
                        return "doublePageRelocatedLayout";
                    };
                    return DoublePageRelocatedLayout;
                }(canvas.DoublePageLayout));
                canvas.DoublePageRelocatedLayout = DoublePageRelocatedLayout;
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
            var MyCoRePageDesktopLayoutProviderComponent = (function (_super) {
                __extends(MyCoRePageDesktopLayoutProviderComponent, _super);
                function MyCoRePageDesktopLayoutProviderComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                }
                Object.defineProperty(MyCoRePageDesktopLayoutProviderComponent.prototype, "handlesEvents", {
                    get: function () {
                        return [];
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoRePageDesktopLayoutProviderComponent.prototype.init = function () {
                    this.trigger(new components.events.ProvidePageLayoutEvent(this, new viewer.widgets.canvas.SinglePageLayout(), true));
                    this.trigger(new components.events.ProvidePageLayoutEvent(this, new viewer.widgets.canvas.DoublePageLayout()));
                    this.trigger(new components.events.ProvidePageLayoutEvent(this, new viewer.widgets.canvas.DoublePageRelocatedLayout()));
                };
                return MyCoRePageDesktopLayoutProviderComponent;
            }(components.ViewerComponent));
            components.MyCoRePageDesktopLayoutProviderComponent = MyCoRePageDesktopLayoutProviderComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoRePageDesktopLayoutProviderComponent);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var model;
        (function (model_1) {
            var MyCoReViewerSearcher = (function () {
                function MyCoReViewerSearcher() {
                }
                MyCoReViewerSearcher.prototype.index = function (model, textContentResolver, processIndicator) {
                    this.model = model;
                    this.textContentResolver = textContentResolver;
                    this.processIndicator = processIndicator;
                };
                MyCoReViewerSearcher.prototype.search = function (query, resultReporter, searchCompleteCallback, count, start) {
                    throw new ViewerError(this + " doesnt implements search();", { "searchMethod": this.search });
                };
                return MyCoReViewerSearcher;
            }());
            model_1.MyCoReViewerSearcher = MyCoReViewerSearcher;
            var ResultObject = (function () {
                function ResultObject(arr, matchWords, context) {
                    this.arr = arr;
                    this.matchWords = matchWords;
                    this.context = context;
                }
                return ResultObject;
            }());
            model_1.ResultObject = ResultObject;
        })(model = viewer.model || (viewer.model = {}));
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
                var ProvideViewerSearcherEvent = (function (_super) {
                    __extends(ProvideViewerSearcherEvent, _super);
                    function ProvideViewerSearcherEvent(component, _searcher) {
                        _super.call(this, component, ProvideViewerSearcherEvent.TYPE);
                        this._searcher = _searcher;
                    }
                    Object.defineProperty(ProvideViewerSearcherEvent.prototype, "searcher", {
                        get: function () {
                            return this._searcher;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    ProvideViewerSearcherEvent.TYPE = "ProvideViewerSearcherEvent";
                    return ProvideViewerSearcherEvent;
                }(events.MyCoReImageViewerEvent));
                events.ProvideViewerSearcherEvent = ProvideViewerSearcherEvent;
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
            var canvas;
            (function (canvas) {
                var SearchResultCanvasPageLayer = (function () {
                    function SearchResultCanvasPageLayer() {
                        this.selected = [];
                        this.areas = new MyCoReMap();
                    }
                    SearchResultCanvasPageLayer.prototype.select = function (page, rect) {
                        this.selected.push(new PageArea(page, rect));
                    };
                    SearchResultCanvasPageLayer.prototype.add = function (page, rect) {
                        var pageAreas = this.areas.get(page);
                        if (pageAreas == null) {
                            pageAreas = new Array();
                            this.areas.set(page, pageAreas);
                        }
                        pageAreas.push(new PageArea(page, rect));
                    };
                    SearchResultCanvasPageLayer.prototype.clear = function () {
                        this.selected = [];
                        this.areas.clear();
                    };
                    SearchResultCanvasPageLayer.prototype.clearSelected = function () {
                        this.selected = [];
                    };
                    SearchResultCanvasPageLayer.prototype.draw = function (ctx, id, pageSize, drawOnHtml) {
                        var _this = this;
                        if (drawOnHtml === void 0) { drawOnHtml = false; }
                        this.selected.forEach(function (area) {
                            if (_this.selected != null && id === area.page) {
                                _this.drawWithPadding(ctx, [area], pageSize);
                            }
                        });
                        this.areas.hasThen(id, function (areas) {
                            _this.drawWords(ctx, areas);
                        });
                    };
                    SearchResultCanvasPageLayer.prototype.drawWithPadding = function (ctx, pageAreas, pageSize) {
                        ctx.save();
                        {
                            ctx.strokeStyle = "rgba(244, 244, 66, 0.8)";
                            var lineWidth_1 = Math.max(pageSize.width / 200, pageSize.height / 200) * window.devicePixelRatio;
                            ctx.lineWidth = lineWidth_1;
                            ctx.beginPath();
                            pageAreas.forEach(function (word) {
                                var x = word.rect.getX() - lineWidth_1 / 2;
                                var y = word.rect.getY() - lineWidth_1 / 2;
                                var width = word.rect.getWidth() + lineWidth_1;
                                var height = word.rect.getHeight() + lineWidth_1;
                                ctx.rect(x, y, width, height);
                            });
                            ctx.closePath();
                            ctx.stroke();
                        }
                        ctx.restore();
                    };
                    SearchResultCanvasPageLayer.prototype.drawWords = function (ctx, pageAreas) {
                        ctx.save();
                        {
                            ctx.fillStyle = "rgba(179,216,253,0.6)";
                            ctx.beginPath();
                            pageAreas.forEach(function (area) {
                                ctx.rect(area.rect.getX(), area.rect.getY(), area.rect.getWidth(), area.rect.getHeight());
                            });
                            ctx.closePath();
                            ctx.fill();
                        }
                        ctx.restore();
                    };
                    return SearchResultCanvasPageLayer;
                }());
                canvas.SearchResultCanvasPageLayer = SearchResultCanvasPageLayer;
                var PageArea = (function () {
                    function PageArea(page, rect) {
                        this.page = page;
                        this.rect = rect;
                    }
                    return PageArea;
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
            var MyCoReSearchComponent = (function (_super) {
                __extends(MyCoReSearchComponent, _super);
                function MyCoReSearchComponent(_settings) {
                    var _this = this;
                    _super.call(this);
                    this._settings = _settings;
                    this._sidebarLabel = jQuery("<span>Suche</span>");
                    this._model = null;
                    this._valueToApply = null;
                    this._containerVisible = false;
                    this._indexPrepared = false;
                    this._indexPreparing = false;
                    this._textPresent = false;
                    this._toolbarTextInput = new viewer.widgets.toolbar.ToolbarTextInput("search", "", "");
                    this._searcher = null;
                    this._imageHrefImageMap = new MyCoReMap();
                    this._searchResultCanvasPageLayer = new viewer.widgets.canvas.SearchResultCanvasPageLayer();
                    this._containerVisibleModelLoadedSync = Utils.synchronize([
                        function (_self) { return _self._model != null; },
                        function (_self) { return _self._containerVisible; },
                        function (_self) { return _self._searcher != null; },
                        function (_self) { return !_this._indexPrepared && !_this._indexPreparing; }
                    ], function (_self) { return _self._prepareIndex(_self._model); });
                    this._toolbarLoadedLanguageModelLoadedSync = Utils.synchronize([
                        function (_self) { return _self._tbModel != null; },
                        function (_self) { return _self._languageModel != null; },
                        function (_self) { return _self._model != null; },
                        function (_self) { return _self._textPresent; }
                    ], function (_self) {
                        _this.trigger(new components.events.AddCanvasPageLayerEvent(_this, 1, _this._searchResultCanvasPageLayer));
                        var searchLabel = _self._languageModel.getTranslation("sidebar.search");
                        _this._toolbarTextInput.placeHolder = _self._languageModel.getTranslation("search.placeHolder");
                        _self._sidebarLabel.text(searchLabel);
                        _self._tbModel._searchGroup.addComponent(_this._toolbarTextInput);
                        if (_this._valueToApply != null) {
                            _this._toolbarTextInput.value = _this._valueToApply;
                            _this._valueToApply = null;
                        }
                    });
                    this._tbModel = null;
                    this._languageModel = null;
                    this._panel = null;
                    this._progressbar = null;
                    this._progressbarInner = null;
                    this._searchTextTimeout = -1;
                    this._searchAreaReady = false;
                }
                Object.defineProperty(MyCoReSearchComponent.prototype, "container", {
                    get: function () {
                        return this._container;
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReSearchComponent.prototype.initSearchArea = function () {
                    this._progressbar.parent().remove();
                    this._progressbar.remove();
                    this._container.css({ "text-align": "left" });
                    this._searchContainer = jQuery("<ul class='list-group textSearch'></ul>");
                    this._searchContainer.appendTo(this.container);
                    this._searchAreaReady = true;
                    this._search(this._toolbarTextInput.value);
                };
                MyCoReSearchComponent.prototype._search = function (str) {
                    var _this = this;
                    if (str == "") {
                        var direction = (this._settings.mobile) ? components.events.ShowContentEvent.DIRECTION_CENTER : components.events.ShowContentEvent.DIRECTION_EAST;
                        this.trigger(new components.events.ShowContentEvent(this, this._container, direction, 0, this._sidebarLabel));
                    }
                    this._searchContainer.children().remove();
                    var textContents = [];
                    this._searcher.search(str, function (searchResults) {
                        searchResults.forEach(function (results) {
                            results.arr.forEach(function (p) { return textContents.push(p); });
                        });
                        var lastClicked = null;
                        searchResults.forEach(function (results) {
                            if (results.arr.length <= 0) {
                                return;
                            }
                            var result = jQuery("<li class='list-group-item'></li>");
                            var link = jQuery("<a></a>").append(results.context.clone());
                            result.append(link);
                            _this._searchContainer.append(result);
                            var altoTextContent = results.arr[0];
                            if (!_this._imageHrefImageMap.has(altoTextContent.pageHref)) {
                                console.log("Could not find page " + altoTextContent.pageHref);
                                return;
                            }
                            var image = _this._imageHrefImageMap.get(altoTextContent.pageHref);
                            link.click(function () {
                                if (lastClicked != null) {
                                    lastClicked.removeClass("active");
                                    _this._searchResultCanvasPageLayer.clearSelected();
                                }
                                lastClicked = result;
                                result.addClass("active");
                                results.arr.forEach(function (context) {
                                    var areaRect = Rect.fromXYWH(context.pos.x, context.pos.y, context.size.width, context.size.height);
                                    _this._searchResultCanvasPageLayer.select(context.pageHref, areaRect);
                                });
                                _this.trigger(new components.events.ImageSelectedEvent(_this, image));
                                _this.trigger(new components.events.RedrawEvent(_this));
                            });
                            var page = jQuery("<span class='childLabel'>" + (image.orderLabel || image.order) + "</span>");
                            result.append(page);
                        });
                    }, function () {
                        _this._searchResultCanvasPageLayer.clear();
                        textContents.forEach(function (tc) {
                            var areaRect = Rect.fromXYWH(tc.pos.x, tc.pos.y, tc.size.width, tc.size.height);
                            _this._searchResultCanvasPageLayer.add(tc.pageHref, areaRect);
                        });
                        _this.trigger(new components.events.RedrawEvent(_this));
                    });
                };
                MyCoReSearchComponent.prototype.init = function () {
                    var _this = this;
                    this._container = jQuery("<div></div>");
                    this._container.css({ overflowY: "scroll", "text-align": "center" });
                    this._container.bind("iviewResize", function () {
                        _this.updateContainerSize();
                    });
                    this._panel = jQuery("<div class='panel search'></div>");
                    this._container.append(this._panel);
                    this._initProgressbar();
                    this._panel.append(this._progressbar);
                    this._toolbarTextInput.getProperty("value").addObserver({
                        propertyChanged: function (_old, _new) {
                            _this.openSearch();
                            if (_this._searchAreaReady) {
                                if (_this._searchTextTimeout != -1) {
                                    window.clearTimeout(_this._searchTextTimeout);
                                    _this._searchTextTimeout = -1;
                                }
                                _this._searchTextTimeout = window.setTimeout(function () {
                                    _this._search(_this._toolbarTextInput.value);
                                }, 300);
                            }
                        }
                    });
                    this.trigger(new components.events.WaitForEvent(this, components.events.ProvideViewerSearcherEvent.TYPE));
                    this.trigger(new components.events.WaitForEvent(this, components.events.StructureModelLoadedEvent.TYPE));
                    this.trigger(new components.events.WaitForEvent(this, components.events.ProvideToolbarModelEvent.TYPE));
                    this.trigger(new components.events.WaitForEvent(this, components.events.LanguageModelLoadedEvent.TYPE));
                    this.trigger(new components.events.WaitForEvent(this, components.events.RestoreStateEvent.TYPE));
                };
                MyCoReSearchComponent.prototype.updateContainerSize = function () {
                    this._container.css({ "height": (this._container.parent().height() - this._sidebarLabel.parent().outerHeight()) + "px" });
                };
                Object.defineProperty(MyCoReSearchComponent.prototype, "handlesEvents", {
                    get: function () {
                        var handleEvents = new Array();
                        handleEvents.push(components.events.StructureModelLoadedEvent.TYPE);
                        handleEvents.push(mycore.viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE);
                        handleEvents.push(components.events.ProvideToolbarModelEvent.TYPE);
                        handleEvents.push(components.events.LanguageModelLoadedEvent.TYPE);
                        handleEvents.push(components.events.ShowContentEvent.TYPE);
                        handleEvents.push(components.events.ProvideViewerSearcherEvent.TYPE);
                        handleEvents.push(components.events.RequestStateEvent.TYPE);
                        handleEvents.push(components.events.RestoreStateEvent.TYPE);
                        return handleEvents;
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReSearchComponent.prototype.handle = function (e) {
                    if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                        var smle = e;
                        this._model = smle.structureModel;
                        this._textPresent = smle.structureModel._textContentPresent;
                        this._toolbarLoadedLanguageModelLoadedSync(this);
                        this._containerVisibleModelLoadedSync(this);
                    }
                    if (e.type == mycore.viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE) {
                        var dropdownButtonPressedEvent = e;
                        if (dropdownButtonPressedEvent.childId == "search") {
                            this.openSearch();
                        }
                    }
                    if (e.type == components.events.ProvideToolbarModelEvent.TYPE) {
                        var ptme = e;
                        this._tbModel = ptme.model;
                        this._toolbarLoadedLanguageModelLoadedSync(this);
                    }
                    if (e.type == components.events.LanguageModelLoadedEvent.TYPE) {
                        var lmle = e;
                        this._languageModel = lmle.languageModel;
                        this._toolbarLoadedLanguageModelLoadedSync(this);
                    }
                    if (e.type == components.events.ShowContentEvent.TYPE) {
                        var sce = e;
                        if (sce.containerDirection == components.events.ShowContentEvent.DIRECTION_EAST && sce.content == this._container) {
                            if (sce.size == 0) {
                                this._searchResultCanvasPageLayer.clear();
                                this.trigger(new components.events.RedrawEvent(this));
                            }
                            else if (this._searchAreaReady && this._toolbarTextInput.value.length > 0) {
                                this._search(this._toolbarTextInput.value);
                            }
                        }
                    }
                    if (e.type == components.events.ProvideViewerSearcherEvent.TYPE) {
                        var pvse = e;
                        this._searcher = pvse.searcher;
                        this._containerVisibleModelLoadedSync(this);
                    }
                    if (e.type == components.events.RequestStateEvent.TYPE) {
                        var rse = e;
                        if (this._searchAreaReady != null) {
                            var searchText = this._toolbarTextInput.value;
                            if (searchText != null && searchText != "") {
                                rse.stateMap.set("q", searchText);
                            }
                        }
                    }
                    if (e.type == components.events.RestoreStateEvent.TYPE) {
                        var rse = e;
                        if (rse.restoredState.has("q")) {
                            var q = rse.restoredState.get("q");
                            this.openSearch();
                            if (this._searchAreaReady != null) {
                                this._toolbarTextInput.value = q;
                            }
                            else {
                                this._valueToApply = q;
                            }
                        }
                    }
                };
                MyCoReSearchComponent.prototype.openSearch = function () {
                    var direction = (this._settings.mobile) ? components.events.ShowContentEvent.DIRECTION_CENTER : components.events.ShowContentEvent.DIRECTION_EAST;
                    this.trigger(new components.events.ShowContentEvent(this, this._container, direction, -1, this._sidebarLabel));
                    this.updateContainerSize();
                    this._containerVisible = true;
                    this._containerVisibleModelLoadedSync(this);
                };
                MyCoReSearchComponent.prototype._prepareIndex = function (model) {
                    var _this = this;
                    this._model._imageList.forEach(function (image) {
                        _this._imageHrefImageMap.set(image.href, image);
                    });
                    this._indexPreparing = true;
                    this._searcher.index(model, function (id, callback) {
                        _this.trigger(new components.events.RequestTextContentEvent(_this, id, callback));
                    }, function (x, ofY) {
                        _this._updateLabel(x, ofY);
                        if (ofY == (x)) {
                            _this._indexPrepared = true;
                            _this.initSearchArea();
                        }
                    });
                };
                MyCoReSearchComponent.prototype._updateLabel = function (current, of) {
                    this._progressbarInner.attr({ "aria-valuenow": current, "aria-valuemin": 0, "aria-valuemax": of });
                    this._progressbarInner.css({ width: ((current / of) * 100) + "%" });
                };
                MyCoReSearchComponent.prototype._initProgressbar = function () {
                    this._progressbar = jQuery("<div></div>");
                    this._progressbar.addClass("progress");
                    this._progressbarInner = jQuery("<div></div>");
                    this._progressbarInner.addClass("progress-bar progress-bar-info");
                    this._progressbarInner.appendTo(this._progressbar);
                    this._progressbarInner.attr({ role: "progressbar" });
                };
                return MyCoReSearchComponent;
            }(components.ViewerComponent));
            components.MyCoReSearchComponent = MyCoReSearchComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReSearchComponent);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var index;
            (function (index_1) {
                var TextIndex = (function () {
                    function TextIndex(_fullTextProvider) {
                        this._fullTextProvider = _fullTextProvider;
                        this._fullTextInformationIndex = [];
                        this._currentPosition = 0;
                        this._fullText = "";
                    }
                    TextIndex.prototype.addElement = function (elem) {
                        var fullTextPart = this._fullTextProvider(elem);
                        TextIndex.MATCH_WORD_REGEXP.lastIndex = 0;
                        var match;
                        while ((match = TextIndex.MATCH_WORD_REGEXP.exec(fullTextPart)) != null) {
                            this._fullTextInformationIndex[this._currentPosition + match.index] = elem;
                        }
                        if (fullTextPart.charAt(fullTextPart.length - 1) == " ") {
                            this._fullText += fullTextPart;
                            this._currentPosition += fullTextPart.length;
                        }
                        else {
                            this._fullText += fullTextPart + " ";
                            this._currentPosition += fullTextPart.length + 1;
                        }
                    };
                    TextIndex.prototype.search = function (searchInput) {
                        var regExpSearch = "";
                        var searchWords = searchInput.split(/\s/).filter(function (w) { return w != ""; });
                        searchWords.forEach(function (expr, i) {
                            regExpSearch += ((i == 0) ? "" : "\\s") + ((searchInput.length <= 3) ? TextIndex.MATCH_TEMPLATE_WORD_SHORT.replace("%TOKEN%", expr) : TextIndex.MATCH_TEMPLATE_WORD.replace("%TOKEN%", expr));
                        });
                        var searchRegExp = new RegExp(TextIndex.MATCH_TEMPLATE.replace("%WORDS%", regExpSearch), TextIndex.MATCH_PARAMETER);
                        var resultObjects = new Array();
                        var match;
                        var limit = 1000;
                        if (searchInput.length > 0 || searchInput.replace(" ", "").length > 0) {
                            while ((match = searchRegExp.exec(this._fullText)) && limit--) {
                                this.extractResults(match, resultObjects, searchWords);
                            }
                        }
                        return new SearchResult(resultObjects, resultObjects.length);
                    };
                    TextIndex.prototype.extractResults = function (match, resultObjects, searchWords) {
                        var si = match.index;
                        var result = match[0];
                        var words = result.split(" ");
                        var wordLen = 0;
                        var index = -1;
                        var context = this.getContext(si + result.length - (result.length / 2), searchWords);
                        var textline = null;
                        do {
                            if (typeof this._fullTextInformationIndex[si + wordLen] != "undefined") {
                                textline = this._fullTextInformationIndex[si + wordLen];
                                resultObjects.push(new IndexResultObject([textline], searchWords, context));
                            }
                            index++;
                            wordLen += words[index].length + 1;
                        } while (index + 1 < words.length);
                        return textline;
                    };
                    TextIndex.prototype.getContext = function (pos, words) {
                        var html = this._fullText.substr(Math.max(0, pos - TextIndex.DEFAULT_CONTEXT_SIZE / 2), TextIndex.DEFAULT_CONTEXT_SIZE);
                        words = words.sort(function (w1, w2) { return w1.length - w2.length; });
                        words.forEach(function (w) {
                            if (w != "") {
                                html = html.replace(new RegExp(w, "gim"), "<span class='" + TextIndex.TEXT_HIGHLIGHT_CLASSNAME + "'>$&</span>");
                            }
                        });
                        return jQuery("<span>" + html + "</span>");
                    };
                    TextIndex.DEFAULT_CONTEXT_SIZE = 100;
                    TextIndex.TEXT_HIGHLIGHT_CLASSNAME = "matched";
                    TextIndex.MATCH_TEMPLATE_WORD = "(\\b([a-zA-Z]*%TOKEN%[a-zA-Z]*)\\b)";
                    TextIndex.MATCH_TEMPLATE_WORD_SHORT = "(\\b%TOKEN%\\b)";
                    TextIndex.MATCH_TEMPLATE = "%WORDS%";
                    TextIndex.MATCH_PARAMETER = "gim";
                    TextIndex.MATCH_WORD_REGEXP = new RegExp("\\b([a-zA-Z]+)\\b", TextIndex.MATCH_PARAMETER);
                    return TextIndex;
                }());
                index_1.TextIndex = TextIndex;
                var SearchResult = (function () {
                    function SearchResult(results, count) {
                        this.results = results;
                        this.count = count;
                    }
                    return SearchResult;
                }());
                index_1.SearchResult = SearchResult;
                var IndexResultObject = (function () {
                    function IndexResultObject(arr, matchWords, context) {
                        this.arr = arr;
                        this.matchWords = matchWords;
                        this.context = context;
                    }
                    return IndexResultObject;
                }());
                index_1.IndexResultObject = IndexResultObject;
            })(index = widgets.index || (widgets.index = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var model;
        (function (model_2) {
            var MyCoReLocalIndexSearcher = (function (_super) {
                __extends(MyCoReLocalIndexSearcher, _super);
                function MyCoReLocalIndexSearcher() {
                    _super.call(this);
                    this._searchIndex = new viewer.widgets.index.TextIndex(function (te) { return te.text; });
                }
                MyCoReLocalIndexSearcher.prototype.index = function (model, textContentResolver, processIndicator) {
                    _super.prototype.index.call(this, model, textContentResolver, processIndicator);
                    this.indexModel();
                };
                MyCoReLocalIndexSearcher.prototype.indexModel = function () {
                    var _this = this;
                    var resolver = this.textContentResolver;
                    var processIndicator = this.processIndicator;
                    var count = 0;
                    this.model.imageList.forEach(function (image, i) {
                        resolver(image.additionalHrefs.get(MyCoReLocalIndexSearcher.PDF_TEXT_HREF), function (href, textContent) {
                            count++;
                            _this.indexPage(textContent);
                            processIndicator(count, _this.model._imageList.length - 1);
                        });
                    });
                };
                MyCoReLocalIndexSearcher.prototype.indexPage = function (text) {
                    var _this = this;
                    text.content.forEach(function (e) {
                        _this._searchIndex.addElement(e);
                    });
                };
                MyCoReLocalIndexSearcher.prototype.clearDoubleResults = function (searchResults) {
                    var contextExists = {};
                    return searchResults.filter(function (el) {
                        var key = (Utils.hash(el.context.text() + el.matchWords.join("")));
                        if (key in contextExists) {
                            return false;
                        }
                        else {
                            contextExists[key] = true;
                            return true;
                        }
                    });
                };
                MyCoReLocalIndexSearcher.prototype.search = function (query, resultReporter, searchCompleteCallback, count, start) {
                    var results = this._searchIndex.search(query).results;
                    results = this.clearDoubleResults(results);
                    resultReporter(results);
                    searchCompleteCallback(results.length);
                };
                MyCoReLocalIndexSearcher.PDF_TEXT_HREF = "pdfText";
                return MyCoReLocalIndexSearcher;
            }(model_2.MyCoReViewerSearcher));
            model_2.MyCoReLocalIndexSearcher = MyCoReLocalIndexSearcher;
        })(model = viewer.model || (viewer.model = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReLocalViewerIndexSearcherProvider = (function (_super) {
                __extends(MyCoReLocalViewerIndexSearcherProvider, _super);
                function MyCoReLocalViewerIndexSearcherProvider(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                }
                Object.defineProperty(MyCoReLocalViewerIndexSearcherProvider.prototype, "handlesEvents", {
                    get: function () {
                        return [];
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReLocalViewerIndexSearcherProvider.prototype.init = function () {
                    if (this._settings.doctype == "pdf") {
                        this.trigger(new components.events.ProvideViewerSearcherEvent(this, new mycore.viewer.model.MyCoReLocalIndexSearcher()));
                    }
                };
                return MyCoReLocalViewerIndexSearcherProvider;
            }(components.ViewerComponent));
            components.MyCoReLocalViewerIndexSearcherProvider = MyCoReLocalViewerIndexSearcherProvider;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReLocalViewerIndexSearcherProvider);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var solr;
            (function (solr) {
                var SolrSearchRequest = (function () {
                    function SolrSearchRequest(solrHandlerURL, derivateID, query, requestCallback) {
                        this.solrHandlerURL = solrHandlerURL;
                        this.derivateID = derivateID;
                        this.query = query;
                        this.requestCallback = requestCallback;
                        this.request = null;
                        this._solrRequestResult = null;
                        this._isComplete = false;
                    }
                    Object.defineProperty(SolrSearchRequest.prototype, "solrRequestResult", {
                        get: function () {
                            return this._solrRequestResult;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(SolrSearchRequest.prototype, "isComplete", {
                        get: function () {
                            return this._isComplete;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    SolrSearchRequest.prototype.startRequest = function () {
                        var _this = this;
                        var requestURL = this.buildRequestURL();
                        var ajaxSettings = { url: requestURL,
                            async: true,
                            success: function (response) {
                                if (!_this.isComplete) {
                                    _this.processResponse(response);
                                    _this.requestCallback(true);
                                }
                            },
                            error: function (request, status, exception) {
                                console.log(exception);
                                _this.requestCallback(false);
                            }
                        };
                        this.request = jQuery.ajax(ajaxSettings);
                    };
                    SolrSearchRequest.prototype.abortRequest = function () {
                        if (this.isComplete) {
                            console.debug("request is already complete!");
                            return;
                        }
                        if (this.request == null || typeof this.request == "undefined") {
                            console.debug("request object is null!");
                            return;
                        }
                        this.requestCallback = function () {
                        };
                        this.request.abort("request abort");
                    };
                    SolrSearchRequest.prototype.processResponse = function (response) {
                        this._isComplete = true;
                        this._solrRequestResult = response;
                    };
                    SolrSearchRequest.prototype.buildRequestURL = function () {
                        return ViewerFormatString(SolrSearchRequest.BASE_TEMPLATE, {
                            solrHandlerURL: this.solrHandlerURL,
                            query: this.query,
                            derivateID: this.derivateID
                        });
                    };
                    SolrSearchRequest.BASE_TEMPLATE = "{solrHandlerURL}/{derivateID}?q={query}";
                    return SolrSearchRequest;
                }());
                solr.SolrSearchRequest = SolrSearchRequest;
            })(solr = widgets.solr || (widgets.solr = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var model;
        (function (model_3) {
            var MyCoReSolrSearcher = (function (_super) {
                __extends(MyCoReSolrSearcher, _super);
                function MyCoReSolrSearcher(solrHandlerURL, derivateId) {
                    _super.call(this);
                    this.solrHandlerURL = solrHandlerURL;
                    this.derivateId = derivateId;
                    this.resolver = null;
                    this._altoHrefPageMap = new MyCoReMap();
                    this._currentRequest = null;
                }
                MyCoReSolrSearcher.prototype.index = function (model, textContentResolver, processIndicator) {
                    var _this = this;
                    _super.prototype.index.call(this, model, textContentResolver, processIndicator);
                    model._imageList.forEach(function (image) {
                        var href = image.additionalHrefs.get(MyCoReSolrSearcher.TEXT_HREF);
                        if (href != null) {
                            _this._altoHrefPageMap.set(href, image);
                        }
                    });
                    processIndicator(1, 1);
                    this.resolver = textContentResolver;
                };
                MyCoReSolrSearcher.prototype.search = function (query, resultReporter, searchCompleteCallback, count, start) {
                    var _this = this;
                    if (this._currentRequest != null && !this._currentRequest.isComplete) {
                        this._currentRequest.abortRequest();
                    }
                    if (query == "") {
                        resultReporter(([]));
                        return;
                    }
                    this._currentRequest = new viewer.widgets.solr.SolrSearchRequest(this.solrHandlerURL, this.derivateId, query, function () {
                        console.log(_this._currentRequest.solrRequestResult);
                        resultReporter(_this.extractSearchResults(query, _this._currentRequest.solrRequestResult));
                        searchCompleteCallback();
                    });
                    this._currentRequest.startRequest();
                };
                MyCoReSolrSearcher.prototype.extractSearchResults = function (query, solrResult) {
                    var _this = this;
                    var results = [];
                    solrResult.forEach(function (page) {
                        var pathParts = page.id.split("/");
                        pathParts.shift();
                        var altoHref = pathParts.join("/");
                        if (!_this._altoHrefPageMap.has(altoHref)) {
                            console.error("solr results contains a alto file which is not found in alto!");
                            return;
                        }
                        var metsPage = _this._altoHrefPageMap.get(altoHref);
                        page.hits.forEach(function (hit) {
                            var contextInnerHTML = hit.hl.split('<em>')
                                .join("<em class='" + MyCoReSolrSearcher.TEXT_HIGHLIGHT_CLASSNAME + "'>");
                            var context = document.createElement("div");
                            context.innerHTML = contextInnerHTML;
                            var matchWords = hit.positions.map(function (pos) { return pos.content; });
                            var altoTextContents = [];
                            hit.positions.forEach(function (position) {
                                altoTextContents.push(new SolrAltoTextContent(position, metsPage.href));
                            });
                            var result = new model_3.ResultObject(altoTextContents, matchWords, jQuery(context));
                            result.order = metsPage.order;
                            results.push(result);
                        });
                    });
                    return results.sort(function (x, y) { return x.order - y.order; });
                };
                MyCoReSolrSearcher.TEXT_HIGHLIGHT_CLASSNAME = 'matched';
                MyCoReSolrSearcher.TEXT_HREF = 'AltoHref';
                return MyCoReSolrSearcher;
            }(model_3.MyCoReViewerSearcher));
            model_3.MyCoReSolrSearcher = MyCoReSolrSearcher;
            var SolrAltoTextContent = (function () {
                function SolrAltoTextContent(position, parentId) {
                    this.angle = 0;
                    this.size = new Size2D(position.width, position.height);
                    this.pos = new Position2D(position.xpos, position.vpos);
                    this.fontFamily = "arial";
                    this.fontSize = this.size.height;
                    this.fromBottomLeft = false;
                    this.pageHref = parentId;
                }
                SolrAltoTextContent.prototype.toString = function () {
                    return this.pageHref.toString + '-' + this.pos.toString() + '-' + this.size.toString();
                };
                return SolrAltoTextContent;
            }());
            model_3.SolrAltoTextContent = SolrAltoTextContent;
        })(model = viewer.model || (viewer.model = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReSolrSearcherProvider = (function (_super) {
                __extends(MyCoReSolrSearcherProvider, _super);
                function MyCoReSolrSearcherProvider(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this._settings.solrHandlerURL = this._settings.webApplicationBaseURL + "/rsc/alto/highlight";
                }
                Object.defineProperty(MyCoReSolrSearcherProvider.prototype, "handlesEvents", {
                    get: function () {
                        return [];
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReSolrSearcherProvider.prototype.init = function () {
                    if (this._settings.doctype == "mets") {
                        this.trigger(new components.events.ProvideViewerSearcherEvent(this, new mycore.viewer.model.MyCoReSolrSearcher(this._settings.solrHandlerURL, this._settings.derivate)));
                    }
                };
                return MyCoReSolrSearcherProvider;
            }(components.ViewerComponent));
            components.MyCoReSolrSearcherProvider = MyCoReSolrSearcherProvider;
            var SolrSearcherSettings = (function (_super) {
                __extends(SolrSearcherSettings, _super);
                function SolrSearcherSettings() {
                    _super.apply(this, arguments);
                }
                return SolrSearcherSettings;
            }(viewer.MyCoReViewerSettings));
            components.SolrSearcherSettings = SolrSearcherSettings;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReSolrSearcherProvider);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var toolbar;
            (function (toolbar) {
                var BootstrapTextView = (function () {
                    function BootstrapTextView(_id) {
                        this._id = _id;
                        this.element = jQuery("<p></p>");
                        this.element.addClass("navbar-text");
                    }
                    BootstrapTextView.prototype.updateText = function (text) {
                        this.element.text(text);
                    };
                    BootstrapTextView.prototype.getElement = function () {
                        return this.element;
                    };
                    return BootstrapTextView;
                }());
                toolbar.BootstrapTextView = BootstrapTextView;
            })(toolbar = widgets.toolbar || (widgets.toolbar = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var toolbar;
            (function (toolbar) {
                var BootstrapImageView = (function () {
                    function BootstrapImageView(id) {
                        this._element = jQuery("<img />");
                        this._element.attr("data-id", id);
                    }
                    BootstrapImageView.prototype.updateHref = function (href) {
                        this._element.attr("src", href);
                    };
                    BootstrapImageView.prototype.getElement = function () {
                        return this._element;
                    };
                    return BootstrapImageView;
                }());
                toolbar.BootstrapImageView = BootstrapImageView;
            })(toolbar = widgets.toolbar || (widgets.toolbar = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var toolbar;
            (function (toolbar) {
                var BootstrapGroupView = (function () {
                    function BootstrapGroupView(id, align) {
                        this._element = jQuery("<div></div>");
                        this._element.attr("data-id", id);
                        this._element.addClass("btn-group");
                        this._element.addClass("navbar-" + align);
                    }
                    BootstrapGroupView.prototype.addChild = function (child) {
                        this._element.append(child);
                    };
                    BootstrapGroupView.prototype.removeChild = function (child) {
                        child.remove();
                    };
                    BootstrapGroupView.prototype.getElement = function () {
                        return this._element;
                    };
                    return BootstrapGroupView;
                }());
                toolbar.BootstrapGroupView = BootstrapGroupView;
            })(toolbar = widgets.toolbar || (widgets.toolbar = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var toolbar;
            (function (toolbar) {
                var BootstrapButtonView = (function () {
                    function BootstrapButtonView(id) {
                        this._buttonElement = jQuery("<button></button>");
                        this._buttonElement.attr("data-id", id);
                        this._buttonElement.addClass("btn btn-default navbar-btn");
                        this._buttonLabel = jQuery("<span></span>");
                        this._buttonLabel.appendTo(this._buttonElement);
                        this._icon = jQuery("<i></i>");
                        this._attached = false;
                        this._lastIconClass = "";
                        this._lastButtonClass = null;
                    }
                    BootstrapButtonView.prototype.updateButtonLabel = function (label) {
                        this._buttonLabel.text(label);
                        if (label.length > 0) {
                            this._icon.addClass("textpresent");
                        }
                        else {
                            this._icon.removeClass("textpresent");
                        }
                    };
                    BootstrapButtonView.prototype.updateButtonTooltip = function (tooltip) {
                        this._buttonElement.attr("title", tooltip);
                    };
                    BootstrapButtonView.prototype.updateButtonIcon = function (icon) {
                        if (!this._attached && icon != null) {
                            this._icon.prependTo(this._buttonElement);
                            this._attached = true;
                        }
                        else if (this._attached && icon == null) {
                            this._icon.remove();
                            this._attached = false;
                            return;
                        }
                        this._icon.removeClass("glyphicon-" + this._lastIconClass);
                        this._icon.removeClass(this._lastIconClass);
                        this._icon.removeClass("icon-" + this._lastIconClass);
                        if (icon.indexOf("fa") == 0) {
                            this._icon.addClass("fa");
                            this._icon.addClass(icon);
                        }
                        else {
                            this._icon.addClass("glyphicon");
                            this._icon.addClass("glyphicon-" + icon);
                            this._icon.addClass("icon-" + icon);
                        }
                        this._lastIconClass = icon;
                    };
                    BootstrapButtonView.prototype.updateButtonClass = function (buttonClass) {
                        if (this._lastButtonClass != null) {
                            this._buttonElement.removeClass("btn-" + this._lastButtonClass);
                        }
                        this._buttonElement.addClass("btn-" + buttonClass);
                        this._lastButtonClass = buttonClass;
                    };
                    BootstrapButtonView.prototype.updateButtonActive = function (active) {
                        var isActive = this._buttonElement.hasClass("active");
                        if (active && !isActive) {
                            this._buttonElement.addClass("active");
                        }
                        if (!active && isActive) {
                            this._buttonElement.removeClass("active");
                        }
                    };
                    BootstrapButtonView.prototype.updateButtonDisabled = function (disabled) {
                        var isDisabled = this._buttonElement.attr("disabled") == "disabled";
                        if (disabled && !isDisabled) {
                            this._buttonElement.attr("disabled", "disabled");
                        }
                        if (!disabled && isDisabled) {
                            this._buttonElement.removeAttr("disabled");
                        }
                    };
                    BootstrapButtonView.getBootstrapIcon = function (icon) {
                        return "glyphicon-" + icon;
                    };
                    BootstrapButtonView.prototype.getElement = function () {
                        return this._buttonElement;
                    };
                    return BootstrapButtonView;
                }());
                toolbar.BootstrapButtonView = BootstrapButtonView;
            })(toolbar = widgets.toolbar || (widgets.toolbar = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var toolbar;
            (function (toolbar) {
                var BootstrapDropdownView = (function (_super) {
                    __extends(BootstrapDropdownView, _super);
                    function BootstrapDropdownView(_id) {
                        _super.call(this, _id);
                        this._buttonElement.attr("data-toggle", "dropdown");
                        this._buttonElement.addClass("dropdown-toggle");
                        this._caret = jQuery("<span></span>");
                        this._caret.addClass("caret");
                        this._caret.appendTo(this._buttonElement);
                        this._dropdownMenu = jQuery("<ul></ul>");
                        this._dropdownMenu.addClass("dropdown-menu");
                        this._dropdownMenu.attr("role", "menu");
                        this._childMap = new MyCoReMap();
                    }
                    BootstrapDropdownView.prototype.updateChilds = function (childs) {
                        this._childMap.forEach(function (key, val) {
                            val.remove();
                        });
                        this._childMap.clear();
                        var first = true;
                        for (var childIndex in childs) {
                            var current = childs[childIndex];
                            var newChild = jQuery("");
                            if ("isHeader" in current && current.isHeader) {
                                if (!first) {
                                    newChild = newChild.add(jQuery("<li class='divider' value='divider-" + current.id + "' data-id=\"divider-" + current.id + "\"></li>"));
                                }
                                newChild = newChild.add("<li class='dropdown-header disabled' value='divider-" + current.id + "' data-id=\"divider-" + current.id + "\"><a>" + current.label + "</a></li>");
                            }
                            else {
                                var anchor = jQuery("<a>" + current.label + "</a>");
                                newChild = jQuery(jQuery("<li value='" + current.id + "' data-id=\"" + current.id + "\"></li>"));
                                if ("icon" in current) {
                                    var icon = jQuery("<i class=\"glyphicon glyphicon-" + current.icon + " dropdown-icon\"></i>");
                                    anchor.prepend(icon);
                                }
                                newChild.append(anchor);
                            }
                            this._childMap.set(current.id, newChild);
                            newChild.appendTo(this._dropdownMenu);
                            if (first)
                                first = false;
                        }
                    };
                    BootstrapDropdownView.prototype.getChildElement = function (id) {
                        return this._childMap.get(id) || null;
                    };
                    BootstrapDropdownView.prototype.getElement = function () {
                        return jQuery().add(this._buttonElement).add(this._dropdownMenu);
                    };
                    return BootstrapDropdownView;
                }(toolbar.BootstrapButtonView));
                toolbar.BootstrapDropdownView = BootstrapDropdownView;
            })(toolbar = widgets.toolbar || (widgets.toolbar = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var toolbar;
            (function (toolbar) {
                var BootstrapLargeDropdownView = (function () {
                    function BootstrapLargeDropdownView(_id) {
                        this._id = _id;
                        this._buttonElement = jQuery("<select></select>");
                        this._buttonElement.addClass("btn btn-default navbar-btn dropdown");
                        this._childMap = new MyCoReMap();
                    }
                    BootstrapLargeDropdownView.prototype.updateButtonLabel = function (label) {
                    };
                    BootstrapLargeDropdownView.prototype.updateButtonTooltip = function (tooltip) {
                    };
                    BootstrapLargeDropdownView.prototype.updateButtonIcon = function (icon) {
                    };
                    BootstrapLargeDropdownView.prototype.updateButtonClass = function (buttonClass) {
                    };
                    BootstrapLargeDropdownView.prototype.updateButtonActive = function (active) {
                    };
                    BootstrapLargeDropdownView.prototype.updateButtonDisabled = function (disabled) {
                    };
                    BootstrapLargeDropdownView.prototype.updateChilds = function (childs) {
                        this._childMap.forEach(function (key, val) {
                            val.remove();
                        });
                        this._childMap.clear();
                        for (var childIndex in childs) {
                            var current = childs[childIndex];
                            var newChild = jQuery("<option value='" + current.id + "' data-id=\"" + current.id + "\">" + current.label + "</option>");
                            this._childMap.set(current.id, newChild);
                            newChild.appendTo(this._buttonElement);
                        }
                    };
                    BootstrapLargeDropdownView.prototype.getChildElement = function (id) {
                        return this._childMap.get(id) || null;
                    };
                    BootstrapLargeDropdownView.prototype.getElement = function () {
                        return jQuery().add(this._buttonElement).add(this._buttonElement);
                    };
                    return BootstrapLargeDropdownView;
                }());
                toolbar.BootstrapLargeDropdownView = BootstrapLargeDropdownView;
            })(toolbar = widgets.toolbar || (widgets.toolbar = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var toolbar;
            (function (toolbar) {
                var BootstrapTextInputView = (function () {
                    function BootstrapTextInputView(_id) {
                        var _this = this;
                        this._id = _id;
                        this.onChange = null;
                        this.element = jQuery("<form></form>");
                        this.element.addClass("navbar-form");
                        this.element.css({ display: "inline-block" });
                        this.childText = jQuery("<input type='text' class='form-control'/>");
                        this.childText.appendTo(this.element);
                        this.childText.keydown(function (e) {
                            if (e.keyCode == 13) {
                                e.preventDefault();
                            }
                        });
                        this.childText.keyup(function (e) {
                            if (e.keyCode) {
                                if (e.keyCode == 27) {
                                    _this.childText.val("");
                                    _this.childText.blur();
                                }
                            }
                            if (_this.onChange != null) {
                                _this.onChange();
                            }
                        });
                    }
                    BootstrapTextInputView.prototype.updateValue = function (value) {
                        this.childText.val(value);
                    };
                    BootstrapTextInputView.prototype.getValue = function () {
                        return this.childText.val();
                    };
                    BootstrapTextInputView.prototype.getElement = function () {
                        return this.element;
                    };
                    BootstrapTextInputView.prototype.updatePlaceholder = function (placeHolder) {
                        this.childText.attr("placeholder", placeHolder);
                    };
                    return BootstrapTextInputView;
                }());
                toolbar.BootstrapTextInputView = BootstrapTextInputView;
            })(toolbar = widgets.toolbar || (widgets.toolbar = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var toolbar;
            (function (toolbar) {
                var BootstrapToolbarView = (function () {
                    function BootstrapToolbarView() {
                        this._toolbar = jQuery("<section></section>");
                        this._toolbar.addClass("navbar navbar-default");
                    }
                    BootstrapToolbarView.prototype.addChild = function (child) {
                        this._toolbar.append(child);
                    };
                    BootstrapToolbarView.prototype.removeChild = function (child) {
                        child.remove();
                    };
                    BootstrapToolbarView.prototype.getElement = function () {
                        return this._toolbar;
                    };
                    return BootstrapToolbarView;
                }());
                toolbar.BootstrapToolbarView = BootstrapToolbarView;
            })(toolbar = widgets.toolbar || (widgets.toolbar = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var toolbar;
            (function (toolbar) {
                var BootstrapToolbarViewFactory = (function () {
                    function BootstrapToolbarViewFactory() {
                    }
                    BootstrapToolbarViewFactory.prototype.createToolbarView = function () {
                        return new toolbar.BootstrapToolbarView();
                    };
                    BootstrapToolbarViewFactory.prototype.createTextView = function (id) {
                        return new toolbar.BootstrapTextView(id);
                    };
                    BootstrapToolbarViewFactory.prototype.createImageView = function (id) {
                        return new toolbar.BootstrapImageView(id);
                    };
                    BootstrapToolbarViewFactory.prototype.createGroupView = function (id, align) {
                        return new toolbar.BootstrapGroupView(id, align);
                    };
                    BootstrapToolbarViewFactory.prototype.createDropdownView = function (id) {
                        return new toolbar.BootstrapDropdownView(id);
                    };
                    BootstrapToolbarViewFactory.prototype.createLargeDropdownView = function (id) {
                        return new toolbar.BootstrapLargeDropdownView(id);
                    };
                    BootstrapToolbarViewFactory.prototype.createButtonView = function (id) {
                        return new toolbar.BootstrapButtonView(id);
                    };
                    BootstrapToolbarViewFactory.prototype.createTextInputView = function (id) {
                        return new toolbar.BootstrapTextInputView(id);
                    };
                    return BootstrapToolbarViewFactory;
                }());
                toolbar.BootstrapToolbarViewFactory = BootstrapToolbarViewFactory;
                toolbar.ToolbarViewFactoryImpl = new BootstrapToolbarViewFactory();
            })(toolbar = widgets.toolbar || (widgets.toolbar = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
console.log("DESKTOP MODULE");

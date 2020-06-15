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
            var MyCoReMobileToolbarModel = (function (_super) {
                __extends(MyCoReMobileToolbarModel, _super);
                function MyCoReMobileToolbarModel() {
                    _super.call(this, "MyCoReMobileToolbar");
                }
                MyCoReMobileToolbarModel.prototype.addComponents = function () {
                    this.addGroup(this._sidebarControllGroup);
                    this.addGroup(this._zoomControllGroup);
                    if (viewerDeviceSupportTouch) {
                        this._zoomControllGroup.removeComponent(this._zoomInButton);
                        this._zoomControllGroup.removeComponent(this._zoomOutButton);
                        this._zoomControllGroup.removeComponent(this._rotateButton);
                    }
                    this.addGroup(this._actionControllGroup);
                    this.addGroup(this._closeViewerGroup);
                    this.changeIcons();
                };
                MyCoReMobileToolbarModel.prototype.changeIcons = function () {
                    this._zoomInButton.icon = "search-plus";
                    this._zoomOutButton.icon = "search-minus";
                    this._zoomFitButton.icon = "expand";
                    this._zoomWidthButton.icon = "arrows-h";
                    this._closeViewerButton.icon = "power-off";
                    this._rotateButton.icon = "rotate-right";
                };
                return MyCoReMobileToolbarModel;
            }(model.MyCoReBasicToolbarModel));
            model.MyCoReMobileToolbarModel = MyCoReMobileToolbarModel;
        })(model = viewer.model || (viewer.model = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReMobileToolbarProviderComponent = (function (_super) {
                __extends(MyCoReMobileToolbarProviderComponent, _super);
                function MyCoReMobileToolbarProviderComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                }
                Object.defineProperty(MyCoReMobileToolbarProviderComponent.prototype, "handlesEvents", {
                    get: function () {
                        return [];
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReMobileToolbarProviderComponent.prototype.init = function () {
                    this.trigger(new components.events.ProvideToolbarModelEvent(this, new mycore.viewer.model.MyCoReMobileToolbarModel()));
                };
                return MyCoReMobileToolbarProviderComponent;
            }(components.ViewerComponent));
            components.MyCoReMobileToolbarProviderComponent = MyCoReMobileToolbarProviderComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReMobileToolbarProviderComponent);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var imagebar;
            (function (imagebar) {
                var ImagebarModel = (function () {
                    function ImagebarModel(images, selected) {
                        this.images = images;
                        this.selected = selected;
                        this._lastPosition = 0;
                    }
                    return ImagebarModel;
                }());
                imagebar.ImagebarModel = ImagebarModel;
            })(imagebar = widgets.imagebar || (widgets.imagebar = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var imagebar;
            (function (imagebar) {
                var ImagebarView = (function () {
                    function ImagebarView(__container, _imageSelectedCallback) {
                        this._imageSelectedCallback = _imageSelectedCallback;
                        this._idElementMap = new MyCoReMap();
                        this._lastSelectedId = "";
                        this._container = jQuery("<div></div>");
                        this._container.addClass("imagebar");
                        __container.append(this._container);
                        this.registerEvents();
                    }
                    ImagebarView.prototype.registerEvents = function () {
                        var that = this;
                        var down = false;
                        var lastX = 0;
                        var end = function (e) {
                            down = false;
                            var x = lastX;
                            that._imageSelectedCallback(x, false);
                            that._container.removeClass("selecting");
                            e.preventDefault();
                            jQuery(window.document.body).unbind("touchmove", move);
                            jQuery(window.document.body).unbind("touchend", end);
                        };
                        var move = function (e) {
                            if (down) {
                                var x = e.originalEvent.targetTouches[0].pageX;
                                that._imageSelectedCallback(x, true);
                                lastX = x;
                            }
                            e.preventDefault();
                        };
                        var start = function (e) {
                            lastX = e.originalEvent.targetTouches[0].pageX;
                            down = true;
                            that._container.addClass("selecting");
                            e.preventDefault();
                            jQuery(window.document.body).bind("touchmove", move);
                            jQuery(window.document.body).bind("touchend", end);
                        };
                        this._container.bind("touchstart", start);
                    };
                    ImagebarView.prototype.addImage = function (id, url, position) {
                        var element = jQuery("<img />");
                        element.attr("data-id", id);
                        element.attr("src", url);
                        element.addClass("miniImage");
                        if (this.viewportWidth / 2 > position) {
                            element.css({ "left": position });
                        }
                        else {
                            var positionFromRight = this.viewportWidth - position - 18;
                            element.css({ "right": positionFromRight });
                        }
                        this._container.append(element);
                        this._idElementMap.set(id, element);
                    };
                    ImagebarView.prototype.removeImage = function (id) {
                        var imgElement = this._idElementMap.get(id);
                        if (typeof imgElement != "undefined") {
                            imgElement.attr("src", "");
                            imgElement.remove();
                        }
                    };
                    ImagebarView.prototype.setSelectedImage = function (id, url, pos) {
                        if (this._lastSelectedId != "") {
                            this.removeImage(this._lastSelectedId);
                        }
                        this.addImage(id, url, pos);
                        this._idElementMap.get(id).addClass("selected");
                        this._lastSelectedId = id;
                    };
                    Object.defineProperty(ImagebarView.prototype, "viewportWidth", {
                        get: function () {
                            return this._container.width();
                        },
                        enumerable: true,
                        configurable: true
                    });
                    ImagebarView.prototype.removeAllImages = function () {
                        var that = this;
                        this._idElementMap.forEach(function (k, v) {
                            that.removeImage(k);
                        });
                        this._idElementMap.clear();
                    };
                    Object.defineProperty(ImagebarView.prototype, "containerElement", {
                        get: function () {
                            return this._container;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return ImagebarView;
                }());
                imagebar.ImagebarView = ImagebarView;
            })(imagebar = widgets.imagebar || (widgets.imagebar = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var imagebar;
            (function (imagebar) {
                var IviewImagebar = (function () {
                    function IviewImagebar(_container, images, startImage, imageSelected, _urlPrefix) {
                        this._container = _container;
                        this._urlPrefix = _urlPrefix;
                        this._model = new mycore.viewer.widgets.imagebar.ImagebarModel(images, startImage);
                        var that = this;
                        this._view = new mycore.viewer.widgets.imagebar.ImagebarView(_container, function (position, hover) {
                            if (!hover) {
                                imageSelected(that.getImageForPosition(position));
                            }
                            else {
                                that._imageSelected(position);
                            }
                        });
                        this.insertImages();
                        var that = this;
                        jQuery(window).bind("resize", function () {
                            that.insertImages();
                            that.setImageSelected(that._model.selected);
                        });
                        this.setImageSelected(startImage);
                    }
                    IviewImagebar.prototype.insertImages = function () {
                        this._view.removeAllImages();
                        var imageCount = this._model.images.length;
                        var space = this._view.viewportWidth;
                        var displayImageCount = Math.floor(space / IviewImagebar.IMAGE_WIDTH);
                        var gap = 0;
                        if (displayImageCount > imageCount) {
                            displayImageCount = imageCount;
                            gap = (space / displayImageCount / 2);
                        }
                        var nthImageToDisplay = Math.max(Math.floor(imageCount / displayImageCount), 1);
                        for (var i = 0; i < displayImageCount; i++) {
                            var image = this._model.images[i * nthImageToDisplay];
                            this.addImage(image, space / displayImageCount * i + gap);
                        }
                    };
                    IviewImagebar.prototype.addImage = function (image, position) {
                        var _this = this;
                        image.requestImgdataUrl(function (path) {
                            _this._view.addImage(image.id, path, position);
                        });
                    };
                    IviewImagebar.prototype.getImageForPosition = function (position) {
                        var imageCount = this._model.images.length;
                        var space = this._view.viewportWidth;
                        var selectedImageIndex = Math.floor(position / (space / imageCount));
                        var selectedImage = this._model.images[selectedImageIndex];
                        return selectedImage;
                    };
                    IviewImagebar.prototype.getPositionOfImage = function (image) {
                        var pos = this._model.images.indexOf(image);
                        var imageCount = this._model.images.length;
                        var space = this._view.viewportWidth;
                        var position = space / imageCount * pos;
                        return position;
                    };
                    IviewImagebar.prototype._imageSelected = function (position) {
                        var _this = this;
                        var selectedImage = this.getImageForPosition(position);
                        this._model._lastPosition = position;
                        var that = this;
                        if (typeof selectedImage != "undefined") {
                            selectedImage.requestImgdataUrl(function (path) {
                                if (that._model._lastPosition == position) {
                                    _this._view.setSelectedImage(selectedImage.id, path, position);
                                }
                            });
                        }
                    };
                    IviewImagebar.prototype.setImageSelected = function (image) {
                        this._model.selected = image;
                        this._imageSelected(this.getPositionOfImage(image));
                    };
                    Object.defineProperty(IviewImagebar.prototype, "view", {
                        get: function () {
                            return this._view.containerElement;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    IviewImagebar.IMAGE_WIDTH = 20;
                    return IviewImagebar;
                }());
                imagebar.IviewImagebar = IviewImagebar;
            })(imagebar = widgets.imagebar || (widgets.imagebar = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReImagebarComponent = (function (_super) {
                __extends(MyCoReImagebarComponent, _super);
                function MyCoReImagebarComponent(_settings, _container) {
                    _super.call(this);
                    this._settings = _settings;
                    this._container = _container;
                    if (this._settings.mobile) {
                        this.trigger(new components.events.WaitForEvent(this, components.events.StructureModelLoadedEvent.TYPE));
                    }
                }
                MyCoReImagebarComponent.prototype._init = function (imageList) {
                    var _this = this;
                    var imagebarStartImage;
                    var startImage = this._settings.filePath;
                    if (startImage.charAt(0) == "/") {
                        startImage = startImage.substr(1);
                    }
                    for (var i in imageList) {
                        var image;
                        image = imageList[i];
                        if (image.href == startImage) {
                            imagebarStartImage = image;
                        }
                    }
                    var that = this;
                    this._imagebar = new mycore.viewer.widgets.imagebar.IviewImagebar(this._container, imageList, imagebarStartImage, function (img) {
                        _this.trigger(new components.events.ImageSelectedEvent(that, img));
                    }, this._settings.tileProviderPath + this._settings.derivate + "/");
                    this.trigger(new components.events.ComponentInitializedEvent(this));
                };
                Object.defineProperty(MyCoReImagebarComponent.prototype, "content", {
                    get: function () {
                        return this._container;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(MyCoReImagebarComponent.prototype, "handlesEvents", {
                    get: function () {
                        if (this._settings.mobile) {
                            return [components.events.StructureModelLoadedEvent.TYPE, components.events.ImageChangedEvent.TYPE, components.events.CanvasTapedEvent.TYPE];
                        }
                        else {
                            return [];
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReImagebarComponent.prototype.handle = function (e) {
                    if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                        var imageList = e.structureModel._imageList;
                        this._model = imageList;
                        var convertedImageList = imageList;
                        this._init(convertedImageList);
                    }
                    if (e.type == components.events.ImageChangedEvent.TYPE) {
                        var imageChangedEvent = e;
                        if (typeof this._imagebar != "undefined") {
                            this._imagebar.setImageSelected(imageChangedEvent.image);
                        }
                    }
                    if (e.type == components.events.CanvasTapedEvent.TYPE) {
                        this._imagebar.view.slideToggle();
                    }
                };
                return MyCoReImagebarComponent;
            }(components.ViewerComponent));
            components.MyCoReImagebarComponent = MyCoReImagebarComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReImagebarComponent);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoRePageMobileLayoutProviderComponent = (function (_super) {
                __extends(MyCoRePageMobileLayoutProviderComponent, _super);
                function MyCoRePageMobileLayoutProviderComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                }
                Object.defineProperty(MyCoRePageMobileLayoutProviderComponent.prototype, "handlesEvents", {
                    get: function () {
                        return [];
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoRePageMobileLayoutProviderComponent.prototype.init = function () {
                    this.trigger(new components.events.ProvidePageLayoutEvent(this, new viewer.widgets.canvas.SinglePageLayout(), true));
                };
                return MyCoRePageMobileLayoutProviderComponent;
            }(components.ViewerComponent));
            components.MyCoRePageMobileLayoutProviderComponent = MyCoRePageMobileLayoutProviderComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoRePageMobileLayoutProviderComponent);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var toolbar;
            (function (toolbar) {
                var MobileGroupView = (function () {
                    function MobileGroupView(id, align) {
                        this._element = jQuery("<div></div>");
                        this._element.addClass("group");
                        this._element.attr("data-id", id);
                        this._element.css({ "float": align });
                    }
                    MobileGroupView.prototype.addChild = function (child) {
                        this._element.append(child);
                    };
                    MobileGroupView.prototype.removeChild = function (child) {
                        child.remove();
                    };
                    MobileGroupView.prototype.getElement = function () {
                        return this._element;
                    };
                    return MobileGroupView;
                }());
                toolbar.MobileGroupView = MobileGroupView;
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
                var MobileDropdownView = (function () {
                    function MobileDropdownView(_id) {
                        this._id = _id;
                        this._buttonElement = jQuery("<div></div>");
                        this._buttonElement.addClass("dropdown");
                        this._buttonElementInner = jQuery("<span></span>");
                        this._buttonElementInner.addClass("fa fa-bars");
                        this._buttonElementInner.appendTo(this._buttonElement);
                        this._dropdown = jQuery("<select></select>");
                        this._dropdown.appendTo(this._buttonElement);
                        var defaultChild = jQuery("<option selected disabled hidden value=''></option>");
                        defaultChild.css({ "display": "none" });
                        defaultChild.appendTo(this._dropdown);
                        this._childMap = new MyCoReMap();
                    }
                    MobileDropdownView.prototype.updateButtonLabel = function (label) {
                    };
                    MobileDropdownView.prototype.updateButtonTooltip = function (tooltip) {
                    };
                    MobileDropdownView.prototype.updateButtonIcon = function (icon) {
                    };
                    MobileDropdownView.prototype.updateButtonClass = function (buttonClass) {
                    };
                    MobileDropdownView.prototype.updateButtonActive = function (active) {
                    };
                    MobileDropdownView.prototype.updateButtonDisabled = function (disabled) {
                    };
                    MobileDropdownView.prototype.updateChilds = function (childs) {
                        this._childMap.forEach(function (key, val) {
                            val.remove();
                        });
                        this._childMap.clear();
                        for (var childIndex in childs) {
                            var current = childs[childIndex];
                            var newChild = jQuery("<option value='" + current.id + "' data-id=\"" + current.id + "\">" + current.label + "</option>");
                            this._childMap.set(current.id, newChild);
                            newChild.appendTo(this._dropdown);
                        }
                    };
                    MobileDropdownView.prototype.getChildElement = function (id) {
                        return this._childMap.get(id) || null;
                    };
                    MobileDropdownView.prototype.getElement = function () {
                        return jQuery().add(this._buttonElement);
                    };
                    return MobileDropdownView;
                }());
                toolbar.MobileDropdownView = MobileDropdownView;
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
                var MobileButtonView = (function () {
                    function MobileButtonView(id) {
                        this._lastIcon = "";
                        this._buttonElement = jQuery("<a></a>");
                        this._buttonElement.addClass("button");
                        this._buttonElement.attr("data-id", id);
                        this._buttonLabel = jQuery("<span></span>");
                        this._buttonLabel.addClass("buttonLabel");
                        this._buttonElement.append(this._buttonLabel);
                        this._buttonIcon = jQuery("<span></span>");
                        this._buttonElement.append(this._buttonIcon);
                    }
                    MobileButtonView.prototype.updateButtonLabel = function (label) {
                        this._buttonLabel.text(label);
                    };
                    MobileButtonView.prototype.updateButtonTooltip = function (tooltip) {
                    };
                    MobileButtonView.prototype.updateButtonIcon = function (icon) {
                        this._buttonIcon.removeClass("fa");
                        this._buttonIcon.removeClass("fa-" + this._lastIcon);
                        this._buttonIcon.removeClass("icon-" + this._lastIcon);
                        this._lastIcon = icon;
                        this._buttonIcon.addClass("fa");
                        this._buttonIcon.addClass("fa-" + icon);
                        this._buttonIcon.addClass("icon-" + icon);
                    };
                    MobileButtonView.prototype.updateButtonClass = function (buttonClass) {
                    };
                    MobileButtonView.prototype.updateButtonActive = function (active) {
                    };
                    MobileButtonView.prototype.updateButtonDisabled = function (disabled) {
                    };
                    MobileButtonView.prototype.getElement = function () {
                        return this._buttonElement;
                    };
                    return MobileButtonView;
                }());
                toolbar.MobileButtonView = MobileButtonView;
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
                var MobileToolbarView = (function () {
                    function MobileToolbarView() {
                        this._toolbar = jQuery("<div></div>");
                        this._toolbar.addClass("mobile-toolbar");
                    }
                    MobileToolbarView.prototype.addChild = function (child) {
                        this._toolbar.append(child);
                    };
                    MobileToolbarView.prototype.removeChild = function (child) {
                        child.remove();
                    };
                    MobileToolbarView.prototype.getElement = function () {
                        return this._toolbar;
                    };
                    return MobileToolbarView;
                }());
                toolbar.MobileToolbarView = MobileToolbarView;
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
                var MobileToolbarViewFactory = (function () {
                    function MobileToolbarViewFactory() {
                    }
                    MobileToolbarViewFactory.prototype.createTextInputView = function (id) {
                        throw new ViewerError("text input view not supported by Mobile!");
                    };
                    MobileToolbarViewFactory.prototype.createToolbarView = function () {
                        return new toolbar.MobileToolbarView();
                    };
                    MobileToolbarViewFactory.prototype.createTextView = function (id) {
                        throw new ViewerError("text view not supported by Mobile!");
                    };
                    MobileToolbarViewFactory.prototype.createImageView = function (id) {
                        throw new ViewerError("image view not supported by Mobile!");
                    };
                    MobileToolbarViewFactory.prototype.createGroupView = function (id, align) {
                        return new toolbar.MobileGroupView(id, align);
                    };
                    MobileToolbarViewFactory.prototype.createDropdownView = function (id) {
                        return new toolbar.MobileDropdownView(id);
                    };
                    MobileToolbarViewFactory.prototype.createLargeDropdownView = function (id) {
                        return new toolbar.MobileDropdownView(id);
                    };
                    MobileToolbarViewFactory.prototype.createButtonView = function (id) {
                        return new toolbar.MobileButtonView(id);
                    };
                    return MobileToolbarViewFactory;
                }());
                toolbar.MobileToolbarViewFactory = MobileToolbarViewFactory;
                toolbar.ToolbarViewFactoryImpl = new MobileToolbarViewFactory();
            })(toolbar = widgets.toolbar || (widgets.toolbar = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
console.log("MOBILE MODULE");

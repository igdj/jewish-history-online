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
                            additionalHrefs.forEach(function (name, href) {
                                if (name.indexOf("TEI.") == 0) {
                                    var language = name.substr("TEI.".length).toLocaleLowerCase();
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
                            this.trigger(new components.events.ProvideLayerEvent(this, new viewer.widgets.tei.TEILayer("transcription", "layer.transcription", transcriptions, this.contentLocation, this._settings.teiStylesheet || "html")));
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
                                _this.trigger(new components.events.ProvideLayerEvent(_this, new viewer.widgets.tei.TEILayer(language, "layer." + language, translationMap, _this.contentLocation, _this._settings.teiStylesheet || "html")));
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
                return MyCoReTEILayerProvider;
            }(components.ViewerComponent));
            components.MyCoReTEILayerProvider = MyCoReTEILayerProvider;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReTEILayerProvider);

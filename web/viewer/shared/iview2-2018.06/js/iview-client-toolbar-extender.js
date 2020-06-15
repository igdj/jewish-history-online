var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var ToolbarButton = mycore.viewer.widgets.toolbar.ToolbarButton;
            var ToolbarGroup = mycore.viewer.widgets.toolbar.ToolbarGroup;
            var MyCoReToolbarExtenderComponent = (function (_super) {
                __extends(MyCoReToolbarExtenderComponent, _super);
                function MyCoReToolbarExtenderComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this.idEntryMapping = new MyCoReMap();
                    this.idButtonMapping = new MyCoReMap();
                    this.idGroupMapping = new MyCoReMap();
                    this.toolbarModel = null;
                    this.languageModel = null;
                    this.toolbarButtonSync = Utils.synchronize([function (me) { return me.languageModel != null; },
                        function (me) { return me.toolbarModel != null; }], function (me) { return me.initLanguage(); });
                }
                MyCoReToolbarExtenderComponent.prototype.init = function () {
                    var _this = this;
                    if ("toolbar" in this._settings) {
                        this._settings.toolbar.forEach(function (settingsEntry) {
                            if (settingsEntry.type == "group") {
                                _this.idGroupMapping.set(settingsEntry.id, new ToolbarGroup(settingsEntry.id));
                            }
                            else if (settingsEntry.type == "button") {
                                _this.idButtonMapping.set(settingsEntry.id, new ToolbarButton(settingsEntry.id, settingsEntry.label, settingsEntry.tooltip || settingsEntry.label, settingsEntry.icon));
                            }
                            _this.idEntryMapping.set(settingsEntry.id, settingsEntry);
                        });
                    }
                    this.trigger(new components.events.WaitForEvent(this, components.events.ProvideToolbarModelEvent.TYPE));
                    this.trigger(new components.events.ComponentInitializedEvent(this));
                };
                MyCoReToolbarExtenderComponent.prototype.handle = function (e) {
                    var _this = this;
                    if (e.type == components.events.ProvideToolbarModelEvent.TYPE) {
                        var ptme = e;
                        this.toolbarModel = ptme.model;
                        this.idGroupMapping.forEach(function (k, v) {
                            ptme.model.addGroup(_this.idGroupMapping.get(k));
                        });
                        this.idButtonMapping.forEach(function (k, v) {
                            var inGroup = _this.idEntryMapping.get(k).inGroup;
                            var group = ptme.model.getGroups().filter(function (g) { return inGroup == g.name; })[0];
                            if (typeof group == "undefined") {
                                console.log("Can not find group " + inGroup + "!");
                                return;
                            }
                            group.addComponent(v);
                        });
                        this.toolbarButtonSync(this);
                    }
                    if (e.type == viewer.widgets.toolbar.events.ButtonPressedEvent.TYPE) {
                        var pressedID = e;
                        this.idEntryMapping.hasThen(pressedID.button.id, function (entry) {
                            if ("action" in entry) {
                                entry.action.apply(_this, e);
                            }
                            if ("href" in entry) {
                                window.location.href = entry.href;
                            }
                        });
                    }
                    if (e.type == components.events.LanguageModelLoadedEvent.TYPE) {
                        this.languageModel = e.languageModel;
                        this.toolbarButtonSync(this);
                    }
                };
                Object.defineProperty(MyCoReToolbarExtenderComponent.prototype, "handlesEvents", {
                    get: function () {
                        return [components.events.ProvideToolbarModelEvent.TYPE, viewer.widgets.toolbar.events.ButtonPressedEvent.TYPE, components.events.LanguageModelLoadedEvent.TYPE];
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReToolbarExtenderComponent.prototype.initLanguage = function () {
                    var _this = this;
                    this.idButtonMapping.forEach(function (k, v) {
                        v.label = _this.languageModel.getTranslation(v.label);
                        v.tooltip = _this.languageModel.getTranslation(v.tooltip);
                    });
                };
                return MyCoReToolbarExtenderComponent;
            }(components.ViewerComponent));
            components.MyCoReToolbarExtenderComponent = MyCoReToolbarExtenderComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReToolbarExtenderComponent);
console.log("toolbar-extender MODULE");

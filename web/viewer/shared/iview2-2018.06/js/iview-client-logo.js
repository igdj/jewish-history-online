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
            var MyCoReLogoComponent = (function (_super) {
                __extends(MyCoReLogoComponent, _super);
                function MyCoReLogoComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                }
                MyCoReLogoComponent.prototype.handle = function (e) {
                    if (e.type == components.events.ProvideToolbarModelEvent.TYPE && !this._settings.mobile) {
                        if (this._settings.logoURL) {
                            var logoUrl = this._settings.logoURL;
                            var ptme = e;
                            var logoGroup = new viewer.widgets.toolbar.ToolbarGroup("LogoGroup", true);
                            var logo = new viewer.widgets.toolbar.ToolbarImage("ToolbarImage", logoUrl);
                            logoGroup.addComponent(logo);
                            ptme.model.addGroup(logoGroup);
                        }
                    }
                };
                Object.defineProperty(MyCoReLogoComponent.prototype, "handlesEvents", {
                    get: function () {
                        var handleEvents = new Array();
                        handleEvents.push(components.events.ProvideToolbarModelEvent.TYPE);
                        return handleEvents;
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReLogoComponent.prototype.init = function () {
                    this.trigger(new components.events.WaitForEvent(this, components.events.ProvideToolbarModelEvent.TYPE));
                };
                return MyCoReLogoComponent;
            }(components.ViewerComponent));
            components.MyCoReLogoComponent = MyCoReLogoComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReLogoComponent);
console.log("LOGO MODULE");

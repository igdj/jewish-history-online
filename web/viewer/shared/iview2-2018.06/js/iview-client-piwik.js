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
            var MyCoRePiwikComponent = (function (_super) {
                __extends(MyCoRePiwikComponent, _super);
                function MyCoRePiwikComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this.initialized = false;
                }
                MyCoRePiwikComponent.prototype.handle = function (e) {
                    if (this.initialized == true && e.type == components.events.ImageChangedEvent.TYPE) {
                        var imageChangedEvent = e;
                        this.trackImage(imageChangedEvent.image.href);
                    }
                    else if (e.type == components.events.ComponentInitializedEvent.TYPE) {
                        var componentInitializedEvent = e;
                        if (ClassDescriber.ofEqualClass(componentInitializedEvent.component, this)) {
                            this.trackImage(this._settings.filePath);
                            this.initialized = true;
                        }
                    }
                };
                Object.defineProperty(MyCoRePiwikComponent.prototype, "handlesEvents", {
                    get: function () {
                        var handleEvents = new Array();
                        handleEvents.push(components.events.ImageChangedEvent.TYPE);
                        handleEvents.push(components.events.ComponentInitializedEvent.TYPE);
                        return handleEvents;
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoRePiwikComponent.prototype.trackImage = function (image) {
                    if (typeof Piwik !== 'undefined') {
                        var derivate = this._settings.derivate;
                        var trackURL = this._settings.webApplicationBaseURL + "/servlets/MCRIviewClient?derivate=" + derivate + "&page=" + image;
                        var tracker = Piwik.getAsyncTracker();
                        tracker.trackLink(trackURL, 'download');
                    }
                    else {
                        console.log("warn: unable to track image " + image + " cause Piwik js object is undefined");
                    }
                };
                MyCoRePiwikComponent.prototype.init = function () {
                    window["_paq"] = [];
                    var piwikURL = this._settings["MCR.Piwik.baseurl"];
                    if (piwikURL == null) {
                        console.log("Error: unable to get piwik base url (MCR.Piwik.baseurl)");
                    }
                    var pageID = this._settings["MCR.Piwik.id"];
                    if (pageID == null) {
                        console.log("Error: unable to get piwik id (MCR.Piwik.id)");
                    }
                    window["_paq"].push(["setTrackerUrl", piwikURL + "piwik.php"]);
                    window["_paq"].push(["setSiteId", pageID]);
                    var that = this;
                    jQuery.getScript(piwikURL + 'piwik.js', function () {
                        that.trigger(new components.events.ComponentInitializedEvent(that));
                    });
                };
                return MyCoRePiwikComponent;
            }(components.ViewerComponent));
            components.MyCoRePiwikComponent = MyCoRePiwikComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoRePiwikComponent);
console.log("PIWIK MODULE");

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
            var events;
            (function (events) {
                var DefaultViewerEvent = (function () {
                    function DefaultViewerEvent(_type) {
                        this._type = _type;
                    }
                    Object.defineProperty(DefaultViewerEvent.prototype, "type", {
                        get: function () {
                            return this._type;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return DefaultViewerEvent;
                }());
                events.DefaultViewerEvent = DefaultViewerEvent;
            })(events = widgets.events || (widgets.events = {}));
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
                var MyCoReImageViewerEvent = (function (_super) {
                    __extends(MyCoReImageViewerEvent, _super);
                    function MyCoReImageViewerEvent(component, type) {
                        _super.call(this, type);
                        this.component = component;
                    }
                    return MyCoReImageViewerEvent;
                }(mycore.viewer.widgets.events.DefaultViewerEvent));
                events.MyCoReImageViewerEvent = MyCoReImageViewerEvent;
            })(events = components.events || (components.events = {}));
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var VIEWER_COMPONENTS = IVIEW_COMPONENTS || [];
function addViewerComponent(component) {
    VIEWER_COMPONENTS.push(component);
}
function viewerClearTextSelection() {
    if (window.getSelection) {
        if (window.getSelection().empty) {
            window.getSelection().empty();
        }
        else if (window.getSelection().removeAllRanges) {
            window.getSelection().removeAllRanges();
        }
    }
}
function addIviewComponent(component) {
    console.warn("addIviewComponent shouldnt be used anymore!");
    VIEWER_COMPONENTS.push(component);
}
var ArrayIterator = (function () {
    function ArrayIterator(_array) {
        this._array = _array;
        this.iterator = 0;
    }
    ArrayIterator.prototype.hasPrevious = function () {
        return this.iterator != 0;
    };
    ArrayIterator.prototype.hasNext = function () {
        return this.iterator + 1 < this._array.length;
    };
    ArrayIterator.prototype.previous = function () {
        return this._array[--this.iterator];
    };
    ArrayIterator.prototype.next = function () {
        return this._array[++this.iterator];
    };
    ArrayIterator.prototype.current = function () {
        return this._array[this.iterator];
    };
    ArrayIterator.prototype.reset = function () {
        this.iterator = 0;
    };
    return ArrayIterator;
}());
var Position2D = (function () {
    function Position2D(_x, _y) {
        this._x = _x;
        this._y = _y;
    }
    Position2D.prototype.toString = function () {
        return this.x + ":" + this.y;
    };
    Position2D.prototype.move = function (vec) {
        return new Position2D(this._x + vec.x, this._y + vec.y);
    };
    Position2D.prototype.roundDown = function () {
        return new Position2D(Math.floor(this.x), Math.floor(this.y));
    };
    Position2D.prototype.roundUp = function () {
        return new Position2D(Math.ceil(this.x), Math.ceil(this.y));
    };
    Position2D.prototype.scale = function (scale) {
        return new Position2D(this._x * scale, this._y * scale);
    };
    Position2D.prototype.copy = function () {
        return new Position2D(this.x, this.y);
    };
    Position2D.fromString = function (str) {
        var values = str.split(':');
        return new Position2D(parseInt(values[0], 10), parseInt(values[1], 10));
    };
    Object.defineProperty(Position2D.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (x) {
            throw "x of position is unmodifyable!";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Position2D.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (y) {
            throw "y of position is unmodifyable!";
        },
        enumerable: true,
        configurable: true
    });
    Position2D.prototype.rotate = function (rotation) {
        var x = this._x;
        var y = this._y;
        switch (rotation) {
            case 90:
                var s = x;
                x = -y;
                y = s;
            case 180:
                var s = x;
                x = -y;
                y = s;
            case 270:
                var s = x;
                x = -1 * y;
                y = s;
            case 0:
        }
        return new Position2D(x, y);
    };
    Position2D.prototype.rotateAround = function (center, rotation) {
        rotation = rotation * -1;
        var diffX = (this.x - center.x);
        var diffY = (this.y - center.y);
        var x = center.x + diffX * Math.cos(rotation) - diffY * Math.sin(rotation);
        var y = center.y + diffX * Math.sin(rotation) + diffY * Math.cos(rotation);
        return new Position2D(x, y);
    };
    Position2D.prototype.toPosition3D = function (z) {
        return new Position3D(this.x, this.y, z);
    };
    Position2D.prototype.equals = function (p) {
        if ("x" in p && "y" in p) {
            return p.x == this.x && p.y == this.y;
        }
        else {
            return false;
        }
    };
    Position2D.prototype.min = function (x, y) {
        return new Position2D(Math.min(this.x, x), Math.min(this.y, y));
    };
    Position2D.prototype.max = function (x, y) {
        return new Position2D(Math.max(this.x, x), Math.max(this.y, y));
    };
    return Position2D;
}());
var MoveVector = (function (_super) {
    __extends(MoveVector, _super);
    function MoveVector(x, y) {
        _super.call(this, x, y);
    }
    return MoveVector;
}(Position2D));
var Position3D = (function () {
    function Position3D(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Position3D.prototype.toString = function () {
        return this.z + ":" + this.x + ":" + this.y;
    };
    Position3D.prototype.toPosition2D = function () {
        return new Position2D(this.x, this.y);
    };
    return Position3D;
}());
var Size2D = (function () {
    function Size2D(width, height) {
        this.width = width;
        this.height = height;
    }
    Size2D.prototype.toString = function () {
        return this.width + ":" + this.height;
    };
    Size2D.prototype.roundUp = function () {
        return new Size2D(Math.ceil(this.width), Math.ceil(this.height));
    };
    Size2D.prototype.scale = function (scale) {
        return new Size2D(this.width * scale, this.height * scale);
    };
    Size2D.prototype.copy = function () {
        return new Size2D(this.width, this.height);
    };
    Size2D.prototype.getRotated = function (deg) {
        if (deg == 0 || deg == 180) {
            return this.copy();
        }
        else {
            var rotatedSize = new Size2D(this.height, this.width);
            return rotatedSize;
        }
    };
    Size2D.prototype.maxSide = function () {
        return Math.max(this.width, this.height);
    };
    Size2D.prototype.getSurface = function () {
        return this.width * this.height;
    };
    Size2D.prototype.roundDown = function () {
        return new Size2D(Math.floor(this.width), Math.floor(this.height));
    };
    return Size2D;
}());
var Rect = (function () {
    function Rect(pos, size) {
        this.pos = pos;
        this.size = size;
    }
    Rect.prototype.getPoints = function () {
        return {
            upperLeft: this.pos,
            upperRight: new Position2D(this.pos.x + this.size.width, this.pos.y),
            lowerLeft: new Position2D(this.pos.x, this.pos.y + this.size.height),
            lowerRight: new Position2D(this.pos.x + this.size.width, this.pos.y + this.size.height)
        };
    };
    Rect.prototype.getX = function () {
        return this.pos.x;
    };
    Rect.prototype.getY = function () {
        return this.pos.y;
    };
    Rect.prototype.getWidth = function () {
        return this.size.width;
    };
    Rect.prototype.getHeight = function () {
        return this.size.height;
    };
    Rect.prototype.scale = function (scale) {
        return new Rect(this.pos.scale(scale), this.size.scale(scale));
    };
    Rect.prototype.getIntersection = function (r2) {
        var r1 = this;
        var xmin = Math.max(r1.pos.x, r2.pos.x);
        var xmax1 = r1.pos.x + r1.size.width;
        var xmax2 = r2.pos.x + r2.size.width;
        var xmax = Math.min(xmax1, xmax2);
        if (xmax > xmin) {
            var ymin = Math.max(r1.pos.y, r2.pos.y);
            var ymax1 = r1.pos.y + r1.size.height;
            var ymax2 = r2.pos.y + r2.size.height;
            var ymax = Math.min(ymax1, ymax2);
            if (ymax > ymin) {
                return new Rect(new Position2D(xmin, ymin), new Size2D(xmax - xmin, ymax - ymin));
            }
        }
        return null;
    };
    Rect.prototype.intersects = function (p) {
        return this.intersectsHorizontal(p.x) && this.intersectsVertical(p.y);
    };
    Rect.prototype.intersectsArea = function (other) {
        return (this.getX() < (other.getX() + other.getWidth()) &&
            other.getX() < (this.getX() + this.getWidth()) &&
            this.getY() < (other.getY() + other.getHeight()) &&
            other.getY() < (this.getY() + this.getHeight()));
    };
    Rect.prototype.intersectsVertical = function (y) {
        return y < this.pos.y + this.size.height && y > this.pos.y;
    };
    Rect.prototype.intersectsHorizontal = function (x) {
        return x < this.pos.x + this.size.width && x > this.pos.x;
    };
    Rect.prototype.rotate = function (deg) {
        return new Rect(this.pos.rotate(deg), this.size.getRotated(deg));
    };
    Rect.prototype.flipX = function () {
        var x = this.pos.x + this.size.width;
        var width = -this.size.width;
        return new Rect(new Position2D(x, this.pos.y), new Size2D(width, this.size.height));
    };
    Rect.prototype.flipY = function () {
        var y = this.pos.y + this.size.height;
        var height = -this.size.height;
        return new Rect(new Position2D(this.pos.x, y), new Size2D(this.size.width, height));
    };
    Rect.prototype.flip = function (deg) {
        if (deg == 90) {
            return this.flipX();
        }
        else if (deg == 180) {
            return this.flipX().flipY();
        }
        else if (deg == 270) {
            return this.flipY();
        }
        return this.copy();
    };
    Rect.prototype.equals = function (obj) {
        if (obj instanceof Rect || ("pos" in obj && "size" in obj && "_x" in obj.pos && "_y" in obj.pos
            && "width" in obj.size && "height" in obj.size)) {
            return obj.pos.x == this.pos.x && obj.pos.y == this.pos.y && obj.size.width == this.size.width && obj.size.height == this.size.height;
        }
    };
    Rect.prototype.contains = function (rect) {
        return rect.getX() >= this.getX() &&
            rect.getY() >= this.getY() &&
            rect.getX() + rect.getWidth() <= this.getX() + this.getWidth() &&
            rect.getY() + rect.getHeight() <= this.getY() + this.getHeight();
    };
    Rect.prototype.getMiddlePoint = function () {
        return new Position2D(this.pos.x + (this.size.width / 2), this.pos.y + (this.size.height / 2));
    };
    Rect.prototype.toString = function () {
        return this.pos.toString() + " - " + this.size.toString();
    };
    Rect.prototype.getRotated = function (deg) {
        var midPos = this.getMiddlePoint();
        var rotatedSize = this.size.getRotated(deg);
        var newUpperLeft = new Position2D(midPos.x - (rotatedSize.width / 2), midPos.y - (rotatedSize.height / 2));
        return new Rect(newUpperLeft, rotatedSize);
    };
    Rect.prototype.maximize = function (x, y, width, height) {
        var right1 = this.pos.x + this.size.width;
        var right2 = x + width;
        var bottom1 = this.pos.y + this.size.height;
        var bottom2 = y + height;
        var newX = x < this.pos.x ? x : this.pos.x;
        var newY = y < this.pos.y ? y : this.pos.y;
        var newWidth = Math.max(right1, right2) - newX;
        var newHeight = Math.max(bottom1, bottom2) - newY;
        return Rect.fromXYWH(newX, newY, newWidth, newHeight);
    };
    Rect.prototype.maximizeRect = function (other) {
        return this.maximize(other.getX(), other.getY(), other.getWidth(), other.getHeight());
    };
    Rect.prototype.increase = function (pixel) {
        var x = this.pos.x - pixel;
        var y = this.pos.y - pixel;
        var width = this.size.width + (2 * pixel);
        var height = this.size.height + (2 * pixel);
        return Rect.fromXYWH(x, y, width, height);
    };
    Rect.prototype.difference = function (rect) {
        var _this = this;
        var diffs = Rect.diff(this, rect);
        diffs = diffs
            .filter(function (rect) { return rect.getWidth() != 0 && rect.getHeight() != 0; })
            .filter(function (rect) { return _this.contains(rect); });
        return diffs;
    };
    Rect.prototype.copy = function () {
        return new Rect(this.pos.copy(), this.size.copy());
    };
    Rect.fromXYWH = function (x, y, width, height) {
        return new Rect(new Position2D(x, y), new Size2D(width, height));
    };
    Rect.fromULLR = function (upperLeft, lowerRight) {
        return new Rect(new Position2D(upperLeft.x, upperLeft.y), new Size2D(lowerRight.x - upperLeft.x, lowerRight.y - upperLeft.y));
    };
    Rect.getBounding = function () {
        var n = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            n[_i - 0] = arguments[_i];
        }
        var max = Math.pow(2, 31);
        var top = max, left = max, bottom = -max, right = -max;
        n.forEach(function (nthRect) {
            top = Math.min(top, nthRect.pos.y);
            bottom = Math.max(bottom, nthRect.pos.y + nthRect.size.height);
            left = Math.min(left, nthRect.pos.x);
            right = Math.max(right, nthRect.pos.x + nthRect.size.width);
        });
        return Rect.fromULLR(new Position2D(left, top), new Position2D(right, bottom));
    };
    Rect.diff = function (r, s) {
        var a = Math.min(r.getX(), s.getX());
        var b = Math.max(r.getX(), s.getX());
        var c = Math.min(r.getX() + r.getWidth(), s.getX() + s.getWidth());
        var d = Math.max(r.getX() + r.getWidth(), s.getX() + s.getWidth());
        var e = Math.min(r.getY(), s.getY());
        var f = Math.max(r.getY(), s.getY());
        var g = Math.min(r.getY() + r.getHeight(), s.getY() + s.getHeight());
        var h = Math.max(r.getY() + r.getHeight(), s.getY() + s.getHeight());
        var result = [];
        result[0] = Rect.fromULLR(new Position2D(a, e), new Position2D(b, f));
        result[1] = Rect.fromULLR(new Position2D(b, e), new Position2D(c, f));
        result[2] = Rect.fromULLR(new Position2D(c, e), new Position2D(d, f));
        result[3] = Rect.fromULLR(new Position2D(a, f), new Position2D(b, g));
        result[4] = Rect.fromULLR(new Position2D(c, f), new Position2D(d, g));
        result[5] = Rect.fromULLR(new Position2D(a, g), new Position2D(b, h));
        result[6] = Rect.fromULLR(new Position2D(b, g), new Position2D(c, h));
        result[7] = Rect.fromULLR(new Position2D(c, g), new Position2D(d, h));
        return result;
    };
    return Rect;
}());
var Utils = (function () {
    function Utils() {
    }
    Utils.canvasToImage = function (canvas) {
        var image = document.createElement("img");
        image.src = canvas.toDataURL();
        return image;
    };
    Utils.getVar = function (obj, path, defaultReturn, check) {
        if (defaultReturn === void 0) { defaultReturn = null; }
        if (check === void 0) { check = function (extracted) { return true; }; }
        if (path in obj) {
            if (check(obj[path])) {
                return obj[path];
            }
        }
        var pathPartEnd = path.indexOf(".");
        if (pathPartEnd == -1) {
            pathPartEnd = path.length;
        }
        var part = path.substring(0, pathPartEnd);
        if (part in obj && obj[part] != null && typeof obj[part] != "undefined") {
            if (pathPartEnd != path.length) {
                return Utils.getVar(obj[part], path.substring(part.length + 1), defaultReturn, check);
            }
            else {
                if (check(obj[part])) {
                    return obj[part];
                }
            }
        }
        return defaultReturn;
    };
    Utils.synchronize = function (conditions, then) {
        return function (synchronizeObj) {
            var matchingConditions = conditions.filter(function (condition) {
                return condition(synchronizeObj);
            });
            if (matchingConditions.length == conditions.length) {
                then(synchronizeObj);
            }
        };
    };
    Utils.createRandomId = function () {
        return "nnnnnn-nnnn-nnnn-nnnnnnnn".split("n").map(function (n) {
            return n + Math.ceil(15 * Math.random()).toString(36);
        }).join("");
    };
    Utils.hash = function (str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return hash;
    };
    Utils.selectElementText = function (element) {
        element.select();
    };
    Utils.LOG_HALF = Math.log(1 / 2);
    Utils.stopPropagation = function (e) {
        e.stopImmediatePropagation();
    };
    return Utils;
}());
var MyCoReMap = (function () {
    function MyCoReMap(arr) {
        this.keyMap = {};
        this.valueMap = {};
        this.keyToHashFunction = MyCoReMap.BASE_KEY_TO_HASH_FUNCTION;
        if (typeof arr != "undefined") {
            for (var key in arr) {
                this.set(key, arr[key]);
            }
        }
    }
    MyCoReMap.prototype.set = function (key, value) {
        var hash = this.getHash(key);
        this.keyMap[hash] = key;
        this.valueMap[hash] = value;
    };
    MyCoReMap.prototype.get = function (key) {
        return this.valueMap[this.getHash(key)];
    };
    MyCoReMap.prototype.setKeyToHashFunction = function (keyToHashFunction) {
        this.keyToHashFunction = keyToHashFunction;
    };
    MyCoReMap.prototype.hasThen = function (key, consumer) {
        if (this.has(key)) {
            consumer(this.get(key));
        }
    };
    Object.defineProperty(MyCoReMap.prototype, "keys", {
        get: function () {
            var keys = [];
            for (var hash in this.keyMap) {
                keys.push(this.keyMap[hash]);
            }
            return keys;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MyCoReMap.prototype, "values", {
        get: function () {
            var values = [];
            for (var hash in this.valueMap) {
                values.push(this.valueMap[hash]);
            }
            return values;
        },
        enumerable: true,
        configurable: true
    });
    MyCoReMap.prototype.has = function (key) {
        if (typeof key == "undefined" || key == null) {
            return false;
        }
        var value = this.valueMap[this.getHash(key)];
        return typeof value != "undefined" && value != null;
    };
    MyCoReMap.prototype.forEach = function (call) {
        var _this = this;
        this.keys.forEach(function (key) {
            call(key, _this.get(key));
        });
    };
    MyCoReMap.prototype.filter = function (call) {
        var newMap = new MyCoReMap();
        this.forEach(function (key, value) {
            if (call(key, value)) {
                newMap.set(key, value);
            }
        });
        return newMap;
    };
    MyCoReMap.prototype.copy = function () {
        var copy = new MyCoReMap();
        this.forEach(function (key, value) {
            copy.set(key, value);
        });
        return copy;
    };
    MyCoReMap.prototype.remove = function (key) {
        var hash = this.getHash(key);
        delete this.keyMap[hash];
        delete this.valueMap[hash];
    };
    MyCoReMap.prototype.clear = function () {
        this.keyMap = {};
        this.valueMap = {};
    };
    MyCoReMap.prototype.mergeIn = function () {
        var maps = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            maps[_i - 0] = arguments[_i];
        }
        var that = this;
        for (var mapIndex in maps) {
            var currentMap = maps[mapIndex];
            currentMap.forEach(function (k, v) {
                that.set(k, v);
            });
        }
    };
    MyCoReMap.prototype.isEmpty = function () {
        return Object.keys(this.keyMap).length <= 0;
    };
    MyCoReMap.prototype.getHash = function (key) {
        return MyCoReMap.KEY_PREFIX + this.keyToHashFunction(key);
    };
    MyCoReMap.BASE_KEY_TO_HASH_FUNCTION = function (key) {
        return key.toString();
    };
    MyCoReMap.KEY_PREFIX = "MyCoReMap.";
    return MyCoReMap;
}());
var ViewerError = (function () {
    function ViewerError(message, error) {
        if (error === void 0) { error = null; }
        this.informations = new MyCoReMap();
        this.informations.set("message", message);
        this.informations.set("error", error);
        this.informations.set("callee", arguments.callee);
        console.log(this.toString());
        console.trace();
    }
    ViewerError.prototype.toString = function () {
        return this.informations.get("message");
    };
    return ViewerError;
}());
var ViewerProperty = (function () {
    function ViewerProperty(_from, _name, _value) {
        if (_value === void 0) { _value = null; }
        this._from = _from;
        this._name = _name;
        this._value = _value;
        this.propertyChanging = false;
        this.observerArray = new Array();
    }
    Object.defineProperty(ViewerProperty.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewerProperty.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            var old = this.clone();
            this._value = value;
            this.notifyPropertyChanged(old, this);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewerProperty.prototype, "from", {
        get: function () {
            return this._from;
        },
        enumerable: true,
        configurable: true
    });
    ViewerProperty.prototype.clone = function () {
        return new ViewerProperty(this._from, this.name, this.value);
    };
    ViewerProperty.prototype.removeAllObserver = function () {
        while (this.observerArray.pop())
            ;
    };
    ViewerProperty.prototype.removeObserver = function (observer) {
        var index = this.observerArray.indexOf(observer);
        this.observerArray.splice(index, 1);
    };
    ViewerProperty.prototype.addObserver = function (observer) {
        this.observerArray.push(observer);
    };
    ViewerProperty.prototype.notifyPropertyChanged = function (_old, _new) {
        var _this = this;
        this.propertyChanging = true;
        this.observerArray.forEach(function (element) {
            if (_this.propertyChanging) {
                element.propertyChanged(_old, _new);
            }
        });
        this.propertyChanging = false;
    };
    return ViewerProperty;
}());
function ViewerFormatString(pattern, args) {
    var replaceArg = function (pattern, i, arg) { return pattern.replace("{" + i + "}", arg); };
    var resultPattern = pattern;
    for (var index in args) {
        resultPattern = replaceArg(resultPattern, index, args[index]);
    }
    return resultPattern;
}
var viewerRequestAnimationFrame = (function (window_) {
    if (window_ === void 0) { window_ = window; }
    return window.requestAnimationFrame ||
        window_.webkitRequestAnimationFrame ||
        window_.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})(window);
var viewerCancelRequestAnimationFrame = (function (window_) {
    if (window_ === void 0) { window_ = window; }
    return window.cancelAnimationFrame ||
        window_.webkitCancelRequestAnimationFrame ||
        window_.mozCancelRequestAnimationFrame ||
        function (callback) {
            window.clearTimeout(callback);
        };
})(window);
var ViewerUserSettingStore = (function () {
    function ViewerUserSettingStore() {
        if (typeof ViewerUserSettingStore._INSTANCE !== "undefined" && ViewerUserSettingStore._INSTANCE !== null) {
            throw new ViewerError("Its a Singleton use instance instead!");
        }
        this._browserStorageSupport = typeof Storage !== "undefined";
        if (!this.browserStorageSupport) {
            this._sessionMap = new MyCoReMap();
        }
    }
    ViewerUserSettingStore.getInstance = function () {
        if (typeof ViewerUserSettingStore._INSTANCE == "undefined" || ViewerUserSettingStore._INSTANCE == null) {
            ViewerUserSettingStore._INSTANCE = new ViewerUserSettingStore();
        }
        return ViewerUserSettingStore._INSTANCE;
    };
    ViewerUserSettingStore.prototype.getValue = function (key) {
        if (this.browserStorageSupport) {
            return window.localStorage.getItem(key);
        }
        else {
            return this._sessionMap.get(key);
        }
    };
    ViewerUserSettingStore.prototype.setValue = function (key, value) {
        if (this.browserStorageSupport) {
            window.localStorage.setItem(key, value);
        }
        else {
            this._sessionMap.set(key, value);
        }
    };
    ViewerUserSettingStore.prototype.hasValue = function (key) {
        if (this.browserStorageSupport) {
            return window.localStorage.getItem(key) !== null;
        }
        else {
            return this._sessionMap.has(key);
        }
    };
    Object.defineProperty(ViewerUserSettingStore.prototype, "browserStorageSupport", {
        get: function () {
            return this._browserStorageSupport;
        },
        enumerable: true,
        configurable: true
    });
    ViewerUserSettingStore.LOCK = false;
    return ViewerUserSettingStore;
}());
function isFullscreen() {
    var d = document;
    return d.fullscreenElement != null || d.webkitFullscreenElement != null;
}
var viewerDeviceSupportTouch = ('ontouchstart' in window);
function viewerCrossBrowserWheel(element, handler) {
    var internHandler = function (e) {
        e.preventDefault();
        var x = (e.clientX - jQuery(element).offset().left);
        var y = (e.clientY - jQuery(element).offset().top);
        var pos = new Position2D(x, y).scale(window.devicePixelRatio);
        if ("deltaX" in e) {
            handler({ deltaX: e.deltaX, deltaY: e.deltaY, orig: e, pos: pos, altKey: e.altKey, ctrlKey: e.ctrlKey });
            return;
        }
        var horizontal = e.shiftKey;
        if ("axis" in e) {
            horizontal = (e.axis == 1);
            if ("detail" in e) {
                var pixel = e.detail;
                var obj = { deltaX: 0, deltaY: 0, orig: e, pos: pos, altKey: e.altKey, ctrlKey: e.ctrlKey };
                if (horizontal) {
                    obj.deltaX = pixel;
                }
                else {
                    obj.deltaY = pixel;
                }
                handler(obj);
                return;
            }
        }
        if ("wheelDelta" in e) {
            var val = -e.wheelDelta;
            var deltaObj = ((e.shiftKey) ? { "deltaX": val, "deltaY": 0 } : { "deltaX": 0, "deltaY": val });
            deltaObj.orig = e;
            deltaObj.pos = pos;
            deltaObj.altKey = e.altKey;
            handler(deltaObj);
        }
    };
    if (element.addEventListener) {
        element.addEventListener("mousewheel", internHandler, false);
        element.addEventListener("MozMousePixelScroll", internHandler, false);
    }
}
var ViewerPromise = (function () {
    function ViewerPromise() {
        this._result = null;
        this._rejectReason = null;
        this._then = ViewerPromise.DEFAULT;
        this._onReject = ViewerPromise.DEFAULT;
    }
    ViewerPromise.prototype.then = function (handler) {
        this._then = handler;
        if (this._result != null) {
            handler(this._result);
        }
        return;
    };
    ViewerPromise.prototype.onreject = function (handler) {
        this._onReject = handler;
        if (this._rejectReason != null) {
            this._onReject(this._rejectReason);
        }
    };
    ViewerPromise.prototype.reject = function (reason) {
        this._rejectReason = reason;
        if (this._onReject != ViewerPromise.DEFAULT) {
            (this._onReject)(reason);
        }
        return;
    };
    ViewerPromise.prototype.resolve = function (reason) {
        this._result = reason;
        if (this._then != ViewerPromise.DEFAULT) {
            (this._then)(reason);
        }
        return;
    };
    ViewerPromise.DEFAULT = function (aAny) {
    };
    return ViewerPromise;
}());
var ViewerParameterMap = (function (_super) {
    __extends(ViewerParameterMap, _super);
    function ViewerParameterMap() {
        _super.call(this);
    }
    ViewerParameterMap.prototype.toParameterString = function () {
        var stringBuilder = new Array();
        this.forEach(function (key, value) {
            stringBuilder.push(key + "=" + value);
        });
        var s = stringBuilder.join("&");
        return s.length > 0 ? "?" + s : "";
    };
    ViewerParameterMap.fromCurrentUrl = function () {
        return ViewerParameterMap.fromUrl(window.location.href);
    };
    ViewerParameterMap.fromUrl = function (url) {
        var map = new ViewerParameterMap();
        var parameter = url.split("?")[1];
        if (typeof parameter != "undefined") {
            var parameterWithoutHash = parameter.split("#")[0];
            var mapElements = parameter.split("&");
            for (var currentElementIndex in mapElements) {
                var currentElement = mapElements[currentElementIndex];
                var keyValueArray = currentElement.split("=");
                map.set(keyValueArray[0], decodeURIComponent(keyValueArray[1]));
            }
        }
        return map;
    };
    return ViewerParameterMap;
}(MyCoReMap));
function singleSelectShim(xml, xpath, nsMap) {
    if ('evaluate' in document) {
        var nsResolver = function (nsPrefix) {
            return nsMap.get(nsPrefix);
        };
        return xml.evaluate(xpath, xml.documentElement, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    else {
        var documentAsMSXML = new ActiveXObject('Msxml2.DOMDocument.6.0');
        documentAsMSXML.async = false;
        documentAsMSXML.load(xml);
        var nsCollector_1 = '';
        nsMap.keys.forEach(function (key) {
            var part = 'xmlns:' + key + '="' + nsMap.get(key) + '" ';
            nsCollector_1 = nsCollector_1 + part;
        });
        documentAsMSXML.setProperty('SelectionNamespaces', nsCollector_1);
        documentAsMSXML.setProperty('SelectionLanguage', 'XPath');
        return documentAsMSXML.documentElement.selectSingleNode(xpath);
    }
}
function getNodesShim(xml, xpathExpression, contextNode, nsMap, resultType, result) {
    if ('evaluate' in document) {
        var nsResolver = function (nsPrefix) {
            return nsMap.get(nsPrefix);
        };
        var resultList = xml.evaluate(xpathExpression, contextNode, nsResolver, resultType, result);
        var nodeArray = [];
        var next = void 0;
        while ((next = resultList.iterateNext()) != null) {
            nodeArray.push(next);
        }
        return nodeArray;
    }
    else {
        var documentAsMSXML = new ActiveXObject('Msxml2.DOMDocument.6.0');
        documentAsMSXML.async = false;
        documentAsMSXML.load(xml);
        var nsCollector_2 = '';
        nsMap.keys.forEach(function (key) {
            var part = 'xmlns:' + key + '="' + nsMap.get(key) + '" ';
            nsCollector_2 = nsCollector_2 + part;
        });
        documentAsMSXML.setProperty('SelectionNamespaces', nsCollector_2);
        documentAsMSXML.setProperty('SelectionLanguage', 'XPath');
        var resultList = documentAsMSXML.documentElement.selectNodes(xpathExpression);
        var nodeArray = [];
        for (var i = 0; i < resultList.length; i++) {
            nodeArray.push(resultList.nextNode());
        }
        return nodeArray;
    }
}
var XMLUtil = (function () {
    function XMLUtil() {
    }
    XMLUtil.iterateChildNodes = function (element, iter) {
        var childNodes = element.childNodes;
        for (var i = 0; i < childNodes.length; i++) {
            iter(childNodes.item(i));
        }
    };
    XMLUtil.nodeListToNodeArray = function (nodeList) {
        var array = new Array();
        for (var i = 0; i < nodeList.length; i++) {
            array.push(nodeList.item(i));
        }
        return array;
    };
    XMLUtil.getOneChild = function (element, isTheOne) {
        var childNodes = element.childNodes;
        return XMLUtil.getOneOf(childNodes, isTheOne);
    };
    XMLUtil.getOneOf = function (childNodes, isTheOne) {
        for (var i = 0; i < childNodes.length; i++) {
            var currentChild = childNodes.item(i);
            if (isTheOne(currentChild))
                return currentChild;
        }
        return null;
    };
    XMLUtil.METS_NAMESPACE_URI = "http://www.loc.gov/METS/";
    XMLUtil.XLINK_NAMESPACE_URI = "http://www.w3.org/1999/xlink";
    XMLUtil.NS_MAP = (function () {
        var nsMap = new MyCoReMap();
        nsMap.set("mets", XMLUtil.METS_NAMESPACE_URI);
        nsMap.set("xlink", XMLUtil.XLINK_NAMESPACE_URI);
        return nsMap;
    })();
    return XMLUtil;
}());
var ClassDescriber = (function () {
    function ClassDescriber() {
    }
    ClassDescriber.getName = function (inputClass) {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(inputClass.constructor.toString());
        return (results && results.length > 1) ? results[1] : "";
    };
    ClassDescriber.ofEqualClass = function (class1, class2) {
        return ClassDescriber.getName(class1) == ClassDescriber.getName(class2);
    };
    return ClassDescriber;
}());
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var canvas;
            (function (canvas) {
                var Viewport = (function () {
                    function Viewport() {
                        this._currentAnimation = null;
                        this._lastAnimTime = -1;
                        this.positionProperty = new ViewerProperty(this, "_position", new Position2D(0, 0));
                        this.sizeProperty = new ViewerProperty(this, "_position", new Size2D(0, 0));
                        this.rotationProperty = new ViewerProperty(this, "_rotation", 0);
                        this.scaleProperty = new ViewerProperty(this, "_scale", 1);
                    }
                    Object.defineProperty(Viewport.prototype, "scale", {
                        get: function () {
                            return this.scaleProperty.value;
                        },
                        set: function (val) {
                            if (val == 0 || typeof val == "undefined" || val == null || isNaN(val)) {
                                throw new ViewerError("The scale of viewport is not valid!", val);
                            }
                            this.scaleProperty.value = val;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Viewport.prototype, "rotation", {
                        get: function () {
                            return this.rotationProperty.value;
                        },
                        set: function (val) {
                            if (val != 0 && val != 90 && val != 180 && val != 270) {
                                throw new ViewerError("The rotation of viewport is not valid!", val);
                            }
                            this.rotationProperty.value = val;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Viewport.prototype, "size", {
                        get: function () {
                            return this.sizeProperty.value;
                        },
                        set: function (val) {
                            if (typeof val == "undefined" || val == null || isNaN(val.width) || isNaN(val.height)) {
                                throw new ViewerError("The size of viewport is not valid!", val);
                            }
                            this.sizeProperty.value = val;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Viewport.prototype, "position", {
                        get: function () {
                            return this.positionProperty.value;
                        },
                        set: function (val) {
                            if (typeof val == "undefined" || val == null || isNaN(val.x) || isNaN(val.y)) {
                                throw new ViewerError("The position of viewport is not valid!", val);
                            }
                            this.positionProperty.value = val;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Viewport.prototype.asRectInArea = function () {
                        var realSize = this.size.getRotated(this.rotation).scale(1 / this.scale);
                        return new Rect(new Position2D(this.position.x - (realSize.width / 2), this.position.y - (realSize.height / 2)), realSize);
                    };
                    Viewport.prototype.startAnimation = function (anim) {
                        this._currentAnimation = anim;
                        this._lastAnimTime = new Date().valueOf();
                        this.scale = this.scale;
                    };
                    Viewport.prototype.getAbsolutePosition = function (positionInViewport) {
                        var rectPoints = this.asRectInArea().getPoints();
                        var upperLeftPosition = rectPoints.upperLeft;
                        switch (this.rotation) {
                            case 90:
                                upperLeftPosition = rectPoints.lowerLeft;
                                break;
                            case 180:
                                upperLeftPosition = rectPoints.lowerRight;
                                break;
                            case 270:
                                upperLeftPosition = rectPoints.upperRight;
                                break;
                        }
                        var scaledPositionInViewport = positionInViewport.scale(1 / this.scale).rotate(this.rotation);
                        return new Position2D(upperLeftPosition.x + scaledPositionInViewport.x, upperLeftPosition.y + scaledPositionInViewport.y);
                    };
                    Viewport.prototype.stopAnimation = function () {
                        this._currentAnimation = null;
                    };
                    Viewport.prototype.updateAnimation = function () {
                        if (this._currentAnimation != null) {
                            var currentAnimTime = new Date().valueOf();
                            if (this._currentAnimation.updateAnimation(currentAnimTime - this._lastAnimTime)) {
                                this._currentAnimation = null;
                            }
                            else {
                                this._lastAnimTime = new Date().valueOf();
                            }
                        }
                    };
                    Object.defineProperty(Viewport.prototype, "currentAnimation", {
                        get: function () {
                            return this._currentAnimation;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Viewport.prototype.setRect = function (rect) {
                        if (this.size.width > 0 && this.size.height > 0) {
                            this.scale = Math.min(this.size.width / rect.size.width, this.size.height / rect.size.height);
                        }
                        this.position = rect.getMiddlePoint();
                    };
                    return Viewport;
                }());
                canvas.Viewport = Viewport;
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
                var PageArea = (function () {
                    function PageArea() {
                        this._pages = new Array();
                        this._pageAreaInformationMap = new MyCoReMap();
                        this._updateCallback = null;
                    }
                    Object.defineProperty(PageArea.prototype, "updateCallback", {
                        get: function () {
                            if (this._updateCallback == null) {
                                return function () {
                                };
                            }
                            return this._updateCallback;
                        },
                        set: function (callback) {
                            this._updateCallback = callback;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    PageArea.prototype.addPage = function (page, info) {
                        this.setPageAreaInformation(page, info);
                        this._pages.push(page);
                        this.registerPageAreaInformationEvents(info);
                        this.updateCallback();
                    };
                    PageArea.prototype.removePage = function (page) {
                        this._pages.splice(this._pages.indexOf(page), 1);
                        var pageInformation = this._pageAreaInformationMap.get(page);
                        this._pageAreaInformationMap.remove(page);
                        this.unregisterPageAreaInformationEvents(pageInformation);
                        this.updateCallback();
                    };
                    PageArea.prototype.propertyChanged = function (_old, _new) {
                        this._updateCallback();
                    };
                    PageArea.prototype.setPageAreaInformation = function (page, info) {
                        this._pageAreaInformationMap.set(page, info);
                    };
                    PageArea.prototype.getPages = function () {
                        return this._pages;
                    };
                    PageArea.prototype.getPagesInViewport = function (viewPort) {
                        var _this = this;
                        var pages = this._pages;
                        var pagesInViewport = new Array();
                        pages.forEach(function (page) {
                            if (_this.pageIntersectViewport(page, viewPort)) {
                                pagesInViewport.push(page);
                            }
                        });
                        return pagesInViewport;
                    };
                    PageArea.prototype.getPageInformation = function (page) {
                        return this._pageAreaInformationMap.get(page);
                    };
                    PageArea.prototype.pageIntersectViewport = function (page, viewPort) {
                        var areaInformation = this._pageAreaInformationMap.get(page);
                        var pageDimension = page.size.getRotated(areaInformation.rotation).scale(areaInformation.scale);
                        var upperLeftPosition = new Position2D(areaInformation.position.x - pageDimension.width / 2, areaInformation.position.y - pageDimension.height / 2);
                        var pageRect = new Rect(upperLeftPosition, pageDimension);
                        var viewPortRect = viewPort.asRectInArea();
                        return pageRect.getIntersection(viewPortRect) != null;
                    };
                    PageArea.prototype.registerPageAreaInformationEvents = function (info) {
                        info.positionProperty.addObserver(this);
                        info.rotationProperty.addObserver(this);
                        info.scaleProperty.addObserver(this);
                    };
                    PageArea.prototype.unregisterPageAreaInformationEvents = function (info) {
                        info.positionProperty.removeObserver(this);
                        info.rotationProperty.removeObserver(this);
                        info.scaleProperty.removeObserver(this);
                    };
                    return PageArea;
                }());
                canvas.PageArea = PageArea;
                var PageAreaInformation = (function () {
                    function PageAreaInformation() {
                        this._positionProperty = new ViewerProperty(this, "position", new Position2D(0, 0));
                        this._scaleProperty = new ViewerProperty(this, "scale", 1);
                        this._rotationProperty = new ViewerProperty(this, "rotation", 0);
                    }
                    Object.defineProperty(PageAreaInformation.prototype, "positionProperty", {
                        get: function () {
                            return this._positionProperty;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(PageAreaInformation.prototype, "rotationProperty", {
                        get: function () {
                            return this._rotationProperty;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(PageAreaInformation.prototype, "scaleProperty", {
                        get: function () {
                            return this._scaleProperty;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(PageAreaInformation.prototype, "rotation", {
                        get: function () {
                            return this._rotationProperty.value;
                        },
                        set: function (value) {
                            this.rotationProperty.value = value;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(PageAreaInformation.prototype, "scale", {
                        get: function () {
                            return this.scaleProperty.value;
                        },
                        set: function (value) {
                            this.scaleProperty.value = value;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(PageAreaInformation.prototype, "position", {
                        get: function () {
                            return this.positionProperty.value;
                        },
                        set: function (value) {
                            this.positionProperty.value = value;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return PageAreaInformation;
                }());
                canvas.PageAreaInformation = PageAreaInformation;
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
                var ViewportTools = (function () {
                    function ViewportTools() {
                    }
                    ViewportTools.centerViewportOnPage = function (vp, pageAreaInformation) {
                        vp.position = pageAreaInformation.position;
                    };
                    ViewportTools.fitViewportOverPage = function (vp, pageAreaInformation, page) {
                        if (vp.size.width != 0 && vp.size.height != 0) {
                            ViewportTools.centerViewportOnPage(vp, pageAreaInformation);
                            var vpRotated = vp.size.getRotated(vp.rotation);
                            vp.scale = Math.min(vpRotated.width / page.size.width, vpRotated.height / page.size.height);
                        }
                        else {
                            var changeObs = {
                                propertyChanged: function (_old, _new) {
                                    ViewportTools.fitViewportOverPage(vp, pageAreaInformation, page);
                                    vp.sizeProperty.removeObserver(changeObs);
                                }
                            };
                            vp.sizeProperty.addObserver(changeObs);
                        }
                    };
                    ViewportTools.fitViewportOverPageWidth = function (vp, pageAreaInformation, page) {
                        if (vp.size.width != 0 && vp.size.height != 0) {
                            var pageSize = page.size.getRotated(vp.rotation).scale(pageAreaInformation.scale);
                            vp.scale = vp.size.width / (pageSize.width);
                            var vpSize = vp.size.getRotated(vp.rotation);
                            var vpPosition = (vp.rotation == 0 || vp.rotation == 180) ? vp.position : new Position2D(vp.position.y, vp.position.x);
                            var yPosition = Math.max(vpPosition.y, pageAreaInformation.position.y - (pageSize.height / 2) + vp.size.scale(1 / vp.scale).height / 2);
                            yPosition = Math.min(yPosition, pageAreaInformation.position.y + (pageSize.height / 2) - vp.size.scale(1 / vp.scale).height / 2);
                            if (vp.size.height > pageSize.scale(vp.scale).width) {
                                yPosition = 0;
                            }
                            if (vp.rotation == 0 || vp.rotation == 180) {
                                vp.position = new Position2D(pageAreaInformation.position.x, yPosition);
                            }
                            else {
                                vp.position = new Position2D(yPosition, pageAreaInformation.position.x);
                            }
                        }
                    };
                    return ViewportTools;
                }());
                canvas.ViewportTools = ViewportTools;
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
                var StatefulAnimation = (function () {
                    function StatefulAnimation() {
                        this.isRunning = false;
                        this.isFinished = false;
                        this.isPaused = false;
                        this.totalElapsedTime = 0;
                    }
                    StatefulAnimation.prototype.updateAnimation = function (elapsedTime) {
                        if (this.isPaused || this.isFinished) {
                            return this.isFinished;
                        }
                        if (!this.isRunning) {
                            elapsedTime = 0;
                            this.totalElapsedTime = 0;
                        }
                        this.totalElapsedTime += elapsedTime;
                        this.isFinished = this.update(elapsedTime);
                        this.isRunning = !this.isFinished;
                        return this.isFinished;
                    };
                    StatefulAnimation.prototype.pause = function () {
                        this.isPaused = true;
                    };
                    StatefulAnimation.prototype.continue = function () {
                        this.isPaused = false;
                    };
                    return StatefulAnimation;
                }());
                canvas.StatefulAnimation = StatefulAnimation;
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
                var InterpolationAnimation = (function (_super) {
                    __extends(InterpolationAnimation, _super);
                    function InterpolationAnimation(duration, from, to, interpolationFunction) {
                        if (interpolationFunction === void 0) { interpolationFunction = linearInterpolation; }
                        _super.call(this);
                        this.duration = duration;
                        this.from = from;
                        this.to = to;
                        this.interpolationFunction = interpolationFunction;
                        this.value = this.from;
                    }
                    InterpolationAnimation.prototype.update = function (elapsedTime) {
                        if (this.totalElapsedTime >= this.duration) {
                            this.totalElapsedTime = this.duration;
                            this.value = this.to;
                            return true;
                        }
                        var progress = this.totalElapsedTime / this.duration;
                        this.value = this.interpolationFunction(this.from, this.to, progress);
                        return false;
                    };
                    return InterpolationAnimation;
                }(canvas.StatefulAnimation));
                canvas.InterpolationAnimation = InterpolationAnimation;
                function linearInterpolation(from, to, progress) {
                    return from + ((to - from) * progress);
                }
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
                var HtmlRenderer = (function () {
                    function HtmlRenderer(_vp, _area, _view) {
                        this._vp = _vp;
                        this._area = _area;
                        this._view = _view;
                        this._addedPages = new Array();
                        this._pageElementCache = new MyCoReMap();
                        this._idPageMap = new MyCoReMap();
                        this._addedContentMap = new MyCoReMap();
                        this.htmlContainer = document.createElement("div");
                        this.htmlContainer.setAttribute("class", "textContainer");
                        var htmlElement = this._view.container[0];
                        htmlElement.appendChild(this.htmlContainer);
                    }
                    HtmlRenderer.prototype.update = function () {
                        var _this = this;
                        var pagesInViewport = this._area.getPagesInViewport(this._vp);
                        pagesInViewport.forEach(function (page) {
                            if (!_this._idPageMap.has(page.id)) {
                                _this._idPageMap.set(page.id, page);
                            }
                            if (_this._addedPages.indexOf(page) == -1) {
                                _this.addPage(page);
                            }
                            if (!_this._addedContentMap.has(page)) {
                                if ("getHTMLContent" in page) {
                                    var content = page.getHTMLContent();
                                    _this._addedContentMap.set(page, content);
                                    var observer = {
                                        propertyChanged: function (_old, _new) {
                                            if (_new.value != null) {
                                                var htmlElement = _this._pageElementCache.get(page);
                                                var root = htmlElement.querySelector("div div");
                                                root.innerHTML = "";
                                                root.appendChild(_new.value);
                                            }
                                        }
                                    };
                                    content.addObserver(observer);
                                    observer.propertyChanged(null, content);
                                }
                            }
                            _this.updatePage(page);
                        });
                        this._addedPages.forEach(function (p) {
                            if (pagesInViewport.indexOf(p) == -1) {
                                _this.removePage(p);
                            }
                        });
                    };
                    HtmlRenderer.prototype.updatePage = function (page) {
                        var pai = this._area.getPageInformation(page);
                        var size = page.size.scale(pai.scale);
                        var halfSize = size.scale(0.5);
                        var pageRect = new Rect(new Position2D(pai.position.x - halfSize.width, pai.position.y - halfSize.height), size);
                        var vpRect = this._vp.asRectInArea();
                        var dpr = (window.devicePixelRatio || 1);
                        var pagePos = new Position2D(pageRect.pos.x - vpRect.pos.x, pageRect.pos.y - vpRect.pos.y);
                        var scaledPagePos = pagePos.scale(this._vp.scale / dpr);
                        var pe = this._pageElementCache.get(page);
                        var realSize = size.scale(1 / pai.scale);
                        pe.style.cssText =
                            "\n                position: absolute;\n                transform-origin : 0% 0%;\n                width : " + realSize.width + "px;\n                height : " + realSize.height + "px;\n                transform : translate(" + Math.round(scaledPagePos.x) + "px," + Math.round(scaledPagePos.y) + "px) scale(" + pai.scale * this._vp.scale / dpr + ");\n                ";
                        var childrenElement = pe.children[0];
                        childrenElement.style.cssText = "transform : rotate(" + pai.rotation + "deg);" +
                            "width: " + realSize.width + "px;" +
                            "height: " + realSize.height + "px;" +
                            "background-color : transparent;";
                    };
                    HtmlRenderer.prototype.addPage = function (page) {
                        if (!this._pageElementCache.has(page)) {
                            this.createPageElement(page);
                        }
                        var pageElement = this._pageElementCache.get(page);
                        this._addedPages.push(page);
                        this.htmlContainer.appendChild(pageElement);
                    };
                    HtmlRenderer.prototype.createPageElement = function (page) {
                        var pageElement = document.createElement("div");
                        var childPageElement = (pageElement.cloneNode());
                        pageElement.appendChild(childPageElement);
                        this._pageElementCache.set(page, pageElement);
                    };
                    HtmlRenderer.prototype.removePage = function (page) {
                        this._addedPages.splice(this._addedPages.indexOf(page), 1);
                        var textContent = this._pageElementCache.get(page);
                        textContent.parentElement.removeChild(textContent);
                    };
                    return HtmlRenderer;
                }());
                canvas.HtmlRenderer = HtmlRenderer;
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
                var TextRenderer = (function () {
                    function TextRenderer(_vp, _area, _view, _textContentProvider, pageLinkClicked) {
                        this._vp = _vp;
                        this._area = _area;
                        this._view = _view;
                        this._textContentProvider = _textContentProvider;
                        this.pageLinkClicked = pageLinkClicked;
                        this._contentCache = new MyCoReMap();
                        this._callbackRunning = new MyCoReMap();
                        this._addedPages = new Array();
                        this._elementCache = new MyCoReMap();
                        this._pageElementCache = new MyCoReMap();
                        this._lineElementMap = new MyCoReMap();
                        this._highlightWordMap = null;
                        this._idPageMap = new MyCoReMap();
                        this._mesureCanvas = document.createElement("canvas").getContext("2d");
                        this.textContainer = document.createElement("div");
                        this.textContainer.style.cssText = "line-height: 1;" +
                            "white-space: pre;" +
                            "font-family: sans-serif";
                        this.textContainer.setAttribute("class", "textContainer");
                        var htmlElement = this._view.container[0];
                        htmlElement.appendChild(this.textContainer);
                    }
                    TextRenderer.prototype.update = function () {
                        var _this = this;
                        var pagesInViewport = this._area.getPagesInViewport(this._vp);
                        pagesInViewport.forEach(function (page) {
                            if (!_this._idPageMap.has(page.id)) {
                                _this._idPageMap.set(page.id, page);
                            }
                            if (_this._addedPages.indexOf(page) == -1) {
                                _this.addPage(page);
                            }
                            if (!_this._contentCache.has(page) && !_this._callbackRunning.has(page)) {
                                var promise = _this._textContentProvider(page, function (content) {
                                    _this._contentCache.set(page, content);
                                    _this.addPageParts(page, content);
                                });
                                _this._callbackRunning.set(page, true);
                            }
                            else if (_this._contentCache.has(page)) {
                                _this.updatePage(page);
                            }
                        });
                        this._addedPages.forEach(function (p) {
                            if (pagesInViewport.indexOf(p) == -1) {
                                _this.removePage(p);
                            }
                        });
                    };
                    TextRenderer.prototype.updatePage = function (page) {
                        var pai = this._area.getPageInformation(page);
                        var size = page.size.scale(pai.scale);
                        var halfSize = size.scale(0.5);
                        var pageRect = new Rect(new Position2D(pai.position.x - halfSize.width, pai.position.y - halfSize.height), size);
                        var vpRect = this._vp.asRectInArea();
                        var dpr = (window.devicePixelRatio || 1);
                        var pagePos = new Position2D(pageRect.pos.x - vpRect.pos.x, pageRect.pos.y - vpRect.pos.y);
                        var scaledPagePos = pagePos.scale(this._vp.scale / dpr);
                        var pe = this._pageElementCache.get(page);
                        var realSize = size.scale(1 / pai.scale);
                        pe.style.cssText =
                            "transform-origin : 0% 0%;" +
                                "position : absolute;" +
                                "left : " + scaledPagePos.x + "px;" +
                                "top : " + scaledPagePos.y + "px;" +
                                "width : " + realSize.width + "px;" +
                                "height : " + realSize.height + "px;" +
                                "transform : " + "scale(" + (pai.scale * this._vp.scale / dpr) + ");" +
                                "z-index: 5;";
                        var childrenElement = pe.children[0];
                        childrenElement.style.cssText = "transform : rotate(" + pai.rotation + "deg);" +
                            "width: " + realSize.width + "px;" +
                            "height: " + realSize.height + "px;";
                    };
                    TextRenderer.prototype.addPage = function (page) {
                        if (!this._pageElementCache.has(page)) {
                            this.createPageElement(page);
                        }
                        var pageElement = this._pageElementCache.get(page);
                        this._addedPages.push(page);
                        this.textContainer.appendChild(pageElement);
                    };
                    TextRenderer.prototype.createPageElement = function (page) {
                        var pageElement = document.createElement("div");
                        var childPageElement = (pageElement.cloneNode());
                        pageElement.appendChild(childPageElement);
                        this._pageElementCache.set(page, pageElement);
                        pageElement.style.display = "none";
                    };
                    TextRenderer.prototype.removePage = function (page) {
                        this._addedPages.splice(this._addedPages.indexOf(page), 1);
                        var textContent = this._pageElementCache.get(page);
                        textContent.parentElement.removeChild(textContent);
                    };
                    TextRenderer.prototype.addPageParts = function (page, textContent) {
                        var _this = this;
                        var pageHtml = document.createDocumentFragment();
                        textContent.content.forEach(function (e) {
                            var cacheKey = e.pos.toString() + e.text;
                            if (!_this._elementCache.has(cacheKey)) {
                                var contentPart = _this.createContentPart(page, e);
                                pageHtml.appendChild(contentPart);
                            }
                        });
                        textContent.links.forEach(function (link) {
                            var cacheKey = link.rect.toString() + link.url;
                            if (!_this._elementCache.has(cacheKey)) {
                                var linkElement = document.createElement("a");
                                linkElement.setAttribute("href", link.url);
                                linkElement.style.left = link.rect.getX() + "px";
                                linkElement.style.top = link.rect.getY() + "px";
                                linkElement.style.width = link.rect.getWidth() + "px";
                                linkElement.style.height = link.rect.getHeight() + "px";
                                linkElement.style.display = "block";
                                linkElement.style.position = "fixed";
                                linkElement.style.zIndex = "8";
                                linkElement.setAttribute("target", "_blank");
                                _this._elementCache.set(cacheKey, linkElement);
                                pageHtml.appendChild(linkElement);
                            }
                        });
                        textContent.internLinks.forEach(function (link) {
                            var cacheKey = link.rect.toString() + "DEST";
                            if (!_this._elementCache.has(cacheKey)) {
                                var linkElement = document.createElement("a");
                                linkElement.style.left = link.rect.getX() + "px";
                                linkElement.style.top = link.rect.getY() + "px";
                                linkElement.style.width = link.rect.getWidth() + "px";
                                linkElement.style.height = link.rect.getHeight() + "px";
                                linkElement.style.display = "block";
                                linkElement.style.position = "fixed";
                                linkElement.style.zIndex = "8";
                                linkElement.style.cursor = 'pointer';
                                linkElement.addEventListener('click', function () {
                                    link.pageNumberResolver(function (number) {
                                        _this.pageLinkClicked(number);
                                    });
                                });
                                _this._elementCache.set(cacheKey, linkElement);
                                pageHtml.appendChild(linkElement);
                            }
                        });
                        var pageElement = this._pageElementCache.get(page).children[0];
                        pageElement.appendChild(pageHtml);
                        if (pageElement.style.display == "none") {
                            pageElement.style.display = "block";
                        }
                    };
                    TextRenderer.prototype.removeContentPart = function (cp) {
                        var cpElement = this._lineElementMap.get(cp);
                        var parent = cpElement.parentElement;
                        parent.removeChild(cpElement);
                        this._lineElementMap.remove(cp);
                    };
                    TextRenderer.prototype.createContentPart = function (page, cp) {
                        var htmlElement = window.document.createElement("div");
                        htmlElement.textContent = cp.text;
                        htmlElement.setAttribute("class", "line");
                        var stopPropagation = function (e) {
                            e.stopPropagation();
                        };
                        htmlElement.addEventListener("mousedown", stopPropagation);
                        htmlElement.addEventListener("mouseup", stopPropagation);
                        htmlElement.addEventListener("mousemove", stopPropagation);
                        htmlElement.addEventListener("mouseenter", function () {
                            if ("mouseenter" in cp && typeof cp.mouseenter == "function") {
                                cp.mouseenter();
                            }
                        });
                        htmlElement.addEventListener("mouseleave", function () {
                            if ("mouseleave" in cp && typeof cp.mouseleave == "function") {
                                cp.mouseleave();
                            }
                        });
                        var size = page.size;
                        var cacheKey = cp.pos.toString() + cp.text;
                        this._elementCache.set(cacheKey, htmlElement);
                        this._mesureCanvas.save();
                        this._mesureCanvas.font = cp.fontSize + 'px ' + cp.fontFamily;
                        var drawnWidth = this._mesureCanvas.measureText(cp.text).width;
                        this._mesureCanvas.restore();
                        var xScaling = cp.size.width / drawnWidth;
                        this._lineElementMap.set(cp, htmlElement);
                        var topPosition = ("fromBottomLeft" in cp && !cp.fromBottomLeft) ? cp.pos.y : size.height - cp.pos.y;
                        htmlElement.style.cssText = "left : " + cp.pos.x + "px;" +
                            "top : " + topPosition + "px;" +
                            "font-family : " + cp.fontFamily + ";" +
                            "font-size : " + cp.fontSize + "px;" +
                            "transform-origin : 0% 0%;" +
                            "transform : scalex(" + xScaling + ");";
                        return htmlElement;
                    };
                    return TextRenderer;
                }());
                canvas.TextRenderer = TextRenderer;
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
            (function (canvas_1) {
                var PageView = (function () {
                    function PageView(drawImage, drawHTML) {
                        if (drawImage === void 0) { drawImage = true; }
                        if (drawHTML === void 0) { drawHTML = true; }
                        this.drawImage = drawImage;
                        this.drawHTML = drawHTML;
                        this.container = jQuery("<div></div>");
                        this.drawCanvas = null;
                        this.markCanvas = null;
                        var drawFilter = drawImage && drawHTML ? "grayscale(1) contrast(1000%)" : null;
                        this.drawCanvas = PageView.createCanvas(1, drawFilter);
                        this.markCanvas = PageView.createCanvas(4);
                        jQuery(this.drawCanvas).appendTo(this.container);
                        jQuery(this.markCanvas).appendTo(this.container);
                        this.container.css({
                            "position": "absolute",
                            "top": "0px",
                            "left": "0px",
                            "bottom": "0px",
                            "right": "0px",
                            "overflow": "hidden"
                        });
                        var ctx1 = this.drawCanvas.getContext("2d");
                        var ctx2 = this.markCanvas.getContext("2d");
                        if ("imageSmoothingEnabled" in ctx1) {
                            ctx1.imageSmoothingEnabled = false;
                            ctx2.imageSmoothingEnabled = false;
                        }
                    }
                    PageView.createCanvas = function (zIndex, filter) {
                        if (zIndex === void 0) { zIndex = 1; }
                        var canvas = document.createElement("canvas");
                        canvas.style.transform = "scale(1.0)";
                        canvas.style.position = "absolute";
                        canvas.style.zIndex = zIndex + "";
                        if (filter) {
                            canvas.style.filter = filter;
                        }
                        return canvas;
                    };
                    return PageView;
                }());
                canvas_1.PageView = PageView;
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
                var Scrollbar = (function () {
                    function Scrollbar(_horizontal) {
                        var _this = this;
                        this._horizontal = _horizontal;
                        this._areaSize = null;
                        this._viewSize = null;
                        this._position = null;
                        this._mouseDown = -1;
                        this._scrollhandler = null;
                        this._cachedScrollbarElementSize = null;
                        this._cacheTime = -1;
                        this.initElements();
                        var body = jQuery(document.body);
                        var moveHandler = function (e) {
                            if (_this._mouseDown != -1) {
                                var val = (_this._horizontal ? (e.clientX - _this._scrollbarElement.offset().left) : (e.clientY - _this._scrollbarElement.offset().top)) - _this._mouseDown;
                                var realSize = (_this._horizontal ? _this._scrollbarElement.width() : _this._scrollbarElement.height()) - 30;
                                var relation = realSize / _this._areaSize;
                                _this._position = (val) / relation;
                                _this.update();
                                if (_this.scrollHandler != null) {
                                    _this.scrollHandler();
                                }
                                e.preventDefault();
                            }
                        };
                        var upHandler = function (e) {
                            _this._mouseDown = -1;
                            if (interv != -1) {
                                window.clearInterval(interv);
                                interv = -1;
                                e.preventDefault();
                            }
                            body.unbind("mousemove", moveHandler);
                        };
                        this._slider.mousedown(function (e) {
                            _this._mouseDown = _this._horizontal ? (e.clientX - _this._slider.offset().left) : (e.clientY - _this._slider.offset().top);
                            body.bind("mousemove", moveHandler);
                            body.bind("mouseup", upHandler);
                            e.preventDefault();
                        });
                        this._scrollbarElement.mousedown(function (e) {
                            if (jQuery(e.target).hasClass("slider")) {
                                return;
                            }
                            var val = (_this._horizontal ? (e.clientX - _this._scrollbarElement.offset().left) : (e.clientY - _this._scrollbarElement.offset().top));
                            var realSize = (_this._horizontal ? _this._scrollbarElement.width() : _this._scrollbarElement.height()) - 30;
                            var relation = realSize / _this._areaSize;
                            var sliderSize = Math.min(Math.max(20, _this._viewSize * relation), realSize);
                            _this._position = (val - (sliderSize / 2)) / relation;
                            _this.update();
                            if (_this.scrollHandler != null) {
                                _this.scrollHandler();
                            }
                        });
                        var interv = -1;
                        this._startButton.mousedown(function (e) {
                            _this._position -= 200;
                            _this.scrollHandler();
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            interv = window.setInterval(function () {
                                _this._position -= 200;
                                _this.scrollHandler();
                            }, 111);
                        });
                        this._endButton.mousedown(function (e) {
                            _this._position += 200;
                            _this.scrollHandler();
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            interv = window.setInterval(function () {
                                _this._position += 200;
                                _this.scrollHandler();
                            }, 111);
                        });
                        jQuery(document.body).mousemove(function (e) {
                            if (_this._mouseDown != -1) {
                                var val = (_this._horizontal ? (e.clientX - _this._scrollbarElement.offset().left) :
                                    (e.clientY - _this._scrollbarElement.offset().top)) - _this._mouseDown;
                                var realSize = (_this._horizontal ? _this._scrollbarElement.width() :
                                    _this._scrollbarElement.height()) - 30;
                                var relation = realSize / _this._areaSize;
                                _this._position = (val) / relation;
                                _this.update();
                                if (_this.scrollHandler != null) {
                                    _this.scrollHandler();
                                }
                            }
                        });
                        jQuery(document.body).mouseup(function (e) {
                            _this._mouseDown = -1;
                            if (interv != -1) {
                                window.clearInterval(interv);
                                interv = -1;
                            }
                        });
                    }
                    Scrollbar.prototype.clearRunning = function () {
                        this._mouseDown = -1;
                    };
                    Scrollbar.prototype.initElements = function () {
                        this._className = (this._horizontal ? "horizontal" : "vertical");
                        this._scrollbarElement = jQuery("<div></div>");
                        this._scrollbarElement.addClass(this._className + "Bar");
                        this._slider = jQuery("<div></div>");
                        this._slider.addClass("slider");
                        this._startButton = jQuery("<div></div>");
                        this._startButton.addClass("startButton");
                        this._endButton = jQuery("<div></div>");
                        this._endButton.addClass("endButton");
                        this._startButton.appendTo(this._scrollbarElement);
                        this._slider.appendTo(this._scrollbarElement);
                        this._endButton.appendTo(this._scrollbarElement);
                    };
                    Object.defineProperty(Scrollbar.prototype, "viewSize", {
                        get: function () {
                            return this._viewSize;
                        },
                        set: function (view) {
                            this._viewSize = view;
                            this.update();
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Scrollbar.prototype, "areaSize", {
                        get: function () {
                            return this._areaSize;
                        },
                        set: function (area) {
                            this._areaSize = area;
                            this.update();
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Scrollbar.prototype, "position", {
                        get: function () {
                            return this._position;
                        },
                        set: function (pos) {
                            this._position = pos;
                            this.update();
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Scrollbar.prototype.update = function () {
                        if (this._areaSize == null || this._viewSize == null || this._position == null) {
                            return;
                        }
                        var ret = this.getScrollbarElementSize.call(this);
                        var realSize = (this._horizontal ? ret.width : ret.height) - 30;
                        var relation = realSize / this._areaSize;
                        var sliderSize = Math.min(Math.max(20, this._viewSize * relation), realSize);
                        var sliderSizeStyleKey = this._horizontal ? "width" : "height";
                        var sliderSizeStyle = {};
                        sliderSizeStyle[sliderSizeStyleKey] = sliderSize + "px";
                        this._slider.css(sliderSizeStyle);
                        relation = (realSize - (sliderSize - (this._viewSize * relation))) / this._areaSize;
                        var sliderPos = Math.max(this._position * relation + 15, 15);
                        var sliderPosStyleKey = this._horizontal ? "left" : "top";
                        var sliderPosStyle = {};
                        sliderPosStyle[sliderPosStyleKey] = sliderPos + "px";
                        this._slider.css(sliderPosStyle);
                    };
                    Scrollbar.prototype.getScrollbarElementSize = function () {
                        var currentTime = new Date().getTime();
                        if (this._cachedScrollbarElementSize == null || (currentTime - 1000 > this._cacheTime)) {
                            var elementHeight = this._scrollbarElement.height();
                            var elementWidth = this._scrollbarElement.width();
                            this._cachedScrollbarElementSize = new Size2D(elementWidth, elementHeight);
                            this._cacheTime = new Date().getTime();
                        }
                        return this._cachedScrollbarElementSize;
                    };
                    Scrollbar.prototype.resized = function () {
                        this._cachedScrollbarElementSize = null;
                    };
                    Object.defineProperty(Scrollbar.prototype, "scrollbarElement", {
                        get: function () {
                            return this._scrollbarElement;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Scrollbar.prototype, "scrollHandler", {
                        get: function () {
                            return this._scrollhandler;
                        },
                        set: function (handler) {
                            this._scrollhandler = handler;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return Scrollbar;
                }());
                canvas.Scrollbar = Scrollbar;
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
                var Overview = (function (_super) {
                    __extends(Overview, _super);
                    function Overview(vp, _maxOverviewSize) {
                        if (_maxOverviewSize === void 0) { _maxOverviewSize = new Size2D(250, 250); }
                        _super.call(this, true, false);
                        this.vp = vp;
                        this._maxOverviewSize = _maxOverviewSize;
                        this.overviewViewport = new canvas.Viewport();
                        this.container.addClass("overview");
                        this.container.attr("style", "");
                        this.container.css("z-index", "6");
                        jQuery(this.markCanvas).detach();
                    }
                    Overview.prototype.updateOverviewSize = function (size) {
                        size = size.roundUp();
                        this.container[0].style.width = size.width + "px";
                        this.container[0].style.height = size.height + "px";
                        if (this.drawCanvas.width != size.width || this.drawCanvas.height != size.height
                            || this.markCanvas.width != size.width
                            || this.markCanvas.height != size.height) {
                            this.drawCanvas.width = size.width;
                            this.drawCanvas.height = size.height;
                            this.markCanvas.width = size.width;
                            this.markCanvas.height = size.height;
                        }
                        this.overviewViewport.size = size;
                    };
                    Object.defineProperty(Overview.prototype, "overviewRect", {
                        get: function () {
                            return this.overviewViewport.asRectInArea();
                        },
                        set: function (rect) {
                            this.overviewViewport.position = rect.getMiddlePoint();
                            var scale = this.overviewViewport.scale = Math.min(this._maxOverviewSize.width / rect.size.width, this._maxOverviewSize.height / rect.size.height);
                            var toWidth = this._maxOverviewSize.width / rect.size.width == scale;
                            var realSize;
                            if (toWidth) {
                                var relation = rect.size.width / rect.size.height;
                                realSize = new Size2D(this._maxOverviewSize.width, this._maxOverviewSize.height / relation);
                            }
                            else {
                                var relation = rect.size.height / rect.size.width;
                                realSize = new Size2D(this._maxOverviewSize.width / relation, this._maxOverviewSize.height);
                            }
                            this.updateOverviewSize(realSize);
                            this._overviewRect = rect;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Overview.prototype.drawRect = function () {
                        var ctx = this.drawCanvas.getContext("2d");
                        var overviewArea = this.overviewViewport.asRectInArea();
                        var vpArea = this.vp.asRectInArea();
                        var lineWidth = 500;
                        var pos = new Position2D(vpArea.pos.x - overviewArea.pos.x, vpArea.pos.y - overviewArea.pos.y);
                        pos = pos.scale(this.overviewViewport.scale);
                        var vpSizeInOverview = this.vp.asRectInArea().size.scale(this.overviewViewport.scale);
                        ctx.save();
                        {
                            ctx.lineWidth = lineWidth;
                            ctx.strokeStyle = "rgba(0,0,0,0.5)";
                            ctx.translate(-lineWidth / 2, -lineWidth / 2);
                            ctx.strokeRect(pos.x, pos.y, vpSizeInOverview.width + (lineWidth), vpSizeInOverview.height + (lineWidth));
                        }
                        ctx.restore();
                    };
                    Overview.prototype.initEventHandler = function () {
                        var _this = this;
                        var handler = function (e) {
                            e.preventDefault();
                            var x = (e.clientX + window.pageXOffset) - jQuery(e.target).offset().left;
                            var y = (e.clientY + window.pageYOffset) - jQuery(e.target).offset().top;
                            var pos = new Position2D(x, y);
                            var scaledPos = pos.scale(1 / _this.overviewViewport.scale);
                            var upperLeftVpPos = _this.overviewViewport.asRectInArea().getPoints().upperLeft;
                            var correctedPos = new Position2D(scaledPos.x + upperLeftVpPos.x, scaledPos.y + upperLeftVpPos.y);
                            _this.vp.position = correctedPos;
                            e.stopImmediatePropagation();
                        };
                        jQuery(this.drawCanvas).mousedown(function (e) {
                            jQuery(_this.drawCanvas).bind("mousemove", handler);
                        });
                        jQuery(this.drawCanvas).mouseup(function (e) {
                            jQuery(_this.drawCanvas).unbind("mousemove", handler);
                        });
                        jQuery(this.drawCanvas).mouseout(function (e) {
                            jQuery(_this.drawCanvas).unbind("mousemove", handler);
                        });
                    };
                    return Overview;
                }(canvas.PageView));
                canvas.Overview = Overview;
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
            (function (canvas_2) {
                var PageController = (function () {
                    function PageController(miniOverview) {
                        var _this = this;
                        if (miniOverview === void 0) { miniOverview = false; }
                        this.miniOverview = miniOverview;
                        this._lastSize = new Size2D(0, 0);
                        this._requestRunning = false;
                        this._nextRequested = false;
                        this._pageArea = new canvas_2.PageArea();
                        this._viewport = new canvas_2.Viewport();
                        this._views = new Array();
                        this._viewHTMLRendererMap = new MyCoReMap();
                        this._textRenderer = null;
                        this._canvasPageLayers = new MyCoReMap();
                        this._lastAnimationTime = null;
                        this._animations = new Array();
                        this._overview = null;
                        this._pageArea.updateCallback = function () {
                            _this.update();
                        };
                        this._updateSizeIfChanged();
                        this._registerViewport();
                    }
                    PageController.prototype._updateSizeIfChanged = function () {
                        var _this = this;
                        this._views.forEach(function (view) {
                            var retinaWidth = view.container.width() * (window.devicePixelRatio || 1);
                            var retinaHeight = view.container.height() * (window.devicePixelRatio || 1);
                            if (view.drawCanvas.width != retinaWidth
                                || view.drawCanvas.height != retinaHeight
                                || view.markCanvas.width != retinaWidth
                                || view.markCanvas.height != retinaHeight) {
                                _this._updateSize(view);
                            }
                        });
                    };
                    PageController.prototype._updateSize = function (view) {
                        view.drawCanvas.width = view.container.width() * (window.devicePixelRatio || 1);
                        view.drawCanvas.height = view.container.height() * (window.devicePixelRatio || 1);
                        view.markCanvas.width = view.container.width() * (window.devicePixelRatio || 1);
                        view.markCanvas.height = view.container.height() * (window.devicePixelRatio || 1);
                        this._lastSize = new Size2D(view.drawCanvas.width, view.drawCanvas.height);
                        this._viewport.size = new Size2D(view.drawCanvas.width, view.drawCanvas.height);
                    };
                    PageController.prototype._unregisterViewport = function () {
                        if (this._viewport != null) {
                            this._viewport.sizeProperty.removeAllObserver();
                            this._viewport.positionProperty.removeAllObserver();
                            this._viewport.scaleProperty.removeAllObserver();
                            this._viewport.rotationProperty.removeAllObserver();
                        }
                    };
                    PageController.prototype._registerViewport = function () {
                        var _this = this;
                        var updater = {
                            propertyChanged: function (_old, _new) {
                                _this.update();
                            }
                        };
                        this._viewport.sizeProperty.addObserver(updater);
                        this._viewport.positionProperty.addObserver(updater);
                        this._viewport.scaleProperty.addObserver(updater);
                        this._viewport.rotationProperty.addObserver(updater);
                    };
                    PageController.prototype.update = function () {
                        var _this = this;
                        if (!this._nextRequested) {
                            this._nextRequested = true;
                            if (!this._requestRunning) {
                                this._requestRunning = true;
                                viewerRequestAnimationFrame(function () {
                                    _this._nextRequested = false;
                                    _this._updateSizeIfChanged();
                                    _this.updateAnimations();
                                    _this._views.forEach(function (view) {
                                        if (view.drawHTML) {
                                            var htmlRenderer;
                                            if (_this._viewHTMLRendererMap.has(view)) {
                                                htmlRenderer = _this._viewHTMLRendererMap.get(view);
                                            }
                                            else {
                                                htmlRenderer = new canvas_2.HtmlRenderer(_this._viewport, _this._pageArea, view);
                                                _this._viewHTMLRendererMap.set(view, htmlRenderer);
                                            }
                                            htmlRenderer.update();
                                        }
                                        _this.drawOnView(view, _this.viewport, !view.drawImage);
                                    });
                                    if (_this._textRenderer != null) {
                                        _this._textRenderer.update();
                                    }
                                    if (_this._overview != null) {
                                        _this.drawOnView(_this._overview, _this._overview.overviewViewport);
                                        _this._overview.drawRect();
                                    }
                                });
                                this._requestRunning = false;
                            }
                        }
                    };
                    PageController.prototype.drawOnView = function (view, vp, markerOnly) {
                        var _this = this;
                        if (vp === void 0) { vp = this._viewport; }
                        if (markerOnly === void 0) { markerOnly = false; }
                        if (view != null && vp != null) {
                            view.drawCanvas.width = view.drawCanvas.width;
                            view.markCanvas.width = view.markCanvas.width;
                            var rotatedViewportSize = vp.size.getRotated(vp.rotation);
                            var ctx1 = view.drawCanvas.getContext("2d");
                            var ctx2 = view.markCanvas.getContext("2d");
                            ctx1.save();
                            ctx2.save();
                            {
                                {
                                    ctx1.translate(vp.size.width / 2, vp.size.height / 2);
                                    ctx1.rotate(vp.rotation * Math.PI / 180);
                                    ctx1.translate(-rotatedViewportSize.width / 2, -rotatedViewportSize.height / 2);
                                }
                                {
                                    ctx2.translate(vp.size.width / 2, vp.size.height / 2);
                                    ctx2.rotate(vp.rotation * Math.PI / 180);
                                    ctx2.translate(-rotatedViewportSize.width / 2, -rotatedViewportSize.height / 2);
                                }
                                this._pageArea.getPagesInViewport(vp).forEach(function (page) {
                                    _this.drawPage(page, _this._pageArea.getPageInformation(page), vp.asRectInArea(), vp.scale, vp != _this._viewport, view, markerOnly);
                                });
                            }
                            ctx1.restore();
                            ctx2.restore();
                        }
                    };
                    PageController.prototype.drawPage = function (page, info, areaInViewport, scale, preview, view, markerOnly) {
                        if (markerOnly === void 0) { markerOnly = false; }
                        var realPageDimension = page.size.getRotated(info.rotation).scale(info.scale);
                        var pageRect = new Rect(new Position2D(info.position.x - (realPageDimension.width / 2), info.position.y - (realPageDimension.height / 2)), realPageDimension);
                        var pagePartInArea = areaInViewport.getIntersection(pageRect);
                        var pagePartInPageRotatet = new Rect(new Position2D(Math.max(0, pagePartInArea.pos.x - pageRect.pos.x), Math.max(0, pagePartInArea.pos.y - pageRect.pos.y)), pagePartInArea.size);
                        var rotateBack = function (deg, pagePartBefore, realPageDimension) {
                            if (deg == 0) {
                                return pagePartBefore;
                            }
                            var newPositionX = pagePartBefore.pos.y;
                            var newPositionY = realPageDimension.width - pagePartBefore.pos.x - pagePartBefore.size.width;
                            var rect = new Rect(new Position2D(newPositionX, newPositionY), pagePartBefore.size.getRotated(90));
                            if (deg == 90) {
                                return rect;
                            }
                            else {
                                return rotateBack(deg - 90, rect, realPageDimension.getRotated(90));
                            }
                        };
                        var pagePartInPage = rotateBack(info.rotation, pagePartInPageRotatet, realPageDimension);
                        var notRotated = page.size.scale(info.scale);
                        var ctx1 = view.drawCanvas.getContext("2d");
                        var ctx2 = view.markCanvas.getContext("2d");
                        ctx1.save();
                        ctx2.save();
                        {
                            {
                                ctx1.translate(Math.floor((-areaInViewport.pos.x + info.position.x) * scale), Math.floor((-areaInViewport.pos.y + info.position.y) * scale));
                                ctx1.rotate(info.rotation * Math.PI / 180);
                                ctx1.translate(Math.floor(((-notRotated.width / 2) + pagePartInPage.pos.x) * scale), Math.floor(((-notRotated.height / 2) + pagePartInPage.pos.y) * scale));
                                ctx2.translate(Math.floor((-areaInViewport.pos.x + info.position.x) * scale), Math.floor(-areaInViewport.pos.y + info.position.y) * scale);
                                ctx2.rotate(info.rotation * Math.PI / 180);
                                ctx2.translate((Math.floor(-notRotated.width / 2) + pagePartInPage.pos.x) * scale, Math.floor((-notRotated.height / 2) + pagePartInPage.pos.y) * scale);
                            }
                            var realAreaToDraw = pagePartInPage.scale(1 / info.scale);
                            realAreaToDraw = new Rect(realAreaToDraw.pos.roundDown(), realAreaToDraw.size.roundDown());
                            if (!markerOnly) {
                                page.draw(ctx1, realAreaToDraw, scale * info.scale, preview);
                            }
                            ctx2.translate(-realAreaToDraw.pos.x * scale * info.scale, -realAreaToDraw.pos.y * scale * info.scale);
                            if (!preview) {
                                ctx2.scale(scale * info.scale, scale * info.scale);
                                var layers = this.getCanvasPageLayersOrdered();
                                layers.forEach(function (layer) {
                                    layer.draw(ctx2, page.id, page.size, view.drawHTML);
                                });
                                ctx2.scale(1 / scale * info.scale, 1 / scale * info.scale);
                            }
                        }
                        ctx1.restore();
                        ctx2.restore();
                    };
                    PageController.prototype.updateAnimations = function () {
                        var _this = this;
                        this._viewport.updateAnimation();
                        if (this._animations.length == 0) {
                            this._lastAnimationTime = null;
                            return;
                        }
                        if (this._lastAnimationTime == null) {
                            this._lastAnimationTime = new Date().valueOf();
                        }
                        var elapsedTime = new Date().valueOf() - this._lastAnimationTime;
                        var finishedAnimations = [];
                        for (var _i = 0, _a = this._animations; _i < _a.length; _i++) {
                            var animation = _a[_i];
                            if (animation.updateAnimation(elapsedTime)) {
                                finishedAnimations.push(animation);
                            }
                        }
                        finishedAnimations.forEach(function (animation) {
                            _this.removeAnimation(animation);
                        });
                        if (this._animations.length == 0) {
                            this._lastAnimationTime = null;
                            return;
                        }
                        setTimeout(function () {
                            _this.update();
                        }, 0);
                    };
                    PageController.prototype.addAnimation = function (animation) {
                        this._animations.push(animation);
                    };
                    PageController.prototype.removeAnimation = function (animation) {
                        var index = this._animations.indexOf(animation);
                        if (index >= 0) {
                            this._animations.splice(index, 1);
                        }
                    };
                    Object.defineProperty(PageController.prototype, "viewport", {
                        get: function () {
                            return this._viewport;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(PageController.prototype, "views", {
                        get: function () {
                            return this._views;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    PageController.prototype.addPage = function (page, info) {
                        var _this = this;
                        page.refreshCallback = function () {
                            _this.update();
                        };
                        this._pageArea.addPage(page, info);
                    };
                    PageController.prototype.removePage = function (page) {
                        page.refreshCallback = function () {
                        };
                        page.clear();
                        this._pageArea.removePage(page);
                    };
                    PageController.prototype.getPages = function () {
                        return this._pageArea.getPages();
                    };
                    PageController.prototype.setPageAreaInformation = function (page, info) {
                        this._pageArea.setPageAreaInformation(page, info);
                    };
                    PageController.prototype.getPageAreaInformation = function (page) {
                        return this._pageArea.getPageInformation(page);
                    };
                    PageController.prototype.addCanvasPageLayer = function (zIndex, canvas) {
                        this._canvasPageLayers.set(zIndex, canvas);
                    };
                    PageController.prototype.getCanvasPageLayers = function () {
                        return this._canvasPageLayers;
                    };
                    PageController.prototype.getCanvasPageLayersOrdered = function () {
                        var _this = this;
                        if (this._canvasPageLayers == null || this._canvasPageLayers.isEmpty()) {
                            return [];
                        }
                        var sortedArray = [];
                        this._canvasPageLayers.keys.sort().forEach(function (k) {
                            sortedArray.push(_this._canvasPageLayers.get(k));
                        });
                        return sortedArray;
                    };
                    PageController.prototype.getPageArea = function () {
                        return this._pageArea;
                    };
                    Object.defineProperty(PageController.prototype, "textRenderer", {
                        get: function () {
                            return this._textRenderer;
                        },
                        set: function (value) {
                            this._textRenderer = value;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return PageController;
                }());
                canvas_2.PageController = PageController;
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
            var events;
            (function (events) {
                var ViewerEventManager = (function () {
                    function ViewerEventManager() {
                        this._callBackArray = new Array();
                    }
                    ViewerEventManager.prototype.bind = function (callback) {
                        this._callBackArray.push(callback);
                    };
                    ViewerEventManager.prototype.trigger = function (e) {
                        for (var i in this._callBackArray) {
                            var callback = this._callBackArray[i];
                            callback(e);
                        }
                    };
                    ViewerEventManager.prototype.unbind = function (callback) {
                        var index = this._callBackArray.lastIndexOf(callback);
                        this._callBackArray.splice(index, 1);
                    };
                    return ViewerEventManager;
                }());
                events.ViewerEventManager = ViewerEventManager;
            })(events = widgets.events || (widgets.events = {}));
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
                var ToolbarComponent = (function () {
                    function ToolbarComponent(id) {
                        this._properties = new MyCoReMap();
                        this.addProperty(new ViewerProperty(this, "id", id));
                    }
                    Object.defineProperty(ToolbarComponent.prototype, "id", {
                        get: function () {
                            return this.getProperty("id").value;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ToolbarComponent.prototype, "PropertyNames", {
                        get: function () {
                            return this._properties.keys;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    ToolbarComponent.prototype.addProperty = function (property) {
                        this._properties.set(property.name, property);
                    };
                    ToolbarComponent.prototype.getProperty = function (name) {
                        return this._properties.get(name);
                    };
                    ToolbarComponent.prototype.hasProperty = function (name) {
                        return this._properties.has(name);
                    };
                    return ToolbarComponent;
                }());
                toolbar.ToolbarComponent = ToolbarComponent;
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
                var ToolbarGroup = (function () {
                    function ToolbarGroup(_name, _right) {
                        if (_right === void 0) { _right = false; }
                        this._name = _name;
                        this._right = _right;
                        this._idComponentMap = new MyCoReMap();
                        this._observerArray = new Array();
                    }
                    ToolbarGroup.prototype.getComponentById = function (id) {
                        return this._idComponentMap.get(id);
                    };
                    ToolbarGroup.prototype.addComponent = function (component) {
                        var componentId = component.getProperty("id").value;
                        if (this._idComponentMap.has(componentId)) {
                            throw new Error(componentId + " already exist in " + this.name);
                        }
                        this._idComponentMap.set(componentId, component);
                        this.notifyObserverChildAdded(this, component);
                    };
                    ToolbarGroup.prototype.removeComponent = function (component) {
                        var componentId = component.getProperty("id").value;
                        if (!this._idComponentMap.has(componentId)) {
                            throw new Error(componentId + " doesnt exist in " + this.name);
                        }
                        this._idComponentMap.remove(componentId);
                        this.notifyObserverChildRemoved(this, component);
                    };
                    ToolbarGroup.prototype.getComponentIDs = function () {
                        return this._idComponentMap.keys;
                    };
                    ToolbarGroup.prototype.getComponents = function () {
                        return this._idComponentMap.values;
                    };
                    ToolbarGroup.prototype.addObserver = function (observer) {
                        this._observerArray.push(observer);
                    };
                    ToolbarGroup.prototype.removeObserver = function (observer) {
                        var index = this._observerArray.indexOf(observer);
                        this._observerArray.splice(index, 1);
                    };
                    Object.defineProperty(ToolbarGroup.prototype, "observer", {
                        get: function () {
                            return this._observerArray;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ToolbarGroup.prototype, "name", {
                        get: function () {
                            return this._name;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ToolbarGroup.prototype, "align", {
                        get: function () {
                            return (this._right) ? "right" : "left";
                        },
                        enumerable: true,
                        configurable: true
                    });
                    ToolbarGroup.prototype.notifyObserverChildAdded = function (group, component) {
                        this._observerArray.forEach(function (elem) {
                            elem.childAdded(group, component);
                        });
                    };
                    ToolbarGroup.prototype.notifyObserverChildRemoved = function (group, component) {
                        this._observerArray.forEach(function (elem) {
                            elem.childRemoved(group, component);
                        });
                    };
                    return ToolbarGroup;
                }());
                toolbar.ToolbarGroup = ToolbarGroup;
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
            (function (toolbar_1) {
                var ToolbarModel = (function (_super) {
                    __extends(ToolbarModel, _super);
                    function ToolbarModel(name) {
                        _super.call(this, name);
                        this._children = new MyCoReMap();
                        this._groupObserverArray = new Array();
                    }
                    ToolbarModel.prototype.addGroup = function (group) {
                        if (this._children.has(group.name)) {
                            throw new Error("Group : " + group.name + " already exists in " + this.name);
                        }
                        else {
                            this._children.set(group.name, group);
                            group.addObserver(this);
                            this.notifyGroupAdded(this, group);
                        }
                    };
                    ToolbarModel.prototype.removeGroup = function (group) {
                        if (this._children.has(group.name)) {
                            this._children.remove(group.name);
                            group.removeObserver(this);
                            this.notifyGroupRemoved(this, group);
                        }
                        else {
                            throw new Error("Group : " + group.name + " doesnt exists in " + this.name);
                        }
                    };
                    ToolbarModel.prototype.getGroup = function (name) {
                        return this._children.get(name);
                    };
                    ToolbarModel.prototype.getGroupIDs = function () {
                        return this._children.keys;
                    };
                    ToolbarModel.prototype.getGroups = function () {
                        return this._children.values;
                    };
                    ToolbarModel.prototype.childAdded = function (group, component) {
                        this.notifyObserverChildAdded(group, component);
                    };
                    ToolbarModel.prototype.childRemoved = function (group, component) {
                        this.notifyObserverChildRemoved(group, component);
                    };
                    ToolbarModel.prototype.addGroupObserver = function (observer) {
                        this._groupObserverArray.push(observer);
                    };
                    ToolbarModel.prototype.removeGroupObserver = function (observer) {
                        var index = this._groupObserverArray.indexOf(observer);
                        this._groupObserverArray.splice(index, 1);
                    };
                    ToolbarModel.prototype.notifyGroupAdded = function (toolbar, group) {
                        this._groupObserverArray.forEach(function (elem) {
                            elem.childAdded(toolbar, group);
                        });
                    };
                    ToolbarModel.prototype.notifyGroupRemoved = function (toolbar, group) {
                        this._groupObserverArray.forEach(function (elem) {
                            elem.childRemoved(toolbar, group);
                        });
                    };
                    ToolbarModel.prototype.addComponent = function (component) {
                        throw "Not added jet";
                    };
                    ToolbarModel.prototype.removeComponent = function (component) {
                        throw "Not added jet";
                    };
                    return ToolbarModel;
                }(widgets.toolbar.ToolbarGroup));
                toolbar_1.ToolbarModel = ToolbarModel;
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
                var ToolbarButton = (function (_super) {
                    __extends(ToolbarButton, _super);
                    function ToolbarButton(id, label, tooltip, icon, buttonClass, disabled, active) {
                        if (tooltip === void 0) { tooltip = label; }
                        if (icon === void 0) { icon = null; }
                        if (buttonClass === void 0) { buttonClass = "default"; }
                        if (disabled === void 0) { disabled = false; }
                        if (active === void 0) { active = false; }
                        _super.call(this, id);
                        this.addProperty(new ViewerProperty(this, "label", label));
                        this.addProperty(new ViewerProperty(this, "tooltip", tooltip));
                        this.addProperty(new ViewerProperty(this, "icon", icon));
                        this.addProperty(new ViewerProperty(this, "buttonClass", buttonClass));
                        this.addProperty(new ViewerProperty(this, "disabled", false));
                        this.addProperty(new ViewerProperty(this, "active", false));
                    }
                    Object.defineProperty(ToolbarButton.prototype, "label", {
                        get: function () {
                            return this.getProperty("label").value;
                        },
                        set: function (label) {
                            this.getProperty("label").value = label;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ToolbarButton.prototype, "tooltip", {
                        get: function () {
                            return this.getProperty("tooltip").value;
                        },
                        set: function (tooltip) {
                            this.getProperty("tooltip").value = tooltip;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ToolbarButton.prototype, "icon", {
                        get: function () {
                            return this.getProperty("icon").value;
                        },
                        set: function (icon) {
                            this.getProperty("icon").value = icon;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ToolbarButton.prototype, "buttonClass", {
                        get: function () {
                            return this.getProperty("buttonClass").value;
                        },
                        set: function (buttonClass) {
                            this.getProperty("buttonClass").value = buttonClass;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ToolbarButton.prototype, "disabled", {
                        get: function () {
                            return this.getProperty("disabled").value;
                        },
                        set: function (disabled) {
                            this.getProperty("disabled").value = disabled;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ToolbarButton.prototype, "active", {
                        get: function () {
                            return this.getProperty("active").value;
                        },
                        set: function (active) {
                            this.getProperty("active").value = active;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return ToolbarButton;
                }(toolbar.ToolbarComponent));
                toolbar.ToolbarButton = ToolbarButton;
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
                var events;
                (function (events) {
                    var ButtonPressedEvent = (function (_super) {
                        __extends(ButtonPressedEvent, _super);
                        function ButtonPressedEvent(_button, type) {
                            if (type === void 0) { type = ButtonPressedEvent.TYPE; }
                            _super.call(this, type);
                            this._button = _button;
                        }
                        Object.defineProperty(ButtonPressedEvent.prototype, "button", {
                            get: function () {
                                return this._button;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        ButtonPressedEvent.TYPE = "ButtonPressedEvent";
                        return ButtonPressedEvent;
                    }(mycore.viewer.widgets.events.DefaultViewerEvent));
                    events.ButtonPressedEvent = ButtonPressedEvent;
                })(events = toolbar.events || (toolbar.events = {}));
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
                var ButtonController = (function () {
                    function ButtonController(_groupMap, _buttonViewMap, _mobile) {
                        this._groupMap = _groupMap;
                        this._buttonViewMap = _buttonViewMap;
                        this._mobile = _mobile;
                        this._eventManager = new mycore.viewer.widgets.events.ViewerEventManager();
                    }
                    Object.defineProperty(ButtonController.prototype, "eventManager", {
                        get: function () {
                            return this._eventManager;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    ButtonController.prototype.childAdded = function (parent, component) {
                        var group = parent;
                        var groupView = this._groupMap.get(group.name);
                        var componentId = component.getProperty("id").value;
                        var button = component;
                        var labelProperty = button.getProperty("label");
                        var iconProperty = button.getProperty("icon");
                        var tooltipProperty = component.getProperty("tooltip");
                        var buttonClassProperty = button.getProperty("buttonClass");
                        var activeProperty = button.getProperty("active");
                        var disabledProperty = button.getProperty("disabled");
                        labelProperty.addObserver(this);
                        iconProperty.addObserver(this);
                        tooltipProperty.addObserver(this);
                        buttonClassProperty.addObserver(this);
                        activeProperty.addObserver(this);
                        disabledProperty.addObserver(this);
                        var buttonView = this.createButtonView(button);
                        buttonView.updateButtonTooltip(tooltipProperty.value);
                        buttonView.updateButtonLabel(labelProperty.value);
                        buttonView.updateButtonClass(buttonClassProperty.value);
                        buttonView.updateButtonActive(activeProperty.value);
                        buttonView.updateButtonDisabled(disabledProperty.value);
                        var that = this;
                        buttonView.getElement().bind("click", function (e) {
                            that._eventManager.trigger(new toolbar.events.ButtonPressedEvent(button));
                        });
                        var iconValue = iconProperty.value;
                        if (iconValue != null) {
                            buttonView.updateButtonIcon(iconValue);
                        }
                        groupView.addChild(buttonView.getElement());
                        this._buttonViewMap.set(componentId, buttonView);
                    };
                    ButtonController.prototype.childRemoved = function (parent, component) {
                        var componentId = component.getProperty("id").value;
                        this._buttonViewMap.get(componentId).getElement().remove();
                        component.getProperty("label").removeObserver(this);
                        component.getProperty("icon").removeObserver(this);
                        component.getProperty("tooltip").removeObserver(this);
                        component.getProperty("buttonClass").removeObserver(this);
                        component.getProperty("active").removeObserver(this);
                        component.getProperty("disabled").removeObserver(this);
                    };
                    ButtonController.prototype.createButtonView = function (button) {
                        return toolbar.ToolbarViewFactoryImpl.createButtonView(button.id);
                    };
                    ButtonController.prototype.propertyChanged = function (_old, _new) {
                        var buttonId = _new.from.getProperty("id").value;
                        if (_old.name == "label" && _new.name == "label") {
                            this._buttonViewMap.get(buttonId).updateButtonLabel(_new.value);
                            return;
                        }
                        if (_old.name == "icon" && _new.name == "icon") {
                            this._buttonViewMap.get(buttonId).updateButtonIcon(_new.value);
                            return;
                        }
                        if (_old.name == "tooltip" && _new.name == "tooltip") {
                            this._buttonViewMap.get(buttonId).updateButtonTooltip(_new.value);
                            return;
                        }
                        if (_old.name == "buttonClass" && _new.name == "buttonClass") {
                            this._buttonViewMap.get(buttonId).updateButtonClass(_new.value);
                            return;
                        }
                        if (_old.name == "active" && _new.name == "active") {
                            this._buttonViewMap.get(buttonId).updateButtonActive(_new.value);
                            return;
                        }
                        if (_old.name == "disabled" && _new.name == "disabled") {
                            this._buttonViewMap.get(buttonId).updateButtonDisabled(_new.value);
                            return;
                        }
                    };
                    return ButtonController;
                }());
                toolbar.ButtonController = ButtonController;
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
                var ToolbarDropdownButton = (function (_super) {
                    __extends(ToolbarDropdownButton, _super);
                    function ToolbarDropdownButton(id, label, children, icon, largeContent, buttonClass, disabled, active) {
                        if (icon === void 0) { icon = null; }
                        if (largeContent === void 0) { largeContent = false; }
                        if (buttonClass === void 0) { buttonClass = "default"; }
                        if (disabled === void 0) { disabled = false; }
                        if (active === void 0) { active = false; }
                        _super.call(this, id, label, null, icon, buttonClass, disabled, active);
                        this.addProperty(new ViewerProperty(this, "children", children));
                        this.addProperty(new ViewerProperty(this, "largeContent", largeContent));
                    }
                    Object.defineProperty(ToolbarDropdownButton.prototype, "children", {
                        get: function () {
                            return this.getProperty("children").value;
                        },
                        set: function (childs) {
                            this.getProperty("children").value = childs;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ToolbarDropdownButton.prototype, "largeContent", {
                        get: function () {
                            return this.getProperty("largeContent").value;
                        },
                        set: function (largeContent) {
                            this.getProperty("largeContent").value = largeContent;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return ToolbarDropdownButton;
                }(toolbar.ToolbarButton));
                toolbar.ToolbarDropdownButton = ToolbarDropdownButton;
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
                var events;
                (function (events) {
                    var DropdownButtonPressedEvent = (function (_super) {
                        __extends(DropdownButtonPressedEvent, _super);
                        function DropdownButtonPressedEvent(button, _childId) {
                            _super.call(this, button, DropdownButtonPressedEvent.TYPE);
                            this._childId = _childId;
                        }
                        Object.defineProperty(DropdownButtonPressedEvent.prototype, "childId", {
                            get: function () {
                                return this._childId;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        DropdownButtonPressedEvent.TYPE = "DropdownButtonPressedEvent";
                        return DropdownButtonPressedEvent;
                    }(events.ButtonPressedEvent));
                    events.DropdownButtonPressedEvent = DropdownButtonPressedEvent;
                })(events = toolbar.events || (toolbar.events = {}));
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
                var DropdownButtonController = (function (_super) {
                    __extends(DropdownButtonController, _super);
                    function DropdownButtonController(_groupMap, _dropdownButtonViewMap, __mobile) {
                        if (__mobile === void 0) { __mobile = false; }
                        _super.call(this, _groupMap, _dropdownButtonViewMap, __mobile);
                        this._dropdownButtonViewMap = _dropdownButtonViewMap;
                        this.__mobile = __mobile;
                    }
                    DropdownButtonController.prototype.childAdded = function (parent, component) {
                        _super.prototype.childAdded.call(this, parent, component);
                        var button = component;
                        var componentId = component.getProperty("id").value;
                        var childrenProperty = button.getProperty("children");
                        childrenProperty.addObserver(this);
                        var dropdownView = this._dropdownButtonViewMap.get(componentId);
                        dropdownView.updateChilds(childrenProperty.value);
                        this.updateChildEvents(button, childrenProperty.value);
                    };
                    DropdownButtonController.prototype.updateChildEvents = function (button, childs) {
                        var dropdownView = this._dropdownButtonViewMap.get(button.id);
                        var that = this;
                        if (button.largeContent || this.__mobile) {
                            dropdownView.getElement().bind("change", function (modelElement) {
                                return function (e) {
                                    var jqTarget = jQuery(e.target);
                                    var select = jqTarget.find(":selected");
                                    if (that.__mobile) {
                                        jqTarget.val([]);
                                    }
                                    that.eventManager.trigger(new toolbar.events.DropdownButtonPressedEvent(button, select.attr("data-id")));
                                };
                            }(button));
                        }
                        else {
                            var childArray = childs;
                            for (var childIndex in childArray) {
                                var view = dropdownView.getChildElement(childArray[childIndex].id);
                                view.bind("click", function (modelElement) {
                                    return function () {
                                        that.eventManager.trigger(new toolbar.events.DropdownButtonPressedEvent(button, modelElement.id));
                                    };
                                }(childArray[childIndex]));
                            }
                        }
                    };
                    DropdownButtonController.prototype.childRemoved = function (parent, component) {
                        _super.prototype.childRemoved.call(this, parent, component);
                    };
                    DropdownButtonController.prototype.propertyChanged = function (_old, _new) {
                        if (_new.name == "children") {
                            this._dropdownButtonViewMap.get(_new.from.getProperty("id").value).updateChilds(_new.value);
                            this.updateChildEvents(_new.from, _new.value);
                        }
                        else {
                            _super.prototype.propertyChanged.call(this, _old, _new);
                        }
                    };
                    DropdownButtonController.prototype.createButtonView = function (dropdown) {
                        if (!this.__mobile && dropdown.largeContent) {
                            return toolbar.ToolbarViewFactoryImpl.createLargeDropdownView(dropdown.id);
                        }
                        else {
                            return toolbar.ToolbarViewFactoryImpl.createDropdownView(dropdown.id);
                        }
                    };
                    return DropdownButtonController;
                }(toolbar.ButtonController));
                toolbar.DropdownButtonController = DropdownButtonController;
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
                var ToolbarImage = (function (_super) {
                    __extends(ToolbarImage, _super);
                    function ToolbarImage(id, href) {
                        _super.call(this, id);
                        this.addProperty(new ViewerProperty(this, "href", href));
                    }
                    Object.defineProperty(ToolbarImage.prototype, "href", {
                        get: function () {
                            return this.getProperty("href").value;
                        },
                        set: function (href) {
                            this.getProperty("href").value = href;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return ToolbarImage;
                }(toolbar.ToolbarComponent));
                toolbar.ToolbarImage = ToolbarImage;
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
                var ImageController = (function () {
                    function ImageController(_groupMap, _textViewMap) {
                        this._groupMap = _groupMap;
                        this._textViewMap = _textViewMap;
                    }
                    ImageController.prototype.childAdded = function (parent, component) {
                        var group = parent;
                        var groupView = this._groupMap.get(group.name);
                        var componentId = component.getProperty("id").value;
                        var text = component;
                        var imageView = this.createImageView(componentId);
                        var hrefProperty = text.getProperty("href");
                        hrefProperty.addObserver(this);
                        imageView.updateHref(hrefProperty.value);
                        groupView.addChild(imageView.getElement());
                        this._textViewMap.set(componentId, imageView);
                    };
                    ImageController.prototype.childRemoved = function (parent, component) {
                        var componentId = component.getProperty("id").value;
                        this._textViewMap.get(componentId).getElement().remove();
                        component.getProperty("href").removeObserver(this);
                    };
                    ImageController.prototype.propertyChanged = function (_old, _new) {
                        var textId = _new.from.getProperty("id").value;
                        if (_old.name == "href" && _new.name == "href") {
                            this._textViewMap.get(textId).updateHref(_new.value);
                        }
                    };
                    ImageController.prototype.createImageView = function (id) {
                        return toolbar.ToolbarViewFactoryImpl.createImageView(id);
                    };
                    return ImageController;
                }());
                toolbar.ImageController = ImageController;
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
                var ToolbarText = (function (_super) {
                    __extends(ToolbarText, _super);
                    function ToolbarText(id, text) {
                        _super.call(this, id);
                        this.addProperty(new ViewerProperty(this, "text", text));
                    }
                    Object.defineProperty(ToolbarText.prototype, "text", {
                        get: function () {
                            return this.getProperty("text").value;
                        },
                        set: function (text) {
                            this.getProperty("text").value = text;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return ToolbarText;
                }(toolbar.ToolbarComponent));
                toolbar.ToolbarText = ToolbarText;
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
                var TextController = (function () {
                    function TextController(_groupMap, _textViewMap, _mobile) {
                        this._groupMap = _groupMap;
                        this._textViewMap = _textViewMap;
                        this._mobile = _mobile;
                    }
                    TextController.prototype.childAdded = function (parent, component) {
                        var group = parent;
                        var groupView = this._groupMap.get(group.name);
                        var componentId = component.getProperty("id").value;
                        var text = component;
                        var textView = this.createTextView(componentId);
                        var textProperty = text.getProperty("text");
                        textProperty.addObserver(this);
                        textView.updateText(textProperty.value);
                        groupView.addChild(textView.getElement());
                        this._textViewMap.set(componentId, textView);
                    };
                    TextController.prototype.childRemoved = function (parent, component) {
                        var componentId = component.getProperty("id").value;
                        this._textViewMap.get(componentId).getElement().remove();
                        component.getProperty("text").removeObserver(this);
                    };
                    TextController.prototype.propertyChanged = function (_old, _new) {
                        var textId = _new.from.getProperty("id").value;
                        if (_old.name == "text" && _new.name == "text") {
                            this._textViewMap.get(textId).updateText(_new.value);
                        }
                    };
                    TextController.prototype.createTextView = function (id) {
                        return toolbar.ToolbarViewFactoryImpl.createTextView(id);
                    };
                    return TextController;
                }());
                toolbar.TextController = TextController;
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
                var ToolbarTextInput = (function (_super) {
                    __extends(ToolbarTextInput, _super);
                    function ToolbarTextInput(id, value, placeHolder) {
                        _super.call(this, id);
                        this.addProperty(new ViewerProperty(this, "value", value));
                        this.addProperty(new ViewerProperty(this, "placeHolder", placeHolder));
                    }
                    Object.defineProperty(ToolbarTextInput.prototype, "value", {
                        get: function () {
                            return this.getProperty("value").value;
                        },
                        set: function (value) {
                            this.getProperty("value").value = value;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(ToolbarTextInput.prototype, "placeHolder", {
                        get: function () {
                            return this.getProperty("placeHolder").value;
                        },
                        set: function (prefillText) {
                            this.getProperty("placeHolder").value = prefillText;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return ToolbarTextInput;
                }(toolbar.ToolbarComponent));
                toolbar.ToolbarTextInput = ToolbarTextInput;
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
                var TextInputController = (function () {
                    function TextInputController(_groupMap, _textInputViewMap) {
                        this._groupMap = _groupMap;
                        this._textInputViewMap = _textInputViewMap;
                    }
                    TextInputController.prototype.childAdded = function (parent, component) {
                        var group = parent;
                        var groupView = this._groupMap.get(group.name);
                        var componentId = component.getProperty("id").value;
                        var text = component;
                        var textView = this.createTextInputView(componentId);
                        var valueProperty = text.getProperty("value");
                        valueProperty.addObserver(this);
                        textView.updateValue(valueProperty.value);
                        var placeHolderProperty = text.getProperty("placeHolder");
                        placeHolderProperty.addObserver(this);
                        textView.updatePlaceholder(placeHolderProperty.value);
                        groupView.addChild(textView.getElement());
                        textView.onChange = function () {
                            if (textView.getValue() != valueProperty.value) {
                                valueProperty.value = textView.getValue();
                            }
                        };
                        this._textInputViewMap.set(componentId, textView);
                    };
                    TextInputController.prototype.childRemoved = function (parent, component) {
                        var componentId = component.getProperty("id").value;
                        this._textInputViewMap.get(componentId).getElement().remove();
                        component.getProperty("value").removeObserver(this);
                        component.getProperty("placeHolder").removeObserver(this);
                    };
                    TextInputController.prototype.propertyChanged = function (_old, _new) {
                        var textId = _new.from.getProperty("id").value;
                        var textInputView = this._textInputViewMap.get(textId);
                        if (_old.name == "value" && _new.name == "value") {
                            if (textInputView.getValue() != _new.value) {
                                textInputView.updateValue(_new.value);
                            }
                        }
                        if (_old.name == "placeHolder" && _new.name == "placeHolder") {
                            if (textInputView.getValue() != _new.value) {
                                textInputView.updatePlaceholder(_new.value);
                            }
                        }
                    };
                    TextInputController.prototype.createTextInputView = function (id) {
                        return toolbar.ToolbarViewFactoryImpl.createTextInputView(id);
                    };
                    return TextInputController;
                }());
                toolbar.TextInputController = TextInputController;
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
                var IviewToolbar = (function () {
                    function IviewToolbar(_container, _mobile, _model) {
                        if (_mobile === void 0) { _mobile = false; }
                        if (_model === void 0) { _model = new toolbar.ToolbarModel("default"); }
                        this._container = _container;
                        this._mobile = _mobile;
                        this._model = _model;
                        this._idViewMap = new MyCoReMap();
                        this._idGroupViewMap = new MyCoReMap();
                        this._eventManager = new mycore.viewer.widgets.events.ViewerEventManager();
                        this._model.addGroupObserver(this);
                        this._model.addObserver(this);
                        this._buttonController = new toolbar.ButtonController(this._idGroupViewMap, this._idViewMap, _mobile);
                        this._dropdownController = new toolbar.DropdownButtonController(this._idGroupViewMap, this._idViewMap, _mobile);
                        this._textController = new toolbar.TextController(this._idGroupViewMap, this._idViewMap, _mobile);
                        this._imageController = new toolbar.ImageController(this._idGroupViewMap, this._idViewMap);
                        this._textInputController = new toolbar.TextInputController(this._idGroupViewMap, this._idViewMap);
                        var that = this;
                        this._buttonController.eventManager.bind(function ToolbarCallback(e) {
                            that.eventManager.trigger(e);
                        });
                        this._dropdownController.eventManager.bind(function ToolbarCallback(e) {
                            that.eventManager.trigger(e);
                        });
                        this._createView();
                    }
                    Object.defineProperty(IviewToolbar.prototype, "model", {
                        get: function () {
                            return this._model;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewToolbar.prototype, "eventManager", {
                        get: function () {
                            return this._eventManager;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    IviewToolbar.prototype._createView = function () {
                        this._toolbarView = this.createToolbarView();
                        this._toolbarElement = this._toolbarView.getElement();
                        this._toolbarElement.appendTo(this._container);
                        var groups = this._model.getGroups();
                        for (var groupIndex in groups) {
                            var group = groups[groupIndex];
                            this.childAdded(this._model, group);
                        }
                        if (this._mobile) {
                            this._toolbarView.getElement().trigger("create");
                        }
                    };
                    IviewToolbar.prototype.childAdded = function (parent, component) {
                        if (parent instanceof toolbar.ToolbarModel) {
                            var parentModel = parent;
                            var childGroup = component;
                            var gv = this.createGroupView(childGroup.name, childGroup.align);
                            this._idGroupViewMap.set(childGroup.name, gv);
                            this._toolbarView.addChild(gv.getElement());
                            var children = childGroup.getComponents();
                            children.forEach(function (child) {
                                childGroup.notifyObserverChildAdded(childGroup, child);
                            });
                        }
                        else if (parent instanceof toolbar.ToolbarGroup) {
                            if (component instanceof toolbar.ToolbarDropdownButton) {
                                this._dropdownController.childAdded(parent, component);
                                return;
                            }
                            if (component instanceof toolbar.ToolbarButton) {
                                this._buttonController.childAdded(parent, component);
                                return;
                            }
                            if (component instanceof toolbar.ToolbarText) {
                                this._textController.childAdded(parent, component);
                                return;
                            }
                            if (component instanceof toolbar.ToolbarTextInput) {
                                this._textInputController.childAdded(parent, component);
                                return;
                            }
                            if (component instanceof toolbar.ToolbarImage) {
                                if (this._mobile) {
                                    throw new ViewerError("Mobile Toolbar doesnt support Image!");
                                }
                                this._imageController.childAdded(parent, component);
                                return;
                            }
                        }
                    };
                    IviewToolbar.prototype.createToolbarView = function () {
                        return toolbar.ToolbarViewFactoryImpl.createToolbarView();
                    };
                    IviewToolbar.prototype.createGroupView = function (id, align) {
                        return toolbar.ToolbarViewFactoryImpl.createGroupView(id, align);
                    };
                    IviewToolbar.prototype.childRemoved = function (parent, component) {
                        if (component instanceof toolbar.ToolbarDropdownButton) {
                            this._dropdownController.childRemoved(parent, component);
                            return;
                        }
                        if (component instanceof toolbar.ToolbarButton) {
                            this._buttonController.childRemoved(parent, component);
                            return;
                        }
                        if (component instanceof toolbar.ToolbarText) {
                            this._textController.childRemoved(parent, component);
                            return;
                        }
                        if (component instanceof toolbar.ToolbarImage) {
                            this._imageController.childRemoved(parent, component);
                            return;
                        }
                        if (component instanceof toolbar.ToolbarTextInput) {
                            this._textInputController.childRemoved(parent, component);
                            return;
                        }
                    };
                    IviewToolbar.prototype.getView = function (component) {
                        if (component instanceof toolbar.ToolbarComponent) {
                            var toolbarComponent = component;
                            var componentId = toolbarComponent.getProperty("id").value;
                        }
                        else if (typeof component == "string") {
                            var componentId = component;
                        }
                        else {
                            return this._toolbarView;
                        }
                        return this._idViewMap.get(componentId);
                    };
                    return IviewToolbar;
                }());
                toolbar.IviewToolbar = IviewToolbar;
            })(toolbar = widgets.toolbar || (widgets.toolbar = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var model;
        (function (model) {
            var LanguageModel = (function () {
                function LanguageModel(_keyTranslationMap) {
                    this._keyTranslationMap = _keyTranslationMap;
                }
                LanguageModel.prototype.getTranslation = function (key) {
                    return this._keyTranslationMap.has(key) ? this._keyTranslationMap.get(key) : "???" + key + "???";
                };
                LanguageModel.prototype.getFormatedTranslation = function (key) {
                    var format = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        format[_i - 1] = arguments[_i];
                    }
                    return this._keyTranslationMap.has(key) ? ViewerFormatString(this._keyTranslationMap.get(key), format) : "???" + key + "??? " + format.join(" ");
                };
                LanguageModel.prototype.hasTranslation = function (key) {
                    return this._keyTranslationMap.has(key);
                };
                LanguageModel.prototype.translate = function (element) {
                    var that = this;
                    element.find("[data-i18n]").each(function () {
                        var sub = $(this);
                        var key = sub.data("i18n");
                        if (!that.hasTranslation(key)) {
                            return;
                        }
                        sub.html(that.getTranslation(key));
                    });
                };
                return LanguageModel;
            }());
            model.LanguageModel = LanguageModel;
        })(model = viewer.model || (viewer.model = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var model;
        (function (model_1) {
            var MyCoReBasicToolbarModel = (function (_super) {
                __extends(MyCoReBasicToolbarModel, _super);
                function MyCoReBasicToolbarModel(id) {
                    _super.call(this, id);
                    this._dropdownChildren = new Array();
                    this.initComponents();
                    this.addComponents();
                }
                MyCoReBasicToolbarModel.prototype.initComponents = function () {
                    this._sidebarControllGroup = new viewer.widgets.toolbar.ToolbarGroup("SidebarControllGroup");
                    this._sidebarControllDropdownButton = new viewer.widgets.toolbar.ToolbarDropdownButton("SidebarControllDropdownButton", "", [], "menu-hamburger");
                    this._imageOverviewDropdownChild = { id: "imageOverview", label: "Bildübersicht" };
                    this._chapterOverviewDropdownChild = { id: "chapterOverview", label: "Strukturübersicht" };
                    this._dropdownChildren.push(this._imageOverviewDropdownChild);
                    this._dropdownChildren.push(this._chapterOverviewDropdownChild);
                    this._sidebarControllDropdownButton.children = this._dropdownChildren;
                    this._sidebarControllGroup.addComponent(this._sidebarControllDropdownButton);
                    this._imageChangeControllGroup = new viewer.widgets.toolbar.ToolbarGroup("ImageChangeControllGroup");
                    this._previousImageButton = new viewer.widgets.toolbar.ToolbarButton("PreviousImageButton", "", "previous-image", "arrow-left");
                    this._pageSelect = new viewer.widgets.toolbar.ToolbarDropdownButton("PageSelect", "", [], null, true);
                    this._pageSelectChildren = new Array();
                    this._pageSelect.children = this._pageSelectChildren;
                    this._nextImageButton = new viewer.widgets.toolbar.ToolbarButton("NextImageButton", "", "next-image", "arrow-right");
                    this._imageChangeControllGroup.addComponent(this._previousImageButton);
                    this._imageChangeControllGroup.addComponent(this._pageSelect);
                    this._imageChangeControllGroup.addComponent(this._nextImageButton);
                    this._zoomControllGroup = new viewer.widgets.toolbar.ToolbarGroup("ZoomControllGroup");
                    this._zoomInButton = new viewer.widgets.toolbar.ToolbarButton("ZoomInButton", "", "zoom-in", "plus");
                    this._zoomOutButton = new viewer.widgets.toolbar.ToolbarButton("ZoomOutButton", "", "zoom-out", "minus");
                    this._zoomWidthButton = new viewer.widgets.toolbar.ToolbarButton("ZoomWidthButton", "", "zoom-width", "resize-horizontal");
                    this._zoomFitButton = new viewer.widgets.toolbar.ToolbarButton("ZoomFitButton", "", "zoom-fit-in", "resize-full");
                    this._rotateButton = new viewer.widgets.toolbar.ToolbarButton("RotateButton", "", "Rotate", "repeat");
                    this._zoomControllGroup.addComponent(this._zoomInButton);
                    this._zoomControllGroup.addComponent(this._zoomOutButton);
                    this._zoomControllGroup.addComponent(this._zoomWidthButton);
                    this._zoomControllGroup.addComponent(this._zoomFitButton);
                    this._zoomControllGroup.addComponent(this._rotateButton);
                    this._layoutControllGroup = new viewer.widgets.toolbar.ToolbarGroup("LayoutControllGroup");
                    this._layoutDropdownButtonChilds = [];
                    this._layoutDropdownButton = new viewer.widgets.toolbar.ToolbarDropdownButton("LayoutDropdownButton", "", this._layoutDropdownButtonChilds, "book", false);
                    this._layoutControllGroup.addComponent(this._layoutDropdownButton);
                    this._actionControllGroup = new viewer.widgets.toolbar.ToolbarGroup("ActionControllGroup");
                    this._shareButton = new viewer.widgets.toolbar.ToolbarButton("ShareButton", "", "share", "share");
                    this._actionControllGroup.addComponent(this._shareButton);
                    this._searchGroup = new viewer.widgets.toolbar.ToolbarGroup("SearchGroup", true);
                    this._closeViewerGroup = new viewer.widgets.toolbar.ToolbarGroup("CloseViewerGroup", true);
                    this._closeViewerButton = new viewer.widgets.toolbar.ToolbarButton("CloseViewerButton", "", "close-viewer", "off");
                    this._closeViewerGroup.addComponent(this._closeViewerButton);
                };
                MyCoReBasicToolbarModel.prototype.addComponents = function () {
                };
                MyCoReBasicToolbarModel.prototype.i18n = function (model) {
                    this._previousImageButton.tooltip = model.getTranslation("toolbar.backward");
                    this._nextImageButton.tooltip = model.getTranslation("toolbar.forward");
                    this._zoomInButton.tooltip = model.getTranslation("toolbar.zoomIn");
                    this._zoomOutButton.tooltip = model.getTranslation("toolbar.zoomOut");
                    this._zoomWidthButton.tooltip = model.getTranslation("toolbar.toWidth");
                    this._zoomFitButton.tooltip = model.getTranslation("toolbar.toScreen");
                    this._shareButton.tooltip = model.getTranslation("toolbar.permalink");
                    this._closeViewerButton.tooltip = model.getTranslation("toolbar.normalView");
                    this._rotateButton.tooltip = model.getTranslation("toolbar.rotate");
                    this._imageOverviewDropdownChild.label = model.getTranslation("toolbar.openThumbnailPanel");
                    this._chapterOverviewDropdownChild.label = model.getTranslation("toolbar.openChapter");
                    this._sidebarControllDropdownButton.children = this._sidebarControllDropdownButton.children;
                };
                return MyCoReBasicToolbarModel;
            }(viewer.widgets.toolbar.ToolbarModel));
            model_1.MyCoReBasicToolbarModel = MyCoReBasicToolbarModel;
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
                var WaitForEvent = (function (_super) {
                    __extends(WaitForEvent, _super);
                    function WaitForEvent(component, eventType) {
                        _super.call(this, component, WaitForEvent.TYPE);
                        this.eventType = eventType;
                    }
                    WaitForEvent.TYPE = "WaitForEvent";
                    return WaitForEvent;
                }(events.MyCoReImageViewerEvent));
                events.WaitForEvent = WaitForEvent;
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
            var ViewerComponent = (function (_super) {
                __extends(ViewerComponent, _super);
                function ViewerComponent() {
                    _super.call(this);
                    this._eventCache = new MyCoReMap();
                }
                ViewerComponent.prototype.init = function () {
                    console.info("Warning: IviewComponent doesnt implements init " + this);
                    return;
                };
                Object.defineProperty(ViewerComponent.prototype, "handlesEvents", {
                    get: function () {
                        return [];
                    },
                    enumerable: true,
                    configurable: true
                });
                ViewerComponent.prototype._handle = function (e) {
                    if (e instanceof components.events.WaitForEvent) {
                        var wfe = e;
                        if (this._eventCache.has(wfe.eventType)) {
                            var cachedEvent = this._eventCache.get(wfe.eventType);
                            wfe.component.handle(cachedEvent);
                        }
                    }
                    this.handle(e);
                    return;
                };
                ViewerComponent.prototype.handle = function (e) {
                };
                ViewerComponent.prototype.trigger = function (e) {
                    this._eventCache.set(e.type, e);
                    _super.prototype.trigger.call(this, e);
                };
                return ViewerComponent;
            }(mycore.viewer.widgets.events.ViewerEventManager));
            components.ViewerComponent = ViewerComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var MyCoReViewerSettings = (function () {
            function MyCoReViewerSettings() {
            }
            MyCoReViewerSettings.normalize = function (settings) {
                var parameter = ViewerParameterMap.fromCurrentUrl();
                if (typeof settings.filePath != "undefined" && settings.filePath != null && settings.filePath.charAt(0) == '/') {
                    settings.filePath = settings.filePath.substring(1);
                }
                if (typeof settings.derivateURL != "undefined" &&
                    settings.derivateURL != null &&
                    settings.derivateURL.charAt(settings.derivateURL.length - 1) != '/') {
                    settings.derivateURL += "/";
                }
                settings.filePath = encodeURI(settings.filePath);
                if (settings.webApplicationBaseURL.lastIndexOf("/") == settings.webApplicationBaseURL.length - 1) {
                    settings.webApplicationBaseURL = settings.webApplicationBaseURL.substring(0, settings.webApplicationBaseURL.length - 1);
                }
                return settings;
            };
            return MyCoReViewerSettings;
        }());
        viewer.MyCoReViewerSettings = MyCoReViewerSettings;
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var layout;
            (function (layout) {
                var IviewBorderLayout = (function () {
                    function IviewBorderLayout(_parent, _horizontalStronger, descriptions) {
                        this._parent = _parent;
                        this._horizontalStronger = _horizontalStronger;
                        this._containerMap = new MyCoReMap();
                        this._descriptionMap = new MyCoReMap();
                        for (var i in descriptions) {
                            var description = descriptions[i];
                            this._descriptionMap.set(description.direction, description);
                        }
                        for (var i in descriptions) {
                            var description = descriptions[i];
                            this._initContainer(description);
                        }
                        var that = this;
                        window.onresize = function () {
                            that.updateSizes();
                        };
                        this._initCenter();
                    }
                    IviewBorderLayout.prototype._initCenter = function () {
                        var centerContainerDiv = jQuery("<div></div>");
                        centerContainerDiv.addClass(this.getDirectionDescription(IviewBorderLayout.DIRECTION_CENTER));
                        var cssDescription = this._updateCenterCss();
                        this._parent.append(centerContainerDiv);
                        centerContainerDiv.css(cssDescription);
                        this._containerMap.set(IviewBorderLayout.DIRECTION_CENTER, centerContainerDiv);
                    };
                    IviewBorderLayout.prototype._updateCenterCss = function () {
                        var cssDescription = {};
                        cssDescription.position = "absolute";
                        cssDescription.left = this.getContainerSize(IviewBorderLayout.DIRECTION_WEST) + "px";
                        cssDescription.top = this.getContainerSize(IviewBorderLayout.DIRECTION_NORTH) + "px";
                        cssDescription.bottom = this.getContainerSize(IviewBorderLayout.DIRECTION_SOUTH) + "px";
                        cssDescription.right = this.getContainerSize(IviewBorderLayout.DIRECTION_EAST) + "px";
                        return cssDescription;
                    };
                    IviewBorderLayout.prototype._initContainer = function (description) {
                        var containerDiv = jQuery("<div></div>");
                        containerDiv.addClass(this.getDirectionDescription(description.direction));
                        if (typeof description.resizeable == "undefined") {
                            description.resizeable = false;
                        }
                        if (description.resizeable) {
                            this._initContainerResizeable(containerDiv, description);
                        }
                        this._correctDescription(description);
                        var cssDescription = this._updateCssDescription(description);
                        containerDiv.css(cssDescription);
                        this._parent.append(containerDiv);
                        this._containerMap.set(description.direction, containerDiv);
                    };
                    IviewBorderLayout.prototype._correctDescription = function (description) {
                        if ("minSize" in description && !isNaN(description.minSize)) {
                            var minimumSize = description.minSize;
                            description.size = Math.max(description.minSize, description.size);
                        }
                    };
                    IviewBorderLayout.prototype._updateCssDescription = function (description) {
                        var cssDescription = {};
                        cssDescription.position = "absolute";
                        cssDescription.right = "0px";
                        cssDescription.top = "0px";
                        cssDescription.bottom = "0px";
                        cssDescription.left = "0px";
                        cssDescription.display = description.size !== 0 ? "block" : "none";
                        switch (description.direction) {
                            case IviewBorderLayout.DIRECTION_EAST:
                                delete cssDescription.left;
                                break;
                            case IviewBorderLayout.DIRECTION_WEST:
                                delete cssDescription.right;
                                break;
                            case IviewBorderLayout.DIRECTION_SOUTH:
                                delete cssDescription.top;
                                break;
                            case IviewBorderLayout.DIRECTION_NORTH:
                                delete cssDescription.bottom;
                                break;
                        }
                        if (description.direction == IviewBorderLayout.DIRECTION_NORTH || description.direction == IviewBorderLayout.DIRECTION_SOUTH) {
                            if (this.hasContainer(IviewBorderLayout.DIRECTION_WEST) && this.horizontalStronger) {
                                cssDescription.left = this.getContainerSizeDescription(IviewBorderLayout.DIRECTION_WEST) + "px";
                            }
                            if (this.hasContainer(IviewBorderLayout.DIRECTION_EAST) && this.horizontalStronger) {
                                cssDescription.right = this.getContainerSizeDescription(IviewBorderLayout.DIRECTION_EAST) + "px";
                            }
                            cssDescription.height = description.size + "px";
                        }
                        else {
                            if (this.hasContainer(IviewBorderLayout.DIRECTION_NORTH) && !this.horizontalStronger) {
                                cssDescription.top = this.getContainerSizeDescription(IviewBorderLayout.DIRECTION_NORTH) + "px";
                            }
                            if (this.hasContainer(IviewBorderLayout.DIRECTION_SOUTH) && !this.horizontalStronger) {
                                cssDescription.bottom = this.getContainerSizeDescription(IviewBorderLayout.DIRECTION_SOUTH) + "px";
                            }
                            cssDescription.width = description.size + "px";
                        }
                        return cssDescription;
                    };
                    IviewBorderLayout.prototype.updateSizes = function () {
                        var descriptions = this._descriptionMap.values;
                        for (var i in descriptions) {
                            var description = descriptions[i];
                            var container = this._containerMap.get(description.direction);
                            this._correctDescription(description);
                            container.css(this._updateCssDescription(description));
                            container.delay(10).children().trigger("iviewResize");
                        }
                        var container = this._containerMap.get(IviewBorderLayout.DIRECTION_CENTER);
                        container.css(this._updateCenterCss());
                        container.delay(10).children().trigger("iviewResize");
                    };
                    IviewBorderLayout.prototype._initContainerResizeable = function (containerDiv, description) {
                        var resizerElement = jQuery("<span></span>");
                        resizerElement.addClass("resizer");
                        var that = this;
                        resizerElement.bind("mousedown", function resizerMouseDown(e) {
                            var startPos = new Position2D(e.clientX, e.clientY);
                            var startSize = description.size;
                            var MOUSE_MOVE = function (e) {
                                var curPos = new Position2D(e.clientX, e.clientY);
                                description.size = that._getNewSize(startPos, curPos, startSize, description.direction);
                                e.preventDefault();
                                that.updateSizes();
                            };
                            var MOUSE_UP = function (e) {
                                var curPos = new Position2D(e.clientX, e.clientY);
                                that._parent.unbind("mousemove");
                                that._parent.unbind("mouseup");
                            };
                            e.preventDefault();
                            jQuery(that._parent).bind("mousemove", MOUSE_MOVE);
                            jQuery(that._parent).bind("mouseup", MOUSE_UP);
                        });
                        var cssElem = {};
                        cssElem.position = "absolute";
                        var resizeWidth = 6;
                        if (description.direction == IviewBorderLayout.DIRECTION_NORTH || IviewBorderLayout.DIRECTION_SOUTH == description.direction) {
                            cssElem.cursor = "row-resize";
                            cssElem.left = "0px";
                            cssElem.height = resizeWidth + "px";
                            cssElem.right = "0px";
                            if (description.direction == IviewBorderLayout.DIRECTION_NORTH) {
                                cssElem.bottom = -(resizeWidth / 2) + "px";
                            }
                            else {
                                cssElem.top = -(resizeWidth / 2) + "px";
                            }
                        }
                        if (description.direction == IviewBorderLayout.DIRECTION_WEST || IviewBorderLayout.DIRECTION_EAST == description.direction) {
                            cssElem.cursor = "col-resize";
                            cssElem.top = "0px";
                            cssElem.bottom = "0px";
                            cssElem.width = resizeWidth + "px";
                            if (description.direction == IviewBorderLayout.DIRECTION_WEST) {
                                cssElem.right = -(resizeWidth / 2) + "px";
                            }
                            else {
                                cssElem.left = -(resizeWidth / 2) + "px";
                            }
                        }
                        resizerElement.css(cssElem);
                        resizerElement.appendTo(containerDiv);
                    };
                    IviewBorderLayout.prototype._getNewSize = function (startPosition, currentPosition, startSize, direction) {
                        var newSize;
                        if (direction == IviewBorderLayout.DIRECTION_EAST || direction == IviewBorderLayout.DIRECTION_WEST) {
                            var diff = startPosition.x - currentPosition.x;
                            if (direction == IviewBorderLayout.DIRECTION_EAST) {
                                newSize = startSize + diff;
                            }
                            else {
                                newSize = startSize - diff;
                            }
                        }
                        if (direction == IviewBorderLayout.DIRECTION_NORTH || direction == IviewBorderLayout.DIRECTION_SOUTH) {
                            var diff = startPosition.y - currentPosition.y;
                            if (direction == IviewBorderLayout.DIRECTION_SOUTH) {
                                newSize = startSize + diff;
                            }
                            else {
                                newSize = startSize - diff;
                            }
                        }
                        return newSize;
                    };
                    IviewBorderLayout.prototype.hasContainer = function (direction) {
                        return this._descriptionMap.has(direction) || this._containerMap.has(direction);
                    };
                    IviewBorderLayout.prototype.getContainer = function (direction) {
                        if (this._containerMap.has(direction)) {
                            return this._containerMap.get(direction);
                        }
                        else {
                            return null;
                        }
                    };
                    Object.defineProperty(IviewBorderLayout.prototype, "horizontalStronger", {
                        get: function () {
                            return this._horizontalStronger;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    IviewBorderLayout.prototype.getContainerSizeDescription = function (direction) {
                        return this._descriptionMap.get(direction).size;
                    };
                    IviewBorderLayout.prototype.getContainerDescription = function (direction) {
                        return this._descriptionMap.get(direction);
                    };
                    IviewBorderLayout.prototype.getContainerSize = function (direction) {
                        if (this.hasContainer(direction)) {
                            var container = this.getContainer(direction);
                            if (direction == IviewBorderLayout.DIRECTION_EAST || direction == IviewBorderLayout.DIRECTION_WEST) {
                                return container.width();
                            }
                            else if (direction == IviewBorderLayout.DIRECTION_NORTH || direction == IviewBorderLayout.DIRECTION_SOUTH) {
                                return container.height();
                            }
                            else {
                                return container.width();
                            }
                        }
                        else {
                            return 0;
                        }
                    };
                    IviewBorderLayout.prototype.getDirectionDescription = function (direction) {
                        return ["center", "east", "south", "west", "north"][direction];
                    };
                    IviewBorderLayout.DIRECTION_CENTER = 0;
                    IviewBorderLayout.DIRECTION_EAST = 1;
                    IviewBorderLayout.DIRECTION_SOUTH = 2;
                    IviewBorderLayout.DIRECTION_WEST = 3;
                    IviewBorderLayout.DIRECTION_NORTH = 4;
                    return IviewBorderLayout;
                }());
                layout.IviewBorderLayout = IviewBorderLayout;
            })(layout = widgets.layout || (widgets.layout = {}));
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
                var ComponentInitializedEvent = (function (_super) {
                    __extends(ComponentInitializedEvent, _super);
                    function ComponentInitializedEvent(component) {
                        _super.call(this, component, ComponentInitializedEvent.TYPE);
                    }
                    ComponentInitializedEvent.TYPE = "ComponentInitializedEvent";
                    return ComponentInitializedEvent;
                }(events.MyCoReImageViewerEvent));
                events.ComponentInitializedEvent = ComponentInitializedEvent;
            })(events = components.events || (components.events = {}));
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var model;
        (function (model) {
            var StructureImage = (function () {
                function StructureImage(type, id, order, orderLabel, href, mimetype, requestImgdataUrl, additionalHrefs, uniqueIdentifier) {
                    if (additionalHrefs === void 0) { additionalHrefs = new MyCoReMap(); }
                    this.type = type;
                    this.id = id;
                    this.order = order;
                    this.orderLabel = orderLabel;
                    this.href = href;
                    this.mimetype = mimetype;
                    this.requestImgdataUrl = requestImgdataUrl;
                    this.additionalHrefs = additionalHrefs;
                    if (typeof uniqueIdentifier == "undefined" || uniqueIdentifier == null || uniqueIdentifier == "") {
                        this.uniqueIdentifier = null;
                    }
                    else {
                        this.uniqueIdentifier = uniqueIdentifier;
                    }
                }
                return StructureImage;
            }());
            model.StructureImage = StructureImage;
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
                var ImageChangedEvent = (function (_super) {
                    __extends(ImageChangedEvent, _super);
                    function ImageChangedEvent(component, _image) {
                        _super.call(this, component, ImageChangedEvent.TYPE);
                        this._image = _image;
                    }
                    Object.defineProperty(ImageChangedEvent.prototype, "image", {
                        get: function () {
                            return this._image;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    ImageChangedEvent.TYPE = "ImageChangedEvent";
                    return ImageChangedEvent;
                }(events.MyCoReImageViewerEvent));
                events.ImageChangedEvent = ImageChangedEvent;
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
            var events;
            (function (events) {
                var ImageSelectedEvent = (function (_super) {
                    __extends(ImageSelectedEvent, _super);
                    function ImageSelectedEvent(component, _image) {
                        _super.call(this, component, ImageSelectedEvent.TYPE);
                        this._image = _image;
                    }
                    Object.defineProperty(ImageSelectedEvent.prototype, "image", {
                        get: function () {
                            return this._image;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    ImageSelectedEvent.TYPE = "ImageSelectedEvent";
                    return ImageSelectedEvent;
                }(events.MyCoReImageViewerEvent));
                events.ImageSelectedEvent = ImageSelectedEvent;
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
            var events;
            (function (events) {
                var ShowContentEvent = (function (_super) {
                    __extends(ShowContentEvent, _super);
                    function ShowContentEvent(component, content, containerDirection, size, text) {
                        if (size === void 0) { size = 300; }
                        if (text === void 0) { text = null; }
                        _super.call(this, component, ShowContentEvent.TYPE);
                        this.content = content;
                        this.containerDirection = containerDirection;
                        this.size = size;
                        this.text = text;
                    }
                    ShowContentEvent.DIRECTION_CENTER = 0;
                    ShowContentEvent.DIRECTION_EAST = 1;
                    ShowContentEvent.DIRECTION_SOUTH = 2;
                    ShowContentEvent.DIRECTION_WEST = 3;
                    ShowContentEvent.DIRECTION_NORTH = 4;
                    ShowContentEvent.TYPE = "ShowContentEvent";
                    return ShowContentEvent;
                }(events.MyCoReImageViewerEvent));
                events.ShowContentEvent = ShowContentEvent;
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
            var MyCoReViewerContainerComponent = (function (_super) {
                __extends(MyCoReViewerContainerComponent, _super);
                function MyCoReViewerContainerComponent(_settings, _container, _contentContainer) {
                    if (_contentContainer === void 0) { _contentContainer = jQuery("<div></div>"); }
                    _super.call(this);
                    this._settings = _settings;
                    this._container = _container;
                    this._contentContainer = _contentContainer;
                    this._lastSizeMap = new MyCoReMap();
                }
                MyCoReViewerContainerComponent.prototype.init = function () {
                    var _this = this;
                    this._container.append(this._contentContainer);
                    this._container.css({ "overflow": "hidden" });
                    jQuery(this._contentContainer).css({
                        "left": "0px",
                        "bottom": "0px",
                        "right": "0px",
                        "position": "absolute"
                    });
                    var containerDescriptions = [];
                    if (!this._settings.mobile) {
                        containerDescriptions = [
                            { direction: MyCoReViewerContainerComponent.SIDEBAR_DIRECTION, resizeable: true, size: 0, minSize: 0 },
                            { direction: MyCoReViewerContainerComponent.INFORMATION_BAR_DIRECTION, resizeable: false, size: 30 },
                            { direction: mycore.viewer.widgets.layout.IviewBorderLayout.DIRECTION_EAST, resizeable: true, size: 0 }
                        ];
                    }
                    this._layout = new mycore.viewer.widgets.layout.IviewBorderLayout(this._contentContainer, false, containerDescriptions);
                    this._content = this._layout.getContainer(MyCoReViewerContainerComponent.CONTENT_DIRECTION);
                    if (!this._settings.mobile) {
                        this._sidebar = this._layout.getContainer(MyCoReViewerContainerComponent.SIDEBAR_DIRECTION);
                        this._informationBar = this._layout.getContainer(MyCoReViewerContainerComponent.INFORMATION_BAR_DIRECTION);
                        this._sidebar.addClass("panel panel-default sidebar");
                        this._informationBar = this._layout.getContainer(MyCoReViewerContainerComponent.INFORMATION_BAR_DIRECTION);
                        this._layout.getContainer(viewer.widgets.layout.IviewBorderLayout.DIRECTION_EAST).addClass("panel panel-default sidebar");
                        this._container.bind("iviewResize", function () {
                            _this.correctToToolbarSize();
                        });
                    }
                };
                MyCoReViewerContainerComponent.prototype.correctToToolbarSize = function () {
                    var toolbar = this._container.parent().find(".navbar.navbar-default");
                    var heightOfToolbar = toolbar.outerHeight(false);
                    toolbar.siblings().css({ "top": heightOfToolbar + "px" });
                };
                MyCoReViewerContainerComponent.prototype.handle = function (e) {
                    var _this = this;
                    if (e.type == components.events.ComponentInitializedEvent.TYPE) {
                    }
                    if (e.type == components.events.ShowContentEvent.TYPE) {
                        var sce = e;
                        var container = this._layout.getContainer(sce.containerDirection);
                        this._clearOldContent(container);
                        container.append(sce.content);
                        if (sce.text != null && !this._settings.mobile) {
                            var heading = jQuery("<div></div>");
                            heading.addClass("panel-heading");
                            var closeButton = jQuery("<button></button>");
                            closeButton.attr("type", "button");
                            closeButton.addClass("close");
                            var inSpan = jQuery("<span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span>");
                            closeButton.append(inSpan);
                            heading.prepend(sce.text);
                            heading.append(closeButton);
                            container.prepend(heading);
                            closeButton.click(function () {
                                sce.component = _this;
                                sce.size = 0;
                                _this.trigger(sce);
                            });
                        }
                        if (sce.containerDirection != MyCoReViewerContainerComponent.CONTENT_DIRECTION) {
                            var containerDescription = this._layout.getContainerDescription(sce.containerDirection);
                            if (sce.size != -1) {
                                if (sce.size == 0) {
                                    container.css({ display: "none" });
                                    this._lastSizeMap.set(containerDescription.direction, containerDescription.size);
                                    containerDescription.size = 0;
                                }
                                else {
                                    container.css({ display: "block" });
                                    containerDescription.size = sce.size;
                                }
                            }
                            else {
                                container.css({ display: "block" });
                                if (containerDescription.size == 0 && this._lastSizeMap.has(containerDescription.direction)) {
                                    containerDescription.size = this._lastSizeMap.get(containerDescription.direction);
                                }
                                else if (containerDescription.size > 0) {
                                    containerDescription.size = containerDescription.size;
                                }
                                else {
                                    containerDescription.size = 300;
                                }
                            }
                            this._layout.updateSizes();
                        }
                        this.correctToToolbarSize();
                    }
                    if (e.type == mycore.viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE) {
                        var dropdownButtonPressedEvent = e;
                        if (dropdownButtonPressedEvent.childId == "close") {
                            this._closeSidebar();
                        }
                    }
                    if (e.type == mycore.viewer.widgets.toolbar.events.ButtonPressedEvent.TYPE) {
                        var buttonPressedEvent = e;
                        if (buttonPressedEvent.button.id == "CloseViewerButton") {
                            if (typeof this._settings.onClose !== "function" || this._settings.onClose == null) {
                                if (window.history.length > 1) {
                                    window.history.back();
                                }
                                else {
                                    window.close();
                                }
                            }
                            else {
                                this._settings.onClose.apply(window);
                            }
                        }
                    }
                };
                MyCoReViewerContainerComponent.prototype._closeSidebar = function () {
                    var description = this._layout.getContainerDescription(MyCoReViewerContainerComponent.SIDEBAR_DIRECTION);
                    description.size = 0;
                    description.minSize = 0;
                    this._clearOldContent(this._layout.getContainer(MyCoReViewerContainerComponent.SIDEBAR_DIRECTION));
                    this._layout.updateSizes();
                };
                MyCoReViewerContainerComponent.prototype._clearOldContent = function (container) {
                    container.children().not(".resizer").detach();
                };
                Object.defineProperty(MyCoReViewerContainerComponent.prototype, "handlesEvents", {
                    get: function () {
                        return [mycore.viewer.widgets.toolbar.events.ButtonPressedEvent.TYPE,
                            mycore.viewer.components.events.ShowContentEvent.TYPE,
                            components.events.ImageSelectedEvent.TYPE];
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReViewerContainerComponent.SIDEBAR_DIRECTION = mycore.viewer.widgets.layout.IviewBorderLayout.DIRECTION_WEST;
                MyCoReViewerContainerComponent.CONTENT_DIRECTION = mycore.viewer.widgets.layout.IviewBorderLayout.DIRECTION_CENTER;
                MyCoReViewerContainerComponent.INFORMATION_BAR_DIRECTION = mycore.viewer.widgets.layout.IviewBorderLayout.DIRECTION_SOUTH;
                return MyCoReViewerContainerComponent;
            }(components.ViewerComponent));
            components.MyCoReViewerContainerComponent = MyCoReViewerContainerComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var model;
        (function (model) {
            var StructureChapter = (function () {
                function StructureChapter(_parent, _type, _id, _label, _chapter, _additional, _destinationResolver) {
                    if (_chapter === void 0) { _chapter = new Array(); }
                    if (_additional === void 0) { _additional = new MyCoReMap(); }
                    if (_destinationResolver === void 0) { _destinationResolver = function () { return null; }; }
                    this._parent = _parent;
                    this._type = _type;
                    this._id = _id;
                    this._label = _label;
                    this._chapter = _chapter;
                    this._additional = _additional;
                    this._destinationResolver = _destinationResolver;
                }
                Object.defineProperty(StructureChapter.prototype, "parent", {
                    get: function () {
                        return this._parent;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StructureChapter.prototype, "type", {
                    get: function () {
                        return this._type;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StructureChapter.prototype, "id", {
                    get: function () {
                        return this._id;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StructureChapter.prototype, "label", {
                    get: function () {
                        return this._label;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StructureChapter.prototype, "chapter", {
                    get: function () {
                        return this._chapter;
                    },
                    set: function (chapter) {
                        this._chapter = chapter;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StructureChapter.prototype, "additional", {
                    get: function () {
                        return this._additional;
                    },
                    enumerable: true,
                    configurable: true
                });
                StructureChapter.prototype.resolveDestination = function (callbackFn) {
                    this._destinationResolver(callbackFn);
                };
                return StructureChapter;
            }());
            model.StructureChapter = StructureChapter;
        })(model = viewer.model || (viewer.model = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var model;
        (function (model) {
            var StructureModel = (function () {
                function StructureModel(_rootChapter, _imageList, _chapterToImageMap, _imageToChapterMap, _imageHrefImageMap, _textContentPresent) {
                    this._rootChapter = _rootChapter;
                    this._imageList = _imageList;
                    this._chapterToImageMap = _chapterToImageMap;
                    this._imageToChapterMap = _imageToChapterMap;
                    this._imageHrefImageMap = _imageHrefImageMap;
                    this._textContentPresent = _textContentPresent;
                }
                Object.defineProperty(StructureModel.prototype, "rootChapter", {
                    get: function () {
                        return this._rootChapter;
                    },
                    set: function (rootChapter) {
                        this._rootChapter = rootChapter;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StructureModel.prototype, "imageList", {
                    get: function () {
                        return this._imageList;
                    },
                    set: function (imageList) {
                        this._imageList = imageList;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StructureModel.prototype, "chapterToImageMap", {
                    get: function () {
                        return this._chapterToImageMap;
                    },
                    set: function (chapterToImageMap) {
                        this._chapterToImageMap = chapterToImageMap;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StructureModel.prototype, "imageToChapterMap", {
                    get: function () {
                        return this._imageToChapterMap;
                    },
                    set: function (imageToChapterMap) {
                        this._imageToChapterMap = imageToChapterMap;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StructureModel.prototype, "imageHrefImageMap", {
                    get: function () {
                        return this._imageHrefImageMap;
                    },
                    set: function (imageHrefImageMap) {
                        this._imageHrefImageMap = imageHrefImageMap;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StructureModel.prototype, "isTextContentPresent", {
                    get: function () {
                        return this._textContentPresent;
                    },
                    set: function (textContentPresent) {
                        this._textContentPresent = textContentPresent;
                    },
                    enumerable: true,
                    configurable: true
                });
                return StructureModel;
            }());
            model.StructureModel = StructureModel;
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
                var StructureModelLoadedEvent = (function (_super) {
                    __extends(StructureModelLoadedEvent, _super);
                    function StructureModelLoadedEvent(component, _structureModel) {
                        _super.call(this, component, StructureModelLoadedEvent.TYPE);
                        this._structureModel = _structureModel;
                    }
                    Object.defineProperty(StructureModelLoadedEvent.prototype, "structureModel", {
                        get: function () {
                            return this._structureModel;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    StructureModelLoadedEvent.TYPE = "StructureModelLoadedEvent";
                    return StructureModelLoadedEvent;
                }(events.MyCoReImageViewerEvent));
                events.StructureModelLoadedEvent = StructureModelLoadedEvent;
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
            var events;
            (function (events) {
                var CanvasTapedEvent = (function (_super) {
                    __extends(CanvasTapedEvent, _super);
                    function CanvasTapedEvent(component) {
                        _super.call(this, component, CanvasTapedEvent.TYPE);
                    }
                    CanvasTapedEvent.TYPE = "CanvasTapedEvent";
                    return CanvasTapedEvent;
                }(events.MyCoReImageViewerEvent));
                events.CanvasTapedEvent = CanvasTapedEvent;
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
            var events;
            (function (events) {
                var LanguageModelLoadedEvent = (function (_super) {
                    __extends(LanguageModelLoadedEvent, _super);
                    function LanguageModelLoadedEvent(component, _languageModel) {
                        _super.call(this, component, LanguageModelLoadedEvent.TYPE);
                        this._languageModel = _languageModel;
                    }
                    Object.defineProperty(LanguageModelLoadedEvent.prototype, "languageModel", {
                        get: function () {
                            return this._languageModel;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    LanguageModelLoadedEvent.TYPE = "LanguageModelLoadedEvent";
                    return LanguageModelLoadedEvent;
                }(events.MyCoReImageViewerEvent));
                events.LanguageModelLoadedEvent = LanguageModelLoadedEvent;
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
            var events;
            (function (events) {
                var ProvideToolbarModelEvent = (function (_super) {
                    __extends(ProvideToolbarModelEvent, _super);
                    function ProvideToolbarModelEvent(component, model) {
                        _super.call(this, component, ProvideToolbarModelEvent.TYPE);
                        this.model = model;
                    }
                    ProvideToolbarModelEvent.TYPE = "ProvideToolbarModelEvent";
                    return ProvideToolbarModelEvent;
                }(events.MyCoReImageViewerEvent));
                events.ProvideToolbarModelEvent = ProvideToolbarModelEvent;
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
            var MyCoReToolbarComponent = (function (_super) {
                __extends(MyCoReToolbarComponent, _super);
                function MyCoReToolbarComponent(_settings, _container) {
                    var _this = this;
                    _super.call(this);
                    this._settings = _settings;
                    this._container = _container;
                    this._sync = Utils.synchronize([function (me) { return me._toolbarModel != null && me._imageIdMap != null; }], function (me) {
                        me.trigger(new components.events.WaitForEvent(_this, components.events.ImageChangedEvent.TYPE));
                    });
                    this._imageIdMap = null;
                    this._toolbarModel = null;
                }
                MyCoReToolbarComponent.prototype.init = function () {
                    this.trigger(new components.events.WaitForEvent(this, components.events.ProvideToolbarModelEvent.TYPE));
                };
                MyCoReToolbarComponent.prototype.handle = function (e) {
                    if (e.type == components.events.ProvideToolbarModelEvent.TYPE) {
                        this._toolbarModel = e.model;
                        this._toolbarController = new mycore.viewer.widgets.toolbar.IviewToolbar(this._container, this._settings.mobile, this._toolbarModel);
                        var that = this;
                        this._toolbarController.eventManager.bind(function (e) {
                            that.trigger(e);
                        });
                        this.trigger(new components.events.WaitForEvent(this, components.events.LanguageModelLoadedEvent.TYPE));
                        this.trigger(new components.events.WaitForEvent(this, components.events.StructureModelLoadedEvent.TYPE));
                    }
                    if (this._toolbarModel != null) {
                        if (e.type == components.events.LanguageModelLoadedEvent.TYPE) {
                            var languageModelLoadedEvent = e;
                            this._toolbarModel.i18n(languageModelLoadedEvent.languageModel);
                            this._sync(this);
                        }
                        if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                            if (!this._settings.mobile) {
                                var smlEvent = e;
                                var imgList = smlEvent.structureModel._imageList;
                                var pageSelect = this._toolbarModel.getGroup("ImageChangeControllGroup").getComponentById("PageSelect");
                                this._imageIdMap = new MyCoReMap();
                                var childs = new Array();
                                for (var imgIndex in imgList) {
                                    var imgElement = imgList[imgIndex];
                                    this._imageIdMap.set(imgElement.id, imgElement);
                                    var toolbarDropDownElement = {
                                        id: imgElement.id,
                                        label: "[" + imgElement.order + "]" + (imgElement.orderLabel != null ? " - " + imgElement.orderLabel : "")
                                    };
                                    childs.push(toolbarDropDownElement);
                                }
                                pageSelect.children = childs;
                            }
                            this._sync(this);
                            return;
                        }
                        if (e.type == mycore.viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE) {
                            var dropdownButtonPressedEvent = e;
                            if (dropdownButtonPressedEvent.button.id == "PageSelect") {
                                var id = dropdownButtonPressedEvent.childId;
                                var img = this._imageIdMap.get(id);
                                this.trigger(new components.events.ImageSelectedEvent(this, img));
                            }
                            return;
                        }
                        if (e.type == components.events.ImageChangedEvent.TYPE) {
                            var icEvent = e;
                            if (icEvent.image != null) {
                                if (!this._settings.mobile) {
                                    var select = this._toolbarController.getView("PageSelect").getElement();
                                    select.val(icEvent.image.id);
                                }
                            }
                            return;
                        }
                        if (e.type == components.events.CanvasTapedEvent.TYPE) {
                            this._toolbarController.getView(null).getElement().slideToggle();
                            return;
                        }
                    }
                };
                Object.defineProperty(MyCoReToolbarComponent.prototype, "handlesEvents", {
                    get: function () {
                        var handleEvents = new Array();
                        handleEvents.push(components.events.StructureModelLoadedEvent.TYPE);
                        handleEvents.push(components.events.ProvideToolbarModelEvent.TYPE);
                        handleEvents.push(mycore.viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE);
                        handleEvents.push(components.events.ImageChangedEvent.TYPE);
                        handleEvents.push(components.events.CanvasTapedEvent.TYPE);
                        handleEvents.push(components.events.LanguageModelLoadedEvent.TYPE);
                        return handleEvents;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(MyCoReToolbarComponent.prototype, "toolbar", {
                    get: function () {
                        return this._toolbarController;
                    },
                    enumerable: true,
                    configurable: true
                });
                return MyCoReToolbarComponent;
            }(components.ViewerComponent));
            components.MyCoReToolbarComponent = MyCoReToolbarComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var thumbnail;
            (function (thumbnail) {
                var ThumbnailOverviewModel = (function () {
                    function ThumbnailOverviewModel(thumbnails) {
                        if (thumbnails === void 0) { thumbnails = new Array(); }
                        this.thumbnails = thumbnails;
                        this._idThumbnailMap = new MyCoReMap();
                        this.tilesInsertedMap = new MyCoReMap();
                        this.fillIdThumbnailMap();
                        this.fillTilesInsertedMap();
                        this.currentPosition = new Position2D(0, 0);
                    }
                    ThumbnailOverviewModel.prototype.fillTilesInsertedMap = function () {
                        for (var index in this.thumbnails) {
                            var current = this.thumbnails[index];
                            this.tilesInsertedMap.set(current.id, false);
                        }
                    };
                    ThumbnailOverviewModel.prototype.fillIdThumbnailMap = function () {
                        for (var index in this.thumbnails) {
                            var current = this.thumbnails[index];
                            this._idThumbnailMap.set(current.id, current);
                        }
                    };
                    ThumbnailOverviewModel.prototype.getThumbnailById = function (id) {
                        return this._idThumbnailMap.get(id);
                    };
                    return ThumbnailOverviewModel;
                }());
                thumbnail.ThumbnailOverviewModel = ThumbnailOverviewModel;
            })(thumbnail = widgets.thumbnail || (widgets.thumbnail = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var thumbnail;
            (function (thumbnail) {
                var ThumbnailOverviewView = (function () {
                    function ThumbnailOverviewView(_container, _scrollHandler, _resizeHandler, _inputHandler) {
                        this._container = _container;
                        this._scrollHandler = _scrollHandler;
                        this._resizeHandler = _resizeHandler;
                        this._inputHandler = _inputHandler;
                        this._gap = 0;
                        this._spacer = jQuery("<div></div>");
                        this._spacer.appendTo(this._container);
                        var cssObj = { "position": "relative" };
                        cssObj["overflow-y"] = "scroll";
                        cssObj["overflow-x"] = "hidden";
                        cssObj["-webkit-overflow-scrolling"] = "touch";
                        this._container.css(cssObj);
                        this._lastViewPortSize = this.getViewportSize();
                        var that = this;
                        var scrollHandler = function () {
                            var newPos = new Position2D(that._container.scrollLeft(), that._container.scrollTop());
                            that._scrollHandler.scrolled(newPos);
                        };
                        this._container.bind("scroll", scrollHandler);
                        var resizeHandler = function () {
                            var newVp = that.getViewportSize();
                            if (that._lastViewPortSize != newVp) {
                                that._resizeHandler.resized(newVp);
                                that._lastViewPortSize = that.getViewportSize();
                                scrollHandler();
                            }
                        };
                        jQuery(this._container).bind("iviewResize", resizeHandler);
                    }
                    Object.defineProperty(ThumbnailOverviewView.prototype, "gap", {
                        get: function () {
                            return this._gap;
                        },
                        set: function (num) {
                            this._gap = num;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    ThumbnailOverviewView.prototype.setContainerSize = function (newContainerSize) {
                        this._spacer.css({
                            "width": newContainerSize.width,
                            "height": newContainerSize.height
                        });
                    };
                    ThumbnailOverviewView.prototype.setContainerScrollPosition = function (position) {
                        this._container.scrollLeft(position.x);
                        this._container.scrollTop(position.y);
                    };
                    ThumbnailOverviewView.prototype.setThumnailSelected = function (id, selected) {
                        var thumb = this._container.find("[data-id='" + id + "']");
                        if (selected) {
                            thumb.addClass("selected");
                        }
                        else {
                            thumb.removeClass("selected");
                        }
                    };
                    ThumbnailOverviewView.prototype.injectTile = function (id, position, label) {
                        var thumbnailImage = jQuery("<img />");
                        thumbnailImage.attr("alt", label);
                        var thumbnailLabel = jQuery("<div>" + label + "</div>");
                        thumbnailLabel.addClass("caption");
                        var imageSpacer = jQuery("<div></div>");
                        imageSpacer.addClass("imgSpacer");
                        imageSpacer.append(thumbnailImage);
                        var thumbnailDiv = jQuery("<div/>");
                        thumbnailDiv.attr("data-id", id);
                        thumbnailDiv.toggleClass("iviewThumbnail");
                        thumbnailDiv.addClass("thumbnail");
                        thumbnailDiv.prepend(imageSpacer);
                        thumbnailDiv.append(thumbnailLabel);
                        thumbnailDiv.css({
                            "left": this.gap + position.x,
                            "top": position.y
                        });
                        this._inputHandler.addedThumbnail(id, thumbnailDiv);
                        this._container.append(thumbnailDiv);
                    };
                    ThumbnailOverviewView.prototype.updateTileHref = function (id, href) {
                        this._container.find("div[data-id=" + id + "] img").attr("src", href);
                    };
                    ThumbnailOverviewView.prototype.removeTile = function (id) {
                        this._container.find("div[data-id=" + id + "]").remove();
                    };
                    ThumbnailOverviewView.prototype.updateTilePosition = function (id, position) {
                        var thumbnailDiv = this._container.find("div[data-id='" + id + "']");
                        thumbnailDiv.css({
                            "left": this.gap + position.x,
                            "top": position.y
                        });
                    };
                    ThumbnailOverviewView.prototype.getViewportSize = function () {
                        return new Size2D(this._container.width(), this._container.height());
                    };
                    ThumbnailOverviewView.prototype.jumpToThumbnail = function (thumbnailPos) {
                        this._container.scrollTop(thumbnailPos);
                    };
                    return ThumbnailOverviewView;
                }());
                thumbnail.ThumbnailOverviewView = ThumbnailOverviewView;
            })(thumbnail = widgets.thumbnail || (widgets.thumbnail = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var thumbnail;
            (function (thumbnail) {
                var DefaultThumbnailOverviewSettings = (function () {
                    function DefaultThumbnailOverviewSettings(_thumbnails, _container, _inputHandler, _maxThumbnailSize) {
                        if (_inputHandler === void 0) { _inputHandler = { addedThumbnail: function (id, element) { } }; }
                        if (_maxThumbnailSize === void 0) { _maxThumbnailSize = new Size2D(255, 255); }
                        this._thumbnails = _thumbnails;
                        this._container = _container;
                        this._inputHandler = _inputHandler;
                        this._maxThumbnailSize = _maxThumbnailSize;
                    }
                    Object.defineProperty(DefaultThumbnailOverviewSettings.prototype, "thumbnails", {
                        get: function () {
                            return this._thumbnails;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(DefaultThumbnailOverviewSettings.prototype, "container", {
                        get: function () {
                            return this._container;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(DefaultThumbnailOverviewSettings.prototype, "maxThumbnailSize", {
                        get: function () {
                            return this._maxThumbnailSize;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(DefaultThumbnailOverviewSettings.prototype, "inputHandler", {
                        get: function () {
                            return this._inputHandler;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return DefaultThumbnailOverviewSettings;
                }());
                thumbnail.DefaultThumbnailOverviewSettings = DefaultThumbnailOverviewSettings;
            })(thumbnail = widgets.thumbnail || (widgets.thumbnail = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var thumbnail;
            (function (thumbnail) {
                var IviewThumbnailOverview = (function () {
                    function IviewThumbnailOverview(_settings) {
                        this._settings = _settings;
                        this._model = new thumbnail.ThumbnailOverviewModel(this._settings.thumbnails);
                        this._view = new thumbnail.ThumbnailOverviewView(this._settings.container, this, this, this._settings.inputHandler);
                        this._settings.container.css({
                            "min-width": this._settings.maxThumbnailSize.width + "px",
                            "min-height": this._settings.maxThumbnailSize.height + "px"
                        });
                        this.update(true);
                    }
                    IviewThumbnailOverview.prototype.setThumbnailSelected = function (id) {
                        if (typeof this._model.selectedThumbnail !== "undefined" && this._model.selectedThumbnail != null) {
                            this._view.setThumnailSelected(this._model.selectedThumbnail.id, false);
                        }
                        this._model.selectedThumbnail = this._model.getThumbnailById(id) || null;
                        this._view.setThumnailSelected(id, true);
                    };
                    IviewThumbnailOverview.prototype.jumpToThumbnail = function (id) {
                        var vpSize = this._view.getViewportSize();
                        var maxTileSize = this._settings.maxThumbnailSize;
                        var scrollPos = this._model.currentPosition;
                        var tilesHorizontal = Math.floor(vpSize.width / maxTileSize.width);
                        var thumb = this._model.getThumbnailById(id);
                        var pos = this._model.thumbnails.indexOf(thumb);
                        var verticalLinePos = Math.floor(pos / tilesHorizontal);
                        var verticalPos = verticalLinePos * this._settings.maxThumbnailSize.height;
                        var isOver = this._model.currentPosition.y > verticalPos;
                        var isUnder = this._model.currentPosition.y + this._view.getViewportSize().height < verticalPos + this._settings.maxThumbnailSize.height;
                        if (isOver) {
                        }
                        else if (isUnder) {
                            verticalPos = verticalPos - this._view.getViewportSize().height + this._settings.maxThumbnailSize.height;
                        }
                        else {
                            return;
                        }
                        this._model.currentPosition.move(new MoveVector(0, verticalPos - scrollPos.y));
                        this.update();
                        this._view.jumpToThumbnail(verticalPos);
                    };
                    IviewThumbnailOverview.prototype.update = function (resize) {
                        var _this = this;
                        if (resize === void 0) { resize = false; }
                        var vpSize = this._view.getViewportSize();
                        var sizeOfOther = (function (childs) {
                            var height = 0;
                            childs.each(function (i, e) {
                                if (_this._settings.container[0] != e && jQuery(e).css("position") != "absolute") {
                                    height += jQuery(e).outerHeight();
                                }
                            });
                            return height;
                        })(this._settings.container.parent().children());
                        this._settings.container.css({ "height": this._settings.container.parent().height() - sizeOfOther });
                        if (vpSize.width == 0 || vpSize.height == 0) {
                            return;
                        }
                        var gap = (vpSize.width % this._settings.maxThumbnailSize.width) / 2;
                        this._view.gap = gap;
                        var maxTileSize = this._settings.maxThumbnailSize;
                        var pos = this._model.currentPosition;
                        var tilesHorizontal = Math.floor(vpSize.width / maxTileSize.width);
                        var tilesVertical = Math.ceil(vpSize.height / maxTileSize.height);
                        if (resize) {
                            this._view.setContainerSize(new Size2D(vpSize.width, Math.ceil(this._model.thumbnails.length / Math.max(tilesHorizontal, 1)) * maxTileSize.height));
                            this.updateThumbnails(0, Math.ceil(this._model.thumbnails.length / tilesHorizontal), resize);
                        }
                        var startLine = Math.floor(pos.y / maxTileSize.height);
                        var endLine = Math.ceil((pos.y / maxTileSize.height) + tilesVertical);
                        this.updateThumbnails(startLine, endLine, false);
                    };
                    IviewThumbnailOverview.prototype.updateThumbnails = function (startLine, endLine, positionOnly) {
                        var vpSize = this._view.getViewportSize();
                        var maxTileSize = this._settings.maxThumbnailSize;
                        var tilesHorizontal = Math.floor(vpSize.width / maxTileSize.width);
                        var dontRemoveMap = new MyCoReMap();
                        var that = this;
                        for (var tileY = startLine || 0; tileY < endLine; tileY++) {
                            for (var tileX = 0; tileX < tilesHorizontal; tileX++) {
                                var tileNumber = (tileY * tilesHorizontal) + tileX;
                                var tilePosition = new Position2D(tileX * maxTileSize.width, tileY * maxTileSize.height);
                                var tile = this._model.thumbnails[tileNumber];
                                var tileExists = typeof tile != "undefined";
                                if (tileExists) {
                                    var tileInserted = this._model.tilesInsertedMap.get(tile.id);
                                    if (!tileInserted && !positionOnly) {
                                        this._model.tilesInsertedMap.set(tile.id, true);
                                        this._view.injectTile(tile.id, tilePosition, tile.label);
                                        tile.requestImgdataUrl((function (id) { return function (href) {
                                            that._view.updateTileHref(id, href);
                                        }; })(tile.id));
                                        if (this._model.selectedThumbnail != null && this._model.selectedThumbnail.href == tile.href) {
                                            this.setThumbnailSelected(tile.id);
                                        }
                                    }
                                    else {
                                        if (tileInserted) {
                                            this._view.updateTilePosition(tile.id, tilePosition);
                                        }
                                    }
                                    dontRemoveMap.set(tile.id, false);
                                }
                            }
                        }
                        var removeableBefore = (startLine - 1 * tilesHorizontal);
                        var removeableAfter = (endLine + 1 * tilesHorizontal);
                        var that = this;
                        this._model.tilesInsertedMap.forEach(function (k, v) {
                            if (!dontRemoveMap.has(k) && dontRemoveMap.get(k) != false) {
                                that.removeThumbnail(k);
                            }
                        });
                    };
                    IviewThumbnailOverview.prototype.removeThumbnail = function (tileId) {
                        this._model.tilesInsertedMap.remove(tileId);
                        this._view.removeTile(tileId);
                    };
                    IviewThumbnailOverview.prototype.scrolled = function (newPosition) {
                        this._model.currentPosition = newPosition;
                        this.update(false);
                    };
                    IviewThumbnailOverview.prototype.resized = function (newViewPort) {
                        this.update(true);
                        if (this._model.selectedThumbnail != null) {
                            this.jumpToThumbnail(this._model.selectedThumbnail.id);
                        }
                    };
                    return IviewThumbnailOverview;
                }());
                thumbnail.IviewThumbnailOverview = IviewThumbnailOverview;
            })(thumbnail = widgets.thumbnail || (widgets.thumbnail = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReImageOverviewComponent = (function (_super) {
                __extends(MyCoReImageOverviewComponent, _super);
                function MyCoReImageOverviewComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this._sidebarLabel = jQuery("<span>Bildübersicht</span>");
                    this._currentImageId = null;
                    this._spinner = null;
                    this._enabled = Utils.getVar(this._settings, "imageOverview.enabled", true);
                }
                MyCoReImageOverviewComponent.prototype.init = function () {
                    if (this._enabled) {
                        this._container = jQuery("<div></div>");
                        this._idMetsImageMap = new MyCoReMap();
                        this.trigger(new components.events.WaitForEvent(this, components.events.StructureModelLoadedEvent.TYPE));
                        this.trigger(new components.events.WaitForEvent(this, components.events.LanguageModelLoadedEvent.TYPE));
                        var showImageOverViewOnStart = Utils.getVar(this._settings, "leftShowOnStart", "chapterOverview")
                            == "imageOverview";
                        if (this._settings.mobile == false && showImageOverViewOnStart) {
                            this._spinner = jQuery(("<div class='spinner'><img src='" + this._settings.webApplicationBaseURL) +
                                "/modules/iview2/img/spinner.gif'></div>");
                            this._container.append(this._spinner);
                            var direction = (this._settings.mobile)
                                ? components.events.ShowContentEvent.DIRECTION_CENTER : components.events.ShowContentEvent.DIRECTION_WEST;
                            this.trigger(new components.events.ShowContentEvent(this, this._container, direction, 300, this._sidebarLabel));
                        }
                    }
                    else {
                        this.trigger(new components.events.WaitForEvent(this, components.events.ProvideToolbarModelEvent.TYPE));
                    }
                };
                Object.defineProperty(MyCoReImageOverviewComponent.prototype, "content", {
                    get: function () {
                        return this._container;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(MyCoReImageOverviewComponent.prototype, "handlesEvents", {
                    get: function () {
                        var handles = new Array();
                        if (this._enabled) {
                            handles.push(components.events.StructureModelLoadedEvent.TYPE);
                            handles.push(components.events.ImageChangedEvent.TYPE);
                            handles.push(mycore.viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE);
                            handles.push(components.events.ShowContentEvent.TYPE);
                            handles.push(components.events.LanguageModelLoadedEvent.TYPE);
                        }
                        else {
                            handles.push(components.events.ProvideToolbarModelEvent.TYPE);
                        }
                        return handles;
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReImageOverviewComponent.prototype.handle = function (e) {
                    if (e.type == components.events.ProvideToolbarModelEvent.TYPE) {
                        var ptme = e;
                        ptme.model._sidebarControllDropdownButton.children = ptme.model._sidebarControllDropdownButton.children.filter(function (my) { return my.id != "imageOverview"; });
                    }
                    if (e.type == mycore.viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE) {
                        var dropdownButtonPressedEvent = e;
                        if (dropdownButtonPressedEvent.childId == "imageOverview") {
                            var direction = (this._settings.mobile) ? components.events.ShowContentEvent.DIRECTION_CENTER : components.events.ShowContentEvent.DIRECTION_WEST;
                            this.trigger(new components.events.ShowContentEvent(this, this._container, direction, -1, this._sidebarLabel));
                            this._overview.update(true);
                            this._overview.jumpToThumbnail(this._currentImageId);
                        }
                    }
                    if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                        var imageList = e.structureModel._imageList;
                        var basePath = this._settings.tileProviderPath + this._settings.derivate + "/";
                        this._overviewSettings = new mycore.viewer.widgets.thumbnail.DefaultThumbnailOverviewSettings(this.prepareModel(imageList, basePath), this._container, this);
                        this._overview = new mycore.viewer.widgets.thumbnail.IviewThumbnailOverview(this._overviewSettings);
                        var startImage = (this._settings.filePath.indexOf("/") == 0) ? this._settings.filePath.substr(1) : this._settings.filePath;
                        this._overview.jumpToThumbnail(startImage);
                        this._overview.setThumbnailSelected(startImage);
                        this._currentImageId = startImage;
                        if (this._spinner != null) {
                            this._spinner.detach();
                        }
                        this.trigger(new components.events.ComponentInitializedEvent(this));
                    }
                    if (e.type == components.events.ImageChangedEvent.TYPE) {
                        var imageChangedEvent = e;
                        if (typeof this._overview != "undefined") {
                            this._overview.jumpToThumbnail(imageChangedEvent.image.id);
                            this._overview.setThumbnailSelected(imageChangedEvent.image.id);
                            this._currentImageId = imageChangedEvent.image.id;
                        }
                    }
                    if (e.type == components.events.LanguageModelLoadedEvent.TYPE) {
                        var lmle = e;
                        this._sidebarLabel.text(lmle.languageModel.getTranslation("sidebar.imageOverview"));
                    }
                    return;
                };
                MyCoReImageOverviewComponent.prototype.prepareModel = function (images, basePath) {
                    var result = new Array();
                    for (var imageIndex in images) {
                        var image = images[imageIndex];
                        var path;
                        if (image.href.indexOf("data:") == -1) {
                            path = basePath + image.href + "/0/0/0.jpg";
                        }
                        else {
                            path = image.href;
                        }
                        var label = "" + (image.orderLabel || image.order);
                        var id = image.id;
                        this._idMetsImageMap.set(id, image);
                        result.push({ id: id, label: label, href: path, requestImgdataUrl: image.requestImgdataUrl });
                    }
                    return result;
                };
                MyCoReImageOverviewComponent.prototype.addedThumbnail = function (id, element) {
                    var that = this;
                    jQuery(element).bind("click", function () {
                        that.trigger(new components.events.ImageSelectedEvent(that, that._idMetsImageMap.get(id)));
                    });
                };
                return MyCoReImageOverviewComponent;
            }(components.ViewerComponent));
            components.MyCoReImageOverviewComponent = MyCoReImageOverviewComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var chaptertree;
            (function (chaptertree) {
                var ChapterTreeModel = (function () {
                    function ChapterTreeModel(root, chapterLabelMap) {
                        this.root = root;
                        this.chapterLabelMap = chapterLabelMap;
                        this.chapterVisible = new MyCoReMap();
                        this.idElementMap = new MyCoReMap();
                        this.initChapter(this.root);
                        this.selected = null;
                    }
                    ChapterTreeModel.prototype.initChapter = function (chapter) {
                        this.idElementMap.set(chapter.id, chapter);
                        this.chapterVisible.set(chapter.id, true);
                        for (var index in chapter.chapter) {
                            var current = chapter.chapter[index];
                            this.initChapter(current);
                        }
                    };
                    return ChapterTreeModel;
                }());
                chaptertree.ChapterTreeModel = ChapterTreeModel;
            })(chaptertree = widgets.chaptertree || (widgets.chaptertree = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var chaptertree;
            (function (chaptertree) {
                var DefaultChapterTreeInputHandler = (function () {
                    function DefaultChapterTreeInputHandler() {
                    }
                    DefaultChapterTreeInputHandler.prototype.register = function (ctrl) {
                        this._ctrl = ctrl;
                    };
                    DefaultChapterTreeInputHandler.prototype.registerNode = function (node, id) {
                        var that = this;
                        node.click(function () {
                            var newSelectedChapter = that._ctrl.getChapterById(id);
                            that._ctrl.setChapterSelected(newSelectedChapter);
                        });
                    };
                    DefaultChapterTreeInputHandler.prototype.registerExpander = function (expander, id) {
                        var that = this;
                        expander.click(function () {
                            var chapterToChange = that._ctrl.getChapterById(id);
                            that._ctrl.setChapterExpanded(chapterToChange, !that._ctrl.getChapterExpanded(chapterToChange));
                        });
                    };
                    return DefaultChapterTreeInputHandler;
                }());
                chaptertree.DefaultChapterTreeInputHandler = DefaultChapterTreeInputHandler;
            })(chaptertree = widgets.chaptertree || (widgets.chaptertree = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var chaptertree;
            (function (chaptertree) {
                var DesktopChapterTreeView = (function () {
                    function DesktopChapterTreeView(_container, _inputHandler, className) {
                        if (className === void 0) { className = "chapterTreeDesktop"; }
                        this._container = _container;
                        this._inputHandler = _inputHandler;
                        this.list = jQuery("<ol><ol>");
                        this.list.addClass(className);
                        this.list.addClass("list-group");
                        this._container.append(this.list);
                    }
                    DesktopChapterTreeView.prototype.addNode = function (parentId, id, label, childLabel, expandable) {
                        var parentElement = this.getParent(parentId);
                        var nodeToAdd = this.createNode(id, label, childLabel, expandable);
                        parentElement.append(nodeToAdd);
                    };
                    DesktopChapterTreeView.prototype.getParent = function (parentId) {
                        var parentElement;
                        if (parentId != null) {
                            parentElement = this.list.find("ol[data-id='" + parentId + "']");
                            if (parentElement.length == 0) {
                                parentElement = this.list.find("li[data-id='" + parentId + "']");
                                var childrenList = jQuery("<ol></ol>");
                                childrenList.attr("data-id", parentId);
                                childrenList.attr("data-opened", true);
                                childrenList.insertAfter(parentElement);
                                parentElement = childrenList;
                            }
                        }
                        else {
                            parentElement = this.list;
                        }
                        return parentElement;
                    };
                    DesktopChapterTreeView.prototype.createNode = function (id, label, childLabel, expandable) {
                        var insertedNode = jQuery("<li></li>");
                        var labelElement = jQuery("<a title='" + label + "'></a>").text(label);
                        var childLabelElement = jQuery("<span>" + childLabel + "</span>");
                        childLabelElement.addClass("childLabel");
                        insertedNode.append(labelElement);
                        insertedNode.append(childLabelElement);
                        insertedNode.addClass("list-group-item");
                        insertedNode.attr("data-id", id);
                        insertedNode.attr("data-opened", true);
                        this._inputHandler.registerNode(labelElement, id);
                        if (expandable) {
                            var expander = jQuery("<span class=\"expander glyphicon " + DesktopChapterTreeView.OPEN_ICON_CLASS + "\"></span>");
                            insertedNode.prepend(expander);
                            this._inputHandler.registerExpander(expander, id);
                        }
                        return insertedNode;
                    };
                    DesktopChapterTreeView.prototype.setOpened = function (id, opened) {
                        var liElem = this.list.find("li[data-id='" + id + "']").attr("data-opened", opened.toString());
                        var olElem = this.list.find("ol[data-id='" + id + "']").attr("data-opened", opened.toString());
                        var span = this.list.find("li[data-id='" + id + "'] span.expander");
                        if (opened) {
                            span.removeClass(DesktopChapterTreeView.CLOSE_ICON_CLASS);
                            span.addClass(DesktopChapterTreeView.OPEN_ICON_CLASS);
                        }
                        else {
                            span.removeClass(DesktopChapterTreeView.OPEN_ICON_CLASS);
                            span.addClass(DesktopChapterTreeView.CLOSE_ICON_CLASS);
                        }
                    };
                    DesktopChapterTreeView.prototype.setSelected = function (id, selected) {
                        var elem = this.list.find("li[data-id='" + id + "']").attr("data-selected", selected.toString());
                    };
                    DesktopChapterTreeView.prototype.jumpTo = function (id) {
                        var elem = this.list.find("li[data-id='" + id + "']");
                        elem.addClass("blink");
                        setTimeout(function () {
                            elem.removeClass("blink");
                        }, 500);
                        var realElementPosition = elem.position().top - this._container.position().top;
                        var move = 0;
                        if (realElementPosition < 0) {
                            move = realElementPosition - 10;
                        }
                        else {
                            var containerHeight = this._container.height();
                            var elementHeight = elem.height();
                            if ((realElementPosition + elementHeight + 10) > containerHeight) {
                                move = (realElementPosition - containerHeight) + elementHeight + 10;
                            }
                            else {
                                return;
                            }
                        }
                        this._container.scrollTop(this._container.scrollTop() + move);
                    };
                    DesktopChapterTreeView.CLOSE_ICON_CLASS = "glyphicon-chevron-right";
                    DesktopChapterTreeView.OPEN_ICON_CLASS = "glyphicon-chevron-down";
                    return DesktopChapterTreeView;
                }());
                chaptertree.DesktopChapterTreeView = DesktopChapterTreeView;
            })(chaptertree = widgets.chaptertree || (widgets.chaptertree = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var chaptertree;
            (function (chaptertree) {
                var MobileChapterTreeView = (function () {
                    function MobileChapterTreeView(_container, _inputHandler, className) {
                        if (className === void 0) { className = "chapterTreeDesktop"; }
                        this._container = _container;
                        this._inputHandler = _inputHandler;
                        this.list = jQuery("<ul></ul>");
                        this.list.addClass("mobileListview");
                        this.levelMap = new MyCoReMap();
                        this.list.appendTo(_container);
                    }
                    MobileChapterTreeView.prototype.addNode = function (parentId, id, label, childLabel, expandable) {
                        var newElement = jQuery("<li></li>");
                        var labelElement = jQuery("<a></a>");
                        labelElement.addClass("label");
                        labelElement.text(label);
                        labelElement.attr("data-id", id);
                        labelElement.appendTo(newElement);
                        var childlabelElement = jQuery("<a></a>");
                        childlabelElement.text(childLabel);
                        childlabelElement.addClass("childLabel");
                        childlabelElement.appendTo(newElement);
                        newElement.attr("data-id", id);
                        var level = 0;
                        if (parentId != null && this.levelMap.has(parentId)) {
                            level = this.levelMap.get(parentId) + 1;
                        }
                        this.levelMap.set(id, level);
                        labelElement.css({ "padding-left": (15 * level) + "px" });
                        this.list.append(newElement);
                        this._inputHandler.registerNode(newElement, id);
                    };
                    MobileChapterTreeView.prototype.setOpened = function (id, opened) {
                        return;
                    };
                    MobileChapterTreeView.prototype.setSelected = function (id, selected) {
                        return;
                    };
                    MobileChapterTreeView.prototype.jumpTo = function (id) {
                        return;
                    };
                    MobileChapterTreeView.LEVEL_MARGIN = 15;
                    return MobileChapterTreeView;
                }());
                chaptertree.MobileChapterTreeView = MobileChapterTreeView;
            })(chaptertree = widgets.chaptertree || (widgets.chaptertree = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var chaptertree;
            (function (chaptertree) {
                var DefaultChapterTreeSettings = (function () {
                    function DefaultChapterTreeSettings(_container, _chapterLabelMap, _chapter, mobile, _inputHandler) {
                        if (_chapter === void 0) { _chapter = null; }
                        if (mobile === void 0) { mobile = false; }
                        if (_inputHandler === void 0) { _inputHandler = new chaptertree.DefaultChapterTreeInputHandler(); }
                        this._container = _container;
                        this._chapterLabelMap = _chapterLabelMap;
                        this._chapter = _chapter;
                        this.mobile = mobile;
                        this._inputHandler = _inputHandler;
                    }
                    Object.defineProperty(DefaultChapterTreeSettings.prototype, "chapter", {
                        get: function () {
                            return this._chapter;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(DefaultChapterTreeSettings.prototype, "chapterLabelMap", {
                        get: function () {
                            return this._chapterLabelMap;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(DefaultChapterTreeSettings.prototype, "container", {
                        get: function () {
                            return this._container;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(DefaultChapterTreeSettings.prototype, "viewFactory", {
                        get: function () {
                            return this;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(DefaultChapterTreeSettings.prototype, "inputHandler", {
                        get: function () {
                            return this._inputHandler;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    DefaultChapterTreeSettings.prototype.createChapterTeeView = function () {
                        return (this.mobile) ? new chaptertree.MobileChapterTreeView(this.container, this.inputHandler) : new chaptertree.DesktopChapterTreeView(this.container, this.inputHandler);
                    };
                    return DefaultChapterTreeSettings;
                }());
                chaptertree.DefaultChapterTreeSettings = DefaultChapterTreeSettings;
            })(chaptertree = widgets.chaptertree || (widgets.chaptertree = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var chaptertree;
            (function (chaptertree) {
                var IviewChapterTree = (function () {
                    function IviewChapterTree(_settings) {
                        this._settings = _settings;
                        this._model = new chaptertree.ChapterTreeModel(_settings.chapter, this._settings.chapterLabelMap);
                        this._view = _settings.viewFactory.createChapterTeeView();
                        this._settings.inputHandler.register(this);
                        this.init();
                    }
                    IviewChapterTree.prototype.setChapterSelected = function (element) {
                        if (this._model.selected != null) {
                            this._view.setSelected(this._model.selected.id, false);
                        }
                        if (element == null) {
                            return;
                        }
                        this._model.selected = element;
                        this._view.setSelected(this._model.selected.id, true);
                    };
                    IviewChapterTree.prototype.getSelectedChapter = function () {
                        return this._model.selected;
                    };
                    IviewChapterTree.prototype.setChapterExpanded = function (element, expanded) {
                        if (element != null) {
                            this._model.chapterVisible.set(element.id, expanded);
                            this._view.setOpened(element.id, expanded);
                        }
                    };
                    IviewChapterTree.prototype.getChapterExpanded = function (element) {
                        return this._model.chapterVisible.get(element.id);
                    };
                    IviewChapterTree.prototype.getChapterById = function (id) {
                        return this._model.idElementMap.get(id);
                    };
                    IviewChapterTree.prototype.init = function () {
                        this.insertChapterView(this._model.root);
                    };
                    IviewChapterTree.prototype.jumpToChapter = function (chapter) {
                        if (chapter == null) {
                            return;
                        }
                        this._view.jumpTo(chapter.id);
                    };
                    IviewChapterTree.prototype.insertChapterView = function (chapter) {
                        this._view.addNode((chapter.parent || { id: null }).id, chapter.id, chapter.label, this._model.chapterLabelMap.get(chapter.id) || "", chapter.chapter.length > 0);
                        for (var i in chapter.chapter) {
                            var currentChapter = chapter.chapter[i];
                            this.insertChapterView(currentChapter);
                        }
                    };
                    return IviewChapterTree;
                }());
                chaptertree.IviewChapterTree = IviewChapterTree;
            })(chaptertree = widgets.chaptertree || (widgets.chaptertree = {}));
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
                var ChapterChangedEvent = (function (_super) {
                    __extends(ChapterChangedEvent, _super);
                    function ChapterChangedEvent(component, _chapter) {
                        _super.call(this, component, ChapterChangedEvent.TYPE);
                        this._chapter = _chapter;
                    }
                    Object.defineProperty(ChapterChangedEvent.prototype, "chapter", {
                        get: function () {
                            return this._chapter;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    ChapterChangedEvent.TYPE = "ChapterChangedEvent";
                    return ChapterChangedEvent;
                }(events.MyCoReImageViewerEvent));
                events.ChapterChangedEvent = ChapterChangedEvent;
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
            var events;
            (function (events) {
                var RequestStateEvent = (function (_super) {
                    __extends(RequestStateEvent, _super);
                    function RequestStateEvent(component, stateMap, deepState) {
                        if (deepState === void 0) { deepState = true; }
                        _super.call(this, component, RequestStateEvent.TYPE);
                        this.stateMap = stateMap;
                        this.deepState = deepState;
                    }
                    RequestStateEvent.TYPE = "RequestStateEvent";
                    return RequestStateEvent;
                }(events.MyCoReImageViewerEvent));
                events.RequestStateEvent = RequestStateEvent;
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
            var MyCoReChapterComponent = (function (_super) {
                __extends(MyCoReChapterComponent, _super);
                function MyCoReChapterComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this._spinner = null;
                    this._currentChapter = null;
                    this._initialized = false;
                    this._sidebarLabel = jQuery("<span>strukturübersicht</span>");
                    this._chapterToActivate = null;
                    this._autoPagination = true;
                    this._idImageMap = new MyCoReMap();
                    this._enabled = Utils.getVar(this._settings, "chapter.enabled", true);
                }
                MyCoReChapterComponent.prototype.init = function () {
                    var _this = this;
                    if (this._enabled) {
                        this._container = jQuery("<div></div>");
                        this._container.css({ overflowY: "scroll" });
                        this._container.bind("iviewResize", function () {
                            _this.updateContainerSize();
                        });
                        this.trigger(new components.events.WaitForEvent(this, components.events.StructureModelLoadedEvent.TYPE));
                        this.trigger(new components.events.WaitForEvent(this, components.events.LanguageModelLoadedEvent.TYPE));
                        var oldProperty = Utils.getVar(this._settings, "chapter.showOnStart", window.innerWidth >= 1200);
                        var showChapterOnStart = Utils.getVar(this._settings, "leftShowOnStart", oldProperty ? "chapterOverview" : "none") == "chapterOverview";
                        if (this._settings.mobile == false && showChapterOnStart) {
                            this._spinner = jQuery(("<div class='spinner'><img src='" + this._settings.webApplicationBaseURL) +
                                "/modules/iview2/img/spinner.gif'></div>");
                            this._container.append(this._spinner);
                            var direction = (this._settings.mobile) ? components.events.ShowContentEvent.DIRECTION_CENTER :
                                components.events.ShowContentEvent.DIRECTION_WEST;
                            this.trigger(new components.events.ShowContentEvent(this, this._container, direction, 300, this._sidebarLabel));
                        }
                    }
                    else {
                        this.trigger(new components.events.WaitForEvent(this, components.events.ProvideToolbarModelEvent.TYPE));
                    }
                };
                MyCoReChapterComponent.prototype.updateContainerSize = function () {
                    this._container.css({
                        "height": (this._container.parent().height() - this._sidebarLabel.parent().outerHeight()) + "px"
                    });
                };
                Object.defineProperty(MyCoReChapterComponent.prototype, "handlesEvents", {
                    get: function () {
                        var handles = new Array();
                        if (this._enabled) {
                            handles.push(components.events.StructureModelLoadedEvent.TYPE);
                            handles.push(components.events.ImageChangedEvent.TYPE);
                            handles.push(components.events.ShowContentEvent.TYPE);
                            handles.push(mycore.viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE);
                            handles.push(components.events.LanguageModelLoadedEvent.TYPE);
                            handles.push(components.events.RequestStateEvent.TYPE);
                            handles.push(components.events.RestoreStateEvent.TYPE);
                            handles.push(components.events.ChapterChangedEvent.TYPE);
                        }
                        else {
                            handles.push(components.events.ProvideToolbarModelEvent.TYPE);
                        }
                        return handles;
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReChapterComponent.prototype.handle = function (e) {
                    var _this = this;
                    if (e.type == components.events.ProvideToolbarModelEvent.TYPE) {
                        var ptme = e;
                        ptme.model._sidebarControllDropdownButton.children = ptme.model._sidebarControllDropdownButton.children.filter(function (my) { return my.id != "chapterOverview"; });
                    }
                    if (e.type == mycore.viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE) {
                        var dropdownButtonPressedEvent = e;
                        if (dropdownButtonPressedEvent.childId == "chapterOverview") {
                            var direction = (this._settings.mobile) ? components.events.ShowContentEvent.DIRECTION_CENTER : components.events.ShowContentEvent.DIRECTION_WEST;
                            this.trigger(new components.events.ShowContentEvent(this, this._container, direction, -1, this._sidebarLabel));
                            this.updateContainerSize();
                        }
                    }
                    if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                        var structureModelLoadedEvent = e;
                        var model_2 = structureModelLoadedEvent.structureModel._rootChapter;
                        this._structureModel = structureModelLoadedEvent.structureModel;
                        this._structureModel._imageList.forEach(function (img) {
                            _this._idImageMap.set(img.id, img);
                            if ("orderLabel" in img && img.orderLabel != null) {
                                _this._autoPagination = false;
                            }
                        });
                        var chapterLabelMap = this.createChapterLabelMap(this._structureModel);
                        this._chapterWidgetSettings = new mycore.viewer.widgets.chaptertree.DefaultChapterTreeSettings(this._container, chapterLabelMap, model_2, this._settings.mobile, this);
                        this._chapterWidget = new mycore.viewer.widgets.chaptertree.IviewChapterTree(this._chapterWidgetSettings);
                        this._initialized = true;
                        this.trigger(new components.events.ComponentInitializedEvent(this));
                        if (this._spinner != null) {
                            this._spinner.detach();
                        }
                        if (this._chapterToActivate != null) {
                            this.setChapter(this._chapterToActivate);
                        }
                    }
                    if (e.type == components.events.ImageChangedEvent.TYPE) {
                        if (typeof this._structureModel === "undefined" || this._structureModel._imageToChapterMap.isEmpty()) {
                            return;
                        }
                        var imageChangedEvent = e;
                        if (imageChangedEvent.image != null && this._initialized) {
                            if (this._chapterWidget.getSelectedChapter() == null ||
                                this._structureModel.chapterToImageMap.get(this._chapterWidget.getSelectedChapter().id) != imageChangedEvent.image) {
                                var newChapter = this._structureModel._imageToChapterMap.get(imageChangedEvent.image.id);
                                if (newChapter != null) {
                                    this._chapterWidget.setChapterExpanded(newChapter, true);
                                    this._chapterWidget.jumpToChapter(newChapter);
                                }
                            }
                        }
                    }
                    if (e.type == components.events.LanguageModelLoadedEvent.TYPE) {
                        var lmle = e;
                        this._sidebarLabel.text(lmle.languageModel.getTranslation("sidebar.chapterOverview"));
                    }
                    if (e.type == components.events.RequestStateEvent.TYPE) {
                        var rse = e;
                        if (this._currentChapter != null) {
                            rse.stateMap.set("logicalDiv", this.persistChapterToString(this._currentChapter));
                        }
                    }
                    if (e.type == components.events.RestoreStateEvent.TYPE) {
                        var rse = e;
                        var activateChapter = function (div) {
                            if (_this._initialized) {
                                _this.setChapter(div);
                            }
                            else {
                                _this._chapterToActivate = div;
                            }
                        };
                        rse.restoredState.hasThen("logicalDiv", activateChapter);
                        rse.restoredState.hasThen("div", activateChapter);
                    }
                    if (e.type === components.events.ChapterChangedEvent.TYPE) {
                        var cce = e;
                        if (cce == null || cce.chapter == null) {
                            return;
                        }
                        this.setChapter(cce.chapter.id, false);
                    }
                };
                MyCoReChapterComponent.prototype.persistChapterToString = function (chapter) {
                    return chapter.id;
                };
                MyCoReChapterComponent.prototype.createChapterLabelMap = function (model) {
                    var _this = this;
                    var chapterLabelMap = new MyCoReMap();
                    model.chapterToImageMap.forEach(function (k, v) {
                        chapterLabelMap.set(k, v.orderLabel || (_this._autoPagination ? v.order.toString(10) : ""));
                    });
                    return chapterLabelMap;
                };
                MyCoReChapterComponent.prototype.register = function () {
                };
                MyCoReChapterComponent.prototype.registerNode = function (node, id) {
                    var _this = this;
                    node.click(function () {
                        _this.setChapter(id, true, node);
                    });
                };
                MyCoReChapterComponent.prototype.setChapter = function (id, jumpToFirstImageOfChapter, node) {
                    var _this = this;
                    if (jumpToFirstImageOfChapter === void 0) { jumpToFirstImageOfChapter = true; }
                    if (this._currentChapter != null && this._currentChapter.id == id) {
                        return;
                    }
                    var newSelectedChapter = this._chapterWidget.getChapterById(id);
                    if (newSelectedChapter == null) {
                        return;
                    }
                    var changeChapter = function (firstImageOfChapter) {
                        if (typeof firstImageOfChapter != "undefined" && firstImageOfChapter !== null) {
                            _this._currentChapter = newSelectedChapter;
                            _this._chapterWidget.setChapterExpanded(newSelectedChapter, true);
                            _this._chapterWidget.setChapterSelected(newSelectedChapter);
                            _this._chapterWidget.jumpToChapter(newSelectedChapter);
                            _this.trigger(new components.events.ChapterChangedEvent(_this, newSelectedChapter));
                            if (jumpToFirstImageOfChapter) {
                                _this.trigger(new components.events.ImageSelectedEvent(_this, firstImageOfChapter));
                            }
                        }
                    };
                    if (this._structureModel._chapterToImageMap.has(id)) {
                        var firstImageOfChapter = this._structureModel._chapterToImageMap.get(id);
                        changeChapter(firstImageOfChapter);
                    }
                    else {
                        if (typeof node != "undefined") {
                            var oldVal = node.css("cursor");
                            node.css("cursor", "wait");
                        }
                        newSelectedChapter.resolveDestination(function (targetId) {
                            if (typeof node != "undefined") {
                                node.css("cursor", oldVal);
                            }
                            changeChapter(_this._idImageMap.get(targetId));
                        });
                    }
                };
                MyCoReChapterComponent.prototype.registerExpander = function (expander, id) {
                    var that = this;
                    expander.click(function () {
                        var chapterToChange = that._chapterWidget.getChapterById(id);
                        that._chapterWidget.setChapterExpanded(chapterToChange, !that._chapterWidget.getChapterExpanded(chapterToChange));
                    });
                };
                Object.defineProperty(MyCoReChapterComponent.prototype, "container", {
                    get: function () {
                        return this._container;
                    },
                    enumerable: true,
                    configurable: true
                });
                return MyCoReChapterComponent;
            }(components.ViewerComponent));
            components.MyCoReChapterComponent = MyCoReChapterComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var modal;
            (function (modal) {
                var IviewModalWindow = (function () {
                    function IviewModalWindow(_mobile, _title, parent) {
                        if (parent === void 0) { parent = document.body; }
                        this._mobile = _mobile;
                        var that = this;
                        this._wrapper = jQuery("<div></div>");
                        this._wrapper.addClass("modal fade bs-modal-sm");
                        this._wrapper.attr("tabindex", "-1");
                        this._wrapper.attr("role", "dialog");
                        this._wrapper.attr("aria-labeleby", "permalinkLabel");
                        this._wrapper.attr("aria-hidden", "true");
                        this._wrapper.on("click", function (e) {
                            if (e.target == that._wrapper[0]) {
                                that.hide();
                            }
                        });
                        this._box = jQuery("<div></div>");
                        this._box.addClass("modal-dialog modal-sm");
                        this._box.appendTo(this._wrapper);
                        this._content = jQuery("<div></div>");
                        this._content.addClass("modal-content");
                        this._content.appendTo(this._box);
                        this._header = jQuery("<div><h4 class='modal-title' data-i18n='" + _title + "'>" + _title + "</h4></div>");
                        this._header.addClass("modal-header");
                        this._header.appendTo(this._content);
                        this._body = jQuery("<div></div>");
                        this._body.addClass("modal-body");
                        this._body.appendTo(this._content);
                        this._footer = jQuery("<div></div>");
                        this._footer.addClass("modal-footer");
                        this._footer.appendTo(this._content);
                        this._close = jQuery("<a data-i18n='modal.close'>Close</a>");
                        this._close.attr("type", "button");
                        this._close.addClass("btn btn-default");
                        this._close.appendTo(this._footer);
                        this._close.click(function () {
                            that.hide();
                        });
                        if (!this._mobile) {
                            this._wrapper.modal({ show: false });
                        }
                        else {
                            this.hide();
                        }
                        jQuery(parent).prepend(this._wrapper);
                    }
                    Object.defineProperty(IviewModalWindow.prototype, "box", {
                        get: function () {
                            return this._box;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewModalWindow.prototype, "wrapper", {
                        get: function () {
                            return this._wrapper;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewModalWindow.prototype, "modalContent", {
                        get: function () {
                            return this._content;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewModalWindow.prototype, "modalHeader", {
                        get: function () {
                            return this._header;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewModalWindow.prototype, "modalBody", {
                        get: function () {
                            return this._body;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewModalWindow.prototype, "modalFooter", {
                        get: function () {
                            return this._footer;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    IviewModalWindow.prototype.show = function () {
                        if (!this._mobile) {
                            this._wrapper.modal("show");
                        }
                        else {
                            this._wrapper.show();
                        }
                    };
                    IviewModalWindow.prototype.hide = function () {
                        if (!this._mobile) {
                            this._wrapper.modal("hide");
                        }
                        else {
                            this._wrapper.hide();
                        }
                    };
                    Object.defineProperty(IviewModalWindow.prototype, "closeButton", {
                        get: function () {
                            return this._close;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewModalWindow.prototype, "closeLabel", {
                        set: function (label) {
                            this._close.text(label);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(IviewModalWindow.prototype, "title", {
                        get: function () {
                            return this._header.find(".modal-title").text();
                        },
                        set: function (title) {
                            this._header.find(".modal-title").text(title);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    IviewModalWindow.prototype.updateI18n = function (languageModel) {
                        languageModel.translate(this._wrapper);
                        return this;
                    };
                    return IviewModalWindow;
                }());
                modal.IviewModalWindow = IviewModalWindow;
            })(modal = widgets.modal || (widgets.modal = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var modal;
            (function (modal) {
                var ViewerPermalinkModalWindow = (function (_super) {
                    __extends(ViewerPermalinkModalWindow, _super);
                    function ViewerPermalinkModalWindow(_mobile) {
                        _super.call(this, _mobile, "Permalink");
                        var that = this;
                        this._textArea = jQuery("<textarea></textarea>");
                        this._textArea.addClass("form-control");
                        this._textArea.appendTo(this.modalBody);
                        this._textArea.on("click", function () {
                            that._textArea.select();
                        });
                    }
                    Object.defineProperty(ViewerPermalinkModalWindow.prototype, "permalink", {
                        set: function (link) {
                            this._textArea.text(link);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return ViewerPermalinkModalWindow;
                }(modal.IviewModalWindow));
                modal.ViewerPermalinkModalWindow = ViewerPermalinkModalWindow;
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
            var events;
            (function (events) {
                var RestoreStateEvent = (function (_super) {
                    __extends(RestoreStateEvent, _super);
                    function RestoreStateEvent(component, restoredState) {
                        _super.call(this, component, RestoreStateEvent.TYPE);
                        this.restoredState = restoredState;
                    }
                    RestoreStateEvent.TYPE = "RestoreStateEvent";
                    return RestoreStateEvent;
                }(events.MyCoReImageViewerEvent));
                events.RestoreStateEvent = RestoreStateEvent;
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
            var events;
            (function (events) {
                var UpdateURLEvent = (function (_super) {
                    __extends(UpdateURLEvent, _super);
                    function UpdateURLEvent(component) {
                        _super.call(this, component, UpdateURLEvent.TYPE);
                    }
                    UpdateURLEvent.TYPE = "UpdateURLEvent";
                    return UpdateURLEvent;
                }(events.MyCoReImageViewerEvent));
                events.UpdateURLEvent = UpdateURLEvent;
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
            var events;
            (function (events) {
                var RequestPermalinkEvent = (function (_super) {
                    __extends(RequestPermalinkEvent, _super);
                    function RequestPermalinkEvent(component, callback) {
                        _super.call(this, component, RequestPermalinkEvent.TYPE);
                        this.callback = callback;
                    }
                    RequestPermalinkEvent.TYPE = "RequestPermalinkEvent";
                    return RequestPermalinkEvent;
                }(events.MyCoReImageViewerEvent));
                events.RequestPermalinkEvent = RequestPermalinkEvent;
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
            var MyCoRePermalinkComponent = (function (_super) {
                __extends(MyCoRePermalinkComponent, _super);
                function MyCoRePermalinkComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this._currentState = new ViewerParameterMap();
                    this._enabled = Utils.getVar(this._settings, "permalink.enabled", true);
                }
                MyCoRePermalinkComponent.prototype.init = function () {
                    this.trigger(new components.events.ComponentInitializedEvent(this));
                    if (this._enabled) {
                        this._modalWindow = new mycore.viewer.widgets.modal.ViewerPermalinkModalWindow(this._settings.mobile);
                        this.trigger(new components.events.WaitForEvent(this, components.events.LanguageModelLoadedEvent.TYPE));
                        var that = this;
                        var parameter = ViewerParameterMap.fromCurrentUrl();
                        if (!parameter.isEmpty()) {
                            that.trigger(new components.events.RestoreStateEvent(that, parameter));
                        }
                    }
                    else {
                        this.trigger(new components.events.WaitForEvent(this, components.events.ProvideToolbarModelEvent.TYPE));
                    }
                };
                MyCoRePermalinkComponent.prototype.handle = function (e) {
                    if (e.type == components.events.ProvideToolbarModelEvent.TYPE) {
                        var ptme = e;
                        var group = ptme.model.getGroup(ptme.model._actionControllGroup.name);
                        if (typeof group != "undefined" && group != null) {
                            ptme.model.getGroup(ptme.model._actionControllGroup.name).removeComponent(ptme.model._shareButton);
                        }
                    }
                    if (e.type == components.events.LanguageModelLoadedEvent.TYPE) {
                        var languageModelLoadedEvent = e;
                        this._modalWindow.closeLabel = languageModelLoadedEvent.languageModel.getTranslation("permalink.close");
                        this._modalWindow.title = languageModelLoadedEvent.languageModel.getTranslation("permalink.title");
                    }
                    if (e.type == viewer.widgets.toolbar.events.ButtonPressedEvent.TYPE) {
                        var bpe = e;
                        if (bpe.button.id == "ShareButton") {
                            var state = new ViewerParameterMap();
                            this.trigger(new components.events.RequestStateEvent(this, state, true));
                            var permalink = this.buildPermalink(state);
                            this._modalWindow.permalink = permalink;
                            this._modalWindow.show();
                        }
                    }
                    if (e.type == components.events.RequestPermalinkEvent.TYPE) {
                        var rpe = e;
                        var state = new ViewerParameterMap();
                        this.trigger(new components.events.RequestStateEvent(this, state, true));
                        var permalink = this.buildPermalink(state);
                        rpe.callback(permalink);
                    }
                    if (e.type == components.events.ImageChangedEvent.TYPE) {
                        var ice = e;
                        if (typeof ice.image != "undefined") {
                            this.updateHistory();
                        }
                    }
                    if (e.type == components.events.UpdateURLEvent.TYPE) {
                        this.updateHistory();
                    }
                };
                MyCoRePermalinkComponent.prototype.updateHistory = function () {
                    var updateHistory = Utils.getVar(this._settings, "permalink.updateHistory", true);
                    var state = new ViewerParameterMap();
                    this.trigger(new components.events.RequestStateEvent(this, state, false));
                    if (updateHistory) {
                        window.history.replaceState({}, "", this.buildPermalink(state));
                    }
                };
                MyCoRePermalinkComponent.prototype.buildPermalink = function (state) {
                    var file;
                    if (this._settings.doctype == "pdf") {
                        file = this._settings.filePath;
                    }
                    else {
                        file = state.get("page");
                        state.remove("page");
                    }
                    var baseURL = this.getBaseURL(file);
                    state.remove("derivate");
                    return baseURL + state.toParameterString();
                };
                MyCoRePermalinkComponent.prototype.getBaseURL = function (file) {
                    var pattern = Utils.getVar(this._settings, "permalink.viewerLocationPattern", "{baseURL}/rsc/viewer/{derivate}/{file}", function (p) { return p != null; });
                    return ViewerFormatString(pattern, {
                        baseURL: this._settings.webApplicationBaseURL,
                        derivate: this._settings.derivate,
                        file: file
                    });
                };
                Object.defineProperty(MyCoRePermalinkComponent.prototype, "handlesEvents", {
                    get: function () {
                        var handles = new Array();
                        if (this._enabled) {
                            handles.push(viewer.widgets.toolbar.events.ButtonPressedEvent.TYPE);
                            handles.push(components.events.LanguageModelLoadedEvent.TYPE);
                            handles.push(components.events.RequestPermalinkEvent.TYPE);
                            handles.push(components.events.ImageChangedEvent.TYPE);
                            handles.push(components.events.UpdateURLEvent.TYPE);
                        }
                        else {
                            handles.push(components.events.ProvideToolbarModelEvent.TYPE);
                        }
                        return handles;
                    },
                    enumerable: true,
                    configurable: true
                });
                return MyCoRePermalinkComponent;
            }(components.ViewerComponent));
            components.MyCoRePermalinkComponent = MyCoRePermalinkComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var i18n;
            (function (i18n) {
                var XMLI18NProvider = (function () {
                    function XMLI18NProvider() {
                    }
                    XMLI18NProvider.prototype.getLanguage = function (href, callback, errorCallback) {
                        if (errorCallback === void 0) { errorCallback = XMLI18NProvider.DEFAULT_ERROR_CALLBACK; }
                        var settings = {
                            url: href,
                            success: function (response) {
                                callback(new viewer.model.LanguageModel(new MyCoReMap(response)));
                            },
                            error: function (request, status, exception) {
                                errorCallback(exception);
                            }
                        };
                        jQuery.ajax(settings);
                    };
                    XMLI18NProvider.DEFAULT_ERROR_CALLBACK = function (err) {
                        console.log(err);
                        return;
                    };
                    return XMLI18NProvider;
                }());
                i18n.XMLI18NProvider = XMLI18NProvider;
                i18n.I18NPROVIDER = new XMLI18NProvider();
            })(i18n = widgets.i18n || (widgets.i18n = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReI18NProvider = (function () {
                function MyCoReI18NProvider() {
                }
                MyCoReI18NProvider.prototype.getLanguage = function (href, callback, errorCallback) {
                    if (errorCallback === void 0) { errorCallback = MyCoReI18NProvider.DEFAULT_ERROR_CALLBACK; }
                    var settings = {
                        url: href,
                        success: function (response) {
                            var newResponse = [];
                            for (var keyIndex in response) {
                                var prefixEnd = 0;
                                if (keyIndex.indexOf(MyCoReI18NProvider.VIEWER_PREFIX) == 0) {
                                    prefixEnd = MyCoReI18NProvider.VIEWER_PREFIX.length;
                                }
                                else if (keyIndex.indexOf(MyCoReI18NProvider.METS_PREFIX) == 0) {
                                    prefixEnd = MyCoReI18NProvider.METS_PREFIX.length;
                                }
                                var newKeyIndex = keyIndex.substr(prefixEnd);
                                newResponse[newKeyIndex] = response[keyIndex];
                            }
                            callback(new viewer.model.LanguageModel(new MyCoReMap(newResponse)));
                        },
                        error: function (request, status, exception) {
                            errorCallback(exception);
                            callback(new viewer.model.LanguageModel(new MyCoReMap()));
                        }
                    };
                    jQuery.ajax(settings);
                };
                MyCoReI18NProvider.DEFAULT_ERROR_CALLBACK = function (err) {
                    console.log(err);
                    return;
                };
                MyCoReI18NProvider.VIEWER_PREFIX = "component.viewer.";
                MyCoReI18NProvider.METS_PREFIX = "component.mets.";
                return MyCoReI18NProvider;
            }());
            components.MyCoReI18NProvider = MyCoReI18NProvider;
            {
                mycore.viewer.widgets.i18n.I18NPROVIDER = new MyCoReI18NProvider();
            }
            var MyCoReI18NComponent = (function (_super) {
                __extends(MyCoReI18NComponent, _super);
                function MyCoReI18NComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this._language = ("lang" in this._settings) ? this._settings.lang : "en";
                    this._loadI18N();
                }
                MyCoReI18NComponent.prototype._loadI18N = function () {
                    var that = this;
                    if (typeof this._settings.i18nURL == "undefined" || this._settings.i18nURL == null) {
                        throw new ViewerError("i18nURL is not specified in settings!");
                    }
                    viewer.widgets.i18n.I18NPROVIDER.getLanguage(ViewerFormatString(this._settings.i18nURL, { "lang": this._language }), function (languageModel) {
                        var loadedEvent = new components.events.LanguageModelLoadedEvent(that, languageModel);
                        that.trigger(loadedEvent);
                    });
                };
                return MyCoReI18NComponent;
            }(components.ViewerComponent));
            components.MyCoReI18NComponent = MyCoReI18NComponent;
        })(components = viewer.components || (viewer.components = {}));
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
                var RequestTextContentEvent = (function (_super) {
                    __extends(RequestTextContentEvent, _super);
                    function RequestTextContentEvent(component, _href, _onResolve) {
                        _super.call(this, component, RequestTextContentEvent.TYPE);
                        this._href = _href;
                        this._onResolve = _onResolve;
                    }
                    RequestTextContentEvent.TYPE = "RequestTextContentEvent";
                    return RequestTextContentEvent;
                }(events.MyCoReImageViewerEvent));
                events.RequestTextContentEvent = RequestTextContentEvent;
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
                var PageLayout = (function () {
                    function PageLayout() {
                        this._insertedPages = new Array();
                    }
                    PageLayout.prototype.init = function (model, pageController, pageDimension, horizontalScrollbar, verticalScrollbar, pageLoader) {
                        this._model = model;
                        this._pageController = pageController;
                        this._pageDimension = pageDimension;
                        this._originalPageDimension = pageDimension;
                        this._horizontalScrollbar = horizontalScrollbar;
                        this._verticalScrollbar = verticalScrollbar;
                        this._pageLoader = pageLoader;
                    };
                    PageLayout.prototype.getPageController = function () {
                        return this._pageController;
                    };
                    PageLayout.prototype.updatePage = function (order) {
                        var shouldBeInserted = this.checkShouldBeInserted(order);
                        var isInserted = this.isImageInserted(order);
                        if (shouldBeInserted && !isInserted && this._model.children.has(order)) {
                            var page = this._model.children.get(order);
                            this._insertedPages.push(order);
                            this._pageController.addPage(page, this.calculatePageAreaInformation(order));
                        }
                        if (!shouldBeInserted && isInserted && this._model.children.has(order)) {
                            var page = this._model.children.get(order);
                            this._insertedPages.splice(this._insertedPages.indexOf(order));
                            this._pageController.removePage(page);
                        }
                    };
                    PageLayout.prototype.getRealPageDimension = function (pageNumber) {
                        if (pageNumber != -1 && this._model.children.has(pageNumber)) {
                            var page = this._model.children.get(pageNumber);
                            var pageArea = this._pageController.getPageAreaInformation(page);
                            if (typeof pageArea != "undefined") {
                                return page.size.scale(pageArea.scale).getRotated(this.getCurrentPageRotation());
                            }
                        }
                        return this._pageDimension.getRotated(this.getCurrentPageRotation());
                    };
                    PageLayout.prototype.syncronizePages = function () {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.clear = function () {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.checkShouldBeInserted = function (order) {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.calculatePageAreaInformation = function (order) {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.getImageMiddle = function (order) {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.fitToScreen = function () {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.fitToWidth = function (attop) {
                        if (attop === void 0) { attop = false; }
                        throw "should be implemented";
                    };
                    PageLayout.prototype.getCurrentPage = function () {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.jumpToPage = function (order) {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.isImageInserted = function (order) {
                        return this._model.children.has(order) && (this._pageController.getPages().indexOf(this._model.children.get(order)) != -1);
                    };
                    PageLayout.prototype.scrollhandler = function () {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.rotate = function (deg) {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.getLabelKey = function () {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.getCurrentOverview = function () {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.next = function () {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.previous = function () {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.getCurrentPageRotation = function () {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.setCurrentPageZoom = function (zoom) {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.getCurrentPageZoom = function () {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.getCurrentPositionInPage = function () {
                        var positionInArea = this._pageController.viewport.asRectInArea().pos;
                        var page = this.getCurrentPage();
                        var pageSize = this._pageDimension;
                        var middle = this.getImageMiddle(page);
                        var x = positionInArea.x - (middle.x - (pageSize.width / 2));
                        var y = positionInArea.y - (middle.y - (pageSize.height / 2));
                        return new Position2D(x, y);
                    };
                    PageLayout.prototype.setCurrentPositionInPage = function (pos) {
                        throw "should be implemented";
                    };
                    PageLayout.prototype.getPositionInArea = function (windowPosition) {
                        var viewport = this._pageController.viewport;
                        var viewRect = viewport.asRectInArea();
                        var areaX = viewRect.pos.x + (viewRect.size.width * (windowPosition.x / viewport.size.width));
                        var areaY = viewRect.pos.y + (viewRect.size.height * (windowPosition.y / viewport.size.height));
                        return new Position2D(areaX, areaY);
                    };
                    PageLayout.prototype.getPageHitInfo = function (windowPosition) {
                        var viewport = this._pageController.viewport;
                        var pageArea = this._pageController.getPageArea();
                        var positionInArea = this.getPositionInArea(windowPosition);
                        for (var _i = 0, _a = pageArea.getPagesInViewport(viewport); _i < _a.length; _i++) {
                            var page = _a[_i];
                            var structureImage = this._model.hrefImageMap.get(page.id);
                            if (structureImage == null) {
                                continue;
                            }
                            var info = pageArea.getPageInformation(page);
                            var realPageDimension = page.size.getRotated(info.rotation).scale(info.scale);
                            var pageRect = new Rect(new Position2D(info.position.x - (realPageDimension.width / 2), info.position.y - (realPageDimension.height / 2)), realPageDimension);
                            if (pageRect.intersects(positionInArea)) {
                                var r = pageRect.flip(info.rotation);
                                var p1 = r.pos.rotate(info.rotation);
                                var p2 = positionInArea.rotate(info.rotation);
                                var hit = new Position2D(Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y));
                                return {
                                    id: page.id,
                                    order: structureImage.order,
                                    pageAreaInformation: info,
                                    hit: hit
                                };
                            }
                        }
                        return {
                            id: null,
                            order: null,
                            pageAreaInformation: null,
                            hit: null
                        };
                    };
                    return PageLayout;
                }());
                canvas.PageLayout = PageLayout;
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
            var events;
            (function (events) {
                var ProvidePageLayoutEvent = (function (_super) {
                    __extends(ProvidePageLayoutEvent, _super);
                    function ProvidePageLayoutEvent(component, pageLayout, isDefault) {
                        if (isDefault === void 0) { isDefault = false; }
                        _super.call(this, component, ProvidePageLayoutEvent.TYPE);
                        this.pageLayout = pageLayout;
                        this.isDefault = isDefault;
                    }
                    ProvidePageLayoutEvent.TYPE = "ProvidePageLayoutEvent";
                    return ProvidePageLayoutEvent;
                }(events.MyCoReImageViewerEvent));
                events.ProvidePageLayoutEvent = ProvidePageLayoutEvent;
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
            var events;
            (function (events) {
                var RequestPageEvent = (function (_super) {
                    __extends(RequestPageEvent, _super);
                    function RequestPageEvent(component, _pageId, _onResolve, textContentURL) {
                        if (textContentURL === void 0) { textContentURL = null; }
                        _super.call(this, component, RequestPageEvent.TYPE);
                        this._pageId = _pageId;
                        this._onResolve = _onResolve;
                        this.textContentURL = textContentURL;
                    }
                    RequestPageEvent.TYPE = "RequestPageEvent";
                    return RequestPageEvent;
                }(events.MyCoReImageViewerEvent));
                events.RequestPageEvent = RequestPageEvent;
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
            var events;
            (function (events) {
                var PageLayoutChangedEvent = (function (_super) {
                    __extends(PageLayoutChangedEvent, _super);
                    function PageLayoutChangedEvent(component, pageLayout) {
                        _super.call(this, component, PageLayoutChangedEvent.TYPE);
                        this.pageLayout = pageLayout;
                    }
                    PageLayoutChangedEvent.TYPE = "PageLayoutChangedEvent";
                    return PageLayoutChangedEvent;
                }(events.MyCoReImageViewerEvent));
                events.PageLayoutChangedEvent = PageLayoutChangedEvent;
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
                var DesktopInputAdapter = (function () {
                    function DesktopInputAdapter() {
                    }
                    DesktopInputAdapter.prototype.mouseDown = function (position, e) {
                    };
                    DesktopInputAdapter.prototype.mouseUp = function (position, e) {
                    };
                    DesktopInputAdapter.prototype.mouseClick = function (position, e) {
                    };
                    DesktopInputAdapter.prototype.mouseDoubleClick = function (position, e) {
                    };
                    DesktopInputAdapter.prototype.mouseMove = function (position, e) {
                    };
                    DesktopInputAdapter.prototype.mouseDrag = function (currentPosition, startPosition, startViewport, e) {
                    };
                    DesktopInputAdapter.prototype.scroll = function (e) {
                    };
                    DesktopInputAdapter.prototype.keydown = function (e) {
                    };
                    DesktopInputAdapter.prototype.keypress = function (e) {
                    };
                    DesktopInputAdapter.prototype.keyup = function (e) {
                    };
                    return DesktopInputAdapter;
                }());
                canvas.DesktopInputAdapter = DesktopInputAdapter;
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
            var events;
            (function (events) {
                var RequestDesktopInputEvent = (function (_super) {
                    __extends(RequestDesktopInputEvent, _super);
                    function RequestDesktopInputEvent(component, listener) {
                        _super.call(this, component, RequestDesktopInputEvent.TYPE);
                        this.listener = listener;
                    }
                    RequestDesktopInputEvent.TYPE = "RequestDesktopInputEvent";
                    return RequestDesktopInputEvent;
                }(events.MyCoReImageViewerEvent));
                events.RequestDesktopInputEvent = RequestDesktopInputEvent;
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
                var TouchMove = (function () {
                    function TouchMove(positions, middle, angle, distance, time, velocity, delta) {
                        this.positions = positions;
                        this.middle = middle;
                        this.angle = angle;
                        this.distance = distance;
                        this.time = time;
                        this.velocity = velocity;
                        this.delta = delta;
                    }
                    return TouchMove;
                }());
                canvas.TouchMove = TouchMove;
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
                var TouchSession = (function () {
                    function TouchSession(startTime, startMiddle, startAngle, startDistance, canvasStartPosition, canvasStartScale, canvasStartRotation, currentMove, lastMove, lastSession, touches, touchLeft, maxTouches) {
                        this.startTime = startTime;
                        this.startMiddle = startMiddle;
                        this.startAngle = startAngle;
                        this.startDistance = startDistance;
                        this.canvasStartPosition = canvasStartPosition;
                        this.canvasStartScale = canvasStartScale;
                        this.canvasStartRotation = canvasStartRotation;
                        this.currentMove = currentMove;
                        this.lastMove = lastMove;
                        this.lastSession = lastSession;
                        this.touches = touches;
                        this.touchLeft = touchLeft;
                        this.maxTouches = maxTouches;
                    }
                    return TouchSession;
                }());
                canvas.TouchSession = TouchSession;
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
                var TouchInputAdapter = (function () {
                    function TouchInputAdapter() {
                    }
                    TouchInputAdapter.prototype.touchStart = function (session) { };
                    TouchInputAdapter.prototype.touchMove = function (session) { };
                    TouchInputAdapter.prototype.touchEnd = function (session) { };
                    return TouchInputAdapter;
                }());
                canvas.TouchInputAdapter = TouchInputAdapter;
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
            var events;
            (function (events) {
                var RequestTouchInputEvent = (function (_super) {
                    __extends(RequestTouchInputEvent, _super);
                    function RequestTouchInputEvent(component, listener) {
                        _super.call(this, component, RequestTouchInputEvent.TYPE);
                        this.listener = listener;
                    }
                    RequestTouchInputEvent.TYPE = "RequestTouchInputEvent";
                    return RequestTouchInputEvent;
                }(events.MyCoReImageViewerEvent));
                events.RequestTouchInputEvent = RequestTouchInputEvent;
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
            var events;
            (function (events) {
                var AddCanvasPageLayerEvent = (function (_super) {
                    __extends(AddCanvasPageLayerEvent, _super);
                    function AddCanvasPageLayerEvent(component, zIndex, canvasPageLayer) {
                        _super.call(this, component, AddCanvasPageLayerEvent.TYPE);
                        this.zIndex = zIndex;
                        this.canvasPageLayer = canvasPageLayer;
                    }
                    AddCanvasPageLayerEvent.TYPE = "AddCanvasPageLayerEvent";
                    return AddCanvasPageLayerEvent;
                }(events.MyCoReImageViewerEvent));
                events.AddCanvasPageLayerEvent = AddCanvasPageLayerEvent;
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
            var events;
            (function (events) {
                var TextEditEvent = (function (_super) {
                    __extends(TextEditEvent, _super);
                    function TextEditEvent(component, edit) {
                        if (edit === void 0) { edit = true; }
                        _super.call(this, component, TextEditEvent.TYPE);
                        this.edit = edit;
                    }
                    TextEditEvent.TYPE = "TextEditEvent";
                    return TextEditEvent;
                }(events.MyCoReImageViewerEvent));
                events.TextEditEvent = TextEditEvent;
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
            var events;
            (function (events) {
                var RedrawEvent = (function (_super) {
                    __extends(RedrawEvent, _super);
                    function RedrawEvent(component) {
                        _super.call(this, component, RedrawEvent.TYPE);
                    }
                    RedrawEvent.TYPE = "RedrawEvent";
                    return RedrawEvent;
                }(events.MyCoReImageViewerEvent));
                events.RedrawEvent = RedrawEvent;
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
                var SinglePageLayout = (function (_super) {
                    __extends(SinglePageLayout, _super);
                    function SinglePageLayout() {
                        _super.apply(this, arguments);
                        this._paiCache = new MyCoReMap();
                        this._rotation = 0;
                    }
                    SinglePageLayout.prototype.syncronizePages = function () {
                        var _this = this;
                        var vp = this._pageController.viewport;
                        var pageSizeWithSpace = this.getPageHeightWithSpace();
                        var rowCount = this._model.pageCount;
                        this.correctViewport();
                        if (typeof this._horizontalScrollbar != "undefined" && this._horizontalScrollbar != null) {
                            this._horizontalScrollbar.areaSize = this._pageDimension.width;
                            this._horizontalScrollbar.viewSize = this._pageController.viewport.size.width / this._pageController.viewport.scale;
                            this._horizontalScrollbar.position = vp.position.x - (vp.size.width / vp.scale / 2) + (this._pageDimension.width / 2);
                        }
                        if (typeof this._verticalScrollbar != "undefined" && this._verticalScrollbar != null) {
                            this._verticalScrollbar.areaSize = rowCount * this.getPageHeightWithSpace();
                            this._verticalScrollbar.viewSize = this._pageController.viewport.size.height / this._pageController.viewport.scale;
                            this._verticalScrollbar.position = vp.position.y - (vp.size.height / vp.scale / 2);
                        }
                        var vpSizeInArea = vp.size.height / vp.scale;
                        var yStart = vp.position.y - (vpSizeInArea / 2);
                        var yEnd = vp.position.y + (vpSizeInArea / 2);
                        var yStartOrder = Math.floor(yStart / pageSizeWithSpace);
                        var yEndOrder = Math.ceil(yEnd / pageSizeWithSpace);
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
                    SinglePageLayout.prototype.clear = function () {
                        var _this = this;
                        var pages = this._pageController.getPages().slice(0);
                        this._insertedPages.splice(0, this._insertedPages.length);
                        pages.forEach(function (p) {
                            _this._pageController.removePage(p);
                        });
                    };
                    SinglePageLayout.prototype.fitToScreen = function () {
                        var vp = this._pageController.viewport;
                        if (vp.size.width != 0 && vp.size.height != 0) {
                            var vpRotated = vp.size;
                            var realPageDimension = this.getRealPageDimension(this.getCurrentPage());
                            vp.scale = Math.min(vpRotated.width / realPageDimension.width, vpRotated.height / realPageDimension.height);
                            var imgMiddle = this.getImageMiddle(this.getCurrentPage());
                            vp.position = new Position2D(0, imgMiddle.y);
                        }
                    };
                    SinglePageLayout.prototype.calculatePageAreaInformation = function (order) {
                        var imgSize = this._model.children.get(order).size;
                        var pai = new widgets.canvas.PageAreaInformation();
                        pai.position = this.getImageMiddle(order);
                        pai.scale = Math.min(this._originalPageDimension.width / imgSize.width, this._originalPageDimension.height / imgSize.height);
                        pai.rotation = this._rotation;
                        this._paiCache.set(order, pai);
                        return pai;
                    };
                    SinglePageLayout.prototype.checkShouldBeInserted = function (order) {
                        var vpRect = this._pageController.viewport.asRectInArea();
                        var imagePos = this.getImageMiddle(order);
                        var imageRect = new Rect(new Position2D(imagePos.x - (this._pageDimension.width / 2), imagePos.y - (this._pageDimension.height / 2)), this._pageDimension);
                        var overviewRect = this.getCurrentOverview();
                        return vpRect.getIntersection(imageRect) != null || overviewRect.getIntersection(imageRect) != null;
                    };
                    SinglePageLayout.prototype.fitToWidth = function (attop) {
                        if (attop === void 0) { attop = false; }
                        var middle = this.getImageMiddle(this.getCurrentPage());
                        var realPageDimension = this.getRealPageDimension(this.getCurrentPage());
                        this._pageController.viewport.scale = this._pageController.viewport.size.width / (realPageDimension.width);
                        var correctedY = middle.y;
                        if (attop) {
                            var vp = this._pageController.viewport;
                            var scaledViewport = vp.size.scale(1 / vp.scale);
                            correctedY = (correctedY - realPageDimension.height / 2) + scaledViewport.height / 2;
                        }
                        this._pageController.viewport.position = new Position2D(0, correctedY);
                    };
                    SinglePageLayout.prototype.getCurrentPage = function () {
                        if (typeof this._pageController == "undefined") {
                            return 0;
                        }
                        return Math.ceil(this._pageController.viewport.position.y / this.getPageHeightWithSpace());
                    };
                    SinglePageLayout.prototype.jumpToPage = function (order) {
                        var middleOfImage = this.getImageMiddle(order);
                        var pageRect = new Rect(new Position2D(middleOfImage.x - (this._pageDimension.width / 2), middleOfImage.y - (this._pageDimension.height / 2)), this._pageDimension);
                        this._pageController.viewport.setRect(pageRect);
                    };
                    SinglePageLayout.prototype.getPageHeightWithSpace = function () {
                        return this._pageDimension.height + (this._pageDimension.height / 10);
                    };
                    SinglePageLayout.prototype.getImageMiddle = function (order) {
                        var pageSizeWithSpace = this.getPageHeightWithSpace();
                        var middle = order * pageSizeWithSpace - (this._pageDimension.height / 2);
                        return new Position2D(0, middle);
                    };
                    SinglePageLayout.prototype.scrollhandler = function () {
                        var vp = this._pageController.viewport;
                        var scrollPos = new Position2D(this._horizontalScrollbar.position, this._verticalScrollbar.position);
                        var xPos = scrollPos.x + (vp.size.width / vp.scale / 2) - (this._pageDimension.width / 2);
                        vp.position = new Position2D(xPos, scrollPos.y + (vp.size.height / vp.scale / 2));
                    };
                    SinglePageLayout.prototype.correctViewport = function () {
                        var vp = this._pageController.viewport;
                        var pageScaling = this.getCurrentPageScaling();
                        if (pageScaling != -1) {
                            var minWidthScale = this._pageController.viewport.size.width / this._pageDimension.width;
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
                        var minY = Math.ceil(vp.asRectInArea().size.height / 2);
                        var maxY = Math.ceil(this._model.pageCount * this.getPageHeightWithSpace() - Math.floor(vp.asRectInArea().size.height / 2));
                        var correctedY = Math.min(Math.max(vp.position.y, minY), maxY);
                        if (scaledViewport.width > (this._pageDimension.width)) {
                            var corrected = new Position2D(0, correctedY);
                            if (!vp.position.equals(corrected)) {
                                vp.position = corrected;
                            }
                        }
                        else {
                            var minimalX = (-this._pageDimension.width / 2) + scaledViewport.width / 2;
                            var maximalX = (this._pageDimension.width / 2) - scaledViewport.width / 2;
                            var correctedX = Math.max(minimalX, Math.min(maximalX, vp.position.x));
                            var corrected = new Position2D(correctedX, correctedY);
                            if (!vp.position.equals(corrected)) {
                                vp.position = corrected;
                            }
                        }
                    };
                    SinglePageLayout.prototype.rotate = function (deg) {
                        this._rotation = deg;
                        var currentPage = this.getCurrentPage();
                        this._pageDimension = this._originalPageDimension.getRotated(deg);
                        this.clear();
                        this.syncronizePages();
                        this.jumpToPage(currentPage);
                    };
                    SinglePageLayout.prototype.getLabelKey = function () {
                        return "singlePageLayout";
                    };
                    SinglePageLayout.prototype.getCurrentOverview = function () {
                        var pageSize = this.getRealPageDimension(this.getCurrentPage());
                        var pagePosition = this.getImageMiddle(this.getCurrentPage());
                        return new Rect(new Position2D(pagePosition.x - (pageSize.width / 2), pagePosition.y - (pageSize.height / 2)), pageSize);
                    };
                    SinglePageLayout.prototype.next = function () {
                        var page = this.getCurrentPage();
                        var nextPage = Math.max(Math.min(page + 1, this._model.pageCount), 0);
                        var scale = this._pageController.viewport.scale;
                        var pos = this.getCurrentPositionInPage();
                        this.jumpToPage(nextPage);
                        this._pageController.viewport.scale = scale;
                        this.setCurrentPositionInPage(pos);
                    };
                    SinglePageLayout.prototype.previous = function () {
                        var page = this.getCurrentPage();
                        var previousPage = Math.max(Math.min(page - 1, this._model.pageCount), 0);
                        var scale = this._pageController.viewport.scale;
                        var pos = this.getCurrentPositionInPage();
                        this.jumpToPage(previousPage);
                        this._pageController.viewport.scale = scale;
                        this.setCurrentPositionInPage(pos);
                    };
                    SinglePageLayout.prototype.getCurrentPageRotation = function () {
                        return this._rotation;
                    };
                    SinglePageLayout.prototype.getCurrentPageZoom = function () {
                        if (typeof this._pageController == "undefined") {
                            return;
                        }
                        var scaling = this.getCurrentPageScaling();
                        if (scaling !== -1) {
                            return this._pageController.viewport.scale * scaling;
                        }
                        return this._pageController.viewport.scale;
                    };
                    SinglePageLayout.prototype.setCurrentPageZoom = function (zoom) {
                        if (typeof this._pageController == "undefined") {
                            return;
                        }
                        var scaling = this.getCurrentPageScaling();
                        this._pageController.viewport.scale = zoom / scaling;
                    };
                    SinglePageLayout.prototype.getCurrentPageScaling = function () {
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
                    SinglePageLayout.prototype.setCurrentPositionInPage = function (pos) {
                        var vpRect = this._pageController.viewport.asRectInArea();
                        var page = this.getCurrentPage();
                        var middle = this.getImageMiddle(page);
                        var pageSize = this._pageDimension;
                        var pagePos = new Position2D(middle.x - (pageSize.width / 2), middle.y - (pageSize.height / 2));
                        this._pageController.viewport.position = new Position2D(pagePos.x + pos.x + (vpRect.size.width / 2), pagePos.y + pos.y + (vpRect.size.height / 2));
                    };
                    return SinglePageLayout;
                }(canvas.PageLayout));
                canvas.SinglePageLayout = SinglePageLayout;
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
                var ZoomAnimation = (function () {
                    function ZoomAnimation(_viewport, _zoomScale, _position, _duration) {
                        if (_duration === void 0) { _duration = 300; }
                        this._viewport = _viewport;
                        this._zoomScale = _zoomScale;
                        this._duration = _duration;
                        this._startScale = null;
                        this._startPosition = null;
                        this._targetScale = null;
                        this._totalElapsedTime = 0;
                        this._targetScale = _viewport.scale * this._zoomScale;
                        this._startPosition = this._viewport.position;
                        this._startScale = _viewport.scale;
                        if (typeof _position != "undefined" && _position != null) {
                            this._position = _position;
                        }
                        else {
                            this._position = this._viewport.position.copy();
                        }
                        this._diff = new MoveVector(this._viewport.position.x - this._position.x, this._viewport.position.y - this._position.y).scale(this._startScale);
                    }
                    ZoomAnimation.prototype.updateAnimation = function (elapsedTime) {
                        this._totalElapsedTime += elapsedTime;
                        var currentScale = (this._targetScale - this._startScale) * this._totalElapsedTime / this._duration + this._startScale;
                        this._viewport.scale = currentScale;
                        this._viewport.position = this._position.move(this._diff.scale(1 / currentScale));
                        var complete = this._totalElapsedTime >= (this._duration - elapsedTime);
                        if (complete) {
                            this._viewport.position = this._position.move(this._diff.scale(1 / this._targetScale));
                            this._viewport.scale = this._targetScale;
                        }
                        return complete;
                    };
                    ZoomAnimation.prototype.merge = function (additionalZoomScale) {
                        this._startScale = this._viewport.scale;
                        this._targetScale *= additionalZoomScale;
                        this._totalElapsedTime = 0;
                    };
                    return ZoomAnimation;
                }());
                canvas.ZoomAnimation = ZoomAnimation;
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
                var VelocityScrollAnimation = (function () {
                    function VelocityScrollAnimation(_viewport, _startVelocity) {
                        this._viewport = _viewport;
                        this._startVelocity = _startVelocity;
                        this._currentVelocity = this._startVelocity.scale(1 / this._viewport.scale);
                    }
                    VelocityScrollAnimation.prototype.updateAnimation = function (elapsedTime) {
                        this._currentVelocity = this._currentVelocity.scale(1 / (1 + (0.01 * (elapsedTime / 3))));
                        var isComplete = this._currentVelocity.x < VelocityScrollAnimation.MINIMUM_VELOCITY &&
                            this._currentVelocity.x > -VelocityScrollAnimation.MINIMUM_VELOCITY &&
                            this._currentVelocity.y < VelocityScrollAnimation.MINIMUM_VELOCITY &&
                            this._currentVelocity.y > -VelocityScrollAnimation.MINIMUM_VELOCITY;
                        if (!isComplete) {
                            var oldPos = this._viewport.position;
                            var newPosition = new Position2D(oldPos.x + (this._currentVelocity.x * elapsedTime), oldPos.y + (this._currentVelocity.y * elapsedTime));
                            this._viewport.position = newPosition;
                        }
                        return isComplete;
                    };
                    VelocityScrollAnimation.MINIMUM_VELOCITY = 0.05;
                    return VelocityScrollAnimation;
                }());
                canvas.VelocityScrollAnimation = VelocityScrollAnimation;
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
                var DesktopInputDelegator = (function () {
                    function DesktopInputDelegator(_inputElement, _viewport, _handler) {
                        this._inputElement = _inputElement;
                        this._viewport = _viewport;
                        this._handler = _handler;
                        this._lastMouseSession = null;
                        this.initMove();
                        this.initScale();
                    }
                    DesktopInputDelegator.prototype.initMove = function () {
                        var _this = this;
                        var inputElement = jQuery(this._inputElement[0]);
                        this._mouseMoveHandler = function (e) {
                            var target = _this.getTarget(e);
                            if (target == null) {
                                return;
                            }
                            var mousePosition = _this.getMousePosition(inputElement, e);
                            _this._handler.mouseMove(mousePosition, e);
                        };
                        this._mouseDragHandler = function (e) {
                            var target = _this.getTarget(e);
                            if (target == null) {
                                return;
                            }
                            var mousePosition = _this.getMousePosition(inputElement, e);
                            _this._handler.mouseDrag(mousePosition, _this._currentMouseSession.startPosition, _this._currentMouseSession.startViewport, e);
                        };
                        this._mouseDownHandler = function (e) {
                            var target = _this.getTarget(e);
                            if (target == null) {
                                return;
                            }
                            var mousePosition = _this.getMousePosition(inputElement, e);
                            _this._handler.mouseDown(mousePosition, e);
                            _this._currentMouseSession = _this.createMouseSession(mousePosition, _this._viewport.position.copy());
                            inputElement.unbind("mousemove", _this._mouseMoveHandler);
                            inputElement.bind("mousemove", _this._mouseDragHandler);
                            inputElement.bind("mouseleave", _this._mouseLeaveHandler);
                        };
                        this._mouseLeaveHandler = function (e) {
                            _this._mouseUpHandler(e);
                        };
                        this._mouseUpHandler = function (e) {
                            var target = jQuery(e.target);
                            var mousePosition = _this.getMousePosition(inputElement, e);
                            _this._handler.mouseUp(mousePosition, e);
                            if (_this.notNull(_this._currentMouseSession)) {
                                if (new Date().valueOf() - _this._currentMouseSession.downDate < 250 &&
                                    Math.abs(_this._currentMouseSession.startPosition.x - mousePosition.x) < 10 &&
                                    Math.abs(_this._currentMouseSession.startPosition.y - mousePosition.y) < 10) {
                                    _this._handler.mouseClick(mousePosition, e);
                                }
                                if (_this.notNull(_this._lastMouseSession) &&
                                    _this._currentMouseSession.downDate - _this._lastMouseSession.downDate < 500 &&
                                    Math.abs(_this._lastMouseSession.startPosition.x - mousePosition.x) < 10 &&
                                    Math.abs(_this._lastMouseSession.startPosition.y - mousePosition.y) < 10) {
                                    _this._handler.mouseDoubleClick(mousePosition, e);
                                }
                                inputElement.unbind("mousemove", _this._mouseDragHandler);
                                inputElement.unbind("mouseleave", _this._mouseLeaveHandler);
                                inputElement.bind("mousemove", _this._mouseMoveHandler);
                                _this._lastMouseSession = _this._currentMouseSession;
                                _this._currentMouseSession = null;
                            }
                        };
                        inputElement.bind("mousemove", this._mouseMoveHandler);
                        inputElement.bind("mousedown", this._mouseDownHandler);
                        inputElement.bind("mouseup", this._mouseUpHandler);
                        var body = jQuery(document.body);
                        body.keydown(function (e) {
                            _this._handler.keydown(e);
                        });
                        body.keyup(function (e) {
                            _this._handler.keyup(e);
                        });
                        body.keypress(function (e) {
                            _this._handler.keypress(e);
                        });
                    };
                    DesktopInputDelegator.prototype.notNull = function (o) {
                        return typeof o !== "undefined" && o != null;
                    };
                    DesktopInputDelegator.prototype.getTarget = function (e) {
                        var target = jQuery(e.target);
                        if (target.hasClass("overview")) {
                            return null;
                        }
                        return target;
                    };
                    DesktopInputDelegator.prototype.getMousePosition = function (inputElement, e) {
                        var x = ((e.clientX + window.pageXOffset) - inputElement.offset().left) * window.devicePixelRatio;
                        var y = ((e.clientY + window.pageYOffset) - inputElement.offset().top) * window.devicePixelRatio;
                        return new Position2D(x, y);
                    };
                    DesktopInputDelegator.prototype.clearRunning = function () {
                        if (this._currentMouseSession != null) {
                            var inputElement = jQuery(this._inputElement[0]);
                            inputElement.unbind("mousemove", this._mouseDragHandler);
                            inputElement.bind("mousemove", this._mouseMoveHandler);
                            this._lastMouseSession = this._currentMouseSession;
                            this._handler.mouseUp(this._currentMouseSession.currentPosition, null);
                            this._currentMouseSession = null;
                        }
                    };
                    DesktopInputDelegator.prototype.initScale = function () {
                        var _this = this;
                        viewerCrossBrowserWheel(this._inputElement[0], function (e) {
                            _this._handler.scroll(e);
                        });
                    };
                    DesktopInputDelegator.prototype.updateOverview = function (overview, overviewScale, overviewBounding) {
                        this._overviewRect = overview;
                        this._overviewScale = overviewScale;
                        this._overviewBounds = overviewBounding;
                    };
                    DesktopInputDelegator.prototype.createMouseSession = function (startPositionInputElement, startPositionViewport) {
                        return new MouseSession(startPositionInputElement, startPositionViewport, startPositionInputElement);
                    };
                    return DesktopInputDelegator;
                }());
                canvas.DesktopInputDelegator = DesktopInputDelegator;
                var MouseSession = (function () {
                    function MouseSession(startPosition, startViewport, currentPosition) {
                        this.startPosition = startPosition;
                        this.startViewport = startViewport;
                        this.currentPosition = currentPosition;
                        this.downDate = new Date().getTime();
                    }
                    return MouseSession;
                }());
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
                var VelocityCalculationQueue = (function () {
                    function VelocityCalculationQueue(_maxElements, _maxTime) {
                        if (_maxElements === void 0) { _maxElements = 20; }
                        if (_maxTime === void 0) { _maxTime = 300; }
                        this._maxElements = _maxElements;
                        this._maxTime = _maxTime;
                        this._maxElementsOrig = this._maxElements;
                        this._values = new Array();
                    }
                    VelocityCalculationQueue.prototype.add = function (move) {
                        if (this._values.length > 0) {
                            var last = this._values.pop();
                            this._values.push(last);
                            if (move.time - last.time >= 5) {
                                this._values.push(move);
                            }
                            var arr = this._values.reverse();
                            arr.length = Math.min(arr.length, this._maxElements);
                            this._values = arr.reverse();
                        }
                        else {
                            this._values.push(move);
                        }
                    };
                    VelocityCalculationQueue.prototype.getVelocity = function () {
                        var newest = this._values.pop();
                        this._values.push(newest);
                        if (this._values.length == 0) {
                            return new MoveVector(0, 0);
                        }
                        var oldest = null;
                        for (var i in this._values) {
                            var current = this._values[i];
                            var isOlderThenMaxTime = Math.abs(current.time - newest.time) > this._maxTime;
                            if (!isOlderThenMaxTime) {
                                oldest = current;
                                break;
                            }
                        }
                        var deltaTime = newest.time - oldest.time;
                        var delta = new MoveVector(oldest.middle.x - newest.middle.x, oldest.middle.y - newest.middle.y);
                        return new MoveVector((delta.x / deltaTime) || 0, (delta.y / deltaTime) || 0);
                    };
                    return VelocityCalculationQueue;
                }());
                canvas.VelocityCalculationQueue = VelocityCalculationQueue;
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
                var TouchPolyfill = (function () {
                    function TouchPolyfill(_inputElement) {
                        var _this = this;
                        this._inputElement = _inputElement;
                        this._idPointerMap = new MyCoReMap();
                        this._handlerMap = new MyCoReMap();
                        this._inputElement.addEventListener("pointerdown", function (e) {
                            if (e.pointerType == "touch") {
                                e.stopImmediatePropagation();
                                e.preventDefault();
                                e.stopPropagation();
                                _this._updatePointer(e.pointerId.toString(10), new Position2D(e.offsetX, e.offsetY));
                                _this._fireEvent("touchstart");
                            }
                        });
                        this._inputElement.addEventListener("pointerup", function (e) {
                            if (e.pointerType == "touch") {
                                e.stopImmediatePropagation();
                                e.preventDefault();
                                e.stopPropagation();
                                _this._deletePointer(e.pointerId.toString(10));
                                _this._fireEvent("touchend");
                            }
                        });
                        this._inputElement.addEventListener("pointermove", function (e) {
                            if (e.pointerType == "touch") {
                                e.stopImmediatePropagation();
                                e.preventDefault();
                                e.stopPropagation();
                                _this._updatePointer(e.pointerId.toString(10), new Position2D(e.offsetX, e.offsetY));
                                _this._fireEvent("touchmove");
                            }
                        });
                        this._inputElement.addEventListener("pointercancel", function (e) {
                            if (e.pointerType == "touch") {
                                e.stopImmediatePropagation();
                                e.preventDefault();
                                e.stopPropagation();
                                _this._deletePointer(e.pointerId.toString(10));
                                _this._fireEvent("touchend");
                            }
                            ;
                        });
                    }
                    TouchPolyfill.prototype._deletePointer = function (id) {
                        this._idPointerMap.remove(id);
                    };
                    TouchPolyfill.prototype._updatePointer = function (id, pos) {
                        this._idPointerMap.set(id, pos);
                    };
                    TouchPolyfill.prototype._fireEvent = function (eventName) {
                        if (this._handlerMap.has(eventName)) {
                            var handler = this._handlerMap.get(eventName);
                            handler(this._createTouchEvent());
                        }
                    };
                    TouchPolyfill.prototype._createTouchEvent = function () {
                        return {
                            preventDefault: function () { },
                            targetTouches: this._createTouchesArray()
                        };
                    };
                    TouchPolyfill.prototype._createTouchesArray = function () {
                        var arr = new Array();
                        this._idPointerMap.values.forEach(function (pos) { return arr.push({ clientX: pos.x, clientY: pos.y, pageX: pos.x, pageY: pos.y }); });
                        return arr;
                    };
                    Object.defineProperty(TouchPolyfill.prototype, "touchstart", {
                        get: function () {
                            return this._handlerMap.get("touchstart");
                        },
                        set: function (handler) {
                            this._handlerMap.set("touchstart", handler);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(TouchPolyfill.prototype, "touchmove", {
                        get: function () {
                            return this._handlerMap.get("touchmove");
                        },
                        set: function (handler) {
                            this._handlerMap.set("touchmove", handler);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(TouchPolyfill.prototype, "touchend", {
                        get: function () {
                            return this._handlerMap.get("touchend");
                        },
                        set: function (handler) {
                            this._handlerMap.set("touchend", handler);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return TouchPolyfill;
                }());
                canvas.TouchPolyfill = TouchPolyfill;
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
                var TouchInputDelegator = (function () {
                    function TouchInputDelegator(_inputElement, _viewport, _handler) {
                        this._inputElement = _inputElement;
                        this._viewport = _viewport;
                        this._handler = _handler;
                        this.msGestureTarget = null;
                        this.session = null;
                        this.lastSession = null;
                        this.listener = new Array();
                        this.initTouch();
                    }
                    TouchInputDelegator.prototype.createTouchSession = function (startMiddle, startAngle, startDistance, lastSession, canvasStartPosition, canvasStartScale, canvasStartRotation) {
                        if (canvasStartPosition === void 0) { canvasStartPosition = this._viewport.position; }
                        if (canvasStartScale === void 0) { canvasStartScale = this._viewport.scale; }
                        if (canvasStartRotation === void 0) { canvasStartRotation = this._viewport.rotation; }
                        return new canvas.TouchSession(new Date().valueOf(), startMiddle, startAngle, startDistance, canvasStartPosition, canvasStartScale, canvasStartRotation, null, null, lastSession, 0, false, 0);
                    };
                    TouchInputDelegator.prototype.initTouch = function () {
                        var surface = this._inputElement[0];
                        var that = this;
                        var velocityCalculator = new canvas.VelocityCalculationQueue();
                        var touchPoly = new canvas.TouchPolyfill(surface);
                        var touchStartListener = function (e) {
                            e.preventDefault();
                            if (this.session == null) {
                                var angle = 0;
                                var touches = 0;
                                velocityCalculator = new canvas.VelocityCalculationQueue();
                                this.session = that.createTouchSession(that.getMiddle(e.targetTouches), angle, that.getDistance(e.targetTouches), this.lastSession);
                                this.session.touches++;
                                this.session.maxTouches = this.session.touches;
                            }
                            else {
                                this.session.touches++;
                                if (this.session.touches > this.session.maxTouches) {
                                    this.session.maxTouches = this.session.touches;
                                }
                                if (this.session.touches == 2) {
                                    this.session.startAngle = that.getAngle(e.targetTouches[0], e.targetTouches[1]);
                                }
                                this.session.startMiddle = that.getMiddle(e.targetTouches);
                                this.session.startDistance = that.getDistance(e.targetTouches);
                            }
                            that._handler.touchStart(this.session);
                        };
                        var touchEndListener = function (e) {
                            this.session.touches--;
                            this.session.touchLeft = true;
                            if (this.session.touches === 0) {
                                that._handler.touchEnd(this.session);
                                this.session.lastSession = null;
                                this.lastSession = this.session;
                                this.session = null;
                            }
                            e.preventDefault();
                        };
                        var touchMoveListener = function (e) {
                            e.preventDefault();
                            var currentMiddle = that.getMiddle(e.targetTouches);
                            var positions = that.getPositions(e.targetTouches);
                            var currentDistance = that.getDistance(e.targetTouches);
                            var angle = 0;
                            if (this.session.touches === 2) {
                                angle = that.getAngle(e.targetTouches[0], e.targetTouches[1]);
                            }
                            var velocity = null;
                            var delta = null;
                            if (this.session.currentMove != null) {
                                velocityCalculator.add(this.session.currentMove);
                                velocity = velocityCalculator.getVelocity();
                                if (this.session.lastMove != null) {
                                    delta = new MoveVector(this.session.lastMove.middle.x - this.session.currentMove.middle.x, this.session.lastMove.middle.y - this.session.currentMove.middle.y);
                                }
                                else {
                                    delta = new MoveVector(0, 0);
                                }
                            }
                            else {
                                velocity = new MoveVector(0, 0);
                                delta = new MoveVector(0, 0);
                            }
                            var move = new canvas.TouchMove(positions, currentMiddle, angle, currentDistance, new Date().valueOf(), velocity, delta);
                            this.session.lastMove = this.session.currentMove;
                            this.session.currentMove = move;
                            that._handler.touchMove(this.session);
                        };
                        this.addListener(surface, "touchstart", touchStartListener);
                        this.addListener(surface, "touchend", touchEndListener);
                        this.addListener(surface, "touchmove", touchMoveListener);
                        touchPoly.touchstart = touchStartListener;
                        touchPoly.touchmove = touchMoveListener;
                        touchPoly.touchend = touchEndListener;
                    };
                    TouchInputDelegator.prototype.clearRunning = function () {
                        if (this.session != null) {
                            this._handler.touchEnd(this.session);
                            this.session.lastSession = null;
                            this.lastSession = this.session;
                            this.session = null;
                        }
                    };
                    TouchInputDelegator.prototype.addListener = function (surface, type, fn) {
                        surface.addEventListener(type, fn);
                        this.listener.push({ surface: surface, type: type, fn: fn });
                    };
                    TouchInputDelegator.prototype.getPositions = function (touches) {
                        var positions = new Array();
                        for (var touchIndex = 0; touchIndex < touches.length; touchIndex++) {
                            var current = touches[touchIndex];
                            positions.push(new Position2D(current.clientX * window.devicePixelRatio, current.clientY * window.devicePixelRatio));
                        }
                        return positions;
                    };
                    TouchInputDelegator.prototype.getAngle = function (touch1, touch2) {
                        var y = touch2.pageY * window.devicePixelRatio - touch1.pageY * window.devicePixelRatio, x = touch2.pageX * window.devicePixelRatio - touch1.pageX * window.devicePixelRatio;
                        return Math.atan2(y, x) * 180 / Math.PI;
                    };
                    TouchInputDelegator.prototype.getMiddle = function (touches) {
                        var xCollect = 0;
                        var yCollect = 0;
                        for (var touchIndex = 0; touchIndex < touches.length; touchIndex++) {
                            var current = touches[touchIndex];
                            xCollect += current.clientX * window.devicePixelRatio;
                            yCollect += current.clientY * window.devicePixelRatio;
                        }
                        return new Position2D(xCollect / touches.length, yCollect / touches.length);
                    };
                    TouchInputDelegator.prototype.getDistance = function (touches) {
                        var distCollect = 0;
                        for (var touchIndex = 0; touchIndex < touches.length; touchIndex++) {
                            var current = touches[touchIndex];
                            var lastElem = touches[touchIndex - 1];
                            if (typeof lastElem !== "undefined" && lastElem != null) {
                                var distance = Math.sqrt(Math.pow(current.clientX - lastElem.clientX, 2) + Math.pow(current.clientY - lastElem.clientY, 2));
                                distCollect += distance;
                            }
                        }
                        return distCollect;
                    };
                    TouchInputDelegator.prototype.getVelocity = function (deltaTime, delta) {
                        return new MoveVector(Math.abs(delta.x / deltaTime) || 0, Math.abs(delta.y / deltaTime) || 0);
                    };
                    TouchInputDelegator.prototype.delete = function () {
                        this.listener.forEach(function (handler) {
                            handler.surface.removeEventListener(handler.type, handler.fn);
                        });
                    };
                    return TouchInputDelegator;
                }());
                canvas.TouchInputDelegator = TouchInputDelegator;
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
            var events;
            (function (events) {
                var ViewportInitializedEvent = (function (_super) {
                    __extends(ViewportInitializedEvent, _super);
                    function ViewportInitializedEvent(component, viewport) {
                        _super.call(this, component, ViewportInitializedEvent.TYPE);
                        this.viewport = viewport;
                    }
                    ViewportInitializedEvent.TYPE = "ViewportInitializedEvent";
                    return ViewportInitializedEvent;
                }(events.MyCoReImageViewerEvent));
                events.ViewportInitializedEvent = ViewportInitializedEvent;
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
            var RequestTextContentEvent = mycore.viewer.components.events.RequestTextContentEvent;
            var MyCoReImageScrollComponent = (function (_super) {
                __extends(MyCoReImageScrollComponent, _super);
                function MyCoReImageScrollComponent(_settings, _container) {
                    var _this = this;
                    _super.call(this);
                    this._settings = _settings;
                    this._container = _container;
                    this._pageLayout = null;
                    this._pageController = new mycore.viewer.widgets.canvas.PageController(true);
                    this._hrefImageMap = new MyCoReMap();
                    this._hrefPageMap = new MyCoReMap();
                    this._orderImageMap = new MyCoReMap();
                    this._orderPageMap = new MyCoReMap();
                    this._hrefPageLoadingMap = new MyCoReMap();
                    this._structureImages = null;
                    this._languageModel = null;
                    this._desktopDelegators = new Array();
                    this._touchDelegators = new Array();
                    this._permalinkState = null;
                    this._imageView = new viewer.widgets.canvas.PageView(true, false);
                    this._altoView = new viewer.widgets.canvas.PageView(true, true);
                    this._componentContent = jQuery("<div></div>");
                    this._viewMode = "imageView";
                    this._layouts = new Array();
                    this._rotation = 0;
                    this._layoutModel = { children: this._orderPageMap, hrefImageMap: this._hrefImageMap, pageCount: 1 };
                    this._pageLoader = function (order) {
                        if (_this._orderImageMap.has(order)) {
                            _this.loadPageIfNotPresent(_this._orderImageMap.get(order).href, order);
                        }
                        else {
                            _this.loadPageIfNotPresent(_this._settings.filePath, order);
                        }
                    };
                    this.pageWidth = 2480;
                    this.pageHeight = 3508;
                }
                MyCoReImageScrollComponent.prototype.init = function () {
                    var _this = this;
                    this.changeImage(this._settings.filePath, false);
                    this.trigger(new components.events.ComponentInitializedEvent(this));
                    this.trigger(new components.events.WaitForEvent(this, components.events.StructureModelLoadedEvent.TYPE));
                    this.trigger(new components.events.WaitForEvent(this, components.events.ShowContentEvent.TYPE));
                    this.trigger(new components.events.WaitForEvent(this, components.events.ProvideToolbarModelEvent.TYPE));
                    this.trigger(new components.events.ViewportInitializedEvent(this, this._pageController.viewport));
                    var componentContent = this._componentContent;
                    componentContent.css({
                        position: "absolute",
                        top: "0px",
                        left: "0px",
                        right: this._settings.mobile ? "0px" : "15px",
                        bottom: "15px"
                    });
                    this.initMainView();
                    var overviewEnabled = Utils.getVar(this._settings, "canvas.overview.enabled", true);
                    if (!this._settings.mobile) {
                        if (overviewEnabled) {
                            componentContent.append(this._pageController._overview.container);
                        }
                        this._pageController._overview.initEventHandler();
                        componentContent = componentContent.add(this._horizontalScrollbar.scrollbarElement);
                        componentContent = componentContent.add(this._verticalScrollbar.scrollbarElement);
                        componentContent = componentContent.add(this._toggleButton);
                        this.initOverview(overviewEnabled);
                    }
                    jQuery(componentContent).bind("iviewResize", function () {
                        _this._horizontalScrollbar.resized();
                        _this._verticalScrollbar.resized();
                        _this._pageController.update();
                    });
                    this._pageController.viewport.positionProperty.addObserver({
                        propertyChanged: function (old, newPosition) {
                            _this.update();
                        }
                    });
                    this._pageController.viewport.scaleProperty.addObserver({
                        propertyChanged: function (old, newScale) {
                        }
                    });
                    this.trigger(new components.events.ShowContentEvent(this, componentContent, components.events.ShowContentEvent.DIRECTION_CENTER));
                };
                MyCoReImageScrollComponent.prototype.initOverview = function (overviewEnabled) {
                    if (overviewEnabled) {
                        var overviewContainer = this._pageController._overview.container;
                        var minVisibleSize = parseInt(Utils.getVar(this._settings, "canvas.overview.minVisibleSize", MyCoReImageScrollComponent.DEFAULT_CANVAS_OVERVIEW_MIN_VISIBLE_SIZE, function (value) {
                            return !isNaN(value * 1) && parseInt(value, 10) > 1;
                        }), 10);
                        var iconChild = this._toggleButton.children(".glyphicon");
                        if (this._container.width() < minVisibleSize) {
                            jQuery(overviewContainer).hide();
                            iconChild.addClass(MyCoReImageScrollComponent.OVERVIEW_VISIBLE_ICON);
                        }
                        else {
                            iconChild.addClass(MyCoReImageScrollComponent.OVERVIEW_INVISIBLE_ICON);
                        }
                        this._toggleButton.click(function () {
                            if (jQuery(overviewContainer).is(":visible")) {
                                jQuery(overviewContainer).hide();
                                iconChild.addClass(MyCoReImageScrollComponent.OVERVIEW_VISIBLE_ICON);
                                iconChild.removeClass(MyCoReImageScrollComponent.OVERVIEW_INVISIBLE_ICON);
                            }
                            else {
                                jQuery(overviewContainer).show();
                                iconChild.addClass(MyCoReImageScrollComponent.OVERVIEW_INVISIBLE_ICON);
                                iconChild.removeClass(MyCoReImageScrollComponent.OVERVIEW_VISIBLE_ICON);
                            }
                        });
                    }
                    else {
                        this._toggleButton.addClass("disabled");
                    }
                };
                MyCoReImageScrollComponent.prototype.initMainView = function () {
                    var _this = this;
                    this.registerDesktopInputHandler(new DesktopInputHandler(this));
                    this.registerTouchInputHandler(new TouchInputHandler(this));
                    if (!this._settings.mobile) {
                        this._horizontalScrollbar = new viewer.widgets.canvas.Scrollbar(true);
                        this._verticalScrollbar = new viewer.widgets.canvas.Scrollbar(false);
                        this._toggleButton = jQuery("<div class='overViewToggle'><div class=\"glyphicon\"></div></div>");
                        this._pageController.viewport.sizeProperty.addObserver({
                            propertyChanged: function (_old, _new) {
                                _this._horizontalScrollbar.update();
                                _this._verticalScrollbar.update();
                            }
                        });
                        this._horizontalScrollbar.scrollHandler = this._verticalScrollbar.scrollHandler = function () {
                            _this._pageLayout.scrollhandler();
                        };
                        this._pageController._overview = new viewer.widgets.canvas.Overview(this._pageController.viewport);
                    }
                    this._componentContent.append(this._imageView.container);
                    this._imageView.container.addClass("mainView");
                    this._imageView.container.css({ left: "0px", right: "0px" });
                    this._componentContent.addClass("grabbable");
                    this._altoView.container.addClass("secondView");
                    this._altoView.container.css({ left: "50%", right: "0px" });
                    this._altoView.container.css({
                        "border-left": "1px solid black"
                    });
                    this._pageController.views.push(this._imageView);
                    if (this._settings.doctype == 'pdf') {
                        var textRenderer = new viewer.widgets.canvas.TextRenderer(this._pageController.viewport, this._pageController.getPageArea(), this._imageView, function (page, contentProvider) {
                            _this.trigger(new RequestTextContentEvent(_this, page.id, function (id, model) {
                                contentProvider(model);
                            }));
                        }, function (href) {
                            _this.changeImage(href, true);
                        });
                        this._pageController.textRenderer = textRenderer;
                    }
                };
                MyCoReImageScrollComponent.prototype.setViewMode = function (mode) {
                    var _this = this;
                    var remove = function (view) {
                        var index = _this._pageController.views.indexOf(view);
                        if (index != -1) {
                            _this._pageController.views.splice(index, 1);
                        }
                        view.container.detach();
                    };
                    var add = function (view) {
                        if (_this._pageController.views.indexOf(view) == -1) {
                            _this._pageController.views.push(view);
                        }
                        if (view.container.parent() != _this._componentContent) {
                            _this._componentContent.append(view.container);
                        }
                    };
                    this._viewMode = mode;
                    if (mode == 'imageView') {
                        this._imageView.container.css({ "left": "0px", "right": "0px" });
                        remove(this._altoView);
                        add(this._imageView);
                        this.setSelectableButtonEnabled(false);
                    }
                    else if (mode == 'mixedView') {
                        this._imageView.container.css({ "left": "0px", "right": "50%" });
                        this._altoView.container.css({ "left": "50%", "right": "0px" });
                        add(this._altoView);
                        add(this._imageView);
                        this.setSelectableButtonEnabled(true);
                    }
                    else if (mode == 'textView') {
                        this._altoView.container.css({ "left": "0px", "right": "0px" });
                        remove(this._imageView);
                        add(this._altoView);
                        this.setSelectableButtonEnabled(true);
                    }
                    else {
                        console.warn("unknown view mode: " + mode);
                    }
                    this._pageController.update();
                    this.updateToolbarLabel();
                };
                MyCoReImageScrollComponent.prototype.changeImage = function (image, extern) {
                    if (this._currentImage != image) {
                        this._currentImage = image;
                        var imageObj = this._hrefImageMap.get(image);
                        if (extern) {
                            this._pageLayout.jumpToPage(imageObj.order);
                        }
                        this.trigger(new components.events.ImageChangedEvent(this, imageObj));
                    }
                    if (this._settings.mobile) {
                        this.trigger(new components.events.ShowContentEvent(this, jQuery(this._componentContent), components.events.ShowContentEvent.DIRECTION_CENTER));
                    }
                };
                MyCoReImageScrollComponent.prototype.fitViewportOverPage = function () {
                    this._pageLayout.fitToScreen();
                };
                MyCoReImageScrollComponent.prototype.fitViewerportOverPageWidth = function () {
                    this._pageLayout.fitToWidth();
                };
                Object.defineProperty(MyCoReImageScrollComponent.prototype, "handlesEvents", {
                    get: function () {
                        var handleEvents = [];
                        handleEvents.push(mycore.viewer.widgets.toolbar.events.ButtonPressedEvent.TYPE);
                        handleEvents.push(mycore.viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE);
                        handleEvents.push(mycore.viewer.components.events.ImageSelectedEvent.TYPE);
                        handleEvents.push(components.events.StructureModelLoadedEvent.TYPE);
                        handleEvents.push(components.events.RequestStateEvent.TYPE);
                        handleEvents.push(components.events.RestoreStateEvent.TYPE);
                        handleEvents.push(components.events.ShowContentEvent.TYPE);
                        handleEvents.push(components.events.LanguageModelLoadedEvent.TYPE);
                        handleEvents.push(components.events.ProvideToolbarModelEvent.TYPE);
                        handleEvents.push(components.events.ProvidePageLayoutEvent.TYPE);
                        handleEvents.push(components.events.RequestDesktopInputEvent.TYPE);
                        handleEvents.push(components.events.RequestTouchInputEvent.TYPE);
                        handleEvents.push(components.events.AddCanvasPageLayerEvent.TYPE);
                        handleEvents.push(components.events.RedrawEvent.TYPE);
                        handleEvents.push(components.events.TextEditEvent.TYPE);
                        return handleEvents;
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReImageScrollComponent.prototype.previousImage = function () {
                    this._pageLayout.previous();
                    this.update();
                };
                MyCoReImageScrollComponent.prototype.nextImage = function () {
                    this._pageLayout.next();
                    this.update();
                };
                MyCoReImageScrollComponent.prototype.getPageController = function () {
                    return this._pageController;
                };
                MyCoReImageScrollComponent.prototype.getPageLayout = function () {
                    return this._pageLayout;
                };
                MyCoReImageScrollComponent.prototype.getRotation = function () {
                    return this._rotation;
                };
                MyCoReImageScrollComponent.prototype.setRotation = function (rotation) {
                    this._rotation = rotation;
                };
                MyCoReImageScrollComponent.prototype.changePageLayout = function (pageLayout) {
                    if (this._pageLayout != null) {
                        this._pageLayout.clear();
                        var page = this._pageLayout.getCurrentPage();
                    }
                    this._pageLayout = pageLayout;
                    if (isNaN(page)) {
                        var page = 1;
                        this._layoutModel.pageCount = 1;
                    }
                    this._pageLayout.jumpToPage(page);
                    this._pageLayout.rotate(this._rotation);
                    this.update();
                    this.trigger(new components.events.PageLayoutChangedEvent(this, this._pageLayout));
                };
                MyCoReImageScrollComponent.prototype.loadPageIfNotPresent = function (imageHref, order) {
                    var _this = this;
                    if (!this._hrefPageMap.has(imageHref) &&
                        (!this._hrefPageLoadingMap.has(imageHref) || !this._hrefPageLoadingMap.get(imageHref))) {
                        this._hrefPageLoadingMap.set(imageHref, true);
                        var textHref = null;
                        if (this._hrefImageMap.has(imageHref)) {
                            var additionalHrefs = this._imageByHref(imageHref).additionalHrefs;
                            if (additionalHrefs.has(MyCoReImageScrollComponent.ALTO_TEXT_HREF)) {
                                textHref = additionalHrefs.get(MyCoReImageScrollComponent.ALTO_TEXT_HREF);
                            }
                            else if (additionalHrefs.has(MyCoReImageScrollComponent.PDF_TEXT_HREF)) {
                                textHref = additionalHrefs.get(MyCoReImageScrollComponent.PDF_TEXT_HREF);
                            }
                        }
                        this.trigger(new components.events.RequestPageEvent(this, imageHref, function (href, page) {
                            _this._hrefPageMap.set(href, page);
                            if (_this._hrefImageMap.has(href)) {
                                _this._orderPageMap.set(_this._hrefImageMap.get(href).order, page);
                            }
                            else {
                                _this._orderPageMap.set(1, page);
                            }
                            _this.update();
                        }, textHref));
                    }
                };
                MyCoReImageScrollComponent.prototype.restorePermalink = function () {
                    var state = this._permalinkState;
                    if (state.has("layout")) {
                        var layout = state.get("layout");
                        var layoutObjects = this._layouts.filter(function (l) { return l.getLabelKey() == layout; });
                        if (layoutObjects.length != 1) {
                            console.log("no matching layout found!");
                        }
                        else {
                            this.changePageLayout(layoutObjects[0]);
                        }
                    }
                    if (state.has("page")) {
                        var page = +state.get("page");
                        this._pageLayout.jumpToPage(page);
                    }
                    if (state.has("rotation")) {
                        var rot = +state.get("rotation");
                        this._rotation = rot;
                        this._pageLayout.rotate(rot);
                    }
                    if (state.has("scale")) {
                        this._pageController.viewport.scale = +state.get("scale");
                    }
                    if (state.has("x") && state.has("y")) {
                        this._pageLayout.setCurrentPositionInPage(new Position2D(+state.get("x"), +state.get("y")));
                    }
                    this._permalinkState = null;
                };
                MyCoReImageScrollComponent.prototype.handle = function (e) {
                    var _this = this;
                    if (e.type == components.events.ProvideToolbarModelEvent.TYPE) {
                        var ptme = e;
                        this._rotateButton = ptme.model._rotateButton;
                        this._layoutToolbarButton = ptme.model._layoutDropdownButton;
                        this._toolbarModel = ptme.model;
                        if (!this._settings.mobile) {
                            if ("addViewSelectButton" in ptme.model || "addSelectionSwitchButton" in ptme.model) {
                                this._enableAltoSpecificButtons = function () {
                                    if ("addViewSelectButton" in ptme.model) {
                                        ptme.model.addViewSelectButton();
                                        _this._viewSelectButton = ptme.model.viewSelect;
                                    }
                                    if ("addSelectionSwitchButton" in ptme.model) {
                                        ptme.model.addSelectionSwitchButton();
                                        _this._selectionSwitchButton = ptme.model.selectionSwitchButton;
                                    }
                                    _this.updateToolbarLabel();
                                };
                            }
                        }
                    }
                    if (e.type == components.events.LanguageModelLoadedEvent.TYPE) {
                        var lmle = e;
                        this._languageModel = lmle.languageModel;
                        this.updateToolbarLabel();
                    }
                    if (e.type == mycore.viewer.widgets.toolbar.events.ButtonPressedEvent.TYPE) {
                        var buttonPressedEvent = e;
                        if (buttonPressedEvent.button.id == "PreviousImageButton") {
                            this.previousImage();
                        }
                        if (buttonPressedEvent.button.id == "NextImageButton") {
                            this.nextImage();
                        }
                        if (buttonPressedEvent.button.id == "ZoomInButton") {
                            this._pageController.viewport.startAnimation(new viewer.widgets.canvas.ZoomAnimation(this._pageController.viewport, 2));
                        }
                        if (buttonPressedEvent.button.id == "ZoomOutButton") {
                            this._pageController.viewport.startAnimation(new viewer.widgets.canvas.ZoomAnimation(this._pageController.viewport, 1 / 2));
                        }
                        if (buttonPressedEvent.button.id == "ZoomWidthButton") {
                            this.fitViewerportOverPageWidth();
                        }
                        if (buttonPressedEvent.button.id == "ZoomFitButton") {
                            this.fitViewportOverPage();
                        }
                        if (buttonPressedEvent.button.id == "RotateButton") {
                            if (!buttonPressedEvent.button.disabled) {
                                if (this._rotation == 270) {
                                    this._rotation = 0;
                                    this._pageLayout.rotate(0);
                                }
                                else {
                                    this._pageLayout.rotate(this._rotation += 90);
                                }
                            }
                        }
                        if (buttonPressedEvent.button.id == "selectionSwitchButton") {
                            if (!buttonPressedEvent.button.active) {
                                this.setAltoSelectable(true);
                            }
                            else {
                                this.setAltoSelectable(false);
                            }
                        }
                    }
                    if (e.type == components.events.ProvidePageLayoutEvent.TYPE) {
                        var pple = e;
                        this.addLayout(pple.pageLayout);
                        if (pple.isDefault) {
                            this.changePageLayout(pple.pageLayout);
                        }
                    }
                    if (e.type == viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE) {
                        var dbpe = e;
                        if (dbpe.button.id == 'LayoutDropdownButton') {
                            this._layouts.filter(function (e) { return e.getLabelKey() == dbpe.childId; }).forEach(function (layout) {
                                _this.changePageLayout(layout);
                                _this.updateToolbarLabel();
                            });
                        }
                        else if (dbpe.button.id == 'viewSelect') {
                            this.setViewMode(dbpe.childId);
                            this.updateToolbarLabel();
                        }
                    }
                    if (e.type == mycore.viewer.components.events.ImageSelectedEvent.TYPE) {
                        var imageSelectedEvent = e;
                        this.changeImage(imageSelectedEvent.image.href, true);
                    }
                    if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                        var structureModelLodedEvent = e;
                        this._structureImages = structureModelLodedEvent.structureModel.imageList;
                        if ("defaultPageDimension" in structureModelLodedEvent.structureModel) {
                            this.pageWidth = structureModelLodedEvent.structureModel.defaultPageDimension.width;
                            this.pageHeight = structureModelLodedEvent.structureModel.defaultPageDimension.height;
                        }
                        this._structureModelLoaded();
                        this.changeImage(this._currentImage, false);
                        this.update();
                    }
                    if (e.type == components.events.RequestStateEvent.TYPE) {
                        var requestStateEvent = e;
                        var state = requestStateEvent.stateMap;
                        if (requestStateEvent.deepState) {
                            var middle = this._pageLayout.getCurrentPositionInPage();
                            state.set("x", middle.x.toString(10));
                            state.set("y", middle.y.toString(10));
                            state.set("scale", this._pageController.viewport.scale.toString(10));
                            state.set("rotation", this._rotation.toString(10));
                            state.set("layout", this._pageLayout.getLabelKey());
                        }
                        state.set("page", this._orderImageMap.get(this._pageLayout.getCurrentPage()).href);
                        state.set("derivate", this._settings.derivate);
                    }
                    if (e.type == components.events.RequestDesktopInputEvent.TYPE) {
                        var requestInputEvent = e;
                        this.registerDesktopInputHandler(requestInputEvent.listener);
                    }
                    if (e.type == components.events.RequestTouchInputEvent.TYPE) {
                        var requestInputEvent = e;
                        this.registerTouchInputHandler(requestInputEvent.listener);
                    }
                    if (e.type == components.events.RestoreStateEvent.TYPE) {
                        var rste = e;
                        this._permalinkState = rste.restoredState;
                    }
                    if (e.type == components.events.AddCanvasPageLayerEvent.TYPE) {
                        var acple = e;
                        this._pageController.addCanvasPageLayer(acple.zIndex, acple.canvasPageLayer);
                    }
                    if (e.type == components.events.RedrawEvent.TYPE) {
                        this._pageController.update();
                    }
                    if (e.type === components.events.TextEditEvent.TYPE) {
                        var tee = e;
                        if (tee.component !== this) {
                            this.setAltoOnTop(tee.edit);
                            if (tee.edit && this._viewMode == 'imageView') {
                                this.setViewMode("mixedView");
                            }
                        }
                    }
                };
                MyCoReImageScrollComponent.prototype.setAltoOnTop = function (onTop) {
                    this.setAltoSelectable(false);
                    if (onTop) {
                        this._altoView.container.addClass("altoTop");
                        this._selectionSwitchButton.disabled = true;
                    }
                    else {
                        this._altoView.container.removeClass("altoTop");
                        this._selectionSwitchButton.disabled = false;
                    }
                };
                MyCoReImageScrollComponent.prototype.isAltoSelectable = function () {
                    return this._selectionSwitchButton != null && this._selectionSwitchButton.active;
                };
                MyCoReImageScrollComponent.prototype.setAltoSelectable = function (selectable) {
                    this._selectionSwitchButton.active = selectable;
                    jQuery("[data-id='selectionSwitchButton']").blur();
                    this._altoView.container.removeClass("altoTop");
                    if (selectable) {
                        this._altoView.container.addClass("altoSelectable");
                    }
                    else {
                        this._altoView.container.removeClass("altoSelectable");
                    }
                    viewerClearTextSelection();
                };
                MyCoReImageScrollComponent.prototype.setSelectableButtonEnabled = function (enabled) {
                    if (enabled) {
                        if (this._toolbarModel._actionControllGroup.getComponents().indexOf(this._selectionSwitchButton) == -1) {
                            this._toolbarModel._actionControllGroup.addComponent(this._selectionSwitchButton);
                        }
                    }
                    else {
                        if (this._toolbarModel._actionControllGroup.getComponents().indexOf(this._selectionSwitchButton) != -1) {
                            this._toolbarModel._actionControllGroup.removeComponent(this._selectionSwitchButton);
                        }
                    }
                };
                MyCoReImageScrollComponent.prototype.addLayout = function (layout) {
                    this._layouts.push(layout);
                    layout.init(this._layoutModel, this._pageController, new Size2D(this.pageWidth, this.pageHeight), this._horizontalScrollbar, this._verticalScrollbar, this._pageLoader);
                    this.synchronizeLayoutToolbarButton();
                };
                MyCoReImageScrollComponent.prototype.synchronizeLayoutToolbarButton = function () {
                    var _this = this;
                    var changed = false;
                    this._layouts.forEach(function (layout) {
                        var id = layout.getLabelKey();
                        var childrenWithId = _this._layoutToolbarButton.children.filter(function (c) { return c.id == id; });
                        if (childrenWithId.length == 0) {
                            _this._layoutToolbarButton.children.push({
                                id: id,
                                label: id
                            });
                            changed = true;
                        }
                    });
                    if (changed) {
                        this._layoutToolbarButton.children = this._layoutToolbarButton.children;
                        this.updateToolbarLabel();
                    }
                };
                MyCoReImageScrollComponent.prototype.updateToolbarLabel = function () {
                    var _this = this;
                    if (this._languageModel != null) {
                        if (this._layoutToolbarButton != null) {
                            this._layoutToolbarButton.children.forEach(function (e) {
                                e.label = _this._languageModel.getTranslation("layout." + e.id);
                            });
                            this._layoutToolbarButton.children = this._layoutToolbarButton.children;
                            if (this._pageLayout != null) {
                                this._layoutToolbarButton.label = this._languageModel.getTranslation("layout." + this._pageLayout.getLabelKey());
                            }
                        }
                        if (this._viewSelectButton != null) {
                            this._viewSelectButton.label = this._languageModel.getTranslation("view." + this._viewMode);
                            this._viewSelectButton.children.forEach(function (child) {
                                child.label = _this._languageModel.getTranslation("view." + child.id);
                            });
                            this._viewSelectButton.children = this._viewSelectButton.children;
                        }
                    }
                };
                MyCoReImageScrollComponent.prototype.update = function () {
                    if (this._pageLayout == null) {
                        return;
                    }
                    var newImageOrder = this._pageLayout.getCurrentPage();
                    this._pageLayout.syncronizePages();
                    if (!this._settings.mobile) {
                        this._pageController._overview.overviewRect = this._pageLayout.getCurrentOverview();
                    }
                    if (typeof newImageOrder == "undefined" || !this._orderImageMap.has(newImageOrder)) {
                        return;
                    }
                    this.changeImage(this._orderImageMap.get(newImageOrder).href, false);
                };
                MyCoReImageScrollComponent.prototype._structureModelLoaded = function () {
                    var altoPresent = false;
                    for (var imageIndex in this._structureImages) {
                        var image = this._structureImages[imageIndex];
                        this._hrefImageMap.set(image.href, image);
                        this._orderImageMap.set(image.order, image);
                        altoPresent = altoPresent || image.additionalHrefs.has("AltoHref");
                    }
                    if (this._orderPageMap.has(1)) {
                        var firstPage = this._orderPageMap.get(1);
                        this._orderPageMap.remove(1);
                        var img = this._hrefImageMap.get(this._settings.filePath);
                        this._orderPageMap.set(img.order, firstPage);
                    }
                    this.initPageLayouts();
                    if (altoPresent && !this._settings.mobile) {
                        this._enableAltoSpecificButtons();
                    }
                };
                MyCoReImageScrollComponent.prototype.initPageLayouts = function () {
                    var key = this._settings.filePath;
                    var position = this._pageLayout.getCurrentPositionInPage();
                    var scale = this._pageController.viewport.scale;
                    this._pageController.viewport.stopAnimation();
                    this._desktopDelegators.forEach(function (delegator) { return delegator.clearRunning(); });
                    this._touchDelegators.forEach(function (delegator) { return delegator.clearRunning(); });
                    if (!this._settings.mobile) {
                        this._horizontalScrollbar.clearRunning();
                        this._verticalScrollbar.clearRunning();
                    }
                    this._pageLayout.clear();
                    this._layoutModel.pageCount = this._structureImages.length;
                    var order;
                    if (this._hrefImageMap.has(key)) {
                        order = this._hrefImageMap.get(key).order;
                    }
                    else {
                        var url = ViewerParameterMap.fromCurrentUrl();
                        if (url.has("page")) {
                            order = parseInt(url.get("page"));
                        }
                        else {
                            order = 1;
                        }
                    }
                    if (this._pageLayout == null) {
                        throw "no default page layout found";
                    }
                    this._pageLayout.jumpToPage(order);
                    this._pageController.viewport.scale = scale;
                    this._pageLayout.setCurrentPositionInPage(position);
                    this._pageController._updateSizeIfChanged();
                    if (Utils.getVar(this._settings, "canvas.startup.fitWidth", false)) {
                        this._pageLayout.fitToWidth(true);
                    }
                    else {
                        this._pageLayout.fitToScreen();
                    }
                    this.trigger(new components.events.WaitForEvent(this, components.events.RestoreStateEvent.TYPE));
                    if (this._permalinkState != null) {
                        this.restorePermalink();
                    }
                    var image = this._orderImageMap.get(this._pageLayout.getCurrentPage());
                    this.trigger(new components.events.ImageChangedEvent(this, image));
                };
                MyCoReImageScrollComponent.prototype._imageByHref = function (href) {
                    return this._hrefImageMap.get(href);
                };
                MyCoReImageScrollComponent.prototype.registerDesktopInputHandler = function (listener) {
                    this._desktopDelegators.push(new viewer.widgets.canvas.DesktopInputDelegator(jQuery(this._imageView.container), this._pageController.viewport, listener));
                    this._desktopDelegators.push(new viewer.widgets.canvas.DesktopInputDelegator(jQuery(this._altoView.container), this._pageController.viewport, listener));
                };
                MyCoReImageScrollComponent.prototype.registerTouchInputHandler = function (listener) {
                    this._touchDelegators.push(new viewer.widgets.canvas.TouchInputDelegator(jQuery(this._imageView.container), this._pageController.viewport, listener));
                    this._touchDelegators.push(new viewer.widgets.canvas.TouchInputDelegator(jQuery(this._altoView.container), this._pageController.viewport, listener));
                };
                MyCoReImageScrollComponent.ALTO_TEXT_HREF = "AltoHref";
                MyCoReImageScrollComponent.PDF_TEXT_HREF = "pdfText";
                MyCoReImageScrollComponent.DEFAULT_CANVAS_OVERVIEW_MIN_VISIBLE_SIZE = "800";
                MyCoReImageScrollComponent.OVERVIEW_VISIBLE_ICON = "glyphicon-triangle-top";
                MyCoReImageScrollComponent.OVERVIEW_INVISIBLE_ICON = "glyphicon-triangle-bottom";
                return MyCoReImageScrollComponent;
            }(components.ViewerComponent));
            components.MyCoReImageScrollComponent = MyCoReImageScrollComponent;
            var TouchInputHandler = (function (_super) {
                __extends(TouchInputHandler, _super);
                function TouchInputHandler(component) {
                    _super.call(this);
                    this.component = component;
                    this._touchAdditionalScaleMove = null;
                    this._sessionStartRotation = 0;
                }
                TouchInputHandler.prototype.touchStart = function (session) {
                    this._touchAdditionalScaleMove = new MoveVector(0, 0);
                    this.component.getPageController().viewport.stopAnimation();
                };
                TouchInputHandler.prototype.touchMove = function (session) {
                    var viewPort = this.component.getPageController().viewport;
                    if (!session.touchLeft) {
                        if (session.touches == 2 && session.startDistance > 150 && session.currentMove.distance > 150) {
                            var diff = session.currentMove.angle - session.startAngle;
                            var fullNewAngle = (360 * 2 + (this._sessionStartRotation + diff)) % 360;
                            var result = Math.round(fullNewAngle / 90) * 90;
                            result = (result == 360) ? 0 : result;
                            if (this.component.getRotation() != result) {
                                this.component.getPageLayout().rotate(result);
                                this.component.setRotation(result);
                            }
                        }
                        if (session.startDistance != 0 && session.currentMove.distance != 0 && session.touches > 1) {
                            var lastDistance = 0;
                            if (session.lastMove == null || session.lastMove.distance == 0) {
                                lastDistance = session.startDistance;
                            }
                            else {
                                lastDistance = session.lastMove.distance;
                            }
                            var relativeScale = session.currentMove.distance / lastDistance;
                            var touchMiddle = viewPort.getAbsolutePosition(session.currentMove.middle);
                            var positionTouchDifference = new MoveVector(viewPort.position.x - touchMiddle.x, viewPort.position.y - touchMiddle.y);
                            var newPositionTouchDifference = positionTouchDifference.scale(relativeScale);
                            var newPositionAfterScale = touchMiddle.move(newPositionTouchDifference);
                            this._touchAdditionalScaleMove = this._touchAdditionalScaleMove.move(new MoveVector(viewPort.position.x - newPositionAfterScale.x, viewPort.position.y - newPositionAfterScale.y));
                            viewPort.scale *= relativeScale;
                        }
                        var move = new MoveVector(-(session.currentMove.middle.x - session.startMiddle.x), -(session.currentMove.middle.y - session.startMiddle.y));
                        var rotation = viewPort.rotation;
                        var scale = viewPort.scale;
                        viewPort.position = session.canvasStartPosition.copy().scale(scale).move(move.rotate(rotation)).scale(1 / scale).move(this._touchAdditionalScaleMove);
                    }
                };
                TouchInputHandler.prototype.touchEnd = function (session) {
                    var viewPort = this.component.getPageController().viewport;
                    if (session.currentMove != null) {
                        if (session.currentMove.velocity.x != 0 || session.currentMove.velocity.y != 0) {
                            var anim = new viewer.widgets.canvas.VelocityScrollAnimation(this.component.getPageController().viewport, session.currentMove.velocity);
                            this.component.getPageController().viewport.startAnimation(anim);
                        }
                    }
                    if (session.lastSession != null) {
                        if (session.startTime - session.lastSession.startTime < 200) {
                            var currentMiddle = session.startMiddle;
                            var newPosition = viewPort.getAbsolutePosition(currentMiddle);
                            viewPort.startAnimation(new viewer.widgets.canvas.ZoomAnimation(viewPort, 2, newPosition, 500));
                        }
                        else {
                            if (session.canvasStartPosition.equals(this.component.getPageController().viewport.position)) {
                            }
                        }
                    }
                    this._sessionStartRotation = this.component.getRotation();
                };
                return TouchInputHandler;
            }(viewer.widgets.canvas.TouchInputAdapter));
            var DesktopInputHandler = (function (_super) {
                __extends(DesktopInputHandler, _super);
                function DesktopInputHandler(component) {
                    _super.call(this);
                    this.component = component;
                }
                DesktopInputHandler.prototype.mouseDown = function (mousePosition, e) {
                    var container = this.component._componentContent;
                    container.addClass("grab");
                    container.removeClass("grabbable");
                };
                DesktopInputHandler.prototype.mouseUp = function (mousePosition, e) {
                    var container = this.component._componentContent;
                    container.addClass("grabbable");
                    container.removeClass("grab");
                };
                DesktopInputHandler.prototype.mouseDoubleClick = function (mousePosition) {
                    var vp = this.component.getPageController().viewport;
                    var position = vp.getAbsolutePosition(mousePosition);
                    vp.startAnimation(new viewer.widgets.canvas.ZoomAnimation(vp, 2, position));
                };
                DesktopInputHandler.prototype.mouseDrag = function (currentPosition, startPosition, startViewport) {
                    if (!this.component.isAltoSelectable()) {
                        var xMove = currentPosition.x - startPosition.x;
                        var yMove = currentPosition.y - startPosition.y;
                        var move = new MoveVector(-xMove, -yMove).rotate(this.component.getPageController().viewport.rotation);
                        this.component.getPageController().viewport.position = startViewport
                            .scale(this.component.getPageController().viewport.scale)
                            .move(move)
                            .scale(1 / this.component.getPageController().viewport.scale);
                    }
                };
                DesktopInputHandler.prototype.scroll = function (e) {
                    var zoomParameter = (ViewerParameterMap.fromCurrentUrl().get("iview2.scroll") == "zoom");
                    var zoom = (zoomParameter) ? !e.altKey || e.ctrlKey : e.altKey || e.ctrlKey;
                    var vp = this.component.getPageController().viewport;
                    if (zoom) {
                        var relative = Math.pow(0.95, (e.deltaY / 10));
                        if (typeof vp.currentAnimation != "undefined" && vp.currentAnimation != null) {
                            if (vp.currentAnimation instanceof viewer.widgets.canvas.ZoomAnimation) {
                                vp.currentAnimation.merge(relative);
                            }
                            else {
                                console.log("dont know howto merge animations");
                            }
                        }
                        else {
                            var position = vp.getAbsolutePosition(e.pos);
                            vp.startAnimation(new viewer.widgets.canvas.ZoomAnimation(vp, relative, position));
                        }
                    }
                    else {
                        vp.position = new Position2D(vp.position.x + (e.deltaX / vp.scale), vp.position.y + (e.deltaY / vp.scale));
                    }
                };
                DesktopInputHandler.prototype.keydown = function (e) {
                    switch (e.keyCode) {
                        case 33:
                            this.component.previousImage();
                            break;
                        case 34:
                            this.component.nextImage();
                            break;
                        default:
                    }
                };
                return DesktopInputHandler;
            }(viewer.widgets.canvas.DesktopInputAdapter));
        })(components = viewer.components || (viewer.components = {}));
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
                var ProvideLayerEvent = (function (_super) {
                    __extends(ProvideLayerEvent, _super);
                    function ProvideLayerEvent(component, layer) {
                        _super.call(this, component, ProvideLayerEvent.TYPE);
                        this.layer = layer;
                    }
                    ProvideLayerEvent.TYPE = "ProvideLayerEvent";
                    return ProvideLayerEvent;
                }(events.MyCoReImageViewerEvent));
                events.ProvideLayerEvent = ProvideLayerEvent;
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
            var layer;
            (function (layer_1) {
                var LayerDisplayModel = (function () {
                    function LayerDisplayModel() {
                        this.onLayerAdd = Array();
                        this.onLayerRemove = Array();
                        this.currentPage = null;
                        this.layerList = new Array();
                    }
                    LayerDisplayModel.prototype.addLayer = function (layer) {
                        if (this.layerList.indexOf(layer) != -1) {
                            throw "the layer " + layer.getId() + " is already in model!";
                        }
                        this.layerList.push(layer);
                        this.onLayerAdd.forEach(function (callback) { return callback(layer); });
                    };
                    LayerDisplayModel.prototype.removeLayer = function (layer) {
                        var layerIndex = this.layerList.indexOf(layer);
                        if (layerIndex == -1) {
                            throw "the layer " + layer.getId() + " is not present in model!";
                        }
                        this.layerList.splice(layerIndex, 1);
                        this.onLayerRemove.forEach(function (callback) { return callback(layer); });
                    };
                    LayerDisplayModel.prototype.getLayerList = function () {
                        return this.layerList.slice(0);
                    };
                    return LayerDisplayModel;
                }());
                layer_1.LayerDisplayModel = LayerDisplayModel;
            })(layer = widgets.layer || (widgets.layer = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var layer;
            (function (layer_2) {
                var LayerDisplayController = (function () {
                    function LayerDisplayController(_container, languageResolver) {
                        this._container = _container;
                        this.languageResolver = languageResolver;
                        this._layerIdViewMap = new MyCoReMap();
                        this._layerIdCallbackMap = new MyCoReMap();
                        this.model = new layer_2.LayerDisplayModel();
                        this.initializeView();
                        this.initializeModel();
                    }
                    LayerDisplayController.prototype.initializeView = function () {
                        this._view = jQuery("<div></div>");
                        this._view.addClass("layer-view");
                        this._view.appendTo(this._container);
                    };
                    LayerDisplayController.prototype.addLayerView = function (layer) {
                        var id = layer.getId();
                        var layerView;
                        if (!this._layerIdViewMap.has(id)) {
                            layerView = this.createLayerView(layer);
                        }
                        else {
                            layerView = this._layerIdViewMap.get(id);
                        }
                        this._view.append(layerView);
                    };
                    LayerDisplayController.prototype.createLayerView = function (layer) {
                        var id = layer.getId();
                        var label = this.languageResolver(layer.getLabel());
                        var layerView = jQuery("<div data-id='layer-" + id + "' class='layer'></div>");
                        var layerHeading = jQuery("<div class=\"layer-heading " + LayerDisplayController.REMOVE_EXCLUDE_CLASS + "\">" + label + "</div>");
                        layerHeading.appendTo(layerView);
                        this._layerIdViewMap.set(id, layerView);
                        return layerView;
                    };
                    LayerDisplayController.prototype.removeLayerView = function (layer) {
                        this.getLayerView(layer.getId()).detach();
                    };
                    LayerDisplayController.prototype.getLayerView = function (id) {
                        return this._layerIdViewMap.get(id);
                    };
                    LayerDisplayController.prototype.cleanLayerView = function (id) {
                        this._layerIdViewMap.get(id).children().not("." + LayerDisplayController.REMOVE_EXCLUDE_CLASS).detach();
                    };
                    LayerDisplayController.prototype.initializeModel = function () {
                        var _this = this;
                        this.model.onLayerAdd.push(function (layer) {
                            _this.addLayerView(layer);
                        });
                        this.model.onLayerRemove.push(function (layer) {
                            _this.removeLayerView(layer);
                        });
                    };
                    LayerDisplayController.prototype.addLayer = function (layer) {
                        this.model.addLayer(layer);
                        this.synchronizeView();
                    };
                    LayerDisplayController.prototype.removeLayer = function (layer) {
                        this.model.removeLayer(layer);
                        this.synchronizeView();
                    };
                    LayerDisplayController.prototype.getLayer = function () {
                        return this.model.getLayerList();
                    };
                    LayerDisplayController.prototype.pageChanged = function (newHref) {
                        this.model.currentPage = newHref;
                        this.synchronizeView();
                    };
                    LayerDisplayController.prototype.synchronizeView = function () {
                        var _this = this;
                        this.model.getLayerList().forEach(function (currentDisplayedLayer) {
                            var layerId = currentDisplayedLayer.getId();
                            _this.cleanLayerView(currentDisplayedLayer.getId());
                            var onResolve = function (success, content) {
                                if (success &&
                                    _this._layerIdCallbackMap.has(layerId) &&
                                    _this._layerIdCallbackMap.get(layerId) == onResolve) {
                                    content.find(".popupTrigger").each(function (i, popupTrigger) {
                                        var popup = jQuery(popupTrigger);
                                        popup.attr("data-placement", "bottom");
                                        popup.popover({
                                            html: true,
                                            content: function () {
                                                return popup.find(".popupBox").html();
                                            }
                                        });
                                    });
                                    _this.getLayerView(currentDisplayedLayer.getId()).append(content);
                                    _this._layerIdCallbackMap.remove(layerId);
                                }
                            };
                            if (_this._layerIdCallbackMap.has(layerId)) {
                                _this._layerIdCallbackMap.remove(layerId);
                            }
                            _this._layerIdCallbackMap.set(layerId, onResolve);
                            currentDisplayedLayer.resolveLayer(_this.model.currentPage, onResolve);
                        });
                    };
                    LayerDisplayController.REMOVE_EXCLUDE_CLASS = "rm-exclude";
                    return LayerDisplayController;
                }());
                layer_2.LayerDisplayController = LayerDisplayController;
            })(layer = widgets.layer || (widgets.layer = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReLayerComponent = (function (_super) {
                __extends(MyCoReLayerComponent, _super);
                function MyCoReLayerComponent(_settings) {
                    _super.call(this);
                    this._settings = _settings;
                    this.toolbarButtonSync = Utils.synchronize([function (me) { return me.toolbarButtonDisplayable(); },
                        function (me) { return me.dropDownButton == null; }], function (me) { return me.initToolbarButton(); });
                    this.layerSync = Utils.synchronize([function (me) { return me.toolbarButtonInitialized(); }], function (me) { return me.synchronizeLayers(); });
                    this.structureModel = null;
                    this.languageModel = null;
                    this.toolbarModel = null;
                    this.dropDownButton = null;
                    this.sidebarLabel = jQuery("<span>Ebenen</span>");
                    this.enabled = Utils.getVar(this._settings, "text.enabled", "true") === "true" && this._settings.mobile != true;
                    this.showLayerOnStart = Utils.getVar(this._settings, "text.showOnStart", []);
                }
                MyCoReLayerComponent.prototype.init = function () {
                    var _this = this;
                    if (this.enabled) {
                        this.container = jQuery("<div></div>");
                        this.container.css({ overflowY: "scroll", display: "block" });
                        this.container.addClass("tei");
                        this.container.addClass("layer-component");
                        this.container.bind("iviewResize", function () {
                            _this.updateContainerSize();
                        });
                        this.layerDisplay = new viewer.widgets.layer.LayerDisplayController(this.container, function (id) {
                            return _this.languageModel.getTranslation(id);
                        });
                        this.layerList = new Array();
                        this.layerIdLayerMap = new MyCoReMap();
                        this.trigger(new components.events.WaitForEvent(this, components.events.StructureModelLoadedEvent.TYPE));
                        this.trigger(new components.events.WaitForEvent(this, components.events.LanguageModelLoadedEvent.TYPE));
                        this.trigger(new components.events.WaitForEvent(this, components.events.ImageChangedEvent.TYPE));
                    }
                };
                MyCoReLayerComponent.prototype.updateContainerSize = function () {
                    this.container.css({ "height": this.container.parent().height() - this.sidebarLabel.parent().outerHeight() + "px" });
                    var containerSize = this.container.width();
                    var settingStore = ViewerUserSettingStore.getInstance();
                    if (containerSize > 50) {
                        settingStore.setValue(MyCoReLayerComponent.SIDEBAR_LAYER_SIZE, containerSize.toString());
                    }
                };
                Object.defineProperty(MyCoReLayerComponent.prototype, "handlesEvents", {
                    get: function () {
                        var handles = new Array();
                        if (this.enabled) {
                            handles.push(components.events.StructureModelLoadedEvent.TYPE);
                            handles.push(components.events.ImageChangedEvent.TYPE);
                            handles.push(components.events.ShowContentEvent.TYPE);
                            handles.push(mycore.viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE);
                            handles.push(components.events.LanguageModelLoadedEvent.TYPE);
                            handles.push(components.events.ProvideToolbarModelEvent.TYPE);
                            handles.push(components.events.ProvideLayerEvent.TYPE);
                        }
                        return handles;
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReLayerComponent.prototype.handle = function (e) {
                    var _this = this;
                    if (e.type == mycore.viewer.widgets.toolbar.events.DropdownButtonPressedEvent.TYPE) {
                        var dropdownButtonPressedEvent = e;
                        if (dropdownButtonPressedEvent.button.id == MyCoReLayerComponent.LAYER_DROPDOWN_ID) {
                            if (this.layerIdLayerMap.has(dropdownButtonPressedEvent.childId)) {
                                var transcriptionType = dropdownButtonPressedEvent.childId;
                                this.toggleTranscriptionContainer(transcriptionType);
                            }
                            else {
                                throw new ViewerError("Invalid button child pressed!");
                            }
                        }
                    }
                    if (e.type == components.events.ProvideLayerEvent.TYPE) {
                        var ple = e;
                        this.layerList.push(ple.layer);
                        var layerType = ple.layer.getId();
                        this.layerIdLayerMap.set(layerType, ple.layer);
                        this.toolbarButtonSync(this);
                        this.layerSync(this);
                        if (this.showLayerOnStart.length > 0) {
                            var priority = void 0;
                            if ((priority = this.showLayerOnStart.indexOf(layerType)) != -1) {
                                if (this.layerDisplay.getLayer().length != 0) {
                                    var activePriority = void 0;
                                    if ((activePriority = this.showLayerOnStart.indexOf(this.layerDisplay.getLayer()[0].getId())) != -1) {
                                        if (activePriority < priority) {
                                            return;
                                        }
                                    }
                                }
                                this.toggleTranscriptionContainer(layerType, true);
                            }
                        }
                    }
                    if (e.type == components.events.ShowContentEvent.TYPE) {
                        var sce = e;
                        if (sce.size == 0 && sce.containerDirection == components.events.ShowContentEvent.DIRECTION_EAST) {
                            if (this.dropDownButton != null) {
                                this.dropDownButton.children.forEach(function (child) {
                                    delete child.icon;
                                });
                                this.dropDownButton.children = this.dropDownButton.children;
                                this.layerDisplay.getLayer().forEach(function (s) {
                                    _this.layerDisplay.removeLayer(s);
                                });
                            }
                        }
                    }
                    if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                        var structureModelLoadedEvent = e;
                        this.structureModel = structureModelLoadedEvent.structureModel;
                        this.toolbarButtonSync(this);
                    }
                    if (e.type == components.events.ImageChangedEvent.TYPE) {
                        var imageChangedEvent = e;
                        if (typeof this.structureModel !== "undefined" && typeof imageChangedEvent.image != "undefined" && imageChangedEvent != null) {
                            this.currentHref = imageChangedEvent.image.href;
                            this.layerDisplay.pageChanged(this.currentHref);
                        }
                    }
                    if (e.type == components.events.LanguageModelLoadedEvent.TYPE) {
                        this.languageModel = e.languageModel;
                        this.toolbarButtonSync(this);
                    }
                    if (e.type == components.events.ProvideToolbarModelEvent.TYPE) {
                        var ptme = e;
                        this.toolbarModel = ptme.model;
                        this.toolbarButtonSync(this);
                    }
                };
                MyCoReLayerComponent.prototype.toggleTranscriptionContainer = function (transcriptionType, clear) {
                    var _this = this;
                    if (clear === void 0) { clear = false; }
                    var layer = this.layerIdLayerMap.get(transcriptionType);
                    if (this.layerDisplay.getLayer().indexOf(layer) == -1) {
                        this.layerDisplay.addLayer(layer);
                    }
                    else {
                        this.layerDisplay.removeLayer(layer);
                    }
                    if (clear) {
                        this.layerDisplay.getLayer().forEach(function (activeLayer) {
                            if (layer != activeLayer) {
                                _this.layerDisplay.removeLayer(activeLayer);
                            }
                        });
                    }
                    if (this.layerDisplay.getLayer().length > 0) {
                        this.showContainer();
                    }
                    else {
                        this.hideContainer();
                    }
                    this.synchronizeLayers();
                };
                MyCoReLayerComponent.prototype.showContainer = function () {
                    var settingStore = ViewerUserSettingStore.getInstance();
                    var hasValue = settingStore.hasValue(MyCoReLayerComponent.SIDEBAR_LAYER_SIZE);
                    var layerSize = hasValue ? parseInt(settingStore.getValue(MyCoReLayerComponent.SIDEBAR_LAYER_SIZE), 10) : null;
                    var direction = (this._settings.mobile) ? components.events.ShowContentEvent.DIRECTION_CENTER : components.events.ShowContentEvent.DIRECTION_EAST;
                    this.trigger(new components.events.ShowContentEvent(this, this.container, direction, hasValue ? layerSize : 400, this.sidebarLabel));
                    this.updateContainerSize();
                };
                MyCoReLayerComponent.prototype.hideContainer = function () {
                    var direction = (this._settings.mobile) ? components.events.ShowContentEvent.DIRECTION_CENTER : components.events.ShowContentEvent.DIRECTION_EAST;
                    this.trigger(new components.events.ShowContentEvent(this, null, direction, 0, null));
                };
                MyCoReLayerComponent.prototype.toolbarButtonInitialized = function () {
                    return this.dropDownButton != null;
                };
                MyCoReLayerComponent.prototype.toolbarButtonDisplayable = function () {
                    return this.languageModel != null && this.toolbarModel != null && this.layerList.length > 0;
                };
                MyCoReLayerComponent.prototype.initToolbarButton = function () {
                    this.dropDownButton = new viewer.widgets.toolbar.ToolbarDropdownButton(MyCoReLayerComponent.LAYER_DROPDOWN_ID, this.languageModel.getTranslation("toolbar.layerButton"), []);
                    this.toolbarModel._actionControllGroup.addComponent(this.dropDownButton);
                    this.layerSync(this);
                };
                MyCoReLayerComponent.prototype.synchronizeLayers = function () {
                    var _this = this;
                    var onlyIfNotInserted = function (layerInList) { return _this.dropDownButton.children.filter(function (layerInButton) {
                        return layerInButton.id == layerInList.getId();
                    }).length == 0; };
                    var newLayers = this.layerList.filter(onlyIfNotInserted);
                    newLayers.forEach(function (newLayer) {
                        var childLabelTranslation = _this.languageModel.getTranslation(newLayer.getLabel());
                        var dropDownChild = { id: newLayer.getId(), label: childLabelTranslation };
                        _this.dropDownButton.children.push(dropDownChild);
                    });
                    this.dropDownButton.children.forEach(function (buttonChildren) {
                        var hasLayer = _this.layerIdLayerMap.has(buttonChildren.id);
                        if (hasLayer) {
                            var isInserted = _this.layerDisplay.getLayer().indexOf(_this.layerIdLayerMap.get(buttonChildren.id)) != -1;
                            if (isInserted) {
                                buttonChildren.icon = "ok";
                            }
                            else {
                                if ("icon" in buttonChildren) {
                                    delete buttonChildren.icon;
                                }
                            }
                        }
                    });
                    this.dropDownButton.children = this.dropDownButton.children;
                };
                MyCoReLayerComponent.SIDEBAR_LAYER_SIZE = "SIDEBAR_LAYER_SIZE";
                MyCoReLayerComponent.LAYER_DROPDOWN_ID = "toolbar.LayerButton";
                return MyCoReLayerComponent;
            }(components.ViewerComponent));
            components.MyCoReLayerComponent = MyCoReLayerComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var components;
        (function (components) {
            var MyCoReButtonChangeComponent = (function (_super) {
                __extends(MyCoReButtonChangeComponent, _super);
                function MyCoReButtonChangeComponent(_settings) {
                    var _this = this;
                    _super.call(this);
                    this._settings = _settings;
                    this._nextImageButton = null;
                    this._previousImageButton = null;
                    this._structureModel = null;
                    this._currentImage = null;
                    this._checkAndDisableSynchronize = Utils.synchronize([
                        function (context) { return context._nextImageButton != null; },
                        function (context) { return context._previousImageButton != null; },
                        function (context) { return context._structureModel != null; },
                        function (context) { return context._currentImage != null; }
                    ], function (context) {
                        var positionOfImage = _this._structureModel._imageList.indexOf(_this._currentImage);
                        if (positionOfImage == 0) {
                            _this._previousImageButton.disabled = true;
                        }
                        else {
                            _this._previousImageButton.disabled = false;
                        }
                        if (positionOfImage == _this._structureModel.imageList.length - 1) {
                            _this._nextImageButton.disabled = true;
                        }
                        else {
                            _this._nextImageButton.disabled = false;
                        }
                    });
                }
                MyCoReButtonChangeComponent.prototype.init = function () {
                };
                Object.defineProperty(MyCoReButtonChangeComponent.prototype, "handlesEvents", {
                    get: function () {
                        var handles = new Array();
                        handles.push(components.events.StructureModelLoadedEvent.TYPE);
                        handles.push(components.events.ImageChangedEvent.TYPE);
                        handles.push(components.events.ProvideToolbarModelEvent.TYPE);
                        return handles;
                    },
                    enumerable: true,
                    configurable: true
                });
                MyCoReButtonChangeComponent.prototype.handle = function (e) {
                    if (e.type == components.events.ProvideToolbarModelEvent.TYPE) {
                        var ptme = e;
                        this._nextImageButton = ptme.model._nextImageButton;
                        this._previousImageButton = ptme.model._previousImageButton;
                        if (this._structureModel == null) {
                            this._nextImageButton.disabled = true;
                            this._previousImageButton.disabled = true;
                        }
                        this._checkAndDisableSynchronize(this);
                    }
                    if (e.type == components.events.StructureModelLoadedEvent.TYPE) {
                        var structureModelLoadedEvent = e;
                        this._structureModel = structureModelLoadedEvent.structureModel;
                        this._nextImageButton.disabled = false;
                        this._previousImageButton.disabled = false;
                        this._checkAndDisableSynchronize(this);
                    }
                    if (e.type == components.events.ImageChangedEvent.TYPE) {
                        var imageChangedEvent = e;
                        if (imageChangedEvent.image != null) {
                            this._currentImage = imageChangedEvent.image;
                            this._checkAndDisableSynchronize(this);
                        }
                    }
                };
                return MyCoReButtonChangeComponent;
            }(components.ViewerComponent));
            components.MyCoReButtonChangeComponent = MyCoReButtonChangeComponent;
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var IVIEW_COMPONENTS = VIEWER_COMPONENTS || [];
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var MyCoReViewer = (function () {
            function MyCoReViewer(_container, _settings) {
                this._container = _container;
                this._settings = _settings;
                this._initializing = false;
                this._eventHandlerMap = new MyCoReMap();
                this._components = new Array();
                this._initializingEvents = new Array();
                this.initialize();
            }
            Object.defineProperty(MyCoReViewer.prototype, "container", {
                get: function () {
                    return this._container;
                },
                enumerable: true,
                configurable: true
            });
            MyCoReViewer.prototype.addComponent = function (ic) {
                var that = this;
                ic.bind(function (event) {
                    that.eventTriggered(event);
                });
                var events = ic.handlesEvents;
                if (typeof events != "undefined" && events != null && events instanceof Array) {
                    events.push(viewer.components.events.WaitForEvent.TYPE);
                    for (var eIndex in events) {
                        var e = events[eIndex];
                        if (!this._eventHandlerMap.has(e)) {
                            this._eventHandlerMap.set(e, new Array());
                        }
                        this._eventHandlerMap.get(e).push(ic);
                    }
                }
                else {
                    console.log(ViewerFormatString("The component {comp} doesnt have a valid handlesEvents!", { comp: ic }));
                }
                this._components.push(ic);
                ic.init();
            };
            MyCoReViewer.prototype.eventTriggered = function (e) {
                if (this._eventHandlerMap.has(e.type)) {
                    var handlers = this._eventHandlerMap.get(e.type);
                    for (var componentIndex in handlers) {
                        var component = handlers[componentIndex];
                        component._handle(e);
                    }
                }
            };
            MyCoReViewer.prototype.initialize = function () {
                this._settings = viewer.MyCoReViewerSettings.normalize(this._settings);
                if (!this._container.hasClass("mycoreViewer")) {
                    this._container.addClass("mycoreViewer");
                }
                for (var i in IVIEW_COMPONENTS) {
                    var ic = IVIEW_COMPONENTS[i];
                    try {
                        this.addComponent(new ic(this._settings, this._container));
                    }
                    catch (e) {
                        console.log("Unable to add component");
                        console.log(e);
                    }
                }
            };
            return MyCoReViewer;
        }());
        viewer.MyCoReViewer = MyCoReViewer;
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
addViewerComponent(mycore.viewer.components.MyCoReViewerContainerComponent);
addViewerComponent(mycore.viewer.components.MyCoReI18NComponent);
addViewerComponent(mycore.viewer.components.MyCoReImageOverviewComponent);
addViewerComponent(mycore.viewer.components.MyCoReToolbarComponent);
addViewerComponent(mycore.viewer.components.MyCoReImageScrollComponent);
addViewerComponent(mycore.viewer.components.MyCoReChapterComponent);
addViewerComponent(mycore.viewer.components.MyCoRePermalinkComponent);
addViewerComponent(mycore.viewer.components.MyCoReLayerComponent);
addViewerComponent(mycore.viewer.components.MyCoReButtonChangeComponent);
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var modal;
            (function (modal) {
                var ViewerErrorModal = (function (_super) {
                    __extends(ViewerErrorModal, _super);
                    function ViewerErrorModal(_mobile, errorTitle, errorText, imageUrl, parent) {
                        if (parent === void 0) { parent = document.body; }
                        _super.call(this, _mobile, errorTitle, parent);
                        this.modalHeader.children("h4").addClass("text-danger");
                        var img = imageUrl != null ? "<img class='thumbnail error-image' src='" + imageUrl + "' />" : "";
                        this.modalBody.append("<div class='error-image-holder'> " + img + " <span data-i18n='\" + text + \"'>" + errorText + "</span></div>");
                    }
                    return ViewerErrorModal;
                }(modal.IviewModalWindow));
                modal.ViewerErrorModal = ViewerErrorModal;
            })(modal = widgets.modal || (widgets.modal = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var modal;
            (function (modal) {
                var ViewerInfoModal = (function (_super) {
                    __extends(ViewerInfoModal, _super);
                    function ViewerInfoModal(_mobile, title, text, parent) {
                        if (parent === void 0) { parent = document.body; }
                        _super.call(this, _mobile, title, parent);
                        this.modalHeader.children("h4").addClass("text-info");
                        this.modalBody.append("<p><span data-i18n='" + text + "'>" + text + "</span></p>");
                    }
                    return ViewerInfoModal;
                }(modal.IviewModalWindow));
                modal.ViewerInfoModal = ViewerInfoModal;
            })(modal = widgets.modal || (widgets.modal = {}));
        })(widgets = viewer.widgets || (viewer.widgets = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));
var mycore;
(function (mycore) {
    var viewer;
    (function (viewer) {
        var widgets;
        (function (widgets) {
            var modal;
            (function (modal) {
                var ViewerConfirmModal = (function (_super) {
                    __extends(ViewerConfirmModal, _super);
                    function ViewerConfirmModal(_mobile, confirmTitle, confirmText, callback, parent) {
                        if (parent === void 0) { parent = document.body; }
                        _super.call(this, _mobile, confirmTitle, parent);
                        this.modalHeader.children("h4").addClass("text-info");
                        this.modalBody.append("<p><span data-i18n='" + confirmText + "'>" + confirmText + "</span></p>");
                        this.modalFooter.empty();
                        this.createButton(true, callback);
                        this.createButton(false, callback);
                    }
                    ViewerConfirmModal.prototype.createButton = function (confirm, callback) {
                        var key = confirm ? "yes" : "no";
                        var button = jQuery("<a data-i18n='modal." + key + "'></a>");
                        button.attr("type", "button");
                        button.addClass("btn btn-default");
                        button.appendTo(this.modalFooter);
                        var that = this;
                        button.click(function () {
                            if (callback) {
                                callback(confirm);
                            }
                            that.hide();
                        });
                    };
                    return ViewerConfirmModal;
                }(modal.IviewModalWindow));
                modal.ViewerConfirmModal = ViewerConfirmModal;
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
            var events;
            (function (events) {
                var PageLoadedEvent = (function (_super) {
                    __extends(PageLoadedEvent, _super);
                    function PageLoadedEvent(component, _pageId, abstractPage) {
                        _super.call(this, component, PageLoadedEvent.TYPE);
                        this._pageId = _pageId;
                        this.abstractPage = abstractPage;
                    }
                    PageLoadedEvent.TYPE = "PageLoadedEvent";
                    return PageLoadedEvent;
                }(events.MyCoReImageViewerEvent));
                events.PageLoadedEvent = PageLoadedEvent;
            })(events = components.events || (components.events = {}));
        })(components = viewer.components || (viewer.components = {}));
    })(viewer = mycore.viewer || (mycore.viewer = {}));
})(mycore || (mycore = {}));

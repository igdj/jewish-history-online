/// <reference path="../../../../../../../src/main/typescript/modules/base/definitions/jquery.d.ts" />
declare namespace mycore.viewer.widgets.events {
    interface ViewerEvent {
        type: string;
    }
    class DefaultViewerEvent implements ViewerEvent {
        private _type;
        constructor(_type: string);
        type: string;
    }
}
declare namespace mycore.viewer.components.events {
    class MyCoReImageViewerEvent extends mycore.viewer.widgets.events.DefaultViewerEvent {
        component: any;
        constructor(component: any, type: string);
    }
}
interface iterator<T> {
    hasPrevious(): boolean;
    hasNext(): boolean;
    previous(): T;
    next(): T;
    current(): T;
}
declare var VIEWER_COMPONENTS: Array<any>;
declare function addViewerComponent(component: any): void;
declare function viewerClearTextSelection(): void;
declare function addIviewComponent(component: any): void;
declare class ArrayIterator<T> implements iterator<T> {
    private _array;
    constructor(_array: Array<T>);
    private iterator;
    hasPrevious(): boolean;
    hasNext(): boolean;
    previous(): T;
    next(): T;
    current(): T;
    reset(): void;
}
declare class Position2D {
    private _x;
    private _y;
    constructor(_x: number, _y: number);
    toString(): string;
    move(vec: MoveVector): Position2D;
    roundDown(): Position2D;
    roundUp(): Position2D;
    scale(scale: number): Position2D;
    copy(): Position2D;
    static fromString(str: string): Position2D;
    x: number;
    y: number;
    rotate(rotation: number): Position2D;
    rotateAround(center: Position2D, rotation: number): Position2D;
    toPosition3D(z: number): Position3D;
    equals(p: any): boolean;
    min(x: number, y: number): Position2D;
    max(x: number, y: number): Position2D;
}
declare class MoveVector extends Position2D {
    constructor(x: number, y: number);
}
declare class Position3D {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number);
    toString(): string;
    toPosition2D(): Position2D;
}
declare class Size2D {
    width: number;
    height: number;
    constructor(width: number, height: number);
    toString(): string;
    roundUp(): Size2D;
    scale(scale: number): Size2D;
    copy(): Size2D;
    getRotated(deg: number): Size2D;
    maxSide(): number;
    getSurface(): number;
    roundDown(): Size2D;
}
declare class Rect {
    pos: Position2D;
    size: Size2D;
    constructor(pos: Position2D, size: Size2D);
    getPoints(): {
        upperLeft: Position2D;
        upperRight: Position2D;
        lowerLeft: Position2D;
        lowerRight: Position2D;
    };
    getX(): number;
    getY(): number;
    getWidth(): number;
    getHeight(): number;
    scale(scale: number): Rect;
    getIntersection(r2: Rect): Rect;
    intersects(p: Position2D): boolean;
    intersectsArea(other: Rect): boolean;
    intersectsVertical(y: number): boolean;
    intersectsHorizontal(x: number): boolean;
    rotate(deg: number): Rect;
    flipX(): Rect;
    flipY(): Rect;
    flip(deg: number): Rect;
    equals(obj: any): boolean;
    contains(rect: Rect): boolean;
    getMiddlePoint(): Position2D;
    toString(): string;
    getRotated(deg: number): Rect;
    maximize(x: number, y: number, width: number, height: number): Rect;
    maximizeRect(other: Rect): Rect;
    increase(pixel: number): Rect;
    difference(rect: Rect): Array<Rect>;
    copy(): Rect;
    static fromXYWH(x: number, y: number, width: number, height: number): Rect;
    static fromULLR(upperLeft: Position2D, lowerRight: Position2D): Rect;
    static getBounding(...n: Rect[]): Rect;
    static diff(r: Rect, s: Rect): Array<Rect>;
}
declare class Utils {
    static LOG_HALF: number;
    static canvasToImage(canvas: HTMLCanvasElement): HTMLImageElement;
    static getVar<T>(obj: any, path: string, defaultReturn?: T, check?: (extracted: T) => boolean): T;
    static synchronize<T>(conditions: Array<(synchronizeObj: T) => boolean>, then: (synchronizeObj: T) => void): (synchronizeObj: any) => void;
    static createRandomId(): string;
    static hash(str: string): number;
    static stopPropagation: (e: JQueryMouseEventObject) => void;
    static selectElementText(element: any): void;
}
declare class MyCoReMap<K, V> {
    private static BASE_KEY_TO_HASH_FUNCTION;
    private static KEY_PREFIX;
    constructor(arr?: any);
    private keyMap;
    private valueMap;
    private keyToHashFunction;
    set(key: K, value: V): void;
    get(key: K): V;
    setKeyToHashFunction(keyToHashFunction: (key: K) => void): void;
    hasThen(key: K, consumer: (value: V) => void): void;
    keys: Array<K>;
    values: Array<V>;
    has(key: K): boolean;
    forEach(call: (key: K, value: V) => void): void;
    filter(call: (key: K, value: V) => boolean): MyCoReMap<K, V>;
    copy(): MyCoReMap<K, V>;
    remove(key: K): void;
    clear(): void;
    mergeIn(...maps: MyCoReMap<K, V>[]): void;
    isEmpty(): boolean;
    private getHash(key);
}
declare class ViewerError {
    constructor(message: string, error?: any);
    toString(): any;
    private informations;
}
declare class ViewerProperty<T> {
    private _from;
    private _name;
    private _value;
    constructor(_from: any, _name: string, _value?: T);
    private propertyChanging;
    private observerArray;
    name: string;
    value: T;
    from: any;
    private clone();
    removeAllObserver(): void;
    removeObserver(observer: ViewerPropertyObserver<T>): void;
    addObserver(observer: ViewerPropertyObserver<T>): void;
    notifyPropertyChanged(_old: ViewerProperty<T>, _new: ViewerProperty<T>): void;
}
declare function ViewerFormatString(pattern: string, args: any): string;
interface ViewerPropertyObserver<T> {
    propertyChanged(_old: ViewerProperty<T>, _new: ViewerProperty<T>): any;
}
interface ContainerObserver<T1, T2> {
    childAdded(that: T1, component: T2): void;
    childRemoved(that: T1, component: T2): void;
}
declare var viewerRequestAnimationFrame: (callback: () => void) => void;
declare var viewerCancelRequestAnimationFrame: (callback: () => void) => void;
declare class ViewerUserSettingStore {
    private static LOCK;
    private static _INSTANCE;
    static getInstance(): ViewerUserSettingStore;
    constructor();
    getValue(key: string): any;
    setValue(key: string, value: string): void;
    hasValue(key: string): boolean;
    private _browserStorageSupport;
    private _sessionMap;
    browserStorageSupport: boolean;
}
declare function isFullscreen(): boolean;
declare var viewerDeviceSupportTouch: boolean;
declare function viewerCrossBrowserWheel(element: HTMLElement, handler: (e: {
    deltaX: number;
    deltaY: number;
    orig: any;
    pos: Position2D;
    altKey?: boolean;
    ctrlKey?: boolean;
}) => void): void;
interface GivenViewerPromise<T1, T2> {
    then(handler: (result: T1) => void): void;
    onreject(handler: (reason: T2) => void): void;
}
declare class ViewerPromise<T1, T2> implements GivenViewerPromise<T1, T2> {
    constructor();
    private static DEFAULT;
    private _result;
    private _rejectReason;
    private _then;
    private _onReject;
    then(handler: (result: T1) => void): void;
    onreject(handler: (reason: T2) => void): void;
    reject(reason: T2): void;
    resolve(reason: T1): void;
}
declare class ViewerParameterMap extends MyCoReMap<string, string> {
    constructor();
    toParameterString(): string;
    static fromCurrentUrl(): ViewerParameterMap;
    static fromUrl(url: any): ViewerParameterMap;
}
declare function singleSelectShim(xml: Document, xpath: string, nsMap: MyCoReMap<string, string>): Node;
declare function getNodesShim(xml: Document, xpathExpression: string, contextNode: any, nsMap: MyCoReMap<string, string>, resultType: any, result: any): Node[];
declare class XMLUtil {
    static iterateChildNodes(element: Node, iter: (node: Node) => void): void;
    static nodeListToNodeArray(nodeList: NodeList): Array<Node>;
    static getOneChild(element: Node, isTheOne: (node: Node) => boolean): Node;
    static getOneOf(childNodes: NodeList, isTheOne: (node: Node) => boolean): Node;
    private static METS_NAMESPACE_URI;
    private static XLINK_NAMESPACE_URI;
    static NS_MAP: MyCoReMap<string, string>;
}
declare class ClassDescriber {
    static getName(inputClass: any): string;
    static ofEqualClass(class1: any, class2: any): boolean;
}
declare namespace mycore.viewer.widgets.canvas {
    interface Animation {
        updateAnimation(elapsedTime: number): boolean;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class Viewport {
        constructor();
        private _currentAnimation;
        private _lastAnimTime;
        positionProperty: ViewerProperty<Position2D>;
        sizeProperty: ViewerProperty<Size2D>;
        rotationProperty: ViewerProperty<number>;
        scaleProperty: ViewerProperty<number>;
        scale: number;
        rotation: number;
        size: Size2D;
        position: Position2D;
        asRectInArea(): Rect;
        startAnimation(anim: Animation): void;
        getAbsolutePosition(positionInViewport: Position2D): Position2D;
        stopAnimation(): void;
        updateAnimation(): void;
        currentAnimation: mycore.viewer.widgets.canvas.Animation;
        setRect(rect: Rect): void;
    }
}
declare namespace mycore.viewer.model {
    interface AbstractPage {
        id: string;
        size: Size2D;
        draw(ctx: CanvasRenderingContext2D, rect: Rect, sourceScale: any, preview?: boolean, infoScale?: number): void;
        refreshCallback: () => void;
        clear(): void;
        toString(): string;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class PageArea implements ViewerPropertyObserver<any> {
        private _pages;
        private _pageAreaInformationMap;
        private _updateCallback;
        updateCallback: () => void;
        addPage(page: model.AbstractPage, info: PageAreaInformation): void;
        removePage(page: model.AbstractPage): void;
        propertyChanged(_old: ViewerProperty<any>, _new: ViewerProperty<any>): void;
        setPageAreaInformation(page: model.AbstractPage, info: PageAreaInformation): void;
        getPages(): Array<model.AbstractPage>;
        getPagesInViewport(viewPort: Viewport): Array<model.AbstractPage>;
        getPageInformation(page: model.AbstractPage): PageAreaInformation;
        private pageIntersectViewport(page, viewPort);
        private registerPageAreaInformationEvents(info);
        private unregisterPageAreaInformationEvents(info);
    }
    class PageAreaInformation {
        private _positionProperty;
        private _scaleProperty;
        private _rotationProperty;
        positionProperty: ViewerProperty<Position2D>;
        rotationProperty: ViewerProperty<number>;
        scaleProperty: ViewerProperty<number>;
        rotation: number;
        scale: number;
        position: Position2D;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class ViewportTools {
        static centerViewportOnPage(vp: Viewport, pageAreaInformation: PageAreaInformation): void;
        static fitViewportOverPage(vp: Viewport, pageAreaInformation: PageAreaInformation, page: model.AbstractPage): void;
        static fitViewportOverPageWidth(vp: Viewport, pageAreaInformation: PageAreaInformation, page: model.AbstractPage): void;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    abstract class StatefulAnimation implements Animation {
        isRunning: any;
        isFinished: any;
        isPaused: any;
        protected totalElapsedTime: any;
        constructor();
        updateAnimation(elapsedTime: number): boolean;
        abstract update(elapsedTime: number): boolean;
        pause(): void;
        continue(): void;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class InterpolationAnimation extends StatefulAnimation {
        protected duration: number;
        protected from: number;
        protected to: number;
        protected interpolationFunction: (from: number, to: number, progress: number) => number;
        value: number;
        constructor(duration: number, from: number, to: number, interpolationFunction?: (from: number, to: number, progress: number) => number);
        update(elapsedTime: number): boolean;
    }
}
declare namespace mycore.viewer.model {
    interface TextContentModel {
        content: Array<TextElement>;
        links: Link[];
        internLinks: InternLink[];
    }
    interface Link {
        url: string;
        rect: Rect;
    }
    interface InternLink {
        rect: Rect;
        pageNumberResolver(callback: (page: string) => void): void;
    }
    interface TextElement {
        fromBottomLeft?: boolean;
        angle?: number;
        size: Size2D;
        text: string;
        pos: Position2D;
        fontFamily?: string;
        fontSize?: number;
        pageHref: string;
        mouseenter?: () => void;
        mouseleave?: () => void;
        toString(): string;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class HtmlRenderer {
        private _vp;
        private _area;
        private _view;
        constructor(_vp: Viewport, _area: PageArea, _view: PageView);
        private _addedPages;
        htmlContainer: HTMLElement;
        private _pageElementCache;
        private _idPageMap;
        private _addedContentMap;
        update(): void;
        private updatePage(page);
        private addPage(page);
        private createPageElement(page);
        private removePage(page);
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class TextRenderer {
        private _vp;
        private _area;
        private _view;
        private _textContentProvider;
        private pageLinkClicked;
        constructor(_vp: Viewport, _area: PageArea, _view: PageView, _textContentProvider: (page: model.AbstractPage, contentProvider: (textContent: model.TextContentModel) => void) => void, pageLinkClicked: (page: string) => void);
        private _contentCache;
        private _callbackRunning;
        private _addedPages;
        textContainer: HTMLElement;
        private _elementCache;
        private _pageElementCache;
        private _lineElementMap;
        private _highlightWordMap;
        private _idPageMap;
        private _mesureCanvas;
        update(): void;
        private updatePage(page);
        private addPage(page);
        createPageElement(page: any): void;
        private removePage(page);
        private addPageParts(page, textContent);
        private removeContentPart(cp);
        private createContentPart(page, cp);
    }
}
declare namespace mycore.viewer.widgets.canvas {
    interface CanvasPageLayer {
        draw(ctx: CanvasRenderingContext2D, id: string, pageSize: Size2D, drawOnHtml: boolean): void;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class PageView {
        drawImage: boolean;
        drawHTML: boolean;
        container: JQuery;
        drawCanvas: HTMLCanvasElement;
        markCanvas: HTMLCanvasElement;
        constructor(drawImage?: boolean, drawHTML?: boolean);
        private static createCanvas(zIndex?, filter?);
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class Scrollbar {
        private _horizontal;
        constructor(_horizontal: boolean);
        clearRunning(): void;
        private initElements();
        private _scrollbarElement;
        private _slider;
        private _areaSize;
        private _viewSize;
        private _position;
        private _className;
        private _startButton;
        private _endButton;
        private _mouseDown;
        private _scrollhandler;
        viewSize: number;
        areaSize: number;
        position: number;
        update(): void;
        private _cachedScrollbarElementSize;
        private _cacheTime;
        private getScrollbarElementSize();
        resized(): void;
        scrollbarElement: JQuery;
        scrollHandler: () => void;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class Overview extends PageView {
        private vp;
        private _maxOverviewSize;
        constructor(vp: Viewport, _maxOverviewSize?: Size2D);
        private updateOverviewSize(size);
        overviewViewport: Viewport;
        private _overviewRect;
        overviewRect: Rect;
        drawRect(): void;
        initEventHandler(): void;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class PageController {
        private miniOverview;
        constructor(miniOverview?: boolean);
        private _lastSize;
        private _requestRunning;
        private _nextRequested;
        private _pageArea;
        private _viewport;
        private _views;
        private _viewHTMLRendererMap;
        private _textRenderer;
        private _canvasPageLayers;
        private _lastAnimationTime;
        private _animations;
        _overview: Overview;
        _updateSizeIfChanged(): void;
        private _updateSize(view);
        private _unregisterViewport();
        private _registerViewport();
        update(): void;
        private drawOnView(view, vp?, markerOnly?);
        drawPage(page: model.AbstractPage, info: PageAreaInformation, areaInViewport: Rect, scale: number, preview: boolean, view: mycore.viewer.widgets.canvas.PageView, markerOnly?: boolean): void;
        private updateAnimations();
        addAnimation(animation: Animation): void;
        removeAnimation(animation: Animation): void;
        viewport: mycore.viewer.widgets.canvas.Viewport;
        views: Array<mycore.viewer.widgets.canvas.PageView>;
        addPage(page: model.AbstractPage, info: PageAreaInformation): void;
        removePage(page: model.AbstractPage): void;
        getPages(): Array<model.AbstractPage>;
        setPageAreaInformation(page: model.AbstractPage, info: PageAreaInformation): void;
        getPageAreaInformation(page: model.AbstractPage): PageAreaInformation;
        addCanvasPageLayer(zIndex: number, canvas: CanvasPageLayer): void;
        getCanvasPageLayers(): MyCoReMap<number, CanvasPageLayer>;
        getCanvasPageLayersOrdered(): Array<CanvasPageLayer>;
        getPageArea(): widgets.canvas.PageArea;
        textRenderer: mycore.viewer.widgets.canvas.TextRenderer;
    }
}
declare namespace mycore.viewer.widgets.events {
    class ViewerEventManager {
        constructor();
        private _callBackArray;
        bind(callback: (e: ViewerEvent) => void): void;
        trigger(e: ViewerEvent): void;
        unbind(callback: (e: ViewerEvent) => void): void;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    interface TextView {
        updateText(text: string): void;
        getElement(): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    interface ImageView {
        updateHref(href: string): void;
        getElement(): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    interface GroupView {
        addChild(child: JQuery): void;
        removeChild(child: JQuery): void;
        getElement(): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    interface ButtonView {
        updateButtonLabel(label: string): void;
        updateButtonTooltip(tooltip: string): void;
        updateButtonIcon(icon: string): void;
        updateButtonClass(buttonClass: string): void;
        updateButtonActive(active: boolean): void;
        updateButtonDisabled(disabled: boolean): void;
        getElement(): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    interface DropdownView extends ButtonView {
        updateChilds(childs: Array<{
            id: string;
            label: string;
            icon: string;
        }>): void;
        getChildElement(id: string): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    interface TextInputView {
        updateValue(value: string): void;
        updatePlaceholder(placeHolder: string): void;
        getValue(): string;
        getElement(): JQuery;
        onChange: () => void;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    interface ToolbarView {
        addChild(child: JQuery): void;
        removeChild(child: JQuery): void;
        getElement(): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    interface ToolbarViewFactory {
        createToolbarView(): ToolbarView;
        createTextView(id: string): TextView;
        createImageView(id: string): ImageView;
        createGroupView(id: string, align: string): GroupView;
        createDropdownView(id: string): DropdownView;
        createLargeDropdownView(id: string): DropdownView;
        createButtonView(id: string): ButtonView;
        createTextInputView(id: string): TextInputView;
    }
    var ToolbarViewFactoryImpl: ToolbarViewFactory;
}
declare namespace mycore.viewer.widgets.toolbar {
    class ToolbarComponent {
        constructor(id: string);
        private _properties;
        id: any;
        PropertyNames: string[];
        addProperty(property: ViewerProperty<any>): void;
        getProperty(name: string): ViewerProperty<any>;
        hasProperty(name: string): boolean;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class ToolbarGroup {
        private _name;
        private _right;
        constructor(_name: string, _right?: boolean);
        private _idComponentMap;
        private _observerArray;
        getComponentById(id: string): ToolbarComponent;
        addComponent(component: ToolbarComponent): void;
        removeComponent(component: ToolbarComponent): void;
        getComponentIDs(): string[];
        getComponents(): ToolbarComponent[];
        addObserver(observer: ContainerObserver<ToolbarGroup, ToolbarComponent>): void;
        removeObserver(observer: ContainerObserver<ToolbarGroup, ToolbarComponent>): void;
        observer: ContainerObserver<ToolbarGroup, ToolbarComponent>[];
        name: string;
        align: string;
        notifyObserverChildAdded(group: ToolbarGroup, component: ToolbarComponent): void;
        notifyObserverChildRemoved(group: ToolbarGroup, component: ToolbarComponent): void;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class ToolbarModel extends widgets.toolbar.ToolbarGroup implements ContainerObserver<ToolbarGroup, ToolbarComponent> {
        constructor(name: string);
        private _children;
        private _groupObserverArray;
        addGroup(group: ToolbarGroup): void;
        removeGroup(group: ToolbarGroup): void;
        getGroup(name: string): ToolbarGroup;
        getGroupIDs(): string[];
        getGroups(): ToolbarGroup[];
        childAdded(group: ToolbarGroup, component: ToolbarComponent): void;
        childRemoved(group: ToolbarGroup, component: ToolbarComponent): void;
        addGroupObserver(observer: ContainerObserver<ToolbarModel, ToolbarGroup>): void;
        removeGroupObserver(observer: ContainerObserver<ToolbarModel, ToolbarGroup>): void;
        private notifyGroupAdded(toolbar, group);
        private notifyGroupRemoved(toolbar, group);
        addComponent(component: ToolbarComponent): void;
        removeComponent(component: ToolbarComponent): void;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class ToolbarButton extends ToolbarComponent {
        constructor(id: string, label: string, tooltip?: string, icon?: string, buttonClass?: string, disabled?: boolean, active?: boolean);
        label: string;
        tooltip: string;
        icon: string;
        buttonClass: string;
        disabled: boolean;
        active: boolean;
    }
}
declare namespace mycore.viewer.widgets.toolbar.events {
    class ButtonPressedEvent extends mycore.viewer.widgets.events.DefaultViewerEvent {
        private _button;
        constructor(_button: ToolbarButton, type?: string);
        static TYPE: string;
        button: ToolbarButton;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class ButtonController implements ContainerObserver<ToolbarGroup, ToolbarComponent>, ViewerPropertyObserver<any> {
        private _groupMap;
        private _buttonViewMap;
        private _mobile;
        constructor(_groupMap: MyCoReMap<string, GroupView>, _buttonViewMap: MyCoReMap<string, ButtonView>, _mobile: boolean);
        private _eventManager;
        eventManager: widgets.events.ViewerEventManager;
        childAdded(parent: any, component: any): void;
        childRemoved(parent: any, component: any): void;
        createButtonView(button: ToolbarButton): ButtonView;
        propertyChanged(_old: ViewerProperty<any>, _new: ViewerProperty<any>): void;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class ToolbarDropdownButton extends ToolbarButton {
        constructor(id: string, label: string, children: Array<ToolbarDropdownButtonChild>, icon?: string, largeContent?: boolean, buttonClass?: string, disabled?: boolean, active?: boolean);
        children: Array<ToolbarDropdownButtonChild>;
        largeContent: boolean;
    }
    interface ToolbarDropdownButtonChild {
        id: string;
        label: string;
        isHeader?: boolean;
        icon?: string;
    }
}
declare namespace mycore.viewer.widgets.toolbar.events {
    class DropdownButtonPressedEvent extends ButtonPressedEvent {
        private _childId;
        constructor(button: ToolbarDropdownButton, _childId: string);
        childId: string;
        static TYPE: string;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class DropdownButtonController extends ButtonController {
        private _dropdownButtonViewMap;
        private __mobile;
        constructor(_groupMap: MyCoReMap<string, GroupView>, _dropdownButtonViewMap: MyCoReMap<string, DropdownView>, __mobile?: boolean);
        childAdded(parent: any, component: any): void;
        updateChildEvents(button: ToolbarDropdownButton, childs: Array<ToolbarDropdownButtonChild>): void;
        childRemoved(parent: any, component: any): void;
        propertyChanged(_old: ViewerProperty<any>, _new: ViewerProperty<any>): void;
        createButtonView(dropdown: ToolbarDropdownButton): DropdownView;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class ToolbarImage extends ToolbarComponent {
        constructor(id: string, href: string);
        href: string;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class ImageController implements ContainerObserver<ToolbarGroup, ToolbarComponent>, ViewerPropertyObserver<any> {
        private _groupMap;
        private _textViewMap;
        constructor(_groupMap: MyCoReMap<string, GroupView>, _textViewMap: MyCoReMap<string, ImageView>);
        childAdded(parent: any, component: any): void;
        childRemoved(parent: any, component: any): void;
        propertyChanged(_old: ViewerProperty<any>, _new: ViewerProperty<any>): void;
        createImageView(id: string): ImageView;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class ToolbarText extends ToolbarComponent {
        constructor(id: string, text: string);
        text: string;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class TextController implements ContainerObserver<ToolbarGroup, ToolbarComponent>, ViewerPropertyObserver<any> {
        private _groupMap;
        private _textViewMap;
        private _mobile;
        constructor(_groupMap: MyCoReMap<string, GroupView>, _textViewMap: MyCoReMap<string, TextView>, _mobile: boolean);
        childAdded(parent: any, component: any): void;
        childRemoved(parent: any, component: any): void;
        propertyChanged(_old: ViewerProperty<any>, _new: ViewerProperty<any>): void;
        createTextView(id: string): TextView;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class ToolbarTextInput extends ToolbarComponent {
        constructor(id: string, value: string, placeHolder: string);
        value: string;
        placeHolder: string;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class TextInputController implements ContainerObserver<ToolbarGroup, ToolbarComponent>, ViewerPropertyObserver<any> {
        private _groupMap;
        private _textInputViewMap;
        constructor(_groupMap: MyCoReMap<string, GroupView>, _textInputViewMap: MyCoReMap<string, TextInputView>);
        childAdded(parent: any, component: any): void;
        childRemoved(parent: any, component: any): void;
        propertyChanged(_old: ViewerProperty<any>, _new: ViewerProperty<any>): void;
        createTextInputView(id: string): TextInputView;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class IviewToolbar implements ContainerObserver<ToolbarGroup, ToolbarComponent>, ContainerObserver<ToolbarModel, ToolbarGroup> {
        private _container;
        private _mobile;
        private _model;
        constructor(_container: JQuery, _mobile?: boolean, _model?: ToolbarModel);
        private _eventManager;
        private _toolbarElement;
        private _toolbarView;
        private _idViewMap;
        private _idGroupViewMap;
        private _buttonController;
        private _dropdownController;
        private _textController;
        private _imageController;
        private _textInputController;
        model: ToolbarModel;
        eventManager: widgets.events.ViewerEventManager;
        private _createView();
        childAdded(parent: any, component: any): void;
        private createToolbarView();
        private createGroupView(id, align);
        childRemoved(parent: any, component: any): void;
        getView(componentId: string): ToolbarView;
        getView(component: ToolbarComponent): ToolbarView;
    }
}
declare namespace mycore.viewer.model {
    class LanguageModel {
        private _keyTranslationMap;
        constructor(_keyTranslationMap: MyCoReMap<string, string>);
        getTranslation(key: string): string;
        getFormatedTranslation(key: string, ...format: string[]): string;
        hasTranslation(key: string): boolean;
        translate(element: JQuery): void;
    }
}
declare namespace mycore.viewer.model {
    import ToolbarButton = mycore.viewer.widgets.toolbar.ToolbarButton;
    import ToolbarDropdownButton = mycore.viewer.widgets.toolbar.ToolbarDropdownButton;
    class MyCoReBasicToolbarModel extends widgets.toolbar.ToolbarModel {
        constructor(id: string);
        _dropdownChildren: {
            id: string;
            label: string;
        }[];
        _imageOverviewDropdownChild: any;
        _chapterOverviewDropdownChild: any;
        _pageSelectChildren: any;
        _sidebarControllGroup: widgets.toolbar.ToolbarGroup;
        _imageChangeControllGroup: widgets.toolbar.ToolbarGroup;
        _zoomControllGroup: widgets.toolbar.ToolbarGroup;
        _actionControllGroup: widgets.toolbar.ToolbarGroup;
        _layoutControllGroup: widgets.toolbar.ToolbarGroup;
        _searchGroup: widgets.toolbar.ToolbarGroup;
        _closeViewerGroup: widgets.toolbar.ToolbarGroup;
        _sidebarControllDropdownButton: widgets.toolbar.ToolbarDropdownButton;
        _previousImageButton: ToolbarButton;
        _nextImageButton: ToolbarButton;
        _zoomInButton: ToolbarButton;
        _zoomOutButton: ToolbarButton;
        _zoomWidthButton: ToolbarButton;
        _zoomFitButton: ToolbarButton;
        _shareButton: ToolbarButton;
        _closeViewerButton: ToolbarButton;
        _rotateButton: ToolbarButton;
        _layoutDropdownButton: ToolbarDropdownButton;
        _layoutDropdownButtonChilds: any;
        _pageSelect: any;
        initComponents(): void;
        addComponents(): void;
        i18n(model: model.LanguageModel): void;
    }
}
declare namespace mycore.viewer.components.events {
    class WaitForEvent extends MyCoReImageViewerEvent {
        eventType: string;
        constructor(component: ViewerComponent, eventType: string);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components {
    class ViewerComponent extends mycore.viewer.widgets.events.ViewerEventManager {
        constructor();
        private _eventCache;
        init(): void;
        handlesEvents: string[];
        _handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        trigger(e: mycore.viewer.widgets.events.ViewerEvent): void;
    }
}
declare namespace mycore.viewer {
    class MyCoReViewerSettings {
        mobile: boolean;
        doctype: string;
        tileProviderPath: string;
        filePath: string;
        derivate: string;
        i18nURL: string;
        lang: string;
        webApplicationBaseURL: string;
        derivateURL: string;
        onClose: () => void;
        adminMail: string;
        leftShowOnStart: string;
        static normalize(settings: MyCoReViewerSettings): MyCoReViewerSettings;
    }
}
declare namespace mycore.viewer.widgets.layout {
    class IviewBorderLayout {
        private _parent;
        private _horizontalStronger;
        static DIRECTION_CENTER: number;
        static DIRECTION_EAST: number;
        static DIRECTION_SOUTH: number;
        static DIRECTION_WEST: number;
        static DIRECTION_NORTH: number;
        constructor(_parent: JQuery, _horizontalStronger: any, descriptions: ContainerDescription[]);
        private _initCenter();
        private _updateCenterCss();
        private _initContainer(description);
        private _correctDescription(description);
        private _updateCssDescription(description);
        updateSizes(): void;
        private _initContainerResizeable(containerDiv, description);
        private _descriptionMap;
        private _containerMap;
        private _getNewSize(startPosition, currentPosition, startSize, direction);
        hasContainer(direction: number): boolean;
        getContainer(direction: number): JQuery;
        horizontalStronger: any;
        getContainerSizeDescription(direction: number): number;
        getContainerDescription(direction: number): ContainerDescription;
        getContainerSize(direction: number): number;
        private getDirectionDescription(direction);
    }
    interface ContainerDescription {
        direction: number;
        resizeable?: boolean;
        size: number;
        minSize?: number;
    }
}
declare namespace mycore.viewer.components.events {
    class ComponentInitializedEvent extends MyCoReImageViewerEvent {
        constructor(component: ViewerComponent);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.model {
    class StructureImage {
        type: string;
        id: string;
        order: number;
        orderLabel: string;
        href: string;
        mimetype: string;
        requestImgdataUrl: (callback: (imgdata: string) => void) => void;
        additionalHrefs: MyCoReMap<string, string>;
        constructor(type: string, id: string, order: number, orderLabel: string, href: string, mimetype: string, requestImgdataUrl: (callback: (imgdata: string) => void) => void, additionalHrefs?: MyCoReMap<string, string>, uniqueIdentifier?: string);
        uniqueIdentifier: string;
    }
}
declare namespace mycore.viewer.components.events {
    class ImageChangedEvent extends MyCoReImageViewerEvent {
        private _image;
        constructor(component: ViewerComponent, _image: model.StructureImage);
        image: model.StructureImage;
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components.events {
    class ImageSelectedEvent extends MyCoReImageViewerEvent {
        private _image;
        constructor(component: ViewerComponent, _image: model.StructureImage);
        image: model.StructureImage;
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components.events {
    class ShowContentEvent extends MyCoReImageViewerEvent {
        content: JQuery;
        containerDirection: number;
        size: number;
        text: JQuery;
        constructor(component: ViewerComponent, content: JQuery, containerDirection: number, size?: number, text?: JQuery);
        static DIRECTION_CENTER: number;
        static DIRECTION_EAST: number;
        static DIRECTION_SOUTH: number;
        static DIRECTION_WEST: number;
        static DIRECTION_NORTH: number;
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components {
    class MyCoReViewerContainerComponent extends ViewerComponent {
        private _settings;
        private _container;
        private _contentContainer;
        constructor(_settings: MyCoReViewerSettings, _container: JQuery, _contentContainer?: JQuery);
        init(): void;
        private correctToToolbarSize();
        private static SIDEBAR_DIRECTION;
        private static CONTENT_DIRECTION;
        private static INFORMATION_BAR_DIRECTION;
        private _sidebar;
        private _content;
        private _informationBar;
        private _layout;
        private _lastSizeMap;
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        private _closeSidebar();
        private _clearOldContent(container);
        handlesEvents: string[];
    }
}
declare namespace mycore.viewer.model {
    class StructureChapter {
        private _parent;
        private _type;
        private _id;
        private _label;
        private _chapter;
        private _additional;
        private _destinationResolver;
        constructor(_parent: StructureChapter, _type: string, _id: string, _label: string, _chapter?: Array<StructureChapter>, _additional?: MyCoReMap<string, any>, _destinationResolver?: (callbackFn: (targetId) => void) => void);
        parent: StructureChapter;
        type: string;
        id: string;
        label: string;
        chapter: Array<StructureChapter>;
        additional: MyCoReMap<string, any>;
        resolveDestination(callbackFn: (targetId) => void): void;
    }
}
declare namespace mycore.viewer.model {
    class StructureModel {
        _rootChapter: model.StructureChapter;
        _imageList: Array<model.StructureImage>;
        _chapterToImageMap: MyCoReMap<string, model.StructureImage>;
        _imageToChapterMap: MyCoReMap<string, model.StructureChapter>;
        _imageHrefImageMap: MyCoReMap<string, model.StructureImage>;
        _textContentPresent: boolean;
        constructor(_rootChapter: model.StructureChapter, _imageList: Array<model.StructureImage>, _chapterToImageMap: MyCoReMap<string, model.StructureImage>, _imageToChapterMap: MyCoReMap<string, model.StructureChapter>, _imageHrefImageMap: MyCoReMap<string, model.StructureImage>, _textContentPresent: boolean);
        defaultPageDimension: Size2D;
        rootChapter: model.StructureChapter;
        imageList: Array<model.StructureImage>;
        chapterToImageMap: MyCoReMap<string, model.StructureImage>;
        imageToChapterMap: MyCoReMap<string, model.StructureChapter>;
        imageHrefImageMap: MyCoReMap<string, model.StructureImage>;
        isTextContentPresent: boolean;
    }
}
declare namespace mycore.viewer.components.events {
    class StructureModelLoadedEvent extends MyCoReImageViewerEvent {
        private _structureModel;
        constructor(component: ViewerComponent, _structureModel: model.StructureModel);
        structureModel: model.StructureModel;
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components.events {
    class CanvasTapedEvent extends MyCoReImageViewerEvent {
        constructor(component: ViewerComponent);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components.events {
    class LanguageModelLoadedEvent extends MyCoReImageViewerEvent {
        private _languageModel;
        constructor(component: ViewerComponent, _languageModel: model.LanguageModel);
        languageModel: model.LanguageModel;
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components.events {
    class ProvideToolbarModelEvent extends MyCoReImageViewerEvent {
        model: model.MyCoReBasicToolbarModel;
        constructor(component: ViewerComponent, model: model.MyCoReBasicToolbarModel);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components {
    class MyCoReToolbarComponent extends ViewerComponent {
        private _settings;
        private _container;
        constructor(_settings: MyCoReViewerSettings, _container: JQuery);
        private _sync;
        init(): void;
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        handlesEvents: string[];
        toolbar: widgets.toolbar.IviewToolbar;
        private _toolbarModel;
        private _toolbarController;
        private _imageIdMap;
    }
}
declare namespace mycore.viewer.widgets.thumbnail {
    interface ThumbnailOverviewThumbnail {
        id: string;
        label: string;
        href: string;
        requestImgdataUrl: (callback: (imgdata: string) => void) => void;
    }
}
declare namespace mycore.viewer.widgets.thumbnail {
    class ThumbnailOverviewModel {
        thumbnails: Array<ThumbnailOverviewThumbnail>;
        constructor(thumbnails?: Array<ThumbnailOverviewThumbnail>);
        private _idThumbnailMap;
        selectedThumbnail: ThumbnailOverviewThumbnail;
        currentPosition: Position2D;
        tilesInsertedMap: MyCoReMap<string, boolean>;
        private fillTilesInsertedMap();
        private fillIdThumbnailMap();
        getThumbnailById(id: string): ThumbnailOverviewThumbnail;
    }
}
declare namespace mycore.viewer.widgets.thumbnail {
    class ThumbnailOverviewView {
        private _container;
        private _scrollHandler;
        private _resizeHandler;
        private _inputHandler;
        constructor(_container: JQuery, _scrollHandler: ThumbnailOverviewScrollHandler, _resizeHandler: ThumbnailOverviewResizeHandler, _inputHandler: ThumbnailOverviewInputHandler);
        private _gap;
        private _lastViewPortSize;
        private _spacer;
        gap: number;
        setContainerSize(newContainerSize: Size2D): void;
        setContainerScrollPosition(position: Position2D): void;
        setThumnailSelected(id: string, selected: boolean): void;
        injectTile(id: string, position: Position2D, label: string): void;
        updateTileHref(id: string, href: string): void;
        removeTile(id: string): void;
        updateTilePosition(id: string, position: Position2D): void;
        getViewportSize(): Size2D;
        jumpToThumbnail(thumbnailPos: number): void;
    }
    interface ThumbnailOverviewResizeHandler {
        resized(newViewPort: Size2D): void;
    }
    interface ThumbnailOverviewScrollHandler {
        scrolled(newPosition: Position2D): void;
    }
}
declare namespace mycore.viewer.widgets.thumbnail {
    interface ThumbnailOverviewInputHandler {
        addedThumbnail(id: string, element: JQuery): void;
    }
}
declare namespace mycore.viewer.widgets.thumbnail {
    interface ThumbnailOverviewSettings {
        thumbnails: Array<ThumbnailOverviewThumbnail>;
        container: JQuery;
        maxThumbnailSize: Size2D;
        inputHandler: ThumbnailOverviewInputHandler;
    }
    class DefaultThumbnailOverviewSettings implements ThumbnailOverviewSettings {
        private _thumbnails;
        private _container;
        private _inputHandler;
        private _maxThumbnailSize;
        constructor(_thumbnails: Array<ThumbnailOverviewThumbnail>, _container: JQuery, _inputHandler?: ThumbnailOverviewInputHandler, _maxThumbnailSize?: Size2D);
        thumbnails: ThumbnailOverviewThumbnail[];
        container: JQuery;
        maxThumbnailSize: Size2D;
        inputHandler: ThumbnailOverviewInputHandler;
    }
}
declare namespace mycore.viewer.widgets.thumbnail {
    class IviewThumbnailOverview implements ThumbnailOverviewScrollHandler, ThumbnailOverviewResizeHandler {
        private _settings;
        constructor(_settings: ThumbnailOverviewSettings);
        private _view;
        private _model;
        setThumbnailSelected(id: string): void;
        jumpToThumbnail(id: string): void;
        update(resize?: boolean): void;
        private updateThumbnails(startLine, endLine, positionOnly);
        private removeThumbnail(tileId);
        scrolled(newPosition: Position2D): void;
        resized(newViewPort: Size2D): void;
    }
}
declare namespace mycore.viewer.components {
    class MyCoReImageOverviewComponent extends ViewerComponent implements widgets.thumbnail.ThumbnailOverviewInputHandler {
        private _settings;
        constructor(_settings: MyCoReViewerSettings);
        private _enabled;
        private _container;
        private _overview;
        private _overviewSettings;
        private _sidebarLabel;
        private _currentImageId;
        private _idMetsImageMap;
        private _spinner;
        init(): void;
        content: JQuery;
        handlesEvents: string[];
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        prepareModel(images: Array<model.StructureImage>, basePath: string): Array<mycore.viewer.widgets.thumbnail.ThumbnailOverviewThumbnail>;
        addedThumbnail(id: string, element: JQuery): void;
    }
}
declare namespace mycore.viewer.widgets.chaptertree {
    interface ChapterTreeChapter {
        parent: ChapterTreeChapter;
        id: string;
        label: string;
        chapter: Array<ChapterTreeChapter>;
        resolveDestination(callbackFn: (targetId) => void): void;
    }
}
declare namespace mycore.viewer.widgets.chaptertree {
    class ChapterTreeModel {
        root: ChapterTreeChapter;
        chapterLabelMap: MyCoReMap<string, string>;
        constructor(root: ChapterTreeChapter, chapterLabelMap: MyCoReMap<string, string>);
        private initChapter(chapter);
        chapterVisible: MyCoReMap<string, boolean>;
        idElementMap: MyCoReMap<string, ChapterTreeChapter>;
        selected: ChapterTreeChapter;
    }
}
declare namespace mycore.viewer.widgets.chaptertree {
    interface ChapterTreeView {
        addNode(parentId: string, id: string, label: string, childLabel: string, expandable: boolean): any;
        setOpened(id: string, opened: boolean): any;
        setSelected(id: string, selected: boolean): any;
        jumpTo(id: string): any;
    }
}
declare namespace mycore.viewer.widgets.chaptertree {
    interface ChapterTreeInputHandler {
        register(ctrl: IviewChapterTree): void;
        registerNode(node: JQuery, id: string): void;
        registerExpander(expander: JQuery, id: string): void;
    }
    class DefaultChapterTreeInputHandler implements ChapterTreeInputHandler {
        constructor();
        private _ctrl;
        register(ctrl: IviewChapterTree): void;
        registerNode(node: JQuery, id: string): void;
        registerExpander(expander: JQuery, id: string): void;
    }
}
declare namespace mycore.viewer.widgets.chaptertree {
    class DesktopChapterTreeView implements ChapterTreeView {
        private _container;
        private _inputHandler;
        constructor(_container: JQuery, _inputHandler: ChapterTreeInputHandler, className?: string);
        private static CLOSE_ICON_CLASS;
        private static OPEN_ICON_CLASS;
        list: JQuery;
        addNode(parentId: string, id: string, label: string, childLabel: string, expandable: boolean): void;
        getParent(parentId: string): JQuery;
        createNode(id: string, label: string, childLabel: string, expandable: boolean): JQuery;
        setOpened(id: string, opened: boolean): void;
        setSelected(id: string, selected: boolean): void;
        jumpTo(id: string): void;
    }
}
declare namespace mycore.viewer.widgets.chaptertree {
    class MobileChapterTreeView implements ChapterTreeView {
        private _container;
        private _inputHandler;
        constructor(_container: JQuery, _inputHandler: ChapterTreeInputHandler, className?: string);
        private list;
        private levelMap;
        private static LEVEL_MARGIN;
        addNode(parentId: string, id: string, label: string, childLabel: string, expandable: boolean): void;
        setOpened(id: string, opened: boolean): void;
        setSelected(id: string, selected: boolean): void;
        jumpTo(id: string): void;
    }
}
declare namespace mycore.viewer.widgets.chaptertree {
    interface ChapterTreeSettings {
        chapter: ChapterTreeChapter;
        chapterLabelMap: MyCoReMap<string, string>;
        container: JQuery;
        viewFactory: ChapterTreeViewFactory;
        inputHandler: ChapterTreeInputHandler;
    }
    interface ChapterTreeViewFactory {
        createChapterTeeView(): ChapterTreeView;
    }
    class DefaultChapterTreeSettings implements ChapterTreeSettings, ChapterTreeViewFactory {
        private _container;
        private _chapterLabelMap;
        private _chapter;
        private mobile;
        private _inputHandler;
        constructor(_container: JQuery, _chapterLabelMap: MyCoReMap<string, string>, _chapter?: ChapterTreeChapter, mobile?: boolean, _inputHandler?: ChapterTreeInputHandler);
        chapter: ChapterTreeChapter;
        chapterLabelMap: MyCoReMap<string, string>;
        container: JQuery;
        viewFactory: this;
        inputHandler: ChapterTreeInputHandler;
        createChapterTeeView(): ChapterTreeView;
    }
}
declare namespace mycore.viewer.widgets.chaptertree {
    class IviewChapterTree {
        private _settings;
        constructor(_settings: ChapterTreeSettings);
        private _model;
        private _view;
        setChapterSelected(element: ChapterTreeChapter): void;
        getSelectedChapter(): ChapterTreeChapter;
        setChapterExpanded(element: ChapterTreeChapter, expanded: boolean): void;
        getChapterExpanded(element: ChapterTreeChapter): boolean;
        getChapterById(id: string): ChapterTreeChapter;
        private init();
        jumpToChapter(chapter: ChapterTreeChapter): void;
        private insertChapterView(chapter);
    }
}
declare namespace mycore.viewer.components.events {
    class ChapterChangedEvent extends MyCoReImageViewerEvent {
        private _chapter;
        constructor(component: ViewerComponent, _chapter: model.StructureChapter);
        chapter: model.StructureChapter;
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components.events {
    class RequestStateEvent extends MyCoReImageViewerEvent {
        stateMap: ViewerParameterMap;
        deepState: boolean;
        constructor(component: ViewerComponent, stateMap: ViewerParameterMap, deepState?: boolean);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components {
    class MyCoReChapterComponent extends ViewerComponent implements widgets.chaptertree.ChapterTreeInputHandler {
        private _settings;
        constructor(_settings: MyCoReViewerSettings);
        private _enabled;
        private _chapterWidgetSettings;
        private _chapterWidget;
        private _spinner;
        private _currentChapter;
        private _structureModel;
        private _initialized;
        private _sidebarLabel;
        private _chapterToActivate;
        private _autoPagination;
        private _idImageMap;
        init(): void;
        private updateContainerSize();
        handlesEvents: string[];
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        private persistChapterToString(chapter);
        private createChapterLabelMap(model);
        register(): void;
        registerNode(node: JQuery, id: string): void;
        private setChapter(id, jumpToFirstImageOfChapter?, node?);
        registerExpander(expander: JQuery, id: string): void;
        private _container;
        container: JQuery;
    }
}
declare namespace mycore.viewer.widgets.modal {
    import LanguageModel = mycore.viewer.model.LanguageModel;
    class IviewModalWindow {
        private _mobile;
        constructor(_mobile: boolean, _title: string, parent?: HTMLElement);
        private _wrapper;
        private _box;
        private _content;
        private _header;
        private _body;
        private _footer;
        private _close;
        box: JQuery;
        wrapper: JQuery;
        modalContent: JQuery;
        modalHeader: JQuery;
        modalBody: JQuery;
        modalFooter: JQuery;
        show(): void;
        hide(): void;
        closeButton: JQuery;
        closeLabel: string;
        title: string;
        updateI18n(languageModel: LanguageModel): IviewModalWindow;
    }
}
declare namespace mycore.viewer.widgets.modal {
    class ViewerPermalinkModalWindow extends IviewModalWindow {
        constructor(_mobile: boolean);
        private _textArea;
        permalink: string;
    }
}
declare namespace mycore.viewer.components.events {
    class RestoreStateEvent extends MyCoReImageViewerEvent {
        restoredState: MyCoReMap<string, string>;
        constructor(component: ViewerComponent, restoredState: MyCoReMap<string, string>);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components.events {
    class UpdateURLEvent extends MyCoReImageViewerEvent {
        constructor(component: ViewerComponent);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components.events {
    class RequestPermalinkEvent extends MyCoReImageViewerEvent {
        callback: (permalink: string) => void;
        constructor(component: ViewerComponent, callback: (permalink: string) => void);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components {
    class MyCoRePermalinkComponent extends ViewerComponent {
        private _settings;
        constructor(_settings: MyCoReViewerSettings);
        private _enabled;
        private _modalWindow;
        private _currentState;
        init(): void;
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        private updateHistory();
        private buildPermalink(state);
        private getBaseURL(file);
        handlesEvents: string[];
    }
}
declare namespace mycore.viewer.widgets.i18n {
    class XMLI18NProvider implements I18NProvider {
        private static DEFAULT_ERROR_CALLBACK;
        getLanguage(href: string, callback: (model: model.LanguageModel) => void, errorCallback?: (err) => void): void;
    }
    interface I18NProvider {
        getLanguage(href: string, callback: (model: model.LanguageModel) => void, errorCallback?: (err) => void): any;
    }
    var I18NPROVIDER: I18NProvider;
}
declare namespace mycore.viewer.components {
    class MyCoReI18NProvider implements mycore.viewer.widgets.i18n.I18NProvider {
        private static DEFAULT_ERROR_CALLBACK;
        private static VIEWER_PREFIX;
        private static METS_PREFIX;
        getLanguage(href: string, callback: (model: model.LanguageModel) => void, errorCallback?: (err) => void): void;
    }
    class MyCoReI18NComponent extends ViewerComponent {
        private _settings;
        constructor(_settings: MyCoReViewerSettings);
        private _language;
        private _loadI18N();
    }
}
declare namespace mycore.viewer.components.events {
    class RequestTextContentEvent extends MyCoReImageViewerEvent {
        _href: string;
        _onResolve: (href: string, abstractPage: model.TextContentModel) => void;
        constructor(component: ViewerComponent, _href: string, _onResolve: (href: string, abstractPage: model.TextContentModel) => void);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class PageLayout {
        init(model: OrderedListModel, pageController: PageController, pageDimension: Size2D, horizontalScrollbar: Scrollbar, verticalScrollbar: Scrollbar, pageLoader: (number) => void): void;
        _originalPageDimension: Size2D;
        _model: OrderedListModel;
        _pageController: PageController;
        _pageDimension: Size2D;
        _horizontalScrollbar: Scrollbar;
        _verticalScrollbar: Scrollbar;
        _pageLoader: (number) => void;
        _insertedPages: Array<number>;
        getPageController(): widgets.canvas.PageController;
        updatePage(order: any): void;
        getRealPageDimension(pageNumber: number): Size2D;
        syncronizePages(): void;
        clear(): void;
        public: any;
        checkShouldBeInserted(order: number): Boolean;
        calculatePageAreaInformation(order: number): PageAreaInformation;
        getImageMiddle(order: number): Position2D;
        fitToScreen(): void;
        fitToWidth(attop?: boolean): void;
        getCurrentPage(): number;
        jumpToPage(order: number): void;
        isImageInserted(order: number): boolean;
        scrollhandler(): void;
        rotate(deg: number): void;
        getLabelKey(): string;
        getCurrentOverview(): Rect;
        next(): void;
        previous(): void;
        getCurrentPageRotation(): number;
        setCurrentPageZoom(zoom: number): void;
        getCurrentPageZoom(): number;
        getCurrentPositionInPage(): Position2D;
        setCurrentPositionInPage(pos: Position2D): void;
        getPositionInArea(windowPosition: Position2D): Position2D;
        getPageHitInfo(windowPosition: Position2D): PageHitInfo;
    }
    interface OrderedListModel {
        children: MyCoReMap<number, model.AbstractPage>;
        hrefImageMap: MyCoReMap<string, model.StructureImage>;
        pageCount: number;
    }
    interface PageHitInfo {
        id: string;
        order: number;
        pageAreaInformation: PageAreaInformation;
        hit: Position2D;
    }
}
declare namespace mycore.viewer.components.events {
    class ProvidePageLayoutEvent extends MyCoReImageViewerEvent {
        pageLayout: widgets.canvas.PageLayout;
        isDefault: boolean;
        constructor(component: ViewerComponent, pageLayout: widgets.canvas.PageLayout, isDefault?: boolean);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components.events {
    class RequestPageEvent extends MyCoReImageViewerEvent {
        _pageId: string;
        _onResolve: (pageId: string, abstractPage: model.AbstractPage) => void;
        textContentURL: string;
        constructor(component: ViewerComponent, _pageId: string, _onResolve: (pageId: string, abstractPage: model.AbstractPage) => void, textContentURL?: string);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components.events {
    class PageLayoutChangedEvent extends MyCoReImageViewerEvent {
        pageLayout: widgets.canvas.PageLayout;
        constructor(component: ViewerComponent, pageLayout: widgets.canvas.PageLayout);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    interface DesktopInputListener {
        mouseDown(position: Position2D, e: JQueryMouseEventObject): void;
        mouseUp(position: Position2D, e: JQueryMouseEventObject): void;
        mouseClick(position: Position2D, e: JQueryMouseEventObject): void;
        mouseDoubleClick(position: Position2D, e: JQueryMouseEventObject): void;
        mouseMove(position: Position2D, e: JQueryMouseEventObject): void;
        mouseDrag(currentPosition: Position2D, startPosition: Position2D, startViewport: Position2D, e: JQueryMouseEventObject): void;
        scroll(e: {
            deltaX: number;
            deltaY: number;
            orig: any;
            pos: Position2D;
            altKey?: boolean;
        }): any;
        keydown(e: JQueryKeyEventObject): void;
        keypress(e: JQueryKeyEventObject): void;
        keyup(e: JQueryKeyEventObject): void;
    }
    abstract class DesktopInputAdapter implements DesktopInputListener {
        mouseDown(position: Position2D, e: JQueryMouseEventObject): void;
        mouseUp(position: Position2D, e: JQueryMouseEventObject): void;
        mouseClick(position: Position2D, e: JQueryMouseEventObject): void;
        mouseDoubleClick(position: Position2D, e: JQueryMouseEventObject): void;
        mouseMove(position: Position2D, e: JQueryMouseEventObject): void;
        mouseDrag(currentPosition: Position2D, startPosition: Position2D, startViewport: Position2D, e: JQueryMouseEventObject): void;
        scroll(e: {
            deltaX: number;
            deltaY: number;
            orig: any;
            pos: Position2D;
            altKey?: boolean;
        }): void;
        keydown(e: JQueryKeyEventObject): void;
        keypress(e: JQueryKeyEventObject): void;
        keyup(e: JQueryKeyEventObject): void;
    }
}
declare namespace mycore.viewer.components.events {
    class RequestDesktopInputEvent extends MyCoReImageViewerEvent {
        listener: widgets.canvas.DesktopInputListener;
        constructor(component: ViewerComponent, listener: widgets.canvas.DesktopInputListener);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class TouchMove {
        positions: Array<Position2D>;
        middle: Position2D;
        angle: number;
        distance: number;
        time: number;
        velocity: MoveVector;
        delta: MoveVector;
        constructor(positions: Array<Position2D>, middle: Position2D, angle: number, distance: number, time: number, velocity: MoveVector, delta: MoveVector);
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class TouchSession {
        startTime: number;
        startMiddle: Position2D;
        startAngle: number;
        startDistance: number;
        canvasStartPosition: Position2D;
        canvasStartScale: number;
        canvasStartRotation: number;
        currentMove: TouchMove;
        lastMove: TouchMove;
        lastSession: TouchSession;
        touches: number;
        touchLeft: boolean;
        maxTouches: number;
        constructor(startTime: number, startMiddle: Position2D, startAngle: number, startDistance: number, canvasStartPosition: Position2D, canvasStartScale: number, canvasStartRotation: number, currentMove: TouchMove, lastMove: TouchMove, lastSession: TouchSession, touches: number, touchLeft: boolean, maxTouches: number);
    }
}
declare namespace mycore.viewer.widgets.canvas {
    interface TouchInputListener {
        touchStart(session: TouchSession): void;
        touchMove(session: TouchSession): void;
        touchEnd(session: TouchSession): void;
    }
    abstract class TouchInputAdapter implements TouchInputListener {
        touchStart(session: TouchSession): void;
        touchMove(session: TouchSession): void;
        touchEnd(session: TouchSession): void;
    }
}
declare namespace mycore.viewer.components.events {
    class RequestTouchInputEvent extends MyCoReImageViewerEvent {
        listener: widgets.canvas.TouchInputListener;
        constructor(component: ViewerComponent, listener: widgets.canvas.TouchInputListener);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components.events {
    class AddCanvasPageLayerEvent extends MyCoReImageViewerEvent {
        zIndex: number;
        canvasPageLayer: widgets.canvas.CanvasPageLayer;
        constructor(component: ViewerComponent, zIndex: number, canvasPageLayer: widgets.canvas.CanvasPageLayer);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components.events {
    class TextEditEvent extends MyCoReImageViewerEvent {
        edit: boolean;
        constructor(component: ViewerComponent, edit?: boolean);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components.events {
    class RedrawEvent extends MyCoReImageViewerEvent {
        constructor(component: ViewerComponent);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class SinglePageLayout extends PageLayout {
        private _paiCache;
        private _rotation;
        syncronizePages(): void;
        clear(): void;
        fitToScreen(): void;
        calculatePageAreaInformation(order: number): PageAreaInformation;
        checkShouldBeInserted(order: number): boolean;
        fitToWidth(attop?: boolean): void;
        getCurrentPage(): number;
        jumpToPage(order: number): void;
        private getPageHeightWithSpace();
        getImageMiddle(order: number): Position2D;
        scrollhandler(): void;
        private correctViewport();
        rotate(deg: number): void;
        getLabelKey(): string;
        getCurrentOverview(): Rect;
        next(): void;
        previous(): void;
        getCurrentPageRotation(): number;
        getCurrentPageZoom(): number;
        setCurrentPageZoom(zoom: number): void;
        getCurrentPageScaling(): number;
        setCurrentPositionInPage(pos: Position2D): void;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class ZoomAnimation implements Animation {
        private _viewport;
        private _zoomScale;
        private _duration;
        constructor(_viewport: mycore.viewer.widgets.canvas.Viewport, _zoomScale: number, _position?: Position2D, _duration?: number);
        private _startScale;
        private _startPosition;
        private _targetScale;
        private _totalElapsedTime;
        private _position;
        private _diff;
        updateAnimation(elapsedTime: number): boolean;
        merge(additionalZoomScale: number): void;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class VelocityScrollAnimation implements Animation {
        private _viewport;
        private _startVelocity;
        constructor(_viewport: mycore.viewer.widgets.canvas.Viewport, _startVelocity: MoveVector);
        private _currentVelocity;
        private static MINIMUM_VELOCITY;
        updateAnimation(elapsedTime: number): boolean;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class DesktopInputDelegator {
        private _inputElement;
        private _viewport;
        private _handler;
        constructor(_inputElement: JQuery, _viewport: Viewport, _handler: DesktopInputListener);
        private _overviewRect;
        private _overviewBounds;
        private _overviewScale;
        private _lastMouseSession;
        private _currentMouseSession;
        private _mouseDownHandler;
        private _mouseUpHandler;
        private _mouseMoveHandler;
        private _mouseDragHandler;
        private _mouseLeaveHandler;
        initMove(): void;
        private notNull(o);
        private getTarget(e);
        private getMousePosition(inputElement, e);
        clearRunning(): void;
        initScale(): void;
        updateOverview(overview: Rect, overviewScale: number, overviewBounding: Rect): void;
        private createMouseSession(startPositionInputElement, startPositionViewport);
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class VelocityCalculationQueue {
        private _maxElements;
        private _maxTime;
        constructor(_maxElements?: number, _maxTime?: number);
        private _values;
        private _maxElementsOrig;
        add(move: TouchMove): void;
        getVelocity(): MoveVector;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class TouchPolyfill {
        private _inputElement;
        constructor(_inputElement: Element);
        private _idPointerMap;
        private _handlerMap;
        private _deletePointer(id);
        private _updatePointer(id, pos);
        private _fireEvent(eventName);
        private _createTouchEvent();
        private _createTouchesArray();
        touchstart: () => void;
        touchmove: () => void;
        touchend: () => void;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class TouchInputDelegator {
        private _inputElement;
        private _viewport;
        private _handler;
        constructor(_inputElement: JQuery, _viewport: Viewport, _handler: TouchInputListener);
        createTouchSession(startMiddle: Position2D, startAngle: number, startDistance: number, lastSession: TouchSession, canvasStartPosition?: Position2D, canvasStartScale?: number, canvasStartRotation?: number): TouchSession;
        private msGestureTarget;
        private session;
        private lastSession;
        listener: {
            surface: HTMLElement;
            type: string;
            fn: any;
        }[];
        initTouch(): void;
        clearRunning(): void;
        private addListener(surface, type, fn);
        private getPositions(touches);
        private getAngle(touch1, touch2);
        private getMiddle(touches);
        private getDistance(touches);
        private getVelocity(deltaTime, delta);
        delete(): void;
    }
}
declare namespace mycore.viewer.components.events {
    class ViewportInitializedEvent extends MyCoReImageViewerEvent {
        viewport: mycore.viewer.widgets.canvas.Viewport;
        constructor(component: ViewerComponent, viewport: mycore.viewer.widgets.canvas.Viewport);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components {
    class MyCoReImageScrollComponent extends ViewerComponent {
        private _settings;
        private _container;
        constructor(_settings: MyCoReViewerSettings, _container: JQuery);
        init(): void;
        private initOverview(overviewEnabled);
        private initMainView();
        private setViewMode(mode);
        private _pageLayout;
        private _pageController;
        private static ALTO_TEXT_HREF;
        private static PDF_TEXT_HREF;
        private _hrefImageMap;
        private _hrefPageMap;
        private _orderImageMap;
        private _orderPageMap;
        private _hrefPageLoadingMap;
        private _structureImages;
        private _currentImage;
        private _horizontalScrollbar;
        private _verticalScrollbar;
        private _languageModel;
        private _rotateButton;
        private _layoutToolbarButton;
        private _desktopDelegators;
        private _touchDelegators;
        private _permalinkState;
        private _toggleButton;
        _imageView: widgets.canvas.PageView;
        private _altoView;
        _componentContent: JQuery;
        private _enableAltoSpecificButtons;
        private _selectionSwitchButton;
        private _viewSelectButton;
        private _viewMode;
        private _toolbarModel;
        private _layouts;
        private _rotation;
        private _layoutModel;
        private _pageLoader;
        private pageWidth;
        private pageHeight;
        private static DEFAULT_CANVAS_OVERVIEW_MIN_VISIBLE_SIZE;
        private static OVERVIEW_VISIBLE_ICON;
        private static OVERVIEW_INVISIBLE_ICON;
        private changeImage(image, extern);
        private fitViewportOverPage();
        private fitViewerportOverPageWidth();
        handlesEvents: string[];
        previousImage(): void;
        nextImage(): void;
        getPageController(): widgets.canvas.PageController;
        getPageLayout(): widgets.canvas.PageLayout;
        getRotation(): number;
        setRotation(rotation: number): void;
        private changePageLayout(pageLayout);
        private loadPageIfNotPresent(imageHref, order);
        private restorePermalink();
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        private setAltoOnTop(onTop);
        isAltoSelectable(): boolean;
        private setAltoSelectable(selectable);
        private setSelectableButtonEnabled(enabled);
        private addLayout(layout);
        private synchronizeLayoutToolbarButton();
        private updateToolbarLabel();
        private update();
        private _structureModelLoaded();
        private initPageLayouts();
        private _imageByHref(href);
        private registerDesktopInputHandler(listener);
        private registerTouchInputHandler(listener);
    }
}
declare namespace mycore.viewer.model {
    interface Layer {
        getLabel(): string;
        getId(): string;
        resolveLayer(pageHref: string, callback: (success: boolean, content?: JQuery) => void): void;
    }
}
declare namespace mycore.viewer.components.events {
    class ProvideLayerEvent extends MyCoReImageViewerEvent {
        layer: model.Layer;
        constructor(component: ViewerComponent, layer: model.Layer);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.widgets.layer {
    class LayerDisplayModel {
        constructor();
        onLayerAdd: LayerCallback[];
        onLayerRemove: LayerCallback[];
        currentPage: string;
        addLayer(layer: model.Layer): void;
        removeLayer(layer: model.Layer): void;
        getLayerList(): model.Layer[];
        private layerList;
    }
    interface LayerCallback {
        (layer: model.Layer): void;
    }
}
declare namespace mycore.viewer.widgets.layer {
    class LayerDisplayController {
        private _container;
        private languageResolver;
        constructor(_container: JQuery, languageResolver: (id: string) => string);
        private initializeView();
        private _view;
        private _layerIdViewMap;
        private static REMOVE_EXCLUDE_CLASS;
        private _layerIdCallbackMap;
        private addLayerView(layer);
        private createLayerView(layer);
        private removeLayerView(layer);
        private getLayerView(id);
        private cleanLayerView(id);
        private initializeModel();
        private model;
        addLayer(layer: model.Layer): void;
        removeLayer(layer: model.Layer): void;
        getLayer(): model.Layer[];
        pageChanged(newHref: string): void;
        private synchronizeView();
    }
}
declare namespace mycore.viewer.components {
    class MyCoReLayerComponent extends ViewerComponent {
        private _settings;
        constructor(_settings: MyCoReViewerSettings);
        private showLayerOnStart;
        private enabled;
        private toolbarButtonSync;
        private layerSync;
        private structureModel;
        private languageModel;
        private toolbarModel;
        private dropDownButton;
        private layerList;
        private layerIdLayerMap;
        private layerDisplay;
        private static SIDEBAR_LAYER_SIZE;
        private currentHref;
        private container;
        private static LAYER_DROPDOWN_ID;
        private sidebarLabel;
        init(): void;
        private updateContainerSize();
        handlesEvents: string[];
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        private toggleTranscriptionContainer(transcriptionType, clear?);
        private showContainer();
        private hideContainer();
        toolbarButtonInitialized(): boolean;
        toolbarButtonDisplayable(): boolean;
        initToolbarButton(): void;
        synchronizeLayers(): void;
    }
}
declare namespace mycore.viewer.components {
    class MyCoReButtonChangeComponent extends ViewerComponent {
        private _settings;
        constructor(_settings: MyCoReViewerSettings);
        init(): void;
        handlesEvents: string[];
        private _nextImageButton;
        private _previousImageButton;
        private _structureModel;
        private _currentImage;
        private _checkAndDisableSynchronize;
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
    }
}
declare var IVIEW_COMPONENTS: Array<any>;
declare namespace mycore.viewer {
    class MyCoReViewer {
        private _container;
        private _settings;
        constructor(_container: JQuery, _settings: MyCoReViewerSettings);
        private _eventHandlerMap;
        private _initializing;
        private _initializingEvents;
        private _components;
        container: JQuery;
        addComponent(ic: mycore.viewer.components.ViewerComponent): void;
        private eventTriggered(e);
        private initialize();
    }
}
declare namespace mycore.viewer.widgets.modal {
    class ViewerErrorModal extends IviewModalWindow {
        constructor(_mobile: boolean, errorTitle: string, errorText: string, imageUrl?: string, parent?: HTMLElement);
    }
}
declare namespace mycore.viewer.widgets.modal {
    class ViewerInfoModal extends IviewModalWindow {
        constructor(_mobile: boolean, title: string, text: string, parent?: HTMLElement);
    }
}
declare namespace mycore.viewer.widgets.modal {
    class ViewerConfirmModal extends IviewModalWindow {
        constructor(_mobile: boolean, confirmTitle: string, confirmText: string, callback: Function, parent?: HTMLElement);
        private createButton(confirm, callback);
    }
}
declare namespace mycore.viewer.components.events {
    class PageLoadedEvent extends MyCoReImageViewerEvent {
        _pageId: string;
        abstractPage: model.AbstractPage;
        constructor(component: ViewerComponent, _pageId: string, abstractPage: model.AbstractPage);
        static TYPE: string;
    }
}

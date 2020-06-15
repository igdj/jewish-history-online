/// <reference path="../../../../../../../src/main/typescript/modules/desktop/definitions/bootstrap.d.ts" />
declare namespace mycore.viewer.model {
    class MyCoReDesktopToolbarModel extends model.MyCoReBasicToolbarModel {
        constructor(name?: string);
        _viewSelectGroup: widgets.toolbar.ToolbarGroup;
        viewSelectChilds: Array<widgets.toolbar.ToolbarDropdownButtonChild>;
        viewSelect: widgets.toolbar.ToolbarDropdownButton;
        selectionSwitchButton: widgets.toolbar.ToolbarButton;
        addComponents(): void;
        addViewSelectButton(): void;
        addSelectionSwitchButton(): void;
    }
}
declare namespace mycore.viewer.model {
    class MyCoReFrameToolbarModel extends model.MyCoReDesktopToolbarModel {
        constructor();
        addComponents(): void;
        shrink(): void;
    }
}
declare namespace mycore.viewer.components {
    class MyCoReFrameToolbarProviderComponent extends ViewerComponent {
        private _settings;
        constructor(_settings: MyCoReViewerSettings);
        handlesEvents: string[];
        init(): void;
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
    }
}
declare namespace mycore.viewer.components {
    class MyCoReImageInformationComponent extends ViewerComponent {
        private _settings;
        constructor(_settings: MyCoReViewerSettings);
        init(): void;
        private _informationBar;
        private _imageLabel;
        private _rotation;
        private _scale;
        private _scaleEditForm;
        private _scaleEdit;
        private _pageLayout;
        private _currentZoom;
        private _currentRotation;
        private initScaleChangeLogic();
        private endEdit();
        private applyNewZoom();
        validateScaleEdit(): boolean;
        handlesEvents: string[];
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        updateLayoutInformation(): void;
        container: JQuery;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class DoublePageLayout extends PageLayout {
        relocated: boolean;
        private _rotation;
        private _currentPage;
        syncronizePages(): void;
        clear(): void;
        fitToScreen(): void;
        calculatePageAreaInformation(order: number): PageAreaInformation;
        checkShouldBeInserted(order: number): boolean;
        fitToWidth(attop?: boolean): void;
        getCurrentPage(): number;
        jumpToPage(order: number): void;
        private getPageHeightSpace();
        private getPageHeightWithSpace();
        getImageMiddle(order: number): Position2D;
        private correctViewport();
        scrollhandler(): void;
        rotate(deg: number): void;
        getLabelKey(): string;
        getCurrentOverview(): Rect;
        getDoublePageRect(order: number): Rect;
        getPageRect(order: number): Rect;
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
    class DoublePageRelocatedLayout extends DoublePageLayout {
        relocated: boolean;
        getLabelKey(): string;
    }
}
declare namespace mycore.viewer.components {
    class MyCoRePageDesktopLayoutProviderComponent extends ViewerComponent {
        private _settings;
        constructor(_settings: MyCoReViewerSettings);
        handlesEvents: string[];
        init(): void;
    }
}
declare namespace mycore.viewer.model {
    class MyCoReViewerSearcher {
        constructor();
        index(model: model.StructureModel, textContentResolver: (id: string, callback: (id: string, textContent: model.TextContentModel) => void) => void, processIndicator: (x, ofY) => void): void;
        model: model.StructureModel;
        textContentResolver: (id: string, callback: (id: string, textContent: model.TextContentModel) => void) => void;
        processIndicator: (x, ofY) => void;
        search(query: string, resultReporter: (objects: Array<ResultObject>) => void, searchCompleteCallback: (maxResults?: number) => void, count?: number, start?: number): void;
    }
    class ResultObject {
        arr: Array<model.TextElement>;
        matchWords: Array<string>;
        context: JQuery;
        constructor(arr: Array<model.TextElement>, matchWords: Array<string>, context: JQuery);
    }
}
declare namespace mycore.viewer.components.events {
    class ProvideViewerSearcherEvent extends MyCoReImageViewerEvent {
        private _searcher;
        constructor(component: ViewerComponent, _searcher: model.MyCoReViewerSearcher);
        searcher: model.MyCoReViewerSearcher;
        static TYPE: string;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class SearchResultCanvasPageLayer implements widgets.canvas.CanvasPageLayer {
        private selected;
        private areas;
        select(page: string, rect: Rect): void;
        add(page: string, rect: Rect): void;
        clear(): void;
        clearSelected(): void;
        draw(ctx: CanvasRenderingContext2D, id: string, pageSize: Size2D, drawOnHtml?: boolean): void;
        private drawWithPadding(ctx, pageAreas, pageSize);
        private drawWords(ctx, pageAreas);
    }
}
declare namespace mycore.viewer.components {
    class MyCoReSearchComponent extends ViewerComponent {
        private _settings;
        constructor(_settings: MyCoReViewerSettings);
        private _container;
        private _searchContainer;
        private _sidebarLabel;
        private _model;
        private _valueToApply;
        private _containerVisible;
        private _indexPrepared;
        private _indexPreparing;
        private _textPresent;
        private _toolbarTextInput;
        private _searcher;
        private _imageHrefImageMap;
        private _searchResultCanvasPageLayer;
        private _containerVisibleModelLoadedSync;
        private _toolbarLoadedLanguageModelLoadedSync;
        private _tbModel;
        private _languageModel;
        private _panel;
        private _progressbar;
        private _progressbarInner;
        private _searchTextTimeout;
        private _searchAreaReady;
        container: JQuery;
        private initSearchArea();
        private _search(str);
        init(): void;
        private updateContainerSize();
        handlesEvents: string[];
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        private openSearch();
        private _prepareIndex(model);
        private _updateLabel(current, of);
        private _initProgressbar();
    }
}
declare namespace mycore.viewer.widgets.index {
    class TextIndex<T> {
        private _fullTextProvider;
        constructor(_fullTextProvider: (T) => string);
        private static DEFAULT_CONTEXT_SIZE;
        private static TEXT_HIGHLIGHT_CLASSNAME;
        private static MATCH_TEMPLATE_WORD;
        private static MATCH_TEMPLATE_WORD_SHORT;
        private static MATCH_TEMPLATE;
        private static MATCH_PARAMETER;
        private static MATCH_WORD_REGEXP;
        private _fullTextInformationIndex;
        private _currentPosition;
        private _fullText;
        addElement(elem: T): void;
        search(searchInput: string): SearchResult<T>;
        private extractResults(match, resultObjects, searchWords);
        getContext(pos: number, words: Array<string>): JQuery;
    }
    class SearchResult<T> {
        results: Array<IndexResultObject<T>>;
        count: number;
        constructor(results: Array<IndexResultObject<T>>, count: number);
    }
    class IndexResultObject<T> {
        arr: Array<T>;
        matchWords: Array<string>;
        context: JQuery;
        constructor(arr: Array<T>, matchWords: Array<string>, context: JQuery);
    }
    interface Tokenizer<T> {
        getToken(elem: T): Array<string>;
    }
}
declare namespace mycore.viewer.model {
    class MyCoReLocalIndexSearcher extends MyCoReViewerSearcher {
        constructor();
        index(model: model.StructureModel, textContentResolver: (id: string, callback: (id: string, textContent: model.TextContentModel) => void) => void, processIndicator: (x, ofY) => void): void;
        private _searchIndex;
        private static PDF_TEXT_HREF;
        private indexModel();
        private indexPage(text);
        private clearDoubleResults(searchResults);
        search(query: string, resultReporter: (objects: Array<ResultObject>) => void, searchCompleteCallback: (maxResults?: number) => void, count?: number, start?: number): void;
    }
}
declare namespace mycore.viewer.components {
    class MyCoReLocalViewerIndexSearcherProvider extends ViewerComponent {
        private _settings;
        constructor(_settings: MyCoReViewerSettings);
        handlesEvents: string[];
        init(): void;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class BootstrapTextView implements TextView {
        private _id;
        constructor(_id: string);
        private element;
        updateText(text: string): void;
        getElement(): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class BootstrapImageView implements ImageView {
        constructor(id: string);
        private _element;
        updateHref(href: string): void;
        getElement(): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class BootstrapGroupView {
        constructor(id: string, align: string);
        private _element;
        addChild(child: JQuery): void;
        removeChild(child: JQuery): void;
        getElement(): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class BootstrapButtonView implements ButtonView {
        constructor(id: string);
        _buttonElement: JQuery;
        private _icon;
        private _attached;
        private _buttonLabel;
        private _lastIconClass;
        private _lastButtonClass;
        updateButtonLabel(label: string): void;
        updateButtonTooltip(tooltip: string): void;
        updateButtonIcon(icon: string): void;
        updateButtonClass(buttonClass: string): void;
        updateButtonActive(active: boolean): void;
        updateButtonDisabled(disabled: boolean): void;
        static getBootstrapIcon(icon: string): string;
        getElement(): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class BootstrapDropdownView extends BootstrapButtonView implements DropdownView {
        constructor(_id: string);
        private _caret;
        private _dropdownMenu;
        private _childMap;
        updateChilds(childs: Array<{
            id: string;
            label: string;
            isHeader?: boolean;
            icon?: string;
        }>): void;
        getChildElement(id: string): JQuery;
        getElement(): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class BootstrapLargeDropdownView implements DropdownView {
        private _id;
        constructor(_id: string);
        private _buttonElement;
        updateButtonLabel(label: string): void;
        updateButtonTooltip(tooltip: string): void;
        updateButtonIcon(icon: string): void;
        updateButtonClass(buttonClass: string): void;
        updateButtonActive(active: boolean): void;
        updateButtonDisabled(disabled: boolean): void;
        private _childMap;
        updateChilds(childs: Array<{
            id: string;
            label: string;
        }>): void;
        getChildElement(id: string): JQuery;
        getElement(): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class BootstrapTextInputView implements TextInputView {
        private _id;
        constructor(_id: string);
        private element;
        private childText;
        onChange: () => void;
        updateValue(value: string): void;
        getValue(): string;
        getElement(): JQuery;
        updatePlaceholder(placeHolder: string): void;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class BootstrapToolbarView implements ToolbarView {
        constructor();
        private _toolbar;
        addChild(child: JQuery): void;
        removeChild(child: JQuery): void;
        getElement(): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class BootstrapToolbarViewFactory implements ToolbarViewFactory {
        createToolbarView(): ToolbarView;
        createTextView(id: string): TextView;
        createImageView(id: string): ImageView;
        createGroupView(id: string, align: string): GroupView;
        createDropdownView(id: string): DropdownView;
        createLargeDropdownView(id: string): DropdownView;
        createButtonView(id: string): ButtonView;
        createTextInputView(id: string): TextInputView;
    }
}

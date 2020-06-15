declare namespace mycore.viewer.widgets.mets {
    class MetsStructureModel extends model.StructureModel {
        smLinkMap: MyCoReMap<string, Array<string>>;
        private altoPresent;
        constructor(smLinkMap: MyCoReMap<string, Array<string>>, _rootChapter: model.StructureChapter, _imageList: Array<model.StructureImage>, _chapterToImageMap: MyCoReMap<string, model.StructureImage>, _imageToChapterMap: MyCoReMap<string, model.StructureChapter>, _imageHrefImageMap: MyCoReMap<string, model.StructureImage>, altoPresent: boolean);
    }
}
declare namespace mycore.viewer.widgets.mets {
    class MetsStructureBuilder {
        private metsDocument;
        private tilePathBuilder;
        private static METS_NAMESPACE_URI;
        private static XLINK_NAMESPACE_URI;
        private static ALTO_TEXT;
        private static TEI_TRANSCRIPTION;
        private static TEI_TRANSLATION;
        private hrefResolverElement;
        private _smLinkMap;
        private _chapterIdMap;
        private _idFileMap;
        private _idPhysicalFileMap;
        private _chapterImageMap;
        private _imageChapterMap;
        private _metsChapter;
        private _imageList;
        private _structureModel;
        private _idImageMap;
        private _improvisationMap;
        private _imageHrefImageMap;
        private static NS_RESOLVER;
        private static NS_MAP;
        constructor(metsDocument: Document, tilePathBuilder: (href: string) => string);
        processMets(): model.StructureModel;
        getStructMap(type: string): Node;
        getGroups(): Node[];
        getFiles(group: string): Array<Node>;
        getStructLinks(): Array<Element>;
        private processChapter(parent, chapter);
        private processFPTR(parent, fptrElem);
        private parseArea(parent, area);
        private getIdFileMap(fileGrpChildren);
        private getIdPhysicalFileMap();
        private getFirstElementChild(node);
        private getAttributeNs(element, namespaceKey, attribute);
        private processImages();
        private makeLinks();
        private makeLink(chapter, image);
        private extractTranslationLanguage(href);
        private parseFile(physFileDiv, defaultOrder);
    }
}
declare namespace mycore.viewer.widgets.mets {
    class IviewMetsProvider {
        static loadModel(metsDocumentLocation: string, tilePathBuilder: (href: string) => string): GivenViewerPromise<{
            model: model.StructureModel;
            document: Document;
        }, any>;
    }
}
declare namespace mycore.viewer.components.events {
    class MetsLoadedEvent extends MyCoReImageViewerEvent {
        mets: {
            model: model.StructureModel;
            document: Document;
        };
        constructor(component: ViewerComponent, mets: {
            model: model.StructureModel;
            document: Document;
        });
        static TYPE: string;
    }
}
declare namespace mycore.viewer.widgets.alto {
    interface AltoChangeSet {
        wordChanges: Array<AltoWordChange>;
        derivateID: string;
    }
    class AltoChange {
        file: string;
        type: string;
        pageOrder: number;
        constructor(file: string, type: string, pageOrder: number);
    }
    class AltoWordChange extends AltoChange {
        hpos: number;
        vpos: number;
        width: number;
        height: number;
        from: string;
        to: string;
        static TYPE: string;
        constructor(file: string, hpos: number, vpos: number, width: number, height: number, from: string, to: string, pageOrder: number);
    }
}
declare namespace mycore.viewer.components {
    import AltoChangeSet = mycore.viewer.widgets.alto.AltoChangeSet;
    interface MetsSettings extends MyCoReViewerSettings {
        altoChangePID: string;
        metsURL: string;
        imageXmlPath: string;
        pageRange: number;
        pdfCreatorURI: string;
        pdfCreatorStyle: string;
        pdfCreatorFormatString?: string;
        pdfCreatorRestrictionFormatString?: string;
        altoChanges?: AltoChangeSet;
        altoEditorPostURL?: string;
        altoReviewer?: boolean;
    }
}
declare namespace mycore.viewer.components {
    class MyCoReMetsComponent extends ViewerComponent {
        private _settings;
        private container;
        constructor(_settings: MetsSettings, container: JQuery);
        private errorSync;
        private metsAndLanguageSync;
        private error;
        private lm;
        private mm;
        init(): void;
        private _metsLoaded;
        private _eventToTrigger;
        private postProcessChapter(chapter);
        private buildTranslationKey(type);
        private metsLoaded(structureModel);
        handlesEvents: string[];
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
    }
}
declare namespace mycore.viewer.widgets.image {
    class XMLImageInformationProvider {
        static getInformation(basePath: string, href: string, callback: (XMLImageInformation) => void, errorCallback?: (err) => void): void;
        private static proccessXML(imageInfo, path);
    }
    class XMLImageInformation {
        private _derivate;
        private _path;
        private _tiles;
        private _width;
        private _height;
        private _zoomlevel;
        constructor(_derivate: string, _path: string, _tiles: any, _width: number, _height: number, _zoomlevel: number);
        derivate: string;
        path: string;
        tiles: any;
        width: number;
        height: number;
        zoomlevel: number;
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class TileImagePage implements model.AbstractPage {
        id: string;
        private _width;
        private _height;
        constructor(id: string, _width: number, _height: number, _tilePaths: Array<string>);
        private static TILE_SIZE;
        private _tilePath;
        private _tiles;
        private _loadingTiles;
        private _backBuffer;
        private _backBufferArea;
        private _backBufferAreaZoom;
        private _previewBackBuffer;
        private _previewBackBufferArea;
        private _previewBackBufferAreaZoom;
        private _imgPreviewLoaded;
        private _imgNotPreviewLoaded;
        private htmlContent;
        size: Size2D;
        refreshCallback: () => void;
        draw(ctx: CanvasRenderingContext2D, rect: Rect, scale: any, overview: boolean): void;
        getHTMLContent(): ViewerProperty<HTMLElement>;
        private updateHTML();
        clear(): void;
        private _updateBackbuffer(startX, startY, endX, endY, zoomLevel, overview);
        private static EMPTY_FUNCTION;
        private _abortLoadingTiles();
        private _drawToBackbuffer(startX, startY, endX, endY, zoomLevel, _overview);
        private drawPreview(ctx, targetPosition, tile);
        private loadTile(tilePos);
        private getPreview(tilePos, scale?);
        private maxZoomLevel();
        private getZoomLevel(scale);
        private scaleForLevel(level);
        private _loadTile(tilePos, okCallback, errorCallback);
        toString(): string;
    }
}
declare namespace mycore.viewer.widgets.alto {
    class AltoStyle {
        private _id;
        private _fontFamily;
        private _fontSize;
        private _fontStyle;
        constructor(_id: string, _fontFamily: string, _fontSize: number, _fontStyle: string);
        getId(): string;
        getFontFamily(): string;
        getFontSize(): number;
        getFontStyle(): string;
    }
}
declare enum AltoElementType {
    ComposedBlock = 0,
    Illustration = 1,
    GraphicalElement = 2,
    TextBlock = 3,
    TextLine = 4,
    String = 5,
    SP = 6,
    HYP = 7,
}
declare namespace mycore.viewer.widgets.alto {
    class AltoElement {
        private _parent;
        private _type;
        private _id;
        private _width;
        private _height;
        private _hpos;
        private _vpos;
        private _wc;
        private _children;
        private _content;
        private _style;
        constructor(_parent: AltoElement, _type: AltoElementType, _id: string, _width: number, _height: number, _hpos: number, _vpos: number, _wc: number);
        getHeight(): number;
        getHPos(): number;
        getId(): string;
        getType(): AltoElementType;
        getVPos(): number;
        getWidth(): number;
        getWordConfidence(): number;
        getChildren(): Array<AltoElement>;
        setChildren(childs: Array<AltoElement>): void;
        getContent(): string;
        setContent(content: string): void;
        getStyle(): AltoStyle;
        setAltoStyle(style: AltoStyle): void;
        getParent(): AltoElement;
        getBlockHPos(): number;
        getBlockVPos(): number;
        asRect(): Rect;
    }
}
declare namespace mycore.viewer.widgets.alto {
    class AltoFile {
        allElements: Array<mycore.viewer.widgets.alto.AltoElement>;
        private _allStyles;
        private _rootChilds;
        private _allElements;
        private _allTextBlocks;
        private _allIllustrations;
        private _allLines;
        private _allComposedBlock;
        private _allGraphicalElements;
        private _pageWidth;
        private _pageHeight;
        constructor(styles: Element, layout: Element);
        private createAltoStyle(src);
        private createAltoElement(src, type, parent);
        private extractElements(elem, parent?);
        getBlocks(): Array<AltoElement>;
        getBlockContent(id: string): string;
        getContainerContent(id: string, container: Array<AltoElement>): string;
        getLines(): Array<AltoElement>;
        pageWidth: number;
        pageHeight: number;
        private detectElementType(currentElement);
    }
}
declare namespace mycore.viewer.components.events {
    class RequestAltoModelEvent extends MyCoReImageViewerEvent {
        _href: string;
        _onResolve: (imgName: string, altoName: string, altoContainer: widgets.alto.AltoFile) => void;
        constructor(component: ViewerComponent, _href: string, _onResolve: (imgName: string, altoName: string, altoContainer: widgets.alto.AltoFile) => void);
        static TYPE: string;
    }
}
declare namespace mycore.viewer.components {
    class MyCoReAltoModelProvider extends ViewerComponent {
        private _settings;
        constructor(_settings: MetsSettings);
        private structureModel;
        private pageHrefAltoHrefMap;
        private altoHrefPageHrefMap;
        private altoModelRequestTempStore;
        private static altoHrefModelMap;
        private static TEXT_HREF;
        init(): void;
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        private detectHrefs(href);
        private fillAltoHrefMap();
        handlesEvents: string[];
        private resolveAltoModel(pageId, callback);
        loadAltoXML(altoPath: string, successCallback: any, errorCallback: any): void;
        loadedAltoModel(parentId: string, altoHref: string, xml: any, callback: (altoContainer: widgets.alto.AltoFile) => void): void;
    }
}
declare namespace mycore.viewer.widgets.alto {
    class AltoHTMLGenerator {
        constructor();
        generateHtml(alto: widgets.alto.AltoFile, altoID: string): HTMLElement;
        private getWordsArray(line);
        private getLineAsString(line);
        private getFontSize(ctx, block, fontFamily);
        private getLineAsElement(line);
    }
}
declare namespace mycore.viewer.components {
    class MyCoReMetsPageProviderComponent extends ViewerComponent {
        private _settings;
        constructor(_settings: MetsSettings);
        init(): void;
        private _imageInformationMap;
        private _imagePageMap;
        private _altoHTMLGenerator;
        private _imageHTMLMap;
        private _imageCallbackMap;
        private getPage(image, resolve);
        private createPageFromMetadata(imageId, metadata);
        private getPageMetadata(image, resolve);
        handlesEvents: string[];
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
    }
}
declare namespace mycore.viewer.widgets.modal {
    class ViewerPrintModalWindow extends IviewModalWindow {
        constructor(_mobile: boolean);
        private static INPUT_IDENTIFIER;
        private static INPUT_RANGE_IDENTIFIER;
        private static INPUT_RANGE_TEXT_IDENTIFIER;
        private static INPUT_CHAPTER_VALUE;
        static INPUT_ALL_VALUE: string;
        static INPUT_RANGE_VALUE: string;
        static INPUT_CURRENT_VALUE: string;
        private _validationRow;
        private _inputRow;
        private _previewBox;
        private _previewImage;
        private _pageSelectBox;
        private _okayButton;
        private _selectGroup;
        private _radioAllPages;
        private _radioAllPagesLabelElement;
        private _radioAllPagesLabel;
        private _radioAllPagesInput;
        private _radioCurrentPage;
        private _radioCurrentPageLabelElement;
        private _radioCurrentPageLabel;
        private _radioCurrentPageInput;
        private _radioRangePages;
        private _radioRangePagesLabelElement;
        private _radioRangePagesLabel;
        private _radioRangePagesInput;
        private _radioRangePagesInputText;
        private _radioChapter;
        private _radioChapterInput;
        private _chapterLabelElement;
        private _radioChapterLabel;
        private _chapterSelect;
        private _validationMessage;
        private _maximalPageMessage;
        private _maximalPageNumber;
        checkEventHandler: (id: string) => void;
        rangeInputEventHandler: (text: string) => void;
        chapterInputEventHandler: (id: string) => void;
        okayClickHandler: () => void;
        private _createRadioAllPages();
        private _createRadioCurrentPage();
        private _createRadioRangePages();
        private _createRadioChapters();
        rangeChecked: boolean;
        allChecked: boolean;
        currentChecked: boolean;
        chapterChecked: boolean;
        validationResult: boolean;
        validationMessage: string;
        currentPageLabel: string;
        allPagesLabel: string;
        rangeLabel: string;
        previewImageSrc: string;
        rangeInputVal: any;
        rangeInputEnabled: boolean;
        chapterLabel: string;
        maximalPages: string;
        maximalPageMessage: string;
        setChapterTree(chapters: Array<{
            id: string;
            label: string;
        }>): void;
        chapterInputVal: any;
    }
}
declare namespace mycore.viewer.components {
    class MyCoRePrintComponent extends ViewerComponent {
        private _settings;
        constructor(_settings: MetsSettings);
        private _modalWindow;
        private _currentImage;
        private _structureModel;
        private _languageModel;
        private _maxPages;
        private _printButton;
        private _enabled;
        handlesEvents: string[];
        init(): void;
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        getChapterViewModel(chapter?: model.StructureChapter, indent?: number): Array<{
            id: string;
            label: string;
        }>;
        private initModalWindow();
        private handleChapterChecked();
        private handleCurrentChecked();
        private handleAllChecked();
        private handleRangeChecked();
        private buildPDFRequestLink(pages?);
        private buildRestrictionLink();
        private _resolveMaxRequests();
        private findChapterWithID(id, chapter?);
        private validateRange(range);
        private isValidPage(page);
        private getRangeOfChapter(chapter);
    }
}
declare namespace mycore.viewer.widgets.canvas {
    class HighlightAltoChapterCanvasPageLayer implements widgets.canvas.CanvasPageLayer {
        selectedChapter: components.AltoChapter;
        highlightedChapter: components.AltoChapter;
        fadeAnimation: widgets.canvas.InterpolationAnimation;
        private chaptersToClear;
        private enabled;
        isEnabled(): boolean;
        setEnabled(enabled: boolean): void;
        draw(ctx: CanvasRenderingContext2D, id: string, pageSize: Size2D, drawOnHtml?: boolean): void;
        private isChapterSelected();
        private isHighlighted();
        private isLinkedWithoutBlocks(fileID);
        private darkenPage(ctx, pageSize, rgba);
        private clearRects(ctx, id);
        private drawRects(ctx, pageId, pages, rgba);
    }
}
declare namespace mycore.viewer.components {
    class MyCoReHighlightAltoComponent extends ViewerComponent {
        private _settings;
        private container;
        private pageLayout;
        private highlightLayer;
        private _model;
        private _altoChapterContainer;
        private selectedChapter;
        private highlightedChapter;
        constructor(_settings: MetsSettings, container: JQuery);
        init(): any;
        handlesEvents: string[];
        isEnabled: boolean;
        getPageLayout(): widgets.canvas.PageLayout;
        getPageController(): widgets.canvas.PageController;
        getAltoChapterContainer(): AltoChapterContainer;
        setChapter(chapterId: string, triggerChapterChangeEvent?: boolean, forceChange?: boolean): void;
        setHighlightChapter(chapterId: string): void;
        handleDarkenPageAnimation(): void;
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
    }
    class AltoChapterContainer {
        private _model;
        chapters: MyCoReMap<string, AltoChapter>;
        pageChapterMap: MyCoReMap<string, Array<string>>;
        private _loadedPages;
        constructor(_model: widgets.mets.MetsStructureModel);
        hasLoadedPages(): boolean;
        getAreaListOfChapter(chapter: model.StructureChapter): Array<MetsArea>;
        getChapter(chapterId: string): model.StructureChapter;
        findChapter(from: model.StructureChapter, chapterId: string): model.StructureChapter;
        getBlocklistOfChapterAndAltoHref(chapterId: string, altoHref: string): Array<MetsArea>;
        getAllBlocklistChapters(from: model.StructureChapter): Array<model.StructureChapter>;
        addPage(pageId: string, altoHref: string, alto: widgets.alto.AltoFile): void;
    }
    class AltoChapter {
        chapterId: string;
        metsAreas: MyCoReMap<string, Array<MetsArea>>;
        altoRectMap: MyCoReMap<string, Array<Rect>>;
        boundingBoxMap: MyCoReMap<string, Array<Rect>>;
        constructor(chapterId: string);
        addPage(pageId: string, altoFile: widgets.alto.AltoFile, metsAreas: Array<MetsArea>): void;
        maximize(pageId: string): Rect;
        fixBoundingBox(pageId: string, rect: Rect): void;
        intersectsText(pageId: string, rect: Rect): boolean;
        fixIntersections(pageId: string, other: AltoChapter): void;
        cutVerticalBoundingBox(pageId: string, y: number): void;
        fixEmptyAreas(pageId: string, alto: widgets.alto.AltoFile): void;
        private getAltoBlocks(altoFile, metsAreas);
        private getAreaRects(altoFile, blocks);
    }
    class MetsArea {
        altoRef: string;
        begin: string;
        end: string;
        constructor(altoRef: string, begin: string, end: string);
        contains(blockIds: Array<string>, paragraph: string): boolean;
    }
}
declare namespace mycore.viewer.widgets.alto {
    class AltoEditorWidget {
        private i18n;
        private widgetElement;
        private tableContainer;
        private buttonContainer;
        changeWordButton: JQuery;
        private idChangeMap;
        private fileChangeMap;
        private idViewMap;
        private pageHeading;
        private actionHeading;
        private infoHeading;
        private changeClickHandler;
        private changeRemoveClickHandler;
        private submitClickHandler;
        private applyClickHandler;
        private deleteClickHandler;
        private submitButton;
        private applyButton;
        private deleteButton;
        constructor(container: JQuery, i18n: model.LanguageModel);
        enableApplyButton(enabled?: boolean): void;
        addChangeClickedEventHandler(handler: (change: AltoChange) => void): void;
        addSubmitClickHandler(handler: () => void): void;
        addApplyClickHandler(handler: () => void): void;
        addDeleteClickHandler(handler: () => void): void;
        addChangeRemoveClickHandler(handler: (change: AltoChange) => void): void;
        private getSortClickEventHandler(byClicked);
        private getCurrentSortMethod();
        private sortBy(by, down);
        private getSortFn(by, down);
        private downArrow;
        private upArrow;
        private createHTML();
        private getLabel(id);
        hasChange(key: string): boolean;
        getChange(key: string): AltoChange;
        getChanges(): MyCoReMap<string, AltoChange>;
        getChangesInFile(file: string): AltoChange[];
        addChange(key: string, change: AltoChange): void;
        private addRow(id, change);
        private getChangeText(change);
        updateChange(change: mycore.viewer.widgets.alto.AltoChange): void;
        getChangeID(change: mycore.viewer.widgets.alto.AltoChange): any;
        private getChangeHTMLContent(change);
        removeChange(wordChange: mycore.viewer.widgets.alto.AltoChange): void;
    }
}
declare namespace mycore.viewer.components {
    import DesktopInputAdapter = mycore.viewer.widgets.canvas.DesktopInputAdapter;
    class MyCoReAltoEditorComponent extends ViewerComponent {
        private _settings;
        private _container;
        private _structureImages;
        private _structureModel;
        private _altoPresent;
        private _languageModel;
        private _toolbarModel;
        private _sidebarControllDropdownButton;
        private _altoDropdownChildItem;
        private container;
        private containerTitle;
        editorWidget: mycore.viewer.widgets.alto.AltoEditorWidget;
        private static DROP_DOWN_CHILD_ID;
        private currentOrder;
        private currentAltoID;
        private highlightWordLayer;
        private altoIDImageMap;
        private imageHrefAltoContentMap;
        altoHrefImageHrefMap: MyCoReMap<string, string>;
        imageHrefAltoHrefMap: MyCoReMap<string, string>;
        private initialHtmlApplyList;
        constructor(_settings: MetsSettings, _container: JQuery);
        private everythingLoadedSynchronize;
        init(): void;
        private editorEnabled();
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        private openEditor();
        private updateHTML(pageId, element);
        mouseClick(position: Position2D, ev: JQueryMouseEventObject): void;
        private currentEditWord;
        private beforeEditWord;
        private static ENTER_KEY;
        private static ESC_KEY;
        private editWord(element, vpos, hpos, width, height);
        keyDown(e: JQueryKeyEventObject): void;
        private abortEdit(element);
        private resetWordEdit(element);
        private applyEdit(element, altoID, order);
        private calculateChangeKey(altoID, vpos, hpos);
        private endEdit(element);
        handlesEvents: string[];
        private toggleEditWord(enable?);
        isEditing(): boolean;
        private completeLoaded();
        private removeChange(change);
        private applyChanges(successCallback, errorCallback);
        private submitChanges(successCallback, errorCallback);
        private prepareData(changeSet);
        private findChange(wordChange, altoContent);
        private updateContainerSize();
        drag(currentPosition: Position2D, startPosition: Position2D, startViewport: Position2D, e: JQueryMouseEventObject): void;
        mouseDown(position: Position2D, e: JQueryMouseEventObject): void;
        private syncChanges(altoContent, href);
        private applyConfidenceLevel(altoContent);
        private removeConfidenceLevel(altoContent);
    }
    class EditAltoInputListener extends DesktopInputAdapter {
        private editAltoComponent;
        constructor(editAltoComponent: MyCoReAltoEditorComponent);
        mouseDown(position: Position2D, e: JQueryMouseEventObject): void;
        mouseUp(position: Position2D, e: JQueryMouseEventObject): void;
        mouseMove(position: Position2D, e: JQueryMouseEventObject): void;
        mouseClick(position: Position2D, e: JQueryMouseEventObject): void;
        mouseDoubleClick(position: Position2D, e: JQueryMouseEventObject): void;
        keydown(e: JQueryKeyEventObject): void;
        mouseDrag(currentPosition: Position2D, startPosition: Position2D, startViewport: Position2D, e: JQueryMouseEventObject): void;
    }
    interface HighlightedWord {
        hpos: number;
        vpos: number;
        width: number;
        height: number;
        id: string;
    }
    class HighligtAltoWordCanvasPageLayer implements widgets.canvas.CanvasPageLayer {
        private component;
        constructor(component: MyCoReAltoEditorComponent);
        private static EDIT_HIGHLIGHT_COLOR;
        private static EDITED_HIGHLIGHT_COLOR;
        private highlightedWord;
        getHighlightedWord(): HighlightedWord;
        setHighlightedWord(word: HighlightedWord): void;
        draw(ctx: CanvasRenderingContext2D, id: string, pageSize: Size2D, drawOnHtml: boolean): void;
        private strokeWord(ctx, hpos, vpos, wwidth, wheight, color);
    }
}

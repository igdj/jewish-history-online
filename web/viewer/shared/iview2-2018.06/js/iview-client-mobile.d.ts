declare namespace mycore.viewer.model {
    class MyCoReMobileToolbarModel extends MyCoReBasicToolbarModel {
        constructor();
        addComponents(): void;
        changeIcons(): void;
    }
}
declare namespace mycore.viewer.components {
    class MyCoReMobileToolbarProviderComponent extends ViewerComponent {
        private _settings;
        constructor(_settings: MyCoReViewerSettings);
        handlesEvents: string[];
        init(): void;
    }
}
declare namespace mycore.viewer.widgets.imagebar {
    interface ImagebarImage {
        type: string;
        id: string;
        order: number;
        orderLabel: string;
        href: string;
        mimetype: string;
        requestImgdataUrl: (callback: (imgdata: string) => void) => void;
    }
    class ImagebarModel {
        images: Array<ImagebarImage>;
        selected: ImagebarImage;
        constructor(images: Array<ImagebarImage>, selected: ImagebarImage);
        _lastPosition: number;
    }
}
declare namespace mycore.viewer.widgets.imagebar {
    class ImagebarView {
        private _imageSelectedCallback;
        constructor(__container: JQuery, _imageSelectedCallback: (position: number, hover: boolean) => void);
        private _idElementMap;
        private _lastSelectedId;
        private _container;
        private registerEvents();
        addImage(id: string, url: string, position: number): void;
        removeImage(id: string): void;
        setSelectedImage(id: string, url: string, pos: number): void;
        viewportWidth: number;
        removeAllImages(): void;
        containerElement: JQuery;
    }
}
declare namespace mycore.viewer.widgets.imagebar {
    class IviewImagebar {
        private _container;
        private _urlPrefix;
        constructor(_container: JQuery, images: Array<ImagebarImage>, startImage: ImagebarImage, imageSelected: (img: ImagebarImage) => void, _urlPrefix: string);
        private _model;
        private _view;
        private static IMAGE_WIDTH;
        private insertImages();
        private addImage(image, position);
        private getImageForPosition(position);
        private getPositionOfImage(image);
        private _imageSelected(position);
        setImageSelected(image: ImagebarImage): void;
        view: JQuery;
    }
}
declare namespace mycore.viewer.components {
    class MyCoReImagebarComponent extends ViewerComponent {
        private _settings;
        private _container;
        constructor(_settings: MyCoReViewerSettings, _container: JQuery);
        private _imagebar;
        private _model;
        _init(imageList: Array<model.StructureImage>): void;
        content: JQuery;
        handlesEvents: string[];
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
    }
}
declare namespace mycore.viewer.components {
    class MyCoRePageMobileLayoutProviderComponent extends ViewerComponent {
        private _settings;
        constructor(_settings: MyCoReViewerSettings);
        handlesEvents: string[];
        init(): void;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class MobileGroupView {
        constructor(id: string, align: string);
        private _element;
        addChild(child: JQuery): void;
        removeChild(child: JQuery): void;
        getElement(): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class MobileDropdownView implements DropdownView {
        private _id;
        constructor(_id: string);
        private _buttonElement;
        private _buttonElementInner;
        private _dropdown;
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
    class MobileButtonView implements ButtonView {
        constructor(id: string);
        _buttonElement: JQuery;
        private _buttonLabel;
        private _buttonIcon;
        private _lastIcon;
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
    class MobileToolbarView implements ToolbarView {
        constructor();
        private _toolbar;
        addChild(child: JQuery): void;
        removeChild(child: JQuery): void;
        getElement(): JQuery;
    }
}
declare namespace mycore.viewer.widgets.toolbar {
    class MobileToolbarViewFactory implements ToolbarViewFactory {
        createTextInputView(id: string): mycore.viewer.widgets.toolbar.TextInputView;
        createToolbarView(): ToolbarView;
        createTextView(id: string): TextView;
        createImageView(id: string): ImageView;
        createGroupView(id: string, align: string): GroupView;
        createDropdownView(id: string): DropdownView;
        createLargeDropdownView(id: string): DropdownView;
        createButtonView(id: string): ButtonView;
    }
}

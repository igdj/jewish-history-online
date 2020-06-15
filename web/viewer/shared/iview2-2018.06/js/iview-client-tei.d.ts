declare namespace mycore.viewer.widgets.tei {
    class TEILayer implements model.Layer {
        private _id;
        private _label;
        private mapping;
        private contentLocation;
        private teiStylesheet;
        constructor(_id: string, _label: string, mapping: MyCoReMap<string, string>, contentLocation: string, teiStylesheet: string);
        getId(): string;
        getLabel(): string;
        resolveLayer(pageHref: string, callback: (success: boolean, content?: JQuery) => void): void;
    }
}
declare namespace mycore.viewer.components {
    interface TEISettings extends MyCoReViewerSettings {
        teiStylesheet: string;
    }
}
declare namespace mycore.viewer.components {
    class MyCoReTEILayerProvider extends ViewerComponent {
        private _settings;
        constructor(_settings: TEISettings);
        private _model;
        private contentLocation;
        init(): void;
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        handlesEvents: string[];
    }
}

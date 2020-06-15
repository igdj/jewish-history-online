declare namespace mycore.viewer.components {
    interface MetadataSettings extends MyCoReViewerSettings {
        objId: string;
        metadataURL: string;
    }
    class MyCoReMetadataComponent extends ViewerComponent {
        private _settings;
        constructor(_settings: MetadataSettings);
        private _container;
        private _spinner;
        private _enabled;
        init(): void;
        private correctScrollPosition();
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        handlesEvents: string[];
    }
}

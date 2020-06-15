declare namespace mycore.viewer.components {
    interface ToolbarExtenderEntry {
        id: string;
        type: string;
        label?: string;
        icon?: string;
        href?: string;
        tooltip?: string;
        action?: () => void;
        inGroup?: string;
    }
    interface ToolbarExtenderSettings extends MyCoReViewerSettings {
        toolbar: ToolbarExtenderEntry[];
    }
    class MyCoReToolbarExtenderComponent extends ViewerComponent {
        private _settings;
        private idEntryMapping;
        private idButtonMapping;
        private idGroupMapping;
        constructor(_settings: ToolbarExtenderSettings);
        private toolbarModel;
        private languageModel;
        private toolbarButtonSync;
        init(): void;
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        handlesEvents: string[];
        initLanguage(): void;
    }
}

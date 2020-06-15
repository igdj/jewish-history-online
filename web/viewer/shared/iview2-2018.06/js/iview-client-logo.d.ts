declare namespace mycore.viewer.components {
    interface LogoSettings extends MyCoReViewerSettings {
        logoURL: string;
    }
    class MyCoReLogoComponent extends ViewerComponent {
        private _settings;
        constructor(_settings: LogoSettings);
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        handlesEvents: string[];
        init(): void;
    }
}

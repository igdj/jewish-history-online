declare var Piwik: any;
declare var window: Window;
declare namespace mycore.viewer.components {
    interface MyCoRePiwikComponentSettings extends MyCoReViewerSettings {
        "MCR.Piwik.baseurl": string;
        "MCR.Piwik.id": string;
    }
    class MyCoRePiwikComponent extends ViewerComponent {
        private _settings;
        private initialized;
        constructor(_settings: MyCoRePiwikComponentSettings);
        handle(e: mycore.viewer.widgets.events.ViewerEvent): void;
        handlesEvents: string[];
        trackImage(image: string): void;
        init(): void;
    }
}

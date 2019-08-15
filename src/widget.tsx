"use strict";

import { WidgetConfig } from "./models/config";
import { DEFAULT_WIDGET_CONFIG } from "./defaults";
import * as logging from "./utils/logging";
import { isValidDataSource } from "./utils/validators";

import "./style/widget.css";
import { StationService } from "./services/stations";
import { StationLookupResult, Station } from "./models/station";
import { formatLocation, formatScore, getScore } from "./utils/formatters";

const REGISTERED_WIDGETS = [];

class AQWidget {
    private intervalObj: any;
    private stationService: StationService;
    private widgetConfig: WidgetConfig;
    private htmlElement: HTMLElement;

    private stationLookupResult: StationLookupResult;
    private station: Station;

    private isLoading: boolean;
    private isInitialized: boolean;
    private isInfoOpened: boolean;

    constructor(config: WidgetConfig) {
        this.widgetConfig = config;
        this.stationService = new StationService(this.widgetConfig.apiBase);
        this.obtainHtmlElement();
        this.htmlElement.classList.add("aq-widget");

        this.isLoading = true;
        this.isInitialized = false;
        this.isInfoOpened = false;
    }

    public async initialize() {
        this.render();
        console.log("initialize()", this.widgetConfig.elementId);
        const lookupResult = await this.stationService.lookupStation("eea", this.widgetConfig.location);

        if (!lookupResult) {
            this.stationLookupResult = null;
            this.isInitialized = false;
            this.isLoading = false;
            console.warn(`No station near ${JSON.stringify(this.widgetConfig.location)} found.`);
        } else {
            this.stationLookupResult = lookupResult;
            this.isInitialized = true;
            this.isLoading = false;
            console.info(`Found station nearby: ${JSON.stringify(this.stationLookupResult)}`);
        }
        await this.sync();
        this.register();
    }

    private async sync() {
        console.log("sync()", this.widgetConfig.elementId);
        if (this.isInitialized) {
            await this.fetchData();
        }
        this.render();
    }

    private async fetchData() {
        const lookupResult = this.stationLookupResult;
        const station = await this.stationService.getStation("eea", lookupResult.countryCode, lookupResult.stationId);
        this.station = station;
    }

    private render() {
        this.obtainHtmlElement();
        const station = this.station;

        if (this.isLoading) {
            const content = '<p class="aq-widget-warning">Loading...</p>';
            this.renderInContainer(content, "neutral");
            return;
        }
        if (!this.isLoading && !this.isInitialized) {
            const content = '<p class="aq-widget-warning">No air quality station available...</p>';
            this.renderInContainer(content, "neutral");
            return;
        }

        const locationString = formatLocation(station.location);
        const aqiString = formatScore(station.measurements);
        const aqiScore = getScore(station.measurements);
        const iconId = "aq-widget-logo-icon-" + Math.random() * 10000;
        const iconElement = this.renderIcon(iconId);

        const background = aqiScore < 0 ? "neutral" : aqiString.replace(" ", "-");
        const showParticles = aqiScore < 2 && aqiScore >= 0;
        const content =
            '<p class="aq-widget-index">EU Common Air Quality Index</p>' +
            '<p class="aq-widget-score">' +
            aqiString +
            "</p>" +
            '<p class="aq-widget-location">' +
            locationString +
            "</p>" +
            iconElement;
        this.renderInContainer(content, background, showParticles);
        if (iconElement) {
            this.attachIconUrl(iconId, this.widgetConfig.iconUrl);
        }
    }

    private renderInContainer(inner: string, background: string, showParticles = false) {
        const infoLinkId = "aq-widget-info-link-" + Math.random() * 10000;
        this.htmlElement.innerHTML =
            '<div class="aq-widget-container aq-widget-' +
            background +
            '">' +
            (showParticles
                ? '<span class="aq-widget-particle-1"></span>' +
                  '<span class="aq-widget-particle-2"></span>' +
                  '<span class="aq-widget-particle-3"></span>'
                : "") +
            inner +
            '<span id="' +
            infoLinkId +
            '" class="aq-widget-info-icon">i</span>' +
            (this.isInfoOpened ? this.renderInfo() : "") +
            "</div>";
        this.attachHtmlListener(infoLinkId, "click", this.toggleInfo.bind(this));
    }

    private renderInfo() {
        return '<div class="aq-widget-info-box"><p>This application has been developed within the EOVALUE project, which has received funding from the European Union’s Horizon 2020 research and innovation programme. The JRC, or as the case may be the European Commission, shall not be held liable for any direct or indirect, incidental, consequential or other damages, including but not limited to the loss of data, loss of profits, or any other financial loss arising from the use of this application, or inability to use it, even if the JRC is notified of the possibility of such damages.</p></div>';
    }

    private renderIcon(iconId: string) {
        const iconUrl = this.widgetConfig.iconUrl;
        if (iconUrl) {
            return '<div class="aq-widget-logo-icon" id="' + iconId + '"></div>';
        }
        return "";
    }

    private obtainHtmlElement() {
        this.htmlElement = document.getElementById(this.widgetConfig.elementId);
    }

    private attachHtmlListener(elementId: string, type: string, listener: () => {}) {
        document.getElementById(elementId).addEventListener(type, listener);
    }

    private attachIconUrl(elementId: string, iconUrl: string) {
        document.getElementById(elementId).style.backgroundImage = "url('" + iconUrl + "')";
    }

    private toggleInfo() {
        this.isInfoOpened = !this.isInfoOpened;
        this.render();
    }

    private register() {
        REGISTERED_WIDGETS.push(this);
        this.intervalObj = setInterval(this.sync, 30000);
    }

    public unregister() {
        clearInterval(this.intervalObj);
        for (var i = 0; i < REGISTERED_WIDGETS.length; i++) {
            if (REGISTERED_WIDGETS[i] === this) {
                REGISTERED_WIDGETS.splice(i, 1);
                break;
            }
        }
    }
}

export async function createSingleSensorWidget(WidgetConfig: WidgetConfig) {
    if (!WidgetConfig) {
        logging.error("No widget config given.");
        return;
    }

    const config = { ...DEFAULT_WIDGET_CONFIG };
    for (const field of Object.keys(config)) {
        if (WidgetConfig[field]) {
            config[field] = WidgetConfig[field];
        }
    }

    const element = document.getElementById(config.elementId);
    if (!element) {
        logging.error(`The given element ID "${config.elementId}" does not exist.`);
        return;
    }

    const dataSource = config.dataSource;
    if (!isValidDataSource(dataSource)) {
        logging.error(`The given data source "${dataSource}" is not valid.`);
        return;
    }

    const location = config.location;
    if (!location || !location.longitude || !location.latitude) {
        logging.error(`No valid location "${location}" given.`);
        return;
    }

    const widget = new AQWidget(config);
    await widget.initialize();
}

"use strict";
import { render, h, Component } from "preact";
import { WidgetConfig } from "./models/config";
import { DEFAULT_WIDGET_CONFIG } from "./defaults";
import * as logging from "./utils/logging";
import { isValidDataSource } from "./utils/validators";

import "./style/widget.css";
import { StationService } from "./services/stations";
import { StationLookupResult, Station } from "./models/station";
import { formatLocation, formatScore, getScore } from "./utils/formatters";
import { JRC_NOTICE } from "./constants";

const REGISTERED_WIDGETS = [];

/** Instruct Babel to compile JSX **/
/** @jsx h */

interface AqWidgetState {
    stationLookupResult: StationLookupResult;
    station: Station;
    isLoading: boolean;
    isInitialized: boolean;
    isInfoOpened: boolean;
}

class AQWidget extends Component<WidgetConfig, AqWidgetState> {
    private intervalObj: any;
    private stationService: StationService;

    constructor() {
        super();
        this.setState({
            isLoading: true,
            isInitialized: false,
            isInfoOpened: false,
            station: null,
            stationLookupResult: null,
        });
    }

    public async componentDidMount() {
        console.log("componentDidMount()", this.props.elementId);
        this.stationService = new StationService(this.props.apiBase);

        const lookupResult = await this.stationService.lookupStation("eea", this.props.location);

        if (!lookupResult) {
            this.setState({ ...this.state, stationLookupResult: null, isInitialized: false, isLoading: false });
            console.warn(`No station near ${JSON.stringify(this.props.location)} found.`);
        } else {
            this.setState({ ...this.state, stationLookupResult: lookupResult, isInitialized: true, isLoading: false });
        }
        this.sync();
        this.register();
    }

    private sync() {
        console.log("sync()", this.props.elementId);
        if (this.state.isInitialized) {
            this.fetchData();
        }
    }

    private async fetchData() {
        const lookupResult = this.state.stationLookupResult;
        const station = await this.stationService.getStation("eea", lookupResult.countryCode, lookupResult.stationId);
        this.setState({ ...this.state, station: station });
    }

    public render(props: WidgetConfig, state: AqWidgetState) {
        const background = this.getBackgroundClass();

        return (
            <div class={"aq-widget-container " + background}>
                {!state.isInitialized && state.isLoading && this._renderLoading()}
                {!state.isInitialized && !state.isLoading && this._renderNoStationAvailable()}
                {state.isInitialized && this._renderAQ(state)}
                {state.isInfoOpened && this._renderInfo()}
                <span class="aq-widget-info-icon">i</span>
                <span class="aq-widget-particle-1" />
                <span class="aq-widget-particle-2" />
                <span class="aq-widget-particle-3" />
            </div>
        );
    }

    private _renderAQ(state) {
        if (!state.station) {
            return;
        }

        const station = state.station;
        const locationString = formatLocation(station.location);
        const aqiString = formatScore(station.measurements);
        return (
            <div>
                <p class="aq-widget-index">EU Common Air Quality Index</p>
                <p class="aq-widget-score">{aqiString}</p>
                <p class="aq-widget-location">{locationString}</p>
                {this._renderIcon()}
            </div>
        );
    }

    private _renderInfo() {
        return (
            <div class="aq-widget-info-box">
                <span class="aq-widget-info-close-link">×</span>
                <p>{JRC_NOTICE}</p>
            </div>
        );
    }

    private _renderIcon() {
        const iconUrl = this.props.iconUrl;
        if (iconUrl) {
            return <div class="aq-widget-logo-icon" style={{ backgroundImage: "url(" + iconUrl + ")" }} />;
        }
    }

    private _renderLoading() {
        return <p class="aq-widget-warning">Loading...</p>;
    }

    private _renderNoStationAvailable() {
        return <p class="aq-widget-warning">No air quality station available...</p>;
    }

    private getBackgroundClass() {
        const classPrefix = "aq-widget-";
        if (!this.state.station) {
            return classPrefix + "neutral";
        }
        const station = this.state.station;
        const aqiScore = station ? getScore(station.measurements) : -1;
        const aqiString = formatScore(station.measurements);

        if (aqiScore < 0) {
            return classPrefix + "neutral";
        }
        return classPrefix + aqiString.replace(" ", "-");
    }

    private toggleInfo() {
        this.setState({ ...this.state, isInfoOpened: !this.state.isInfoOpened });
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

    element.classList.add("aq-widget");
    render(<AQWidget {...config} />, element);
}

"use strict";
import { h, Component } from "preact";
import { WidgetConfig } from "../models/config";

import { StationService } from "../services/stations";
import { StationLookupResult, Station } from "../models/station";
import { formatLocation, formatScore, getScore } from "../utils/formatters";
import { logging } from "../utils/logging";
import { JRC_NOTICE, REFRESH_INTERVAL, BREEZE_NOTICE, BREEZE_WEBSITE } from "../constants";
import BreezeLogo from "../assets/breeze-logo.png";
import EcJrcLogo from "../assets/ec-jrc-logo.jpg";
import EovalueLogo from "../assets/eovalue-logo.jpg";
import moment from "moment";

/** Instruct Babel to compile JSX **/
/** @jsx h */

interface AqWidgetState {
    stationLookupResult: StationLookupResult;
    station: Station;
    isLoading: boolean;
    isInitialized: boolean;
    isInfoOpened: boolean;
}

export class AqWidget extends Component<WidgetConfig, AqWidgetState> {
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
        this.toggleInfo = this.toggleInfo.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.intervalObj = setInterval(this.fetchData, REFRESH_INTERVAL);
        this.stationService = new StationService(this.props.apiBase);

        this.lookupAndInitStation();
    }

    private async lookupAndInitStation() {
        const lookupResult = await this.stationService.lookupStation("eea", this.props.location);

        if (!lookupResult) {
            this.setState({ ...this.state, stationLookupResult: null, isInitialized: false, isLoading: false });
            logging.warn(`No station near ${JSON.stringify(this.props.location)} found.`);
        } else {
            this.setState({ ...this.state, stationLookupResult: lookupResult, isInitialized: true, isLoading: false });
            this.fetchData();
        }
    }

    private async fetchData() {
        if (!this.state.isInitialized) {
            return;
        }
        this.setLoading(true);
        const lookupResult = this.state.stationLookupResult;
        const station = await this.stationService.getStation("eea", lookupResult.countryCode, lookupResult.stationId);
        this.setState({ ...this.state, station: station, isLoading: false });
    }

    public render(props: WidgetConfig, state: AqWidgetState) {
        const background = this.getBackgroundClass();
        const isInitializing = !state.isInitialized && state.isLoading;
        const isNoStationAvailable = !state.isInitialized && !state.isLoading;
        const { isInitialized, isInfoOpened } = state;

        return (
            <div class={"aq-widget-container " + background}>
                {isInitializing && this._renderLoading()}
                {isNoStationAvailable && this._renderNoStationAvailable()}
                {isInitialized && this._renderAQ(state)}
                {isInfoOpened && this._renderInfo()}
                <span class="aq-widget-info-icon" onClick={this.toggleInfo}>
                    i
                </span>
                {!isNoStationAvailable && (
                    <span>
                        <span class="aq-widget-particle-1" />
                        <span class="aq-widget-particle-2" />
                        <span class="aq-widget-particle-3" />
                    </span>
                )}
            </div>
        );
    }

    private _renderAQ(state: AqWidgetState) {
        if (!state.station) {
            return;
        }

        const station = state.station;
        const locationString = formatLocation(station.location);
        const aqiString = formatScore(station.measurements);
        return (
            <div>
                <p class="aq-widget-index">EU Common Air Quality Index</p>
                <p class="aq-widget-score">
                    {aqiString}
                    <span class="aq-widget-time-ago"> {this.getTimeAgoText(station)}</span>
                </p>
                <p class="aq-widget-location">{locationString}</p>
                {this._renderIcon()}
            </div>
        );
    }

    private _renderInfo() {
        return (
            <div class="aq-widget-info-box">
                <span class="aq-widget-info-close-link" onClick={this.toggleInfo}>
                    ×
                </span>
                <p style={{ textAlign: "center" }}>
                    <a href={BREEZE_WEBSITE} target="_blank">
                        <img src={BreezeLogo} />
                    </a>
                    <br />
                    {BREEZE_NOTICE}
                </p>
                <hr />
                <p>
                    <img src={EcJrcLogo} style={{ float: "left", marginRight: "4px" }} />
                    <br />
                    <img src={EovalueLogo} style={{ float: "left", marginRight: "4px" }} />
                    {JRC_NOTICE}
                </p>
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

    private getTimeAgoText(station: Station) {
        if (!station || !station.measurements || station.measurements.length < 1) {
            return "";
        }
        const dateEnd = moment.utc(station.measurements[0].dateEnd);
        return dateEnd.calendar();
    }

    setLoading(loading: boolean) {
        this.setState({ ...this.state, isLoading: loading });
    }

    toggleInfo() {
        this.setState({ ...this.state, isInfoOpened: !this.state.isInfoOpened });
    }

    componentWillUnmount() {
        clearInterval(this.intervalObj);
    }
}

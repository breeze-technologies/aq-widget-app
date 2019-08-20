"use strict";
import { render, h } from "preact";
import { WidgetConfig } from "./models/config";
import { DEFAULT_WIDGET_CONFIG } from "./defaults";
import * as logging from "./utils/logging";
import { isValidDataSource } from "./utils/validators";
import { AqWidget } from "./components/widget";

import "./style/widget.css";

/** Instruct Babel to compile JSX **/
/** @jsx h */

const REGISTERED_WIDGETS = [];

export function createStationWidget(WidgetConfig: WidgetConfig) {
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
    const component = render(<AqWidget {...config} />, element);
    REGISTERED_WIDGETS.push(component);
    console.log("reg", REGISTERED_WIDGETS);
}

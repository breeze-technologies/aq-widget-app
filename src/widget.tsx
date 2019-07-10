"use strict";

import { WidgetConfig } from "./models/config";
import { DEFAULT_WIDGET_CONFIG } from "./defaults";
import * as logging from "./utils/logging";
import { isValidDataSource } from "./utils/validators";
import "./style/widget.css";

export function createSingleSensorWidget(WidgetConfig: WidgetConfig) {
    if (!WidgetConfig) {
        logging.error("No widget config given.");
        return;
    }

    const config = DEFAULT_WIDGET_CONFIG;
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

    const sensorIdentifier = config.sensorIdentifier;
    if (!sensorIdentifier) {
        logging.error(`No sensor identifier "${sensorIdentifier}" given.`);
        return;
    }
    element.classList.add("brzt-widget");
    element.innerHTML =
        '<div class="brzt-widget-container">' +
        '<span class="brzt-widget-particle-1"></span>' +
        '<span class="brzt-widget-particle-2"></span>' +
        '<span class="brzt-widget-particle-3"></span>' +
        '<p class="brzt-widget-index">EU Common Air Quality Index</p>' +
        '<p class="brzt-widget-score">excellent</p>' +
        '<p class="brzt-widget-location">Hamburg, Germany</p>' +
        "</div>";
}

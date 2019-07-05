"use strict";

import { WidgetConfig } from "./models/config";
import { DEFAULT_WIDGET_CONFIG } from "./defaults";
import * as logging from "./utils/logging";
import { isValidDataSource } from "./utils/validators";

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

    element.innerHTML = '<div style="width:100%;height:100px;background:#2fc3ff;border-radius:4px;"></div>';
}

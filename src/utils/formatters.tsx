import { Location } from "../models/location";
import { Measurement } from "../models/measurement";

export function formatLocation(location: Location) {
    const city = location.city || "Unknown city";
    const country = location.country || location.countryCode || "";

    return `${city}, ${country}`;
}

export function formatScore(measurements: Measurement[]) {
    const aqi = measurements.find((m) => m.indicator === "eea_aqi");
    if (!aqi) {
        return "unavailable";
    }
    switch (aqi.value) {
        case 0:
            return "excellent";
        case 1:
            return "fine";
        case 2:
            return "moderate";
        case 3:
            return "poor";
        case 4:
            return "very poor";
        case 5:
            return "severe";
    }
}

export function getScore(measurements: Measurement[]) {
    const aqi = measurements.find((m) => m.indicator === "eea_aqi");
    if (!aqi) {
        return -1;
    }
    return aqi.value;
}

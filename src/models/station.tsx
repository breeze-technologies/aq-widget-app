import { Measurement } from "./measurement";
import { Source } from "./source";
import { Location } from "./location";

export interface Station {
    id: string;
    name: string;

    source: Source;
    location: Location;
    measurements: Measurement[];

    misc?: { [key: string]: any };
}

export interface StationLookupResult {
    countryCode: string;
    stationId: string;
    longitude: number;
    latitude: number;
}

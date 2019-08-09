import axios from "axios";
import { Location } from "../models/location";
import { StationLookupResult, Station } from "../models/station";

export class StationService {
    constructor(public apiBase: string) {}

    public async lookupStation(sourceType: string, location: Location): Promise<StationLookupResult> {
        const url = this.apiBase + "/api/v1/stations/lookup";
        const response = await axios.get(url, {
            params: location,
            validateStatus: (status) => status === 200 || status === 404,
        });
        const result = response.status === 404 ? null : response.data && response.data.result;
        return result as StationLookupResult;
    }

    public async getStation(sourceType: string, countryCode: string, stationId: string): Promise<Station> {
        const url = this.apiBase + "/api/v1/stations/" + countryCode + "/" + stationId;
        const response = await axios.get(url);
        const result = response.data && response.data.result;
        return result as Station;
    }
}

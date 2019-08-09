export interface Location {
    latitude: number;
    longitude: number;
    altitude?: number;

    countryCode: string;
    country?: string;
    zipCode?: string;
    city?: string;
    streetName?: string;
    streetNumber?: string;
}

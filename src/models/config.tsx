import { Location } from "./location";

export interface WidgetConfig {
    dataSource: string;
    location: Location;
    elementId: string;
    apiBase: string;
}

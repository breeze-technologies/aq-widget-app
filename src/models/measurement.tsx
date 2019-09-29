import { Moment } from "moment";

export interface Measurement {
    indicator: string;
    dateStart: Date | Moment | string;
    dateEnd: Date | Moment | string;
    value: number;
    unit: string;
}

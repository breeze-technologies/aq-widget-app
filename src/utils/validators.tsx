import { DATA_SOURCES } from "../constants";

export function isValidDataSource(dataSource: string) {
    return !!DATA_SOURCES.find((s) => s === dataSource);
}

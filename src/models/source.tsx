export interface Source {
    key: string;
    name: string;
    administrator: string;

    misc?: { [key: string]: any };
}

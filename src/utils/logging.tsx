const loggingPrefix = "[AQWidget]";

export function error(...args: any[]){
    console.error(loggingPrefix, ...args)
}

export function warn(...args: any[]){
    console.warn(loggingPrefix, ...args)
}

export function info(...args: any[]){
    console.info(loggingPrefix, ...args)
}
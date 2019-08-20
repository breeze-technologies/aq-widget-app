const loggingPrefix = "[AQWidget]";

class Logger {
    error(...args: any[]) {
        console.error(loggingPrefix, ...args);
    }

    warn(...args: any[]) {
        console.warn(loggingPrefix, ...args);
    }

    info(...args: any[]) {
        console.info(loggingPrefix, ...args);
    }
}

export const logging = new Logger();

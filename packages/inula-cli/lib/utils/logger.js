export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
export class Logger {
    constructor(level) {
        if (level !== undefined) {
            this.level = level;
        }
        else {
            this.level = LogLevel.INFO;
        }
    }
    debug(message) {
        if (this.level <= LogLevel.DEBUG) {
            console.debug(`[DEBUG] ${message}`);
        }
    }
    info(message) {
        if (this.level <= LogLevel.INFO) {
            console.info(`[INFO] ${message}`);
        }
    }
    warn(message) {
        if (this.level <= LogLevel.WARN) {
            console.warn(`[WARN] ${message}`);
        }
    }
    error(message, error) {
        if (this.level <= LogLevel.ERROR) {
            console.error(`[ERROR] ${message}`, error || '');
        }
    }
}

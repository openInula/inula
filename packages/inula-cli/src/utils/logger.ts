export enum LogLevel {
  DEBUG = 0,
  INFO  = 1,
  WARN  = 2,
  ERROR = 3,
}

export class Logger {
  private readonly level: LogLevel;

  constructor(level?: LogLevel) {
    if (level !== undefined) {
      this.level = level;
    } else {
      this.level = LogLevel.INFO;
    }
  }

  debug(message: string): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`);
    }
  }

  info(message: string): void {
    if (this.level <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`);
    }
  }

  warn(message: string): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`);
    }
  }

  error(message: string, error?: Error): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, error || '');
    }
  }
}

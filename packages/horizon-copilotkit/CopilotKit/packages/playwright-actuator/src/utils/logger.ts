/// <reference path="../types/global.d.ts" />
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogLevels {
  debug: number;
  info: number;
  warn: number;
  error: number;
}


export default class Logger {
  private level: LogLevel;
  private levels: LogLevels;

  constructor(level: LogLevel = 'info') {
    this.level = level;
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }

  debug(message: string, ...args: any[]): void {
    if (this.levels[this.level] <= this.levels.debug) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.levels[this.level] <= this.levels.info) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.levels[this.level] <= this.levels.warn) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.levels[this.level] <= this.levels.error) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  success(message: string, ...args: any[]): void {
    if (this.levels[this.level] <= this.levels.info) {
      console.log(`%c[SUCCESS] ${message}`, 'color: green', ...args);
    }
  }
}

// 导出给浏览器使用
if (typeof window !== 'undefined') {
  (window as any).PlaywrightLogger = Logger;
}
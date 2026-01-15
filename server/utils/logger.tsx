// src/services/notification/server/utils/logger.ts

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG"
}

export class Logger {
  static log(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    if (meta) {
      console.log(`[${timestamp}] [${level}] ${message}`, meta);
    } else {
      console.log(`[${timestamp}] [${level}] ${message}`);
    }
  }

  static info(message: string, meta?: unknown) {
    this.log(LogLevel.INFO, message, meta);
  }

  static warn(message: string, meta?: unknown) {
    this.log(LogLevel.WARN, message, meta);
  }

  static error(message: string, meta?: unknown) {
    this.log(LogLevel.ERROR, message, meta);
  }

  static debug(message: string, meta?: unknown) {
    this.log(LogLevel.DEBUG, message, meta);
  }
}

// Types pour le système de logging
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export interface LogMessage {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  metadata?: any
}

export interface LoggingConfig {
  level: LogLevel
  enableConsole: boolean
  enableRemoteLogging: boolean
  contexts: {
    [key: string]: LogLevel
  }
} 
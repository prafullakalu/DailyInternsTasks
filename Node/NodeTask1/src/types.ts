
export interface ServerConfig {
  port: number;
  host: string;
  logFile: string;
}

export interface RequestInfo {
  method: string;
  pathname: string;
  query: Record<string, string | string[]>;
}

export interface SystemSnapshot {
  platform: string;
  arch: string;
  totalMemory: number;
  freeMemory: number;
  nodeVersion: string;
  env: Record<string, string>;
}

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
}


import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as process from 'process';
import { 
  ServerConfig, 
  RequestInfo, 
  SystemSnapshot, 
  LogLevel, 
  LogEntry 
} from './types';

/**
 * Reads and parses a JSON file from disk.
 * @param filePath Path to the JSON file.
 * @returns Parsed JSON object of type T.
 */
function readJson<T>(filePath: string): T {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  const data = fs.readFileSync(absolutePath, 'utf8');
  return JSON.parse(data) as T; // json.parse()
}

/**
 * Appends a log entry to the configured log file.
 * @param entry The log entry to write.
 * @param logFile The path to the log file.
 */
function log(entry: LogEntry, logFile: string): void {
  const logLine = JSON.stringify(entry) + '\n';
  fs.appendFileSync(logFile, logLine, 'utf8');  // utf8 encoding why we use it 
}

/**
 * Collects a snapshot of the system state.
 * @returns A SystemSnapshot object.
 */
function getSystemSnapshot(): SystemSnapshot {
  return {
    platform: os.platform(),
    arch: os.arch(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    nodeVersion: process.version,
    env: process.env as Record<string, string>  
  };
}

/**
 * Main function to start the server.
 * @param overrides Optional partial configuration to override defaults.
 */
export function startServer(overrides?: Partial<ServerConfig>): void {
  // Load default config
  const baseConfig = readJson<ServerConfig>('config.json');
  
  // Merge overrides
  const config: ServerConfig = { ...baseConfig, ...overrides };
  
  const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    // Parse URL
    const parsedUrl = url.parse(req.url || '', true); // 03 why we need true
    
    // Build RequestInfo
    const requestInfo: RequestInfo = {
      method: req.method || 'UNKNOWN',
      pathname: parsedUrl.pathname || '/',
      query: parsedUrl.query as Record<string, string | string[]>
    };

    // Prepare response
    
    res.end(JSON.stringify({ message: 'Request received', info: requestInfo }));

    // Log the request
    const entry: LogEntry = {
      level: LogLevel.INFO,
      message: `Received ${requestInfo.method} request for ${requestInfo.pathname}`,
      timestamp: new Date().toISOString()
    };
    log(entry, config.logFile);
  });

  server.listen(config.port, config.host, () => {
    const snapshot = getSystemSnapshot();
    console.log(`Server running at http://${config.host}:${config.port}/`);
    console.log('System Snapshot:', JSON.stringify(snapshot, null, 2));

    // Log startup
    const startupEntry: LogEntry = {
      level: LogLevel.INFO,
      message: `Server started on ${config.host}:${config.port}`,
      timestamp: new Date().toISOString()
    };
    log(startupEntry, config.logFile);
  });
}

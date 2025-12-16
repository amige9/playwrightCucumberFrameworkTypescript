// import { transports, format} from "winston";

// export function options(scenarioName: string){
//     return {
//         transports: [
//             new transports.File({
//                 filename: `test-results/log/${scenarioName}/log.log`,
//                 level: 'info',
//                 format: format.combine(
//                     format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
//                     format.align(),
//                     format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`)
//                 )
//             })
//         ]
//     }
// }
/**
 * Logger utility module for application-wide logging
 */
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Change log directory to test-results/logs
const logDir = path.join(process.cwd(), 'test-results', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Sanitizes a filename by removing invalid characters
 * @param {string} filename - The filename to sanitize
 * @returns {string} A safe filename
 */
const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').substring(0, 100);
};

/**
 * Clears a specific log file
 * @param {string} moduleName - The name of the module whose logs should be cleared
 * @returns {boolean} True if successful
 */
const clearLogFile = (moduleName: string): boolean => {
  const safeModuleName = sanitizeFilename(moduleName);
  const logFilePath = path.join(logDir, `${safeModuleName}.log`);
  
  try {
    if (fs.existsSync(logFilePath)) {
      fs.writeFileSync(logFilePath, '', { flag: 'w' });
      console.log(`Cleared log file: ${logFilePath}`);
    } else {
      fs.writeFileSync(logFilePath, '');
      console.log(`Created empty log file: ${logFilePath}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to clear log file ${logFilePath}:`, error);
    return false;
  }
};

// Log format
const logFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level.toUpperCase()}]: ${message} ${metaStr}`;
});

// Store created loggers
const loggers = new Map<string, winston.Logger>();

/**
 * Creates a new logger and clears the log file by default
 * @param {string} moduleName - Name for the log file
 * @param {boolean} clearLog - Whether to clear the log file (default: true)
 * @returns {winston.Logger} Configured logger
 */
const createLogger = (moduleName: string, clearLog: boolean = true): winston.Logger => {
  if (!moduleName) {
    throw new Error('Logger name is required');
  }
  
  const safeLogName = sanitizeFilename(moduleName);
  
  // Clear the log file by default (changed from false to true)
  if (clearLog) {
    clearLogFile(safeLogName);
  }
  
  // Remove existing logger if it exists to force recreation
  if (loggers.has(safeLogName)) {
    const existingLogger = loggers.get(safeLogName)!;
    existingLogger.close();
    loggers.delete(safeLogName);
  }
  
  // Create logger
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          logFormat
        )
      }),
      new winston.transports.File({ 
        filename: path.join(logDir, `${safeLogName}.log`),
        maxsize: 10485760,
        maxFiles: 5,
        options: { flags: 'w' }  // Changed from 'a' (append) to 'w' (write/replace)
      })
    ]
  });
  
  loggers.set(safeLogName, logger);
  return logger;
};

/**
 * Creates logger options for a specific scenario
 */
const options = (scenarioName: string): string => {
  return scenarioName;
};

export { createLogger, clearLogFile, options };
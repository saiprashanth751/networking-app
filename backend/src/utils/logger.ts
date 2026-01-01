import winston from 'winston';
import path from 'path';

// Create logs directory path
const logsDir = path.join(__dirname, '../../logs');

// Custom format with file context
const customFormat = winston.format.printf(({ level, message, timestamp, context }) => {
    return `[${timestamp}] [${level.toUpperCase()}] [${context || 'UNKNOWN'}] ${message}`;
});

// Create the logger
export const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.errors({ stack: true }),
        customFormat
    ),
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            )
        }),
        // Write all logs to file
        new winston.transports.File({
            filename: path.join(logsDir, 'backend.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 5
        }),
        // Write error logs to separate file
        new winston.transports.File({
            filename: path.join(logsDir, 'backend-error.log'),
            level: 'error',
            maxsize: 10485760,
            maxFiles: 5
        })
    ]
});

// Helper function to create context-aware logger
export const createLogger = (context: string) => {
    return {
        debug: (message: string, meta?: any) => logger.debug(message, { context, ...meta }),
        info: (message: string, meta?: any) => logger.info(message, { context, ...meta }),
        warn: (message: string, meta?: any) => logger.warn(message, { context, ...meta }),
        error: (message: string, meta?: any) => logger.error(message, { context, ...meta })
    };
};

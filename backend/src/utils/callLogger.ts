// Comprehensive logging helper for calling system (Backend)
// Provides consistent, detailed logging across all files

import { createLogger as createWinstonLogger } from './logger';

export interface LogContext {
    file: string;
    function?: string;
}

export class CallLogger {
    private logger: ReturnType<typeof createWinstonLogger>;
    private context: LogContext;

    constructor(context: LogContext) {
        this.context = context;
        const contextStr = this.formatContext();
        this.logger = createWinstonLogger(contextStr);
    }

    private formatContext(): string {
        const { file, function: fn } = this.context;
        if (fn) return `${file}:${fn}`;
        return file;
    }

    // Function entry logging
    enter(functionName: string, params?: Record<string, any>) {
        const msg = `→ ${functionName}() called`;
        if (params && Object.keys(params).length > 0) {
            this.logger.info(msg, { params });
        } else {
            this.logger.info(msg);
        }
    }

    // Function exit logging
    exit(functionName: string, result?: any) {
        const msg = `← ${functionName}() returning`;
        if (result !== undefined) {
            this.logger.info(msg, { result });
        } else {
            this.logger.info(msg);
        }
    }

    // Socket event logging
    socketEmit(eventName: string, data?: any) {
        this.logger.info(`SOCKET EMIT: ${eventName}`, { data });
    }

    socketReceive(eventName: string, data?: any) {
        this.logger.info(`SOCKET RECEIVE: ${eventName}`, { data });
    }

    // Database operation logging
    dbQuery(operation: string, params?: any) {
        this.logger.debug(`DB ${operation}`, { params });
    }

    dbResult(operation: string, result?: any) {
        this.logger.debug(`DB ${operation} result`, { result });
    }

    // Generic logging methods
    debug(message: string, meta?: any) {
        this.logger.debug(message, meta);
    }

    info(message: string, meta?: any) {
        this.logger.info(message, meta);
    }

    warn(message: string, meta?: any) {
        this.logger.warn(message, meta);
    }

    error(message: string, meta?: any) {
        this.logger.error(message, meta);
    }
}

// Factory function for creating loggers
export function createCallLogger(context: LogContext): CallLogger {
    return new CallLogger(context);
}

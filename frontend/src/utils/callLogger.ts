// Comprehensive logging helper for calling system
// Provides consistent, detailed logging across all files

import { createLogger as createWinstonLogger } from './logger';

export interface LogContext {
    file: string;
    function?: string;
    component?: string;
    hook?: string;
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
        const { file, function: fn, component, hook } = this.context;
        if (component) return `${file}:${component}`;
        if (hook) return `${file}:${hook}`;
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

    // State change logging
    stateChange(description: string, before: any, after: any) {
        this.logger.info(`STATE: ${description}`, { before, after });
    }

    // Event logging
    event(eventName: string, data?: any) {
        if (data) {
            this.logger.info(`EVENT: ${eventName}`, { data });
        } else {
            this.logger.info(`EVENT: ${eventName}`);
        }
    }

    // Socket event logging
    socketEmit(eventName: string, data?: any) {
        this.logger.info(`SOCKET EMIT: ${eventName}`, { data });
    }

    socketReceive(eventName: string, data?: any) {
        this.logger.info(`SOCKET RECEIVE: ${eventName}`, { data });
    }

    // WebRTC logging
    webrtcSignal(type: string, direction: 'send' | 'receive', data?: any) {
        const msg = `WEBRTC ${direction.toUpperCase()}: ${type}`;
        if (data) {
            this.logger.info(msg, { signalData: data });
        } else {
            this.logger.info(msg);
        }
    }

    // Component lifecycle
    componentMount(componentName: string, props?: any) {
        if (props) {
            this.logger.info(`MOUNT: ${componentName}`, { props });
        } else {
            this.logger.info(`MOUNT: ${componentName}`);
        }
    }

    componentUnmount(componentName: string) {
        this.logger.info(`UNMOUNT: ${componentName}`);
    }

    // useEffect logging
    effectRun(description: string, dependencies?: any[]) {
        if (dependencies) {
            this.logger.debug(`EFFECT RUN: ${description}`, { dependencies });
        } else {
            this.logger.debug(`EFFECT RUN: ${description}`);
        }
    }

    effectCleanup(description: string) {
        this.logger.debug(`EFFECT CLEANUP: ${description}`);
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

    // Ref update logging
    refUpdate(refName: string, value: any) {
        this.logger.debug(`REF UPDATE: ${refName}`, { value });
    }

    // Conditional logging
    condition(description: string, condition: boolean, result: string) {
        this.logger.debug(`CONDITION: ${description} = ${condition} → ${result}`);
    }
}

// Factory function for creating loggers
export function createCallLogger(context: LogContext): CallLogger {
    return new CallLogger(context);
}

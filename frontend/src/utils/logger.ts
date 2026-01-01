// Browser-compatible logger (Winston doesn't work in browsers)
// Provides same API as Winston but uses console and localStorage

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    context: string;
    message: string;
    meta?: any;
}

class BrowserLogger {
    private context: string;

    constructor(context: string) {
        this.context = context;
    }

    private formatMessage(level: LogLevel, message: string, meta?: any): string {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 23);
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}${metaStr}`;
    }

    private log(level: LogLevel, message: string, meta?: any) {
        const formattedMessage = this.formatMessage(level, message, meta);

        // Console output with colors
        const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : level === 'debug' ? 'debug' : 'log';
        console[consoleMethod](formattedMessage);

        // Store in localStorage for persistence
        try {
            const logs = JSON.parse(localStorage.getItem('call_logs') || '[]');
            const logEntry: LogEntry = {
                timestamp: new Date().toISOString(),
                level,
                context: this.context,
                message,
                meta
            };
            logs.push(logEntry);

            // Keep only last 1000 logs
            if (logs.length > 1000) {
                logs.shift();
            }

            localStorage.setItem('call_logs', JSON.stringify(logs));
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    debug(message: string, meta?: any) {
        this.log('debug', message, meta);
    }

    info(message: string, meta?: any) {
        this.log('info', message, meta);
    }

    warn(message: string, meta?: any) {
        this.log('warn', message, meta);
    }

    error(message: string, meta?: any) {
        this.log('error', message, meta);
    }
}

// Helper function to create context-aware logger
export const createLogger = (context: string): BrowserLogger => {
    return new BrowserLogger(context);
};

// Export function to download logs
export const downloadLogs = () => {
    try {
        const logs = localStorage.getItem('call_logs') || '[]';
        const blob = new Blob([logs], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `frontend-logs-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Failed to download logs:', e);
    }
};

// Export function to clear logs
export const clearLogs = () => {
    try {
        localStorage.removeItem('call_logs');
        console.log('Logs cleared');
    } catch (e) {
        console.error('Failed to clear logs:', e);
    }
};

// Export logger instance for convenience
export const logger = createLogger('app');

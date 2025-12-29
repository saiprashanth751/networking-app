/**
 * Error Tracker - Structured Error Logging
 * 
 * Captures and categorizes errors with context for debugging production issues.
 * Stores in localStorage for easy access and export.
 * 
 * Usage:
 *   errorTracker.track(error, 'webrtc', { callId, state })
 *   errorTracker.getErrors()         // View all errors
 *   errorTracker.getErrors('webrtc') // Filter by type
 *   errorTracker.clear()             // Clear storage
 */

interface TrackedError {
    id: string;
    type: 'call' | 'webrtc' | 'socket' | 'permission' | 'unknown';
    message: string;
    stack?: string;
    context: Record<string, any>;
    timestamp: number;
    userAgent?: string;
}

class ErrorTracker {
    private errors: TrackedError[] = [];
    private maxErrors = 50;

    track(error: any, type: TrackedError['type'], context: Record<string, any> = {}) {
        const trackedError: TrackedError = {
            id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            message: error?.message || String(error),
            stack: error?.stack,
            context,
            timestamp: Date.now(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
        };

        this.errors.push(trackedError);

        // Trim to max size
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Log to console
        console.error(`[ErrorTracker] ${type.toUpperCase()}:`, {
            message: trackedError.message,
            context: trackedError.context,
            id: trackedError.id
        });

        // Store in localStorage
        this.persist();

        return trackedError.id;
    }

    private persist() {
        try {
            const recent = this.errors.slice(-25); // Keep last 25
            localStorage.setItem('call_errors', JSON.stringify(recent));
        } catch (e) {
            console.warn('[ErrorTracker] localStorage write failed, clearing');
            localStorage.removeItem('call_errors');
        }
    }

    getErrors(type?: TrackedError['type']): TrackedError[] {
        return type
            ? this.errors.filter(e => e.type === type)
            : this.errors;
    }

    getRecentErrors(count: number = 10): TrackedError[] {
        return this.errors.slice(-count);
    }

    clear() {
        this.errors = [];
        localStorage.removeItem('call_errors');
        console.log('[ErrorTracker] Cleared all errors');
    }

    export() {
        const exportData = {
            errors: this.errors,
            exportedAt: new Date().toISOString(),
            totalErrors: this.errors.length,
            errorsByType: this.getErrorsByType()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `call-errors-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('[ErrorTracker] Exported', exportData);
    }

    private getErrorsByType() {
        const byType: Record<string, number> = {};
        this.errors.forEach(e => {
            byType[e.type] = (byType[e.type] || 0) + 1;
        });
        return byType;
    }

    getStats() {
        return {
            total: this.errors.length,
            byType: this.getErrorsByType(),
            recent: this.getRecentErrors(5)
        };
    }
}

export const errorTracker = new ErrorTracker();

// Make available in console for debugging
if (typeof window !== 'undefined') {
    (window as any).errorTracker = errorTracker;
}

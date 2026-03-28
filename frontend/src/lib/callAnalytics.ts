/**
 * Call Analytics - Lightweight Observability
 * 
 * Tracks call lifecycle events for debugging production issues.
 * Uses localStorage for persistence - no external services required.
 * 
 * Usage:
 *   callAnalytics.track({ type: 'call_initiated', ... })
 *   callAnalytics.getStats()  // View metrics
 *   callAnalytics.export()    // Download JSON
 */

interface CallEvent {
    type: 'call_initiated' | 'call_ringing' | 'call_connected' | 'call_ended' | 'call_failed' | 'connection_diagnostics';
    callId: string;
    userId: string;
    callType: 'audio' | 'video';
    timestamp: number;
    metadata?: {
        outcome?: 'success' | 'timeout' | 'rejected' | 'network_error';  // ✅ Explicit outcomes
        duration?: number;
        reason?: string;
        usingTURN?: boolean;
        relayCandidates?: number;
        hostCandidates?: number;
        srflxCandidates?: number;
        [key: string]: any;
    };
}

class CallAnalytics {
    private events: CallEvent[] = [];
    private maxEvents = 100; // Keep last 100 events

    track(event: Omit<CallEvent, 'timestamp'>) {
        const fullEvent: CallEvent = { ...event, timestamp: Date.now() };

        this.events.push(fullEvent);
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }

        // Log to console in dev
        if (process.env.NODE_ENV === 'development') {
            console.log('[Analytics]', event.type, fullEvent);
        }

        // Store in localStorage for debugging
        this.persist();
    }

    private persist() {
        try {
            const recent = this.events.slice(-50); // Keep last 50
            localStorage.setItem('call_analytics', JSON.stringify(recent));
        } catch (e) {
            // Quota exceeded, clear old data
            console.warn('[Analytics] localStorage quota exceeded, clearing');
            localStorage.removeItem('call_analytics');
        }
    }

    getStats() {
        const totalCalls = this.events.filter(e => e.type === 'call_ended').length;

        // ✅ CORRECTION: Count only explicit successful outcomes
        const successful = this.events.filter(
            e => e.type === 'call_ended' && e.metadata?.outcome === 'success'
        ).length;

        const failed = this.events.filter(
            e => e.type === 'call_failed' ||
                (e.type === 'call_ended' && e.metadata?.outcome !== 'success')
        ).length;

        const timeouts = this.events.filter(
            e => e.type === 'call_ended' && e.metadata?.outcome === 'timeout'
        ).length;

        const rejected = this.events.filter(
            e => e.type === 'call_ended' && e.metadata?.outcome === 'rejected'
        ).length;

        const networkErrors = this.events.filter(
            e => e.type === 'call_ended' && e.metadata?.outcome === 'network_error'
        ).length;

        const usingTURN = this.events.filter(
            e => e.type === 'connection_diagnostics' && e.metadata?.usingTURN === true
        ).length;

        return {
            totalCalls,
            successful,
            failed,
            timeouts,
            rejected,
            networkErrors,
            usingTURN,
            successRate: totalCalls > 0 ? ((successful / totalCalls) * 100).toFixed(1) + '%' : '0%',
            events: this.events
        };
    }

    export() {
        const stats = this.getStats();
        const exportData = {
            ...stats,
            exportedAt: new Date().toISOString(),
            browser: navigator.userAgent
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `call-analytics-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('[Analytics] Exported', exportData);
    }

    clear() {
        this.events = [];
        localStorage.removeItem('call_analytics');
        console.log('[Analytics] Cleared all events');
    }

    // Get events of specific type
    getEventsByType(type: CallEvent['type']) {
        return this.events.filter(e => e.type === type);
    }

    // Get recent events (last N)
    getRecentEvents(count: number = 10) {
        return this.events.slice(-count);
    }
}

export const callAnalytics = new CallAnalytics();

// Make available in console for debugging
if (typeof window !== 'undefined') {
    (window as any).callAnalytics = callAnalytics;
}

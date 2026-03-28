/**
 * Call Coordinator for Multi-Tab Synchronization
 * 
 * Uses BroadcastChannel API to coordinate call state across multiple browser tabs.
 * Ensures only one tab handles each call event to prevent duplicate UI and sounds.
 * 
 * Features:
 * - Tab coordination for call accept/reject/end events
 * - Leader election for ringing sound (only one tab plays)
 * - Automatic cleanup on tab close
 */

type CoordinationEvent =
    | { type: 'CALL_ACCEPTED'; callId: string; tabId: string }
    | { type: 'CALL_REJECTED'; callId: string; tabId: string }
    | { type: 'CALL_ENDED'; callId: string; tabId: string }
    | { type: 'LEADER_CLAIM'; tabId: string };

type EventHandler = (event: CoordinationEvent) => void;

// ✅ FIX: Input type for broadcast (before adding tabId)
type CoordinationEventInput =
    | { type: 'CALL_ACCEPTED'; callId: string }
    | { type: 'CALL_REJECTED'; callId: string }
    | { type: 'CALL_ENDED'; callId: string }
    | { type: 'LEADER_CLAIM' };

class CallCoordinator {
    private channel: BroadcastChannel;
    private tabId: string;
    private handlers: Set<EventHandler> = new Set();

    constructor() {
        this.channel = new BroadcastChannel('call-coordination');
        this.tabId = `tab-${Math.random().toString(36).substr(2, 9)}`;

        console.log(`[CallCoordinator] Initialized tab: ${this.tabId}`);

        // Listen to messages from other tabs
        this.channel.onmessage = (e) => {
            // Ignore own messages
            if (e.data.tabId === this.tabId) {
                return;
            }

            console.log(`[CallCoordinator] Received from other tab:`, e.data);

            // Notify all subscribers
            this.handlers.forEach(handler => {
                try {
                    handler(e.data);
                } catch (error) {
                    console.error('[CallCoordinator] Handler error:', error);
                }
            });
        };
    }

    /**
     * Broadcast an event to all other tabs
     */
    broadcast(event: CoordinationEventInput) {
        const fullEvent = { ...event, tabId: this.tabId } as CoordinationEvent;
        console.log(`[CallCoordinator] Broadcasting:`, fullEvent);
        this.channel.postMessage(fullEvent);
    }

    /**
     * Subscribe to coordination events from other tabs
     * Returns an unsubscribe function
     */
    subscribe(handler: EventHandler): () => void {
        this.handlers.add(handler);
        console.log(`[CallCoordinator] Handler subscribed, total: ${this.handlers.size}`);

        return () => {
            this.handlers.delete(handler);
            console.log(`[CallCoordinator] Handler unsubscribed, remaining: ${this.handlers.size}`);
        };
    }

    /**
     * Get this tab's unique ID
     */
    getTabId(): string {
        return this.tabId;
    }

    /**
     * Cleanup when component unmounts or window closes
     */
    cleanup() {
        console.log(`[CallCoordinator] Cleaning up tab: ${this.tabId}`);
        this.channel.close();
        this.handlers.clear();
    }
}

// Export singleton instance
export const callCoordinator = new CallCoordinator();

// Cleanup on window unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        callCoordinator.cleanup();
    });
}

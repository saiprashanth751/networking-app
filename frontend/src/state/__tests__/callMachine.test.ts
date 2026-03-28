import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCallMachine } from '../callMachine';
import { createActor } from 'xstate';
import type { CallParticipant } from '@/types/types';

/**
 * Call State Machine Tests
 * 
 * These tests protect call flow invariants (transitions, timeouts, error states).
 * Other layers (hooks, UI, WebRTC) are intentionally untested due to:
 * - Async/media complexity
 * - Mock instability  
 * - System still evolving
 * 
 * Revisit full test coverage when the system stabilizes (~2-3 weeks).
 */


describe('Call State Machine', () => {
    const mockCallDetails = {
        id: 'call-123',
        type: 'audio' as const,
        direction: 'outgoing' as const,
        participants: {
            local: { id: 'user-1', name: 'User 1', profilePicture: null } as CallParticipant,
            remote: { id: 'user-2', name: 'User 2', profilePicture: null } as CallParticipant
        }
    };

    it('should start in idle state', () => {
        const machine = createCallMachine({ userId: 'test-user' });
        const actor = createActor(machine);
        actor.start();

        expect(actor.getSnapshot().value).toBe('idle');
    });

    it('should transition from idle to outgoing on CALL_INITIATE', () => {
        const machine = createCallMachine({ userId: 'test-user' });
        const actor = createActor(machine);
        actor.start();

        expect(actor.getSnapshot().value).toBe('idle');

        actor.send({
            type: 'CALL_INITIATE',
            callDetails: mockCallDetails
        });

        expect(actor.getSnapshot().value).toBe('outgoing');
        expect(actor.getSnapshot().context.callDetails?.id).toBe('call-123');
    });

    it('should transition from idle to incoming on CALL_RECEIVED', () => {
        const machine = createCallMachine({ userId: 'test-user' });
        const actor = createActor(machine);
        actor.start();

        actor.send({
            type: 'CALL_RECEIVED',
            callDetails: { ...mockCallDetails, direction: 'incoming' }
        });

        expect(actor.getSnapshot().value).toBe('incoming');
    });

    it('should transition from outgoing to connecting on CALL_ACCEPT', () => {
        const machine = createCallMachine({ userId: 'test-user' });
        const actor = createActor(machine);
        actor.start();

        actor.send({ type: 'CALL_INITIATE', callDetails: mockCallDetails });
        expect(actor.getSnapshot().value).toBe('outgoing');

        actor.send({ type: 'CALL_ACCEPT' });
        expect(actor.getSnapshot().value).toBe('connecting');
    });

    it('should transition from connecting to active on WEBRTC_CONNECTED', () => {
        const machine = createCallMachine({ userId: 'test-user' });
        const actor = createActor(machine);
        actor.start();

        actor.send({ type: 'CALL_INITIATE', callDetails: mockCallDetails });
        actor.send({ type: 'CALL_ACCEPT' });
        expect(actor.getSnapshot().value).toBe('connecting');

        actor.send({ type: 'WEBRTC_CONNECTED' });
        expect(actor.getSnapshot().value).toBe('active');
    });

    it('should transition to reconnecting on WEBRTC_FAILED during active call', () => {
        const machine = createCallMachine({ userId: 'test-user' });
        const actor = createActor(machine);
        actor.start();

        // Get to active state
        actor.send({ type: 'CALL_INITIATE', callDetails: mockCallDetails });
        actor.send({ type: 'CALL_ACCEPT' });
        actor.send({ type: 'WEBRTC_CONNECTED' });

        expect(actor.getSnapshot().value).toBe('active');

        // Test reconnection
        actor.send({ type: 'WEBRTC_FAILED', error: 'Connection lost' });

        expect(actor.getSnapshot().value).toBe('reconnecting');
        expect(actor.getSnapshot().context.connectionError).toBe('Connection lost');
    });

    it('should recover from reconnecting to active on WEBRTC_CONNECTED', () => {
        const machine = createCallMachine({ userId: 'test-user' });
        const actor = createActor(machine);
        actor.start();

        // Get to reconnecting state
        actor.send({ type: 'CALL_INITIATE', callDetails: mockCallDetails });
        actor.send({ type: 'CALL_ACCEPT' });
        actor.send({ type: 'WEBRTC_CONNECTED' });
        actor.send({ type: 'WEBRTC_FAILED', error: 'Lost' });

        expect(actor.getSnapshot().value).toBe('reconnecting');

        // Reconnect successfully
        actor.send({ type: 'WEBRTC_CONNECTED' });

        expect(actor.getSnapshot().value).toBe('active');
        expect(actor.getSnapshot().context.connectionError).toBeNull();
    });

    it('should timeout from reconnecting after 10 seconds', () => {
        vi.useFakeTimers(); // ✅ CORRECTION #1: Use fake timers

        const machine = createCallMachine({ userId: 'test-user' });
        const actor = createActor(machine);
        actor.start();

        // Get to reconnecting state
        actor.send({ type: 'CALL_INITIATE', callDetails: mockCallDetails });
        actor.send({ type: 'CALL_ACCEPT' });
        actor.send({ type: 'WEBRTC_CONNECTED' });
        actor.send({ type: 'WEBRTC_FAILED', error: 'Lost' });

        expect(actor.getSnapshot().value).toBe('reconnecting');

        // Advance time by 10 seconds
        vi.advanceTimersByTime(10000);

        expect(actor.getSnapshot().value).toBe('ending');

        vi.useRealTimers();
    });

    it('should handle CALL_END from any state', () => {
        const machine = createCallMachine({ userId: 'test-user' });

        // Test from outgoing
        const actor1 = createActor(machine);
        actor1.start();
        actor1.send({ type: 'CALL_INITIATE', callDetails: mockCallDetails });
        expect(actor1.getSnapshot().value).toBe('outgoing');
        actor1.send({ type: 'CALL_END' });
        expect(actor1.getSnapshot().value).toBe('ending');

        // Test from active
        const actor2 = createActor(machine);
        actor2.start();
        actor2.send({ type: 'CALL_INITIATE', callDetails: mockCallDetails });
        actor2.send({ type: 'CALL_ACCEPT' });
        actor2.send({ type: 'WEBRTC_CONNECTED' });
        expect(actor2.getSnapshot().value).toBe('active');
        actor2.send({ type: 'CALL_END' });
        expect(actor2.getSnapshot().value).toBe('ending');
    });

    it('should handle CALL_REJECT from incoming state', () => {
        const machine = createCallMachine({ userId: 'test-user' });
        const actor = createActor(machine);
        actor.start();

        actor.send({
            type: 'CALL_RECEIVED',
            callDetails: { ...mockCallDetails, direction: 'incoming' }
        });
        expect(actor.getSnapshot().value).toBe('incoming');

        actor.send({ type: 'CALL_REJECT' });
        expect(actor.getSnapshot().value).toBe('ending');
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCallOrchestrator } from '../useCallOrchestrator';
import type { Socket } from 'socket.io-client';

// Mock dependencies
vi.mock('../useWebRTCManager', () => ({
    useWebRTCManager: () => ({
        initialize: vi.fn(),
        cleanup: vi.fn(),
        toggleMute: vi.fn(),
        toggleVideo: vi.fn(),
        enableScreenShare: vi.fn(),
        disableScreenShare: vi.fn()
    })
}));

vi.mock('@/lib/callEventBus', () => ({
    callEventBus: {
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn()
    }
}));

vi.mock('@/lib/callAnalytics', () => ({
    callAnalytics: {
        track: vi.fn()
    }
}));

describe('useCallOrchestrator - Integration Tests', () => {
    let mockSocket: any;
    let socketHandlers: Record<string, Function>; // ✅ Store handlers for explicit triggering

    beforeEach(() => {
        socketHandlers = {};

        mockSocket = {
            id: 'mock-socket-id',
            connected: true,
            emit: vi.fn(),
            on: vi.fn((event, handler) => {
                socketHandlers[event] = handler; // Store for later invocation
            }),
            off: vi.fn()
        };
    });

    it('should emit socket event when initiating call', () => {
        const { result } = renderHook(() =>
            useCallOrchestrator({ socket: mockSocket, userId: 'user-1' })
        );

        act(() => {
            result.current.initiateCall(
                { id: 'user-2', name: 'User 2', profilePicture: null },
                'audio'
            );
        });

        expect(mockSocket.emit).toHaveBeenCalledWith(
            'callInitiate',
            expect.objectContaining({
                receiverId: 'user-2',
                callType: 'audio'
            })
        );
    });

    it('should handle incoming call and trigger state change', () => {
        const { result } = renderHook(() =>
            useCallOrchestrator({ socket: mockSocket, userId: 'user-1' })
        );

        // ✅ CORRECTION #2: Trigger socket handler explicitly
        act(() => {
            socketHandlers['incomingCall']({
                callId: 'call-123',
                callerId: 'user-2',
                callerName: 'User 2',
                callType: 'audio'
            });
        });

        expect(result.current.state.value).toBe('incoming');
    });

    it('should emit callAccept when accepting call', () => {
        const { result } = renderHook(() =>
            useCallOrchestrator({ socket: mockSocket, userId: 'user-1' })
        );

        // Setup incoming call
        act(() => {
            socketHandlers['incomingCall']({
                callId: 'call-123',
                callerId: 'user-2',
                callerName: 'User 2',
                callType: 'audio'
            });
        });

        // Accept the call
        act(() => {
            result.current.acceptCall();
        });

        expect(mockSocket.emit).toHaveBeenCalledWith(
            'callAccept',
            expect.objectContaining({
                callId: 'call-123'
            })
        );
    });

    it('should emit callEnd and cleanup on endCall', () => {
        const { result } = renderHook(() =>
            useCallOrchestrator({ socket: mockSocket, userId: 'user-1' })
        );

        // Setup call
        act(() => {
            result.current.initiateCall(
                { id: 'user-2', name: 'User 2', profilePicture: null },
                'audio'
            );
        });

        // End call
        act(() => {
            result.current.endCall();
        });

        expect(mockSocket.emit).toHaveBeenCalledWith(
            'callEnd',
            expect.any(Object)
        );
    });

    it('should handle call rejection', () => {
        const { result } = renderHook(() =>
            useCallOrchestrator({ socket: mockSocket, userId: 'user-1' })
        );

        // Setup incoming call
        act(() => {
            socketHandlers['incomingCall']({
                callId: 'call-123',
                callerId: 'user-2',
                callerName: 'User 2',
                callType: 'audio'
            });
        });

        expect(result.current.state.value).toBe('incoming');

        // Reject call
        act(() => {
            result.current.rejectCall();
        });

        expect(mockSocket.emit).toHaveBeenCalledWith(
            'callReject',
            expect.objectContaining({
                callId: 'call-123'
            })
        );
    });
});

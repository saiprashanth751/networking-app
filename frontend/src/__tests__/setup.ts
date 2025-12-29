import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// 🔒 GUARDRAIL #1: Reset all mocks between tests
afterEach(() => {
    vi.clearAllMocks();
});

// Mock MediaStream constructor FIRST (before it's used)
class MockMediaStream {
    getTracks() { return []; }
    getAudioTracks() { return []; }
    getVideoTracks() { return []; }
    addTrack = vi.fn();
    removeTrack = vi.fn();
}

global.MediaStream = MockMediaStream as any;

// Mock navigator.mediaDevices
global.navigator.mediaDevices = {
    getUserMedia: vi.fn().mockResolvedValue(new MockMediaStream()),
    enumerateDevices: vi.fn().mockResolvedValue([])
} as any;

// Mock BroadcastChannel
global.BroadcastChannel = vi.fn().mockImplementation(() => ({
    postMessage: vi.fn(),
    close: vi.fn(),
    onmessage: null
})) as any;

// ✅ Hard-mock SimplePeer to prevent instantiation
vi.mock('simple-peer', () => ({
    default: vi.fn().mockImplementation(() => ({
        on: vi.fn(),
        signal: vi.fn(),
        send: vi.fn(),
        destroy: vi.fn(),
        _pc: {
            getStats: vi.fn().mockResolvedValue(new Map())
        }
    }))
}));

/**
 * 🔒 GUARDRAIL #2: Test Stability Rule
 * 
 * NO TEST MAY DEPEND ON:
 * - Real time (use vi.useFakeTimers())
 * - Real network (mock socket, HTTP)
 * - Real WebRTC APIs (mock SimplePeer, navigator.mediaDevices)
 * 
 * Violations will cause flaky CI runs.
 */

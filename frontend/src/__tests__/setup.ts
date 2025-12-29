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

// Mock BroadcastChannel - FIXED
class MockBroadcastChannel {
    name: string;
    onmessage: ((event: any) => void) | null = null;

    constructor(name: string) {
        this.name = name;
    }

    postMessage = vi.fn();
    close = vi.fn();
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    dispatchEvent = vi.fn();
}

global.BroadcastChannel = MockBroadcastChannel as any;

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

// Mock errorTracker
vi.mock('@/lib/errorTracker', () => ({
    errorTracker: {
        track: vi.fn()
    }
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

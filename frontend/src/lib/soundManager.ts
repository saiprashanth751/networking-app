/**
 * Singleton Sound Manager for Call System
 * 
 * This module provides a global audio manager that survives component re-renders.
 * It prevents multiple audio instances from being created and ensures proper cleanup.
 * 
 * Initialize via bootstrap/sound.ts import in your app entry point.
 * 
 * @module soundManager
 */

import { callEventBus } from './eventBus';

/**
 * Manages ringing sounds for the call system
 * Singleton pattern ensures only one audio instance exists
 */
class RingingManager {
    private audio: HTMLAudioElement;
    private isPlaying = false;
    private hasUserInteracted = false;
    private isInitialized = false;

    // ✅ Fix #3: Bind methods once to avoid listener removal bug
    // bind() creates a new function every time, so we must bind once
    private boundStart = this.start.bind(this);
    private boundStop = this.stop.bind(this);

    constructor() {
        // Create audio element once
        this.audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        this.audio.loop = true;
        this.audio.volume = 0.3;
        this.audio.preload = 'none'; // ✅ Fix Bug #4: Don't preload to avoid tick sound

        // Setup user interaction handlers once
        this.setupUserInteractionHandlers();
    }

    /**
     * Set up handlers to unlock audio playback on first user interaction
     * Required for browsers with autoplay restrictions
     */
    private setupUserInteractionHandlers() {
        if (typeof document === 'undefined') return;

        const handleUserInteraction = () => {
            if (this.hasUserInteracted) return;

            this.hasUserInteracted = true;
            console.log('[RingingManager] User interaction detected, audio unlocked');

            // Unlock audio by playing then immediately pausing
            // This is required for autoplay policy in modern browsers
            this.audio.play()
                .catch(() => {
                    // Silently handle autoplay errors
                })
                .then(() => {
                    this.audio.pause();
                    this.audio.currentTime = 0;
                });

            // Remove listeners after first interaction
            this.removeInteractionListeners();
        };

        document.addEventListener('click', handleUserInteraction, { once: true });
        document.addEventListener('keydown', handleUserInteraction, { once: true });
        document.addEventListener('touchstart', handleUserInteraction, { once: true });
    }

    private removeInteractionListeners() {
        // Listeners are already removed via { once: true }
        // This method exists for explicit cleanup if needed
    }

    /**
     * Initialize event bus subscriptions
     * Should be called once when the app starts (from bootstrap/sound.ts)
     */
    initialize() {
        if (this.isInitialized) {
            console.warn('[RingingManager] Already initialized');
            return;
        }

        console.log('[RingingManager] Initializing event bus subscriptions');

        // ✅ Fix #3: Use pre-bound methods to ensure cleanup works correctly
        callEventBus.on('sound:startRinging', this.boundStart);
        callEventBus.on('sound:stopRinging', this.boundStop);

        this.isInitialized = true;
    }

    /**
     * Start playing the ringing sound
     */
    start() {
        if (this.isPlaying) {
            console.log('[RingingManager] Already playing, ignoring duplicate start');
            return;
        }

        if (!this.hasUserInteracted) {
            console.warn('[RingingManager] Cannot play - user has not interacted yet');
            return;
        }

        console.log('[RingingManager] Starting ringing sound');

        this.audio.play()
            .then(() => {
                this.isPlaying = true;
                console.log('[RingingManager] Ringing started successfully');
            })
            .catch(err => {
                console.error('[RingingManager] Failed to play ringing:', err);
            });
    }

    /**
     * Stop playing the ringing sound
     */
    stop() {
        if (!this.isPlaying) {
            console.log('[RingingManager] Not playing, ignoring stop');
            return;
        }

        console.log('[RingingManager] Stopping ringing sound');

        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;

        console.log('[RingingManager] Ringing stopped');
    }

    /**
     * Cleanup resources
     * Should only be called when app is unmounting
     */
    cleanup() {
        console.log('[RingingManager] Cleaning up');

        this.stop();

        if (this.isInitialized) {
            // ✅ Fix #3: Use pre-bound methods for correct removal
            callEventBus.off('sound:startRinging', this.boundStart);
            callEventBus.off('sound:stopRinging', this.boundStop);
            this.isInitialized = false;
        }
    }

    /**
     * Get current playing state
     */
    getIsPlaying(): boolean {
        return this.isPlaying;
    }
}

// ✅ Export singleton instance
export const ringingManager = new RingingManager();

// ✅ Fix #1: Removed auto-initialization
// Initialize explicitly via bootstrap/sound.ts import instead

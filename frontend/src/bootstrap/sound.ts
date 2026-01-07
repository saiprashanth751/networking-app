/**
 * Sound System Bootstrap
 * 
 * This module initializes the global sound manager for the call system.
 * Import this once in your app entry point (main.tsx or App.tsx).
 * 
 * The sound manager is a singleton that must be initialized before
 * any call-related components mount.
 */

import { ringingManager } from '@/lib/soundManager';

// Initialize the sound manager singleton
// This sets up event bus subscriptions and prepares the audio system
ringingManager.initialize();

// Log initialization for debugging
if (process.env.NODE_ENV === 'development') {
    console.log('[Bootstrap] Sound system initialized');
}

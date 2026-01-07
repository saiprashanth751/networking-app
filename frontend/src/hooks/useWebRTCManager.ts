import { useState, useRef, useCallback, useEffect } from 'react';
import SimplePeer, { SignalData } from 'simple-peer';
import { CallType } from '@/types/types';
// import { signalQueue } from '@/lib/signalQueue';
import { Socket } from 'socket.io-client';
import { callEventBus } from '@/lib/eventBus';
import { createCallLogger } from '@/utils/callLogger';

const logger = createCallLogger({ file: 'hooks/useWebRTCManager.ts', hook: 'useWebRTCManager' });

interface WebRTCManagerOptions {
  isInitiator: boolean;
  callType: CallType;
  otherUserId: string;
  socket: Socket | null;
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: 'connecting' | 'connected' | 'disconnected') => void;
  onError?: (error: string) => void;
}

interface WebRTCManagerState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'failed';
  isMuted: boolean;
  isVideoOff: boolean;
}

export function useWebRTCManager() {
  // Refs for mutable state
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const isInitializedRef = useRef(false);
  // const signalSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const retryCountRef = useRef(0);

  // Track options for reconnection
  const currentOptionsRef = useRef<WebRTCManagerOptions | null>(null);

  // Reactive state
  const [state, setState] = useState<WebRTCManagerState>({
    localStream: null,
    remoteStream: null,
    connectionState: 'disconnected',
    isMuted: false,
    isVideoOff: false
  });

  // Cleanup function
  const cleanup = useCallback(() => {
    logger.info('→ cleanup() - Cleaning up WebRTC resources');
    console.log('[WebRTCManager] Cleaning up');

    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      remoteStreamRef.current = null;
    }

    // Destroy peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // Reset state
    setState({
      localStream: null,
      remoteStream: null,
      connectionState: 'disconnected',
      isMuted: false,
      isVideoOff: false
    });

    isInitializedRef.current = false;
    retryCountRef.current = 0;
    currentOptionsRef.current = null;

    console.log('[WebRTCManager] Cleanup complete');
  }, []);

  // Get user media with proper error handling
  const getUserMedia = useCallback(async (callType: CallType): Promise<MediaStream> => {
    logger.info('→ getUserMedia()', { callType });
    try {
      console.log('[WebRTCManager] Requesting media for:', callType);

      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user'
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints); //This call does not call our function but calls browser built in api for getting media permissions
      logger.info('Got local media stream', { streamId: stream.id, audioTracks: stream.getAudioTracks().length, videoTracks: stream.getVideoTracks().length });
      console.log('[WebRTCManager] Got media stream:', stream.id);

      // Store reference
      localStreamRef.current = stream;
      setState(prev => ({ ...prev, localStream: stream }));

      return stream;

    } catch (error: any) {
      logger.error('Failed to get user media', { error: error.message, errorName: error.name });
      console.error('[WebRTCManager] Failed to get media:', error);

      // Provide user-friendly error messages
      let errorMessage = 'Failed to access camera/microphone';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera/microphone permission denied. Please allow access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera/microphone found. Please check your devices.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera/microphone is in use by another application.';
      }

      throw new Error(errorMessage);
    }
  }, []);

  // Setup signal handlers for WebRTC events
  const setupSignalHandlers = useCallback((peer: SimplePeer.Instance, otherUserId: string, options: WebRTCManagerOptions, socket: Socket | null) => {
    // Handle WebRTC signals (offer, answer, ICE candidates)
    peer.on('signal', (data: SignalData) => {
      console.log('[WebRTCManager] Peer signal generated:', data.type || 'candidate');

      if (!socket) {
        console.error('[WebRTCManager] Socket not available for signaling');
        return;
      }

      // Emit directly to socket based on signal type
      if (data.type === 'offer') {
        socket.emit('webrtc-offer', {
          receiverId: otherUserId,
          offer: data
        });
      } else if (data.type === 'answer') {
        socket.emit('webrtc-answer', {
          callerId: otherUserId,  // Note: for answer, other user is the caller
          answer: data
        });
      } else {
        // ICE candidate
        socket.emit('webrtc-ice-candidate', {
          otherUserId: otherUserId,
          candidate: data
        });
      }
    });

    peer.on('stream', (remoteStream: MediaStream) => {
      console.log('[WebRTCManager] Received remote stream:', remoteStream.id);

      remoteStreamRef.current = remoteStream;
      setState(prev => ({ ...prev, remoteStream }));
      options.onRemoteStream?.(remoteStream);

      // Emit connection established
      callEventBus.emit('webrtc:connected', { otherUserId });
      setState(prev => ({ ...prev, connectionState: 'connected' }));
      options.onConnectionStateChange?.('connected');
    });

    // Handle connection established
    peer.on('connect', () => {
      console.log('[WebRTCManager] Peer connection established');
      retryCountRef.current = 0; // Reset retry count on success
    });

    // Handle errors
    peer.on('error', (error: Error) => {
      console.error('[WebRTCManager] Peer error:', error);

      // Only emit critical errors
      if (error.message.includes('ICE') || error.message.includes('failed')) {
        options.onError?.(`WebRTC error: ${error.message}`);
        setState(prev => ({ ...prev, connectionState: 'failed' }));
        callEventBus.emit('webrtc:failed', {
          error: error.message,
          otherUserId
        });
      }
    });

    // Handle connection close
    peer.on('close', () => {
      console.log('[WebRTCManager] Peer connection closed');
      setState(prev => ({ ...prev, connectionState: 'disconnected' }));
      options.onConnectionStateChange?.('disconnected');
    });
  }, []);

  // Setup signal subscription from queue
  // const setupSignalSubscription = useCallback((otherUserId: string) => {
  //   console.log('[WebRTCManager] Setting up signal subscription for:', otherUserId);

  //   // Unsubscribe from any existing subscription
  //   if (signalSubscriptionRef.current) {
  //     signalSubscriptionRef.current.unsubscribe();
  //   }

  //   // Subscribe to signal queue for this user
  //   const subscription = signalQueue.signals$.subscribe({
  //     next: (signal: WebRTCSignal) => {
  //       // Only process signals for this user
  //       if (signal.senderId !== otherUserId) { //What is signal.senderId, from where it is coming from??
  //         return;
  //       }

  //       console.log(`[WebRTCManager] Processing queued signal: ${signal.type} from ${signal.senderId}`);

  //       if (!peerRef.current) {
  //         console.warn('[WebRTCManager] Peer not ready yet, storing signal again!');
  //         // Store signal for later processing when peer is ready
  //         signalQueue.enqueue(signal);
  //         return;
  //       }

  //       try {
  //         peerRef.current.signal(signal.data);
  //         console.log(`[WebRTCManager] Successfully processed ${signal.type}`);
  //       } catch (error) {
  //         console.error(`[WebRTCManager] Failed to process ${signal.type}:`, error);
  //       }
  //     },
  //     error: (error) => {
  //       console.error('[WebRTCManager] Signal subscription error:', error);
  //     }
  //   });

  //   signalSubscriptionRef.current = subscription;
  // }, []);

  // Initialize WebRTC connection
  const initialize = useCallback(async (
    options: WebRTCManagerOptions
  ): Promise<void> => {
    const { isInitiator, callType, otherUserId, socket } = options;

    logger.info('→ initialize()', { isInitiator, callType, otherUserId });

    // Prevent duplicate initialization
    if (isInitializedRef.current && currentOptionsRef.current?.otherUserId === otherUserId) {
      logger.warn('Already initialized for this user, skipping', { otherUserId });
      console.log('[WebRTCManager] Already initialized for this user, skipping');
      return;
    }

    // Cleanup any existing connection
    if (peerRef.current) {
      logger.warn('Peer already exists, skipping initialization', { otherUserId });
      console.log('[WebRTCManager] Peer already initialized, skipping');
      return;
    }

    isInitializedRef.current = true;
    currentOptionsRef.current = options;
    // currentOptionsRef.current = options;  // why duplicate??

    console.log('[WebRTCManager] Initializing WebRTC:', { isInitiator, callType, otherUserId });

    try {
      // 1. Get local media stream
      const localStream = await getUserMedia(callType);
      options.onLocalStream?.(localStream); //this allows us to unlock media features to ui/components/hooks..

      // 3. Create SimplePeer instance
      console.log('[WebRTCManager] Creating peer connection, initiator:', isInitiator);

      const peer = new SimplePeer({
        initiator: isInitiator, //who is initiating call, true ? caller : receiver
        stream: localStream, //sending audio/video tracks
        trickle: true, // Send ICE candidates as they're discovered
        config: {
          iceServers: [
            // STUN servers
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            // TURN servers (for NAT traversal)
            {
              urls: 'turn:openrelay.metered.ca:80',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            },
            {
              urls: 'turn:openrelay.metered.ca:443',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            },
            {
              urls: 'turn:openrelay.metered.ca:443?transport=tcp',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            }
          ],
          iceCandidatePoolSize: 10
        }
      });

      peerRef.current = peer;

      // 4. Setup signal handlers
      setupSignalHandlers(peer, otherUserId, options, socket);

      // 5. Update connection state
      setState(prev => ({ ...prev, connectionState: 'connecting' }));
      options.onConnectionStateChange?.('connecting');

      logger.info('WebRTC initialized successfully', { isInitiator, callType, otherUserId });
      console.log('[WebRTC Manager] WebRTC initialized successfully');

    } catch (error: any) {
      console.error('[WebRTCManager] Initialization failed:', error);
      options.onError?.(error.message || 'Failed to initialize WebRTC');
      cleanup();
      throw error;
    }
  }, [getUserMedia, cleanup, setupSignalHandlers]);

  // Process immediate signal (for critical signals like initial offer/answer)
  // const processImmediateSignal = useCallback((signal: WebRTCSignal) => {
  //   console.log(`[WebRTCManager] Processing immediate signal: ${signal.type} from ${signal.senderId}`);

  //   if (!peerRef.current) {
  //     console.log('[WebRTCManager] Peer not ready, queuing signal');
  //     signalQueue.enqueue(signal);
  //     return;
  //   }

  //   try {
  //     peerRef.current.signal(signal.data);
  //     console.log(`[WebRTCManager] Successfully processed immediate ${signal.type}`);
  //   } catch (error) {
  //     console.error(`[WebRTCManager] Failed to process immediate signal:`, error);
  //     // Fallback to queue
  //     signalQueue.enqueue(signal);
  //   }
  // }, []);

  // Media control functions
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length === 0) return false;

      const newMutedState = !audioTracks[0]?.enabled;

      audioTracks.forEach(track => {
        track.enabled = newMutedState;
      });

      setState(prev => ({ ...prev, isMuted: !newMutedState }));
      return !newMutedState;
    }
    return false;
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length === 0) return false;

      const newVideoState = !videoTracks[0]?.enabled;

      videoTracks.forEach(track => {
        track.enabled = newVideoState;
      });

      setState(prev => ({ ...prev, isVideoOff: !newVideoState }));
      return !newVideoState;
    }
    return false;
  }, []);

  const startScreenShare = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[WebRTCManager] Starting screen share');

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      if (!peerRef.current || !localStreamRef.current) {
        screenStream.getTracks().forEach(track => track.stop());
        return false;
      }

      // Get the video track from screen stream
      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace the video track in the peer connection
      const peerConnection = (peerRef.current as any)._pc;
      const senders = peerConnection.getSenders();
      const videoSender = senders.find((sender: RTCRtpSender) =>
        sender.track?.kind === 'video'
      );

      if (videoSender) {
        await videoSender.replaceTrack(screenTrack);
        console.log('[WebRTCManager] Screen share started');

        // Handle screen share ending
        screenTrack.onended = () => {
          console.log('[WebRTCManager] Screen share ended by user');
          // Revert to camera if available
          const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
          if (cameraTrack) {
            videoSender.replaceTrack(cameraTrack);
          }
        };

        return true;
      }

      return false;
    } catch (error) {
      console.error('[WebRTCManager] Screen share failed:', error);
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[WebRTCManager] Component unmounting, cleaning up');
      cleanup();
    };
  }, [cleanup]);

  return {
    // State
    state,

    // Core methods
    initialize,
    cleanup,

    getPeer: () => peerRef.current,

    // Media controls
    toggleMute,
    toggleVideo,
    startScreenShare,

    // Getters
    getLocalStream: () => localStreamRef.current,
    getRemoteStream: () => remoteStreamRef.current,
    getConnectionState: () => state.connectionState,
    isInitialized: () => isInitializedRef.current
  };
}
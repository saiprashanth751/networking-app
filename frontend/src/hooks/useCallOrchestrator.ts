import { useRef, useCallback, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useWebRTCManager } from './useWebRTCManager';
import { CallParticipant, CallType, IncomingCallEvent } from '@/types/types';
import { createCallMachine } from '@/state/callMachine';
import { callEventBus } from '@/lib/eventBus';
import { createCallLogger } from '@/utils/callLogger';

const logger = createCallLogger({ file: 'hooks/useCallOrchestrator.ts', hook: 'useCallOrchestrator' });

interface UseCallOrchestratorProps {
  socket: Socket | null;
}

export function useCallOrchestrator({ socket }: UseCallOrchestratorProps) {
  logger.info('→ useCallOrchestrator() initializing', { hasSocket: !!socket, id: socket?.id });

  // ✅ FIX: Create machine instance once
  logger.info("I am going to call createCallMachine from callMachine file");
  const machineRef = useRef(createCallMachine());
  logger.info("I called and stored ref value in machineRef");
  const [state, send] = useMachine(machineRef.current);

  // Refs for managing state outside React lifecycle
  const socketRef = useRef<Socket | null>(null);
  logger.info("I got scoket, I am storing in socketRef");
  const currentCallIdRef = useRef<string>('');
  const processedCallIdsRef = useRef<Set<string>>(new Set());
  const ringingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep current state in a ref for use in callbacks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Initialize WebRTC Manager once
  // now webRTCManager has state,initialize,cleanup,processImmediateSignal,toggleMute,toggleVideo,startScreenShare, and some other getters...
  logger.info("I am going to call useWebRTCManager")
  const webRTCManager = useWebRTCManager();
  logger.info("I called and assigned response to webRTCManager")

  // ✅ Phase 3: Refs for stable callback versions to prevent socket effect re-runs
  const sendRef = useRef(send);
  const webRTCManagerRef = useRef(webRTCManager);

  // Update socket ref
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // ✅ Phase 3: Update callback refs when they change
  useEffect(() => {
    sendRef.current = send;
    webRTCManagerRef.current = webRTCManager;
  }, [send, webRTCManager]);

  // Get current call context. Get the callContext from callMachine.'
  const callContext = state.context;

  // ============================================================================
  // CORE CALL OPERATIONS
  // ============================================================================

  // Initiate a call
  const initiateCall = useCallback((
    remoteUser: CallParticipant,
    callType: CallType
  ) => {
    logger.info('→ initiateCall() in useCallOrhestrator', { remoteUserId: remoteUser.id, remoteUserName: remoteUser.name, callType });
    console.log('[Orchestrator] Initiating call to:', remoteUser.name, callType);

    // ✅ FIX: Send event with properties at top level (not nested in payload)
    logger.info("Sending using send({type: 'CALL_INITIATE', remoteUser,  callType})")
    send({
      type: 'CALL_INITIATE',
      remoteUser,
      callType
    });

    // Emit socket event
    logger.info("Emitting socket event, callInitiate")
    socketRef.current?.emit('callInitiate', {
      receiverId: remoteUser.id,
      callType
    });
    logger.info("This is after emitting event");

    // Start ringing sound (caller side)
    logger.info("Emitting event bus event sound:startRigning");
    callEventBus.emit('sound:startRinging', null);
    logger.info("Emitted event bus event sound:startRinging");

    // ✅ FIX: Clear any existing timeout before setting new one
    if (ringingTimeoutRef.current) {
      clearTimeout(ringingTimeoutRef.current);
    }

    // Set frontend timeout as fallback
    ringingTimeoutRef.current = setTimeout(() => {
      logger.warn('Frontend timeout triggered - no answer');
      console.log('[Orchestrator] Frontend timeout - no answer');
      handleTimeout();
    }, 32000);

  }, [send]);

  // Accept incoming call
  const acceptCall = useCallback(() => {
    logger.info('→ acceptCall()');
    console.log('[Orchestrator] Accepting call');

    if (!currentCallIdRef.current) {
      logger.error('No call ID to accept');
      console.error('[Orchestrator] No call ID to accept');
      return;
    }

    // Send to state machine (why are we even sending this)   
    send({ type: 'CALL_ACCEPT' });

    // Stop ringing sound
    callEventBus.emit('sound:stopRinging', null);

    // Emit socket event
    const otherUserId = stateRef.current.context.callDetails?.participants.remote.id || '';
    socketRef.current?.emit('callAccept', {
      callId: currentCallIdRef.current,
      callerId: otherUserId  //notice name, change if making contextual disturbances
    });

    // Clear ringing timeout
    if (ringingTimeoutRef.current) {
      clearTimeout(ringingTimeoutRef.current);
      ringingTimeoutRef.current = null;
    }

  }, [send]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    logger.info('→ rejectCall()');
    console.log('[Orchestrator] Rejecting call');

    if (!currentCallIdRef.current) {
      logger.error('No call ID to reject');
      console.error('[Orchestrator] No call ID to reject');
      return;
    }

    // Send to state machine
    send({ type: 'CALL_REJECT' });

    // Stop ringing sound
    callEventBus.emit('sound:stopRinging', null);

    // Emit socket event
    const otherUserId = stateRef.current.context.callDetails?.participants.remote.id || '';
    socketRef.current?.emit('callReject', {
      callId: currentCallIdRef.current,
      callerId: otherUserId
    });

    // Clear ringing timeout
    if (ringingTimeoutRef.current) {
      clearTimeout(ringingTimeoutRef.current);
      ringingTimeoutRef.current = null;
    }

  }, [send]);

  // End active call
  const endCall = useCallback(() => {
    logger.info('→ endCall()');
    console.log('[Orchestrator] Ending call');

    // Send to state machine
    send({ type: 'CALL_END' });

    // Calculate duration
    const callStartTime = stateRef.current.context.callStartTime;
    const duration = callStartTime
      ? Math.floor((Date.now() - callStartTime) / 1000)
      : 0;

    // Emit socket event
    const otherUserId = stateRef.current.context.callDetails?.participants.remote.id || '';
    if (currentCallIdRef.current && otherUserId) {
      socketRef.current?.emit('callEnd', {
        callId: currentCallIdRef.current,
        otherUserId,
        duration
      });
    }

    // Cleanup WebRTC
    webRTCManager.cleanup();

    // Reset refs
    currentCallIdRef.current = '';

    toast.info('Call ended');

  }, [send, webRTCManager]);

  // Handle timeout
  const handleTimeout = useCallback(() => {
    logger.info('→ handleTimeout()');
    console.log('[Orchestrator] Handling timeout');

    // ✅ FIX: Only send timeout if not already in idle state
    if (stateRef.current.value !== 'idle') {
      send({ type: 'TIMEOUT' });
    }

    // Emit socket timeout
    if (currentCallIdRef.current) {
      const otherUserId = stateRef.current.context.callDetails?.participants.remote.id || '';
      socketRef.current?.emit('callTimeout', {
        callId: currentCallIdRef.current,
        receiverId: otherUserId
      });
    }

    // Cleanup
    callEventBus.emit('sound:stopRinging', null);
    webRTCManager.cleanup();
    currentCallIdRef.current = '';

    toast.info('Call timed out');

  }, [send, webRTCManager]);

  // ============================================================================
  // WEBRTC COORDINATION
  // ============================================================================

  // Initialize WebRTC when entering connecting state
  useEffect(() => {
    const callDetails = state.context.callDetails;
    const otherUserId = callDetails?.participants.remote.id || '';
    const callType = callDetails?.type || 'audio';
    const isInitiator = callDetails?.direction === 'outgoing';
    if (state.matches('connecting') && otherUserId && callType) {
      console.log('[Orchestrator] Initializing WebRTC for connection');

      webRTCManager.initialize({
        isInitiator,
        callType,
        otherUserId,
        socket: socketRef.current,
        onLocalStream: (stream) => {
          console.log(`[Orchestrator] Local stream ready ${stream}`);
          send({ type: 'LOCAL_STREAM_READY', stream });
        },
        onRemoteStream: (stream) => {
          console.log(`[Orchestrator] Remote stream ready ${stream}`);
          send({ type: 'REMOTE_STREAM_READY', stream });
        },
        onConnectionStateChange: (connectionState) => {
          console.log('[Orchestrator] WebRTC connection state:', connectionState);
          if (connectionState === 'connected') {
            send({ type: 'WEBRTC_CONNECTED' });
            toast.success('Call connected!');
          } else if (connectionState === 'disconnected') {
            send({ type: 'WEBRTC_FAILED', error: 'Connection lost' });
          }
        },
        onError: (error) => {
          console.error('[Orchestrator] WebRTC error:', error);
          send({ type: 'WEBRTC_FAILED', error });
          toast.error(`Connection error: ${error}`);
        }
      });
    }
  }, [state.value, state.context.callDetails, webRTCManager, send]);

  // ============================================================================
  // SOCKET EVENT HANDLERS - ✅ Phase 3: Register only once using refs
  // ============================================================================

  useEffect(() => {
    if (!socket) return;

    // ✅ Fix #2: No manual registration guard needed
    // React manages lifecycle via [socket] dependency
    console.log('[Orchestrator] Setting up socket listeners');

    // Incoming call event
    const handleIncomingCall = (data: IncomingCallEvent) => {
      logger.info('SOCKET RECEIVE: incomingCall', { callId: data.callId, callerName: data.callerName, callType: data.callType });
      console.log('[Orchestrator] Incoming call received:', data.callerName);

      // ✅ FIX: Prevent duplicate processing
      if (processedCallIdsRef.current.has(data.callId)) {
        logger.warn('Duplicate incoming call detected, ignoring', { callId: data.callId });
        console.log('[Orchestrator] Call already processed, ignoring');
        return;
      }

      logger.info("In handleIncomingcall, I am storing processedCallIdRef.current");
      processedCallIdsRef.current.add(data.callId);
      logger.info("In handleIncomingcall, I am storing currentCallIdRef.current");
      currentCallIdRef.current = data.callId;

      // ✅ FIX: Send event with properties at top level
      logger.info("Sending machine state send({type: CALL_RECEIVED and other data})")
      // ✅ Phase 3: Use ref to avoid re-registering handlers
      sendRef.current({
        type: 'CALL_RECEIVED',
        callId: data.callId,
        callerId: data.callerId,
        callerName: data.callerName,
        callerAvatar: data.callerAvatar,
        callType: data.callType,
        room: data.room
      });

      // Start ringing sound
      logger.info("Emitting event sound:startRinging");
      callEventBus.emit('sound:startRinging', null);
      logger.info("Emitted event, sound:startRinging");

      // ✅ FIX: Clear any existing timeout
      if (ringingTimeoutRef.current) {
        clearTimeout(ringingTimeoutRef.current);
      }

      // Set timeout for incoming call
      ringingTimeoutRef.current = setTimeout(() => {
        console.log('[Orchestrator] Incoming call timeout');
        handleTimeout();
      }, 32000);
    };

    // Call ringing (caller receives this)
    const handleCallRinging = ({ callId }: { callId: string }) => {
      logger.info('SOCKET RECEIVE: callRinging', { callId });
      console.log('[Orchestrator] Call ringing, receiver notified:', callId);
      currentCallIdRef.current = callId;
    };

    // Call accepted
    const handleCallAccepted = ({ callId }: { callId: string }) => {
      logger.info('SOCKET RECEIVE: callAccepted', { callId });
      console.log('[Orchestrator] Call accepted:', callId);

      if (callId !== currentCallIdRef.current) {
        logger.warn('Call ID mismatch in callAccepted', { received: callId, expected: currentCallIdRef.current });
        return;
      }

      sendRef.current({ type: 'CALL_ACCEPT' });
      callEventBus.emit('sound:stopRinging', null);

      if (ringingTimeoutRef.current) {
        clearTimeout(ringingTimeoutRef.current);
        ringingTimeoutRef.current = null;
      }
    };

    // Call rejected
    const handleCallRejected = ({ callId }: { callId: string }) => {
      logger.info('SOCKET RECEIVE: callRejected', { callId });
      sendRef.current({ type: 'CALL_REJECT' });
      callEventBus.emit('sound:stopRinging', null);
      toast.info('Call declined');
      webRTCManagerRef.current.cleanup();
      currentCallIdRef.current = '';
    };

    // Call ended
    const handleCallEnded = ({ callId }: { callId: string }) => {
      logger.info('SOCKET RECEIVE: callEnded', { callId });
      sendRef.current({ type: 'CALL_END' });
      toast.info('Call ended by other party');
      webRTCManagerRef.current.cleanup();
      currentCallIdRef.current = '';
    };

    // Call cancelled/timeout
    const handleCallCancelled = ({ callId }: { callId: string }) => {
      logger.info('SOCKET RECEIVE: callCancelled', { callId });

      // ✅ FIX: Only send timeout if in ringing state
      if (stateRef.current.value === 'incoming.ringing' || stateRef.current.value === 'outgoing.ringing') {
        sendRef.current({ type: 'TIMEOUT' });
        toast.info('Call cancelled');
      }

      callEventBus.emit('sound:stopRinging', null);
      webRTCManagerRef.current.cleanup();
      currentCallIdRef.current = '';
    };

    // Call unavailable
    const handleCallUnavailable = ({ reason }: { reason: string }) => {
      logger.info('SOCKET RECEIVE: callUnavailable', { reason });
      sendRef.current({ type: 'CALL_END' });
      toast.error(reason);
      webRTCManagerRef.current.cleanup();
      currentCallIdRef.current = '';
    };

    // WebRTC signals
    const handleWebRTCOffer = (data: { offer: any; senderId: string }) => {
      logger.info('SOCKET RECEIVE: webrtc-offer', { senderId: data.senderId });

      const peer = webRTCManagerRef.current.getPeer();
      if (!peer) {
        console.warn('[Orchestrator] Peer not ready for offer');
        return;
      }

      try {
        peer.signal(data.offer);
        console.log('[Orchestrator] Processed offer successfully');
      } catch (error) {
        console.error('[Orchestrator] Failed to process offer:', error);
      }
    };

    const handleWebRTCAnswer = (data: { answer: any; senderId: string }) => {
      logger.info('SOCKET RECEIVE: webrtc-answer', { senderId: data.senderId });

      const peer = webRTCManagerRef.current.getPeer();
      if (!peer) {
        console.warn('[Orchestrator] Peer not ready for answer');
        return;
      }

      try {
        peer.signal(data.answer);
        console.log('[Orchestrator] Processed answer successfully');
      } catch (error) {
        console.error('[Orchestrator] Failed to process answer:', error);
      }
    };

    const handleWebRTCIceCandidate = (data: { candidate: any; senderId: string }) => {
      logger.info('SOCKET RECEIVE: webrtc-ice-candidate', { senderId: data.senderId });

      const peer = webRTCManagerRef.current.getPeer();
      if (!peer) {
        console.warn('[Orchestrator] Peer not ready for ICE candidate');
        return;
      }

      try {
        peer.signal(data.candidate);
        console.log('[Orchestrator] Processed ICE candidate successfully');
      } catch (error) {
        console.error('[Orchestrator] Failed to process ICE candidate:', error);
      }
    };

    // Register listeners
    socket.on('incomingCall', handleIncomingCall);
    socket.on('callRinging', handleCallRinging);
    socket.on('callAccepted', handleCallAccepted);
    socket.on('callRejected', handleCallRejected);
    socket.on('callEnded', handleCallEnded);
    socket.on('callCancelled', handleCallCancelled);
    socket.on('callUnavailable', handleCallUnavailable);
    socket.on('webrtc-offer', handleWebRTCOffer);
    socket.on('webrtc-answer', handleWebRTCAnswer);
    socket.on('webrtc-ice-candidate', handleWebRTCIceCandidate);

    // Cleanup function
    return () => {
      console.log('[Orchestrator] Cleaning up socket listeners');

      socket.off('incomingCall', handleIncomingCall);
      socket.off('callRinging', handleCallRinging);
      socket.off('callAccepted', handleCallAccepted);
      socket.off('callRejected', handleCallRejected);
      socket.off('callEnded', handleCallEnded);
      socket.off('callCancelled', handleCallCancelled);
      socket.off('callUnavailable', handleCallUnavailable);
      socket.off('webrtc-offer', handleWebRTCOffer);
      socket.off('webrtc-answer', handleWebRTCAnswer);
      socket.off('webrtc-ice-candidate', handleWebRTCIceCandidate);

      // Clear any pending timeouts
      if (ringingTimeoutRef.current) {
        clearTimeout(ringingTimeoutRef.current);
        ringingTimeoutRef.current = null;
      }
    };
  }, [socket]); // ✅ Phase 3: Only depend on socket - handlers use refs for callbacks

  // ============================================================================
  // MEDIA CONTROLS
  // ============================================================================

  const toggleMute = useCallback(() => {
    console.log('[Orchestrator] Toggling mute');
    send({ type: 'MEDIA_TOGGLE_MUTE' });
    webRTCManager.toggleMute();
  }, [send, webRTCManager]);

  const toggleVideo = useCallback(() => {
    console.log('[Orchestrator] Toggling video');
    send({ type: 'MEDIA_TOGGLE_VIDEO' });
    webRTCManager.toggleVideo();
  }, [send, webRTCManager]);

  const startScreenShare = useCallback(async () => {
    console.log('[Orchestrator] Starting screen share');
    const success = await webRTCManager.startScreenShare();
    if (success) {
      send({ type: 'MEDIA_TOGGLE_SCREEN_SHARE' });
    }
    return success;
  }, [send, webRTCManager]);

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    // State
    callState: state.value,
    callContext,

    // Current call info
    activeCall: callContext.callDetails,
    incomingCall: state.matches({ incoming: 'ringing' })
      ? callContext.callDetails
      : null,

    isRinging: callContext.isRinging,
    isConnected: callContext.isConnected,

    // Media streams
    localStream: webRTCManager.state.localStream,
    remoteStream: webRTCManager.state.remoteStream,

    // Media controls state
    isMuted: callContext.isMuted,
    isVideoOff: callContext.isVideoOff,
    isScreenSharing: callContext.isScreenSharing,

    // Core operations
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,

    // Media controls
    toggleMute,
    toggleVideo,
    startScreenShare,

    // Utility
    isInCall: state.matches('connecting') || state.matches('active'),
    hasIncomingCall: state.matches({ incoming: 'ringing' }),
  };
}
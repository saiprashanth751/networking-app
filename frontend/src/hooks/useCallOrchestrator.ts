import { useRef, useCallback, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useWebRTCManager } from './useWebRTCManager';
import { CallParticipant, CallType, IncomingCallEvent, WebRTCSignal } from '@/types/types';
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

  // ✅ FIX: Track if socket handlers are already registered
  const handlersRegisteredRef = useRef(false);

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

  // Update socket ref
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

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

    if (state.value === 'connecting' && otherUserId && callType) {
      console.log('[Orchestrator] Initializing WebRTC for connection');

      webRTCManager.initialize({
        isInitiator,
        callType,
        otherUserId,
        onLocalStream: (stream) => { //where the stream is accessed, how it is being passsed?
          console.log(`[Orchestrator] Local stream ready ${stream}`);
        },
        onRemoteStream: (stream) => { //where the stream is accessed, how it is being passsed?
          console.log(`[Orchestrator] Remote stream ready ${stream}`);
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
      }).catch(error => {
        console.error('[Orchestrator] WebRTC initialization failed:', error);
        send({ type: 'WEBRTC_FAILED', error: error.message });
      });
    }
  }, [state.value, state.context.callDetails, webRTCManager, send]);

  // Process WebRTC signals from socket
  const processWebRTCSignal = useCallback((signal: WebRTCSignal) => {
    console.log('[Orchestrator] Processing WebRTC signal:', signal.type);
    webRTCManager.processImmediateSignal(signal);
  }, [webRTCManager]);

  // ============================================================================
  // SOCKET EVENT HANDLERS - ✅ FIX: Register only once
  // ============================================================================

  useEffect(() => {
    if (!socket) return;

    // ✅ FIX: Prevent duplicate registration
    if (handlersRegisteredRef.current) {
      console.log('[Orchestrator] Socket handlers already registered, skipping');
      return;
    }

    console.log('[Orchestrator] Setting up socket listeners');
    handlersRegisteredRef.current = true;

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
      send({
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

      send({ type: 'CALL_ACCEPT' });
      callEventBus.emit('sound:stopRinging', null);

      if (ringingTimeoutRef.current) {
        clearTimeout(ringingTimeoutRef.current);
        ringingTimeoutRef.current = null;
      }
    };

    // Call rejected
    const handleCallRejected = ({ callId }: { callId: string }) => {
      logger.info('SOCKET RECEIVE: callRejected', { callId });
      send({ type: 'CALL_REJECT' });
      callEventBus.emit('sound:stopRinging', null);
      toast.info('Call declined');
      webRTCManager.cleanup();
      currentCallIdRef.current = '';
    };

    // Call ended
    const handleCallEnded = ({ callId }: { callId: string }) => {
      logger.info('SOCKET RECEIVE: callEnded', { callId });
      send({ type: 'CALL_END' });
      toast.info('Call ended by other party');
      webRTCManager.cleanup();
      currentCallIdRef.current = '';
    };

    // Call cancelled/timeout
    const handleCallCancelled = ({ callId }: { callId: string }) => {
      logger.info('SOCKET RECEIVE: callCancelled', { callId });
      
      // ✅ FIX: Only send timeout if in ringing state
      if (stateRef.current.value === 'incoming.ringing' || stateRef.current.value === 'outgoing.ringing') {
        send({ type: 'TIMEOUT' });
        toast.info('Call cancelled');
      }

      callEventBus.emit('sound:stopRinging', null);
      webRTCManager.cleanup();
      currentCallIdRef.current = '';
    };

    // Call unavailable
    const handleCallUnavailable = ({ reason }: { reason: string }) => {
      logger.info('SOCKET RECEIVE: callUnavailable', { reason });
      send({ type: 'CALL_END' });
      toast.error(reason);
      webRTCManager.cleanup();
      currentCallIdRef.current = '';
    };

    // WebRTC signals
    const handleWebRTCOffer = (data: { offer: any; senderId: string }) => {
      logger.info('SOCKET RECEIVE: webrtc-offer', { senderId: data.senderId });
      processWebRTCSignal({
        type: 'offer',
        data: data.offer,
        timestamp: Date.now(),
        senderId: data.senderId
      });
    };

    const handleWebRTCAnswer = (data: { answer: any; senderId: string }) => {
      logger.info('SOCKET RECEIVE: webrtc-answer', { senderId: data.senderId });
      processWebRTCSignal({
        type: 'answer',
        data: data.answer,
        timestamp: Date.now(),
        senderId: data.senderId
      });
    };

    const handleWebRTCIceCandidate = (data: { candidate: any; senderId: string }) => {
      logger.info('SOCKET RECEIVE: webrtc-ice-candidate', { senderId: data.senderId });
      processWebRTCSignal({
        type: 'candidate',
        data: data.candidate,
        timestamp: Date.now(),
        senderId: data.senderId
      });
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
      handlersRegisteredRef.current = false;

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
  }, [socket, send, processWebRTCSignal, webRTCManager, handleTimeout]);

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
    incomingCall: state.value === 'incoming.ringing' ? callContext.callDetails : null,
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
    isInCall: state.value !== 'idle',
    hasIncomingCall: state.value === 'incoming.ringing'
  };
}
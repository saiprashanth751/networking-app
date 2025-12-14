// src/hooks/useCallManager.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { CallType, ActiveCall, IncomingCallEvent } from '@/types/types';
import { toast } from 'react-toastify';

export function useCallManager(socket: Socket | null) {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallEvent | null>(null);
  
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ringingSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for ringing (create once)
  useEffect(() => {
    // Create ringing sound (you'll need to add a ring.mp3 to public folder)
    // Or use a simple beep: data:audio/wav;base64,...
    ringingSoundRef.current = new Audio('/ring.mp3');
    ringingSoundRef.current.loop = true;
  }, []);

//   useEffect(() => {
//   // Use a free ringing sound from a reliable CDN
//   ringingSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
//   ringingSoundRef.current.loop = true;
//   ringingSoundRef.current.volume = 0.5; // 50% volume
// }, []);

  // Play ringing sound
  const playRingingSound = useCallback(() => {
    ringingSoundRef.current?.play().catch(err => {
      console.error('Failed to play ringing sound:', err);
    });
  }, []);

  // Stop ringing sound
  const stopRingingSound = useCallback(() => {
    if (ringingSoundRef.current) {
      ringingSoundRef.current.pause();
      ringingSoundRef.current.currentTime = 0;
    }
  }, []);

  // Initiate outgoing call
  const initiateCall = useCallback((
    otherUserId: string,
    otherUserName: string,
    otherUserAvatar: string | null,
    callType: CallType
  ) => {
    if (!socket) {
      toast.error('Connection error. Please refresh the page.');
      return;
    }

    console.log('[CallManager] Initiating call:', { otherUserId, callType });

    // Set initial call state
    setActiveCall({
      callId: '', // Will be set when server responds
      otherUserId,
      otherUserName,
      otherUserAvatar,
      callType,
      state: 'initiating',
      startTime: null,
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false
    });

    // Emit call initiation
    socket.emit('callInitiate', { receiverId: otherUserId, callType });

    // Start ringing sound
    playRingingSound();

    // Set timeout for no answer (30 seconds)
    callTimeoutRef.current = setTimeout(() => {
      console.log('[CallManager] Call timeout - no answer');
      stopRingingSound();
      
      if (activeCall?.callId) {
        socket.emit('callTimeout', { 
          callId: activeCall.callId, 
          receiverId: otherUserId 
        });
      }

      setActiveCall(null);
      toast.info(`${otherUserName} didn't answer`);
    }, 30000);

  }, [socket, activeCall, playRingingSound, stopRingingSound]);

  // Accept incoming call
  const acceptCall = useCallback(() => {
    if (!incomingCall || !socket) return;

    console.log('[CallManager] Accepting call:', incomingCall.callId);
    
    stopRingingSound();

    setActiveCall({
      callId: incomingCall.callId,
      otherUserId: incomingCall.callerId,
      otherUserName: incomingCall.callerName,
      otherUserAvatar: incomingCall.callerAvatar,
      callType: incomingCall.callType,
      state: 'connecting',
      startTime: Date.now(),
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false
    });

    socket.emit('callAccept', { 
      callId: incomingCall.callId, 
      callerId: incomingCall.callerId 
    });

    setIncomingCall(null);
  }, [incomingCall, socket, stopRingingSound]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (!incomingCall || !socket) return;

    console.log('[CallManager] Rejecting call:', incomingCall.callId);
    
    stopRingingSound();

    socket.emit('callReject', { 
      callId: incomingCall.callId, 
      callerId: incomingCall.callerId 
    });

    setIncomingCall(null);
  }, [incomingCall, socket, stopRingingSound]);

  // End active call
  const endCall = useCallback(() => {
    if (!activeCall || !socket) return;

    console.log('[CallManager] Ending call:', activeCall.callId);
    
    stopRingingSound();

    // Clear timeout
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    const duration = activeCall.startTime 
      ? Math.floor((Date.now() - activeCall.startTime) / 1000)
      : 0;

    socket.emit('callEnd', {
      callId: activeCall.callId,
      otherUserId: activeCall.otherUserId,
      duration
    });

    setActiveCall(null);
  }, [activeCall, socket, stopRingingSound]);

  // Update call state
  const updateCallState = useCallback((updates: Partial<ActiveCall>) => {
    setActiveCall(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Incoming call
    const handleIncomingCall = (data: IncomingCallEvent) => {
      console.log('[CallManager] Incoming call:', data);
      setIncomingCall(data);
      playRingingSound();
      
      // Show notification
      toast.info(`${data.callerName} is calling...`, {
        autoClose: false,
        closeButton: false
      });
    };

    // Call ringing (outgoing call is ringing on other end)
    const handleCallRinging = ({ callId }: { callId: string; room: string }) => {
      console.log('[CallManager] Call ringing:', callId);
      setActiveCall(prev => prev ? { 
        ...prev, 
        callId, 
        state: 'ringing' 
      } : null);
    };

    // Call accepted
    const handleCallAccepted = ({ callId }: { callId: string; receiverId: string }) => {
      console.log('[CallManager] Call accepted:', callId);
      
      stopRingingSound();
      
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      setActiveCall(prev => prev ? {
        ...prev,
        callId,
        state: 'connecting',
        startTime: Date.now()
      } : null);
    };

    // Call rejected
    const handleCallRejected = ({ callId }: { callId: string }) => {
      console.log('[CallManager] Call rejected:', callId);
      
      stopRingingSound();
      
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      toast.info('Call declined');
      setActiveCall(null);
    };

    // Call ended by other user
    const handleCallEnded = ({ callId }: { callId: string }) => {
      console.log('[CallManager] Call ended by other user:', callId);
      
      stopRingingSound();
      toast.info('Call ended');
      setActiveCall(null);
    };

    // Call cancelled (timeout)
    const handleCallCancelled = ({ callId }: { callId: string }) => {
      console.log('[CallManager] Call cancelled:', callId);
      
      stopRingingSound();
      setIncomingCall(null);
    };

    // WebRTC connection established
    const handleWebRTCConnected = () => {
      console.log('[CallManager] WebRTC connected');
      setActiveCall(prev => prev ? { ...prev, state: 'active' } : null);
    };

    // WebRTC connection failed
    const handleWebRTCFailed = ({ reason }: { senderId: string; reason: string }) => {
      console.log('[CallManager] WebRTC failed:', reason);
      toast.error(`Connection failed: ${reason}`);
      setActiveCall(null);
    };

    // Register listeners
    socket.on('incomingCall', handleIncomingCall);
    socket.on('callRinging', handleCallRinging);
    socket.on('callAccepted', handleCallAccepted);
    socket.on('callRejected', handleCallRejected);
    socket.on('callEnded', handleCallEnded);
    socket.on('callCancelled', handleCallCancelled);
    socket.on('webrtc-connected', handleWebRTCConnected);
    socket.on('webrtc-failed', handleWebRTCFailed);

    return () => {
      socket.off('incomingCall', handleIncomingCall);
      socket.off('callRinging', handleCallRinging);
      socket.off('callAccepted', handleCallAccepted);
      socket.off('callRejected', handleCallRejected);
      socket.off('callEnded', handleCallEnded);
      socket.off('callCancelled', handleCallCancelled);
      socket.off('webrtc-connected', handleWebRTCConnected);
      socket.off('webrtc-failed', handleWebRTCFailed);
    };
  }, [socket, playRingingSound, stopRingingSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
      }
      stopRingingSound();
    };
  }, [stopRingingSound]);

  return {
    activeCall,
    incomingCall,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    updateCallState
  };
}
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
  const callIdRef = useRef<string>('');
  const isRingingRef = useRef<boolean>(false);
  const processedCallIds = useRef<Set<string>>(new Set()); // 🔥 Track processed calls
  const incomingCallRef = useRef<IncomingCallEvent | null>(null); // 🔥 Ref for closure access

  // Initialize ringing sound once
  useEffect(() => {
    ringingSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    ringingSoundRef.current.loop = true;
    ringingSoundRef.current.volume = 0.5;

    return () => {
      if (ringingSoundRef.current) {
        ringingSoundRef.current.pause();
        ringingSoundRef.current = null;
      }
    };
  }, []);

  // 🔥 FIX: Robust stop ringing with force flag
  const stopRingingSound = useCallback((force = false) => {
    console.log('[Sound] Stopping ringing sound', { force, isPlaying: isRingingRef.current });
    if (ringingSoundRef.current) {
      ringingSoundRef.current.pause();
      ringingSoundRef.current.currentTime = 0;
      isRingingRef.current = false;
    }
  }, []);

  // 🔥 FIX: Play ringing sound with duplicate guard
  const playRingingSound = useCallback(() => {
    if (isRingingRef.current) {
      console.log('[Sound] Ringing already playing, skipping duplicate');
      return;
    }

    console.log('[Sound] Starting ringing sound');
    ringingSoundRef.current?.play()
      .then(() => {
        isRingingRef.current = true;
      })
      .catch(err => {
        console.error('Failed to play ringing sound:', err);
      });
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
      callId: '',
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

    // Start ringing sound (for caller - waiting for answer)
    playRingingSound();

    // Frontend timeout as fallback (backend is authority)
    callTimeoutRef.current = setTimeout(() => {
      console.log('[CallManager] Frontend timeout - no answer');
      stopRingingSound(true);

      if (callIdRef.current) {
        socket.emit('callTimeout', {
          callId: callIdRef.current,
          receiverId: otherUserId
        });
      }

      setActiveCall(null);
      callIdRef.current = '';
      toast.info(`${otherUserName} didn't answer`);
    }, 30000);

  }, [socket, playRingingSound, stopRingingSound]);

  // Accept incoming call
  const acceptCall = useCallback(() => {
    const currentIncomingCall = incomingCallRef.current;
    if (!currentIncomingCall || !socket) return;

    console.log('[CallManager] Accepting call:', currentIncomingCall.callId);

    // 🔥 CRITICAL: Stop ALL ringing IMMEDIATELY
    stopRingingSound(true);

    setActiveCall({
      callId: currentIncomingCall.callId,
      otherUserId: currentIncomingCall.callerId,
      otherUserName: currentIncomingCall.callerName,
      otherUserAvatar: currentIncomingCall.callerAvatar,
      callType: currentIncomingCall.callType,
      state: 'connecting',
      startTime: Date.now(),
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false
    });

    callIdRef.current = currentIncomingCall.callId;

    socket.emit('callAccept', {
      callId: currentIncomingCall.callId,
      callerId: currentIncomingCall.callerId
    });

    setIncomingCall(null);
    incomingCallRef.current = null;
  }, [socket, stopRingingSound]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    const currentIncomingCall = incomingCallRef.current;
    if (!currentIncomingCall || !socket) return;

    console.log('[CallManager] Rejecting call:', currentIncomingCall.callId);

    stopRingingSound(true);

    socket.emit('callReject', {
      callId: currentIncomingCall.callId,
      callerId: currentIncomingCall.callerId
    });

    setIncomingCall(null);
    incomingCallRef.current = null;
  }, [socket, stopRingingSound]);

  // End active call
  const endCall = useCallback(() => {
    if (!activeCall || !socket) return;

    console.log('[CallManager] Ending call:', activeCall.callId);

    stopRingingSound(true);

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
    callIdRef.current = '';
  }, [activeCall, socket, stopRingingSound]);

  // Update call state
  const updateCallState = useCallback((updates: Partial<ActiveCall>) => {
    setActiveCall(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // 🔥 FIX: Incoming call with idempotency
    const handleIncomingCall = (data: IncomingCallEvent) => {
      console.log('[CallManager] 📞 Incoming call received', { 
        callerName: data.callerName, 
        callId: data.callId,
        alreadyProcessed: processedCallIds.current.has(data.callId),
        hasIncomingCall: !!incomingCall
      });

      // 🔥 CRITICAL: Prevent duplicate processing
      if (processedCallIds.current.has(data.callId)) {
        console.log('[CallManager] ⚠️ Already processed this call, IGNORING');
        return;
      }

      if (incomingCallRef.current) {
        console.log('[CallManager] ⚠️ Already have incoming call, IGNORING new one');
        return;
      }

      // Mark as processed IMMEDIATELY
      processedCallIds.current.add(data.callId);
      console.log('[CallManager] ✅ Marked call as processed:', data.callId);

      setIncomingCall(data);
      incomingCallRef.current = data; // 🔥 Update ref

      // 🔥 Stop any existing ringing first
      stopRingingSound(true);
      
      // Small delay to ensure audio resets
      setTimeout(() => {
        playRingingSound();
      }, 100);

      toast.info(`${data.callerName} is calling...`, {
        autoClose: false,
        closeButton: false
      });
    };

    // Call ringing (CALLER gets confirmation)
    const handleCallRinging = ({ callId }: { callId: string; room: string }) => {
      console.log('[CallManager] Call ringing (receiver notified):', callId);

      callIdRef.current = callId;

      setActiveCall(prev => prev ? {
        ...prev,
        callId,
        state: 'ringing'
      } : null);

      // Ringing sound ALREADY playing from initiateCall
    };

    // Call accepted (BOTH users stop ringing)
    const handleCallAccepted = ({ callId }: { callId: string; receiverId: string }) => {
      console.log('[CallManager] ✅ Call accepted:', callId);

      // 🔥 CRITICAL: Force stop ALL ringing for CALLER
      stopRingingSound(true);

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

      stopRingingSound(true);

      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      toast.info('Call declined');
      setActiveCall(null);
      callIdRef.current = '';
      processedCallIds.current.delete(callId);
    };

    // Call ended by other user
    const handleCallEnded = ({ callId }: { callId: string }) => {
      console.log('[CallManager] Call ended by other user:', callId);

      stopRingingSound(true);
      toast.info('Call ended');
      setActiveCall(null);
      callIdRef.current = '';
      processedCallIds.current.delete(callId);
    };

    // Call cancelled (timeout)
    const handleCallCancelled = ({ callId }: { callId: string }) => {
      console.log('[CallManager] Call cancelled:', callId);

      stopRingingSound(true);
      setIncomingCall(null);
      incomingCallRef.current = null; // 🔥 Update ref
      processedCallIds.current.delete(callId);
    };

    // Backend timeout
    const handleCallTimeout = ({ callId }: { callId: string }) => {
      console.log('[CallManager] Backend timeout received:', callId);

      stopRingingSound(true);

      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      toast.info('Call not answered');
      setActiveCall(null);
      callIdRef.current = '';
      processedCallIds.current.delete(callId);
    };

    // User unavailable
    const handleCallUnavailable = ({ reason }: { receiverId: string; reason: string }) => {
      console.log('[CallManager] Call unavailable:', reason);

      stopRingingSound(true);

      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      toast.error(reason);
      setActiveCall(null);
      callIdRef.current = '';
    };

    // WebRTC connection established
    const handleWebRTCConnected = () => {
      console.log('[CallManager] ✅ WebRTC connected - call is now active');
      setActiveCall(prev => prev ? { ...prev, state: 'active' } : null);
    };

    // WebRTC connection failed
    const handleWebRTCFailed = ({ reason }: { senderId: string; reason: string }) => {
      console.log('[CallManager] ❌ WebRTC failed:', reason);
      stopRingingSound(true);
      toast.error(`Connection failed: ${reason}`);
      setActiveCall(null);
      callIdRef.current = '';
    };

    // Register listeners
    socket.on('incomingCall', handleIncomingCall);
    socket.on('callRinging', handleCallRinging);
    socket.on('callAccepted', handleCallAccepted);
    socket.on('callRejected', handleCallRejected);
    socket.on('callEnded', handleCallEnded);
    socket.on('callCancelled', handleCallCancelled);
    socket.on('callTimeout', handleCallTimeout);
    socket.on('callUnavailable', handleCallUnavailable);
    socket.on('webrtc-connected', handleWebRTCConnected);
    socket.on('webrtc-failed', handleWebRTCFailed);

    return () => {
      socket.off('incomingCall', handleIncomingCall);
      socket.off('callRinging', handleCallRinging);
      socket.off('callAccepted', handleCallAccepted);
      socket.off('callRejected', handleCallRejected);
      socket.off('callEnded', handleCallEnded);
      socket.off('callCancelled', handleCallCancelled);
      socket.off('callTimeout', handleCallTimeout);
      socket.off('callUnavailable', handleCallUnavailable);
      socket.off('webrtc-connected', handleWebRTCConnected);
      socket.off('webrtc-failed', handleWebRTCFailed);

      stopRingingSound(true);
    };
  }, [socket, playRingingSound, stopRingingSound]); // 🔥 REMOVED incomingCall from deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
      }
      stopRingingSound(true);
      processedCallIds.current.clear();
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
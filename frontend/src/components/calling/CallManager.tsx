import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useCallManager } from '@/hooks/useCallManager';
import { useWebRTC } from '@/hooks/useWebRTC';
import { IncomingCallModal } from './IncomingCallModal';
import { CallScreen } from './CallScreen';

interface CallManagerProps {
  socket: Socket | null;
}

export function CallManager({ socket }: CallManagerProps) {
  const {
    activeCall,
    incomingCall,
    acceptCall,
    rejectCall,
    endCall,
    updateCallState
  } = useCallManager(socket);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasReceivedOffer, setHasReceivedOffer] = useState(false);

  // 🔥 FIX: Only initialize WebRTC when in proper state
  // BOTH caller and receiver should wait for "connecting" state
  const shouldInitWebRTC = activeCall && (
    activeCall.state === 'connecting' || 
    activeCall.state === 'active'
  );

  // 🔥 FIX: Determine initiator based on who STARTED the call, not state
  const [isCallerUser, setIsCallerUser] = useState(false);

  // Track if this user is the caller (who initiated the call)
  useEffect(() => {
    if (activeCall?.state === 'initiating' || activeCall?.state === 'ringing') {
      console.log('[CallManager] 🔔 This user is the CALLER');
      setIsCallerUser(true);
    } else if (!activeCall) {
      setIsCallerUser(false);
    }
  }, [activeCall?.state, activeCall?.callId]);

  // Caller is ALWAYS the WebRTC initiator
  const isInitiator = isCallerUser;

  // Debug logging
  useEffect(() => {
    if (activeCall) {
      console.log('[CallManager] 🔍 Call state debug:', {
        state: activeCall.state,
        callId: activeCall.callId,
        isCallerUser,
        isInitiator,
        shouldInitWebRTC,
        hasReceivedOffer
      });
    }
  }, [activeCall, isCallerUser, isInitiator, shouldInitWebRTC, hasReceivedOffer]);

  // Initialize WebRTC
  const {
    localStream,
    remoteStream,
    initializeCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    cleanup
  } = useWebRTC({
    socket,
    isInitiator,
    callType: activeCall?.callType || 'audio',
    otherUserId: activeCall?.otherUserId || '',
    onConnectionEstablished: () => {
      console.log('[CallManager] ✅ Connection established, updating to active');
      updateCallState({ state: 'active' });
    },
    onConnectionFailed: (reason) => {
      console.error('[CallManager] ❌ Connection failed:', reason);
      // 🔥 FIX: Don't end call on connection failure immediately, might be initializing
      setTimeout(() => {
        if (activeCall && activeCall.state !== 'active') {
          console.log('[CallManager] Ending call due to connection failure');
          endCall();
        }
      }, 1000);
    },
    onStreamEnded: () => {
      console.log('[CallManager] Stream ended');
      // 🔥 FIX: Only end if call is active
      if (activeCall && activeCall.state === 'active') {
        endCall();
      }
    }
  });

  // 🔥 FIX: Initialize WebRTC with proper timing
  useEffect(() => {
    console.log('[CallManager] 🔄 WebRTC init effect triggered', {
      shouldInitWebRTC,
      hasLocalStream: !!localStream,
      isInitiator,
      isCallerUser,
      hasReceivedOffer,
      state: activeCall?.state,
      callId: activeCall?.callId
    });

    if (!shouldInitWebRTC) {
      console.log('[CallManager] ⏭️ Skipping: shouldInitWebRTC is false');
      return;
    }

    if (localStream) {
      console.log('[CallManager] ⏭️ Skipping: already have local stream');
      return;
    }

    // 🔥 CRITICAL: Receiver (non-initiator) must wait for offer before initializing
    if (!isInitiator && !hasReceivedOffer) {
      console.log('[CallManager] ⏳ Receiver waiting for offer before WebRTC init...');
      return;
    }

    console.log('[CallManager] ✅ Preparing to initialize WebRTC', { 
      isInitiator, 
      isCaller: isCallerUser,
      hasReceivedOffer,
      state: activeCall?.state,
      callId: activeCall?.callId,
      shouldInit: shouldInitWebRTC,
      hasLocalStream: !!localStream
    });
    
    // 🔥 CRITICAL: Longer delay to ensure both parties are synchronized
    const timer = setTimeout(() => {
      console.log('[CallManager] Starting WebRTC initialization NOW');
      
      try {
        initializeCall();
      } catch (error) {
        console.error('[CallManager] ❌ Failed to initialize WebRTC:', error);
      }
    }, isInitiator ? 500 : 300); // Give initiator more time to ensure receiver is ready

    return () => {
      console.log('[CallManager] Clearing WebRTC init timer');
      clearTimeout(timer);
    };
  }, [shouldInitWebRTC, localStream, isInitiator, isCallerUser, hasReceivedOffer, activeCall?.state, activeCall?.callId, initializeCall]);

  // Cleanup WebRTC when call ends
  useEffect(() => {
    if (!activeCall) {
      cleanup();
      setHasReceivedOffer(false);
      setIsMuted(false);
      setIsVideoOff(false);
      setIsScreenSharing(false);
    }
  }, [activeCall, cleanup]);

  // Handle WebRTC signaling events
  useEffect(() => {
    if (!socket) return;

    const handleWebRTCOffer = (data: { offer: any; senderId: string }) => {
      console.log('[CallManager] 📨 Received WebRTC offer from:', data.senderId);
      setHasReceivedOffer(true);
      handleOffer(data);
    };

    const handleWebRTCAnswer = (data: { answer: any; senderId: string }) => {
      console.log('[CallManager] 📨 Received WebRTC answer from:', data.senderId);
      handleAnswer(data);
    };

    const handleWebRTCIceCandidate = (data: { candidate: any; senderId: string }) => {
      console.log('[CallManager] 📨 Received ICE candidate from:', data.senderId);
      handleIceCandidate(data);
    };

    socket.on('webrtc-offer', handleWebRTCOffer);
    socket.on('webrtc-answer', handleWebRTCAnswer);
    socket.on('webrtc-ice-candidate', handleWebRTCIceCandidate);

    return () => {
      socket.off('webrtc-offer', handleWebRTCOffer);
      socket.off('webrtc-answer', handleWebRTCAnswer);
      socket.off('webrtc-ice-candidate', handleWebRTCIceCandidate);
    };
  }, [socket, handleOffer, handleAnswer, handleIceCandidate]);

  // Handle mute toggle
  const handleToggleMute = () => {
    const newMutedState = toggleAudio();
    setIsMuted(newMutedState);
    updateCallState({ isMuted: newMutedState });
  };

  // Handle video toggle
  const handleToggleVideo = () => {
    const newVideoOffState = toggleVideo();
    setIsVideoOff(newVideoOffState);
    updateCallState({ isVideoOff: newVideoOffState });
  };

  // Handle screen share toggle
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      setIsScreenSharing(false);
      updateCallState({ isScreenSharing: false });
    } else {
      const success = await startScreenShare();
      if (success) {
        setIsScreenSharing(true);
        updateCallState({ isScreenSharing: true });
      }
    }
  };

  return (
    <>
      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          isOpen={!!incomingCall}
          callerName={incomingCall.callerName}
          callerAvatar={incomingCall.callerAvatar}
          callType={incomingCall.callType}
          onAccept={acceptCall}
          onDecline={rejectCall}
        />
      )}

      {/* Active Call Screen */}
      {activeCall && (activeCall.state === 'connecting' || activeCall.state === 'active') && (
        <CallScreen
          callerName={activeCall.otherUserName}
          callerAvatar={activeCall.otherUserAvatar}
          callType={activeCall.callType}
          callState={activeCall.state}
          localStream={localStream}
          remoteStream={remoteStream}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onEndCall={endCall}
        />
      )}
    </>
  );
}
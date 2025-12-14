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

  // Determine if we should initialize WebRTC
  const shouldInitWebRTC = activeCall && (
    activeCall.state === 'connecting' || 
    activeCall.state === 'active'
  );

  // Initialize WebRTC when call is accepted
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
    isInitiator: activeCall?.state === 'ringing' || activeCall?.state === 'initiating',
    callType: activeCall?.callType || 'audio',
    otherUserId: activeCall?.otherUserId || '',
    onConnectionEstablished: () => {
      updateCallState({ state: 'active' });
    },
    onConnectionFailed: (reason) => {
      console.error('Connection failed:', reason);
      endCall();
    },
    onStreamEnded: () => {
      endCall();
    }
  });

  // Initialize WebRTC when call state changes to connecting
  useEffect(() => {
    if (shouldInitWebRTC && !localStream) {
      console.log('[CallManager] Initializing WebRTC');
      initializeCall();
    }
  }, [shouldInitWebRTC, initializeCall, localStream]);

  // Cleanup WebRTC when call ends
  useEffect(() => {
    if (!activeCall) {
      cleanup();
    }
  }, [activeCall, cleanup]);

  // Handle WebRTC signaling events from socket
  useEffect(() => {
    if (!socket) return;

    const handleWebRTCOffer = ({ offer }: { offer: any; senderId: string }) => {
      console.log('[CallManager] Received WebRTC offer');
      handleOffer(offer);
    };

    const handleWebRTCAnswer = ({ answer }: { answer: any; senderId: string }) => {
      console.log('[CallManager] Received WebRTC answer');
      handleAnswer(answer);
    };

    const handleWebRTCIceCandidate = ({ candidate }: { candidate: any; senderId: string }) => {
      console.log('[CallManager] Received ICE candidate');
      handleIceCandidate(candidate);
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
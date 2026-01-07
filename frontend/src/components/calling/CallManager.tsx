import { useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useCall } from '@/components/calling/CallProvider';
import { createCallLogger } from '@/utils/callLogger';
import { IncomingCallModal } from './IncomingCallModal';
import { CallScreen } from './CallScreen';

const logger = createCallLogger({
  file: 'components/calling/CallManager.tsx',
  component: 'CallManager'
});

interface CallManagerProps {
  socket: Socket | null;
}

export function CallManager({ socket }: CallManagerProps) {
  logger.info('→ CallManager rendering', { hasSocket: !!socket });

  const {
    callState,
    activeCall,
    incomingCall,
    isRinging,
    isConnected,
    isInCall,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    startScreenShare
  } = useCall();

  // ---------------------------------------------------------------------------
  // Debug logging (dev only)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[CallManager] UI State Snapshot', {
        hasIncomingCall: !!incomingCall,
        isRinging,
        isConnected,
        isInCall,
        hasLocalStream: !!localStream,
        hasRemoteStream: !!remoteStream
      });
    }
  }, [
    incomingCall,
    isRinging,
    isConnected,
    isInCall,
    localStream,
    remoteStream
  ]);

  // ---------------------------------------------------------------------------
  // Handlers (stable + intention-revealing)
  // ---------------------------------------------------------------------------
  const handleAcceptCall = useCallback(() => {
    logger.info('→ User accepted incoming call');
    acceptCall();
  }, [acceptCall]);

  const handleRejectCall = useCallback(() => {
    logger.info('→ User rejected incoming call');
    rejectCall();
  }, [rejectCall]);

  const handleEndCall = useCallback(() => {
    logger.info('→ User ended call');
    endCall();
  }, [endCall]);

  const handleToggleMute = useCallback(() => {
    toggleMute();
  }, [toggleMute]);

  const handleToggleVideo = useCallback(() => {
    toggleVideo();
  }, [toggleVideo]);

  const handleToggleScreenShare = useCallback(async () => {
    await startScreenShare();
  }, [startScreenShare]);

  // ---------------------------------------------------------------------------
  // UI visibility logic (SAFE, DERIVED, STABLE)
  // ---------------------------------------------------------------------------
  logger.info("callState.value is this", { callStateValue: callState })
  logger.info("callState.value ", { callStateValue: callState })
  const shouldShowIncomingCallModal =
    !!incomingCall && isRinging && !isConnected;

  const shouldShowCallScreen =
    !!activeCall && isInCall;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* Incoming Call Modal */}
      {shouldShowIncomingCallModal && (
        <IncomingCallModal
          isOpen
          callerName={incomingCall.participants.remote.name}
          callerAvatar={incomingCall.participants.remote.avatar}
          callType={incomingCall.type}
          onAccept={handleAcceptCall}
          onDecline={handleRejectCall}
        />
      )}

      {/* Active Call Screen */}
      {shouldShowCallScreen && (
        <CallScreen
          callerName={activeCall.participants.remote.name}
          callerAvatar={activeCall.participants.remote.avatar}
          callType={activeCall.type}
          callState={isConnected ? 'active' : 'connecting'}
          localStream={localStream}
          remoteStream={remoteStream}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onEndCall={handleEndCall}
        />
      )}
    </>
  );
}

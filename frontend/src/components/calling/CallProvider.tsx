import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { Socket } from 'socket.io-client';
import { useCallOrchestrator } from '@/hooks/useCallOrchestrator';
import { toast } from 'react-toastify';
import { callEventBus } from '@/lib/eventBus';
import { createCallLogger } from '@/utils/callLogger';
import type { CallType, CallParticipant } from '@/types/types';

const logger = createCallLogger({ file: 'components/calling/CallProvider.tsx', component: 'CallProvider' });

// ✅ Use types from types.ts instead of duplicating
interface CallContextType {
  // State - use the standardized types
  callState: any;
  activeCall: any;
  incomingCall: any;
  isRinging: boolean;
  isConnected: boolean;

  // Media streams
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  // Media controls state
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;

  // Operations - use CallType and CallParticipant from types.ts
  initiateCall: (remoteUser: CallParticipant, callType: CallType) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;

  // Media controls
  toggleMute: () => void;
  toggleVideo: () => void;
  startScreenShare: () => Promise<boolean>;

  // Utility
  isInCall: boolean;
  hasIncomingCall: boolean;
}

const CallContext = createContext<CallContextType | null>(null);

interface CallProviderProps {
  socket: Socket | null;
  children: React.ReactNode;
}

// ✅ Sound management now handled by singleton ringingManager
// No component needed - sound manager survives re-renders

export const CallProvider: React.FC<CallProviderProps> = ({
  socket,
  children
}) => {
  logger.info('→ CallProvider rendering (I am in Call Provider Page)', { hasSocket: !!socket, id: socket?.id });

  // Initialize orchestrator
  logger.info("I am calling orchestrator using useCallOrchestrator hook")
  const orchestrator = useCallOrchestrator({
    socket
  });
  logger.info("I called orchestrator using useCallOrchestrator hook and assigned it to orchestrator");

  // Wrap initiateCall to ensure it's always callable
  const initiateCall = useCallback((remoteUser: CallParticipant, callType: CallType) => {
    console.log('[CallProvider] initiateCall called', { remoteUser, callType });

    if (!orchestrator || !orchestrator.initiateCall) {
      console.error('[CallProvider] Orchestrator not ready');
      toast.error('Call system not ready');
      return;
    }
    logger.info("I am calling orchestrator.initiateCall with data", remoteUser);
    orchestrator.initiateCall(remoteUser, callType);
  }, [orchestrator]);

  // Stable references for all operations
  const acceptCall = useCallback(() => {
    orchestrator.acceptCall();
  }, [orchestrator]);

  const rejectCall = useCallback(() => {
    orchestrator.rejectCall();
  }, [orchestrator]);

  const endCall = useCallback(() => {
    orchestrator.endCall();
  }, [orchestrator]);

  const toggleMute = useCallback(() => {
    orchestrator.toggleMute();
  }, [orchestrator]);

  const toggleVideo = useCallback(() => {
    orchestrator.toggleVideo();
  }, [orchestrator]);

  const startScreenShare = useCallback(async () => {
    return await orchestrator.startScreenShare();
  }, [orchestrator]);

  // Memoize context value with stable references
  const contextValue = useMemo<CallContextType>(() => {
    console.log('[CallProvider] Creating context value', {
      hasInitiateCall: !!initiateCall,
      callState: orchestrator.callState,
      isInCall: orchestrator.isInCall
    });

    return {
      callState: orchestrator.callState,
      activeCall: orchestrator.activeCall,
      incomingCall: orchestrator.incomingCall,
      isRinging: orchestrator.isRinging,
      isConnected: orchestrator.isConnected,
      localStream: orchestrator.localStream,
      remoteStream: orchestrator.remoteStream,
      isMuted: orchestrator.isMuted,
      isVideoOff: orchestrator.isVideoOff,
      isScreenSharing: orchestrator.isScreenSharing,
      initiateCall,
      acceptCall,
      rejectCall,
      endCall,
      toggleMute,
      toggleVideo,
      startScreenShare,
      isInCall: orchestrator.isInCall,
      hasIncomingCall: orchestrator.hasIncomingCall
    };
  }, [
    orchestrator.callState,
    orchestrator.activeCall,
    orchestrator.incomingCall,
    orchestrator.isRinging,
    orchestrator.isConnected,
    orchestrator.localStream,
    orchestrator.remoteStream,
    orchestrator.isMuted,
    orchestrator.isVideoOff,
    orchestrator.isScreenSharing,
    orchestrator.isInCall,
    orchestrator.hasIncomingCall,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    startScreenShare
  ]);

  // Global error handling
  useEffect(() => {
    const errorHandler = (data: any) => {
      console.error('[CallProvider] Connection error:', data?.error || 'Unknown error');
    };

    callEventBus.on('webrtc:failed', errorHandler);

    return () => {
      callEventBus.off('webrtc:failed', errorHandler);
    };
  }, []);

  // ✅ Phase 3: Removed problematic cleanup effect
  // Provider should NOT mutate call state during unmount
  // Cleanup is handled by useCallOrchestrator internally

  return (
    <CallContext.Provider value={contextValue}>
      {children}
    </CallContext.Provider>
  );
};

// Custom hook for using call context
export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

// Hook for initiating calls from anywhere
export const useCallInitiation = () => {
  const context = useContext(CallContext);
  // Initiating Audio Call
  const initiateAudioCall = useCallback((remoteUser: CallParticipant) => {
    console.log('[useCallInitiation] initiateAudioCall called', {
      remoteUser,
      hasContext: !!context,
      hasInitiateCall: !!context?.initiateCall
    });

    if (!context) {
      console.error('[useCallInitiation] CallProvider not found');
      toast.error('Call system not initialized');
      return;
    }

    if (!context.initiateCall) {
      console.error('[useCallInitiation] initiateCall function not available');
      toast.error('Call system not ready');
      return;
    }

    console.log('[useCallInitiation] Calling context.initiateCall with audio');
    context.initiateCall(remoteUser, 'audio');
  }, [context]);

  // Initiating Video Call
  const initiateVideoCall = useCallback((remoteUser: CallParticipant) => {
    console.log('[useCallInitiation] initiateVideoCall called', {
      remoteUser,
      hasContext: !!context,
      hasInitiateCall: !!context?.initiateCall
    });

    if (!context) {
      console.error('[useCallInitiation] CallProvider not found');
      toast.error('Call system not initialized');
      return;
    }

    if (!context.initiateCall) {
      console.error('[useCallInitiation] initiateCall function not available');
      toast.error('Call system not ready');
      return;
    }

    console.log('[useCallInitiation] Calling context.initiateCall with video');
    context.initiateCall(remoteUser, 'video');
  }, [context]);

  return {
    initiateAudioCall,
    initiateVideoCall
  };
};
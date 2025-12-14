// src/hooks/useWebRTC.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import SimplePeer from 'simple-peer';
import { Socket } from 'socket.io-client';
import { CallType } from '@/types/types';

interface UseWebRTCProps {
  socket: Socket | null;
  isInitiator: boolean;
  callType: CallType;
  otherUserId: string;
  onConnectionEstablished?: () => void;
  onConnectionFailed?: (reason: string) => void;
  onStreamEnded?: () => void;
}

export function useWebRTC({
  socket,
  isInitiator,
  callType,
  otherUserId,
  onConnectionEstablished,
  onConnectionFailed,
  onStreamEnded
}: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'new' | 'connecting' | 'connected' | 'disconnected' | 'failed'>('new');
  
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const hasInitialized = useRef(false); // 🔥 FIX: Track initialization

  // Initialize call and get user media
  const initializeCall = useCallback(async () => {
    // 🔥 FIX: Prevent duplicate initialization
    if (hasInitialized.current) {
      console.log('[WebRTC] Already initialized, skipping');
      return;
    }

    hasInitialized.current = true;

    try {
      console.log('[WebRTC] Initializing call:', { callType, isInitiator });

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      });

      console.log('[WebRTC] ✅ Got local stream:', stream.id);
      setLocalStream(stream);
      localStreamRef.current = stream;

      // Create peer connection with TURN servers
      const peer = new SimplePeer({
        initiator: isInitiator,
        stream,
        trickle: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            {
              urls: 'turn:openrelay.metered.ca:80',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            },
            {
              urls: 'turn:openrelay.metered.ca:443',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            }
          ]
        }
      });

      peerRef.current = peer;

      // Handle ALL signals (offer, answer, AND ICE candidates)
      peer.on('signal', (data) => {
        console.log('[WebRTC] Signal generated:', data.type || 'candidate');
        
        if (data.type === 'offer') {
          console.log('[WebRTC] Sending offer to:', otherUserId);
          socket?.emit('webrtc-offer', { receiverId: otherUserId, offer: data });
        } else if (data.type === 'answer') {
          console.log('[WebRTC] Sending answer to:', otherUserId);
          socket?.emit('webrtc-answer', { callerId: otherUserId, answer: data });
        } else {
          // This is an ICE candidate
          console.log('[WebRTC] Sending ICE candidate to:', otherUserId);
          socket?.emit('webrtc-ice-candidate', { otherUserId, candidate: data });
        }
      });

      // Handle remote stream
      peer.on('stream', (stream) => {
        console.log('[WebRTC] ✅ Received remote stream:', stream.id);
        setRemoteStream(stream);
      });

      // Handle connection state
      peer.on('connect', () => {
        console.log('[WebRTC] ✅ Peer connection established');
        setIsConnected(true);
        setConnectionState('connected');
        socket?.emit('webrtc-connected', { otherUserId });
        onConnectionEstablished?.();
      });

      // Handle errors
      peer.on('error', (err) => {
        console.error('[WebRTC] ❌ Peer error:', err);
        
        // 🔥 FIX: Don't fail on non-critical errors during setup
        const errorMessage = err.message || 'Connection failed';
        
        // Only fail on critical errors
        if (errorMessage.includes('Cannot') || errorMessage.includes('Failed to execute')) {
          console.error('[WebRTC] Critical error, failing connection');
          setConnectionState('failed');
          socket?.emit('webrtc-failed', { otherUserId, reason: errorMessage });
          onConnectionFailed?.(errorMessage);
        } else {
          console.warn('[WebRTC] Non-critical error, continuing:', errorMessage);
        }
      });

      // Handle close
      peer.on('close', () => {
        console.log('[WebRTC] Peer connection closed');
        setIsConnected(false);
        setConnectionState('disconnected');
        onStreamEnded?.();
      });

      setConnectionState('connecting');

    } catch (error: any) {
      console.error('[WebRTC] ❌ Failed to initialize:', error);
      hasInitialized.current = false; // Reset on failure
      
      const reason = error.message || 'Failed to access media devices';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        console.error('[WebRTC] Camera/Microphone access denied');
        onConnectionFailed?.('Camera/Microphone access denied. Please allow permissions and try again.');
      } else if (error.name === 'NotFoundError') {
        console.error('[WebRTC] No camera/microphone found');
        onConnectionFailed?.('No camera or microphone found. Please check your devices.');
      } else {
        onConnectionFailed?.(reason);
      }
    }
  }, [callType, isInitiator, otherUserId, socket, onConnectionEstablished, onConnectionFailed, onStreamEnded]);

  // Handle offer
  const handleOffer = useCallback((data: { offer: any; senderId: string }) => {
    console.log('[WebRTC] Handling incoming offer from:', data.senderId);
    if (peerRef.current) {
      try {
        peerRef.current.signal(data.offer);
        console.log('[WebRTC] ✅ Offer processed successfully');
      } catch (error) {
        console.error('[WebRTC] ❌ Failed to process offer:', error);
      }
    } else {
      console.error('[WebRTC] ❌ Peer not initialized, cannot handle offer');
    }
  }, []);

  // Handle answer
  const handleAnswer = useCallback((data: { answer: any; senderId: string }) => {
    console.log('[WebRTC] Handling incoming answer from:', data.senderId);
    if (peerRef.current) {
      try {
        peerRef.current.signal(data.answer);
        console.log('[WebRTC] ✅ Answer processed successfully');
      } catch (error) {
        console.error('[WebRTC] ❌ Failed to process answer:', error);
      }
    } else {
      console.error('[WebRTC] ❌ Peer not initialized, cannot handle answer');
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback((data: { candidate: any; senderId: string }) => {
    console.log('[WebRTC] Handling incoming ICE candidate from:', data.senderId);
    if (peerRef.current) {
      try {
        peerRef.current.signal(data.candidate);
        console.log('[WebRTC] ✅ ICE candidate processed successfully');
      } catch (error) {
        console.error('[WebRTC] ❌ Failed to process ICE candidate:', error);
      }
    } else {
      console.error('[WebRTC] ❌ Peer not initialized, cannot handle ICE candidate');
    }
  }, []);

  // Toggle audio mute
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      return !audioTracks[0]?.enabled;
    }
    return false;
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      return !videoTracks[0]?.enabled;
    }
    return false;
  }, []);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      if (peerRef.current && localStreamRef.current) {
        const videoTrack = screenStream.getVideoTracks()[0];
        
        const pc = (peerRef.current as any)._pc as RTCPeerConnection;
        const sender = pc?.getSenders().find(s => s.track?.kind === 'video');

        if (sender) {
          sender.replaceTrack(videoTrack);
        }

        videoTrack.onended = () => {
          stopScreenShare();
        };

        return true;
      }
      return false;
    } catch (error) {
      console.error('[WebRTC] Screen share failed:', error);
      return false;
    }
  }, []);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (localStreamRef.current && peerRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      
      const pc = (peerRef.current as any)._pc as RTCPeerConnection;
      const sender = pc?.getSenders().find(s => s.track?.kind === 'video');

      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('[WebRTC] Cleaning up');
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setConnectionState('disconnected');
    hasInitialized.current = false; // 🔥 Reset initialization flag
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    localStream,
    remoteStream,
    isConnected,
    connectionState,
    initializeCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    cleanup
  };
}
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

  // Initialize call and get user media
  const initializeCall = useCallback(async () => {
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

      console.log('[WebRTC] Got local stream:', stream.id);
      setLocalStream(stream);
      localStreamRef.current = stream;

      // Create peer connection
      const peer = new SimplePeer({
        initiator: isInitiator,
        stream,
        trickle: true, // Enable ICE candidate trickling
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
          ]
        }
      });

      peerRef.current = peer;

      // Handle signaling
      peer.on('signal', (data) => {
        console.log('[WebRTC] Signal generated:', data.type);
        
        if (data.type === 'offer') {
          socket?.emit('webrtc-offer', { receiverId: otherUserId, offer: data });
        } else if (data.type === 'answer') {
          socket?.emit('webrtc-answer', { callerId: otherUserId, answer: data });
        }
      });

      // ICE candidates are handled in the main signal handler above

      // Handle remote stream
      peer.on('stream', (stream) => {
        console.log('[WebRTC] Received remote stream:', stream.id);
        setRemoteStream(stream);
      });

      // Handle connection state
      peer.on('connect', () => {
        console.log('[WebRTC] Peer connection established');
        setIsConnected(true);
        setConnectionState('connected');
        socket?.emit('webrtc-connected', { otherUserId });
        onConnectionEstablished?.();
      });

      // Handle errors
      peer.on('error', (err) => {
        console.error('[WebRTC] Peer error:', err);
        setConnectionState('failed');
        const reason = err.message || 'Connection failed';
        socket?.emit('webrtc-failed', { otherUserId, reason });
        onConnectionFailed?.(reason);
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
      console.error('[WebRTC] Failed to initialize:', error);
      const reason = error.message || 'Failed to access media devices';
      onConnectionFailed?.(reason);
      
      // Alert user if permissions denied
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Camera/Microphone access denied. Please allow permissions and try again.');
      }
    }
  }, [callType, isInitiator, otherUserId, socket, onConnectionEstablished, onConnectionFailed, onStreamEnded]);

  // Handle incoming WebRTC offer
  const handleOffer = useCallback((offer: any) => {
    console.log('[WebRTC] Handling incoming offer');
    if (peerRef.current) {
      peerRef.current.signal(offer);
    }
  }, []);

  // Handle incoming WebRTC answer
  const handleAnswer = useCallback((answer: any) => {
    console.log('[WebRTC] Handling incoming answer');
    if (peerRef.current) {
      peerRef.current.signal(answer);
    }
  }, []);

  // Handle incoming ICE candidate
  const handleIceCandidate = useCallback((candidate: any) => {
    console.log('[WebRTC] Handling incoming ICE candidate');
    if (peerRef.current) {
      peerRef.current.signal(candidate);
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

  // Start screen sharing (for future)
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      if (peerRef.current && localStreamRef.current) {
        const videoTrack = screenStream.getVideoTracks()[0];
        
        // Access the underlying RTCPeerConnection
        const pc = (peerRef.current as any)._pc as RTCPeerConnection;
        const sender = pc?.getSenders().find(s => s.track?.kind === 'video');

        if (sender) {
          sender.replaceTrack(videoTrack);
        }

        // Stop screen share when user stops it
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
      
      // Access the underlying RTCPeerConnection
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
    
    // Stop all local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Destroy peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setConnectionState('disconnected');
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
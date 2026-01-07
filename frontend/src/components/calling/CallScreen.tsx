import { useEffect, useRef, useState } from 'react';
import { Phone, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, Maximize2, Minimize2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createCallLogger } from '@/utils/callLogger';

const logger = createCallLogger({ file: 'components/calling/CallScreen.tsx', component: 'CallScreen' });

interface CallScreenProps {
  callerName: string;
  callerAvatar: string | null;
  callType: 'audio' | 'video';
  callState: 'connecting' | 'active';
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
}

export function CallScreen({
  callerName,
  callerAvatar,
  callType,
  callState,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall
}: CallScreenProps) {
  logger.info('→ CallScreen rendering', { callerName, callType, callState, hasLocalStream: !!localStream, hasRemoteStream: !!remoteStream });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Set up video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Set up audio stream for audio-only calls
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream && callType === 'audio') {
      console.log('[CallScreen] Attaching remote audio stream');
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(err => {
        console.error('[CallScreen] Failed to play remote audio:', err);
      });
    }
  }, [remoteStream, callType]);

  // Call duration timer
  useEffect(() => {
    if (callState !== 'active') {
      setCallDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      setCallDuration(0);
    };
  }, [callState]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get caller initials
  const getCallerInitials = () => {
    return callerName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Remote Video/Audio Stream (Main View) */}
      <div className="relative bg-neutral-900 flex items-center justify-center" style={{ flexGrow: 1, minHeight: 0 }}>
        {callType === 'video' && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            aria-label={`Video feed from ${callerName}`}
          />
        ) : (
          // Audio-only or no stream yet - Show avatar
          <div className="flex flex-col items-center gap-6">
            <Avatar className="h-40 w-40 border-4 border-neutral-700">
              <AvatarImage src={callerAvatar || undefined} />
              <AvatarFallback className="text-5xl bg-gradient-to-br from-blue-500 to-purple-600">
                {getCallerInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">{callerName}</h2>
              <p className="text-neutral-400 text-lg">
                {callState === 'connecting' ? 'Connecting...' : 'On call'}
              </p>
            </div>
          </div>
        )}

        {/* Call Duration & Status */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
          <div className="flex items-center gap-2">
            {callState === 'active' && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-white font-medium">{formatDuration(callDuration)}</span>
              </>
            )}
            {callState === 'connecting' && (
              <span className="text-white">Connecting...</span>
            )}
          </div>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition-colors"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5 text-white" />
          ) : (
            <Maximize2 className="h-5 w-5 text-white" />
          )}
        </button>

        {/* Local Video (Picture-in-Picture) */}
        {callType === 'video' && localStream && !isVideoOff && (
          <div className="absolute bottom-20 right-4 w-48 h-36 bg-neutral-800 rounded-lg overflow-hidden border-2 border-neutral-700 shadow-xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              aria-label="Your video feed"
            />
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="flex-shrink-0 p-6 bg-black/90 backdrop-blur-sm border-t border-neutral-800">
        <div className="flex items-center justify-center gap-4">
          {/* Mute/Unmute */}
          <Button
            onClick={onToggleMute}
            variant={isMuted ? 'destructive' : 'secondary'}
            size="lg"
            className="rounded-full h-14 w-14 p-0"
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>

          {/* Toggle Video (only for video calls) */}
          {callType === 'video' && (
            <Button
              onClick={onToggleVideo}
              variant={isVideoOff ? 'destructive' : 'secondary'}
              size="lg"
              className="rounded-full h-14 w-14 p-0"
              aria-label={isVideoOff ? 'Turn video on' : 'Turn video off'}
            >
              {isVideoOff ? (
                <VideoOff className="h-6 w-6" />
              ) : (
                <Video className="h-6 w-6" />
              )}
            </Button>
          )}

          {/* Screen Share (only for video calls) */}
          {callType === 'video' && (
            <Button
              onClick={onToggleScreenShare}
              variant={isScreenSharing ? 'default' : 'secondary'}
              size="lg"
              className={cn(
                "rounded-full h-14 w-14 p-0",
                isScreenSharing && "bg-blue-600 hover:bg-blue-700"
              )}
              aria-label={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
            >
              {isScreenSharing ? (
                <MonitorOff className="h-6 w-6" />
              ) : (
                <Monitor className="h-6 w-6" />
              )}
            </Button>
          )}

          {/* End Call */}
          <Button
            onClick={onEndCall}
            variant="destructive"
            size="lg"
            className="rounded-full h-14 w-14 p-0 bg-red-600 hover:bg-red-700"
            aria-label="End call"
          >
            <Phone className="h-6 w-6 rotate-[135deg]" />
          </Button>
        </div>
      </div>

      {/* Hidden Audio Element for Remote Audio Stream */}
      {callType === 'audio' && (
        <audio
          ref={remoteAudioRef}
          autoPlay
          playsInline
          className="hidden"
          aria-label={`Audio from ${callerName}`}
        />
      )}

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
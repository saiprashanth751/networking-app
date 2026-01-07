import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCallInitiation } from '@/components/calling/CallProvider';
import { createCallLogger } from '@/utils/callLogger';

const logger = createCallLogger({ file: 'components/messaging/ChatHeader.tsx', component: 'ChatHeader' });

interface ChatHeaderProps {
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    isOnline: boolean;
    lastSeen: string;
    profile?: {
      profilePic?: string | null;
    } | null;
  };
  socket: Socket | null;
  onBack?: () => void;
}

export function ChatHeader({ user, socket, onBack }: ChatHeaderProps) {
  logger.info("Rendering ChatHeader with user and socket: ", { user, id: socket?.id });

  const navigate = useNavigate();
  const { initiateAudioCall, initiateVideoCall } = useCallInitiation();
  logger.info("I got const { initiateAudioCall, initiateVideoCall } = useCallInitiation()");

  // ✅ DEBUG: Log hook availability
  console.log('[ChatHeader] Render', {
    hasInitiateAudioCall: !!initiateAudioCall,
    hasInitiateVideoCall: !!initiateVideoCall,
    userOnline: user.isOnline
  });

  const getUserInitials = () => {
    return `${user.firstName[0]}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const getLastSeenText = () => {
    if (user.isOnline) return 'Online';

    try {
      const lastSeen = new Date(user.lastSeen);
      const now = new Date();
      const diffMs = now.getTime() - lastSeen.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return lastSeen.toLocaleDateString();
    } catch {
      return 'Offline';
    }
  };

  // Create call participant object
  const createCallParticipant = () => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName || ''}`.trim(),
    avatar: user.profile?.profilePic || null,
    isOnline: user.isOnline
  });

  const handleAudioCall = () => {
    const participant = createCallParticipant();
    logger.info('→ handleAudioCall() - User clicked audio call button', {
      userId: participant.id,
      userName: participant.name
    });
    console.log('[ChatHeader] Audio call button clicked', {
      participant,
      hasFunction: !!initiateAudioCall
    });

    if (!initiateAudioCall) {
      console.error('[ChatHeader] initiateAudioCall is not available!');
      return;
    }
    logger.info("I am calling, initiateAudioCall(participant)");
    initiateAudioCall(participant);
  };

  const handleVideoCall = () => {
    const participant = createCallParticipant();
    logger.info('→ handleVideoCall() - User clicked video call button', {
      userId: participant.id,
      userName: participant.name
    });
    console.log('[ChatHeader] Video call button clicked', {
      participant,
      hasFunction: !!initiateVideoCall
    });

    if (!initiateVideoCall) {
      console.error('[ChatHeader] initiateVideoCall is not available!');
      return;
    }
    initiateVideoCall(participant);
  };

  return (
    <div className="border-b border-neutral-800 bg-black/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3 px-4 h-[60px]">
        {/* Back Button - Mobile */}
        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        {/* User Info */}
        <button
          onClick={() => navigate(`/profile/${user.id}`)}
          className="flex items-center gap-3 flex-1 min-w-0 hover:bg-neutral-900 rounded-lg px-2 py-1 transition-colors"
          aria-label={`View ${user.firstName}'s profile`}
        >
          <div className="relative flex-shrink-0">
            <Avatar className="h-10 w-10 border border-neutral-800">
              <AvatarImage src={user.profile?.profilePic || undefined} />
              <AvatarFallback className="bg-muted text-sm">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="font-semibold text-[15px] truncate">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-neutral-500 text-[13px]">
              {getLastSeenText()}
            </div>
          </div>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Audio Call Button */}
          <Button
            onClick={handleAudioCall}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            title={user.isOnline ? "Audio call" : "User is offline"}
            disabled={!user.isOnline}
            aria-label={`Call ${user.firstName}`}
          >
            <Phone className="h-5 w-5" />
          </Button>

          {/* Video Call Button */}
          <Button
            onClick={handleVideoCall}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            title={user.isOnline ? "Video call" : "User is offline"}
            disabled={!user.isOnline}
            aria-label={`Video call ${user.firstName}`}
          >
            <Video className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More options">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                Search in Conversation
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-destructive">
                Delete Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
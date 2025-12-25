// src/components/messaging/MessageBubble.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Image as FileText } from 'lucide-react';
import { Message } from '@/types/types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  otherUser: {
    firstName: string;
    lastName: string | null;
    profile?: {
      profilePic?: string | null;
    } | null;
  };
}

export function MessageBubble({ message, isOwn, otherUser }: MessageBubbleProps) {
  const getUserInitials = () => {
    return `${otherUser.firstName[0]}${otherUser.lastName?.[0] || ''}`.toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderMedia = () => {
    if (!message.mediaUrl) return null;

    if (message.mediaType === 'image') {
      return (
        <div className="mb-2">
          <img
            src={message.mediaUrl}
            alt="Shared image"
            className="max-w-[300px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(message.mediaUrl, '_blank')}
          />
        </div>
      );
    }

    if (message.mediaType === 'document') {
      return (
        <a
          href={message.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors mb-2"
        >
          <FileText className="h-5 w-5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {message.fileName || 'Document'}
            </div>
            {message.fileSize && (
              <div className="text-xs text-neutral-400">
                {(message.fileSize / 1024).toFixed(1)} KB
              </div>
            )}
          </div>
        </a>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        'flex gap-2 items-end',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {!isOwn && (
        <Avatar className="h-7 w-7 border border-neutral-800 flex-shrink-0">
          <AvatarImage src={otherUser.profile?.profilePic || undefined} />
          <AvatarFallback className="text-xs bg-muted">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2',
          isOwn
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-card text-foreground rounded-bl-sm'
        )}
      >
        {renderMedia()}

        {message.content && (
          <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>
        )}

        <div
          className={cn(
            'flex items-center gap-1 mt-1 text-xs',
            isOwn ? 'text-blue-100' : 'text-neutral-500'
          )}
        >
          <span>{formatTime(message.timestamp)}</span>
          {isOwn && (
            <>
              {message.read ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
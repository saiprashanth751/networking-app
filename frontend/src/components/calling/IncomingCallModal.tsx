import { Phone, PhoneOff, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { createCallLogger } from '@/utils/callLogger';

const logger = createCallLogger({ file: 'components/calling/IncomingCallModal.tsx', component: 'IncomingCallModal' });

interface IncomingCallModalProps {
  isOpen: boolean;
  callerName: string;
  callerAvatar: string | null;
  callType: 'audio' | 'video';
  onAccept: () => void;
  onDecline: () => void;
}

export function IncomingCallModal({
  isOpen,
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onDecline
}: IncomingCallModalProps) {
  logger.info('→ IncomingCallModal rendering', { callerName, callType });
  const getCallerInitials = () => {
    return callerName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Prevent backdrop click from declining (only explicit button click)
  const handleBackdropClick = (open: boolean) => {
    if (!open) {
      // Do nothing on backdrop click - force user to use buttons
      // Or optionally call onDecline() if you want backdrop to decline
      return;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleBackdropClick}>
      <DialogContent className="sm:max-w-md bg-black border-neutral-800 pointer-events-auto">
        <DialogTitle className="sr-only">Incoming Call</DialogTitle>
        <DialogDescription className="sr-only">
          {callerName} is calling you
        </DialogDescription>

        <div className="flex flex-col items-center gap-6 py-8">
          {/* Caller Avatar with Pulse Animation */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <div className="h-32 w-32 rounded-full bg-blue-500 opacity-20" />
            </div>
            <Avatar className="h-32 w-32 border-4 border-blue-500 relative z-10">
              <AvatarImage src={callerAvatar || undefined} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600">
                {getCallerInitials()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Caller Name */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">{callerName}</h3>
            <p className="text-neutral-400">
              Incoming {callType} call...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 w-full justify-center">
            <Button
              onClick={onDecline}
              variant="destructive"
              size="lg"
              className="rounded-full h-16 w-16 p-0 hover:bg-red-700"
              aria-label="Decline call"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            <Button
              onClick={onAccept}
              className="rounded-full h-16 w-16 p-0 bg-green-600 hover:bg-green-700"
              size="lg"
              aria-label={`Accept ${callType} call`}
            >
              {callType === 'video' ? (
                <Video className="h-6 w-6" />
              ) : (
                <Phone className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
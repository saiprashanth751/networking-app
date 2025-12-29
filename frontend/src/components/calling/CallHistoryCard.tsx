// Call History Card Component
import { Phone, Video, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CallHistoryItem } from '@/api/callHistory';
import { formatCallDuration, formatCallTime, getCallStatusColor, getCallStatusText } from '@/utils/callHistory';
import { useDeleteCallHistory } from '@/hooks/queries/callHistory';

interface CallHistoryCardProps {
    call: CallHistoryItem;
    onCallBack?: (userId: string, type: 'audio' | 'video') => void;
}

export function CallHistoryCard({ call, onCallBack }: CallHistoryCardProps) {
    const deleteCallMutation = useDeleteCallHistory();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteCallMutation.mutate(call.id);
    };

    const handleCallBack = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCallBack?.(call.otherUser.id, call.type);
    };

    const statusColor = getCallStatusColor(call.status);
    const statusText = getCallStatusText(call.status);
    const durationText = call.duration ? formatCallDuration(call.duration) : statusText;

    return (
        <div className="flex items-center gap-4 p-4 hover:bg-accent/50 rounded-lg transition-colors group">
            {/* Avatar with call direction indicator */}
            <div className="relative">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={call.otherUser.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {call.otherUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                {/* Call direction badge */}
                <div className={`absolute -bottom-1 -right-1 rounded-full p-1 ${call.isIncoming ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                    {call.isIncoming ? (
                        <ArrowDownLeft className="h-3 w-3 text-white" />
                    ) : (
                        <ArrowUpRight className="h-3 w-3 text-white" />
                    )}
                </div>
            </div>

            {/* Call details */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                        {call.otherUser.name}
                    </h3>

                    {/* Call type icon */}
                    {call.type === 'video' ? (
                        <Video className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                </div>

                {/* Status and duration */}
                <div className="flex items-center gap-2 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                        {durationText}
                    </span>
                    <span className="text-muted-foreground text-xs">
                        {formatCallTime(call.startedAt)}
                    </span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Call back button */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCallBack}
                    className="h-8 w-8 p-0"
                    title={`Call back (${call.type})`}
                >
                    {call.type === 'video' ? (
                        <Video className="h-4 w-4" />
                    ) : (
                        <Phone className="h-4 w-4" />
                    )}
                </Button>

                {/* Delete button */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDelete}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Delete from history"
                    disabled={deleteCallMutation.isPending}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

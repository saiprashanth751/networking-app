// Call History Sheet - Shows call history for a specific conversation
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { History, Loader2, PhoneIncoming, PhoneOutgoing, Phone as PhoneIcon } from 'lucide-react';
import { useUserCallHistory } from '@/hooks/queries/callHistory';
import { CallHistoryCard } from '../calling/CallHistoryCard';

interface CallHistorySheetProps {
    userId: string;
    userName: string;
}

export function CallHistorySheet({ userId, userName }: CallHistorySheetProps) {
    const [open, setOpen] = useState(false);
    const { data: calls = [], isLoading } = useUserCallHistory(userId);

    const handleCallBack = () => {
        setOpen(false);
        // The CallHistoryCard's navigation will handle this
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    title={`Call history with ${userName}`}
                    aria-label="View call history"
                >
                    <History className="h-5 w-5" />
                </Button>
            </SheetTrigger>

            <SheetContent className="w-full sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <PhoneIcon className="h-5 w-5" />
                        Call History with {userName}
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Loading call history...</p>
                            </div>
                        </div>
                    ) : calls.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <PhoneIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">No Calls Yet</h3>
                                <p className="text-sm text-muted-foreground">
                                    Your call history with {userName} will appear here
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[calc(100vh-140px)] overflow-y-auto">
                            {calls.map((call) => (
                                <CallHistoryCard
                                    key={call.id}
                                    call={call}
                                    onCallBack={handleCallBack}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats Footer (optional) */}
                {!isLoading && calls.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                        <div className="flex items-center justify-around text-sm">
                            <div className="text-center">
                                <div className="font-semibold text-lg">{calls.length}</div>
                                <div className="text-muted-foreground text-xs">Total Calls</div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-lg">
                                    {calls.filter(c => c.isIncoming).length}
                                </div>
                                <div className="text-muted-foreground text-xs flex items-center gap-1">
                                    <PhoneIncoming className="h-3 w-3" />
                                    Incoming
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-lg">
                                    {calls.filter(c => !c.isIncoming).length}
                                </div>
                                <div className="text-muted-foreground text-xs flex items-center gap-1">
                                    <PhoneOutgoing className="h-3 w-3" />
                                    Outgoing
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

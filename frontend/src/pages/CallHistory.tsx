// Call History Page
import { useState, useMemo } from 'react';
import { Phone, History, PhoneIncoming, PhoneOutgoing, PhoneMissed, Loader2 } from 'lucide-react';
import { CallHistoryCard } from '@/components/calling/CallHistoryCard';
import { useCallHistory } from '@/hooks/queries/callHistory';
import { useNavigate } from 'react-router-dom';
import { CallHistoryItem } from '@/api/callHistory';

type FilterType = 'all' | 'missed' | 'incoming' | 'outgoing';

export default function CallHistory() {
    const navigate = useNavigate();
    const { data: calls = [], isLoading } = useCallHistory();
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    // Filter calls based on active filter
    const filteredCalls = useMemo(() => {
        if (activeFilter === 'all') return calls;

        return calls.filter((call: CallHistoryItem) => {
            switch (activeFilter) {
                case 'missed':
                    return call.status === 'missed' || call.status === 'no-answer';
                case 'incoming':
                    return call.isIncoming;
                case 'outgoing':
                    return !call.isIncoming;
                default:
                    return true;
            }
        });
    }, [calls, activeFilter]);

    // Handle call back - navigate to messages page and trigger call
    const handleCallBack = (userId: string, type: 'audio' | 'video') => {
        navigate(`/messages?userId=${userId}&call=${type}`);
    };

    const filters: { type: FilterType; label: string; icon: typeof History; count?: number }[] = [
        { type: 'all', label: 'All', icon: History },
        {
            type: 'missed',
            label: 'Missed',
            icon: PhoneMissed,
            count: calls.filter((c: CallHistoryItem) => c.status === 'missed' || c.status === 'no-answer').length
        },
        {
            type: 'incoming',
            label: 'Incoming',
            icon: PhoneIncoming,
            count: calls.filter((c: CallHistoryItem) => c.isIncoming).length
        },
        {
            type: 'outgoing',
            label: 'Outgoing',
            icon: PhoneOutgoing,
            count: calls.filter((c: CallHistoryItem) => !c.isIncoming).length
        },
    ];

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="px-6 py-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Call History</h1>
                            <p className="text-sm text-muted-foreground">
                                {calls.length} {calls.length === 1 ? 'call' : 'calls'} total
                            </p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {filters.map((filter) => {
                            const Icon = filter.icon;
                            const isActive = activeFilter === filter.type;

                            return (
                                <button
                                    key={filter.type}
                                    onClick={() => setActiveFilter(filter.type)}
                                    className={`
                    px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap
                    transition-all duration-200 flex items-center gap-2
                    ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }
                  `}
                                >
                                    <Icon className="h-4 w-4" />
                                    {filter.label}
                                    {filter.count !== undefined && filter.count > 0 && (
                                        <span className={`
                      px-1.5 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center
                      ${isActive ? 'bg-primary-foreground/20' : 'bg-background'}
                    `}>
                                            {filter.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Call List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Loading call history...</p>
                        </div>
                    </div>
                ) : filteredCalls.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center max-w-md px-4">
                            {activeFilter === 'all' ? (
                                <>
                                    <Phone className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No Calls Yet</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your call history will appear here once you make or receive calls
                                    </p>
                                </>
                            ) : activeFilter === 'missed' ? (
                                <>
                                    <PhoneMissed className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No Missed Calls</h3>
                                    <p className="text-sm text-muted-foreground">
                                        You haven't missed any calls recently
                                    </p>
                                </>
                            ) : activeFilter === 'incoming' ? (
                                <>
                                    <PhoneIncoming className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No Incoming Calls</h3>
                                    <p className="text-sm text-muted-foreground">
                                        You haven't received any calls yet
                                    </p>
                                </>
                            ) : (
                                <>
                                    <PhoneOutgoing className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No Outgoing Calls</h3>
                                    <p className="text-sm text-muted-foreground">
                                        You haven't made any calls yet
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="px-6 py-4 space-y-2">
                        {filteredCalls.map((call: CallHistoryItem) => (
                            <CallHistoryCard
                                key={call.id}
                                call={call}
                                onCallBack={handleCallBack}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import { useMutualConnections } from '@/hooks/queries/connection';
import { Users, ChevronRight } from 'lucide-react';

interface MutualConnectionsProps {
    userId: string;
    className?: string;
}

export function MutualConnections({ userId, className = '' }: MutualConnectionsProps) {
    const { data, isLoading, error } = useMutualConnections(userId);

    if (isLoading) {
        return (
            <div className={`flex items-center gap-2 text-sm text-neutral-500 ${className}`}>
                <Users className="w-4 h-4 animate-pulse" />
                <span>Loading connections...</span>
            </div>
        );
    }

    if (error || !data || data.count === 0) {
        return null; // Don't show anything if no mutual connections
    }

    const { mutualConnections, count, showing, connectionPath, connectionType } = data;

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Connection Path */}
            {connectionType !== 'none' && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {connectionPath.map((name, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className={index === 0 ? 'font-medium' : ''}>
                                {name}
                            </span>
                            {index < connectionPath.length - 1 && (
                                <ChevronRight className="w-3 h-3" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Mutual Connections Display */}
            <div className="flex items-center gap-3">
                <div className="flex items-center">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        {count} mutual connection{count !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Avatar Stack */}
            {mutualConnections.length > 0 && (
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {mutualConnections.slice(0, 5).map((connection) => (
                            <div
                                key={connection.id}
                                className="relative"
                                title={`${connection.firstName} ${connection.lastName || ''}`}
                            >
                                {connection.profile?.profilePic ? (
                                    <img
                                        src={connection.profile.profilePic}
                                        alt={connection.firstName}
                                        className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                        {connection.firstName[0]}{connection.lastName?.[0] || ''}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Show count of additional connections */}
                    {count > showing && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            +{count - showing} more
                        </span>
                    )}
                </div>
            )}

            {/* Names List (first 3) */}
            {mutualConnections.length > 0 && (
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    Including{' '}
                    {mutualConnections.slice(0, 3).map((conn, idx, arr) => (
                        <span key={conn.id}>
                            <span className="font-medium text-neutral-900 dark:text-white">
                                {conn.firstName} {conn.lastName || ''}
                            </span>
                            {idx < arr.length - 1 && idx < 2 && ', '}
                            {idx === arr.length - 1 && count > arr.length && ` and ${count - arr.length} other${count - arr.length !== 1 ? 's' : ''}`}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

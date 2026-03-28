import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRecommendedUsers } from '@/hooks/queries/recommendations';
import { useToggleFollow } from '@/hooks/mutations/follow';
import { useFollowStatus } from '@/hooks/queries/follow';

/**
 * RecommendedUsers Widget
 * 
 * Displays personalized user recommendations with:
 * - Profile pictures and names
 * - Mutual connections count
 * - Follow/Unfollow button
 * - Loading and empty states
 */
export function RecommendedUsers() {
    const { data, isLoading, error } = useRecommendedUsers(5);

    if (isLoading) {
        return (
            <div className="bg-neutral-900 rounded-2xl mb-4 overflow-hidden">
                <h2 className="font-bold text-xl px-4 py-3">You might like</h2>
                <div className="px-4 py-8 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-neutral-900 rounded-2xl mb-4 overflow-hidden">
                <h2 className="font-bold text-xl px-4 py-3">You might like</h2>
                <div className="px-4 py-8 text-center">
                    <p className="text-neutral-500 text-sm">Failed to load recommendations</p>
                </div>
            </div>
        );
    }

    const users = data?.users || [];

    if (users.length === 0) {
        return (
            <div className="bg-neutral-900 rounded-2xl mb-4 overflow-hidden">
                <h2 className="font-bold text-xl px-4 py-3">You might like</h2>
                <div className="px-4 py-8 text-center">
                    <p className="text-neutral-500 text-sm">No recommendations available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-neutral-900 rounded-2xl mb-4 overflow-hidden">
            <h2 className="font-bold text-xl px-4 py-3">You might like</h2>
            <div>
                {users.map((user) => (
                    <UserRecommendationItem key={user.id} user={user} />
                ))}
            </div>
            <Link
                to="/explore/users"
                className="block w-full px-4 py-3 text-left text-blue-500 hover:bg-neutral-800/50 text-[15px] transition-colors"
            >
                Show more
            </Link>
        </div>
    );
}

/**
 * Individual user recommendation item with follow button
 */
function UserRecommendationItem({ user }: { user: any }) {
    const { data: followStatus, isLoading: statusLoading } = useFollowStatus(user.id);
    const { toggleFollow, isLoading: toggleLoading } = useToggleFollow(
        user.id,
        followStatus?.following || false
    );

    const getUserInitials = () => {
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    };

    const isFollowing = followStatus?.following || false;
    const isProcessing = statusLoading || toggleLoading;

    return (
        <div className="px-4 py-3 hover:bg-neutral-800/50 transition-colors flex items-start gap-3">
            <Link to={`/profile/${user.id}`} className="shrink-0">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profile?.profilePic || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs">
                        {getUserInitials()}
                    </AvatarFallback>
                </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
                <Link to={`/profile/${user.id}`} className="hover:underline">
                    <div className="font-medium text-sm truncate">
                        {user.firstName} {user.lastName}
                    </div>
                </Link>
                {user.profile?.bio && (
                    <div className="text-xs text-neutral-500 truncate mt-0.5">
                        {user.profile.bio}
                    </div>
                )}
                {user.mutualConnectionsCount > 0 && (
                    <div className="text-xs text-neutral-500 mt-1">
                        {user.mutualConnectionsCount} mutual{' '}
                        {user.mutualConnectionsCount === 1 ? 'connection' : 'connections'}
                    </div>
                )}
            </div>

            <Button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFollow();
                }}
                disabled={isProcessing}
                variant={isFollowing ? 'outline' : 'default'}
                size="sm"
                className="h-8 rounded-full px-4 font-bold text-xs shrink-0"
            >
                {isProcessing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : isFollowing ? (
                    'Following'
                ) : (
                    'Follow'
                )}
            </Button>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToggleLike, useToggleBookmark, useRecordShare } from '@/hooks/mutations/engagement';

interface PostActionsProps {
    postId: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    bookmarksCount: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    onCommentClick?: () => void;
}

export function PostActions({
    postId,
    likesCount,
    commentsCount,
    sharesCount,
    bookmarksCount,
    isLiked = false,
    isBookmarked = false,
    onCommentClick,
}: PostActionsProps) {
    const [liked, setLiked] = useState(isLiked);
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [currentLikes, setCurrentLikes] = useState(likesCount);
    const [currentBookmarks, setCurrentBookmarks] = useState(bookmarksCount);

    // Sync state with props when they change
    useEffect(() => {
        setLiked(isLiked);
    }, [isLiked]);

    useEffect(() => {
        setBookmarked(isBookmarked);
    }, [isBookmarked]);

    const toggleLikeMutation = useToggleLike();
    const toggleBookmarkMutation = useToggleBookmark();
    const recordShareMutation = useRecordShare();

    const handleLike = async () => {
        // Optimistic update
        setLiked(!liked);
        setCurrentLikes(liked ? currentLikes - 1 : currentLikes + 1);

        try {
            await toggleLikeMutation.mutateAsync(postId);
        } catch (error) {
            // Revert on error
            setLiked(liked);
            setCurrentLikes(likesCount);
        }
    };

    const handleBookmark = async () => {
        // Optimistic update
        setBookmarked(!bookmarked);
        setCurrentBookmarks(bookmarked ? currentBookmarks - 1 : currentBookmarks + 1);

        try {
            await toggleBookmarkMutation.mutateAsync({ postId });
        } catch (error) {
            // Revert on error
            setBookmarked(bookmarked);
            setCurrentBookmarks(bookmarksCount);
        }
    };

    const handleShare = async (platform?: string) => {
        try {
            await recordShareMutation.mutateAsync({ postId, platform });

            // Copy link to clipboard
            const postUrl = `${window.location.origin}/post/${postId}`;
            await navigator.clipboard.writeText(postUrl);

            // Could show toast here
            console.log('Link copied to clipboard!');
        } catch (error) {
            console.error('Failed to share:', error);
        }
    };

    const handleCommentClick = () => {
        if (onCommentClick) {
            onCommentClick();
        }
    };

    return (
        <div className="flex items-center justify-between text-muted-foreground mt-3">
            {/* Comment */}
            <button
                onClick={handleCommentClick}
                className="flex items-center gap-1 hover:text-blue-500 transition-colors group"
                aria-label="Comment on post"
            >
                <div className="group-hover:bg-blue-500/10 rounded-full p-2 transition-colors">
                    <MessageCircle className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[13px]">{commentsCount || 0}</span>
            </button>

            {/* Repost */}
            <button
                onClick={() => handleShare()}
                disabled={recordShareMutation.isPending}
                className="flex items-center gap-1 hover:text-green-500 transition-colors group"
                aria-label="Share post"
            >
                <div className="group-hover:bg-green-500/10 rounded-full p-2 transition-colors">
                    <Share2 className="h-[18px] w-[18px]" />
                </div>
            </button>

            {/* Like */}
            <button
                onClick={handleLike}
                disabled={toggleLikeMutation.isPending}
                className={cn(
                    "flex items-center gap-1 transition-colors group",
                    liked ? "text-red-500" : "hover:text-red-500"
                )}
                aria-label={liked ? "Unlike post" : "Like post"}
            >
                <div className={cn(
                    "rounded-full p-2 transition-colors",
                    liked ? "bg-red-500/10" : "group-hover:bg-red-500/10"
                )}>
                    <Heart className={cn("h-[18px] w-[18px]", liked && "fill-current")} />
                </div>
                <span className="text-[13px]">{currentLikes}</span>
            </button>

            {/* Bookmark */}
            <button
                onClick={handleBookmark}
                disabled={toggleBookmarkMutation.isPending}
                className={cn(
                    "transition-colors group",
                    bookmarked ? "text-blue-500" : "hover:text-blue-500"
                )}
                aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
            >
                <div className={cn(
                    "rounded-full p-2 transition-colors",
                    bookmarked ? "bg-blue-500/10" : "group-hover:bg-blue-500/10"
                )}>
                    <Bookmark className={cn("h-[18px] w-[18px]", bookmarked && "fill-current")} />
                </div>
            </button>
        </div>
    );
}

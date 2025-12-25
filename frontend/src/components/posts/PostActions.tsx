import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToggleLike, useToggleBookmark, useRecordShare } from '@/hooks/mutations/engagement';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

    return (
        <div className="flex items-center justify-between max-w-md text-neutral-500 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            {/* Comment */}
            <button
                onClick={onCommentClick}
                className="flex items-center gap-2 hover:text-primary transition-colors group"
                aria-label="Comment on post"
            >
                <div className="group-hover:bg-primary/10 rounded-full p-2 transition-colors">
                    <MessageCircle className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[13px] font-medium">{commentsCount}</span>
            </button>

            {/* Like */}
            <button
                onClick={handleLike}
                disabled={toggleLikeMutation.isPending}
                className={cn(
                    'flex items-center gap-2 transition-colors group',
                    liked ? 'text-red-500' : 'hover:text-red-500'
                )}
                aria-label={liked ? 'Unlike post' : 'Like post'}
            >
                <div className="group-hover:bg-red-500/10 rounded-full p-2 transition-colors">
                    <Heart
                        className={cn('h-[18px] w-[18px]', liked && 'fill-current')}
                    />
                </div>
                <span className="text-[13px] font-medium">{currentLikes}</span>
            </button>

            {/* Bookmark */}
            <button
                onClick={handleBookmark}
                disabled={toggleBookmarkMutation.isPending}
                className={cn(
                    'flex items-center gap-2 transition-colors group',
                    bookmarked ? 'text-primary' : 'hover:text-primary'
                )}
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark post'}
            >
                <div className="group-hover:bg-primary/10 rounded-full p-2 transition-colors">
                    <Bookmark
                        className={cn('h-[18px] w-[18px]', bookmarked && 'fill-current')}
                    />
                </div>
                {currentBookmarks > 0 && (
                    <span className="text-[13px] font-medium">{currentBookmarks}</span>
                )}
            </button>

            {/* Share */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="hover:text-primary transition-colors group"
                        aria-label="Share post"
                    >
                        <div className="group-hover:bg-primary/10 rounded-full p-2 transition-colors">
                            <Share2 className="h-[18px] w-[18px]" />
                        </div>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleShare()}>
                        Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare('twitter')}>
                        Share on Twitter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                        Share on LinkedIn
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

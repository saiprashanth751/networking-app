import { useState } from 'react';
import { Heart, Reply, Trash2, MoreHorizontal } from 'lucide-react';
import { Comment } from '@/types/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAddComment, useToggleCommentLike, useDeleteComment } from '@/hooks/mutations/engagement';
import { cn } from '@/lib/utils';

interface CommentItemProps {
    comment: Comment;
    postId: string;
    allComments: Comment[];
    depth?: number;
}

export function CommentItem({ comment, postId, allComments, depth = 0 }: CommentItemProps) {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(comment.likesCount);

    const addCommentMutation = useAddComment();
    const toggleLikeMutation = useToggleCommentLike();
    const deleteCommentMutation = useDeleteComment();

    const profilePic = comment.user.profile?.profilePic ||
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

    const getUserInitials = () => {
        return `${comment.user.firstName?.[0] || ''}${comment.user.lastName?.[0] || ''}`.toUpperCase();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) return `${Math.floor(diffInHours * 60)}m ago`;
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;

        try {
            await addCommentMutation.mutateAsync({
                postId,
                content: replyText.trim(),
                parentId: comment.id,
            });

            setReplyText('');
            setShowReplyInput(false);
        } catch (error) {
            console.error('Failed to reply:', error);
        }
    };

    const handleLike = async () => {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

        try {
            await toggleLikeMutation.mutateAsync(comment.id);
        } catch (error) {
            setIsLiked(isLiked);
            setLikesCount(comment.likesCount);
        }
    };

    const handleDelete = async () => {
        if (confirm('Delete this comment?')) {
            try {
                await deleteCommentMutation.mutateAsync(comment.id);
            } catch (error) {
                console.error('Failed to delete comment:', error);
            }
        }
    };

    // Get replies for this comment
    const replies = allComments.filter((c) => c.parentId === comment.id);
    const repliesCount = replies.length; // Calculate from actual replies
    const maxDepth = 3; // Limit nesting depth

    return (
        <div className={cn('flex gap-3', depth > 0 && 'ml-12')}>
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={profilePic} alt={`${comment.user.firstName} ${comment.user.lastName}`} />
                <AvatarFallback className="bg-muted text-xs">
                    {getUserInitials()}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
                {/* Comment Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                            {comment.user.firstName} {comment.user.lastName}
                        </span>
                        <span className="text-xs text-neutral-500">
                            {formatDate(comment.createdAt)}
                        </span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full p-1"
                                aria-label="Comment options"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem>Report</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Comment Content */}
                <p className="text-sm leading-relaxed whitespace-pre-line">
                    {comment.content}
                </p>

                {/* Comment Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLike}
                        className={cn(
                            'flex items-center gap-1 text-xs transition-colors',
                            isLiked ? 'text-red-500' : 'text-neutral-500 hover:text-red-500'
                        )}
                        aria-label={isLiked ? 'Unlike comment' : 'Like comment'}
                    >
                        <Heart className={cn('h-3.5 w-3.5', isLiked && 'fill-current')} />
                        {likesCount > 0 && <span>{likesCount}</span>}
                    </button>

                    {depth < maxDepth && (
                        <button
                            onClick={() => setShowReplyInput(!showReplyInput)}
                            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-primary transition-colors"
                            aria-label="Reply to comment"
                        >
                            <Reply className="h-3.5 w-3.5" />
                            Reply
                        </button>
                    )}

                    {repliesCount > 0 && (
                        <span className="text-xs text-neutral-500">
                            {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
                        </span>
                    )}
                </div>

                {/* Reply Input */}
                {showReplyInput && (
                    <div className="flex gap-2 pt-2">
                        <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="min-h-[60px] resize-none text-sm"
                            disabled={addCommentMutation.isPending}
                        />
                        <div className="flex flex-col gap-1">
                            <Button
                                size="sm"
                                onClick={handleReply}
                                disabled={!replyText.trim() || addCommentMutation.isPending}
                            >
                                Reply
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setShowReplyInput(false);
                                    setReplyText('');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Nested Replies */}
                {replies.length > 0 && depth < maxDepth && (
                    <div className="space-y-3 pt-2">
                        {replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                postId={postId}
                                allComments={allComments}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

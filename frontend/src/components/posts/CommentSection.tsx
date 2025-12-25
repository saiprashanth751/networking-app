import { useState } from 'react';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAddComment } from '@/hooks/mutations/engagement';
import { usePostComments } from '@/hooks/queries/engagement';
import { useCurrentUser } from '@/hooks/queries/user';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
    postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
    const [newComment, setNewComment] = useState('');
    const { data: commentsData, isLoading } = usePostComments(postId);
    const { data: currentUserData } = useCurrentUser();
    const addCommentMutation = useAddComment();

    const comments = commentsData?.comments || [];
    const currentUser = currentUserData?.user as any; // Has profile from API

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newComment.trim()) return;

        try {
            await addCommentMutation.mutateAsync({
                postId,
                content: newComment.trim(),
            });

            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    return (
        <div className="space-y-4">
            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={currentUser?.profile?.profilePic} alt="Your avatar" />
                    <AvatarFallback className="bg-muted text-xs">
                        {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="min-h-[80px] resize-none"
                        disabled={addCommentMutation.isPending}
                        aria-label="Write a comment"
                    />
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!newComment.trim() || addCommentMutation.isPending}
                        >
                            {addCommentMutation.isPending ? (
                                'Posting...'
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Comment
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-8 text-neutral-500">
                        Loading comments...
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                        No comments yet. Be the first to comment!
                    </div>
                ) : (
                    comments
                        .filter((comment: any) => !comment.parentId)
                        .map((comment: any) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                postId={postId}
                                allComments={comments}
                            />
                        ))
                )}
            </div>
        </div>
    );
}

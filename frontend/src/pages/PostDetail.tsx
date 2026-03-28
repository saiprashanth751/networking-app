import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PostCard } from '@/components/posts/PostCard';
import { usePost } from '@/hooks/queries/post';
import { useInfiniteComments } from '@/hooks/queries/engagement';
import { useInView } from 'react-intersection-observer';
import { CommentItem } from '@/components/posts/CommentItem';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAddComment } from '@/hooks/mutations/engagement';
import { useCurrentUser } from '@/hooks/queries/user';
import { Send } from 'lucide-react';

export default function PostDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [newComment, setNewComment] = useState('');

    // Fetch post
    const { data: postData, isLoading: postLoading, isError: postError } = usePost(id!);

    // Fetch comments with infinite scroll
    const {
        data: commentsData,
        isLoading: commentsLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteComments(id!);

    const { data: currentUserData } = useCurrentUser();
    const addCommentMutation = useAddComment();

    // Infinite scroll trigger
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: '100px',
    });

    // Auto-load more comments when trigger is in view
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const post = postData?.post;
    const comments = commentsData?.pages?.flatMap((page: any) => page.comments) || [];
    const currentUser = currentUserData?.user as any;

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !id) return;

        try {
            await addCommentMutation.mutateAsync({
                postId: id,
                content: newComment.trim(),
            });
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    // Loading state
    if (postLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // Error state
    if (postError || !post) {
        return (
            <div className="px-4 py-16 text-center">
                <div className="text-6xl mb-4">😕</div>
                <h2 className="text-2xl font-bold mb-2">Post not found</h2>
                <p className="text-neutral-500 mb-6">
                    This post may have been deleted or the link is incorrect.
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full font-bold transition-colors"
                >
                    Back to Feed
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Header with back button */}
            <div className="sticky top-0 z-10 backdrop-blur-md bg-black/80 border-b border-neutral-800">
                <div className="px-4 py-3 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold">Post</h1>
                </div>
            </div>

            {/* Post content */}
            <PostCard
                post={post}
                showActions={true}
                showFollowButton={true}
                hideComments={true}
            />

            {/* Comments section */}
            <div className="border-t border-neutral-800">
                {/* Comments header */}
                <div className="px-4 py-3 border-b border-neutral-800">
                    <h2 className="font-bold text-lg">
                        Comments {post.commentsCount > 0 && `(${post.commentsCount})`}
                    </h2>
                </div>

                {/* Add comment form */}
                <form onSubmit={handleSubmitComment} className="px-4 py-3 border-b border-neutral-800">
                    <div className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={currentUser?.profile?.profilePic} alt="Your avatar" />
                            <AvatarFallback className="bg-muted text-xs">
                                {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex flex-col gap-2">
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="min-h-[80px] resize-none bg-neutral-900 border-neutral-800"
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={!newComment.trim() || addCommentMutation.isPending}
                                    size="sm"
                                    className="gap-2"
                                >
                                    {addCommentMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Post
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Comments list */}
                <div>
                    {commentsLoading ? (
                        // Initial loading
                        <div className="px-4 py-8 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-neutral-500" />
                        </div>
                    ) : comments.length === 0 ? (
                        // Empty state
                        <div className="px-4 py-16 text-center">
                            <div className="text-4xl mb-4">💬</div>
                            <h3 className="font-bold mb-2">No comments yet</h3>
                            <p className="text-neutral-500 text-sm">
                                Be the first to share your thoughts!
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Render comments */}
                            {comments.map((comment: any) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    postId={id!}
                                    postOwnerId={post.userId}
                                    allComments={comments}
                                />
                            ))}

                            {/* Infinite scroll trigger */}
                            {hasNextPage && (
                                <div
                                    ref={loadMoreRef}
                                    className="px-4 py-6 flex justify-center border-t border-neutral-800"
                                >
                                    {isFetchingNextPage ? (
                                        <div className="flex items-center gap-2 text-neutral-500">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span className="text-sm">Loading more comments...</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => fetchNextPage()}
                                            className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-sm font-medium transition-colors"
                                        >
                                            Load more comments
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* End of comments */}
                            {!hasNextPage && comments.length > 0 && (
                                <div className="px-4 py-6 text-center text-neutral-500 text-sm border-t border-neutral-800">
                                    End of comments · {comments.length} total
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

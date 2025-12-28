import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Loader2, Pencil, Trash2, Flag, ExternalLink } from 'lucide-react';
import { Post } from '@/types/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PostContent } from './PostContent';
import { CommentSection } from './CommentSection';
import { useState } from 'react';
import { EditPostModal } from './EditPostModal';
import { ReportPostDialog } from './ReportPostDialog';
import { PostActions } from './PostActions';
import { PostMediaCarousel } from './PostMediaCarousel';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/queries/user';
import { useFollowStatus } from '@/hooks/queries/follow';
import { useToggleFollow } from '@/hooks/mutations/follow';

interface PostCardProps {
    post: Post;
    showActions?: boolean;
    showFollowButton?: boolean;
    onCommentClick?: () => void;
    hideComments?: boolean; // Hide comment section (for post detail page)
}

export function PostCard({
    post,
    showActions = true,
    showFollowButton = false,
    onCommentClick,
    hideComments = false
}: PostCardProps) {
    const navigate = useNavigate();

    // Get current logged-in user
    const { data: currentUserData } = useCurrentUser();
    const loggedInUserId = currentUserData?.user?.id;

    // Determine if this is the user's own post
    const isOwnPost = loggedInUserId === post.userId;
    const profileLink = isOwnPost ? '/userprofile' : `/profile/${post.userId}`;

    // Get follow status for this post's author
    const { data: followStatus } = useFollowStatus(
        post.userId,
        {
            enabled: showFollowButton && !!loggedInUserId && !isOwnPost
        }
    );

    // Toggle follow mutation
    const { toggleFollow, isLoading: isToggling } = useToggleFollow(
        post.userId,
        followStatus?.following || false
    );

    // Determine if we should show the follow button
    const shouldShowFollowButton = showFollowButton &&
        loggedInUserId &&
        !isOwnPost;

    const profilePic = post.user.profile?.profilePic ||
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

    const getUserInitials = () => {
        return `${post.user.firstName?.[0] || ''}${post.user.lastName?.[0] || ''}`.toUpperCase();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) return `${Math.floor(diffInHours * 60)}m`;
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // STATE - Comment section, edit modal, report dialog
    const [showComments, setShowComments] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState<number | null>(null);

    const handleCommentClick = () => {
        setShowComments(!showComments);
        if (onCommentClick) {
            onCommentClick();
        }
    };

    // Production-grade image error handler
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
        console.error(`Failed to load image ${index + 1}:`, (e.target as HTMLImageElement).src);
        (e.target as HTMLImageElement).src = '/placeholder-image.png';
    };

    return (
        <article className="mx-2 my-2 px-6 py-5 rounded-xl hover:bg-neutral-900/30 transition-all duration-150 border border-neutral-800/50">
            <div className="flex gap-4">
                {/* Avatar */}
                <Link to={profileLink} className="shrink-0">
                    <Avatar className="h-11 w-11 hover:opacity-80 transition-opacity">
                        <AvatarImage
                            src={profilePic}
                            alt={`${post.user.firstName} ${post.user.lastName}`}
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {getUserInitials()}
                        </AvatarFallback>
                    </Avatar>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <Link
                                to={profileLink}
                                className="hover:underline font-semibold text-[15px] truncate"
                            >
                                {post.user.firstName} {post.user.lastName}
                            </Link>
                            <span className="text-muted-foreground text-sm truncate">
                                @{post.user.firstName?.toLowerCase()}
                            </span>
                            <span className="text-muted-foreground text-sm">·</span>
                            <span className="text-muted-foreground text-sm">
                                {formatDate(post.publishedAt || post.createdAt)}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            {/* Follow Button */}
                            {shouldShowFollowButton && (
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleFollow();
                                    }}
                                    disabled={isToggling}
                                    variant={followStatus?.following ? "outline" : "default"}
                                    size="sm"
                                    className="h-7 text-xs rounded-full px-3 font-bold"
                                >
                                    {isToggling ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        followStatus?.following ? "Following" : "Follow"
                                    )}
                                </Button>
                            )}

                            {/* More Options */}
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label="Post options"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {isOwnPost && (
                                        <>
                                            <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit post
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    {!isOwnPost && (
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => setIsReportDialogOpen(true)}
                                        >
                                            <Flag className="h-4 w-4 mr-2" />
                                            Report post
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Title */}
                    {post.title && (
                        <h3
                            className="font-bold text-lg mb-2 leading-tight cursor-pointer hover:underline"
                            onClick={() => navigate(`/post/${post.id}`)}
                        >
                            {post.title}
                        </h3>
                    )}

                    {/* Content - Clickable to go to post detail */}
                    <div
                        className="cursor-pointer"
                        onClick={() => navigate(`/post/${post.id}`)}
                    >
                        <PostContent content={post.content} className="mb-4" />
                    </div>

                    {/* Categories */}
                    {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.categories.map(({ category }) => (
                                <Badge
                                    key={category.id}
                                    variant="secondary"
                                    className="font-medium text-xs cursor-pointer transition-all duration-150 hover:scale-105 rounded-full"
                                    style={{
                                        backgroundColor: `${category.color}15`,
                                        color: category.color,
                                        borderColor: `${category.color}30`,
                                    }}
                                >
                                    <span className="mr-1">{category.icon}</span>
                                    {category.name}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map(({ tag }) => (
                                <Link
                                    key={tag.id}
                                    to={`/posts/tag/${tag.slug}`}
                                    className="text-primary hover:underline text-sm font-medium"
                                >
                                    #{tag.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Links - NEW FEATURE */}
                    {post.links && post.links.length > 0 && (
                        <div className="space-y-2 mb-3">
                            {post.links.map((link, index) => (
                                <a
                                    key={index}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors text-[13px] group"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                                    <span className="truncate flex-1 text-primary">
                                        {link}
                                    </span>
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Media Gallery - OPTIMIZED */}
                    {post.media && post.media.length > 0 && (
                        <div className={cn(
                            'grid gap-1 mb-3 rounded-xl overflow-hidden border border-border',
                            post.media.length === 1 && 'grid-cols-1',
                            post.media.length === 2 && 'grid-cols-2',
                            post.media.length === 3 && 'grid-cols-3',
                            post.media.length >= 4 && 'grid-cols-2'
                        )}>
                            {post.media.slice(0, 4).map((item, index) => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        'relative bg-muted group/image cursor-pointer',
                                        post.media.length === 1 ? 'aspect-video' : 'aspect-square'
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCarouselIndex(index);
                                    }}
                                >
                                    <OptimizedImage
                                        src={item.url}
                                        alt={`Post image ${index + 1} of ${post.media.length}`}
                                        width={post.media.length === 1 ? 800 : 400}
                                        className="w-full h-full"
                                        objectFit="cover"
                                        onError={(e) => handleImageError(e, index)}
                                    />
                                    {/* Show +N overlay for 4+ images */}
                                    {index === 3 && post.media.length > 4 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                                            <span className="text-white text-xl font-bold">
                                                +{post.media.length - 4}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Engagement Actions */}
                    {showActions && (
                        <PostActions
                            postId={post.id}
                            likesCount={post.likesCount}
                            commentsCount={post.commentsCount}
                            sharesCount={post.sharesCount}
                            bookmarksCount={post.bookmarksCount}
                            isLiked={post.isLiked}
                            isBookmarked={post.isBookmarked}
                            onCommentClick={handleCommentClick}
                        />
                    )}
                    {showComments && !hideComments && (
                        <div className="mt-4 pt-4 border-t border-border">
                            <CommentSection postId={post.id} postOwnerId={post.userId} />
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Post Modal */}
            <EditPostModal
                post={post}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            {/* Report Post Dialog */}
            <ReportPostDialog
                postId={post.id}
                isOpen={isReportDialogOpen}
                onClose={() => setIsReportDialogOpen(false)}
            />

            {/* Media Carousel */}
            {carouselIndex !== null && (
                <PostMediaCarousel
                    media={post.media}
                    initialIndex={carouselIndex}
                    isOpen={carouselIndex !== null}
                    onClose={() => setCarouselIndex(null)}
                />
            )}
        </article>
    );
}

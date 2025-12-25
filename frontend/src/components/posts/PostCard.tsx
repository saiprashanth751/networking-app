import { Link } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { Post } from '@/types/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface PostCardProps {
    post: Post;
    showActions?: boolean;
    onCommentClick?: () => void;
}

export function PostCard({ post, showActions = true, onCommentClick }: PostCardProps) {
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

    return (
        <article className="px-4 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex gap-3">
                {/* Avatar */}
                <Link to={`/profile/${post.userId}`} className="shrink-0">
                    <Avatar className="h-10 w-10 hover:opacity-80 transition-opacity">
                        <AvatarImage src={profilePic} alt={`${post.user.firstName} ${post.user.lastName}`} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {getUserInitials()}
                        </AvatarFallback>
                    </Avatar>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                            <Link
                                to={`/profile/${post.userId}`}
                                className="hover:underline font-bold text-[15px] truncate"
                            >
                                {post.user.firstName} {post.user.lastName}
                            </Link>
                            {post.user.profile?.department && (
                                <>
                                    <span className="text-neutral-500">·</span>
                                    <span className="text-neutral-500 text-[13px] truncate">
                                        {post.user.profile.department}
                                    </span>
                                </>
                            )}
                            <span className="text-neutral-500">·</span>
                            <span className="text-neutral-500 text-[13px]">
                                {formatDate(post.publishedAt || post.createdAt)}
                            </span>
                        </div>

                        {/* More Options */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="hover:bg-primary/10 hover:text-primary rounded-full p-1.5 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label="Post options"
                                >
                                    <MoreHorizontal className="h-[18px] w-[18px]" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Report post</DropdownMenuItem>
                                <DropdownMenuItem>Hide post</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Title */}
                    {post.title && (
                        <h3 className="font-bold text-lg mb-2 leading-tight">
                            {post.title}
                        </h3>
                    )}

                    {/* Content */}
                    <PostContent content={post.content} className="mb-3" />

                    {/* Categories */}
                    {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {post.categories.map(({ category }) => (
                                <Badge
                                    key={category.id}
                                    variant="secondary"
                                    className="font-medium text-xs cursor-pointer transition-all hover:scale-105"
                                    style={{
                                        backgroundColor: `${category.color}20`,
                                        color: category.color,
                                        borderColor: `${category.color}40`,
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
                        <div className="flex flex-wrap gap-2 mb-3">
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

                    {/* Media Gallery */}
                    {post.media && post.media.length > 0 && (
                        <div className={cn(
                            'grid gap-1 mb-3 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800',
                            post.media.length === 1 && 'grid-cols-1',
                            post.media.length === 2 && 'grid-cols-2',
                            post.media.length >= 3 && 'grid-cols-2'
                        )}>
                            {post.media.slice(0, 4).map((item, index) => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        'relative bg-muted group/image',
                                        post.media.length === 1 ? 'aspect-video' : 'aspect-square',
                                        post.media.length === 3 && index === 0 && 'col-span-2'
                                    )}
                                >
                                    <img
                                        src={item.url}
                                        alt={`Post image ${index + 1} of ${post.media.length}`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                                    />
                                    {/* Show +N overlay for 4+ images */}
                                    {index === 3 && post.media.length > 4 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
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
                            onCommentClick={onCommentClick}
                        />
                    )}
                </div>
            </div>
        </article>
    );
}

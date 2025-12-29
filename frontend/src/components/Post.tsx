import { Link } from "react-router-dom";
import { PostLabel } from '@/types/types';
import { useCurrentUser } from "@/hooks/queries/user";
import { useFollowStatus } from "@/hooks/queries/follow";
import { useToggleFollow } from "@/hooks/mutations/follow";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostProps {
    post: {
        id: string;
        title: string;
        description: string;
        labels: PostLabel[];
        links: string[];
        photos: string[];
        createdAt: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            department?: string;
            profile?: {
                profilePic?: string;
            };
        };
    };
    showFollowButton?: boolean;
}

export function Post({ post, showFollowButton = false }: PostProps) {
    const profileUrl = post?.user?.profile?.profilePic ||
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    // Get current logged-in user
    const { data: currentUserData } = useCurrentUser();
    const loggedInUserId = currentUserData?.user?.id;

    const isOwnPost = loggedInUserId === post.user.id;
    const profileLink = isOwnPost ? '/userprofile' : `/profile/${post.user.id}`;

    // Get follow status for this post's author
    const { data: followStatus } = useFollowStatus(
        post.user.id,
        {
            enabled: showFollowButton && !!loggedInUserId && post.user.id !== loggedInUserId
        }
    );

    // Toggle follow mutation
    const { toggleFollow, isLoading: isToggling } = useToggleFollow(
        post.user.id,
        followStatus?.following || false
    );

    // Determine if we should show the follow button
    const shouldShowFollowButton = showFollowButton &&
        loggedInUserId &&
        post.user.id &&
        post.user.id !== loggedInUserId;

    // Get user initials for avatar fallback
    const getUserInitials = () => {
        return `${post?.user?.firstName?.[0] || ''}${post?.user?.lastName?.[0] || ''}`.toUpperCase();
    };

    // Format date nicely
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return `${Math.floor(diffInHours * 60)}m`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h`;
        } else if (diffInHours < 168) {
            return `${Math.floor(diffInHours / 24)}d`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    // Determine photo grid layout based on count
    const getPhotoGridClass = (count: number) => {
        if (count === 1) return "grid-cols-1";
        if (count === 2) return "grid-cols-2";
        if (count === 3) return "grid-cols-3";
        return "grid-cols-2"; // 4+ photos in 2x2 grid
    };

    return (
        <div className="px-4 py-3 hover:bg-neutral-900/30 cursor-pointer transition-colors border-b border-neutral-800 last:border-b-0">
            <div className="flex gap-3">
                {/* Avatar */}
                <Link to={profileLink} className="shrink-0">
                    <Avatar className="h-10 w-10 hover:opacity-80 transition-opacity">
                        <AvatarImage 
                            src={profileUrl} 
                            alt={`${post?.user?.firstName} ${post?.user?.lastName}`}
                        />
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
                                to={profileLink} 
                                className="hover:underline font-bold text-[15px] truncate"
                            >
                                {post?.user?.firstName} {post?.user?.lastName}
                            </Link>
                            <span className="text-neutral-500 text-[15px] truncate">
                                @{post?.user?.firstName?.toLowerCase()}
                            </span>
                            <span className="text-neutral-500">·</span>
                            <span className="text-neutral-500 text-[15px]">
                                {formatDate(post?.createdAt)}
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
                                    className="h-7 text-xs rounded-full px-3"
                                >
                                    {isToggling ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        followStatus?.following ? "Following" : "Follow"
                                    )}
                                </Button>
                            )}
                            
                            {/* More Options */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button 
                                        className="hover:bg-blue-500/10 hover:text-blue-500 rounded-full p-1.5 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreHorizontal className="h-[18px] w-[18px]" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Save post</DropdownMenuItem>
                                    <DropdownMenuItem>Report post</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Department */}
                    {post?.user?.department && (
                        <div className="text-neutral-500 text-[13px] mb-1">
                            {post?.user?.department}
                        </div>
                    )}

                    {/* Title */}
                    {post?.title && (
                        <h3 className="font-bold text-[15px] mb-1 leading-tight">
                            {post.title}
                        </h3>
                    )}

                    {/* Description */}
                    <p className="text-[15px] leading-5 whitespace-pre-line mb-2">
                        {post?.description}
                    </p>

                    {/* Labels */}
                    {post?.labels?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {post.labels.map((label: string, index: number) => (
                                <Badge 
                                    key={index} 
                                    variant="secondary"
                                    className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20 font-medium text-xs"
                                >
                                    {label}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Photos */}
                    {post?.photos?.length > 0 && (
                        <div className={`grid gap-1 mb-2 rounded-2xl overflow-hidden border border-neutral-800 ${getPhotoGridClass(post.photos.length)}`}>
                            {post.photos.slice(0, 4).map((photo: string, index: number) => (
                                <div 
                                    key={index} 
                                    className="relative bg-muted aspect-square group/image"
                                >
                                    <img
                                        src={photo}
                                        alt={`Post photo ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                                        onError={(e) => {
                                            console.error(`Failed to load image: ${photo}`, e);
                                            (e.target as HTMLImageElement).src = "/default-placeholder.png";
                                        }}
                                    />
                                    {/* Show +N overlay for 4+ photos on last image */}
                                    {index === 3 && post.photos.length > 4 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="text-white text-xl font-bold">
                                                +{post.photos.length - 4}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Links */}
                    {post?.links?.length > 0 && (
                        <div className="space-y-1 mb-2">
                            {post.links.map((link: string, index: number) => (
                                <a
                                    key={index}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 rounded-lg border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 transition-colors text-[13px]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-neutral-500 shrink-0" fill="currentColor">
                                        <path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"/>
                                    </svg>
                                    <span className="truncate flex-1 text-blue-500">
                                        {link}
                                    </span>
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Engagement Actions */}
                    <div className="flex items-center justify-between max-w-md text-neutral-500 mt-2">
                        <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                            <div className="group-hover:bg-blue-500/10 rounded-full p-2 transition-colors">
                                <MessageCircle className="h-[18px] w-[18px]" />
                            </div>
                            <span className="text-[13px]">12</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
                            <div className="group-hover:bg-green-500/10 rounded-full p-2 transition-colors">
                                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current">
                                    <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
                                </svg>
                            </div>
                            <span className="text-[13px]">5</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-red-500 transition-colors group">
                            <div className="group-hover:bg-red-500/10 rounded-full p-2 transition-colors">
                                <Heart className="h-[18px] w-[18px]" />
                            </div>
                            <span className="text-[13px]">24</span>
                        </button>
                        <button className="hover:text-blue-500 transition-colors group">
                            <div className="group-hover:bg-blue-500/10 rounded-full p-2 transition-colors">
                                <Share2 className="h-[18px] w-[18px]" />
                            </div>
                        </button>
                        <button className="hover:text-blue-500 transition-colors group">
                            <div className="group-hover:bg-blue-500/10 rounded-full p-2 transition-colors">
                                <Bookmark className="h-[18px] w-[18px]" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
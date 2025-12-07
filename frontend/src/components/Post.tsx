import { Link } from "react-router-dom";
import { PostLabel } from '@/types/types';
import { useCurrentUser } from "@/hooks/queries/user";
import { useFollowStatus } from "@/hooks/queries/follow";
import { useToggleFollow } from "@/hooks/mutations/follow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, ExternalLink, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Loader2 } from "lucide-react";
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
            return `${Math.floor(diffInHours * 60)}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 168) {
            return `${Math.floor(diffInHours / 24)}d ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
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
        <Card className="group hover:shadow-lg transition-all duration-200 border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Link to={`/profile/${post?.user?.id}`}>
                            <Avatar className="h-11 w-11 border-2 border-border hover:border-primary transition-colors">
                                <AvatarImage 
                                    src={profileUrl} 
                                    alt={`${post?.user?.firstName} ${post?.user?.lastName}`}
                                />
                                <AvatarFallback className="bg-muted text-muted-foreground">
                                    {getUserInitials()}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <Link 
                                to={`/profile/${post?.user?.id}`} 
                                className="hover:underline"
                            >
                                <h4 className="font-semibold text-foreground text-base leading-tight">
                                    {post?.user?.firstName} {post?.user?.lastName}
                                </h4>
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                {post?.user?.department && (
                                    <>
                                        <span className="truncate">{post?.user?.department}</span>
                                        <span>•</span>
                                    </>
                                )}
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(post?.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        {/* Follow Button */}
                        {shouldShowFollowButton && (
                            <Button
                                onClick={toggleFollow}
                                disabled={isToggling}
                                variant={followStatus?.following ? "outline" : "default"}
                                size="sm"
                                className="h-8"
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
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Save post</DropdownMenuItem>
                                <DropdownMenuItem>Report post</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pb-3">
                {/* Title */}
                <h3 className="text-xl font-bold text-foreground leading-tight">
                    {post?.title}
                </h3>

                {/* Description */}
                <p className="text-foreground/90 whitespace-pre-line leading-relaxed text-[15px]">
                    {post?.description}
                </p>

                {/* Labels */}
                {post?.labels?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {post.labels.map((label: string, index: number) => (
                            <Badge 
                                key={index} 
                                variant="secondary"
                                className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-medium"
                            >
                                {label}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Photos */}
                {post?.photos?.length > 0 && (
                    <div className={`grid gap-2 ${getPhotoGridClass(post.photos.length)}`}>
                        {post.photos.slice(0, 4).map((photo: string, index: number) => (
                            <div 
                                key={index} 
                                className="relative rounded-lg overflow-hidden border border-border bg-muted aspect-square group/image"
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
                                        <span className="text-white text-2xl font-bold">
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
                    <div className="space-y-2">
                        {post.links.map((link: string, index: number) => (
                            <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors group/link"
                            >
                                <div className="flex-shrink-0">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover/link:text-primary transition-colors" />
                                </div>
                                <span className="text-sm text-foreground truncate flex-1">
                                    {link}
                                </span>
                            </a>
                        ))}
                    </div>
                )}
            </CardContent>

            <Separator />

            <CardFooter className="pt-2 pb-2">
                <div className="flex items-center justify-between w-full">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
                    >
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">Like</span>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">Comment</span>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
                    >
                        <Share2 className="h-4 w-4" />
                        <span className="text-sm">Share</span>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
                    >
                        <Bookmark className="h-4 w-4" />
                        <span className="text-sm">Save</span>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
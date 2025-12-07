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
import { Calendar, ExternalLink, Heart, MessageCircle, Share2 } from "lucide-react";

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

    // ✅ Get current logged-in user
    const { data: currentUserData } = useCurrentUser();
    const loggedInUserId = currentUserData?.user?.id;

    // ✅ Get follow status for this post's author
    const { data: followStatus } = useFollowStatus(
        post.user.id,
        {
            enabled: showFollowButton && !!loggedInUserId && post.user.id !== loggedInUserId
        }
    );

    // ✅ Toggle follow mutation
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

    return (
        <Card className="bg-gray-800 border-gray-700 text-white mb-6">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 border-2 border-gray-700">
                            <AvatarImage 
                                src={profileUrl} 
                                alt={`${post?.user?.firstName} ${post?.user?.lastName}`}
                            />
                            <AvatarFallback className="bg-gray-700 text-gray-300">
                                {getUserInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <Link to={`/profile/${post?.user?.id}`} className="hover:opacity-80 transition-opacity">
                                <p className="font-semibold text-lg">
                                    {post?.user?.firstName} {post?.user?.lastName}
                                </p>
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                {post?.user?.department && (
                                    <>
                                        <span>{post?.user?.department}</span>
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
                    
                    {/* Follow Button */}
                    {shouldShowFollowButton && (
                        <Button
                            onClick={toggleFollow}
                            disabled={isToggling}
                            variant={followStatus?.following ? "destructive" : "default"}
                            size="sm"
                            className="ml-4"
                        >
                            {isToggling ? "..." : (followStatus?.following ? "Unfollow" : "Follow")}
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Labels */}
                {post?.labels?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {post.labels.map((label: string, index: number) => (
                            <Badge 
                                key={index} 
                                variant="secondary"
                                className="bg-blue-900/30 text-blue-300 hover:bg-blue-900/40 border-blue-700"
                            >
                                {label}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Title and Description */}
                <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-100">{post?.title}</h3>
                    <p className="text-gray-300 whitespace-pre-line leading-relaxed">{post?.description}</p>
                </div>

                {/* Links */}
                {post?.links?.length > 0 && (
                    <div className="space-y-2 pt-2">
                        {post.links.map((link: string, index: number) => (
                            <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 hover:underline transition-colors group"
                            >
                                <ExternalLink className="h-4 w-4" />
                                <span className="truncate text-sm">{link}</span>
                            </a>
                        ))}
                    </div>
                )}

                {/* Photos */}
                {post?.photos?.length > 0 && (
                    <div className={`grid gap-3 pt-4 ${post.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                        {post.photos.map((photo: string, index: number) => (
                            <div key={index} className="relative rounded-lg overflow-hidden border border-gray-700">
                                <img
                                    src={photo}
                                    alt={`Post photo ${index + 1}`}
                                    className="w-full h-auto object-cover"
                                    onError={(e) => {
                                        console.error(`Failed to load image: ${photo}`, e);
                                        (e.target as HTMLImageElement).src = "/default-placeholder.png";
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2 border-t border-gray-700">
                <div className="flex items-center justify-between w-full">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-700/50"
                    >
                        <Heart className="h-4 w-4" />
                        <span>Like</span>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-700/50"
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span>Comment</span>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-700/50"
                    >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
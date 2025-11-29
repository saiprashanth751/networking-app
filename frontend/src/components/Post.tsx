import { Link } from "react-router-dom";
import { PostLabel } from '@/types/types';
import { useCurrentUser } from "@/hooks/queries/user";
import { useFollowStatus } from "@/hooks/queries/follow";
import { useToggleFollow } from "@/hooks/mutations/follow";

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

    return (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
            {/* User Info */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <img
                        src={profileUrl}
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                    />
                    <Link to={`/profile/${post?.user?.id}`}>
                        <div>
                            <p className="font-semibold text-white">
                                {post?.user?.firstName} {post?.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-400">{post?.user?.department}</p>
                        </div>
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    <p className="text-sm text-gray-400">
                        {new Date(post?.createdAt).toLocaleString()}
                    </p>
                    {/* ✅ Simplified follow button with React Query */}
                    {shouldShowFollowButton && (
                        <button
                            onClick={toggleFollow}
                            disabled={isToggling}
                            className={`${
                                followStatus?.following
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-blue-500 hover:bg-blue-600"
                            } text-white py-1 px-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                        >
                            {isToggling ? "..." : (followStatus?.following ? "Unfollow" : "Follow")}
                        </button>
                    )}
                </div>
            </div>

            {/* Labels */}
            {post?.labels?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {post.labels.map((label: string, index: number) => (
                        <span key={index} className="px-3 py-1 text-sm bg-blue-500 text-white rounded-full">
                            {label}
                        </span>
                    ))}
                </div>
            )}

            {/* Post Content */}
            <p className="mt-4 text-gray-300 font-bold">{post?.title}</p>
            <p className="mt-2 text-gray-300">{post?.description}</p>

            {/* Links */}
            {post?.links?.length > 0 && (
                <div className="mt-4 space-y-2">
                    {post.links.map((link: string, index: number) => (
                        <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 break-words block"
                        >
                            🔗 {link}
                        </a>
                    ))}
                </div>
            )}

            {/* Photos */}
            {post?.photos?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {post.photos.map((photo: string, index: number) => (
                        <img
                            key={index}
                            src={photo}
                            alt={`Post photo ${index + 1}`}
                            className="w-full h-auto rounded-lg"
                            onError={(e) => {
                                console.error(`Failed to load image: ${photo}`, e);
                                (e.target as HTMLImageElement).src = "/default-placeholder.png";
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Engagement Buttons */}
            <div className="flex items-center justify-between mt-6">
                <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <span>👍</span>
                    <span>Like</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <span>💬</span>
                    <span>Comment</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <span>🔗</span>
                    <span>Share</span>
                </button>
            </div>
        </div>
    );
}
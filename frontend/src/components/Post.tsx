import { useState, useEffect } from 'react';
import axios from 'axios';

interface PostProps {
    post: {
        id: string;
        title: string;
        description: string;
        labels: string[];
        links: string[];
        photos: string[];
        createdAt: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            department: string;
            profile: {
                profilePic: string;
            };
        };
    };
    showFollowButton?: boolean;
}

export function Post({ post, showFollowButton = false }: PostProps) {
    const [isFollowing, setIsFollowing] = useState(false);
    const profileUrl = post?.user?.profile?.profilePic || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    // Fetch follow status for the post's user
    useEffect(() => {
        if (showFollowButton) {
            const fetchFollowStatus = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(
                        `https://uni-networking-app.onrender.com/api/v1/follow/?id=${post.user.id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    setIsFollowing(response.data.following);
                } catch (error) {
                    console.error("Failed to fetch follow status:", error);
                }
            };
            fetchFollowStatus();
        }
    }, [post.user.id, showFollowButton]);

    // Toggle follow/unfollow
    const toggleFollow = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!isFollowing) {
              
                await axios.post(
                    `https://uni-networking-app.onrender.com/api/v1/follow/?id=${post.user.id}`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            } else {
                
                await axios.delete(
                    `https://uni-networking-app.onrender.com/api/v1/follow/?id=${post.user.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            }
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error("Failed to toggle follow status:", error);
        }
    };

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
                    <div>
                        <p className="font-semibold text-white">
                            {post?.user?.firstName} {post?.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-400">{post?.user?.department}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <p className="text-sm text-gray-400">
                        {new Date(post?.createdAt).toLocaleString()}
                    </p>
                    {/* Conditionally render follow/unfollow button */}
                    {showFollowButton && (
                        <button
                            onClick={toggleFollow}
                            className={`${
                                isFollowing
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-blue-500 hover:bg-blue-600"
                            } text-white py-1 px-3 rounded-lg text-sm`}
                        >
                            {isFollowing ? "Unfollow" : "Follow"}
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
                            className="text-blue-400 hover:text-blue-300 break-words"
                        >
                            Link: {link}
                        </a>
                    ))}
                </div>
            )}

            {/* Photos */}
            {post?.photos?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {post.photos.map((photo: string, index: number) => {
                        const imageUrl = photo;
                        return (
                            <img
                                key={index}
                                src={imageUrl}
                                alt={`Post photo ${index + 1}`}
                                className="w-full h-auto rounded-lg"
                                onError={(e) => {
                                    console.error(`Failed to load image: ${imageUrl}`, e);
                                    (e.target as HTMLImageElement).src = "/default-placeholder.png";
                                }}
                            />
                        );
                    })}
                </div>
            )}

            {/* Engagement Buttons */}
            <div className="flex items-center justify-between mt-6">
                <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-500">
                    <span>👍</span>
                    <span>Like</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-500">
                    <span>💬</span>
                    <span>Comment</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-500">
                    <span>🔗</span>
                    <span>Share</span>
                </button>
            </div>
        </div>
    );
}
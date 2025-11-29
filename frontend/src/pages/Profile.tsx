import { Link as LinkIcon, GraduationCap, Book } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Post } from '../components/Post';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Import React Query hooks
import { useProfile } from '@/hooks/queries/profile';
import { useUser } from '@/hooks/queries/user';
import { useUserPosts } from '@/hooks/queries/post';
import { useFollowStatus, useFollowersByUserId, useFollowingByUserId } from '@/hooks/queries/follow';
import { useToggleFollow } from '@/hooks/mutations/follow';

const ProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [leetCodeStats, setLeetCodeStats] = useState<string | null>(null);

    // Fetch profile data
    const { 
        data: profileData, 
        isLoading: profileLoading, 
        isError: profileError 
    } = useProfile(id || '', { enabled: !!id });

    // Fetch user data
    const { 
        data: userData, 
        isLoading: userLoading 
    } = useUser(id || '', { enabled: !!id });

    // Fetch user's posts
    const { 
        data: postsData, 
        isLoading: postsLoading 
    } = useUserPosts(id || '', { enabled: !!id });

    // Fetch follow status
    const { 
        data: followStatus, 
        isLoading: followStatusLoading 
    } = useFollowStatus(id || '', { enabled: !!id });

    // Fetch followers and following counts
    const { data: followersData } = useFollowersByUserId(id || '', { enabled: !!id });
    const { data: followingData } = useFollowingByUserId(id || '', { enabled: !!id });

    // Toggle follow mutation
    const { toggleFollow, isLoading: isToggling } = useToggleFollow(
        id || '', 
        followStatus?.following || false
    );

    // Fetch LeetCode stats (external API - not covered by React Query in your setup)
    const fetchLeetCodeStats = async (username: string) => {
        try {
            const response = await axios.get(`https://leetcard.jacoblin.cool/${username}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch LeetCode stats:", error);
            return null;
        }
    };

    // Fetch LeetCode stats when profile loads
    useEffect(() => {
        if (profileData?.profile?.leetcode) {
            fetchLeetCodeStats(profileData.profile.leetcode).then(setLeetCodeStats);
        }
    }, [profileData?.profile?.leetcode]);

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
        }
    }, [navigate]);

    // Extract data with fallbacks
    const profile = profileData?.profile;
    const user = userData?.user;
    const posts = postsData?.posts || [];
    const isFollowing = followStatus?.following || false;

    // Combined loading state
    const isLoading = profileLoading || userLoading || postsLoading || followStatusLoading;

    // Error handling
    if (profileError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <img src="/error-icon.svg" alt="Error" className="w-16 h-16 mb-4" />
                <p className="text-red-500 text-lg">
                    Failed to load profile. Please try again later.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-gray-700">Loading profile...</p>
            </div>
        );
    }

    const profileUrl = profile?.profilePic || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    return (
        <div className="bg-gray-900 text-white min-h-screen flex p-8 space-x-8">
            {/* Left Section - Profile Info & Posts */}
            <div className="w-2/3 bg-gray-800 rounded-lg p-6 overflow-auto">
                {/* Profile Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        {/* Profile Picture & Name */}
                        <div className="flex items-center space-x-4">
                            <img
                                src={profileUrl}
                                alt="Profile"
                                className="w-32 h-32 rounded-full border-4 border-gray-800"
                            />
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <p className="text-gray-400">@{user?.firstName?.toLowerCase()}</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={toggleFollow}
                                disabled={isToggling}
                                className={`${
                                    isFollowing
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-blue-500 hover:bg-blue-600"
                                } text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isToggling ? "..." : (isFollowing ? "Unfollow" : "Follow")}
                            </button>
                        </div>
                    </div>

                    {/* Followers & Following Count */}
                    <div className="flex justify-start items-center text-gray-400 gap-40 mt-2">
                        <div>
                            <p className="text-lg font-bold text-center">{followersData?.count || 0}</p>
                            <p className="text-xs">Followers</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-center">{followingData?.count || 0}</p>
                            <p className="text-xs">Following</p>
                        </div>
                    </div>

                    {/* Bio */}
                    <p className="mt-7 text-gray-300">{profile?.bio}</p>

                    {/* Profile Details */}
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center text-gray-400">
                            <GraduationCap className="w-5 h-5 mr-2" />
                            <p>{profile?.department} ({profile?.graduationYear})</p>
                        </div>
                        <div className="flex items-center text-gray-400">
                            <Book className="w-5 h-5 mr-2" />
                            <p>Minor in {profile?.minor}</p>
                        </div>
                        {profile?.linkedin && (
                            <div className="flex items-center text-gray-400">
                                <LinkIcon className="w-5 h-5 mr-2" />
                                <a
                                    href={profile.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-500"
                                >
                                    LinkedIn
                                </a>
                            </div>
                        )}
                        {profile?.github && (
                            <div className="flex items-center text-gray-400">
                                <LinkIcon className="w-5 h-5 mr-2" />
                                <a
                                    href={profile.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-500"
                                >
                                    GitHub
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Posts */}
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-6">Posts</h3>
                    {posts.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No posts yet</p>
                    ) : (
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <div key={post.id} className="bg-gray-700 p-4 rounded-lg shadow-md">
                                    <Post post={post} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Section - Platform Stats */}
            <div className="w-1/3 bg-gray-800 rounded-lg p-6 h-screen sticky top-0 overflow-y-auto">
                <h3 className="text-xl font-bold mt-6 mb-4">Platform Stats</h3>

                <div className="space-y-6">
                    {/* LeetCode Stats */}
                    {profile?.leetcode && leetCodeStats && (
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">LeetCode</h4>
                            <div
                                className="w-full overflow-hidden"
                                style={{
                                    aspectRatio: '500 / 200',
                                    height: 'auto'
                                }}
                            >
                                <img
                                    src={`data:image/svg+xml;utf8,${encodeURIComponent(leetCodeStats)}`}
                                    alt="LeetCode Stats"
                                    className="object-contain rounded-lg"
                                />
                            </div>
                        </div>
                    )}

                    {/* GeeksforGeeks Stats */}
                    {profile?.geekforgeeks && (
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">GeeksforGeeks</h4>
                            <img
                                src={`https://gfgstatscard.vercel.app/${profile.geekforgeeks}`}
                                alt="GeeksforGeeks Stats"
                                className="w-full h-50 object-cover"
                            />
                        </div>
                    )}

                    {/* Codeforces Stats */}
                    {profile?.codeforces && (
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">Codeforces</h4>
                            <img
                                src={`https://codeforces-readme-stats.vercel.app/api/card?username=${profile.codeforces}`}
                                alt="Codeforces Stats"
                                className="w-full h-50 object-cover"
                            />
                        </div>
                    )}

                    {/* GitHub Stats */}
                    {profile?.github && (
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">GitHub</h4>
                            <div className="space-y-4">
                                <img
                                    src={`https://github-readme-stats.vercel.app/api?username=${profile.github}&show_icons=true&theme=dark&card_width=300`}
                                    alt="GitHub Stats"
                                    className="w-full object-contain border-none"
                                />
                                <img
                                    src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${profile.github}&layout=compact&theme=dark&card_width=400`}
                                    alt="Top Languages"
                                    className="w-full object-contain border-none"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
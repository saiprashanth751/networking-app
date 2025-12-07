import { Link as LinkIcon, GraduationCap, Book, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Post } from '../components/Post';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FollowList } from '../components/FollowList';
import { Button } from "@/components/ui/button";
import MessageBox from './MessageBox';

// ✅ Import React Query hooks
import { useCurrentProfile } from '@/hooks/queries/profile';
import { useCurrentUser } from '@/hooks/queries/user';
import { useCurrentUserPosts } from '@/hooks/queries/post';
import { useFollowers, useFollowing } from '@/hooks/queries/follow';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [leetCodeStats, setLeetCodeStats] = useState<string | null>(null);

    // ✅ Fetch all data using React Query
    const { data: profileData, isLoading: profileLoading, isError: profileError } = useCurrentProfile();
    const { data: userData, isLoading: userLoading } = useCurrentUser();
    const { data: postsData, isLoading: postsLoading } = useCurrentUserPosts();
    const { data: followersData, isLoading: followersLoading } = useFollowers();
    const { data: followingData, isLoading: followingLoading } = useFollowing();

    // Extract data with fallbacks
    const profile = profileData?.profile;
    const user = userData?.user;
    const posts = postsData?.posts || [];
    const followerUsers = followersData?.followers || [];
    const followingUsers = followingData?.followingUsers || [];

    // Fetch LeetCode stats (external API - keep as is)
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
        if (profile?.leetcode) {
            fetchLeetCodeStats(profile.leetcode).then(setLeetCodeStats);
        }
    }, [profile?.leetcode]);

    // Combined loading state
    const isLoading = profileLoading || userLoading || postsLoading || followersLoading || followingLoading;

    // Error handling
    if (profileError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">Failed to load profile</p>
                    <Button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading profile...</p>
                </div>
            </div>
        );
    }

    const profilePicUrl = profile?.profilePic || 
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col lg:flex-row p-8 space-y-8 lg:space-y-0 lg:space-x-8">
            {/* Left Section (User Details + Posts) */}
            <div className="w-full lg:w-2/3 bg-gray-800 rounded-lg p-6 overflow-auto">
                {/* User Details */}
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <img
                                src={profilePicUrl}
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
                        <div className="flex gap-4">
                            <Button
                                onClick={() => navigate("/dashboard")}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Dashboard
                            </Button>
                            <Button
                                onClick={() => navigate("/updateProfile")}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                            >
                                Edit Profile
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-between mt-8">
                        {/* Profile Details */}
                        <div className="w-1/2 pr-8">
                            <div className="flex justify-start items-center text-gray-400 gap-40 mt-2">
                                <div>
                                    <p className="text-lg font-bold text-center">
                                        {followersData?.count || 0}
                                    </p>
                                    <p className="text-xs">Followers</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-center">
                                        {followingData?.count || 0}
                                    </p>
                                    <p className="text-xs">Following</p>
                                </div>
                            </div>

                            <p className="mt-7 text-gray-300">{profile?.bio}</p>
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

                        {/* Followers and Following Lists */}
                        <div className="w-1/2 pl-8">
                            <div className="flex flex-col space-y-6">
                                <FollowList
                                    title="Followers"
                                    users={followerUsers.map((user: any) => ({ 
                                        id: user.id, 
                                        firstName: user.firstName || "" 
                                    }))}
                                    onMessageClick={(userId: string) => setSelectedUserId(userId)}
                                />
                                <FollowList
                                    title="Following"
                                    users={followingUsers.map((user: any) => ({ 
                                        id: user.id, 
                                        firstName: user.firstName || "" 
                                    }))}
                                    onMessageClick={(userId: string) => setSelectedUserId(userId)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts Section */}
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-6">Your Posts</h3>
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

            {/* Right Section (Platform Stats or MessageBox) */}
            <div className="w-full lg:w-1/3 bg-gray-800 rounded-lg p-6 h-screen sticky top-0 overflow-y-auto">
                {selectedUserId ? (
                    <MessageBox 
                        receiverId={selectedUserId} 
                        onClose={() => setSelectedUserId(null)} 
                    />
                ) : (
                    <>
                        <h3 className="text-xl font-bold mb-6">Platform Stats</h3>

                        <div className="space-y-6">
                            {/* LeetCode Stats */}
                            {profile?.leetcode && leetCodeStats && (
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <h4 className="font-bold mb-2">LeetCode</h4>
                                    <div
                                        className="w-full overflow-hidden"
                                        style={{ aspectRatio: '500 / 200', height: 'auto' }}
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
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
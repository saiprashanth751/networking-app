import { Link as LinkIcon, GraduationCap, Book, User, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Post } from '../components/Post';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

    // Get user initials for avatar fallback
    const getUserInitials = () => {
        return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
    };

    // Error handling
    if (profileError) {
        return (
            <Card className="max-w-2xl mx-auto mt-8 bg-gray-800 border-red-500">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                        <User className="h-8 w-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Profile Not Found</h3>
                    <p className="text-gray-400 text-center mb-6">
                        Failed to load profile. Please try again later.
                    </p>
                    <Button onClick={() => navigate('/dashboard')}>
                        Return to Dashboard
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex p-8 space-x-8">
                {/* Left Section Skeleton */}
                <div className="w-2/3 space-y-6">
                    <Card className="bg-gray-800">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="w-32 h-32 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-48" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-10 w-32" />
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </div>
                            <div className="flex gap-8 mt-4">
                                <Skeleton className="h-12 w-20" />
                                <Skeleton className="h-12 w-20" />
                            </div>
                            <Skeleton className="h-4 w-full mt-6" />
                            <Skeleton className="h-4 w-3/4 mt-2" />
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800">
                        <CardContent className="p-6">
                            <Skeleton className="h-6 w-24 mb-4" />
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-40 w-full mb-4" />
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Section Skeleton */}
                <div className="w-1/3">
                    <Card className="bg-gray-800 sticky top-0">
                        <CardContent className="p-6">
                            <Skeleton className="h-6 w-32 mb-6" />
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-48 w-full mb-4" />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen flex p-8 space-x-8">
            {/* Left Section - Profile Info & Posts */}
            <div className="w-2/3 space-y-6">
                {/* Profile Card */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                        {/* Profile Header */}
                        <div className="flex items-start justify-between mb-6">
                            {/* Profile Picture & Name */}
                            <div className="flex items-center space-x-4">
                                <Avatar className="w-32 h-32 border-4 border-gray-900">
                                    <AvatarImage 
                                        src={profile?.profilePic} 
                                        alt={`${user?.firstName} ${user?.lastName}`}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-gray-700 text-3xl font-semibold">
                                        {getUserInitials() || <User className="h-12 w-12" />}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {user?.firstName} {user?.lastName}
                                    </h2>
                                    <p className="text-gray-400">@{user?.firstName?.toLowerCase()}</p>
                                    
                                    {/* Department Badge */}
                                    {profile?.department && (
                                        <Badge variant="secondary" className="mt-2 bg-gray-700 text-gray-300">
                                            {profile.department}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => navigate("/dashboard")}
                                    variant="outline"
                                    className="border-gray-600 hover:bg-gray-700"
                                >
                                    Dashboard
                                </Button>
                                <Button
                                    onClick={toggleFollow}
                                    disabled={isToggling}
                                    variant={isFollowing ? "destructive" : "default"}
                                >
                                    {isToggling ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    {isToggling ? "Processing" : (isFollowing ? "Unfollow" : "Follow")}
                                </Button>
                            </div>
                        </div>

                        {/* Follow Stats */}
                        <div className="flex items-center gap-8 mt-2">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{followersData?.count || 0}</p>
                                <p className="text-sm text-gray-400">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{followingData?.count || 0}</p>
                                <p className="text-sm text-gray-400">Following</p>
                            </div>
                        </div>

                        {/* Bio */}
                        {profile?.bio && (
                            <p className="mt-6 text-gray-300 whitespace-pre-line leading-relaxed">
                                {profile.bio}
                            </p>
                        )}

                        {/* Profile Details */}
                        <div className="mt-6 space-y-3">
                            {profile?.department && profile?.graduationYear && (
                                <div className="flex items-center text-gray-400">
                                    <GraduationCap className="w-5 h-5 mr-3" />
                                    <span>{profile.department} • Class of {profile.graduationYear}</span>
                                </div>
                            )}
                            {profile?.minor && (
                                <div className="flex items-center text-gray-400">
                                    <Book className="w-5 h-5 mr-3" />
                                    <span>Minor in {profile.minor}</span>
                                </div>
                            )}
                            {profile?.linkedin && (
                                <div className="flex items-center text-gray-400">
                                    <LinkIcon className="w-5 h-5 mr-3" />
                                    <a
                                        href={profile.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        LinkedIn Profile
                                    </a>
                                </div>
                            )}
                            {profile?.github && (
                                <div className="flex items-center text-gray-400">
                                    <LinkIcon className="w-5 h-5 mr-3" />
                                    <a
                                        href={`https://github.com/${profile.github}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        GitHub: @{profile.github}
                                    </a>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Posts Section */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-xl">Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {posts.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 mb-4">
                                    <Book className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-300 mb-2">No posts yet</h3>
                                <p className="text-gray-400">This user hasn't shared any posts.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <div key={post.id}>
                                        <Post post={post} showFollowButton={false} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Section - Platform Stats */}
            <div className="w-1/3">
                <Card className="bg-gray-800 border-gray-700 h-[calc(100vh-4rem)] sticky top-8">
                    <CardHeader>
                        <CardTitle className="text-xl">Platform Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2">
                            {/* LeetCode Stats */}
                            {profile?.leetcode && leetCodeStats && (
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    <h4 className="font-bold mb-3 flex items-center gap-2">
                                        <span className="text-orange-400">LeetCode</span>
                                        <Badge variant="outline" className="text-xs">
                                            @{profile.leetcode}
                                        </Badge>
                                    </h4>
                                    <div className="w-full overflow-hidden rounded">
                                        <img
                                            src={`data:image/svg+xml;utf8,${encodeURIComponent(leetCodeStats)}`}
                                            alt="LeetCode Stats"
                                            className="w-full object-contain"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* GeeksforGeeks Stats */}
                            {profile?.geekforgeeks && (
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    <h4 className="font-bold mb-3 flex items-center gap-2">
                                        <span className="text-green-400">GeeksforGeeks</span>
                                        <Badge variant="outline" className="text-xs">
                                            @{profile.geekforgeeks}
                                        </Badge>
                                    </h4>
                                    <img
                                        src={`https://gfgstatscard.vercel.app/${profile.geekforgeeks}`}
                                        alt="GeeksforGeeks Stats"
                                        className="w-full object-contain rounded"
                                    />
                                </div>
                            )}

                            {/* Codeforces Stats */}
                            {profile?.codeforces && (
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    <h4 className="font-bold mb-3 flex items-center gap-2">
                                        <span className="text-blue-400">Codeforces</span>
                                        <Badge variant="outline" className="text-xs">
                                            @{profile.codeforces}
                                        </Badge>
                                    </h4>
                                    <img
                                        src={`https://codeforces-readme-stats.vercel.app/api/card?username=${profile.codeforces}`}
                                        alt="Codeforces Stats"
                                        className="w-full object-contain rounded"
                                    />
                                </div>
                            )}

                            {/* GitHub Stats */}
                            {profile?.github && (
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    <h4 className="font-bold mb-3 flex items-center gap-2">
                                        <span className="text-gray-300">GitHub</span>
                                        <Badge variant="outline" className="text-xs">
                                            @{profile.github}
                                        </Badge>
                                    </h4>
                                    <div className="space-y-4">
                                        <img
                                            src={`https://github-readme-stats.vercel.app/api?username=${profile.github}&show_icons=true&theme=dark&hide_border=true`}
                                            alt="GitHub Stats"
                                            className="w-full rounded"
                                        />
                                        <img
                                            src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${profile.github}&layout=compact&theme=dark&hide_border=true`}
                                            alt="Top Languages"
                                            className="w-full rounded"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
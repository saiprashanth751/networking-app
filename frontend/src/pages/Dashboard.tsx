import { useState, useMemo } from 'react';
import { Post } from '../components/Post';
import { AppBar } from '../components/AppBar';
import { CreatePost } from '../components/CreatePost';
import { User } from '../components/User';
import { motion } from 'framer-motion';
import { FaFilter, FaUser } from 'react-icons/fa';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

// Import React Query hooks
import { useCurrentProfile } from '@/hooks/queries/profile';
import { useUsersByMinor } from '@/hooks/queries/user';
import { useAllPosts } from '@/hooks/queries/post';
import { useFollowing } from '@/hooks/queries/follow';
import { PostLabel } from '@/types/types';

export default function Dashboard() {
    const [selectedLabel, setSelectedLabel] = useState<PostLabel | null>(null);

    // 1. Fetch current user's profile
    const { 
        data: profileData, 
        isLoading: profileLoading, 
        isError: profileError 
    } = useCurrentProfile();

    // 2. Fetch users by minor (only runs if profile exists)
    const { 
        data: usersData, 
        isLoading: usersLoading 
    } = useUsersByMinor(
        profileData?.profile?.minor || '',
        { enabled: !!profileData?.profile?.minor }
    );

    // 3. Fetch all posts
    const { 
        data: postsData, 
        isLoading: postsLoading, 
        isError: postsError 
    } = useAllPosts();

    // 4. Fetch following users
    const { data: followingData } = useFollowing();

    // Filter users who are not already followed
    const recommendedUsers = useMemo(() => {
        if (!usersData?.users || !followingData?.followingUsers) return [];
        
        const followedUserIds = followingData.followingUsers.map((user: any) => user.id);
        return usersData.users.filter(
            (user: any) => !followedUserIds.includes(user.id)
        );
    }, [usersData, followingData]);

    // Filter posts by selected label
    const filteredPosts = useMemo(() => {
        if (!postsData?.posts) return [];
        if (!selectedLabel) return postsData.posts;
        
        return postsData.posts.filter((post) => 
            post.labels.includes(selectedLabel)
        );
    }, [postsData, selectedLabel]);

    // Get unique labels from all posts
    const allLabels = useMemo(() => {
        if (!postsData?.posts) return [];
        return Array.from(new Set(postsData.posts.flatMap((post) => post.labels)));
    }, [postsData]);

    // Combined loading state
    const isLoading = profileLoading || postsLoading || usersLoading;

    // Combined error state
    if (profileError || postsError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <img src="/error-icon.svg" alt="Error" className="w-16 h-16 mb-4" />
                <p className="text-red-500 text-lg">
                    Failed to load data. Please try again later.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-gray-700">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-900 dark:bg-gray-950 pt-16">
            {/* Left Sidebar - Filter Labels */}
            <div className="w-full lg:w-1/5 border-r-2 border-gray-200 dark:bg-gray-900 p-6 rounded-lg shadow-md dark:shadow-gray-800 overflow-y-auto mb-4 lg:mb-0 lg:mr-4">
                <h3 className="text-xl font-bold mb-6 sticky top-0 dark:bg-gray-900 py-4 flex items-center text-gray-200">
                    <FaFilter className="mr-2 text-gray-400" /> Filter by Labels
                </h3>
                <button
                    onClick={() => setSelectedLabel(null)}
                    className={`w-full text-left p-3 rounded-lg mb-2 transition-all duration-200 ${
                        !selectedLabel
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    All Posts
                </button>
                {allLabels.map((label, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedLabel(label)}
                        className={`w-full text-left p-3 rounded-lg mb-2 transition-all duration-200 ${
                            selectedLabel === label
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Center - Posts Feed */}
            <div className="flex-1 p-6 relative">
                <SimpleBar className="h-full">
                    <div className="sticky top-0 h-6 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none" />
                    <AppBar />
                    {/* CreatePost no longer needs onCreate prop - React Query handles refetch */}
                    <CreatePost />
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl mx-auto space-y-6"
                    >
                        {filteredPosts.map((post) => (
                            <div key={post.id} className="bg-gray-800 dark:bg-gray-900 p-2 rounded-lg">
                                <Post post={post} showFollowButton={true} />
                            </div>
                        ))}
                    </motion.div>
                    <div className="sticky bottom-0 h-6 bg-gradient-to-t from-gray-900 to-transparent z-10 pointer-events-none" />
                </SimpleBar>
            </div>

            {/* Right Sidebar - Recommended Users */}
            <div className="w-full lg:w-1/4 dark:bg-gray-900 p-6 rounded-lg shadow-md dark:shadow-gray-800 overflow-y-auto mt-4 lg:mt-0 lg:ml-4 border-l-2 border-gray-200">
                <h3 className="text-xl font-bold mb-3 sticky top-0 dark:bg-gray-900 py-4 flex items-center text-gray-200">
                    <FaUser className="mr-2 text-gray-400" /> Recommended / Known Users
                </h3>

                <div className="text-sm text-gray-400 mb-4 p-3 bg-gray-800 dark:bg-gray-700 rounded-lg">
                    <p>
                        <span className="font-semibold">Note:</span> The users below are recommended based on your minor. To discover
                        more users who share your interests, explore their posts or use the search feature.
                    </p>
                </div>

                {recommendedUsers.map((user) => (
                    <div key={user.id} className="bg-gray-700 dark:bg-gray-800 rounded-lg mb-2 p-0.5">
                        <User user={user} />
                    </div>
                ))}
            </div>
        </div>
    );
}
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { PostCard } from '@/components/posts/PostCard';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { useAllPosts } from '@/hooks/queries/post';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from '@/hooks/queries/user';
import { useCurrentProfile } from '@/hooks/queries/profile';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const navigate = useNavigate();

    // Fetch data
    const { data: postsData, isLoading: postsLoading, isError: postsError } = useAllPosts();
    const { data: currentUserData, error: userError } = useCurrentUser();
    const { data: currentProfileData } = useCurrentProfile();

    // Handle auth errors - redirect to login
    useEffect(() => {
        if (userError) {
            const axiosError = userError as any;
            if (axiosError?.response?.status === 401 || axiosError?.response?.status === 403) {
                localStorage.removeItem('token');
                navigate('/signin');
            }
        }
    }, [userError, navigate]);

    const posts = postsData?.posts || [];
    const currentUser = currentUserData?.user;
    const currentProfile = currentProfileData?.profile;

    const getUserInitials = () => {
        if (!currentUser) return 'U';
        return `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase();
    };

    return (
        <>
            {/* Create Post Modal */}
            <CreatePostModal
                open={isCreatePostOpen}
                onClose={() => setIsCreatePostOpen(false)}
            />

            {/* Page Header - Sticky */}
            <div className="sticky top-0 z-10 backdrop-blur-md bg-black/80 border-b border-neutral-800">
                <div className="px-4 py-3">
                    <h1 className="text-xl font-bold">Home</h1>
                </div>
            </div>

            {/* Create Post Prompt - Twitter Style */}
            <div className="border-b border-neutral-800 px-4 py-3">
                <div className="flex gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={currentProfile?.profilePic} />
                        <AvatarFallback className="bg-muted text-xs">
                            {getUserInitials()}
                        </AvatarFallback>
                    </Avatar>
                    <button
                        onClick={() => setIsCreatePostOpen(true)}
                        className="flex-1 text-left text-neutral-500 text-[20px] py-2 hover:text-white transition-colors"
                    >
                        What's happening?
                    </button>
                </div>
            </div>

            {/* Posts Feed */}
            <div>
                {postsLoading ? (
                    // Loading skeletons
                    <div>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="border-b border-neutral-800 px-4 py-3">
                                <div className="flex gap-3">
                                    <div className="h-10 w-10 rounded-full bg-neutral-800 animate-pulse" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 w-32 bg-neutral-800 rounded animate-pulse" />
                                        <div className="h-4 w-full bg-neutral-800 rounded animate-pulse" />
                                        <div className="h-4 w-5/6 bg-neutral-800 rounded animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : postsError ? (
                    // Error state
                    <div className="px-4 py-16 text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-neutral-500 mb-6">
                            Failed to load posts. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full font-bold transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                ) : posts.length === 0 ? (
                    // Empty state - First time user
                    <div className="px-4 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-6">
                            <Sparkles className="h-8 w-8 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            Welcome to Connect!
                        </h2>
                        <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                            This is your Home timeline. Share your first thought with the community.
                        </p>
                        <button
                            onClick={() => setIsCreatePostOpen(true)}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-full font-bold transition-colors inline-flex items-center gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            Create your first post
                        </button>
                    </div>
                ) : (
                    // Posts list - Twitter style (no wrapper cards)
                    posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            showActions={true}
                            showFollowButton={true}
                        />
                    ))
                )}
            </div>

            {/* Load More Indicator (for future infinite scroll) */}
            {!postsLoading && !postsError && posts.length > 0 && (
                <div className="px-4 py-6 text-center text-neutral-500 text-sm border-b border-neutral-800">
                    End of feed · {posts.length} posts loaded
                </div>
            )}
        </>
    );
}
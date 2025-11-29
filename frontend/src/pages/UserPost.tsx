import { Post } from "../components/Post";
import { useAllPosts } from "@/hooks/queries/post";

export default function UserPost() {
    // ✅ Fetch all posts using React Query
    const { data: postsData, isLoading, isError } = useAllPosts();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-700">Loading posts...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">Failed to load posts</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const posts = postsData?.posts || [];

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                All Posts
            </h1>
            
            {posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No posts available</p>
                </div>
            ) : (
                posts.map((post) => (
                    <Post key={post.id} post={post} showFollowButton={true} />
                ))
            )}
        </div>
    );
}
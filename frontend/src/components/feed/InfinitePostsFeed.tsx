import { useInfinitePosts } from '@/hooks/queries/post';
import { PostCard } from '@/components/posts/PostCard';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { FeedFilters } from '@/types/feed';

interface InfinitePostsFeedProps {
    filters?: FeedFilters;
}

export function InfinitePostsFeed({ filters }: InfinitePostsFeedProps) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfinitePosts(filters);

    const observerTarget = useRef<HTMLDivElement>(null);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Loading state
    if (isLoading) {
        return (
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
        );
    }

    // Error state
    if (isError) {
        return (
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
        );
    }

    // Flatten all pages into single array
    const posts = data?.pages.flatMap((page) => page.posts) ?? [];

    // Empty state
    if (posts.length === 0) {
        return (
            <div className="px-4 py-16 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-bold mb-2">No posts found</h2>
                <p className="text-neutral-500">
                    {filters?.followingOnly
                        ? "Follow some users to see their posts here"
                        : "Try adjusting your filters or check back later"}
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Posts list */}
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    showActions={true}
                    showFollowButton={true}
                />
            ))}

            {/* Intersection observer target */}
            <div ref={observerTarget} className="h-20 flex items-center justify-center">
                {isFetchingNextPage && (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                )}
                {!hasNextPage && posts.length > 0 && (
                    <div className="text-sm text-neutral-500">
                        End of feed · {posts.length} posts loaded
                    </div>
                )}
            </div>
        </div>
    );
}

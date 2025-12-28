import { useState } from 'react';
import { useUserBookmarks } from '@/hooks/queries/engagement';
import { PostCard } from '@/components/posts/PostCard';
import { Bookmark, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function BookmarksPage() {
    const navigate = useNavigate();
    const [page] = useState(1);
    const { data, isLoading, error } = useUserBookmarks({ page, limit: 20 });

    const bookmarks = data?.bookmarks || [];
    const total = data?.pagination?.total || 0;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="flex items-center gap-4 px-4 h-[53px]">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="hover:bg-accent rounded-full p-2 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-xl">Bookmarks</h1>
                        <span className="text-muted-foreground text-[13px]">
                            {total} {total === 1 ? 'post' : 'posts'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading your bookmarks...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4 px-4">
                        <Bookmark className="h-12 w-12 text-muted-foreground opacity-50" />
                        <div className="text-center space-y-2">
                            <h2 className="font-bold text-xl">Failed to load bookmarks</h2>
                            <p className="text-muted-foreground">
                                Something went wrong. Please try again.
                            </p>
                        </div>
                        <Button onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4 px-4">
                        <Bookmark className="h-16 w-16 text-muted-foreground opacity-50" />
                        <div className="text-center space-y-2">
                            <h2 className="font-bold text-2xl">No bookmarks yet</h2>
                            <p className="text-muted-foreground max-w-md">
                                Save posts for later by tapping the bookmark icon. They'll show up here.
                            </p>
                        </div>
                        <Button onClick={() => navigate('/dashboard')}>
                            Explore Posts
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {bookmarks.map((bookmark: any) => (
                            <PostCard key={bookmark.id} post={bookmark.post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

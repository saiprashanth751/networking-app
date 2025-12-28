import { useState, useEffect } from 'react';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from '@/hooks/queries/user';
import { useCurrentProfile } from '@/hooks/queries/profile';
import { useNavigate } from 'react-router-dom';
import { InfinitePostsFeed } from '@/components/feed/InfinitePostsFeed';
import { FeedControls } from '@/components/feed/FeedControls';
import { FeedFilters } from '@/types/feed';

export default function Dashboard() {
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [filters, setFilters] = useState<FeedFilters>({
        sort: 'recent',
    });
    const navigate = useNavigate();

    // Fetch data
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
            <div className="sticky top-0 z-10 backdrop-blur-md bg-background/95 border-b border-neutral-800/30">
                <div className="px-6 py-4">
                    <h1 className="text-xl font-bold">Home</h1>
                </div>
            </div>

            {/* Feed Controls (Sort & Filters) */}
            <FeedControls
                filters={filters}
                onFiltersChange={(newFilters) => setFilters(newFilters)}
            />

            {/* Create Post Prompt */}
            <div className="border-b border-neutral-800/30 px-6 py-5 hover:bg-neutral-900/20 transition-all duration-150">
                <div className="flex gap-4">
                    <Avatar className="h-11 w-11 shrink-0">
                        <AvatarImage src={currentProfile?.profilePic} />
                        <AvatarFallback className="bg-neutral-800 text-xs">
                            {getUserInitials()}
                        </AvatarFallback>
                    </Avatar>
                    <button
                        onClick={() => setIsCreatePostOpen(true)}
                        className="flex-1 text-left text-muted-foreground text-base py-3 px-5 rounded-full bg-neutral-900 hover:bg-neutral-800 transition-all duration-150 border border-neutral-800"
                    >
                        What's on your mind?
                    </button>
                </div>
            </div>

            {/* Infinite Scroll Feed */}
            <InfinitePostsFeed filters={filters} />
        </>
    );
}

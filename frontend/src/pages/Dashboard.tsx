import { useState, useMemo } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { User } from '../components/User';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, AlertCircle, Plus } from "lucide-react";

// Import design system
import {
    PageLayout,
    H3,
    Body,
    Small,
    SPACING,
    LAYOUT
} from '@/components/layout';

// Import React Query hooks
import { useCurrentProfile } from '@/hooks/queries/profile';
import { useUsersByMinor } from '@/hooks/queries/user';
import { useAllPosts } from '@/hooks/queries/post';
import { useFollowing } from '@/hooks/queries/follow';

export default function Dashboard() {
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

    // Fetch all data with React Query
    const {
        data: profileData,
        isLoading: profileLoading,
        isError: profileError
    } = useCurrentProfile();

    const {
        data: usersData,
        isLoading: usersLoading
    } = useUsersByMinor(
        profileData?.profile?.minor || '',
        { enabled: !!profileData?.profile?.minor }
    );

    const {
        data: postsData,
        isLoading: postsLoading,
        isError: postsError
    } = useAllPosts();

    const { data: followingData } = useFollowing();

    // Filter users who are not already followed
    const recommendedUsers = useMemo(() => {
        if (!usersData?.users || !followingData?.following) return [];

        const followedUserIds = followingData.following.map((user: any) => user.id);
        return usersData.users.filter(
            (user: any) => !followedUserIds.includes(user.id)
        );
    }, [usersData, followingData]);

    // Get all posts (no filtering for now)
    const posts = postsData?.posts || [];

    if (profileError) {
        return (
            <PageLayout>
                <div className={`flex items-center justify-center min-h-[400px] ${SPACING.stack.md}`}>
                    <Card className="border-destructive">
                        <CardContent className={`py-8 ${SPACING.stack.sm}`}>
                            <div className="flex items-center justify-center text-destructive mb-2">
                                <AlertCircle className="h-8 w-8" />
                            </div>
                            <H3 className="text-center">Failed to Load Profile</H3>
                            <Body className="text-center text-muted-foreground">
                                Please try refreshing the page
                            </Body>
                        </CardContent>
                    </Card>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            {/* Create Post Modal */}
            <CreatePostModal
                open={isCreatePostOpen}
                onClose={() => setIsCreatePostOpen(false)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Sidebar - 1/3 width, hidden on mobile/tablet */}
                <div className={`hidden lg:block ${SPACING.stack.lg}`}>
                    {/* Active Users Card */}
                    <Card className="border-border bg-card sticky top-20">
                        <CardHeader className="pb-3">
                            <CardTitle className={`text-base font-semibold flex items-center ${SPACING.inline.sm}`}>
                                <Users className="h-4 w-4 text-primary" />
                                <span>People You May Know</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {usersLoading ? (
                                <div className={SPACING.stack.sm}>
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className={`flex items-center ${SPACING.inline.sm}`}>
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="flex-1">
                                                <Skeleton className="h-4 w-24 mb-1" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : recommendedUsers.length === 0 ? (
                                <div className={`text-center py-4 ${SPACING.stack.sm}`}>
                                    <Small className="text-muted-foreground">
                                        No recommendations at this time
                                    </Small>
                                </div>
                            ) : (
                                <div className={SPACING.stack.sm}>
                                    {recommendedUsers.slice(0, 5).map((user: any) => (
                                        <User
                                            key={user.id}
                                            user={user}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Feed - 2/3 width on desktop, full width on mobile */}
                <div className={`lg:col-span-2 ${SPACING.stack.lg}`}>

                    {/* Create Post Button */}
                    <Card className="border-border bg-card">
                        <CardContent className="py-4">
                            <Button
                                onClick={() => setIsCreatePostOpen(true)}
                                className="w-full"
                                size="lg"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Create Post
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Posts Feed */}
                    <div className={SPACING.stack.lg}>
                        {postsLoading ? (
                            // Loading skeletons
                            <div className={SPACING.stack.lg}>
                                {[1, 2, 3].map((i) => (
                                    <Card key={i} className="border-border bg-card">
                                        <CardContent className="py-6">
                                            <div className={`flex items-center ${SPACING.inline.sm} mb-4`}>
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="flex-1">
                                                    <Skeleton className="h-4 w-32 mb-2" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </div>
                                            <Skeleton className="h-4 w-full mb-2" />
                                            <Skeleton className="h-4 w-5/6" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : postsError ? (
                            // Error state
                            <Card className="border-destructive bg-card">
                                <CardContent className={`py-12 text-center ${SPACING.stack.md}`}>
                                    <div className="flex items-center justify-center text-destructive mb-2">
                                        <AlertCircle className="h-8 w-8" />
                                    </div>
                                    <H3>Failed to Load Posts</H3>
                                    <Body className="text-muted-foreground">
                                        Please try refreshing the page
                                    </Body>
                                </CardContent>
                            </Card>
                        ) : posts.length === 0 ? (
                            // Empty state
                            <Card className="border-border bg-card">
                                <CardContent className={`py-12 text-center ${SPACING.stack.md}`}>
                                    <div className="text-4xl mb-4">🔭</div>
                                    <H3>No Posts Found</H3>
                                    <Body className="text-muted-foreground">
                                        Be the first to share something!
                                    </Body>
                                    <Button
                                        onClick={() => setIsCreatePostOpen(true)}
                                        className="mt-4"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Post
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            // Posts list
                            posts.map((post) => (
                                <PostCard key={post.id} post={post} showActions={true} />
                            ))
                        )}
                    </div>
                </div>

                {/* Right Sidebar - 1/3 width, hidden on mobile/tablet */}
                <div className={`hidden lg:block ${SPACING.stack.lg}`}>

                    {/* Trending Topics Card */}
                    <Card className="border-border bg-card sticky top-20">
                        <CardHeader className="pb-3">
                            <CardTitle className={`text-base font-semibold flex items-center ${SPACING.inline.sm}`}>
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <span>Trending Topics</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-center py-4 ${SPACING.stack.sm}`}>
                                <Small className="text-muted-foreground">
                                    Coming soon: Category and tag trending
                                </Small>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageLayout>
    );
}
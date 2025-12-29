import { useState, useMemo } from 'react';
import { Post } from '../components/Post';
import { AppBar } from '../components/AppBar';
import { CreatePost } from '../components/CreatePost';
import { User } from '../components/User';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, TrendingUp, Users, AlertCircle } from "lucide-react";

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
import { PostLabel } from '@/types/types';

export default function Dashboard() {
    const [selectedLabel, setSelectedLabel] = useState<PostLabel | null>(null);

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

    // Combined loading and error states
    const isLoading = profileLoading || postsLoading || usersLoading;
    const hasError = profileError || postsError;

    // Error State
    if (hasError) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className={SPACING.container.lg}>
                        <div className={`text-center ${SPACING.stack.md}`}>
                            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
                            <H3>Failed to Load Dashboard</H3>
                            <Body className="text-muted-foreground">
                                We couldn't load your dashboard. Please try refreshing the page.
                            </Body>
                            <Button onClick={() => window.location.reload()}>
                                Refresh Page
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Loading State with Proper Skeletons
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <AppBar />
                <PageLayout containerSize="lg" spacing="normal">
                    <div className={`${LAYOUT.grid.cols3} ${SPACING.inline.lg}`}>
                        {/* Main Feed Skeleton */}
                        <div className={`lg:col-span-2 ${SPACING.stack.lg}`}>
                            <Skeleton className="h-32 w-full rounded-lg" />
                            <Skeleton className="h-64 w-full rounded-lg" />
                            <Skeleton className="h-64 w-full rounded-lg" />
                        </div>
                        {/* Sidebar Skeleton - Hidden on mobile */}
                        <div className="hidden lg:block">
                            <Skeleton className="h-96 w-full rounded-lg" />
                        </div>
                    </div>
                </PageLayout>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Fixed AppBar */}
            <AppBar />

            {/* Main Content with PageLayout System */}
            <PageLayout containerSize="lg" spacing="normal">
                
                <div className={`${LAYOUT.grid.cols3} ${SPACING.inline.lg}`}>
                    
                    {/* Main Feed - 2/3 width on desktop, full width on mobile */}
                    <div className={`lg:col-span-2 ${SPACING.stack.lg}`}>
                        
                        {/* Filter Chips Card */}
                        <Card className="border-border bg-card">
                            <CardHeader className="pb-3">
                                <div className={LAYOUT.flex.between}>
                                    <CardTitle className={`text-base font-semibold flex items-center ${SPACING.inline.sm}`}>
                                        <Filter className="h-4 w-4 text-primary" />
                                        <span>Filter Posts</span>
                                    </CardTitle>
                                    {selectedLabel && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedLabel(null)}
                                            className="h-8 text-xs"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="w-full">
                                    <div className={`flex ${SPACING.inline.sm} pb-2`}>
                                        <Badge
                                            variant={!selectedLabel ? "default" : "outline"}
                                            className="cursor-pointer whitespace-nowrap hover:scale-105 transition-transform text-xs"
                                            onClick={() => setSelectedLabel(null)}
                                        >
                                            All Posts
                                        </Badge>
                                        {allLabels.map((label, index) => (
                                            <Badge
                                                key={index}
                                                variant={selectedLabel === label ? "default" : "outline"}
                                                className="cursor-pointer whitespace-nowrap hover:scale-105 transition-transform text-xs"
                                                onClick={() => setSelectedLabel(label)}
                                            >
                                                {label}
                                            </Badge>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* Create Post Card */}
                        <CreatePost />

                        {/* Posts Feed */}
                        <div className={SPACING.stack.lg}>
                            {filteredPosts.length === 0 ? (
                                <Card className="border-border bg-card">
                                    <CardContent className={`py-12 text-center ${SPACING.stack.md}`}>
                                        <div className="text-4xl mb-4">🔭</div>
                                        <H3>No Posts Found</H3>
                                        <Body className="text-muted-foreground">
                                            {selectedLabel 
                                                ? `No posts with the "${selectedLabel}" label yet.`
                                                : "Be the first to share something!"
                                            }
                                        </Body>
                                    </CardContent>
                                </Card>
                            ) : (
                                filteredPosts.map((post) => (
                                    <Post key={post.id} post={post} showFollowButton={true} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - 1/3 width, hidden on mobile/tablet */}
                    <div className={`hidden lg:block ${SPACING.stack.lg}`}>
                        
                        {/* Trending Topics Card */}
                        <Card className="border-border bg-card top-20">
                            <CardHeader className="pb-3">
                                <CardTitle className={`text-base font-semibold flex items-center ${SPACING.inline.sm}`}>
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    <span>Trending Topics</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={SPACING.stack.sm}>
                                    {allLabels.length === 0 ? (
                                        <div className={`text-center py-4 ${SPACING.stack.sm}`}>
                                            <Small className="text-muted-foreground">
                                                No trending topics yet
                                            </Small>
                                        </div>
                                    ) : (
                                        allLabels.slice(0, 5).map((label, index) => {
                                            const count = postsData?.posts?.filter(
                                                (post) => post.labels.includes(label)
                                            ).length || 0;
                                            
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedLabel(label)}
                                                    className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors group"
                                                >
                                                    <div className={LAYOUT.flex.between}>
                                                        <Small className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                            {label}
                                                        </Small>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {count}
                                                        </Badge>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* People You May Know Card */}
                        <Card className="border-border bg-card">
                            <CardHeader className="pb-3">
                                <div className={SPACING.stack.xs}>
                                    <CardTitle className={`text-base font-semibold flex items-center ${SPACING.inline.sm}`}>
                                        <Users className="h-4 w-4 text-primary" />
                                        <span>People You May Know</span>
                                    </CardTitle>
                                    <Small className="text-muted-foreground">
                                        Based on your {profileData?.profile?.minor || 'interests'}
                                    </Small>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[500px] pr-4">
                                    {recommendedUsers.length === 0 ? (
                                        <div className={`text-center py-8 ${SPACING.stack.sm}`}>
                                            <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                                            <Small className="text-muted-foreground">
                                                No recommendations yet
                                            </Small>
                                        </div>
                                    ) : (
                                        <div className={SPACING.stack.sm}>
                                            {recommendedUsers.slice(0, 10).map((user) => (
                                                <User key={user.id} user={user} />
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </PageLayout>
        </div>
    );
}
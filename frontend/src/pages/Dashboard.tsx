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
import { Filter, TrendingUp, Users } from "lucide-react";

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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <div className="text-destructive text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            We couldn't load your dashboard. Please try refreshing the page.
                        </p>
                        <Button onClick={() => window.location.reload()}>
                            Refresh Page
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Loading Skeletons
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <AppBar />
                <div className="pt-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Feed Skeleton */}
                            <div className="lg:col-span-2 space-y-6">
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                            {/* Sidebar Skeleton */}
                            <div className="hidden lg:block">
                                <Skeleton className="h-96 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Fixed AppBar */}
            <AppBar />

            {/* Main Content */}
            <div className="pt-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Main Feed - 2/3 width */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Filter Chips */}
                            <Card className="border-border bg-card">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <Filter className="h-4 w-4 text-primary" />
                                            Filter Posts
                                        </CardTitle>
                                        {selectedLabel && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedLabel(null)}
                                                className="h-8 text-xs"
                                            >
                                                Clear Filter
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="w-full">
                                        <div className="flex gap-2 pb-2">
                                            <Badge
                                                variant={!selectedLabel ? "default" : "outline"}
                                                className="cursor-pointer whitespace-nowrap hover:scale-105 transition-transform"
                                                onClick={() => setSelectedLabel(null)}
                                            >
                                                All Posts
                                            </Badge>
                                            {allLabels.map((label, index) => (
                                                <Badge
                                                    key={index}
                                                    variant={selectedLabel === label ? "default" : "outline"}
                                                    className="cursor-pointer whitespace-nowrap hover:scale-105 transition-transform"
                                                    onClick={() => setSelectedLabel(label)}
                                                >
                                                    {label}
                                                </Badge>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {/* Create Post */}
                            <CreatePost />

                            {/* Posts Feed */}
                            <div className="space-y-6">
                                {filteredPosts.length === 0 ? (
                                    <Card className="border-border bg-card">
                                        <CardContent className="py-12 text-center">
                                            <div className="text-muted-foreground text-4xl mb-4">📭</div>
                                            <h3 className="text-lg font-semibold mb-2">No Posts Found</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedLabel 
                                                    ? `No posts with the "${selectedLabel}" label yet.`
                                                    : "Be the first to share something!"
                                                }
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    filteredPosts.map((post) => (
                                        <Post key={post.id} post={post} showFollowButton={true} />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Sidebar - 1/3 width */}
                        <div className="hidden lg:block space-y-6">
                            {/* Trending Section */}
                            <Card className="border-border bg-card top-20">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        Trending Topics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {allLabels.slice(0, 5).map((label, index) => {
                                            const count = postsData?.posts?.filter(
                                                (post) => post.labels.includes(label)
                                            ).length || 0;
                                            
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedLabel(label)}
                                                    className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                                            {label}
                                                        </span>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {count}
                                                        </Badge>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recommendations */}
                            <Card className="border-border bg-card">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        People You May Know
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Based on your {profileData?.profile?.minor || 'interests'}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[500px] pr-4">
                                        {recommendedUsers.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                                <p className="text-sm text-muted-foreground">
                                                    No recommendations yet
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
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
                </div>
            </div>
        </div>
    );
}
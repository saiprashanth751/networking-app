import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  GraduationCap,
  Link as LinkIcon,
  Loader2,
  ArrowLeft,
  Settings,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Post } from '../components/Post';
import { PageLayout } from '@/components/layout';
import { FollowListCompact } from '../components/FollowList';
import MessageBox from './MessageBox';

// Import React Query hooks
import { useCurrentProfile } from '@/hooks/queries/profile';
import { useCurrentUser } from '@/hooks/queries/user';
import { useCurrentUserPosts } from '@/hooks/queries/post';
import { useFollowers, useFollowing } from '@/hooks/queries/follow';

const UserProfilePage = () => {
    const navigate = useNavigate();
    const [leetCodeStats, setLeetCodeStats] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("posts");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Fetch all data
    const { data: profileData, isLoading: profileLoading, isError: profileError } = useCurrentProfile();
    const { data: userData, isLoading: userLoading } = useCurrentUser();
    const { data: postsData, isLoading: postsLoading } = useCurrentUserPosts();
    const { data: followersData, isLoading: followersLoading } = useFollowers();
    const { data: followingData, isLoading: followingLoading } = useFollowing();

    const profile = profileData?.profile;
    const user = userData?.user;
    const posts = postsData?.posts || [];
    const followerUsers = followersData?.followers || [];
    const followingUsers = followingData?.followingUsers || [];
    const isLoading = profileLoading || userLoading || postsLoading || followersLoading || followingLoading;

    // Fetch LeetCode stats
    const fetchLeetCodeStats = async (username: string) => {
        try {
            const response = await axios.get(`https://leetcard.jacoblin.cool/${username}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch LeetCode stats:", error);
            return null;
        }
    };

    useEffect(() => {
        if (profile?.leetcode) {
            fetchLeetCodeStats(profile.leetcode).then(setLeetCodeStats);
        }
    }, [profile?.leetcode]);

    const getUserInitials = () => {
        if (!user) return "U";
        return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    };

    if (profileError) {
        return (
            <PageLayout>
                <Card className="max-w-2xl mx-auto mt-8">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <h3 className="text-xl font-semibold mb-2">Failed to Load Profile</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            We couldn't load your profile. Please try again.
                        </p>
                        <Button onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </PageLayout>
        );
    }

    if (isLoading) {
        return (
            <PageLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading your profile...</p>
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout containerSize="lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Back Button */}
                    <Button
                        onClick={() => navigate('/dashboard')}
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>

                    {/* Hero Section */}
                    <Card className="overflow-hidden">
                        {/* Cover Photo */}
                        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />
                        
                        {/* Profile Info */}
                        <CardContent className="relative pt-0 pb-6">
                            {/* Avatar & Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16">
                                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                                        <AvatarImage 
                                            src={profile?.profilePic} 
                                            alt={`${user?.firstName} ${user?.lastName}`}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="text-3xl font-semibold bg-muted">
                                            {getUserInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="text-center sm:text-left mb-4">
                                        <h1 className="text-3xl font-bold">
                                            {user?.firstName} {user?.lastName}
                                        </h1>
                                        {profile?.department && (
                                            <p className="text-muted-foreground mt-1">
                                                {profile.department}
                                            </p>
                                        )}
                                        {profile?.minor && (
                                            <Badge variant="secondary" className="mt-2">
                                                Minor: {profile.minor}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Edit Button */}
                                <Button
                                    onClick={() => navigate('/updateprofile')}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Settings className="h-4 w-4" />
                                    Edit Profile
                                </Button>
                            </div>

                            <Separator className="my-6" />

                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold">{posts.length}</div>
                                    <div className="text-sm text-muted-foreground">Posts</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{followersData?.count || 0}</div>
                                    <div className="text-sm text-muted-foreground">Followers</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{followingData?.count || 0}</div>
                                    <div className="text-sm text-muted-foreground">Following</div>
                                </div>
                            </div>

                            {/* Bio */}
                            {profile?.bio && (
                                <>
                                    <Separator className="my-6" />
                                    <p className="text-foreground/90 leading-relaxed">
                                        {profile.bio}
                                    </p>
                                </>
                            )}

                            {/* Quick Info */}
                            <Separator className="my-6" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                {profile?.department && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Briefcase className="h-4 w-4" />
                                        <span>{profile.department}</span>
                                    </div>
                                )}
                                {profile?.graduationYear && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <GraduationCap className="h-4 w-4" />
                                        <span>Class of {profile.graduationYear}</span>
                                    </div>
                                )}
                                {profile?.linkedin && (
                                    <a
                                        href={profile.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-primary hover:underline"
                                    >
                                        <LinkIcon className="h-4 w-4" />
                                        <span>LinkedIn</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {profile?.github && (
                                    <a
                                        href={`https://github.com/${profile.github}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-primary hover:underline"
                                    >
                                        <LinkIcon className="h-4 w-4" />
                                        <span>GitHub</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabbed Content */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="posts">Your Posts ({posts.length})</TabsTrigger>
                            <TabsTrigger value="stats">Platform Stats</TabsTrigger>
                            <TabsTrigger value="about">About</TabsTrigger>
                        </TabsList>

                        {/* Posts Tab */}
                        <TabsContent value="posts" className="space-y-6 mt-6">
                            {posts.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                        <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Share your first post with your network!
                                        </p>
                                        <Button onClick={() => navigate('/dashboard')}>
                                            Create Post
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                posts.map((post) => <Post key={post.id} post={post} showFollowButton={false} />)
                            )}
                        </TabsContent>

                        {/* Stats Tab */}
                        <TabsContent value="stats" className="space-y-6 mt-6">
                            {!profile?.leetcode && !profile?.github && !profile?.codeforces && !profile?.geekforgeeks ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <h3 className="text-lg font-medium mb-2">No platform stats yet</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Add your coding profiles to display stats
                                        </p>
                                        <Button onClick={() => navigate('/updateprofile')}>
                                            Add Profiles
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {profile?.leetcode && leetCodeStats && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <span className="text-orange-500">LeetCode</span>
                                                    <Badge variant="outline">@{profile.leetcode}</Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <img
                                                    src={`data:image/svg+xml;utf8,${encodeURIComponent(leetCodeStats)}`}
                                                    alt="LeetCode Stats"
                                                    className="w-full rounded-lg"
                                                />
                                            </CardContent>
                                        </Card>
                                    )}
                                    {profile?.geekforgeeks && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <span className="text-green-500">GeeksforGeeks</span>
                                                    <Badge variant="outline">@{profile.geekforgeeks}</Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <img
                                                    src={`https://gfgstatscard.vercel.app/${profile.geekforgeeks}`}
                                                    alt="GeeksforGeeks Stats"
                                                    className="w-full rounded-lg"
                                                />
                                            </CardContent>
                                        </Card>
                                    )}
                                    {profile?.codeforces && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <span className="text-blue-500">Codeforces</span>
                                                    <Badge variant="outline">@{profile.codeforces}</Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <img
                                                    src={`https://codeforces-readme-stats.vercel.app/api/card?username=${profile.codeforces}`}
                                                    alt="Codeforces Stats"
                                                    className="w-full rounded-lg"
                                                />
                                            </CardContent>
                                        </Card>
                                    )}
                                    {profile?.github && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    GitHub
                                                    <Badge variant="outline">@{profile.github}</Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <img
                                                    src={`https://github-readme-stats.vercel.app/api?username=${profile.github}&show_icons=true&theme=dark&hide_border=true`}
                                                    alt="GitHub Stats"
                                                    className="w-full rounded-lg"
                                                />
                                                <img
                                                    src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${profile.github}&layout=compact&theme=dark&hide_border=true`}
                                                    alt="Top Languages"
                                                    className="w-full rounded-lg"
                                                />
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )}
                        </TabsContent>

                        {/* About Tab */}
                        <TabsContent value="about" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>About</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {profile?.bio && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Bio</h4>
                                            <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                                        </div>
                                    )}
                                    <Separator />
                                    <div>
                                        <h4 className="font-semibold mb-3">Education</h4>
                                        <div className="space-y-2">
                                            {profile?.department && (
                                                <p className="text-muted-foreground">
                                                    <strong>Major:</strong> {profile.department}
                                                </p>
                                            )}
                                            {profile?.minor && (
                                                <p className="text-muted-foreground">
                                                    <strong>Minor:</strong> {profile.minor}
                                                </p>
                                            )}
                                            {profile?.graduationYear && (
                                                <p className="text-muted-foreground">
                                                    <strong>Graduation:</strong> {profile.graduationYear}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Sidebar - 1/3 width */}
                <div className="hidden lg:block space-y-6">
                    {/* Message Box or Followers/Following */}
                    {selectedUserId ? (
                        <MessageBox 
                            receiverId={selectedUserId} 
                            onClose={() => setSelectedUserId(null)} 
                        />
                    ) : (
                        <>
                            <FollowListCompact
                                title="Followers"
                                users={followerUsers}
                                count={followersData?.count || 0}
                                onMessageClick={setSelectedUserId}
                            />
                            <FollowListCompact
                                title="Following"
                                users={followingUsers}
                                count={followingData?.count || 0}
                                onMessageClick={setSelectedUserId}
                            />
                        </>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default UserProfilePage;
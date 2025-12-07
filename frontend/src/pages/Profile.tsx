import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  MessageSquare,
  User as UserIcon,
  Loader2,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { Post } from '../components/Post';
import { PageLayout } from '@/components/layout';

// Import React Query hooks
import { useProfile } from '@/hooks/queries/profile';
import { useUser } from '@/hooks/queries/user';
import { useUserPosts } from '@/hooks/queries/post';
import { useFollowStatus, useFollowersByUserId, useFollowingByUserId } from '@/hooks/queries/follow';
import { useToggleFollow } from '@/hooks/mutations/follow';
import { FollowList } from '../components/FollowList';

const ProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [leetCodeStats, setLeetCodeStats] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("posts");

    // Fetch all data
    const { data: profileData, isLoading: profileLoading, isError: profileError } = useProfile(id || '', { enabled: !!id });
    const { data: userData, isLoading: userLoading } = useUser(id || '', { enabled: !!id });
    const { data: postsData, isLoading: postsLoading } = useUserPosts(id || '', { enabled: !!id });
    const { data: followStatus, isLoading: followStatusLoading } = useFollowStatus(id || '', { enabled: !!id });
    const { data: followersData } = useFollowersByUserId(id || '', { enabled: !!id });
    const { data: followingData } = useFollowingByUserId(id || '', { enabled: !!id });
    const { toggleFollow, isLoading: isToggling } = useToggleFollow(id || '', followStatus?.following || false);

    const profile = profileData?.profile;
    const user = userData?.user;
    const posts = postsData?.posts || [];
    const isFollowing = followStatus?.following || false;
    const isLoading = profileLoading || userLoading || postsLoading || followStatusLoading;

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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/signin');
    }, [navigate]);

    const getUserInitials = () => {
        return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
    };

    if (profileError) {
        return (
            <PageLayout>
                <Card className="max-w-2xl mx-auto mt-8">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <UserIcon className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Profile Not Found</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            The profile you're looking for doesn't exist or has been removed.
                        </p>
                        <Button onClick={() => navigate('/dashboard')}>
                            Return to Dashboard
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
                        <p className="text-muted-foreground">Loading profile...</p>
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout containerSize="lg">
            {/* Back Button */}
            <Button
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                size="sm"
                className="mb-4 gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Button>

            {/* Hero Section */}
            <Card className="overflow-hidden mb-6">
                {/* Cover Photo */}
                <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />
                
                {/* Profile Info */}
                <CardContent className="relative pt-0 pb-6">
                    {/* Avatar */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 sm:-mt-20">
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

                        {/* Action Buttons */}
                        <div className="flex gap-2 justify-center sm:justify-start">
                            <Button
                                onClick={toggleFollow}
                                disabled={isToggling}
                                variant={isFollowing ? "outline" : "default"}
                                className="gap-2"
                            >
                                {isToggling ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    isFollowing ? "Following" : "Follow"
                                )}
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Message
                            </Button>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold">{posts.length}</div>
                            <div className="text-sm text-muted-foreground">Posts</div>
                        </div>
                        <FollowList
                            title="Followers"
                            users={followersData?.followers || []}
                            count={followersData?.count || 0}
                            onMessageClick={() => {}}
                        />
                        <FollowList
                            title="Following"
                            users={followingData?.followingUsers || []}
                            count={followingData?.count || 0}
                            onMessageClick={() => {}}
                        />
                        <div>
                            <div className="text-2xl font-bold">-</div>
                            <div className="text-sm text-muted-foreground">Engagement</div>
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
                    <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
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
                                <p className="text-sm text-muted-foreground">
                                    {user?.firstName} hasn't shared anything yet.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        posts.map((post) => <Post key={post.id} post={post} showFollowButton={false} />)
                    )}
                </TabsContent>

                {/* Stats Tab */}
                <TabsContent value="stats" className="space-y-6 mt-6">
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
        </PageLayout>
    );
};

export default ProfilePage;
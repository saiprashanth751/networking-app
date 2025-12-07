import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Briefcase, 
  GraduationCap,
  Link as LinkIcon,
  Loader2,
  ArrowLeft,
  Settings,
  ExternalLink,
  MessageSquare,
  Users,
  FileText,
} from "lucide-react";
import { Post } from '../components/Post';
import { FollowList } from '../components/FollowList';
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
    const { data: followersData } = useFollowers();
    const { data: followingData } = useFollowing();

    const profile = profileData?.profile;
    const user = userData?.user;
    const posts = postsData?.posts || [];
    const followers = followersData?.followers || [];
    const following = followingData?.followingUsers || [];
    const isLoading = profileLoading || userLoading || postsLoading;

    // Fetch LeetCode stats
    const fetchLeetCodeStats = async (username: string) => {
        try {
            const response = await axios.get(`https://leetcard.jacoblin.cool/${username}`);
            return response.data;
        } catch (error) {
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
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">Failed to Load Profile</h3>
                        <p className="text-sm text-muted-foreground text-center mb-6">
                            We couldn't load your profile. Please try again.
                        </p>
                        <Button onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header with back button */}
            <div className="border-b bg-card">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
                    <Button
                        onClick={() => navigate('/dashboard')}
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
                <Card className="overflow-hidden mb-6">
                    {/* Cover Photo */}
                    <div className="h-48 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10" />
                    
                    {/* Profile Content */}
                    <CardContent className="px-6 pb-6">
                        {/* Avatar and Actions Row */}
                        <div className="flex flex-col sm:flex-row gap-6 -mt-20 mb-6">
                            {/* Avatar */}
                            <Avatar className="h-40 w-40 border-4 border-background shadow-xl shrink-0">
                                <AvatarImage 
                                    src={profile?.profilePic} 
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-4xl font-bold bg-muted">
                                    {getUserInitials()}
                                </AvatarFallback>
                            </Avatar>

                            {/* Name and Actions */}
                            <div className="flex-1 flex flex-col justify-end pb-2">
                                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold mb-1">
                                            {user?.firstName} {user?.lastName}
                                        </h1>
                                        {profile?.department && (
                                            <p className="text-lg text-muted-foreground mb-2">
                                                {profile.department}
                                            </p>
                                        )}
                                        {profile?.minor && (
                                            <Badge variant="secondary" className="text-xs">
                                                Minor: {profile.minor}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Edit Button */}
                                    <Button
                                        onClick={() => navigate('/updateprofile')}
                                        variant="outline"
                                        size="lg"
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="grid grid-cols-4 gap-4 py-4 border-y">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{posts.length}</div>
                                <div className="text-sm text-muted-foreground">Posts</div>
                            </div>
                            
                            <FollowList
                                title="Followers"
                                users={followers}
                                count={followersData?.count || 0}
                                onMessageClick={setSelectedUserId}
                            />
                            
                            <FollowList
                                title="Following"
                                users={following}
                                count={followingData?.count || 0}
                                onMessageClick={setSelectedUserId}
                            />
                            
                            <div className="text-center">
                                <div className="text-2xl font-bold">-</div>
                                <div className="text-sm text-muted-foreground">Likes</div>
                            </div>
                        </div>

                        {/* Bio */}
                        {profile?.bio && (
                            <div className="py-6">
                                <p className="text-base text-foreground/90 leading-relaxed">
                                    {profile.bio}
                                </p>
                            </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                            {profile?.department && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{profile.department}</span>
                                </div>
                            )}
                            {profile?.graduationYear && (
                                <div className="flex items-center gap-2 text-sm">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Class of {profile.graduationYear}</span>
                                </div>
                            )}
                            {profile?.linkedin && (
                                <a
                                    href={profile.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-primary hover:underline"
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
                                    className="flex items-center gap-2 text-sm text-primary hover:underline"
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="w-full sm:w-auto">
                        <TabsTrigger value="posts" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Posts ({posts.length})
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="gap-2">
                            <Users className="h-4 w-4" />
                            Stats
                        </TabsTrigger>
                    </TabsList>

                    {/* Posts Tab */}
                    <TabsContent value="posts" className="space-y-6">
                        {posts.length === 0 ? (
                            <Card>
                                <CardContent className="py-16 text-center">
                                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Share your first post with your network!
                                    </p>
                                    <Button onClick={() => navigate('/dashboard')}>
                                        Create Your First Post
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            posts.map((post) => <Post key={post.id} post={post} showFollowButton={false} />)
                        )}
                    </TabsContent>

                    {/* Stats Tab */}
                    <TabsContent value="stats" className="space-y-6">
                        {!profile?.leetcode && !profile?.github && !profile?.codeforces && !profile?.geekforgeeks ? (
                            <Card>
                                <CardContent className="py-16 text-center">
                                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <h3 className="text-lg font-semibold mb-2">No Platform Stats</h3>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Add your coding profiles to showcase your achievements
                                    </p>
                                    <Button onClick={() => navigate('/updateprofile')}>
                                        Add Coding Profiles
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {profile?.leetcode && leetCodeStats && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <span className="text-orange-500">LeetCode</span>
                                                <Badge variant="outline" className="text-xs">@{profile.leetcode}</Badge>
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
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <span className="text-green-500">GeeksforGeeks</span>
                                                <Badge variant="outline" className="text-xs">@{profile.geekforgeeks}</Badge>
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
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <span className="text-blue-500">Codeforces</span>
                                                <Badge variant="outline" className="text-xs">@{profile.codeforces}</Badge>
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
                                    <Card className="lg:col-span-2">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                GitHub
                                                <Badge variant="outline" className="text-xs">@{profile.github}</Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Message Dialog */}
            <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] p-0">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Messages</DialogTitle>
                    </DialogHeader>
                    {selectedUserId && (
                        <div className="h-[600px]">
                            <MessageBox 
                                receiverId={selectedUserId} 
                                onClose={() => setSelectedUserId(null)} 
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserProfilePage;
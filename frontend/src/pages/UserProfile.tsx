import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Briefcase,
    GraduationCap,
    Link as LinkIcon,
    Loader2,
    MessageSquare,
    Users,
    ArrowLeft,
    Search,
} from "lucide-react";
import { PostCard } from '@/components/posts/PostCard';
import { FollowList } from '@/components/FollowList';
import MessageBox from '@/pages/MessageBox';
import { H2, Body, Small } from '@/components/ui/typography';
import { useCurrentProfile } from '@/hooks/queries/profile';
import { useCurrentUser } from '@/hooks/queries/user';
import { useCurrentUserPosts } from '@/hooks/queries/post';
import { useCurrentUserProjects } from '@/hooks/queries/project';
import { ProjectList } from '@/components/projects/ProjectList';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import { useFollowers, useFollowing } from '@/hooks/queries/follow';

const UserProfilePage = () => {
    const navigate = useNavigate();
    const [leetCodeStats, setLeetCodeStats] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("posts");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [createProjectOpen, setCreateProjectOpen] = useState(false);

    // Fetch all data
    const { data: profileData, isLoading: profileLoading, isError: profileError } = useCurrentProfile();
    const { data: userData, isLoading: userLoading } = useCurrentUser();
    const { data: postsData, isLoading: postsLoading } = useCurrentUserPosts();
    const { data: followersData } = useFollowers();
    const { data: followingData } = useFollowing();
    const { data: projectsData, isLoading: projectsLoading } = useCurrentUserProjects();

    const projects = projectsData?.projects || [];
    const profile = profileData?.profile;
    const user = userData?.user;
    const posts = postsData?.posts || [];
    const followers = followersData?.followers || [];
    const following = followingData?.following || [];
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
            <div className="flex items-center justify-center min-h-screen px-4">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center space-y-4">
                        <Users className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                        <H2>Failed to Load Profile</H2>
                        <Body className="text-muted-foreground">
                            We couldn't load your profile. Please try again.
                        </Body>
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
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <Body className="text-muted-foreground">Loading your profile...</Body>
            </div>
        );
    }

    return (
        <>
            {/* Sticky Header - X Style */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-neutral-800">
                <div className="flex items-center gap-8 px-4 h-[53px]">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="hover:bg-neutral-900 rounded-full p-2 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-xl">{user?.firstName} {user?.lastName}</h1>
                        <span className="text-neutral-500 text-[13px]">{posts.length} posts</span>
                    </div>
                    <button className="ml-auto hover:bg-neutral-900 rounded-full p-2 transition-colors">
                        <Search className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Profile Header */}
            <div>
                {/* Banner */}
                <div className="h-[200px] bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10" />

                {/* Profile Info Section */}
                <div className="px-4 pb-4">
                    {/* Profile Picture & Edit Button */}
                    <div className="flex justify-between items-end -mt-16 mb-3">
                        <Avatar className="h-[133px] w-[133px] border-4 border-black shadow-xl">
                            <AvatarImage
                                src={profile?.profilePic}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-4xl font-bold bg-muted">
                                {getUserInitials()}
                            </AvatarFallback>
                        </Avatar>

                        <Button
                            onClick={() => navigate('/updateprofile')}
                            variant="outline"
                            className="mb-3 rounded-full border-neutral-600 bg-transparent hover:bg-neutral-900 text-white font-bold px-4 h-9"
                        >
                            Edit profile
                        </Button>
                    </div>

                    {/* Name and Info */}
                    <div className="mb-1">
                        <div className="flex items-center gap-1 mb-0.5">
                            <h2 className="font-bold text-xl">{user?.firstName} {user?.lastName}</h2>
                        </div>
                        <span className="text-neutral-500 text-[15px]">
                            @{user?.firstName?.toLowerCase() || 'user'}
                        </span>
                    </div>

                    {profile?.bio && (
                        <div className="mb-3">
                            <p className="text-[15px] leading-5">{profile.bio}</p>
                        </div>
                    )}

                    {/* Info Pills */}
                    <div className="flex flex-wrap items-center gap-3 mb-3 text-neutral-500 text-[15px]">
                        {profile?.department && (
                            <div className="flex items-center gap-1">
                                <Briefcase className="h-[18px] w-[18px]" />
                                <span>{profile.department}</span>
                            </div>
                        )}
                        {profile?.graduationYear && (
                            <div className="flex items-center gap-1">
                                <GraduationCap className="h-[18px] w-[18px]" />
                                <span>Class of {profile.graduationYear}</span>
                            </div>
                        )}
                        {profile?.linkedin && (
                            <a
                                href={profile.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-500 hover:underline"
                            >
                                <LinkIcon className="h-[18px] w-[18px]" />
                                <span>LinkedIn</span>
                            </a>
                        )}
                        {profile?.github && (
                            <a
                                href={`https://github.com/${profile.github}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-500 hover:underline"
                            >
                                <LinkIcon className="h-[18px] w-[18px]" />
                                <span>GitHub</span>
                            </a>
                        )}
                    </div>

                    {/* Following/Followers */}
                    <div className="flex items-center gap-5 text-[14px]">
                        <FollowList
                            title="Following"
                            users={following}
                            count={followingData?.count || 0}
                            onMessageClick={setSelectedUserId}
                        />
                        <FollowList
                            title="Followers"
                            users={followers}
                            count={followersData?.count || 0}
                            onMessageClick={setSelectedUserId}
                        />
                    </div>
                </div>

                {/* Tabs */}
                {/* Find the Tabs section and update */}
                <div className="border-b border-neutral-800">
                    <div className="flex">
                        <TabItem
                            label="Posts"
                            active={activeTab === "posts"}
                            onClick={() => setActiveTab("posts")}
                        />
                        <TabItem
                            label="Projects"
                            active={activeTab === "projects"}
                            onClick={() => setActiveTab("projects")}
                        />
                        <TabItem
                            label="Stats"
                            active={activeTab === "stats"}
                            onClick={() => setActiveTab("stats")}
                        />
                    </div>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === "posts" && (
                        <div className="divide-y divide-neutral-800">
                            {posts.length === 0 ? (
                                <div className="px-4 py-16 text-center space-y-4">
                                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                                    <H2>No Posts Yet</H2>
                                    <Body className="text-muted-foreground">
                                        Share your first post with your network!
                                    </Body>
                                    <Button onClick={() => navigate('/dashboard')}>
                                        Create Your First Post
                                    </Button>
                                </div>
                            ) : (
                                posts.map((post) => <PostCard key={post.id} post={post} />)
                            )}
                        </div>
                    )}

                    {activeTab === "projects" && (
                        <>
                            <ProjectList
                                projects={projects}
                                showActions={true}
                                emptyStateAction={() => setCreateProjectOpen(true)}
                            />

                            <ProjectFormDialog
                                open={createProjectOpen}
                                onOpenChange={setCreateProjectOpen}
                            />
                        </>
                    )}

                    {activeTab === "stats" && (
                        <>
                            {!profile?.leetcode && !profile?.github && !profile?.codeforces && !profile?.geekforgeeks ? (
                                <div className="px-4 py-16 text-center space-y-4">
                                    <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                                    <H2>No Platform Stats</H2>
                                    <Body className="text-muted-foreground">
                                        Add your coding profiles to showcase your achievements
                                    </Body>
                                    <Button onClick={() => navigate('/updateprofile')}>
                                        Add Coding Profiles
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {profile?.leetcode && leetCodeStats && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base flex items-center gap-2">
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
                                                <CardTitle className="text-base flex items-center gap-2">
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
                                                <CardTitle className="text-base flex items-center gap-2">
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
                                        <Card className="md:col-span-2">
                                            <CardHeader>
                                                <CardTitle className="text-base flex items-center gap-2">
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
                        </>
                    )}
                </div>
            </div>

            {/* Message Dialog */}
            <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] p-0">
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
        </>
    );
};

// Tab Item Component
function TabItem({ label, active = false, onClick }: { label: string; active?: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
                flex-1 px-4 py-4 hover:bg-neutral-900/50 transition-colors relative
                ${active ? 'font-bold' : 'text-neutral-500'}
            `}
        >
            {label}
            {active && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full" />
            )}
        </button>
    );
}

export default UserProfilePage;
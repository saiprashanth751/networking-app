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
    Github,
} from "lucide-react";
import { PostCard } from '@/components/posts/PostCard';
import { FollowList } from '@/components/FollowList';
import MessageBox from '@/pages/MessageBox';
import { MutualConnections } from '@/components/profile/MutualConnections';
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
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-neutral-800/30">
                <div className="flex items-center gap-4 px-6 h-14">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="hover:bg-neutral-800 rounded-full p-2 transition-all duration-150"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg">{user?.firstName} {user?.lastName}</h1>
                        <span className="text-muted-foreground text-xs">{posts.length} posts</span>
                    </div>
                </div>
            </div>

            {/* Banner */}
            <div className="h-[200px] bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-pink-600/10" />

            {/* Profile Content - Centered */}
            <div className="max-w-[800px] mx-auto px-4">
                {/* Avatar */}
                <div className="-mt-16 mb-4 flex flex-col items-start">
                    <Avatar className="h-[140px] w-[140px] border-4 border-background ring-2 ring-neutral-800/50 shadow-xl mb-4">
                        <AvatarImage src={profile?.profilePic} className="object-cover" />
                        <AvatarFallback className="text-4xl font-bold bg-neutral-800">
                            {getUserInitials()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Name immediately under avatar */}
                    <div>
                        <h2 className="font-bold text-2xl mb-1">{user?.firstName} {user?.lastName}</h2>
                        <span className="text-muted-foreground text-sm">@{user?.firstName?.toLowerCase() || 'user'}</span>
                    </div>
                </div>

                {/* Profile Info Card */}
                <div className="mb-6 rounded-xl border border-neutral-800/50 p-6 bg-neutral-900/20">
                    {/* Bio */}
                    {profile?.bio && (
                        <p className="text-sm leading-relaxed text-foreground/90 mb-4 pb-4 border-b border-neutral-800/50">{profile.bio}</p>
                    )}

                    {/* Info Pills */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-muted-foreground text-sm">
                        {profile?.department && (
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="h-4 w-4" />
                                <span>{profile.department}</span>
                            </div>
                        )}
                        {profile?.graduationYear && (
                            <div className="flex items-center gap-1.5">
                                <GraduationCap className="h-4 w-4" />
                                <span>Class of {profile.graduationYear}</span>
                            </div>
                        )}
                    </div>

                    {/* Social Links */}
                    {(profile?.linkedin || profile?.github) && (
                        <div className="flex flex-wrap gap-3 mb-4">
                            {profile?.linkedin && (
                                <a
                                    href={profile.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-blue-500 hover:text-blue-400 text-sm transition-colors duration-150"
                                >
                                    <LinkIcon className="h-4 w-4" />
                                    <span>LinkedIn</span>
                                </a>
                            )}
                            {profile?.github && (
                                <a
                                    href={`https://github.com/${profile.github}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-blue-500 hover:text-blue-400 text-sm transition-colors duration-150"
                                >
                                    <Github className="h-4 w-4" />
                                    <span>GitHub</span>
                                </a>
                            )}
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="flex items-center gap-6 pt-4 border-t border-neutral-800/50">
                        <FollowList
                            title="Following"
                            users={following}
                            count={followingData?.count || 0}
                            showUnfollowButton={true}
                        />
                        <FollowList
                            title="Followers"
                            users={followers}
                            count={followersData?.count || 0}
                            showRemoveButton={true}
                        />
                        <div className="text-sm">
                            <span className="font-bold text-foreground">{posts.length}</span>
                            <span className="text-muted-foreground ml-1">Posts</span>
                        </div>
                        <div className="text-sm">
                            <span className="font-bold text-foreground">{projects.length}</span>
                            <span className="text-muted-foreground ml-1">Projects</span>
                        </div>
                    </div>
                </div>

                {/* Pill Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-neutral-900/50 rounded-full border border-neutral-800/50">
                    <TabPill
                        label="Posts"
                        active={activeTab === "posts"}
                        onClick={() => setActiveTab("posts")}
                    />
                    <TabPill
                        label="Projects"
                        active={activeTab === "projects"}
                        onClick={() => setActiveTab("projects")}
                    />
                    <TabPill
                        label="Stats"
                        active={activeTab === "stats"}
                        onClick={() => setActiveTab("stats")}
                    />
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === "posts" && (
                        <div>
                            {posts.length === 0 ? (
                                <div className="px-4 py-16 text-center space-y-4 rounded-xl border border-neutral-800/50 bg-neutral-900/20">
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
                                <div className="px-4 py-16 text-center space-y-4 rounded-xl border border-neutral-800/50 bg-neutral-900/20">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {profile?.leetcode && leetCodeStats && (
                                        <Card className="border-neutral-800/50">
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
                                        <Card className="border-neutral-800/50">
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
                                        <Card className="border-neutral-800/50">
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
                                        <Card className="md:col-span-2 border-neutral-800/50">
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

// Pill Tab Component
function TabPill({ label, active = false, onClick }: { label: string; active?: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
                flex-1 px-6 py-2 rounded-full font-medium text-sm transition-all duration-150
                ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-neutral-800'
                }
            `}
        >
            {label}
        </button>
    );
}

export default UserProfilePage;
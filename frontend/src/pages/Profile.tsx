import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Briefcase,
    GraduationCap,
    Link as LinkIcon,
    MessageSquare,
    User as UserIcon,
    Loader2,
    ExternalLink,
    ArrowLeft,
    Search,
    Calendar,
} from "lucide-react";
import { Post } from '../components/Post';
import { H2, Body, Small, Caption } from '@/components/ui/typography';
import { useProfile } from '@/hooks/queries/profile';
import { useUser } from '@/hooks/queries/user';
import { useUserPosts } from '@/hooks/queries/post';
import { useFollowStatus, useFollowersByUserId, useFollowingByUserId } from '@/hooks/queries/follow';
import { useToggleFollow } from '@/hooks/mutations/follow';
import { useUserProjects } from '@/hooks/queries/project';
import { ProjectList } from '../components/ProjectList';
import { FollowList } from '../components/FollowList'
import { ProjectFormDialog } from '../components/ProjectFormDialog';

const ProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [leetCodeStats, setLeetCodeStats] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("posts");

    // Fetch all data
    const { data: userData, isLoading: userLoading } = useUser(id || '', { enabled: !!id });
    const { data: profileData, isLoading: profileLoading, isError: profileError } = useProfile(id || '', { enabled: !!id });
    const { data: postsData, isLoading: postsLoading } = useUserPosts(id || '', { enabled: !!id });
    const { data: followStatus, isLoading: followStatusLoading } = useFollowStatus(id || '', { enabled: !!id });
    const { data: followersData } = useFollowersByUserId(id || '', { enabled: !!id });
    const { data: followingData } = useFollowingByUserId(id || '', { enabled: !!id });
    const { toggleFollow, isLoading: isToggling } = useToggleFollow(id || '', followStatus?.following || false);
    const { data: projectsData, isLoading: projectsLoading } = useUserProjects(id || '', { enabled: !!id });

    const profile = profileData?.profile;
    const user = userData?.user;
    const posts = postsData?.posts || [];
    const isFollowing = followStatus?.following || false;
    const isLoading = profileLoading || userLoading || postsLoading || followStatusLoading;
    const projects = projectsData?.projects || [];

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
        return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
    };

    if (profileError) {
        return (
            <div className="flex items-center justify-center min-h-screen px-4">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center space-y-4">
                        <UserIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                        <H2>Profile Not Found</H2>
                        <Body className="text-muted-foreground">
                            The profile you're looking for doesn't exist or has been removed.
                        </Body>
                        <Button onClick={() => navigate('/dashboard')}>
                            Return to Dashboard
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
                <Body className="text-muted-foreground">Loading profile...</Body>
            </div>
        );
    }

    return (
        <>
            {/* Sticky Header - X Style */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-neutral-800">
                <div className="flex items-center gap-8 px-4 h-[53px]">
                    <button
                        onClick={() => navigate(-1)}
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
                <div className="h-[200px] bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />

                {/* Profile Info Section */}
                <div className="px-4 pb-4">
                    {/* Profile Picture & Actions */}
                    <div className="flex justify-between items-end -mt-16 mb-4">
                        <Avatar className="h-[133px] w-[133px] border-4 border-black shadow-xl">
                            <AvatarImage
                                src={profile?.profilePic}
                                alt={`${user?.firstName} ${user?.lastName}`}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-4xl font-bold bg-muted">
                                {getUserInitials()}
                            </AvatarFallback>
                        </Avatar>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mb-3">
                            <Button
                                onClick={toggleFollow}
                                disabled={isToggling}
                                variant={isFollowing ? "outline" : "default"}
                                className="rounded-full font-bold px-4 h-9"
                            >
                                {isToggling ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    isFollowing ? "Following" : "Follow"
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-full font-bold px-4 h-9"
                            >
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Name and Bio */}
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
                            users={followingData?.following || []}
                            count={followingData?.count || 0}
                            onMessageClick={() => { }} // Keep empty since it's another user's profile
                        />
                        <FollowList
                            title="Followers"
                            users={followersData?.followers || []}
                            count={followersData?.count || 0}
                            onMessageClick={() => { }} // Keep empty since it's another user's profile
                        />
                    </div>
                </div>

                {/* Tabs */}
                {/* Find the Tabs section and add this TabItem */}
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
                        <TabItem
                            label="About"
                            active={activeTab === "about"}
                            onClick={() => setActiveTab("about")}
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
                                    <H2>No posts yet</H2>
                                    <Body className="text-muted-foreground">
                                        {user?.firstName} hasn't shared anything yet.
                                    </Body>
                                </div>
                            ) : (
                                posts.map((post) => <Post key={post.id} post={post} showFollowButton={false} />)
                            )}
                        </div>
                    )}

                    {activeTab === "projects" && (
                        <ProjectList
                            projects={projects}
                            showActions={false}
                        />
                    )}

                    {activeTab === "stats" && (
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

                    {activeTab === "about" && (
                        <div className="p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>About</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {profile?.bio && (
                                        <div>
                                            <Small className="font-semibold mb-2 block">Bio</Small>
                                            <Body className="text-muted-foreground leading-relaxed">{profile.bio}</Body>
                                        </div>
                                    )}
                                    <div className="h-px bg-border" />
                                    <div>
                                        <Small className="font-semibold mb-3 block">Education</Small>
                                        <div className="space-y-2">
                                            {profile?.department && (
                                                <Body className="text-muted-foreground">
                                                    <strong>Major:</strong> {profile.department}
                                                </Body>
                                            )}
                                            {profile?.minor && (
                                                <Body className="text-muted-foreground">
                                                    <strong>Minor:</strong> {profile.minor}
                                                </Body>
                                            )}
                                            {profile?.graduationYear && (
                                                <Body className="text-muted-foreground">
                                                    <strong>Graduation:</strong> {profile.graduationYear}
                                                </Body>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
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

export default ProfilePage;
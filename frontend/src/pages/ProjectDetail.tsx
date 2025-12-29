import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ArrowLeft,
    Github,
    ExternalLink,
    Play,
    Calendar,
    Star,
    MoreHorizontal,
    Edit,
    Trash2,
    Share2,
    Loader2,
    Briefcase,
    Code,
    FileText,
    User,
} from "lucide-react";
import { useProject } from '@/hooks/queries/project';
import { useCurrentUser } from '@/hooks/queries/user';
import { useDeleteProject, useToggleFeaturedProject } from '@/hooks/mutations/project';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import { H2, Body } from '@/components/ui/typography';

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { data: projectData, isLoading, isError } = useProject(id || '');
    const { data: currentUserData } = useCurrentUser();
    const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject({
        onSuccess: () => {
            navigate('/userprofile');
        },
    });
    const { mutate: toggleFeatured } = useToggleFeaturedProject(id || '');

    const project = projectData?.project;
    const currentUserId = currentUserData?.user?.id;
    const isOwner = currentUserId === project?.userId;
    const profileURL = isOwner ? "userprofile" : `profile/${project?.user.id}`;

    const allImages = project?.coverImage
        ? [project.coverImage, ...(project.images || [])]
        : project?.images || [];

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Present';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'in-progress':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default:
                return 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20';
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: project?.title,
                    text: project?.tagline || project?.description,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const handleDelete = () => {
        if (id) {
            deleteProject(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <Body className="text-muted-foreground">Loading project...</Body>
            </div>
        );
    }

    if (isError || !project) {
        return (
            <div className="flex items-center justify-center min-h-screen px-4">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center space-y-4">
                        <Briefcase className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                        <H2>Project Not Found</H2>
                        <Body className="text-muted-foreground">
                            The project you're looking for doesn't exist or has been removed.
                        </Body>
                        <Button onClick={() => navigate(-1)}>Go Back</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="flex items-center justify-between px-6 h-14">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="h-8 w-8"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground line-clamp-1">
                                {project.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {project.user.firstName} {project.user.lastName}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleShare} className="h-8 w-8">
                            <Share2 className="h-4 w-4" />
                        </Button>

                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => toggleFeatured()}>
                                        <Star className="mr-2 h-4 w-4" />
                                        {project.featured ? 'Unfeature' : 'Feature'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setDeleteDialogOpen(true)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                {/* Title and Meta */}
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-foreground mb-2 leading-tight">
                                {project.title}
                            </h1>
                            {project.tagline && (
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {project.tagline}
                                </p>
                            )}
                        </div>
                        {project.featured && (
                            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 gap-1.5 px-3 py-1 flex-shrink-0">
                                <Star className="h-3 w-3 fill-current" />
                                Featured
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {formatDate(project.startDate)} - {formatDate(project.endDate)}
                            </span>
                        </div>
                        <Badge variant="outline" className={getStatusColor(project.status)}>
                            {project.status}
                        </Badge>
                    </div>
                </div>

                {/* Image Gallery */}
                {allImages.length > 0 && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                                <img
                                    src={allImages[selectedImageIndex]}
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {allImages.length > 1 && (
                                <div className="flex gap-2 p-4 border-t border-border overflow-x-auto">
                                    {allImages.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${selectedImageIndex === index
                                                    ? 'border-blue-600'
                                                    : 'border-border opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`View ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Tabbed Content */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 h-10">
                        <TabsTrigger value="overview" className="text-sm">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="tech" className="text-sm">
                            Tech Stack
                        </TabsTrigger>
                        <TabsTrigger value="author" className="text-sm">
                            Author
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        {/* Description */}
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-foreground">
                                        About This Project
                                    </h2>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {project.description}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Links */}
                        {(project.repositoryUrl || project.liveUrl || project.demoVideoUrl) && (
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <ExternalLink className="h-5 w-5 text-emerald-600" />
                                        <h2 className="text-lg font-semibold text-foreground">
                                            Project Links
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {project.repositoryUrl && (
                                            <a
                                                href={project.repositoryUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                <Github className="h-4 w-4" />
                                                Source Code
                                            </a>
                                        )}
                                        {project.liveUrl && (
                                            <a
                                                href={project.liveUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Live Demo
                                            </a>
                                        )}
                                        {project.demoVideoUrl && (
                                            <a
                                                href={project.demoVideoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                                            >
                                                <Play className="h-4 w-4" />
                                                Watch Demo
                                            </a>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Tech Stack Tab */}
                    <TabsContent value="tech">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Code className="h-5 w-5 text-purple-600" />
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Technology Stack
                                    </h2>
                                </div>
                                {project.techStack && project.techStack.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {project.techStack.map((tech, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                                className="bg-blue-500/10 text-blue-600 border-blue-500/20 px-3 py-1.5 text-sm"
                                            >
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No technologies listed
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Author Tab */}
                    <TabsContent value="author">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Project Creator
                                    </h2>
                                </div>
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => navigate(`/${profileURL}`)}
                                        className="flex items-center gap-3 hover:bg-muted/50 p-3 rounded-lg transition-colors"
                                    >
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={project.user.profile?.profilePic || undefined} />
                                            <AvatarFallback className="bg-blue-500/10 text-blue-600">
                                                {project.user.firstName[0]}
                                                {project.user.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-left">
                                            <div className="text-sm font-semibold text-foreground">
                                                {project.user.firstName} {project.user.lastName}
                                            </div>
                                            {project.user.profile?.department && (
                                                <div className="text-xs text-muted-foreground">
                                                    {project.user.profile.department}
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    {!isOwner && (
                                        <Button
                                            onClick={() => navigate(`/profile/${project.user.id}`)}
                                            size="sm"
                                        >
                                            View Profile
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit Dialog */}
            <ProjectFormDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                project={project}
            />

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{project.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
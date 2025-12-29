import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { useProject } from '@/hooks/queries/project';
import { useCurrentUser } from '@/hooks/queries/user';
import { useDeleteProject, useToggleFeaturedProject } from '@/hooks/mutations/project';
import { ProjectFormDialog } from '@/components/ProjectFormDialog';
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
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
        });
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
            // Could add toast notification here
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
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-neutral-800">
                <div className="flex items-center justify-between px-4 h-[53px]">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="hover:bg-neutral-900 rounded-full p-2 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="font-bold text-xl line-clamp-1">{project.title}</h1>
                            <span className="text-neutral-500 text-[13px]">
                                {project.user.firstName} {project.user.lastName}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleShare}
                            className="rounded-full"
                        >
                            <Share2 className="h-5 w-5" />
                        </Button>

                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <MoreHorizontal className="h-5 w-5" />
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
            <div className="max-w-4xl mx-auto pb-8">
                {/* Image Gallery */}
                {allImages.length > 0 && (
                    <div className="mb-6">
                        {/* Main Image */}
                        <div className="aspect-video bg-neutral-900 overflow-hidden">
                            <img
                                src={allImages[selectedImageIndex]}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Thumbnail Navigation */}
                        {allImages.length > 1 && (
                            <div className="flex gap-2 mt-2 px-4 overflow-x-auto pb-2">
                                {allImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index
                                                ? 'border-blue-500'
                                                : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="px-4 space-y-6">
                    {/* Title and Badges */}
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                                {project.tagline && (
                                    <p className="text-lg text-neutral-400">{project.tagline}</p>
                                )}
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                {project.featured && (
                                    <Badge className="bg-yellow-500/90 text-black border-0 gap-1">
                                        <Star className="h-3 w-3 fill-current" />
                                        Featured
                                    </Badge>
                                )}
                                <Badge
                                    variant="secondary"
                                    className={`${project.status === 'completed'
                                            ? 'bg-green-500/10 text-green-500'
                                            : project.status === 'in-progress'
                                                ? 'bg-blue-500/10 text-blue-500'
                                                : 'bg-neutral-500/10 text-neutral-500'
                                        }`}
                                >
                                    {project.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Date Range */}
                        {(project.startDate || project.endDate) && (
                            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {formatDate(project.startDate)}
                                    {project.endDate && ` - ${formatDate(project.endDate)}`}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-xl font-bold mb-3">About</h2>
                        <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                            {project.description}
                        </p>
                    </div>

                    {/* Tech Stack */}
                    {project.techStack && project.techStack.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-3">Tech Stack</h2>
                            <div className="flex flex-wrap gap-2">
                                {project.techStack.map((tech, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                                    >
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Links */}
                    {(project.repositoryUrl || project.liveUrl || project.demoVideoUrl) && (
                        <div>
                            <h2 className="text-xl font-bold mb-3">Links</h2>
                            <div className="flex flex-wrap gap-3">
                                {project.repositoryUrl && (
                                    <a
                                        href={project.repositoryUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
                                    >
                                        <Github className="h-5 w-5" />
                                        <span>Source Code</span>
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                                {project.liveUrl && (
                                    <a
                                        href={project.liveUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="h-5 w-5" />
                                        <span>Live Demo</span>
                                    </a>
                                )}
                                {project.demoVideoUrl && (
                                    <a
                                        href={project.demoVideoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/90 hover:bg-red-500 rounded-lg transition-colors"
                                    >
                                        <Play className="h-5 w-5" />
                                        <span>Watch Demo</span>
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Author Section */}
                    <div className="pt-6 border-t border-neutral-800">
                        <h2 className="text-xl font-bold mb-4">Created By</h2>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => navigate(`/${profileURL}`)}
                                className="flex items-center gap-3 hover:bg-neutral-900 p-3 rounded-lg transition-colors"
                            >
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={project.user.profile?.profilePic} />
                                    <AvatarFallback className="bg-muted">
                                        {project.user.firstName[0]}
                                        {project.user.lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <div className="font-bold">
                                        {project.user.firstName} {project.user.lastName}
                                    </div>
                                    {project.user.profile?.department && (
                                        <div className="text-sm text-neutral-500">
                                            {project.user.profile.department}
                                        </div>
                                    )}
                                </div>
                            </button>

                            {!isOwner && (
                                <Button onClick={() => navigate(`/profile/${project.user.id}`)}>
                                    View Profile
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
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
                            Are you sure you want to delete "{project.title}"? This action cannot be
                            undone.
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
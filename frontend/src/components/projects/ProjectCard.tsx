import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ExternalLink,
    Github,
    Play,
    MoreHorizontal,
    Star,
    Trash2,
    Edit,
    Calendar,
    Code,
} from "lucide-react";
import { Project } from '@/types/types';
import { ProjectFormDialog } from './ProjectFormDialog';
import { useDeleteProject, useToggleFeaturedProject } from '@/hooks/mutations/project';
import { useCurrentUser } from '@/hooks/queries/user';
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
import { getOptimizedCloudinaryUrl } from '@/utils/cloudinaryOptimizer';

interface ProjectCardProps {
    project: Project;
    showActions?: boolean;
}

export function ProjectCard({ project, showActions = false }: ProjectCardProps) {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { data: currentUserData } = useCurrentUser();
    const currentUserId = currentUserData?.user?.id;

    const { mutate: deleteProject } = useDeleteProject();
    const { mutate: toggleFeatured } = useToggleFeaturedProject(project.id);

    const isOwner = currentUserId === project.userId;

    const handleDelete = () => {
        deleteProject(project.id);
        setDeleteDialogOpen(false);
    };

    const handleToggleFeatured = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleFeatured();
    };

    const handleCardClick = () => {
        navigate(`/project/${project.id}`);
    };

    // Optimize cover image for card display (300x200px)
    const optimizedCoverImage = project.coverImage
        ? getOptimizedCloudinaryUrl(project.coverImage, 300, 200)
        : null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <>
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-neutral-800">
                <div className="grid md:grid-cols-[250px_1fr] gap-0">
                    {/* Project Image */}
                    <div
                        className="relative h-48 md:h-full bg-neutral-900 overflow-hidden"
                        onClick={handleCardClick}
                    >
                        {optimizedCoverImage && !imageError ? (
                            <img
                                src={optimizedCoverImage}
                                alt={`${project.title} cover`}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-5xl opacity-50">💻</div>
                            </div>
                        )}

                        {/* Featured Badge Overlay */}
                        {project.featured && (
                            <div className="absolute top-2 left-2">
                                <Badge className="bg-yellow-500/90 text-black border-0 gap-1 shadow-lg">
                                    <Star className="h-3 w-3 fill-current" />
                                    Featured
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-5" onClick={handleCardClick}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-blue-500 transition-colors">
                                    {project.title}
                                </h3>
                                {project.tagline && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                        {project.tagline}
                                    </p>
                                )}
                            </div>

                            {isOwner && showActions && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={handleToggleFeatured}>
                                            <Star className="mr-2 h-4 w-4" />
                                            {project.featured ? 'Unfeature' : 'Feature'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation();
                                            setEditDialogOpen(true);
                                        }}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteDialogOpen(true);
                                            }}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                            {project.description}
                        </p>

                        {/* Tech Stack */}
                        {project.techStack && project.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {project.techStack.slice(0, 4).map((tech, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0.5"
                                    >
                                        {tech}
                                    </Badge>
                                ))}
                                {project.techStack.length > 4 && (
                                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                        +{project.techStack.length - 4}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                            {(project.startDate || project.endDate) && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(project.startDate) || 'Present'}</span>
                                </div>
                            )}
                            <Badge
                                variant="outline"
                                className={`text-xs ${project.status === 'completed'
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                    : project.status === 'in-progress'
                                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        : 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20'
                                    }`}
                            >
                                {project.status}
                            </Badge>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            {project.liveUrl && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 text-xs h-8 bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(project.liveUrl, '_blank');
                                    }}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Live Demo
                                </Button>
                            )}
                            {project.repositoryUrl && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 text-xs h-8 bg-transparent"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(project.repositoryUrl, '_blank');
                                    }}
                                >
                                    <Github className="h-3 w-3" />
                                    Code
                                </Button>
                            )}
                            {project.demoVideoUrl && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 text-xs h-8 bg-transparent"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(project.demoVideoUrl, '_blank');
                                    }}
                                >
                                    <Play className="h-3 w-3" />
                                    Video
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

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
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
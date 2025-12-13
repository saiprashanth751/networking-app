import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    Calendar
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

interface ProjectCardProps {
    project: Project;
    showActions?: boolean; // Show edit/delete actions (only on own profile)
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

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <Card className="group hover:bg-neutral-900/30 transition-all duration-200 overflow-hidden border-neutral-800"
            onClick={() => navigate(`/project/${project.id}`)}
        >
            {/* Cover Image */}
            <div className="relative h-48 bg-neutral-900 overflow-hidden">
                {project.coverImage && !imageError ? (
                    <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                        <div className="text-6xl">💻</div>
                    </div>
                )}

                {/* Featured Badge */}
                {project.featured && (
                    <div className="absolute top-3 left-3">
                        <Badge className="bg-yellow-500/90 text-black border-0 gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Featured
                        </Badge>
                    </div>
                )}

                {/* Actions Dropdown (Own Profile Only) */}
                {showActions && isOwner && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-black/70 hover:bg-black/90"
                                    onClick={(e) => e.stopPropagation()}
                                >
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
                    </div>
                )}
            </div>

            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg leading-tight mb-1 truncate">
                            {project.title}
                        </h3>
                        {project.tagline && (
                            <p className="text-sm text-neutral-500 line-clamp-1">
                                {project.tagline}
                            </p>
                        )}
                    </div>

                    {/* Status Badge */}
                    <Badge
                        variant="secondary"
                        className={`ml-2 shrink-0 ${project.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                            project.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                                'bg-neutral-500/10 text-neutral-500'
                            }`}
                    >
                        {project.status}
                    </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-neutral-400 mb-3 line-clamp-2 leading-relaxed">
                    {project.description}
                </p>

                {/* Tech Stack */}
                {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {project.techStack.slice(0, 4).map((tech, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20"
                            >
                                {tech}
                            </Badge>
                        ))}
                        {project.techStack.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                                +{project.techStack.length - 4}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Date Range */}
                {(project.startDate || project.endDate) && (
                    <div className="flex items-center gap-1 text-xs text-neutral-500 mb-3">
                        <Calendar className="h-3 w-3" />
                        <span>
                            {formatDate(project.startDate)}
                            {project.endDate && ` - ${formatDate(project.endDate)}`}
                        </span>
                    </div>
                )}

                {/* Links */}
                <div className="flex items-center gap-2">
                    {project.repositoryUrl && (
                        <a
                            href={project.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                            <Github className="h-4 w-4" />
                            <span className="hidden sm:inline">Code</span>
                        </a>
                    )}

                    {project.liveUrl && (
                        <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-blue-500 transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            <span className="hidden sm:inline">Live</span>
                        </a>
                    )}

                    {project.demoVideoUrl && (
                        <a
                            href={project.demoVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-500 transition-colors"
                        >
                            <Play className="h-4 w-4" />
                            <span className="hidden sm:inline">Demo</span>
                        </a>
                    )}
                </div>

                {/* Author (Show only on other users' profiles) */}
                {!showActions && project.user && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-800">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={project.user.profile?.profilePic} />
                            <AvatarFallback className="text-xs bg-muted">
                                {project.user.firstName[0]}{project.user.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-xs">
                            <span className="text-neutral-500">by </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/profile/${project.user.id}`);
                                }}
                                className="text-white hover:underline"
                            >
                                {project.user.firstName} {project.user.lastName}
                            </button>
                        </div>
                    </div>
                )}
            </CardContent>
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
            <ProjectFormDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                project={project}
            />
        </Card>

    );
}
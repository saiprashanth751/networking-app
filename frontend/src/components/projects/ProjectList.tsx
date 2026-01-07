import { Project } from '@/types/types';
import { ProjectCard } from './ProjectCard';
import { Button } from "@/components/ui/button";
import { Plus, Briefcase } from "lucide-react";
import { H2, Body } from '@/components/ui/typography';

interface ProjectListProps {
    projects: Project[];
    showActions?: boolean; // Show edit/delete actions (own profile)
    emptyStateAction?: () => void; // Action for "Add Project" button
}

export function ProjectList({ projects, showActions = false, emptyStateAction }: ProjectListProps) {

    // Empty state
    if (projects.length === 0) {
        return (
            <div className="px-4 py-16 text-center space-y-4">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <H2>No Projects Yet</H2>
                <Body className="text-muted-foreground">
                    {showActions
                        ? "Showcase your work by adding your first project!"
                        : "No projects to display yet."
                    }
                </Body>
                {showActions && emptyStateAction && (
                    <Button onClick={emptyStateAction} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Your First Project
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Add Project Button (Own Profile Only) */}
            {/* Add Project Button (Own Profile Only) */}
            {showActions && emptyStateAction && (
                <div className="mb-4 flex justify-end">
                    <Button onClick={emptyStateAction} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Project
                    </Button>
                </div>
            )}

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        showActions={showActions}
                    />
                ))}
            </div>
        </div>
    );
}
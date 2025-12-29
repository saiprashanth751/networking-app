import { useState } from 'react';
import { Plus, Search, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import { useProjects, useCurrentUserProjects } from '@/hooks/queries/project';
import { useCurrentUser } from '@/hooks/queries/user';
import { useDebounce } from '@/hooks/useDebounce';
import { H2, Body } from '@/components/ui/typography';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PROJECT_CATEGORIES } from '@/lib/projectConstants';

export default function Projects() {
    const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'featured'>('featured');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const { data: currentUserData } = useCurrentUser();
    const { data: allProjectsData, isLoading: isLoadingAll } = useProjects();
    const { data: myProjectsData, isLoading: isLoadingMine } = useCurrentUserProjects();

    const allProjects = allProjectsData?.projects || [];
    const myProjects = myProjectsData?.projects || [];

    const projects = activeTab === 'all' ? allProjects : myProjects;
    const isLoading = activeTab === 'all' ? isLoadingAll : isLoadingMine;

    // Filter and sort projects
    const filteredProjects = projects
        .filter((project) => {
            const matchesSearch =
                project.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                project.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                project.techStack?.some((tech) =>
                    tech.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
                );

            const matchesCategory =
                categoryFilter === 'all' || project.category === categoryFilter;

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'featured') {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    return (
        <>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-neutral-800">
                <div className="px-4 h-[53px] flex items-center justify-between">
                    <h1 className="font-bold text-xl">Projects</h1>
                    {currentUserData?.user && (
                        <Button
                            size="sm"
                            onClick={() => setCreateDialogOpen(true)}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">New Project</span>
                        </Button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-800">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 px-4 py-4 hover:bg-neutral-900/50 transition-colors relative ${activeTab === 'all' ? 'font-bold' : 'text-neutral-500'
                            }`}
                    >
                        All Projects
                        {activeTab === 'all' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full" />
                        )}
                    </button>
                    {currentUserData?.user && (
                        <button
                            onClick={() => setActiveTab('mine')}
                            className={`flex-1 px-4 py-4 hover:bg-neutral-900/50 transition-colors relative ${activeTab === 'mine' ? 'font-bold' : 'text-neutral-500'
                                }`}
                        >
                            My Projects ({myProjects.length})
                            {activeTab === 'mine' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Search and Filters */}
            <div className="p-4 space-y-3 border-b border-neutral-800 bg-black sticky top-[105px] z-10">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                    <Input
                        type="text"
                        placeholder="Search projects, tech stack..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {PROJECT_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="featured">Featured First</SelectItem>
                            <SelectItem value="recent">Most Recent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Results Count */}
                <div className="text-sm text-neutral-500">
                    {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}{' '}
                    found
                </div>
            </div>

            {/* Projects Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <Body className="text-muted-foreground">Loading projects...</Body>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="px-4 py-16 text-center space-y-4">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <H2>No Projects Found</H2>
                    <Body className="text-muted-foreground">
                        {activeTab === 'mine' ? (
                            <>
                                You haven't created any projects yet.{' '}
                                <button
                                    onClick={() => setCreateDialogOpen(true)}
                                    className="text-blue-500 hover:underline"
                                >
                                    Create your first project
                                </button>
                            </>
                        ) : searchQuery || categoryFilter !== 'all' ? (
                            'Try adjusting your search or filters'
                        ) : (
                            'No projects have been created yet'
                        )}
                    </Body>
                </div>
            ) : (
                <div className="flex flex-col gap-4 p-4">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            showActions={activeTab === 'mine'}
                        />
                    ))}
                </div>
            )}

            {/* Create Project Dialog */}
            <ProjectFormDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
        </>
    );
}

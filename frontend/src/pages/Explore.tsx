import { useState } from 'react';
import { Search, Users, Briefcase, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { useAllProjects } from '@/hooks/queries/project';
import { H2, Body } from '@/components/ui/typography';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PROJECT_CATEGORIES } from '@/lib/projectConstants';

export default function Explore() {
  const [activeTab, setActiveTab] = useState<'projects' | 'people'>('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'featured'>('featured');

  const { data: projectsData, isLoading } = useAllProjects();

  const projects = projectsData?.projects || [];

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack?.some((tech) =>
          tech.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="px-4 h-[53px] flex items-center">
          <h1 className="font-bold text-xl">Explore</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 px-4 py-4 hover:bg-neutral-900/50 transition-colors relative ${activeTab === 'projects' ? 'font-bold' : 'text-neutral-500'
              }`}
          >
            Projects
            {activeTab === 'projects' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`flex-1 px-4 py-4 hover:bg-neutral-900/50 transition-colors relative ${activeTab === 'people' ? 'font-bold' : 'text-neutral-500'
              }`}
          >
            People
            {activeTab === 'people' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'projects' && (
          <div>
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
                  {searchQuery || categoryFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No projects have been created yet'}
                </Body>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} showActions={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'people' && (
          <div className="px-4 py-16 text-center space-y-4">
            <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <H2>People Directory</H2>
            <Body className="text-muted-foreground">Coming soon...</Body>
          </div>
        )}
      </div>
    </>
  );
}
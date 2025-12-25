import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Loader2, User, FileText, Briefcase, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import { useGlobalSearch } from '@/hooks/queries/search';
import { SearchType } from '@/types/types';

type TabType = 'all' | 'users' | 'posts' | 'projects' | 'tags';

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [activeTab, setActiveTab] = useState<TabType>('all');

    const debouncedQuery = useDebounce(query, 300);

    // Fetch search results
    const { data: searchData, isLoading, error: searchError } = useGlobalSearch(
        debouncedQuery,
        activeTab as SearchType,
        debouncedQuery.length >= 2
    );

    // Update URL when query changes
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            setSearchParams({ q: debouncedQuery });
        }
    }, [debouncedQuery, setSearchParams]);

    const getUserInitials = (firstName: string, lastName?: string) => {
        return `${firstName[0]}${lastName?.[0] || ''}`.toUpperCase();
    };

    const tabs: { id: TabType; label: string; count?: number }[] = [
        { id: 'all', label: 'All', count: searchData?.counts.total },
        { id: 'users', label: 'Users', count: searchData?.counts.users },
        { id: 'posts', label: 'Posts', count: searchData?.counts.posts },
        { id: 'projects', label: 'Projects', count: searchData?.counts.projects },
        { id: 'tags', label: 'Tags', count: searchData?.counts.tags },
    ];

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-neutral-800">
                <div className="px-4 h-[53px] flex items-center">
                    <h1 className="font-bold text-xl">Search</h1>
                </div>

                {/* Search Input */}
                <div className="px-4 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                        <Input
                            type="text"
                            placeholder="Search for users, posts, projects..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10 bg-neutral-900 border-neutral-800 focus-visible:ring-blue-500"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-800 overflow-x-auto scrollbar-none">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 px-4 py-4 hover:bg-neutral-900/50 transition-colors relative ${activeTab === tab.id ? 'font-bold' : 'text-neutral-500'
                                }`}
                        >
                            <span>
                                {tab.label}
                                {tab.count !== undefined && searchData && (
                                    <span className="ml-1 text-xs text-neutral-500">({tab.count})</span>
                                )}
                            </span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            <div className="max-w-2xl mx-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                        <p className="text-neutral-500">Searching...</p>
                    </div>
                ) : searchError ? (
                    <div className="px-4 py-16 text-center">
                        <Search className="h-12 w-12 mx-auto text-red-500 opacity-50 mb-4" />
                        <h2 className="font-bold text-xl mb-2 text-red-500">Search Error</h2>
                        <p className="text-neutral-400 mb-4">
                            {searchError instanceof Error ? searchError.message : 'Failed to perform search'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-blue-500 hover:underline"
                        >
                            Reload page
                        </button>
                    </div>
                ) : debouncedQuery.length < 2 ? (
                    <div className="px-4 py-16 text-center">
                        <Search className="h-12 w-12 mx-auto text-neutral-500 opacity-50 mb-4" />
                        <h2 className="font-bold text-xl mb-2">Search Connect</h2>
                        <p className="text-neutral-500">
                            Find users, posts, projects, and tags
                        </p>
                    </div>
                ) : !searchData || searchData.counts.total === 0 ? (
                    <div className="px-4 py-16 text-center">
                        <Search className="h-12 w-12 mx-auto text-neutral-500 opacity-50 mb-4" />
                        <h2 className="font-bold text-xl mb-2">No results found</h2>
                        <p className="text-neutral-500">
                            Try searching for something else
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-800">
                        {/* Users Results */}
                        {(activeTab === 'all' || activeTab === 'users') &&
                            searchData.results.users.length > 0 && (
                                <div className="py-4">
                                    {activeTab === 'all' && (
                                        <h3 className="px-4 font-bold text-lg mb-3">Users</h3>
                                    )}
                                    {searchData.results.users.map((user) => (
                                        <Link
                                            key={user.id}
                                            to={`/profile/${user.id}`}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-900/50 transition-colors"
                                        >
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={user.profile?.profilePic || undefined} />
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                                                    {getUserInitials(user.firstName, user.lastName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-[15px]">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                {user.profile?.bio && (
                                                    <div className="text-sm text-neutral-500 line-clamp-1">
                                                        {user.profile.bio}
                                                    </div>
                                                )}
                                                {user.profile?.department && (
                                                    <div className="text-xs text-neutral-500 mt-0.5">
                                                        {user.profile.department}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                        {/* Posts Results */}
                        {(activeTab === 'all' || activeTab === 'posts') &&
                            searchData.results.posts.length > 0 && (
                                <div className="py-4">
                                    {activeTab === 'all' && (
                                        <h3 className="px-4 font-bold text-lg mb-3">Posts</h3>
                                    )}
                                    {searchData.results.posts.map((post) => (
                                        <Link
                                            key={post.id}
                                            to="/dashboard"
                                            className="block px-4 py-3 hover:bg-neutral-900/50 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={post.user.profile?.profilePic || undefined} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs">
                                                        {getUserInitials(post.user.firstName, post.user.lastName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm text-neutral-500 mb-1">
                                                        {post.user.firstName} {post.user.lastName}
                                                    </div>
                                                    {post.title && (
                                                        <div className="font-bold text-[15px] mb-1">
                                                            {post.title}
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-neutral-300 line-clamp-2">
                                                        {post.contentText}
                                                    </div>
                                                    {post.categories.length > 0 && (
                                                        <div className="flex gap-2 mt-2">
                                                            {post.categories.slice(0, 2).map(({ category }) => (
                                                                <Badge
                                                                    key={category.id}
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                    style={{
                                                                        backgroundColor: `${category.color}20`,
                                                                        color: category.color,
                                                                    }}
                                                                >
                                                                    {category.icon} {category.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                        {/* Projects Results */}
                        {(activeTab === 'all' || activeTab === 'projects') &&
                            searchData.results.projects.length > 0 && (
                                <div className="py-4">
                                    {activeTab === 'all' && (
                                        <h3 className="px-4 font-bold text-lg mb-3">Projects</h3>
                                    )}
                                    {searchData.results.projects.map((project) => (
                                        <Link
                                            key={project.id}
                                            to={`/projects/${project.id}`}
                                            className="block px-4 py-3 hover:bg-neutral-900/50 transition-colors"
                                        >
                                            <div className="flex gap-3">
                                                {project.coverImage && (
                                                    <img
                                                        src={project.coverImage}
                                                        alt={project.title}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-[15px] mb-1">
                                                        {project.title}
                                                    </div>
                                                    <div className="text-sm text-neutral-500 line-clamp-2 mb-2">
                                                        {project.description}
                                                    </div>
                                                    {project.techStack.length > 0 && (
                                                        <div className="flex gap-2 flex-wrap">
                                                            {project.techStack.slice(0, 3).map((tech, idx) => (
                                                                <Badge key={idx} variant="outline" className="text-xs">
                                                                    {tech}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                        {/* Tags Results */}
                        {(activeTab === 'all' || activeTab === 'tags') &&
                            searchData.results.tags.length > 0 && (
                                <div className="py-4">
                                    {activeTab === 'all' && (
                                        <h3 className="px-4 font-bold text-lg mb-3">Tags</h3>
                                    )}
                                    {searchData.results.tags.map((tag) => (
                                        <Link
                                            key={tag.id}
                                            to={`/posts/tag/${tag.slug}`}
                                            className="flex items-center justify-between px-4 py-3 hover:bg-neutral-900/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Hash className="h-5 w-5 text-neutral-500" />
                                                <span className="font-medium">#{tag.name}</span>
                                            </div>
                                            <span className="text-sm text-neutral-500">
                                                {tag._count.posts} posts
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                    </div>
                )}
            </div>
        </div>
    );
}

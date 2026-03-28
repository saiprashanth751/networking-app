import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Loader2,
  ArrowRight,
  TrendingUp,
  Users as UsersIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from '@/hooks/useDebounce';
import { useGlobalSearch, useTrendingTopics } from '@/hooks/queries/search';
import { useRecommendedUsers } from '@/hooks/queries/recommendations';

export function RightSidebar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Global search
  const { data: searchData, isLoading: searchLoading } = useGlobalSearch(
    debouncedQuery,
    'all',
    debouncedQuery.length >= 2
  );

  // Trending topics
  const { data: trendingData, isLoading: trendingLoading } = useTrendingTopics(5, 7);

  // Recommended users
  const { data: recommendedData, isLoading: recommendedLoading } = useRecommendedUsers(5);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show results when query is 2+ chars
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [debouncedQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
    }
  };

  const getUserInitials = (firstName: string, lastName?: string) => {
    return `${firstName[0]}${lastName?.[0] || ''}`.toUpperCase();
  };

  const hasResults = searchData && (
    searchData.results.users.length > 0 ||
    searchData.results.posts.length > 0 ||
    searchData.results.projects.length > 0 ||
    searchData.results.tags.length > 0
  );

  return (
    <aside className="hidden lg:block fixed right-0 top-0 h-screen w-[320px] border-l border-neutral-800/30 bg-background">
      <div className="flex h-full flex-col">
        {/* Search bar */}
        <div className="border-b border-neutral-800/30 p-4">
          <div ref={searchRef} className="relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search or filter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (debouncedQuery.length >= 2) {
                      setShowSearchResults(true);
                    }
                  }}
                  className="h-10 border-neutral-800 bg-neutral-900 pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-blue-600"
                />
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && debouncedQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 rounded-lg border border-neutral-800 shadow-xl max-h-[400px] overflow-y-auto scrollbar-thin z-50">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
                ) : hasResults ? (
                  <div>
                    {/* Users */}
                    {searchData.results.users.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                          Users ({searchData.results.users.length})
                        </div>
                        {searchData.results.users.slice(0, 3).map((user) => (
                          <Link
                            key={user.id}
                            to={`/user/${user.id}`}
                            onClick={() => setShowSearchResults(false)}
                            className="block px-4 py-2.5 hover:bg-neutral-800/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={user.profile?.profilePic} />
                                <AvatarFallback className="bg-neutral-800 text-xs">
                                  {getUserInitials(user.firstName, user.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {user.firstName} {user.lastName}
                                </div>
                                {user.profile?.department && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {user.profile.department}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* See All Results */}
                    {hasResults && searchData.counts.total > 3 && (
                      <Link
                        to={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                        onClick={() => setShowSearchResults(false)}
                        className="flex items-center justify-between px-4 py-3 text-blue-500 hover:bg-neutral-800/50 transition-colors text-sm font-medium border-t border-neutral-800"
                      >
                        <span>See all {searchData.counts.total} results</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No results found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
          {/* Suggested Connections */}
          <Section title="Suggested Connections" icon={UsersIcon}>
            {recommendedLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              </div>
            ) : recommendedData && recommendedData.users.length > 0 ? (
              <div className="space-y-3">
                {recommendedData.users.slice(0, 5).map((user: any) => (
                  <ConnectionCard
                    key={user.id}
                    user={user}
                    getUserInitials={getUserInitials}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4">No suggestions yet</p>
            )}
          </Section>

          {/* Trending in Your Field */}
          <Section title="Trending in Your Field" icon={TrendingUp}>
            {trendingLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              </div>
            ) : trendingData && trendingData.trending.length > 0 ? (
              <div className="space-y-2">
                {trendingData.trending.slice(0, 5).map((topic: any) => (
                  <TrendingItem key={topic.id} topic={topic} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4">No trending topics</p>
            )}
          </Section>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800/30 p-4">
          <div className="flex flex-wrap justify-center gap-x-3 text-[11px] text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              About
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">© 2025 Connect</p>
        </div>
      </div>
    </aside>
  );
}

// Section Component
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// Connection Card
function ConnectionCard({ user, getUserInitials }: any) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-neutral-800/50 p-3 transition-all duration-150 hover:border-blue-600/30 hover:bg-neutral-900/30">
      <Avatar className="h-10 w-10 border border-neutral-800">
        <AvatarImage src={user.profile?.profilePic} />
        <AvatarFallback className="bg-neutral-800 text-xs font-medium">
          {getUserInitials(user.firstName, user.lastName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium">{user.firstName} {user.lastName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {user.profile?.department || 'Student'}
        </p>
      </div>
      <Button
        size="sm"
        className="h-7 bg-blue-600 px-3 text-xs opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-blue-700"
      >
        Connect
      </Button>
    </div>
  );
}

// Trending Item
function TrendingItem({ topic }: any) {
  return (
    <Link
      to={`/posts/tag/${topic.slug}`}
      className="flex items-center justify-between rounded-lg border border-neutral-800/50 p-2.5 transition-all duration-150 hover:bg-neutral-900/30 hover:border-blue-600/30"
    >
      <div>
        <p className="text-sm font-medium">#{topic.name}</p>
        <p className="text-xs text-muted-foreground">{topic.count} posts</p>
      </div>
      <Badge variant="secondary" className="bg-blue-600/10 text-blue-400 text-[10px] font-medium">
        +{Math.floor(Math.random() * 20) + 5}%
      </Badge>
    </Link>
  );
}
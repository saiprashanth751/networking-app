import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Loader2, User, FileText, Briefcase, Hash, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useDebounce } from '@/hooks/useDebounce';
import { useGlobalSearch, useTrendingTopics } from '@/hooks/queries/search';
import { RecommendedUsers } from '@/components/widgets/RecommendedUsers';

/**
 * RightSidebar - Search and Trending Panel
 * 
 * Features:
 * - Live global search with debouncing
 * - Search preview dropdown with results
 * - Suggested users to follow
 * - Trending topics
 */
export function RightSidebar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search query to prevent excessive API calls
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Global search query (only runs if query is 2+ characters)
  const { data: searchData, isLoading: searchLoading, error: searchError } = useGlobalSearch(
    debouncedQuery,
    'all',
    debouncedQuery.length >= 2
  );

  // Fetch trending topics
  const { data: trendingData, isLoading: trendingLoading } = useTrendingTopics(5, 7);

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
    <aside className="hidden lg:block fixed right-0 top-0 h-screen w-[380px] px-4 py-1 overflow-y-auto scrollbar-thin">
      <div className="sticky top-0 bg-background pt-1 pb-3 z-10">
        {/* Search */}
        <div ref={searchRef} className="relative">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (debouncedQuery.length >= 2) {
                    setShowSearchResults(true);
                  }
                }}
                className="w-full rounded-full bg-neutral-900 border-0 pl-12 h-11 text-[15px] focus-visible:ring-1 focus-visible:ring-blue-500 placeholder:text-neutral-500"
              />
            </div>
          </form>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full mt-2 w-full bg-neutral-900 rounded-2xl shadow-xl max-h-[500px] overflow-y-auto scrollbar-thin z-50">
              {searchLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : searchError ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-red-500 text-sm mb-2">Search failed</p>
                  <p className="text-neutral-500 text-xs">
                    {searchError instanceof Error ? searchError.message : 'Please try again'}
                  </p>
                </div>
              ) : !hasResults ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-neutral-500 text-sm">
                    {debouncedQuery.length < 2
                      ? 'Type at least 2 characters to search'
                      : 'No results found'
                    }
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {/* Users */}
                  {searchData.results.users.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase">
                        Users ({searchData.results.users.length})
                      </div>
                      {searchData.results.users.slice(0, 3).map((user) => (
                        <Link
                          key={user.id}
                          to={`/profile/${user.id}`}
                          onClick={() => setShowSearchResults(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-800/50 transition-colors"
                        >
                          <User className="h-4 w-4 text-neutral-500 shrink-0" />
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profile?.profilePic || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs">
                              {getUserInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {user.firstName} {user.lastName}
                            </div>
                            {user.profile?.department && (
                              <div className="text-xs text-neutral-500 truncate">
                                {user.profile.department}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Posts */}
                  {searchData.results.posts.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase">
                        Posts ({searchData.results.posts.length})
                      </div>
                      {searchData.results.posts.slice(0, 3).map((post) => (
                        <Link
                          key={post.id}
                          to={`/dashboard`} // Assuming posts show in feed
                          onClick={() => setShowSearchResults(false)}
                          className="block px-4 py-2 hover:bg-neutral-800/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              {post.title && (
                                <div className="font-medium text-sm truncate mb-1">
                                  {post.title}
                                </div>
                              )}
                              <div className="text-xs text-neutral-500 line-clamp-2">
                                {post.contentText}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {searchData.results.projects.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase">
                        Projects ({searchData.results.projects.length})
                      </div>
                      {searchData.results.projects.slice(0, 3).map((project) => (
                        <Link
                          key={project.id}
                          to={`/projects/${project.id}`}
                          onClick={() => setShowSearchResults(false)}
                          className="block px-4 py-2 hover:bg-neutral-800/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <Briefcase className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate mb-1">
                                {project.title}
                              </div>
                              <div className="text-xs text-neutral-500 line-clamp-1">
                                {project.description}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {searchData.results.tags.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase">
                        Tags ({searchData.results.tags.length})
                      </div>
                      {searchData.results.tags.slice(0, 3).map((tag) => (
                        <Link
                          key={tag.id}
                          to={`/posts/tag/${tag.slug}`}
                          onClick={() => setShowSearchResults(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-800/50 transition-colors"
                        >
                          <Hash className="h-4 w-4 text-neutral-500 shrink-0" />
                          <div className="flex-1">
                            <span className="text-sm">#{tag.name}</span>
                          </div>
                          <span className="text-xs text-neutral-500">
                            {tag._count.posts} posts
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* See All Results */}
                  {hasResults && searchData.counts.total > 9 && (
                    <Link
                      to={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                      onClick={() => setShowSearchResults(false)}
                      className="flex items-center justify-between px-4 py-3 text-blue-500 hover:bg-neutral-800/50 transition-colors text-sm font-medium"
                    >
                      <span>See all {searchData.counts.total} results</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* You might like - Only show when not searching */}
      {!showSearchResults && <RecommendedUsers />}

      {/* Trending Topics */}
      {!showSearchResults && (
        <div className="bg-neutral-900 rounded-2xl overflow-hidden">
          <h2 className="font-bold text-xl px-4 py-3">Trending</h2>
          {trendingLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : trendingData && trendingData.trending.length > 0 ? (
            <>
              {trendingData.trending.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/posts/tag/${topic.slug}`}
                  className="block px-4 py-3 hover:bg-neutral-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-neutral-500 text-[13px] mb-0.5">
                        Trending · {trendingData.period}
                      </div>
                      <div className="font-bold text-[15px]">
                        #{topic.name}
                      </div>
                      <div className="text-neutral-500 text-[13px]">
                        {topic.count} {topic.count === 1 ? 'post' : 'posts'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              <Link
                to="/explore"
                className="block w-full px-4 py-3 text-left text-blue-500 hover:bg-neutral-800/50 text-[15px] transition-colors"
              >
                Show more
              </Link>
            </>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-neutral-500 text-sm">No trending topics yet</p>
            </div>
          )}
        </div>
      )}

      {/* Footer Links */}
      <div className="px-4 py-3 text-[13px] text-neutral-500 flex flex-wrap gap-x-2 gap-y-1">
        <a href="#" className="hover:underline">Terms of Service</a>
        <span>·</span>
        <a href="#" className="hover:underline">Privacy Policy</a>
        <span>·</span>
        <a href="#" className="hover:underline">About</a>
        <span>·</span>
        <span>© 2024 Connect</span>
      </div>
    </aside>
  );
}
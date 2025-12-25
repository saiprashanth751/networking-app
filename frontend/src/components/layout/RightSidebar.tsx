import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * RightSidebar - Suggestions and Trending Panel
 * 
 * Features:
 * - Search bar
 * - Suggested users to follow
 * - Trending topics (placeholder for now)
 * 
 * Only visible on desktop (lg breakpoint)
 */
export function RightSidebar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Replace with real API calls
  const suggestedUsers = [
    { id: '1', name: 'Sarah Chen', handle: 'sarahchen', avatar: null },
    { id: '2', name: 'Mike Johnson', handle: 'mikej', avatar: null },
    { id: '3', name: 'Alex Rivera', handle: 'alexr', avatar: null },
  ];

  const trendingTopics = [
    { tag: 'WebDevelopment', category: 'Technology', posts: '12.5K' },
    { tag: 'ReactJS', category: 'Programming', posts: '8.2K' },
    { tag: 'OpenSource', category: 'Technology', posts: '5.1K' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Navigate to search results or trigger search
      console.log('Search:', searchQuery);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="hidden lg:block fixed right-0 top-0 h-screen w-[380px] px-4 py-1 overflow-y-auto scrollbar-thin">
      <div className="sticky top-0 bg-background pt-1 pb-3 z-10">
        {/* Search */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-neutral-900 border-0 pl-12 h-11 text-[15px] focus-visible:ring-1 focus-visible:ring-blue-500 placeholder:text-neutral-500"
            />
          </div>
        </form>
      </div>

      {/* You might like */}
      <div className="bg-neutral-900 rounded-2xl mb-4 overflow-hidden">
        <h2 className="font-bold text-xl px-4 py-3">You might like</h2>

        {suggestedUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between px-4 py-3 hover:bg-neutral-800/50 cursor-pointer transition-colors"
          >
            <div
              className="flex items-center gap-3 flex-1 min-w-0"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs">
                  {getUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] hover:underline truncate">
                  {user.name}
                </div>
                <div className="text-neutral-500 text-[15px] truncate">
                  @{user.handle}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-4 h-8 text-[14px] shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement follow functionality
                console.log('Follow:', user.id);
              }}
            >
              Follow
            </Button>
          </div>
        ))}

        <button
          className="w-full px-4 py-3 text-left text-blue-500 hover:bg-neutral-800/50 text-[15px] transition-colors"
          onClick={() => navigate('/network')}
        >
          Show more
        </button>
      </div>

      {/* Trending Topics */}
      <div className="bg-neutral-900 rounded-2xl overflow-hidden">
        <h2 className="font-bold text-xl px-4 py-3">Trending</h2>

        {trendingTopics.map((topic, index) => (
          <div
            key={index}
            className="px-4 py-3 hover:bg-neutral-800/50 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-neutral-500 text-[13px] mb-0.5">
                  {topic.category} · Trending
                </div>
                <div className="font-bold text-[15px]">
                  #{topic.tag}
                </div>
                <div className="text-neutral-500 text-[13px]">
                  {topic.posts} posts
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          className="w-full px-4 py-3 text-left text-blue-500 hover:bg-neutral-800/50 text-[15px] transition-colors"
          onClick={() => navigate('/explore')}
        >
          Show more
        </button>
      </div>

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
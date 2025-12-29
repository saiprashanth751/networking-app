import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Loader2,
  GraduationCap,
  Briefcase,
  UserPlus,
  MessageCircle,
  Filter,
  X,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchUsers, useUsersByDepartment } from '@/hooks/queries/user';
import { useCurrentUser } from '@/hooks/queries/user';
import { useFollowUser } from '@/hooks/mutations/follow';
import { useDebounce } from '@/hooks/useDebounce';
import { H2, Body } from '@/components/ui/typography';
import { UserWithProfile } from '@/types/types';

const DEPARTMENTS = [
  'Computer Science Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics Engineering',
];

const GRADUATION_YEARS = ['2025', '2026', '2027', '2028'];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: currentUserData } = useCurrentUser();
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(debouncedSearch);
  const { data: usersByDepartment, isLoading: isLoadingByDepartment } = useUsersByDepartment(selectedDepartment || '');

  const currentUserId = currentUserData?.user?.id;

  // Combine search and filter results
  let users = debouncedSearch
    ? searchResults?.users || []
    : selectedDepartment
      ? usersByDepartment?.users || []
      : [];

  // If both search and department filter are active, filter search results by department
  if (debouncedSearch && selectedDepartment && searchResults?.users) {
    users = searchResults.users.filter(user =>
      user.profile?.department === selectedDepartment
    );
  }

  // Filter by graduation year if selected
  const filteredUsers = selectedYear
    ? users.filter(user => user.profile?.graduationYear === selectedYear)
    : users;

  // Exclude current user
  const displayUsers = filteredUsers.filter(user => user.id !== currentUserId);

  const isLoading = isSearching || isLoadingByDepartment;
  const showResults = debouncedSearch || selectedDepartment;

  const clearFilters = () => {
    setSelectedDepartment(null);
    setSelectedYear(null);
    setSearchQuery('');
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 h-[53px] flex items-center justify-between">
          <h1 className="font-bold text-xl">Explore</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-t border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search people by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-4 py-4 border-t border-border space-y-4 bg-muted/20">
            {/* Department Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map((dept) => (
                  <Badge
                    key={dept}
                    variant={selectedDepartment === dept ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${selectedDepartment === dept
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'hover:bg-muted'
                      }`}
                    onClick={() =>
                      setSelectedDepartment(dept === selectedDepartment ? null : dept)
                    }
                  >
                    {dept}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Graduation Year Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Graduation Year</label>
              <div className="flex flex-wrap gap-2">
                {GRADUATION_YEARS.map((year) => (
                  <Badge
                    key={year}
                    variant={selectedYear === year ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${selectedYear === year
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'hover:bg-muted'
                      }`}
                    onClick={() =>
                      setSelectedYear(year === selectedYear ? null : year)
                    }
                  >
                    Class of {year}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedDepartment || selectedYear || searchQuery) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <Body className="text-muted-foreground">Discovering people...</Body>
          </div>
        ) : !showResults ? (
          <div className="px-4 py-16 text-center space-y-4">
            <Users className="h-16 w-16 mx-auto text-blue-500 opacity-50" />
            <H2>Discover Your Network</H2>
            <Body className="text-muted-foreground max-w-md mx-auto">
              Use the search bar or filters to find students from your department,
              graduation year, and shared interests.
            </Body>
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="px-4 py-16 text-center space-y-4">
            <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <H2>No Results Found</H2>
            <Body className="text-muted-foreground">
              Try adjusting your search or filters to discover more people.
            </Body>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              {displayUsers.length} {displayUsers.length === 1 ? 'person' : 'people'} found
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// User Card Component
function UserCard({ user }: { user: UserWithProfile }) {
  const { mutate: followUser, isPending: isFollowing } = useFollowUser();

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    followUser(user.id);
  };

  const getUserInitials = () => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Link to={`/profile/${user.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-border hover:border-blue-500/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar className="h-14 w-14 ring-2 ring-border group-hover:ring-blue-500/50 transition-all">
              <AvatarImage src={user.profile?.profilePic || undefined} />
              <AvatarFallback className="bg-blue-500/10 text-blue-600 text-lg font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-blue-500 transition-colors">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                @{user.firstName?.toLowerCase() || 'user'}
              </p>

              {/* Bio */}
              {user.profile?.bio && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                  {user.profile.bio}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                {user.profile?.department && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span className="truncate max-w-[150px]">
                      {user.profile.department}
                    </span>
                  </div>
                )}
                {user.profile?.graduationYear && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>Class of {user.profile.graduationYear}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="default"
              className="flex-1"
              onClick={handleFollow}
              disabled={isFollowing}
            >
              {isFollowing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
            <Link
              to={`/messages?userId=${user.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1"
            >
              <Button size="sm" variant="outline" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

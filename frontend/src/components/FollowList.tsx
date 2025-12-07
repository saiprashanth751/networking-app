import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowListProps {
  title: string;
  users: any[];
  onMessageClick: (userId: string) => void;
  count?: number;
}

/**
 * FollowList - Modern followers/following list with dialog
 * Shows a button that opens a modal with full list
 */
export function FollowList({ 
  title, 
  users, 
  onMessageClick,
  count
}: FollowListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === "" || 
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getInitials = (user: any) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const displayCount = count || users.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-auto p-0 hover:bg-transparent group"
        >
          <div className="text-center">
            <div className="text-2xl font-bold group-hover:text-primary transition-colors">
              {displayCount}
            </div>
            <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {title}
            </div>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {displayCount} {displayCount === 1 ? 'person' : 'people'}
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        {users.length > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Users List */}
        <ScrollArea className="h-[400px] pr-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No users match your search" : "No users yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-smooth",
                    "hover:bg-accent group"
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 border-2 border-border group-hover:border-primary transition-colors">
                    <AvatarImage 
                      src={user?.profile?.profilePic} 
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-foreground">
                      {user.firstName} {user.lastName}
                    </div>
                    {user.department && (
                      <div className="text-xs text-muted-foreground truncate">
                        {user.department}
                      </div>
                    )}
                    {user.profile?.bio && (
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {user.profile.bio}
                      </div>
                    )}
                  </div>

                  {/* Message Button */}
                  <Button
                    onClick={() => {
                      onMessageClick(user.id);
                      setIsOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="gap-2 shrink-0"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Message</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/**
 * FollowListCompact - For sidebar usage (small preview)
 * Shows first 3 users with "View all" button
 */
export function FollowListCompact({ 
  title, 
  users, 
  onMessageClick,
  count
}: FollowListProps) {
  const previewUsers = users.slice(0, 3);
  const displayCount = count || users.length;

  const getInitials = (user: any) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {title}
          </CardTitle>
          <Badge variant="secondary">
            {displayCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {previewUsers.length === 0 ? (
          <div className="text-center py-6">
            <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-xs text-muted-foreground">No {title.toLowerCase()} yet</p>
          </div>
        ) : (
          <>
            {previewUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-smooth group"
              >
                <Avatar className="h-10 w-10 border-2 border-border group-hover:border-primary transition-colors">
                  <AvatarImage 
                    src={user?.profile?.profilePic} 
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {user.firstName} {user.lastName}
                  </div>
                  {user.department && (
                    <div className="text-xs text-muted-foreground truncate">
                      {user.department}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => onMessageClick(user.id)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {users.length > 3 && (
              <FollowList
                title={title}
                users={users}
                onMessageClick={onMessageClick}
                count={displayCount}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
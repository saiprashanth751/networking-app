import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { SPACING, Small, Caption, LAYOUT } from "@/components/layout";

interface FollowListProps {
  title: string;
  users: any[];
  onMessageClick: (userId: string) => void;
  count?: number;
}

/**
 * FollowList - Full modal with search for followers/following
 * Mobile-first design with proper spacing
 */
export function FollowList({
  title,
  users,
  onMessageClick,
  count
}: FollowListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleUserClick = (userId: string) => {
    setIsOpen(false); // Close the modal
    navigate(`/profile/${userId}`); // Navigate to user's profile
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-center hover:opacity-80 transition-opacity">
          <div className="text-xl md:text-2xl font-bold">{displayCount}</div>
          <Small className="text-muted-foreground">{title}</Small>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className={SPACING.container.md}>
          <div className={SPACING.stack.xs}>
            <DialogTitle className={`flex items-center ${SPACING.inline.sm}`}>
              <Users className="h-5 w-5 text-primary" />
              <span>{title}</span>
            </DialogTitle>
            <DialogDescription>
              {displayCount} {displayCount === 1 ? 'person' : 'people'}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Search Bar */}
        {users.length > 5 && (
          <div className={`px-4 md:px-6 ${SPACING.stack.sm}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        )}

        {/* Users List */}
        <ScrollArea className="h-[400px] px-4 md:px-6">
          {filteredUsers.length === 0 ? (
            <div className={`text-center py-12 ${SPACING.stack.sm}`}>
              <User className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <Small className="text-muted-foreground">
                {searchQuery ? "No users match your search" : "No users yet"}
              </Small>
            </div>
          ) : (
            <div className={SPACING.stack.sm}>
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-all hover:bg-accent group",
                    SPACING.inline.sm
                  )}
                >
                  {/* Avatar */}
                  <button
                    onClick={() => handleUserClick(user.id)}
                    className="flex items-center flex-1 min-w-0 gap-3 text-left"
                  >
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 border-2 border-border group-hover:border-primary transition-colors shrink-0">
                      <AvatarImage
                        src={user?.profile?.profilePic}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>

                    {/* ✅ User Info - SINGLE NAME DISPLAY */}
                    <div className="flex-1 min-w-0">
                      <Small className="font-medium truncate block hover:underline">
                        {user.firstName} {user.lastName}
                      </Small>
                      {user.profile?.department && (
                        <Caption className="truncate block text-muted-foreground">
                          {user.profile.department}
                        </Caption>
                      )}
                      {user.profile?.bio && (
                        <Caption className="truncate block mt-1 text-muted-foreground">
                          {user.profile.bio}
                        </Caption>
                      )}
                    </div>
                  </button>

                  {/* Message Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMessageClick(user.id);
                      setIsOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className={`${SPACING.inline.xs} shrink-0`}
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
 * FollowListCompact - Sidebar widget version
 * Shows preview of 3 users
 */
export function FollowListCompact({
  title,
  users,
  onMessageClick,
  count
}: FollowListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // ✅ ADD STATE
  const navigate = useNavigate(); // ✅ ADD THIS
  const previewUsers = users.slice(0, 3);
  const displayCount = count || users.length;

  const getInitials = (user: any) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  // ✅ ADD THIS FUNCTION
  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className={LAYOUT.flex.between}>
            <CardTitle className="text-base font-semibold">
              {title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {displayCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className={SPACING.stack.sm}>
          {previewUsers.length === 0 ? (
            <div className={`text-center py-6 ${SPACING.stack.sm}`}>
              <User className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
              <Caption>No {title.toLowerCase()} yet</Caption>
            </div>
          ) : (
            <>
              {previewUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user.id)} // ✅ ADD CLICK HANDLER
                  className={`flex items-center p-2 rounded-lg hover:bg-accent transition-all group ${SPACING.inline.sm} w-full text-left`}
                >
                  <Avatar className="h-10 w-10 border-2 border-border group-hover:border-primary transition-colors shrink-0">
                    <AvatarImage
                      src={user?.profile?.profilePic}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Small className="font-medium truncate block hover:underline">
                      {user.firstName} {user.lastName}
                    </Small>
                    {user.department && (
                      <Caption className="truncate block">
                        {user.department}
                      </Caption>
                    )}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ Prevent profile navigation
                      onMessageClick(user.id);
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </button>
              ))}

              {/* ✅ FIX VIEW ALL BUTTON */}
              {users.length > 3 && (
                <Button
                  variant="ghost"
                  className="w-full mt-2"
                  onClick={() => setIsDialogOpen(true)}
                >
                  View all {displayCount} {title.toLowerCase()}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ✅ RENDER FULL MODAL SEPARATELY */}
      {isDialogOpen && (
        <FollowList
          title={title}
          users={users}
          onMessageClick={onMessageClick}
          count={displayCount}
        />
      )}
    </>
  );
}
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, User, Filter } from "lucide-react";

interface FollowListProps {
  title: string;
  users: any[];
  onMessageClick: (userId: string) => void;
  variant?: "default" | "compact";
  showSearch?: boolean;
  showFollowStatus?: boolean;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
}

export function FollowList({ 
  title, 
  users, 
  onMessageClick, 
  variant = "default",
  showSearch = false,
  showFollowStatus = false,
  onFollowToggle
}: FollowListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOnline, setFilterOnline] = useState(false);

  // Filter users based on search query and online status
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === "" || 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOnline = !filterOnline || user.isOnline;
    
    return matchesSearch && matchesOnline;
  });

  const getInitials = (user: any) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  if (users.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No users found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {title} 
            <Badge variant="secondary" className="ml-2 bg-gray-700">
              {filteredUsers.length}
            </Badge>
          </CardTitle>
          {showSearch && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterOnline(!filterOnline)}
                className={filterOnline ? "bg-blue-500/20 text-blue-300" : ""}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {showSearch && (
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-900 border-gray-600 text-white"
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea className={`${variant === "compact" ? "h-64" : "h-80"} pr-4`}>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No users match your search</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-lg transition-colors group"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border-2 border-gray-700 group-hover:border-gray-600">
                        <AvatarImage 
                          src={user?.profile?.profilePic} 
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback className="bg-gray-700 text-gray-300 text-sm">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-800" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        {showFollowStatus && user.isFollowing && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            Following
                          </Badge>
                        )}
                      </div>
                      {variant === "default" && (
                        <>
                          {user.department && (
                            <p className="text-xs text-gray-400 truncate">{user.department}</p>
                          )}
                          {user.email && (
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {showFollowStatus && onFollowToggle && (
                      <Button
                        onClick={() => onFollowToggle(user.id, user.isFollowing)}
                        variant={user.isFollowing ? "destructive" : "default"}
                        size="sm"
                      >
                        {user.isFollowing ? "Unfollow" : "Follow"}
                      </Button>
                    )}
                    <Button
                      onClick={() => onMessageClick(user.id)}
                      variant="outline"
                      size="sm"
                      className="ml-2 shrink-0"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
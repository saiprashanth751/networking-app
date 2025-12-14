// src/components/messaging/ConversationList.tsx
import { useState } from 'react';
import { useConversations, useSearchUsers } from '@/hooks/queries/conversation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  onSelectUser: (userId: string) => void;
  selectedUserId?: string;
}

export function ConversationList({ onSelectUser, selectedUserId }: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: conversationsData, isLoading: conversationsLoading } = useConversations();
  const { data: searchData, isLoading: searchLoading } = useSearchUsers(searchQuery);

  const conversations = conversationsData?.conversations || [];
  const searchResults = searchData?.users || [];
  const showSearchResults = searchQuery.length >= 2;

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const getUserInitials = (firstName: string, lastName: string | null) => {
    return `${firstName[0]}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Search Bar */}
      <div className="p-4 border-b border-neutral-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
          <Input
            type="text"
            placeholder="Search messages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-neutral-900 border-0 focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {/* Conversations / Search Results */}
      <ScrollArea className="flex-1">
        {showSearchResults ? (
          // Search Results
          <div className="divide-y divide-neutral-800">
            {searchLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 text-sm">
                No users found
              </div>
            ) : (
              searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user.id);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-neutral-900 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profile?.profilePic || undefined} />
                      <AvatarFallback className="bg-muted">
                        {getUserInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold text-[15px]">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-neutral-500 text-[13px]">
                      {user.profile?.department || 'Student'}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          // Conversations List
          <div className="divide-y divide-neutral-800">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3">
                <MessageSquare className="h-12 w-12 mx-auto text-neutral-700" />
                <div>
                  <div className="font-semibold mb-1">No messages yet</div>
                  <div className="text-sm text-neutral-500">
                    Search for users to start a conversation
                  </div>
                </div>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectUser(conv.otherUser.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 hover:bg-neutral-900 transition-colors',
                    selectedUserId === conv.otherUser.id && 'bg-neutral-900'
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conv.otherUser.profile?.profilePic || undefined} />
                      <AvatarFallback className="bg-muted">
                        {getUserInitials(conv.otherUser.firstName, conv.otherUser.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    {conv.otherUser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-[15px] truncate">
                        {conv.otherUser.firstName} {conv.otherUser.lastName}
                      </div>
                      <div className="text-neutral-500 text-[13px] flex-shrink-0 ml-2">
                        {formatTimestamp(conv.lastMessageAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'text-[13px] truncate flex-1',
                          conv.unreadCount > 0 ? 'text-white font-medium' : 'text-neutral-500'
                        )}
                      >
                        {conv.lastMessage.content || 'No messages yet'}
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-blue-500 text-white h-5 min-w-[20px] px-1.5 text-xs font-bold flex-shrink-0">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
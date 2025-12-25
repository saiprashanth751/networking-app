// src/components/messaging/EmptyState.tsx
import { MessageSquare } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full bg-background">
      <div className="text-center space-y-4 max-w-md px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-900 mb-2">
          <MessageSquare className="h-10 w-10 text-neutral-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
          <p className="text-neutral-500 text-[15px]">
            Send private messages to your connections. Select a conversation from the list or search for someone to start chatting.
          </p>
        </div>
      </div>
    </div>
  );
}
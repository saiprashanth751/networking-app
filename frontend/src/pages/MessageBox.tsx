import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  X,
  User,
  Wifi,
  WifiOff,
  Loader2,
  Paperclip,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  profile?: {
    profilePic?: string;
  };
}

interface MessageBoxProps {
  receiverId: string;
  onClose: () => void;
}

export default function MessageBox({ receiverId, onClose }: MessageBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [receiver, setReceiver] = useState<UserType | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const fetchMessagesAndUser = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. User is not logged in.");
          return;
        }

        const decoded = jwtDecode<{ id: string }>(token);
        if (decoded?.id) {
          setCurrentUserId(decoded.id);
        } else {
          console.error("Failed to decode token or missing user ID");
        }

        const messagesResponse = await axios.get(
          `${import.meta.env.VITE_BASE_API_URL}/message/${receiverId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(messagesResponse.data.messages);

        const userResponse = await axios.get(
          `${import.meta.env.VITE_BASE_API_URL}/user/userProfile/?id=${receiverId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReceiver(userResponse.data.user);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (receiverId) fetchMessagesAndUser();
  }, [receiverId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !receiverId) return;

    const newSocket = io(`${import.meta.env.VITE_API_URL}`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: { token },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("joinRoom", { receiverId });
    });

    newSocket.on("receiveMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("typing", ({ userId, isTyping: typingStatus }) => {
      if (userId === receiverId) {
        setIsTyping(typingStatus);
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [receiverId]);

  const handleTyping = () => {
    if (socket && receiverId) {
      socket.emit("typing", { receiverId, isTyping: true });
      const timeout = setTimeout(() => {
        socket.emit("typing", { receiverId, isTyping: false });
      }, 1000);
      return () => clearTimeout(timeout);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket || !receiverId || !currentUserId) return;

    try {
      const tempMessage: Message = {
        id: crypto.randomUUID(),
        senderId: currentUserId,
        receiverId,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");
      socket.emit("typing", { receiverId, isTyping: false });
      socket.emit("sendMessage", { receiverId, content: newMessage });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getInitials = (user: UserType | null) => {
    if (!user) return "?";
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-card h-full flex flex-col">
        <CardContent className="flex items-center justify-center flex-1">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading chat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentUserId) {
    return (
      <Card className="border-border bg-card h-full flex flex-col">
        <CardContent className="flex items-center justify-center flex-1">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">Unable to load user</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card h-full flex flex-col shadow-lg">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-3">
          {/* Back Button - Mobile */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="sm:hidden shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* User Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 border-2 border-border">
              <AvatarImage 
                src={receiver?.profile?.profilePic} 
                alt={`${receiver?.firstName} ${receiver?.lastName}`}
              />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {getInitials(receiver)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {receiver?.firstName} {receiver?.lastName}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <Badge
                  variant={isConnected ? "default" : "destructive"}
                  className="h-5 px-1.5"
                >
                  {isConnected ? (
                    <Wifi className="h-3 w-3" />
                  ) : (
                    <WifiOff className="h-3 w-3" />
                  )}
                </Badge>
                {isTyping && (
                  <span className="text-muted-foreground animate-pulse">
                    typing...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Close Button - Desktop */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="hidden sm:flex shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="py-4 space-y-4">
            {messages.length > 0 ? (
              <>
                {messages.map((msg, index) => {
                  const isOwnMessage = msg.senderId === currentUserId;
                  const showTimestamp = index === 0 || 
                    new Date(messages[index - 1].timestamp).getTime() - new Date(msg.timestamp).getTime() > 300000;

                  return (
                    <div key={msg.id}>
                      {showTimestamp && (
                        <div className="flex justify-center my-4">
                          <Badge variant="outline" className="text-xs">
                            {formatTime(msg.timestamp)}
                          </Badge>
                        </div>
                      )}
                      <div
                        className={cn(
                          "flex gap-2 items-end",
                          isOwnMessage ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isOwnMessage && (
                          <Avatar className="h-6 w-6 border">
                            <AvatarImage src={receiver?.profile?.profilePic} />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(receiver)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2 break-words",
                            isOwnMessage
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm"
                          )}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="text-base font-medium mb-2">
                    No messages yet
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation with {receiver?.firstName}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <Separator />

      {/* Input Area */}
      <CardFooter className="p-4">
        <div className="flex w-full gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            disabled
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1"
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={!isConnected}
          />
          <Button
            onClick={sendMessage}
            disabled={!isConnected || !newMessage.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
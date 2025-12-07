import { useEffect, useState } from "react";
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
import {
  Send,
  X,
  User,
  Wifi,
  WifiOff,
  Clock,
  Paperclip,
  MessageSquare,
} from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

interface User {
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
  const [receiver, setReceiver] = useState<User | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const fetchMessagesAndUser = async () => {
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

  const getInitials = (user: User | null) => {
    if (!user) return "?";
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  if (!currentUserId) {
    return (
      <Card className="bg-gray-800 border-gray-700 text-white h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-12 w-12 mx-auto mb-3 animate-spin text-gray-400" />
            <p className="text-gray-300">Loading chat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700 text-white h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-gray-600">
              <AvatarImage 
                src={receiver?.profile?.profilePic} 
                alt={`${receiver?.firstName} ${receiver?.lastName}`}
              />
              <AvatarFallback className="bg-gray-700 text-gray-300">
                {getInitials(receiver)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">
                {receiver?.firstName} {receiver?.lastName}
              </h2>
              <div className="flex items-center gap-2">
                <Badge
                  variant={isConnected ? "default" : "destructive"}
                  className="text-xs"
                >
                  {isConnected ? (
                    <Wifi className="h-3 w-3 mr-1" />
                  ) : (
                    <WifiOff className="h-3 w-3 mr-1" />
                  )}
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
                {isTyping && (
                  <Badge variant="outline" className="text-xs text-gray-300">
                    typing...
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] p-4">
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[70%]">
                    <Card
                      className={`${msg.senderId === currentUserId
                          ? "bg-blue-600 border-blue-500"
                          : "bg-gray-700 border-gray-600"
                        } border`}
                    >
                      <CardContent className="p-3">
                        <p className="text-white">{msg.content}</p>
                        <div className="flex justify-end mt-1">
                          <span className={`text-xs ${msg.senderId === currentUserId ? "text-blue-200" : "text-gray-400"}`}>
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-400 text-sm">
                Start a conversation with {receiver?.firstName}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input Area */}
      <CardFooter className="pt-4 border-t border-gray-700">
        <div className="flex w-full gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
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
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 border-gray-600 text-white focus:border-blue-500"
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
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
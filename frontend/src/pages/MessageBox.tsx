import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

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
          `https://uni-networking-app.onrender.com/api/v1/message/${receiverId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(messagesResponse.data.messages);


        const userResponse = await axios.get(
          `https://uni-networking-app.onrender.com/api/v1/user/userProfile/?id=${receiverId}`,
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

    const newSocket = io("https://uni-networking-app.onrender.com", {
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
      socket.emit("sendMessage", { receiverId, content: newMessage });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!currentUserId) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 bg-gray-800 p-4 rounded-lg shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-white">Chat</h1>
          {/* Display receiver's name */}
          {receiver && (
            <p className="text-lg text-gray-300 mt-2">
              Chatting with:{" "}
              <span className="font-semibold text-blue-400">
                {receiver.firstName} {receiver.lastName}
              </span>
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
        >
          Close
        </button>
      </div>

      <div className="flex-1 border border-gray-300 rounded-lg p-4 overflow-y-auto bg-gray-50">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"
                } mb-4`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${msg.senderId === currentUserId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet</p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          disabled={!isConnected}
        >
          {isConnected ? "Send" : "Connecting..."}
        </button>
      </div>
    </div>
  );
}
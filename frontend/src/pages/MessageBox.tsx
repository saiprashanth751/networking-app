import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function MessageBox() {
  const { userId: receiverId } = useParams(); // receiverId from URL params
  const [messages, setMessages] = useState<
    { id: string; senderId: string; receiverId: string; content: string; timestamp: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (!receiverId) return;
  
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. User is not logged in.");
      return;
    }
  
    // Fetch previous messages
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `https://uni-networking-app.onrender.com/api/v1/message/${receiverId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        // Extract the messages array from the response
        if (res.data && Array.isArray(res.data.messages)) {
          setMessages(res.data.messages);
          console.log("Previous messages fetched:", res.data.messages);
        } else {
          console.error("Invalid response format:", res.data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
  
    fetchMessages();
  
    // Initialize Socket.IO connection
    const newSocket = io("https://uni-networking-app.onrender.com", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: {
        token: token,
      },
    });
  
    setSocket(newSocket);
  
    // Socket.IO event listeners
    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
  
      // Join the room with the receiverId
      newSocket.emit("joinRoom", { receiverId });
      console.log(`Joining room with receiverId: ${receiverId}`);
    });
  
    newSocket.on("receiveMessage", (message: any) => {
      console.log("New message received:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  
    newSocket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });
  
    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from WebSocket server:", reason);
    });
  
    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [receiverId]);

  const sendMessage = () => {
    if (newMessage.trim() === "" || !socket || !receiverId) {
      console.error("Message is empty or socket/receiverId is missing");
      return;
    }

    console.log("Sending message:", { receiverId, content: newMessage });
    socket.emit("sendMessage", { receiverId, content: newMessage });

    // Optimistically update the UI
    setMessages((prev) => [
      ...prev,
      {
        id: "temp", // Temporary ID for optimistic update
        senderId: "me", // Temporary senderId for optimistic update
        receiverId,
        content: newMessage,
        timestamp: new Date().toISOString(),
      },
    ]);
    setNewMessage("");
  };
  

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      <div className="border border-gray-300 rounded-lg p-4 h-[400px] overflow-y-auto bg-gray-50">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderId === "me" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`p-3 rounded-lg ${
                  msg.senderId === "me"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {msg.content}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet</p>
        )}
      </div>

      <div className="mt-4 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg mr-2 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
        >
          Send
        </button>
      </div>
    </div>
  );
}
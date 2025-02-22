import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function MessageBox() {
  const { userId: receiverId } = useParams(); // receiverId from URL params
  const [messages, setMessages] = useState<
    { senderId: string; receiverId: string; content: string }[]
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
    axios
      .get(`https://uni-networking-app.onrender.com/api/v1/message/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setMessages(res.data);
          console.log("Previous messages fetched:", res.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  
    // Initialize Socket.IO connection
    const newSocket = io("https://uni-networking-app.onrender.com", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: {
        token: token,
      },
    });
  
    setSocket(newSocket);
  
    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
      newSocket.emit("joinRoom", { receiverId });
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
  
    return () => {
      newSocket.disconnect();
    };
  }, [receiverId]);

  // Send message handler
  const sendMessage = () => {
    if (newMessage.trim() === "" || !socket || !receiverId) return;

    // Send only receiverId and content
    socket.emit("sendMessage", { receiverId, content: newMessage });

    // Optimistically update the UI
    setMessages((prev) => [
      ...prev,
      { senderId: "me", receiverId, content: newMessage }, // Temporary senderId
    ]);
    setNewMessage("");
  };

  return (
    <div>
      <h1>Chat</h1>
      <div
        style={{
          border: "1px solid black",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
        }}
      >
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <p
              key={index}
              style={{ textAlign: msg.senderId === "me" ? "right" : "left" }}
            >
              {msg.content}
            </p>
          ))
        ) : (
          <p>No messages yet</p>
        )}
      </div>

      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
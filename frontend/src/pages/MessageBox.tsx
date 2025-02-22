import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function MessageBox() {
  const { userId } = useParams();
  const [messages, setMessages] = useState<{ senderId: string; receiverId: string; content: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState<{ id: string; isOnline: boolean }[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io("https://uni-networking-app.onrender.com", { withCredentials: true });
    setSocket(newSocket);

    newSocket.emit("join", { userId });

    axios
      .get(`https://uni-networking-app.onrender.com/api/v1/message/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setMessages(res.data);
        }
      });

    newSocket.on("receiveMessage", (message: any) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on("updateUserStatus", (data: any) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === data.userId ? { ...user, isOnline: data.isOnline } : user
        )
      );
    });

    return () => {
      newSocket.emit("leave", { userId });
      newSocket.off("receiveMessage");
      newSocket.off("updateUserStatus");
      newSocket.disconnect();
    };
  }, [userId]);

  const sendMessage = () => {
    if (newMessage.trim() === "" || !socket) return;

    const senderId = localStorage.getItem("userId"); // Assuming userId is stored in localStorage
    if (!senderId) return;

    const messageData = {
      senderId,
      receiverId: userId!,
      content: newMessage,
    };

    socket.emit("sendMessage", messageData);

    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");
  };

  return (
    <div>
      <h1>Chat</h1>
      <div style={{ border: "1px solid black", padding: "10px", height: "300px", overflowY: "scroll" }}>
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <p key={index} style={{ textAlign: msg.senderId === userId ? "right" : "left" }}>
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

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'

export default function MessageBox () {
    const { recipientId } = useParams();
    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const webSocket = new WebSocket('ws://localhost:8080');
        setWs(webSocket);

        webSocket.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        webSocket.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        };

        webSocket.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        return () => {
            webSocket.close();
        };
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`/api/messages/${recipientId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setMessages(response.data.messages);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        };

        fetchMessages();
    }, [recipientId]);

    interface Message {
        senderId: string;
        content: string;
    }

    const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    };

    const handleSendMessage = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const token = localStorage.getItem('token');
            const messageData = {
                receiverId: recipientId,
                content: message,
            };
            ws.send(JSON.stringify(messageData));
            setMessage('');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-4">Chat with {recipientId}</h2>
            <div className="bg-gray-100 p-4 rounded-lg shadow-lg mb-4 h-80 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-2 p-2 rounded-lg ${msg.senderId === localStorage.getItem('userId') ? 'bg-blue-200 text-right' : 'bg-gray-200 text-left'}`}
                    >
                        <strong>{msg.senderId === localStorage.getItem('userId') ? 'You' : 'Them'}: </strong>
                        {msg.content}
                    </div>
                ))}
            </div>
            <div className="flex items-center">
                <input
                    type="text"
                    value={message}
                    onChange={handleMessageChange}
                    className="flex-grow p-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-300"
                    placeholder="Type your message..."
                />
                <button
                    onClick={handleSendMessage}
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600"
                >
                    Send
                </button>
            </div>
        </div>
    );
};



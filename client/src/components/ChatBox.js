import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, User, Store } from 'lucide-react';
import axios from 'axios';
import { API_ROOT } from '../config';

function ChatBox({ currentUser, targetUser, targetRole, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [targetUser]);

    useEffect(scrollToBottom, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${API_ROOT}/chat/${currentUser.id}/${targetUser.id}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching chat:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const messageData = {
                senderId: currentUser.id,
                receiverId: targetUser.id,
                senderRole: currentUser.userType,
                content: newMessage
            };
            await axios.post(`${API_ROOT}/chat`, messageData);
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col z-[100] overflow-hidden animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                        {targetRole === 'seller' ? <Store size={20} /> : <User size={20} />}
                    </div>
                    <div>
                        <p className="font-bold leading-none">{targetUser.name}</p>
                        <p className="text-xs opacity-70 mt-1 uppercase tracking-wider">{targetRole}</p>
                    </div>
                </div>
                <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition"><X size={20} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 h-[400px] overflow-y-auto bg-gray-50 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                        <MessageSquare size={48} className="mb-2" />
                        <p className="text-sm font-medium">Start the conversation...</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.senderId === currentUser.id
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                                }`}>
                                {msg.content}
                                <p className={`text-[10px] mt-1 opacity-70 ${msg.senderId === currentUser.id ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}

export default ChatBox;

'use client';

import React, { useState, useEffect, useRef } from 'react';
import api, { ChatMessage, ChatRoom } from '@/app/services/api';
import { FiX, FiSend, FiMessageCircle } from 'react-icons/fi';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number | null;
  onRoomCreated: (roomId: number) => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 0,
  room: 0,
  sender: null,
  sender_name: 'System',
  sender_type: 'admin',
  message: 'Welcome! How can we help you today?',
  is_read: true,
  created_at: new Date().toISOString(),
};

export default function ChatWindow({ isOpen, onClose, roomId, onRoomCreated }: ChatWindowProps) {
  const [room, setRoom] = useState<number | null>(roomId);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [step, setStep] = useState<'name' | 'chat'>('name');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (roomId && isOpen) {
      setRoom(roomId);
      setStep('chat');
      loadMessages(roomId);
    }
  }, [roomId, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!room || step !== 'chat') return;
    const interval = setInterval(() => loadMessages(room), 3000);
    return () => clearInterval(interval);
  }, [room, step]);

  const loadMessages = async (roomId: number) => {
    try {
      const res = await api.get(`/chat/room/${roomId}/messages/`);
      setMessages([WELCOME_MESSAGE, ...res.data]);
    } catch {}
  };

  const handleStartChat = async () => {
    if (!visitorName.trim()) return;
    try {
      const res = await api.post('/chat/room/', {
        visitor_name: visitorName.trim(),
        visitor_email: visitorEmail.trim(),
      });
      setRoom(res.data.id);
      setStep('chat');
      onRoomCreated(res.data.id);
      const messagesRes = await api.get(`/chat/room/${res.data.id}/messages/`);
      setMessages([WELCOME_MESSAGE, ...messagesRes.data]);
    } catch {}
  };

  const handleSend = async () => {
    if (!input.trim() || !room) return;
    const text = input.trim();
    setInput('');
    try {
      const res = await api.post(`/chat/room/${room}/messages/`, {
        message: text,
        sender_name: visitorName.trim(),
      });
      setMessages((prev) => [...prev, res.data]);
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden" style={{ height: '500px' }}>
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiMessageCircle size={20} />
          <span className="font-semibold">Chat with Us</span>
        </div>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <FiX size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {step === 'name' ? (
          <div className="flex-1 p-6 flex flex-col justify-center gap-4">
            <p className="text-gray-600 text-sm text-center">Enter your name to start chatting</p>
            <input
              type="text"
              placeholder="Your name"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleStartChat()}
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleStartChat}
              disabled={!visitorName.trim()}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Start Chat
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.sender_type === 'visitor'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-3 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
              >
                <FiSend size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

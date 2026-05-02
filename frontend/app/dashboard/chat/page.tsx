'use client';

import React, { useEffect, useState } from 'react';
import api, { ChatRoom, ChatMessage } from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiSend, FiMessageCircle, FiToggleLeft, FiToggleRight, FiArrowLeft } from 'react-icons/fi';

export default function AdminChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchRooms();
      checkAvailability();
    }
  }, [user]);

  useEffect(() => {
    if (!selectedRoom) return;
    loadMessages(selectedRoom);
    const interval = setInterval(() => loadMessages(selectedRoom), 3000);
    return () => clearInterval(interval);
  }, [selectedRoom]);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/chat/admin-rooms/');
      setRooms(res.data);
    } catch {}
    finally {
      setLoadingData(false);
    }
  };

  const checkAvailability = async () => {
    try {
      const res = await api.get('/chat/admin-availability/');
      setIsAvailable(res.data.is_available);
    } catch {}
  };

  const toggleAvailability = async () => {
    try {
      await api.post('/chat/admin-availability/', { is_available: !isAvailable });
      setIsAvailable(!isAvailable);
    } catch {}
  };

  const loadMessages = async (roomId: number) => {
    try {
      const res = await api.get(`/chat/admin-rooms/${roomId}/messages/`);
      setMessages(res.data);
    } catch {}
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedRoom) return;
    const text = input.trim();
    setInput('');
    try {
      const res = await api.post(`/chat/admin-rooms/${selectedRoom}/send/`, { message: text });
      setMessages((prev) => [...prev, res.data]);
      fetchRooms();
    } catch {}
  };

  if (loading || loadingData) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Chat Management</h1>
        </div>
        <button
          onClick={toggleAvailability}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {isAvailable ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
          {isAvailable ? 'Available' : 'Offline'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Room List */}
        <div className="col-span-1 bg-white rounded-lg shadow overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-700">Active Chats</h2>
          </div>
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                selectedRoom === room.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiMessageCircle className="text-gray-400" />
                  <span className="font-medium text-sm">{room.visitor_name}</span>
                </div>
                {room.unread_count > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {room.unread_count}
                  </span>
                )}
              </div>
              {room.last_message && (
                <p className="text-xs text-gray-500 mt-1 truncate">{room.last_message.message}</p>
              )}
            </button>
          ))}
          {rooms.length === 0 && (
            <div className="p-8 text-center text-gray-400">No chat conversations yet</div>
          )}
        </div>

        {/* Chat Area */}
        <div className="col-span-2 bg-white rounded-lg shadow flex flex-col">
          {selectedRoom ? (
            <>
              <div className="p-4 border-b">
                <h2 className="font-semibold">
                  {rooms.find((r) => r.id === selectedRoom)?.visitor_name || 'Chat'}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                      msg.sender_type === 'admin'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 p-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a reply..."
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
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a chat to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

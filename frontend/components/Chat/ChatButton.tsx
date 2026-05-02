'use client';

import React, { useState, useEffect } from 'react';
import { FiMessageCircle } from 'react-icons/fi';

interface ChatButtonProps {
  onClick: () => void;
}

export default function ChatButton({ onClick }: ChatButtonProps) {
  const [isAdminAvailable, setIsAdminAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/chat/admin-availability/')
      .then((res) => res.json())
      .then((data) => setIsAdminAvailable(data.is_available))
      .catch(() => setIsAdminAvailable(true));
  }, []);

  if (isAdminAvailable === false) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50"
    >
      <FiMessageCircle size={28} />
    </button>
  );
}

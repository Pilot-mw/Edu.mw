'use client';

import React, { useState, useCallback } from 'react';
import ChatWindow from './ChatWindow';
import ChatButton from './ChatButton';

export default function ChatProvider() {
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleRoomCreated = useCallback((id: number) => {
    setRoomId(id);
  }, []);

  return (
    <>
      <ChatButton onClick={handleOpen} />
      <ChatWindow isOpen={isOpen} onClose={handleClose} roomId={roomId} onRoomCreated={handleRoomCreated} />
    </>
  );
}

'use client';

import React from 'react';
import { FiMenu } from 'react-icons/fi';
import { useAuth } from '@/app/context/AuthContext';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <FiMenu size={24} />
        </button>

        <div className="flex items-center space-x-4">
          {user && <NotificationBell />}
          <span className="text-gray-700">{user?.full_name}</span>
          <span className="px-3 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full capitalize">
            {user?.role}
          </span>
        </div>
      </div>
    </header>
  );
}

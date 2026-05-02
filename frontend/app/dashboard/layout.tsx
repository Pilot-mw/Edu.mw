'use client';

import React, { useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import { NotificationsProvider } from '@/app/context/NotificationsContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <NotificationsProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 lg:ml-64">
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </div>
    </NotificationsProvider>
  );
}

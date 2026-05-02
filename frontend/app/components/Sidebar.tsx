'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import {
  FiHome,
  FiUsers,
  FiBook,
  FiDollarSign,
  FiBarChart2,
  FiUser,
  FiLogOut,
  FiX,
  FiSettings,
  FiFileText,
  FiMessageCircle,
  FiClipboard,
  FiLock,
  FiUpload,
  FiBell,
} from 'react-icons/fi';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const adminLinks = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: FiHome },
    { name: 'Students', href: '/dashboard/students', icon: FiUsers },
    { name: 'Teachers', href: '/dashboard/teachers', icon: FiUser },
    { name: 'Academics', href: '/dashboard/academics', icon: FiBook },
    { name: 'Fees', href: '/dashboard/fees', icon: FiDollarSign },
    { name: 'Results', href: '/dashboard/results', icon: FiBarChart2 },
    { name: 'News', href: '/dashboard/news', icon: FiFileText },
    { name: 'Receipts', href: '/dashboard/receipts', icon: FiFileText },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: FiFileText },
    { name: 'Chat', href: '/dashboard/chat', icon: FiMessageCircle },
    { name: 'Applications', href: '/dashboard/applications', icon: FiClipboard },
    { name: 'Memos', href: '/dashboard/memos', icon: FiBell },
    { name: 'Bulk Import', href: '/dashboard/import', icon: FiUpload },
    { name: 'Settings', href: '/dashboard/settings', icon: FiSettings },
  ];

  const teacherLinks = [
    { name: 'Dashboard', href: '/dashboard/teacher', icon: FiHome },
    { name: 'My Classes', href: '/dashboard/teacher/classes', icon: FiBook },
    { name: 'Enter Marks', href: '/dashboard/teacher/marks', icon: FiBarChart2 },
    { name: 'Memos', href: '/dashboard/teacher/memos', icon: FiBell },
    { name: 'My Reports', href: '/dashboard/teacher/reports', icon: FiFileText },
    { name: 'News', href: '/dashboard/news', icon: FiFileText },
    { name: 'Change Password', href: '/dashboard/password', icon: FiLock },
  ];

  const studentLinks = [
    { name: 'Dashboard', href: '/dashboard/student', icon: FiHome },
    { name: 'My Profile', href: '/dashboard/student/profile', icon: FiUser },
    { name: 'My Results', href: '/dashboard/student/results', icon: FiBarChart2 },
    { name: 'Memos', href: '/dashboard/student/memos', icon: FiBell },
    { name: 'Change Password', href: '/dashboard/password', icon: FiLock },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'admin':
        return adminLinks;
      case 'teacher':
        return teacherLinks;
      case 'student':
        return studentLinks;
      default:
        return [];
    }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-blue-800">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.jpg"
              alt="HPSS Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain rounded"
            />
            <span className="text-xl font-bold">HPSS</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <FiX size={24} />
          </button>
        </div>

        <nav className="mt-8 px-4">
          {getLinks().map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                  pathname === link.href
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-800'
                }`}
              >
                <Icon className="mr-3" size={20} />
                {link.name}
              </Link>
            );
          })}

          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 mb-2 rounded-lg text-blue-100 hover:bg-blue-800 transition-colors"
          >
            <FiLogOut className="mr-3" size={20} />
            Logout
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-blue-800">
          <p className="text-sm text-blue-200">
            {user?.full_name}
          </p>
          <p className="text-xs text-blue-300 capitalize">{user?.role}</p>
        </div>
      </div>
    </>
  );
}

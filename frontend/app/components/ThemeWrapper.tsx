'use client';

import React, { useState, useEffect } from 'react';
import api, { SchoolSettings } from '@/app/services/api';
import Link from 'next/link';
import { FiBook, FiMapPin, FiPhone } from 'react-icons/fi';
import Logo from '@/app/components/Logo';
import { useSettings } from '@/app/context/SettingsContext';
import ChatProvider from '@/components/Chat/ChatProvider';
import Layout from '@/components/Layout';

const themes = {
  blue: { primary: '#1E40AF', secondary: '#3B82F6' },
  green: { primary: '#065F46', secondary: '#10B981' },
  red: { primary: '#7C2D12', secondary: '#EF4444' },
  custom: { primary: '#1E40AF', secondary: '#3B82F6' },
};

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useSettings();
  const [primaryColor, setPrimaryColor] = useState('#1E40AF');
  const [secondaryColor, setSecondaryColor] = useState('#3B82F6');

  useEffect(() => {
    if (settings) {
      const themeColors = themes[settings.theme as keyof typeof themes];
      if (settings.theme === 'custom') {
        setPrimaryColor(settings.primary_color);
        setSecondaryColor(settings.secondary_color);
      } else if (themeColors) {
        setPrimaryColor(themeColors.primary);
        setSecondaryColor(themeColors.secondary);
        if (settings.primary_color !== themeColors.primary || settings.secondary_color !== themeColors.secondary) {
          api.patch('/dashboard/settings/', { primary_color: themeColors.primary, secondary_color: themeColors.secondary });
        }
      }
    }
  }, [settings]);

  const lighten = (color: string, amount: number) => {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
    const b = Math.min(255, (num & 0x0000ff) + amount);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };

  const lighterBg = lighten(primaryColor, 40);
  const lighterText = lighten(primaryColor, 100);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <style jsx global>{`
        :root {
          --primary: ${primaryColor};
          --secondary: ${secondaryColor};
          --primary-light: ${lighterBg};
          --primary-text: ${lighterText};
        }
        .nav-primary { background-color: ${primaryColor}; }
        .nav-link:hover { color: ${lighterText}; }
        .footer-primary { background-color: ${primaryColor}; }
        .footer-border { border-color: ${lighterBg}; }
        .footer-text { color: ${lighterText}; }
        .login-bg { background-color: white; color: ${primaryColor}; }
        .login-hover:hover { background-color: ${lighterBg}; }
      `}</style>

      <nav className="nav-primary text-white shadow-lg">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Logo size="lg" showText={false} />
            <div className="hidden md:flex space-x-8 items-center">
              <Link href="/" className="nav-link transition-colors">Home</Link>
              <Link href="/about" className="nav-link transition-colors">About</Link>
              <Link href="/academics" className="nav-link transition-colors">Academics</Link>
              <Link href="/admissions" className="nav-link transition-colors">Admissions</Link>
              <Link href="/news" className="nav-link transition-colors">News</Link>
              <Link href="/contact" className="nav-link transition-colors">Contact</Link>
            </div>
            <Link
              href="/login"
              className="login-bg login-hover px-4 py-2 rounded-lg font-semibold"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <Layout>{children}</Layout>
      <ChatProvider />

      <footer className="footer-primary text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{settings?.short_name || 'High Profile School'}</h3>
              <p className="footer-text">
                {settings?.motto || 'Excellence in education'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 footer-text">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/academics" className="hover:text-white">Academics</Link></li>
                <li><Link href="/admissions" className="hover:text-white">Admissions</Link></li>
                <li><Link href="/news" className="hover:text-white">News</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 footer-text">
                <p className="flex items-center"><FiMapPin className="mr-2" /> {settings?.address || 'Zomba, Malawi'}</p>
                <p className="flex items-center"><FiPhone className="mr-2" /> {settings?.phone || '+265 1 234 567'}</p>
                <p className="flex items-center"><FiBook className="mr-2" /> {settings?.email || 'info@highprofile.edu.mw'}</p>
              </div>
            </div>
          </div>
          <div className="footer-border border-t mt-8 pt-8 text-center footer-text">
            <p>&copy; 2026 {settings?.name || 'High Profile Private Secondary School'}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

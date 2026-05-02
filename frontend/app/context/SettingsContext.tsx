'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { SchoolSettings } from '@/app/services/api';

interface SettingsContextType {
  settings: SchoolSettings | null;
  loading: boolean;
  updateSetting: (key: keyof SchoolSettings, value: string) => void;
  updateSettings: (updates: Partial<SchoolSettings>) => void;
}

const defaultSettings: SchoolSettings = {
  id: 1,
  name: 'High Profile Private Secondary School',
  short_name: 'HPSS',
  motto: 'Excellence in Education',
  address: 'Zomba, Malawi',
  phone: '+265 1 234 567',
  email: 'info@highprofile.edu.mw',
  primary_color: '#1E40AF',
  secondary_color: '#3B82F6',
  theme: 'blue',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/dashboard/settings/');
      setSettings(res.data);
    } catch {
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (key: keyof SchoolSettings, value: string) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await api.patch('/dashboard/settings/', { [key]: value });
    } catch {}
  };

  const updateSettings = async (updates: Partial<SchoolSettings>) => {
    if (!settings) return;
    const updated = { ...settings, ...updates };
    setSettings(updated);
    try {
      await api.patch('/dashboard/settings/', updates);
      await fetchSettings();
    } catch {}
  };

  return (
    <SettingsContext.Provider value={{ settings: settings || defaultSettings, loading, updateSetting, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useSettings } from '@/app/context/SettingsContext';
import { FiSave, FiGlobe } from 'react-icons/fi';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading, updateSettings } = useSettings();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: settings?.name || '',
    short_name: settings?.short_name || '',
    address: settings?.address || '',
    phone: settings?.phone || '',
    email: settings?.email || '',
    motto: settings?.motto || '',
    primary_color: settings?.primary_color || '#1E40AF',
    secondary_color: settings?.secondary_color || '#3B82F6',
    theme: settings?.theme || 'blue',
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name,
        short_name: settings.short_name,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        motto: settings.motto,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        theme: settings.theme,
      });
    }
  }, [settings]);

  if (!authLoading && (!user || user.role !== 'admin')) {
    router.push('/login');
    return null;
  }

  if (settingsLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (updates: Partial<typeof formData>) => {
    setIsSaving(true);
    try {
      await updateSettings(updates);
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="mr-4 text-gray-600 hover:text-gray-900">
          <FiGlobe size={24} />
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <FiGlobe className="mr-2" /> School Information
          </h3>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {['name', 'short_name', 'address', 'phone', 'email', 'motto'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field.replace('_', ' ')}
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => handleSave({ name: formData.name, short_name: formData.short_name, address: formData.address, phone: formData.phone, email: formData.email, motto: formData.motto })}
            disabled={isSaving}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            <FiSave className="mr-2" /> Save School Info
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Theme & Colors</h3>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {['primary_color', 'secondary_color'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field.replace('_', ' ')}
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    name={field}
                    value={formData[field as keyof typeof formData]}
                    onChange={handleChange}
                    className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    name={field}
                    value={formData[field as keyof typeof formData]}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg text-white mb-6" style={{ backgroundColor: formData.primary_color }}>
            <h4 className="font-bold">Primary Color Preview</h4>
            <p style={{ color: formData.secondary_color }}>Secondary color text preview</p>
            <button className="mt-2 px-4 py-2 rounded" style={{ backgroundColor: formData.secondary_color }}>
              Button Example
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Preset Themes:</p>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setFormData({ ...formData, primary_color: '#1E40AF', secondary_color: '#3B82F6' });
                  handleSave({ primary_color: '#1E40AF', secondary_color: '#3B82F6', theme: 'blue' });
                }}
                className="p-4 rounded-lg text-white font-semibold"
                style={{ backgroundColor: '#1E40AF' }}
              >
                Blue Theme
              </button>
              <button
                onClick={() => {
                  setFormData({ ...formData, primary_color: '#065F46', secondary_color: '#10B981' });
                  handleSave({ primary_color: '#065F46', secondary_color: '#10B981', theme: 'green' });
                }}
                className="p-4 rounded-lg text-white font-semibold"
                style={{ backgroundColor: '#065F46' }}
              >
                Green Theme
              </button>
              <button
                onClick={() => {
                  setFormData({ ...formData, primary_color: '#7C2D12', secondary_color: '#EF4444' });
                  handleSave({ primary_color: '#7C2D12', secondary_color: '#EF4444', theme: 'red' });
                }}
                className="p-4 rounded-lg text-white font-semibold"
                style={{ backgroundColor: '#7C2D12' }}
              >
                Red Theme
              </button>
            </div>
          </div>

          <button
            onClick={() => handleSave({ primary_color: formData.primary_color, secondary_color: formData.secondary_color, theme: 'custom' })}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            <FiSave className="mr-2" /> Save Theme
          </button>
        </div>
      </div>
    </div>
  );
}

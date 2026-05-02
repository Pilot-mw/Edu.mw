'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'admissions', label: 'Admissions' },
  { value: 'academics', label: 'Academics' },
  { value: 'events', label: 'Events' },
  { value: 'sports', label: 'Sports' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'meetings', label: 'Meetings' },
  { value: 'other', label: 'Other' },
];

export default function NewArticlePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'general',
    status: 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!user || !['admin', 'teacher'].includes(user.role))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent, status?: string) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await api.post('/news/news/', {
        ...formData,
        status: status || formData.status,
      });

      router.push('/dashboard/news');
    } catch (err: any) {
      console.error('Failed to create article:', err.response?.data);
      const errorMsg =
        err.response?.data?.detail ||
        (err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create article.');
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">New Article</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Article title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary *
            </label>
            <textarea
              name="summary"
              required
              value={formData.summary}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Short summary shown on the listing page (max 500 characters)"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.summary.length}/500 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              name="content"
              required
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Full article content"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              <FiSave className="mr-2" />
              {saving ? 'Saving...' : 'Save Article'}
            </button>
            <Link
              href="/dashboard/news"
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

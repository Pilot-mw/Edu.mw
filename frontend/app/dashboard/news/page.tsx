'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api, { NewsArticle } from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiPlus, FiArrowLeft, FiEdit2, FiTrash2, FiEye, FiSend } from 'react-icons/fi';

export default function NewsManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!loading && (!user || !['admin', 'teacher'].includes(user.role))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role && ['admin', 'teacher'].includes(user.role)) {
      fetchArticles();
    }
  }, [user, filter]);

  const fetchArticles = async () => {
    try {
      const response = await api.get<NewsArticle[]>('/news/news/', {
        params: { status: filter },
      });
      setArticles(response.data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await api.delete(`/news/news/${id}/`);
        fetchArticles();
      } catch (error) {
        console.error('Failed to delete article:', error);
        alert('Failed to delete article');
      }
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await api.post(`/news/news/${id}/publish/`);
      fetchArticles();
    } catch (error) {
      console.error('Failed to publish article:', error);
      alert('Failed to publish article');
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await api.post(`/news/news/${id}/archive/`);
      fetchArticles();
    } catch (error) {
      console.error('Failed to archive article:', error);
      alert('Failed to archive article');
    }
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  const categoryColors: Record<string, string> = {
    general: 'bg-gray-100 text-gray-800',
    admissions: 'bg-green-100 text-green-800',
    academics: 'bg-blue-100 text-blue-800',
    events: 'bg-purple-100 text-purple-800',
    sports: 'bg-orange-100 text-orange-800',
    infrastructure: 'bg-indigo-100 text-indigo-800',
    meetings: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800',
  };

  if (loading || loadingData) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">News Management</h1>
        </div>
        <Link
          href="/dashboard/news/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <FiPlus className="mr-2" /> New Article
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-2 flex-wrap">
        {['all', 'draft', 'published', 'archived'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No articles found.
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                    {article.title}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[article.category] || categoryColors.other}`}
                    >
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[article.status]}`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{article.author_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString()
                      : new Date(article.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/news/edit/${article.id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </Link>
                      {article.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(article.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Publish"
                        >
                          <FiSend size={16} />
                        </button>
                      )}
                      {article.status === 'published' && (
                        <button
                          onClick={() => handleArchive(article.id)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Archive"
                        >
                          <FiEye size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

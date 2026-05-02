'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import api, { Memo } from '@/app/services/api';
import { FiAlertCircle, FiInbox, FiCalendar, FiDownload, FiFileText, FiImage } from 'react-icons/fi';

export default function StudentMemosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loadingMemos, setLoadingMemos] = useState(true);
  const [filter, setFilter] = useState<'all' | 'students'>('all');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchMemos = useCallback(async () => {
    setLoadingMemos(true);
    try {
      const res = await api.get('/memos/', { params: { audience: 'students' } });
      setMemos(res.data.data);
    } catch {
      setMemos([]);
    } finally {
      setLoadingMemos(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchMemos();
    }
  }, [user, fetchMemos]);

  const filteredMemos = memos.filter((m) => {
    if (filter === 'all') return true;
    return m.audience === filter;
  });

  const audienceBadge = (aud: string) => {
    const colors: Record<string, string> = {
      teachers: 'bg-blue-100 text-blue-800',
      students: 'bg-green-100 text-green-800',
      all: 'bg-purple-100 text-purple-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full capitalize ${colors[aud] || 'bg-gray-100 text-gray-800'}`}>
        {aud}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (type: string | null) => {
    if (type === 'pdf') return <FiFileText />;
    return <FiImage />;
  };

  const getFileTypeLabel = (type: string | null) => {
    if (type === 'pdf') return 'PDF';
    return 'Image';
  };

  if (loading || !user || user.role !== 'student') {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Memos & Announcements</h1>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm font-medium text-gray-600">Filter:</span>
        {(['all', 'students'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-sm rounded-full capitalize ${
              filter === f
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loadingMemos ? (
          <div className="text-center py-8 text-gray-500">Loading memos...</div>
        ) : filteredMemos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiInbox className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No memos yet</h3>
            <p className="text-gray-500 text-sm">Memos from administration will appear here</p>
          </div>
        ) : (
          filteredMemos.map((memo) => (
            <div
              key={memo.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                memo.important ? 'border-l-red-500' : 'border-l-green-500'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {memo.important && (
                      <span className="text-red-500" title="Important">
                        <FiAlertCircle size={18} />
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">{memo.title}</h3>
                    {audienceBadge(memo.audience)}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap mb-3">{memo.message}</p>

                  {memo.attachment_url && (
                    <div className="mb-3">
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}${memo.attachment_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-blue-600 transition-colors"
                      >
                        {getFileIcon(memo.file_type)}
                        {getFileTypeLabel(memo.file_type)}: {memo.file_name}
                        <FiDownload size={14} />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiCalendar size={14} /> {formatDate(memo.created_at)}
                    </span>
                    <span>From: {memo.created_by}</span>
                    {memo.expiry_date && (
                      <span className="text-orange-600">
                        Expires {formatDate(memo.expiry_date)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

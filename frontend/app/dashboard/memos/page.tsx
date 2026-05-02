'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import api, { Memo } from '@/app/services/api';
import { FiPlus, FiTrash2, FiAlertCircle, FiFilter, FiCheck, FiUpload, FiX, FiFileText, FiImage, FiDownload } from 'react-icons/fi';
import axios from 'axios';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function AdminMemosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<'teachers' | 'students' | 'all'>('all');
  const [important, setImportant] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [filter, setFilter] = useState<'all' | 'teachers' | 'students'>('all');
  const [loadingMemos, setLoadingMemos] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchMemos = useCallback(async () => {
    setLoadingMemos(true);
    try {
      const res = await api.get('/memos/');
      setMemos(res.data.data);
    } catch {
      setMemos([]);
    } finally {
      setLoadingMemos(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchMemos();
    }
  }, [user, fetchMemos]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setFileError('Only PDF, JPG, PNG, and GIF files are allowed');
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError('File size must be less than 5MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('error', 'Title and message are required');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('message', message);
      formData.append('audience', audience);
      formData.append('createdBy', user?.full_name || user?.username || 'Unknown');
      formData.append('important', String(important));
      if (expiryDate) formData.append('expiryDate', expiryDate);
      if (file) formData.append('file', file);

      await api.post('/memos/create/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast('success', 'Memo created successfully');
      setTitle('');
      setMessage('');
      setAudience('all');
      setImportant(false);
      setExpiryDate('');
      clearFile();
      fetchMemos();
    } catch (err) {
      console.error('Memo create error:', err);
      showToast('error', 'Failed to create memo: ' + (axios.isAxiosError(err) ? err.response?.data?.message || err.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memo?')) return;
    try {
      await api.delete(`/memos/${id}/delete/`);
      showToast('success', 'Memo deleted');
      fetchMemos();
    } catch {
      showToast('error', 'Failed to delete memo');
    }
  };

  const filteredMemos = memos.filter((m) => {
    if (filter === 'all') return true;
    return m.audience === filter || m.audience === 'all';
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

  if (loading || !user || user.role !== 'admin') {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Memos & Announcements</h1>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? <FiCheck size={18} /> : <FiAlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiPlus /> Create New Memo
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Memo title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Memo content..."
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 mt-1">{message.length}/5000</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as 'teachers' | 'students' | 'all')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All</option>
                  <option value="teachers">Teachers Only</option>
                  <option value="students">Students Only</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="important"
                  checked={important}
                  onChange={(e) => setImportant(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="important" className="text-sm font-medium text-gray-700">
                  Mark as Important
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional)</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiUpload className="mx-auto text-gray-400 mb-1" size={20} />
                  <p className="text-xs text-gray-500">PDF, JPG, PNG (max 5MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {fileError && (
                  <p className="text-xs text-red-500 mt-1">{fileError}</p>
                )}

                {file && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type.includes('pdf') ? 'pdf' : 'image')}
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    </div>
                    <button type="button" onClick={clearFile} className="text-gray-400 hover:text-red-500">
                      <FiX size={16} />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiPlus /> {submitting ? 'Creating...' : 'Create Memo'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Memos</h2>
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-500" size={16} />
                {(['all', 'teachers', 'students'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-sm rounded-full capitalize ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y">
              {loadingMemos ? (
                <div className="p-8 text-center text-gray-500">Loading memos...</div>
              ) : filteredMemos.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No memos yet</div>
              ) : (
                 filteredMemos.map((memo) => (
                  <div key={memo.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {memo.important && (
                            <span className="text-red-500" title="Important">
                              <FiAlertCircle size={16} />
                            </span>
                          )}
                          <h3 className="font-semibold text-gray-900">{memo.title}</h3>
                          {audienceBadge(memo.audience)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">{memo.message}</p>

                        {memo.attachment_url && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}${memo.attachment_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-blue-600 transition-colors"
                          >
                            {getFileIcon(memo.file_type)}
                            {getFileTypeLabel(memo.file_type)}: {memo.file_name}
                            <FiDownload size={14} />
                          </a>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span>By {memo.created_by}</span>
                          <span>{formatDate(memo.created_at)}</span>
                          {memo.expiry_date && (
                            <span className="text-orange-600">Expires {formatDate(memo.expiry_date)}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(memo.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete memo"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

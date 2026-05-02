'use client';

import React, { useEffect, useState } from 'react';
import api, { Application } from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiX, FiEye, FiCopy } from 'react-icons/fi';

interface AcceptCredentials {
  username: string;
  password: string;
  student_id: string;
}

export default function ApplicationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [credentials, setCredentials] = useState<AcceptCredentials | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchApplications();
      fetchStats();
    }
  }, [user, filter]);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/admissions/');
      setApplications(res.data);
    } catch {}
    finally {
      setLoadingData(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admissions/stats/');
      setStats(res.data);
    } catch {}
  };

  const handleAccept = async () => {
    if (!selectedApp) return;
    try {
      const res = await api.post(`/admissions/${selectedApp.id}/accept/`, { admin_notes: adminNotes });
      setCredentials(res.data.credentials || null);
      fetchApplications();
      fetchStats();
    } catch {}
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    try {
      await api.post(`/admissions/${selectedApp.id}/reject/`, { admin_notes: adminNotes });
      fetchApplications();
      fetchStats();
      setShowModal(false);
    } catch {}
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const viewDetails = (app: Application) => {
    setSelectedApp(app);
    setAdminNotes(app.admin_notes);
    setCredentials(null);
    setShowModal(true);
  };

  const filtered = filter === 'all' ? applications : applications.filter((a) => a.status === filter);

  if (loading || loadingData) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Applications</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-sm text-green-600">Accepted</p>
          <p className="text-2xl font-bold text-green-700">{stats.accepted}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <p className="text-sm text-red-600">Rejected</p>
          <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-2">
        {['all', 'pending', 'accepted', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((app) => (
              <tr key={app.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.student_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{app.class_applying}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{app.parent_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{app.parent_phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(app.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => viewDetails(app)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    <FiEye size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">No applications found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Application Details</h2>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-500">Student:</span>
                  <span className="font-medium">{selectedApp.student_name}</span>
                  <span className="text-gray-500">DOB:</span>
                  <span>{selectedApp.date_of_birth}</span>
                  <span className="text-gray-500">Gender:</span>
                  <span>{selectedApp.gender}</span>
                  <span className="text-gray-500">Class:</span>
                  <span className="font-medium">{selectedApp.class_applying}</span>
                  <span className="text-gray-500">Parent:</span>
                  <span>{selectedApp.parent_name}</span>
                  <span className="text-gray-500">Phone:</span>
                  <span>{selectedApp.parent_phone}</span>
                  <span className="text-gray-500">Email:</span>
                  <span>{selectedApp.parent_email || '-'}</span>
                  <span className="text-gray-500">Previous School:</span>
                  <span>{selectedApp.previous_school || '-'}</span>
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium capitalize">{selectedApp.status}</span>
                </div>
                {selectedApp.admin_notes && (
                  <div>
                    <span className="text-gray-500 block mb-1">Admin Notes:</span>
                    <p className="bg-gray-50 p-3 rounded">{selectedApp.admin_notes}</p>
                  </div>
                )}
              </div>

              {credentials && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Account Created</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between bg-white p-2 rounded">
                      <span className="text-gray-500">Username:</span>
                      <span className="font-mono font-medium">{credentials.username}</span>
                      <button onClick={() => copyToClipboard(credentials.username)} className="text-green-600 hover:text-green-800 ml-2">
                        <FiCopy size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2 rounded">
                      <span className="text-gray-500">Password:</span>
                      <span className="font-mono font-medium">{credentials.password}</span>
                      <button onClick={() => copyToClipboard(credentials.password)} className="text-green-600 hover:text-green-800 ml-2">
                        <FiCopy size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2 rounded">
                      <span className="text-gray-500">Student ID:</span>
                      <span className="font-mono font-medium">{credentials.student_id}</span>
                      <button onClick={() => copyToClipboard(credentials.student_id)} className="text-green-600 hover:text-green-800 ml-2">
                        <FiCopy size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">Share these credentials with the student</p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                  >
                    Done
                  </button>
                </div>
              )}

              {selectedApp.status === 'pending' && !credentials && (
                <div className="mt-6 pt-4 border-t">
                  <textarea
                    placeholder="Add notes..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleAccept}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <FiCheck size={18} /> Accept
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <FiX size={18} /> Reject
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="mt-4 w-full text-gray-600 py-2 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

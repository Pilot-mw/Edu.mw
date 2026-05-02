'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiFile, FiDownload, FiSend, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';

interface TeacherReport {
  id: number;
  teacher_name: string;
  title: string;
  content: string;
  report_type: string;
  file_url: string | null;
  status: string;
  admin_response?: string;
  created_at: string;
}

export default function AdminReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<TeacherReport[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<TeacherReport | null>(null);
  const [responseText, setResponseText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchReports();
    }
  }, [user, filterStatus]);

  const fetchReports = async () => {
    try {
      const params: any = {};
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      const response = await api.get<TeacherReport[]>('/teachers/reports/', { params });
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setError('Failed to load reports');
    } finally {
      setLoadingData(false);
    }
  };

  const handleApprove = async (reportId: number) => {
    try {
      await api.post(`/teachers/reports/${reportId}/review/`, {
        status: 'approved',
        admin_response: responseText || 'Approved'
      });
      setSelectedReport(null);
      setResponseText('');
      fetchReports();
    } catch (err: any) {
      console.error('Approve error:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to approve report');
    }
  };

  const handleReject = async (reportId: number) => {
    try {
      await api.post(`/teachers/reports/${reportId}/review/`, {
        status: 'rejected',
        admin_response: responseText || 'Rejected'
      });
      setSelectedReport(null);
      setResponseText('');
      fetchReports();
    } catch (err: any) {
      console.error('Reject error:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to reject report');
    }
  };

  const exportToCSV = () => {
    const headers = ['Teacher', 'Title', 'Type', 'Status', 'Date', 'Response'];
    const rows = reports.map(r => [
      r.teacher_name,
      r.title,
      r.report_type,
      r.status,
      new Date(r.created_at).toLocaleDateString(),
      r.admin_response || 'Pending'
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher_reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToJSON = () => {
    const json = JSON.stringify(reports, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher_reports_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const forwardReport = (report: TeacherReport) => {
    const subject = `Forwarded Report: ${report.title}`;
    const body = `Report from: ${report.teacher_name}\nType: ${report.report_type}\nDate: ${new Date(report.created_at).toLocaleDateString()}\n\nContent:\n${report.content}\n\nAdmin Response: ${report.admin_response || 'N/A'}`;
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
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
          <h1 className="text-2xl font-bold">Manage Teacher Reports</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
          >
            <FiDownload className="mr-2" /> Export CSV
          </button>
          <button
            onClick={exportToJSON}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <FiDownload className="mr-2" /> Export JSON
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {report.teacher_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {report.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {report.report_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(report.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.file_url ? (
                    <a href={report.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                      <FiFile />
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.status === 'approved' ? 'bg-green-100 text-green-800' :
                    report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => forwardReport(report)}
                    className="text-green-600 hover:text-green-900"
                    title="Forward via Email"
                  >
                    <FiSend />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No reports found.
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Review Report</h2>
              <button onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Teacher: <span className="font-semibold">{selectedReport.teacher_name}</span></p>
                <p className="text-sm text-gray-600">Type: <span className="font-semibold capitalize">{selectedReport.report_type}</span></p>
                <p className="text-sm text-gray-600">Date: <span className="font-semibold">{new Date(selectedReport.created_at).toLocaleDateString()}</span></p>
              </div>
              
              <div>
                <h3 className="font-semibold">{selectedReport.title}</h3>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{selectedReport.content}</p>
              </div>

              {selectedReport.file_url && (
                <div>
                  <a href={selectedReport.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                    <FiFile className="mr-2" /> View Attached File
                  </a>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter your response..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleApprove(selectedReport.id)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-green-700"
                >
                  <FiCheck className="mr-2" /> Approve
                </button>
                <button
                  onClick={() => handleReject(selectedReport.id)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-red-700"
                >
                  <FiX className="mr-2" /> Reject
                </button>
                <button
                  onClick={() => forwardReport(selectedReport)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700"
                >
                  <FiSend className="mr-2" /> Forward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

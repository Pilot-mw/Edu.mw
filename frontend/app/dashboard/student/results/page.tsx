'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import api, { StudentResult, Mark } from '@/app/services/api';
import { useRouter } from 'next/navigation';

export default function StudentResultsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchResults();
    }
  }, [user]);

  const fetchResults = async () => {
    try {
      console.log('Fetching results for user:', user);
      const [resultsRes, marksRes] = await Promise.all([
        api.get('/results/results/', {
          params: { student: user?.id },
        }),
        api.get('/results/marks/', {
          params: { student: user?.id },
        }),
      ]);
      console.log('Results response:', resultsRes.data);
      console.log('Marks response:', marksRes.data);
      
      const resultsData = resultsRes.data;
      const marksData = marksRes.data;
      
      const resultsArray = Array.isArray(resultsData) ? resultsData : (resultsData.results || []);
      const marksArray = Array.isArray(marksData) ? marksData : (marksData.results || []);
      
      console.log('Processed results:', resultsArray);
      console.log('Processed marks:', marksArray);
      
      setResults(resultsArray);
      setMarks(marksArray);
    } catch (err: any) {
      console.error('Failed to fetch results:', err.response?.data || err.message);
      setError('Failed to load results: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingData(false);
    }
  };

  const getGradeColor = (grade: string | undefined) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getDivisionColor = (division: string | undefined) => {
    if (!division) return 'bg-gray-100 text-gray-800';
    if (division === 'Division I') return 'bg-green-100 text-green-800';
    if (division === 'Division II') return 'bg-blue-100 text-blue-800';
    if (division === 'Division III') return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  if (loading || loadingData) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // Ensure results is always an array
  const safeResults = Array.isArray(results) ? results : [];
  const safeMarks = Array.isArray(marks) ? marks : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Results</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Exam Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {safeResults.map((result) => (
          <div key={result.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">{result.exam_name || 'N/A'}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Average</span>
                <span className="font-semibold">
                  {result.average_marks ? result.average_marks.toFixed(2) : '0.00'}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Points</span>
                <span className="font-semibold">{result.total_points || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Division</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium ${getDivisionColor(result.division)}`}
                >
                  {result.division || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Position</span>
                <span className="font-semibold">
                  {result.position || 'N/A'}
                  <span className="text-sm text-gray-500"> / {result.class_name || 'N/A'}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Individual Subject Marks */}
      {marks.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Subject Marks</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {marks.map((mark) => (
                <tr key={mark.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mark.subject_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mark.exam_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mark.marks_obtained || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${getGradeColor(mark.grade)}`}
                    >
                      {mark.grade || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mark.points || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results.length === 0 && marks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No results available yet.</p>
        </div>
      )}
    </div>
  );
}

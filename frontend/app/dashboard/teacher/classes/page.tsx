'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import api, { ClassSubject } from '@/app/services/api';
import { FiArrowLeft } from 'react-icons/fi';

export default function MyClassesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'teacher')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const response = await api.get<ClassSubject[]>('/academics/class-subjects/', {
        params: { teacher: user?.id },
      });
      setClassSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch class subjects:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
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
        <h1 className="text-2xl font-bold">My Classes</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Subject Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classSubjects.map((cs) => (
              <tr key={cs.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cs.class_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cs.subject_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cs.subject_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => router.push(`/dashboard/teacher/marks`)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Enter Marks
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {classSubjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No classes assigned yet.
          </div>
        )}
      </div>
    </div>
  );
}

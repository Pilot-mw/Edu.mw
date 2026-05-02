'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import api, { Student, Mark, ClassSubject } from '@/app/services/api';
import { useRouter } from 'next/navigation';
import { FiBook, FiUsers, FiBarChart2 } from 'react-icons/fi';

export default function TeacherDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [recentMarks, setRecentMarks] = useState<Mark[]>([]);
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
      const [subjectsRes, studentsRes, marksRes] = await Promise.all([
        api.get<ClassSubject[]>('/academics/class-subjects/', {
          params: { teacher: user?.id },
        }),
        api.get<Student[]>('/students/students/'),
        api.get<Mark[]>('/results/marks/', {
          params: { teacher: user?.id },
        }),
      ]);

      setClassSubjects(subjectsRes.data);
      setTotalStudents(studentsRes.data.length);
      setRecentMarks(marksRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">My Classes</p>
              <p className="text-3xl font-bold text-blue-600">
                {classSubjects.length}
              </p>
            </div>
            <FiBook className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-green-600">{totalStudents}</p>
            </div>
            <FiUsers className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Marks Entered</p>
              <p className="text-3xl font-bold text-purple-600">
                {recentMarks.length}
              </p>
            </div>
            <FiBarChart2 className="text-purple-600" size={32} />
          </div>
        </div>
      </div>

      {/* My Classes */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">My Classes</h3>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {classSubjects.map((cs) => (
              <div key={cs.id} className="border p-4 rounded-lg">
                <h4 className="font-semibold">{cs.class_name}</h4>
                <p className="text-sm text-gray-600">{cs.subject_name}</p>
                <p className="text-xs text-gray-500 mt-2">Code: {cs.subject_code}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Marks */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Marks Entered</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentMarks.map((mark) => (
                <tr key={mark.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mark.student_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mark.subject_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mark.marks_obtained}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        mark.grade === 'A'
                          ? 'bg-green-100 text-green-800'
                          : mark.grade === 'B'
                          ? 'bg-blue-100 text-blue-800'
                          : mark.grade === 'C'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {mark.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

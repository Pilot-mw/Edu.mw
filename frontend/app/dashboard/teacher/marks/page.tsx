'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import api, { ClassSubject, Student, Exam } from '@/app/services/api';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

export default function EnterMarksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [selectedClassSubject, setSelectedClassSubject] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [marks, setMarks] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'teacher')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchClassSubjects();
      fetchExams();
    }
  }, [user]);

  const fetchClassSubjects = async () => {
    try {
      const response = await api.get<ClassSubject[]>('/academics/class-subjects/', {
        params: { teacher: user?.id },
      });
      setClassSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch class subjects:', error);
      setError('Failed to load your classes. Please try again.');
    }
  };

  const fetchExams = async () => {
    try {
      const response = await api.get<Exam[]>('/results/exams/');
      setExams(response.data);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    }
  };

  const handleClassSubjectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedClassSubject(value);
    setMarks({});
    setError('');
    setSuccess('');

    if (value) {
      try {
        const cs = classSubjects.find((item) => item.id.toString() === value);
        if (cs) {
          const studentsRes = await api.get<Student[]>('/students/students/', {
            params: { class_room: cs.class_room },
          });
          setStudents(studentsRes.data);

          // Fetch existing marks
          const marksRes = await api.get<any[]>('/results/marks/', {
            params: { class_room: cs.class_room, subject: cs.subject },
          });

          const marksMap: { [key: string]: string } = {};
          marksRes.data.forEach((mark: any) => {
            marksMap[mark.student.toString()] = mark.marks_obtained.toString();
          });
          setMarks(marksMap);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load students. Please try again.');
      }
    } else {
      setStudents([]);
    }
  };

  const handleMarkChange = (studentId: string, value: string) => {
    setMarks({
      ...marks,
      [studentId]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!selectedClassSubject || !selectedExam) {
      setError('Please select class subject and exam');
      setSaving(false);
      return;
    }

    try {
      const cs = classSubjects.find((item) => item.id.toString() === selectedClassSubject);
      
      if (!cs) {
        setError('Invalid class subject selected');
        setSaving(false);
        return;
      }

      // Save marks for each student
      for (const [studentId, markValue] of Object.entries(marks)) {
        if (!markValue || markValue.trim() === '') continue;

        const mark = parseFloat(markValue);
        if (isNaN(mark) || mark < 0 || mark > 100) {
          setError(`Invalid mark for student ID ${studentId}: must be between 0 and 100`);
          setSaving(false);
          return;
        }

        try {
          await api.post('/results/marks/', {
            student: parseInt(studentId),
            subject: cs.subject,
            exam: parseInt(selectedExam),
            marks_obtained: mark,
          });
        } catch (err: any) {
          console.error(`Failed to save mark for student ${studentId}:`, err.response?.data);
          const errorMsg = err.response?.data?.detail ||
                          (err.response?.data && typeof err.response.data === 'object' ?
                           Object.values(err.response.data).flat().join(', ') :
                           'Failed to save marks. Please try again.');
          setError(errorMsg);
          setSaving(false);
          return;
        }
      }

      setSuccess('Marks saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save marks. Please try again.');
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
        <h1 className="text-2xl font-bold">Enter Marks</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class & Subject *
              </label>
              <select
                required
                value={selectedClassSubject}
                onChange={handleClassSubjectChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Class & Subject</option>
                {classSubjects.map((cs) => (
                  <option key={cs.id} value={cs.id}>
                    {cs.class_name} - {cs.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam *
              </label>
              <select
                required
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Exam</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {students.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Marks (0-100)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.user.first_name} {student.user.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={marks[student.id] || ''}
                          onChange={(e) => handleMarkChange(student.id.toString(), e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {students.length > 0 && (
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              <FiSave className="mr-2" />
              {saving ? 'Saving...' : 'Save Marks'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

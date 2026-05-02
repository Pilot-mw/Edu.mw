'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import api, { Student } from '@/app/services/api';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBook, FiCalendar } from 'react-icons/fi';

export default function StudentProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get<Student>('/students/my-profile/');
      setStudent(response.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error || 'Profile not found'}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt={student.user.full_name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-blue-100 flex items-center justify-center">
                <FiUser size={48} className="text-blue-600" />
              </div>
            )}
            <h2 className="text-xl font-semibold">{student.user.full_name}</h2>
            <p className="text-gray-500">{student.student_id}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {student.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Personal Info */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex items-start">
              <FiMail className="text-gray-400 mr-3 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 break-all">{student.user.email}</p>
              </div>
            </div>
            <div className="flex items-start">
              <FiPhone className="text-gray-400 mr-3 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900 break-all">{student.user.phone}</p>
              </div>
            </div>
            <div className="flex items-start">
              <FiCalendar className="text-gray-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="text-gray-900">
                  {new Date(student.date_of_birth).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <FiUser className="text-gray-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="text-gray-900">{student.gender}</p>
              </div>
            </div>
            <div className="flex items-start md:col-span-2">
              <FiMapPin className="text-gray-400 mr-3 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-gray-900 break-words">{student.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className="md:col-span-3 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <FiBook className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Class</p>
                <p className="text-gray-900">{student.class_room_name}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiCalendar className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Admission Date</p>
                <p className="text-gray-900">
                  {new Date(student.admission_date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <FiUser className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Parent Name</p>
                <p className="text-gray-900">{student.parent_name}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiPhone className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Parent Phone</p>
                <p className="text-gray-900">{student.parent_phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

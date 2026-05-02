'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import api, { StudentResult, Payment } from '@/app/services/api';
import { useRouter } from 'next/navigation';
import { FiBook, FiDollarSign, FiAward } from 'react-icons/fi';

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [resultsRes, paymentsRes] = await Promise.all([
        api.get('/results/results/', {
          params: { student: user?.id },
        }),
        api.get('/fees/payments/', {
          params: { student: user?.id },
        }),
      ]);
      console.log('Results response:', resultsRes.data);
      console.log('Payments response:', paymentsRes.data);
      
      const resultsData = resultsRes.data;
      const paymentsData = paymentsRes.data;
      
      const resultsArray = Array.isArray(resultsData) ? resultsData : (resultsData.results || resultsData);
      const paymentsArray = Array.isArray(paymentsData) ? paymentsData : (paymentsData.results || paymentsData);
      
      setResults(resultsArray);
      setPayments(paymentsArray);
    } catch (error: any) {
      console.error('Failed to fetch data:', error.response?.data || error.message);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // Ensure arrays
  const safeResults = Array.isArray(results) ? results : [];
  const safePayments = Array.isArray(payments) ? payments : [];
  const totalFees = safePayments.reduce((sum, p) => sum + p.amount_paid, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>

      {/* Welcome Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-900">
          Welcome, {user?.full_name}!
        </h2>
        <p className="text-blue-700 mt-2">
          Here's your academic summary for the current term.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Exams Taken</p>
              <p className="text-3xl font-bold text-blue-600">{safeResults.length}</p>
            </div>
            <FiBook className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fees Paid</p>
              <p className="text-3xl font-bold text-green-600">
                MWK {totalFees.toLocaleString()}
              </p>
            </div>
            <FiDollarSign className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Best Division</p>
              <p className="text-3xl font-bold text-purple-600">
                {safeResults.length > 0
                  ? Math.min(...safeResults.map((r) => r.average_points))
                  : '-'}
              </p>
            </div>
            <FiAward className="text-purple-600" size={32} />
          </div>
        </div>
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Average
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Division
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Position
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {safeResults.slice(0, 5).map((result) => (
                <tr key={result.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.exam_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.average_marks.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        result.division === 'Division I'
                          ? 'bg-green-100 text-green-800'
                          : result.division === 'Division II'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {result.division}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.position}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Term
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Receipt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.term_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    MWK {payment.amount_paid.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.receipt_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    MWK {payment.balance.toLocaleString()}
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

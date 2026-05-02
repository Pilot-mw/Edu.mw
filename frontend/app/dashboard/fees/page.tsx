'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { Payment, Term } from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiPlus, FiDownload, FiArrowLeft } from 'react-icons/fi';

export default function FeesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user, selectedTerm]);

  const fetchData = async () => {
    try {
      const [paymentsRes, termsRes] = await Promise.all([
        api.get<Payment[]>('/fees/payments/', {
          params: { term: selectedTerm },
        }),
        api.get<Term[]>('/fees/terms/'),
      ]);
      setPayments(paymentsRes.data);
      setTerms(termsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + p.amount_paid, 0);

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
          <h1 className="text-2xl font-bold">Fees Management</h1>
        </div>
        <Link
          href="/dashboard/fees/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <FiPlus className="mr-2" /> Record Payment
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Collected</p>
          <p className="text-3xl font-bold text-green-600">
            MWK {totalCollected.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Payments</p>
          <p className="text-3xl font-bold text-blue-600">{payments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Average Payment</p>
          <p className="text-3xl font-bold text-purple-600">
            MWK {payments.length > 0 ? (totalCollected / payments.length).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Term Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Terms</option>
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.term} {term.year}
            </option>
          ))}
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Receipt No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Term
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.receipt_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.student_name} ({payment.student_id})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.term_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  MWK {payment.amount_paid.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  MWK {payment.balance.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      payment.is_complete
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {payment.is_complete ? 'Complete' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

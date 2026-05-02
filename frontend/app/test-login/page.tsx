'use client';

import React, { useState } from 'react';
import api from '@/app/services/api';

export default function TestLoginPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await api.post('/auth/login/', {
        email: 'admin@highprofile.edu.mw',
        password: 'admin123'
      });
      setResult(response.data);
      console.log('Login success:', response.data);
    } catch (err: any) {
      console.error('Login failed:', err.response?.data || err.message);
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const testTeacherLogin = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await api.post('/auth/login/', {
        email: 'james.banda@highprofile.edu.mw',
        password: 'teacher123'
      });
      setResult(response.data);
      console.log('Teacher login success:', response.data);
    } catch (err: any) {
      console.error('Login failed:', err.response?.data || err.message);
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Login</h1>
      
      <div className="space-x-4 mb-8">
        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Admin Login
        </button>
        
        <button
          onClick={testTeacherLogin}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Teacher Login
        </button>
      </div>

      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
          <h3 className="font-bold text-red-800">Error:</h3>
          <pre className="text-sm text-red-700">{error}</pre>
        </div>
      )}
      
      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <h3 className="font-bold text-green-800">Success!</h3>
          <pre className="text-sm text-green-700">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

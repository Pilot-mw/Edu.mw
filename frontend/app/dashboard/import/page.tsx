'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiUpload, FiDownload, FiX, FiCheckCircle, FiAlertCircle, FiFileText, FiBarChart2 } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import axios from 'axios';

interface ParsedRow {
  [key: string]: string | number | Date;
}

interface ImportError {
  row: number;
  error: string;
}

interface ImportResult {
  success: boolean;
  successCount: number;
  failedCount: number;
  errors: ImportError[];
  message: string;
}

type ImportType = 'students' | 'results';

export default function ImportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importType, setImportType] = useState<ImportType>('students');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const studentColumns = ['studentName', 'admissionNumber', 'class', 'gender', 'dateOfBirth'];
  const resultsColumns = ['studentId', 'subject', 'marks', 'term', 'year'];

  const currentColumns = importType === 'students' ? studentColumns : resultsColumns;

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.csv')) {
      setError('Only .xlsx and .csv files are allowed');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setResult(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' }) as ParsedRow[];

        if (jsonData.length === 0) {
          setError('No data found in file');
          setFile(null);
          return;
        }

        setHeaders(Object.keys(jsonData[0]));
        setPreviewData(jsonData.slice(0, 10));
      } catch {
        setError('Failed to parse file. Please check the format.');
        setFile(null);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setPreviewData([]);
    setHeaders([]);
    setError(null);
    setResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    const endpoint = importType === 'students' ? '/api/import/students' : '/api/import/results';

    try {
      setUploadProgress(30);
      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(30 + Math.round(percentCompleted * 0.7));
        },
      });

      setUploadProgress(100);
      setResult(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Upload failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setUploading(false);
    }
  }, [file, importType]);

  const downloadTemplate = useCallback(() => {
    const columns = importType === 'students' ? studentColumns : resultsColumns;
    const exampleData = importType === 'students'
      ? [
          { studentName: 'John Doe', admissionNumber: 'HPSS-001', class: 'Form 1A', gender: 'Male', dateOfBirth: '2010-05-15' },
          { studentName: 'Jane Smith', admissionNumber: 'HPSS-002', class: 'Form 1A', gender: 'Female', dateOfBirth: '2010-08-20' },
        ]
      : [
          { studentId: 'HPSS-001', subject: 'Mathematics', marks: 85, term: 'Term 1', year: '2026' },
          { studentId: 'HPSS-001', subject: 'English', marks: 72, term: 'Term 1', year: '2026' },
        ];

    const ws = XLSX.utils.json_to_sheet(exampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${importType}_template.xlsx`);
  }, [importType]);

  const formatDate = (value: unknown): string => {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return String(value);
  };

  if (loading || !user || user.role !== 'admin') {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bulk Import</h1>
        <button
          onClick={downloadTemplate}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <FiDownload className="mr-2" /> Download Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Import Type</h3>
            <div className="space-y-3">
              <button
                onClick={() => { setImportType('students'); handleClear(); }}
                className={`w-full flex items-center px-4 py-3 rounded-lg border-2 transition-colors ${
                  importType === 'students' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FiFileText className="mr-3 text-blue-600" size={20} />
                <div className="text-left">
                  <p className="font-medium">Students</p>
                  <p className="text-sm text-gray-500">Name, admission #, class, gender, DOB</p>
                </div>
              </button>
              <button
                onClick={() => { setImportType('results'); handleClear(); }}
                className={`w-full flex items-center px-4 py-3 rounded-lg border-2 transition-colors ${
                  importType === 'results' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FiBarChart2 className="mr-3 text-blue-600" size={20} />
                <div className="text-left">
                  <p className="font-medium">Results / Marks</p>
                  <p className="text-sm text-gray-500">Student ID, subject, marks, term, year</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Required Columns</h3>
            <div className="space-y-2">
              {currentColumns.map((col) => (
                <div key={col} className="flex items-center text-sm">
                  <FiCheckCircle className="mr-2 text-green-500" size={14} />
                  <span className="text-gray-700">{col}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Upload File</h3>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUpload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600 text-sm">Click to upload or drag and drop</p>
              <p className="text-gray-400 text-xs mt-1">.xlsx or .csv (max 10MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {file && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiFileText className="mr-2 text-blue-600" />
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                  </div>
                  <button onClick={handleClear} className="text-gray-400 hover:text-gray-600">
                    <FiX size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            )}

            {file && previewData.length > 0 && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <FiUpload className="mr-2" /> {uploading ? 'Uploading...' : 'Upload to Database'}
              </button>
            )}

            {uploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">{uploadProgress}%</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <FiAlertCircle className="mr-3 text-red-500 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className={`rounded-lg p-4 ${result.successCount > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center mb-2">
                <FiCheckCircle className="mr-3 text-green-500" size={20} />
                <p className="font-medium text-green-800">{result.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-500">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{result.successCount}</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-500">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{result.failedCount}</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Failed Rows</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="flex items-start text-sm p-2 bg-red-50 rounded">
                        <span className="font-mono text-red-600 mr-2">Row {err.row}:</span>
                        <span className="text-red-700">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {previewData.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Data Preview (first 10 rows)</h3>
                <span className="text-sm text-gray-500">{previewData.length} rows shown</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">#</th>
                      {headers.map((header) => (
                        <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">{idx + 1}</td>
                        {headers.map((header) => (
                          <td key={header} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                            {row[header] instanceof Date ? formatDate(row[header]) : String(row[header])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!file && !result && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FiUpload className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No file selected</h3>
              <p className="text-gray-500 text-sm">Upload an Excel or CSV file to see a preview here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { FileUploader } from '@/components/applicants/FileUploader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';

export default function TestUploadPage() {
  const [jobId, setJobId] = useState('test-job-id');
  const [token, setToken] = useState('');

  const handleUploadComplete = (applicants: any[]) => {
    toast.success(`Successfully uploaded ${applicants.length} applicants`);
    console.log('Upload complete:', applicants);
  };

  const handleError = (error: string) => {
    toast.error(error);
    console.error('Upload error:', error);
  };

  const handleSetToken = () => {
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      toast.success('Token set in localStorage');
    }
  };

  const handleClearToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      toast.success('Token cleared from localStorage');
    }
  };

  const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">File Upload Test Page</h1>
        
        {/* Debug Controls */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Controls</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job ID:
              </label>
              <input
                type="text"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter job ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auth Token:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter JWT token"
                />
                <Button onClick={handleSetToken} variant="secondary">
                  Set Token
                </Button>
                <Button onClick={handleClearToken} variant="secondary">
                  Clear Token
                </Button>
              </div>
            </div>
            
            <div className="p-3 bg-gray-100 rounded-md">
              <p className="text-sm">
                <strong>Current Token:</strong> {currentToken ? `${currentToken.substring(0, 20)}...` : 'None'}
              </p>
              <p className="text-sm">
                <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}
              </p>
            </div>
          </div>
        </Card>

        {/* File Uploader */}
        <FileUploader
          jobId={jobId}
          maxSize={10 * 1024 * 1024}
          onUploadComplete={handleUploadComplete}
          onError={handleError}
        />

        {/* Instructions */}
        <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure the backend server is running on port 5001</li>
            <li>Set a valid JWT token using the form above (get it from login)</li>
            <li>Enter a valid job ID (create a job first)</li>
            <li>Try uploading the test CSV file from /templates/candidates-template.csv</li>
            <li>Check the browser console for detailed logs</li>
            <li>Check the Network tab in DevTools to see the actual HTTP requests</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
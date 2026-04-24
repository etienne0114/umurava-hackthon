'use client';

import React, { useState } from 'react';
import { Button } from '@/components/common/Button';

export default function DebugUploadPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackendConnection = async () => {
    setLoading(true);
    addResult('Testing backend connection...');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      addResult(`API URL: ${apiUrl}`);
      
      const response = await fetch(`${apiUrl}/health`);
      addResult(`Health check status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        addResult(`Health check response: ${JSON.stringify(data)}`);
      } else {
        addResult(`Health check failed: ${response.statusText}`);
      }
    } catch (error: any) {
      addResult(`Health check error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testAuthentication = async () => {
    setLoading(true);
    addResult('Testing authentication...');
    
    try {
      const token = localStorage.getItem('token');
      addResult(`Token exists: ${!!token}`);
      
      if (token) {
        addResult(`Token preview: ${token.substring(0, 50)}...`);
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        const response = await fetch(`${apiUrl}/jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        addResult(`Auth test status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          addResult(`Auth test success: Found ${data.data?.length || 0} jobs`);
        } else {
          const errorData = await response.text();
          addResult(`Auth test failed: ${errorData}`);
        }
      }
    } catch (error: any) {
      addResult(`Auth test error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testFileUpload = async () => {
    setLoading(true);
    addResult('Testing file upload...');
    
    try {
      // Create a simple CSV file
      const csvContent = 'name,email,skills\nJohn Doe,john@example.com,JavaScript\nJane Smith,jane@example.com,Python';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], 'test.csv', { type: 'text/csv' });
      
      addResult(`Created test file: ${file.name} (${file.size} bytes, ${file.type})`);
      
      const formData = new FormData();
      formData.append('jobId', '507f1f77bcf86cd799439011'); // Test job ID
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      addResult('Sending upload request...');
      
      const response = await fetch(`${apiUrl}/applicants/upload`, {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        body: formData
      });
      
      addResult(`Upload response status: ${response.status}`);
      
      const responseText = await response.text();
      addResult(`Upload response: ${responseText}`);
      
    } catch (error: any) {
      addResult(`Upload test error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Upload Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button 
            onClick={testBackendConnection} 
            disabled={loading}
            className="w-full"
          >
            Test Backend
          </Button>
          
          <Button 
            onClick={testAuthentication} 
            disabled={loading}
            className="w-full"
          >
            Test Auth
          </Button>
          
          <Button 
            onClick={testFileUpload} 
            disabled={loading}
            className="w-full"
          >
            Test Upload
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Debug Results</h2>
          <Button 
            onClick={clearResults} 
            variant="secondary"
            size="sm"
          >
            Clear
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="font-mono text-sm space-y-2 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500">No results yet. Click a test button above.</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className="border-b border-gray-100 pb-2">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Environment Info</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}</p>
            <p>Node ENV: {process.env.NODE_ENV}</p>
            <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';

export default function TestAuthPage() {
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthInfo({ error: 'No token found' });
        return;
      }

      // Decode JWT token to see user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      // Test auth with jobs endpoint
      const response = await fetch(`${apiUrl}/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = {
        token: {
          exists: true,
          payload: payload,
          preview: `${token.substring(0, 20)}...`
        },
        apiTest: {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        }
      };

      if (response.ok) {
        const data = await response.json();
        result.apiTest = { ...result.apiTest, data: data } as any;
      } else {
        const errorText = await response.text();
        result.apiTest = { ...result.apiTest, error: errorText } as any;
      }

      setAuthInfo(result);
    } catch (error: any) {
      setAuthInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const loginAsCompany = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      // Try to login with test company credentials
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'company@test.com',
          password: 'password123'
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setAuthInfo({ loginSuccess: true, data });
        checkAuth();
      } else {
        const errorText = await response.text();
        setAuthInfo({ loginError: errorText });
      }
    } catch (error: any) {
      setAuthInfo({ loginError: error.message });
    } finally {
      setLoading(false);
    }
  };

  const createTestJob = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      const response = await fetch(`${apiUrl}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'Test Job for Upload',
          description: 'A test job to test file uploads',
          requirements: ['JavaScript', 'React'],
          location: 'Remote',
          type: 'full-time',
          salaryRange: { min: 50000, max: 80000 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAuthInfo((prev: any) => ({ ...prev, testJob: data }));
      } else {
        const errorText = await response.text();
        setAuthInfo((prev: any) => ({ ...prev, testJobError: errorText }));
      }
    } catch (error: any) {
      setAuthInfo((prev: any) => ({ ...prev, testJobError: error.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button onClick={checkAuth} disabled={loading}>
            Check Auth
          </Button>
          <Button onClick={loginAsCompany} disabled={loading}>
            Login as Company
          </Button>
          <Button onClick={createTestJob} disabled={loading}>
            Create Test Job
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Auth Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(authInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
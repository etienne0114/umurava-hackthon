'use client';

import React from 'react';
import { TalentLayout } from '@/components/layout/TalentLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { QuickTestsBoard } from '@/components/talent/QuickTestsBoard';

export default function TalentTestsPage() {
  return (
    <ProtectedRoute requiredRole="talent">
      <TalentLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quick Tests</h1>
            <p className="text-sm text-gray-500 mt-1">
              Complete recruiter-assigned tests to progress your applications.
            </p>
          </div>
          <QuickTestsBoard />
        </div>
      </TalentLayout>
    </ProtectedRoute>
  );
}

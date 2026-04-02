'use client';

import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Applicant } from '@/types';

interface UmuravaImporterProps {
  jobId: string;
  onImportComplete: (applicants: Applicant[]) => void;
  onError: (error: string) => void;
}

export const UmuravaImporter: React.FC<UmuravaImporterProps> = ({
  jobId,
  onImportComplete,
  onError,
}) => {
  const [profileIds, setProfileIds] = useState('');
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!profileIds.trim()) {
      onError('Please enter at least one profile ID');
      return;
    }

    setImporting(true);

    try {
      const ids = profileIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applicants/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ jobId, profileIds: ids }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Import failed');
      }

      const result = await response.json();
      onImportComplete(Array.isArray(result.data) ? result.data : []);
      setProfileIds('');
    } catch (error: any) {
      onError(error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <h3 className="text-base sm:text-lg font-semibold mb-4">Import from Umurava Platform</h3>
      
      <div className="space-y-4">
        <Input
          label="Profile IDs (comma-separated)"
          value={profileIds}
          onChange={(e) => setProfileIds(e.target.value)}
          placeholder="profile-id-1, profile-id-2, profile-id-3"
          helperText="Enter Umurava profile IDs separated by commas"
        />

        <div className="flex justify-end">
          <Button onClick={handleImport} isLoading={importing} disabled={importing || !profileIds.trim()} className="w-full sm:w-auto">
            Import Profiles
          </Button>
        </div>
      </div>

      <div className="mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-800">
          💡 Tip: You can import multiple profiles at once by separating their IDs with commas
        </p>
      </div>
    </Card>
  );
};

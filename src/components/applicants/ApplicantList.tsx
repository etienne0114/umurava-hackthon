'use client';

import React, { useState } from 'react';
import { ApplicantCard } from './ApplicantCard';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Applicant } from '@/types';

interface ApplicantListProps {
  applicants: Applicant[];
  loading?: boolean;
  onRemove?: (applicantId: string) => void;
}

export const ApplicantList: React.FC<ApplicantListProps> = ({
  applicants,
  loading,
  onRemove,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'umurava' | 'upload'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.profile.skills.some((skill) =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesSource = sourceFilter === 'all' || applicant.source === sourceFilter;

    return matchesSearch && matchesSource;
  });

  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplicants = filteredApplicants.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading applicants...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by name, email, or skills..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Sources' },
              { value: 'umurava', label: 'Umurava' },
              { value: 'upload', label: 'Upload' },
            ]}
          />
        </div>
      </div>

      <div className="mb-4 text-xs sm:text-sm text-gray-600">
        Showing {filteredApplicants.length} of {applicants.length} applicants
      </div>

      {filteredApplicants.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-base sm:text-lg text-gray-500">No applicants found</p>
          <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedApplicants.map((applicant) => (
              <ApplicantCard
                key={applicant._id}
                applicant={applicant}
                onRemove={onRemove}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

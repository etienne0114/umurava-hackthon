'use client';

import React, { memo } from 'react';
import { Card } from '../common/Card';
import { Applicant } from '@/types';

interface ApplicantCardProps {
  applicant: Applicant;
  onRemove?: (applicantId: string) => void;
}

const ApplicantCardComponent: React.FC<ApplicantCardProps> = ({ applicant, onRemove }) => {
  const sourceColors = {
    umurava: 'bg-purple-200 text-purple-800',
    upload: 'bg-blue-200 text-blue-800',
  };

  return (
    <Card padding="md" className="hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{applicant.profile.name}</h4>
          <p className="text-xs sm:text-sm text-gray-600 truncate">{applicant.profile.email}</p>
          {applicant.profile.phone && (
            <p className="text-xs sm:text-sm text-gray-600">{applicant.profile.phone}</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium self-start ${sourceColors[applicant.source]}`}>
          {applicant.source === 'umurava' ? 'Platform' : 'Upload'}
        </span>
      </div>

      {(applicant.profile.skills?.length ?? 0) > 0 && (
        <div className="mb-3">
          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Skills:</p>
          <div className="flex flex-wrap gap-1">
            {applicant.profile.skills!.slice(0, 5).map((skill) => (
              <span
                key={`${skill.name}-${skill.level}-${skill.yearsOfExperience || 0}`}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {skill.name}
              </span>
            ))}
            {applicant.profile.skills!.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                +{applicant.profile.skills!.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {(applicant.profile.experience?.length ?? 0) > 0 && (
        <div className="mb-3">
          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Latest Experience:</p>
          <p className="text-xs sm:text-sm text-gray-600">
            {applicant.profile.experience![0].role} at {applicant.profile.experience![0].company}
          </p>
        </div>
      )}

      {onRemove && (
        <div className="mt-4 pt-3 border-t">
          <button
            onClick={() => onRemove(applicant._id)}
            className="text-xs sm:text-sm text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      )}
    </Card>
  );
};

// Memoize ApplicantCard to prevent unnecessary re-renders
export const ApplicantCard = memo(ApplicantCardComponent);

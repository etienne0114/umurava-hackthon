'use client';

import React, { useState, useMemo, memo } from 'react';
import { ScreeningResult } from '@/types';

interface ShortlistTableProps {
  results: ScreeningResult[];
  onSelectCandidate: (applicantId: string) => void;
  sortBy?: 'rank' | 'score' | 'name';
}

const ShortlistTableComponent: React.FC<ShortlistTableProps> = ({
  results,
  onSelectCandidate,
  sortBy = 'rank',
}) => {
  const [sortField, setSortField] = useState<'rank' | 'score'>(sortBy as any);

  const recommendationLabels = useMemo(() => ({
    highly_recommended: 'Highly Recommended',
    recommended: 'Recommended',
    consider: 'Consider',
    not_recommended: 'Not Recommended',
  }), []);

  const recommendationColors = useMemo(() => ({
    highly_recommended: 'text-green-800 bg-green-100',
    recommended: 'text-blue-800 bg-blue-100',
    consider: 'text-yellow-800 bg-yellow-100',
    not_recommended: 'text-red-800 bg-red-100',
  }), []);

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      if (sortField === 'rank') return a.rank - b.rank;
      if (sortField === 'score') return b.matchScore - a.matchScore;
      return 0;
    });
  }, [results, sortField]);

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto" role="region" aria-label="Candidate shortlist table">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th
                className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider cursor-pointer hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setSortField('rank')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSortField('rank');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Sort by rank ${sortField === 'rank' ? '(currently sorted)' : ''}`}
              >
                Rank {sortField === 'rank' && <span aria-hidden="true">↓</span>}
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Name
              </th>
              <th
                className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider cursor-pointer hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setSortField('score')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSortField('score');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Sort by match score ${sortField === 'score' ? '(currently sorted)' : ''}`}
              >
                Match Score {sortField === 'score' && <span aria-hidden="true">↓</span>}
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Recommendation
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedResults.map((result) => {
              const applicant = (result as any).applicantId;
              const isTopThree = result.rank <= 3;

              return (
                <tr
                  key={result._id}
                  className={`hover:bg-gray-50 ${isTopThree ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`font-bold ${isTopThree ? 'text-blue-700 text-lg' : 'text-gray-900'}`}
                      aria-label={`Rank ${result.rank}${isTopThree ? ', top candidate' : ''}`}
                    >
                      #{result.rank}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {applicant?.profile?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {applicant?.profile?.email || 'No email'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900" aria-label={`Match score ${result.matchScore.toFixed(1)} percent`}>
                        {result.matchScore.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        recommendationColors[result.evaluation.recommendation]
                      }`}
                      role="status"
                      aria-label={`Recommendation: ${recommendationLabels[result.evaluation.recommendation]}`}
                    >
                      {recommendationLabels[result.evaluation.recommendation]}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        const id = typeof result.applicantId === 'string' ? result.applicantId : result.applicantId._id;
                        onSelectCandidate(id);
                      }}
                      className="text-blue-700 hover:text-blue-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                      aria-label={`View details for ${applicant?.profile?.name || 'candidate'}`}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedResults.length === 0 && (
          <div className="text-center py-8 text-gray-700" role="status">
            No screening results found
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4" role="list" aria-label="Candidate shortlist">
        {sortedResults.map((result) => {
          const applicant = (result as any).applicantId;
          const isTopThree = result.rank <= 3;

          return (
            <div
              key={result._id}
              className={`bg-white rounded-lg shadow-md p-4 ${isTopThree ? 'border-2 border-blue-600' : 'border border-gray-300'}`}
              role="listitem"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span 
                    className={`font-bold text-lg ${isTopThree ? 'text-blue-700' : 'text-gray-900'}`}
                    aria-label={`Rank ${result.rank}${isTopThree ? ', top candidate' : ''}`}
                  >
                    #{result.rank}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {applicant?.profile?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {applicant?.profile?.email || 'No email'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-700">Match Score:</span>
                <span className="font-semibold text-gray-900" aria-label={`${result.matchScore.toFixed(1)} percent`}>
                  {result.matchScore.toFixed(1)}%
                </span>
              </div>

              <div className="mb-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    recommendationColors[result.evaluation.recommendation]
                  }`}
                  role="status"
                  aria-label={`Recommendation: ${recommendationLabels[result.evaluation.recommendation]}`}
                >
                  {recommendationLabels[result.evaluation.recommendation]}
                </span>
              </div>

              <button
                onClick={() => {
                  const id = typeof result.applicantId === 'string' ? result.applicantId : result.applicantId._id;
                  onSelectCandidate(id);
                }}
                className="w-full text-blue-700 hover:text-blue-900 text-sm font-medium py-2 border-t focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                aria-label={`View details for ${applicant?.profile?.name || 'candidate'}`}
              >
                View Details
              </button>
            </div>
          );
        })}

        {sortedResults.length === 0 && (
          <div className="text-center py-8 text-gray-700" role="status">
            No screening results found
          </div>
        )}
      </div>
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ShortlistTable = memo(ShortlistTableComponent);

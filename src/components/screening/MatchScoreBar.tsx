'use client';

import React from 'react';

interface MatchScoreBarProps {
  score: number;
  breakdown: {
    skills: number;
    experience: number;
    education: number;
    relevance: number;
  };
  showBreakdown?: boolean;
}

export const MatchScoreBar: React.FC<MatchScoreBarProps> = ({
  score,
  breakdown,
  showBreakdown = false,
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getScoreTextColor = (score: number): string => {
    if (score >= 80) return 'text-green-800';
    if (score >= 60) return 'text-yellow-800';
    return 'text-red-800';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm font-medium text-gray-800">Match Score</span>
        <span className={`text-base sm:text-lg font-bold ${getScoreTextColor(score)}`}>
          {score.toFixed(1)}%
        </span>
      </div>

      <div 
        className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(score)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Match score: ${score.toFixed(1)} percent`}
      >
        <div
          className={`h-2 sm:h-3 rounded-full transition-all ${getScoreColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {showBreakdown && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs" role="list" aria-label="Score breakdown">
          <div className="flex justify-between" role="listitem">
            <span className="text-gray-700">Skills:</span>
            <span className="font-medium text-gray-900">{breakdown.skills.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between" role="listitem">
            <span className="text-gray-700">Experience:</span>
            <span className="font-medium text-gray-900">{breakdown.experience.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between" role="listitem">
            <span className="text-gray-700">Education:</span>
            <span className="font-medium text-gray-900">{breakdown.education.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between" role="listitem">
            <span className="text-gray-700">Relevance:</span>
            <span className="font-medium text-gray-900">{breakdown.relevance.toFixed(0)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, memo } from 'react';
import { Card } from '../common/Card';
import { MatchScoreBar } from './MatchScoreBar';
import { AIReasoningPanel } from './AIReasoningPanel';
import { Applicant, ScreeningResult } from '@/types';

interface CandidateCardProps {
  applicant: Applicant;
  result: ScreeningResult;
  expanded?: boolean;
  onToggle?: () => void;
}

const CandidateCardComponent: React.FC<CandidateCardProps> = ({
  applicant,
  result,
  expanded: controlledExpanded,
  onToggle,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow" 
      role="article" 
      aria-labelledby={`candidate-name-${result._id}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
        <div className="flex items-center space-x-3">
          <div 
            className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm"
            aria-label={`Rank ${result.rank}`}
          >
            #{result.rank}
          </div>
          <div className="min-w-0 flex-1">
            <h3 id={`candidate-name-${result._id}`} className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              {applicant.profile.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{applicant.profile.email}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <MatchScoreBar
          score={result.matchScore}
          breakdown={result.scoreBreakdown}
          showBreakdown={expanded}
        />
      </div>

      {(applicant.profile.skills ?? []).length > 0 && (
        <div className="mb-4">
          <p className="text-xs sm:text-sm font-medium text-gray-800 mb-2">Skills:</p>
          <div className="flex flex-wrap gap-1" role="list" aria-label="Candidate skills">
            {(applicant.profile.skills ?? []).slice(0, 6).map((skill) => (
              <span
                key={`${skill.name}-${skill.level}-${skill.yearsOfExperience || 0}`}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                role="listitem"
              >
                {skill.name}
              </span>
            ))}
            {(applicant.profile.skills ?? []).length > 6 && (
              <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">
                +{(applicant.profile.skills ?? []).length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleToggle}
        className="w-full text-xs sm:text-sm font-medium text-blue-700 hover:text-blue-900 py-2 border-t focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        aria-expanded={expanded}
        aria-controls={`candidate-details-${result._id}`}
      >
        {expanded ? 'Hide Details' : 'Show Details'}
      </button>

      {expanded && (
        <div id={`candidate-details-${result._id}`} className="mt-4 pt-4 border-t">
          <AIReasoningPanel evaluation={result.evaluation} applicantName={applicant.profile.name} />
        </div>
      )}
    </Card>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const CandidateCard = memo(CandidateCardComponent);

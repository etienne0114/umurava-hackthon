'use client';

import React, { useState } from 'react';
import { Recommendation } from '@/types';

interface AIReasoningPanelProps {
  evaluation: {
    strengths: string[];
    gaps: string[];
    risks: string[];
    recommendation: Recommendation;
    reasoning: string;
  };
  applicantName: string;
}

export const AIReasoningPanel: React.FC<AIReasoningPanelProps> = ({
  evaluation,
  applicantName,
}) => {
  const [expanded, setExpanded] = useState(false);

  const recommendationColors = {
    highly_recommended: 'bg-green-100 text-green-900 border-green-400',
    recommended: 'bg-blue-100 text-blue-900 border-blue-400',
    consider: 'bg-yellow-100 text-yellow-900 border-yellow-400',
    not_recommended: 'bg-red-100 text-red-900 border-red-400',
  };

  const recommendationLabels = {
    highly_recommended: 'Highly Recommended',
    recommended: 'Recommended',
    consider: 'Consider',
    not_recommended: 'Not Recommended',
  };

  return (
    <div className="space-y-3 sm:space-y-4" role="region" aria-label={`AI evaluation for ${applicantName}`}>
      <div 
        className={`px-3 sm:px-4 py-2 rounded-lg border-2 ${recommendationColors[evaluation.recommendation]}`}
        role="status"
        aria-label={`Recommendation: ${recommendationLabels[evaluation.recommendation]}`}
      >
        <p className="text-sm sm:text-base font-semibold text-center">
          {recommendationLabels[evaluation.recommendation]}
        </p>
      </div>

      {evaluation.strengths.length > 0 && (
        <div>
          <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-center">
            <span className="text-green-700 mr-2" aria-hidden="true">✓</span>
            Strengths
          </h4>
          <ul className="space-y-1" role="list">
            {evaluation.strengths.map((strength, index) => (
              <li key={index} className="text-xs sm:text-sm text-gray-800 flex items-start" role="listitem">
                <span className="text-green-600 mr-2" aria-hidden="true">•</span>
                <span className="flex-1">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {evaluation.gaps.length > 0 && (
        <div>
          <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-center">
            <span className="text-yellow-700 mr-2" aria-hidden="true">⚠</span>
            Gaps
          </h4>
          <ul className="space-y-1" role="list">
            {evaluation.gaps.map((gap, index) => (
              <li key={index} className="text-xs sm:text-sm text-gray-800 flex items-start" role="listitem">
                <span className="text-yellow-600 mr-2" aria-hidden="true">•</span>
                <span className="flex-1">{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {evaluation.risks.length > 0 && (
        <div>
          <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-center">
            <span className="text-red-700 mr-2" aria-hidden="true">!</span>
            Risks
          </h4>
          <ul className="space-y-1" role="list">
            {evaluation.risks.map((risk, index) => (
              <li key={index} className="text-xs sm:text-sm text-gray-800 flex items-start" role="listitem">
                <span className="text-red-600 mr-2" aria-hidden="true">•</span>
                <span className="flex-1">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs sm:text-sm font-medium text-blue-700 hover:text-blue-900 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
          aria-expanded={expanded}
          aria-controls="ai-reasoning-content"
        >
          <span aria-hidden="true">{expanded ? '▼' : '▶'}</span>
          <span className="ml-1">AI Reasoning</span>
        </button>
        {expanded && (
          <div id="ai-reasoning-content" className="mt-2 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap">{evaluation.reasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
};

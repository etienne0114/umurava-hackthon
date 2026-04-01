'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ScreeningResult } from '@/types';

interface SkillsMatchChartProps {
  result: ScreeningResult;
}

export const SkillsMatchChart: React.FC<SkillsMatchChartProps> = ({ result }) => {
  const data = [
    {
      category: 'Skills',
      score: result.scoreBreakdown.skills,
      fullMark: 100,
    },
    {
      category: 'Experience',
      score: result.scoreBreakdown.experience,
      fullMark: 100,
    },
    {
      category: 'Education',
      score: result.scoreBreakdown.education,
      fullMark: 100,
    },
    {
      category: 'Relevance',
      score: result.scoreBreakdown.relevance,
      fullMark: 100,
    },
  ];

  return (
    <div className="w-full h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar
            name="Candidate Score"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

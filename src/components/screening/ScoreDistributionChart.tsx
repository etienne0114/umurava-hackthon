'use client';

import React, { useMemo, memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ScreeningResult } from '@/types';

interface ScoreDistributionChartProps {
  results: ScreeningResult[];
}

const ScoreDistributionChartComponent: React.FC<ScoreDistributionChartProps> = ({ results }) => {
  const scoreRanges = useMemo(() => [
    { range: '0-20', min: 0, max: 20, color: '#ef4444' },
    { range: '20-40', min: 20, max: 40, color: '#f97316' },
    { range: '40-60', min: 40, max: 60, color: '#eab308' },
    { range: '60-80', min: 60, max: 80, color: '#84cc16' },
    { range: '80-100', min: 80, max: 100, color: '#22c55e' },
  ], []);

  const distribution = useMemo(() => {
    return scoreRanges.map((range) => {
      const count = results.filter(
        (r) => r.matchScore >= range.min && r.matchScore < range.max
      ).length;
      return {
        range: range.range,
        count,
        color: range.color,
      };
    });
  }, [results, scoreRanges]);

  return (
    <div className="w-full h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={distribution} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="range" 
            label={{ value: 'Score Range', position: 'insideBottom', offset: -5 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ value: 'Number of Candidates', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {distribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Memoize the chart component to prevent unnecessary re-renders
export const ScoreDistributionChart = memo(ScoreDistributionChartComponent);

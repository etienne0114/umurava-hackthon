import React from 'react';
import clsx from 'clsx';

interface ProfileRatingGaugeProps {
  percentage: number;
}

export const ProfileRatingGauge: React.FC<ProfileRatingGaugeProps> = ({ percentage }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getStatus = (p: number) => {
    if (p >= 90) return { label: 'EXCELLENT', color: 'text-green-500', bg: 'bg-green-50', stroke: 'stroke-green-500' };
    if (p >= 70) return { label: 'GOOD', color: 'text-blue-500', bg: 'bg-blue-50', stroke: 'stroke-blue-500' };
    return { label: 'AVERAGE', color: 'text-amber-500', bg: 'bg-amber-50', stroke: 'stroke-amber-500' };
  };

  const status = getStatus(percentage);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col items-center justify-center relative min-w-[200px] shadow-sm">
      <div className="absolute top-4 left-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
        Your profile rating
      </div>
      
      <div className="relative mt-8 mb-4">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            className="text-gray-100"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            className={clsx("transition-all duration-1000 ease-in-out", status.stroke)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-gray-900 leading-none">{percentage}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <span className={clsx("text-[10px] font-black px-2 py-1 rounded-lg border", status.color, status.bg, status.color.replace('text', 'border'))}>
          {status.label}
        </span>
      </div>
      
      <p className="text-[10px] text-gray-400 mt-4 text-center leading-relaxed">
        Your profile looks excellent. Keep it updated to stay ahead of other talents.
      </p>
    </div>
  );
};

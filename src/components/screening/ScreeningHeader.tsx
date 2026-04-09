'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { Job } from '@/types';

interface ScreeningHeaderProps {
  selectedJob?: Job | null;
}

export function ScreeningHeader({ selectedJob }: ScreeningHeaderProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-900">AI Screening</h1>
        <div className="relative group">
          <button
            type="button"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all"
            aria-label="AI strategy preview"
          >
            <Info size={16} />
          </button>
          <div className="absolute left-0 top-9 z-20 w-72 rounded-xl border border-indigo-100 bg-white p-3 text-xs text-gray-600 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">AI Strategy Preview</p>
            <p className="font-semibold text-gray-800 mb-2">
              The AI weighs Skills, Experience, Education, and Relevance using the job's scoring strategy.
            </p>
            {selectedJob ? (
              <div className="mb-2 rounded-lg border border-indigo-100 bg-indigo-50/50 p-2 text-[10px] text-indigo-700">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  <span>Skills: {(selectedJob.weights.skills * 100).toFixed(0)}%</span>
                  <span>Experience: {(selectedJob.weights.experience * 100).toFixed(0)}%</span>
                  <span>Education: {(selectedJob.weights.education * 100).toFixed(0)}%</span>
                  <span>Relevance: {(selectedJob.weights.relevance * 100).toFixed(0)}%</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 mb-2">Select a job to see its scoring weights.</p>
            )}
            <p className="text-gray-500">
              Results are ranked, explained, and always advisory. You make the final decision.
            </p>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        Let Gemini AI rank and evaluate your candidates automatically
      </p>
      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
        AI recommendations are advisory - recruiters make final decisions.
      </div>
    </div>
  );
}



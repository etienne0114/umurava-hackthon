'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Briefcase, Users, ArrowRight, Loader2, X } from 'lucide-react';
import apiClient from '@/store/api/apiClient';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  jobs: any[];
  applicants: any[];
}

export const SearchDropdown: React.FC<{ placeholder?: string; role: string }> = ({ placeholder, role }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult>({ jobs: [], applicants: [] });
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length < 2) {
        setResults({ jobs: [], applicants: [] });
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(`/search?q=${encodeURIComponent(debouncedQuery)}`);
        setResults(response.data.data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (link: string) => {
    router.push(link);
    setIsOpen(false);
    setQuery('');
  };

  const totalResults = results.jobs.length + results.applicants.length;

  return (
    <div className="flex-1 max-w-md relative" ref={dropdownRef}>
      <div className="relative group">
        <Search
          className={clsx(
            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
            isOpen ? "text-indigo-600" : "text-gray-400 group-focus-within:text-indigo-600"
          )}
          size={16}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder || "Search..."}
          className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-0 rounded-full pl-10 pr-10 py-2 text-sm transition-all shadow-sm outline-none font-medium"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600 animate-spin" size={16} />
        ) : query && (
          <button 
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[420px] overflow-y-auto">
            {totalResults === 0 && !loading ? (
              <div className="p-8 text-center">
                <Search size={24} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm font-bold text-gray-900">No results found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different keyword or check your spelling</p>
              </div>
            ) : (
              <>
                {results.jobs.length > 0 && (
                  <div className="p-2">
                    <h3 className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Briefcase size={10} /> Jobs
                    </h3>
                    <div className="space-y-1">
                      {results.jobs.map((job) => (
                        <button
                          key={job._id}
                          onClick={() => handleResultClick(role === 'company' ? `/jobs/${job._id}` : `/talent/jobs/${job._id}`)}
                          className="w-full text-left p-3 hover:bg-indigo-50/50 rounded-xl transition-colors group flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 truncate">{job.title}</p>
                            <p className="text-[10px] text-gray-400">{job.company || 'Recruitment Platform'} • {job.location || 'Remote'}</p>
                          </div>
                          <ArrowRight size={12} className="text-transparent group-hover:text-indigo-400 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.applicants.length > 0 && (
                  <div className="p-2 border-t border-gray-50">
                    <h3 className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Users size={10} /> Candidates
                    </h3>
                    <div className="space-y-1">
                      {results.applicants.map((app) => (
                        <button
                          key={app._id}
                          onClick={() => handleResultClick(`/company/candidates?id=${app._id}`)}
                          className="w-full text-left p-3 hover:bg-indigo-50/50 rounded-xl transition-colors group flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 truncate">{app.profile.name}</p>
                            <p className="text-[10px] text-gray-400">Position: {app.profile.position || 'N/A'}</p>
                            <p className="text-[9px] text-indigo-500 font-bold bg-indigo-50 inline-block px-1.5 py-0.5 rounded mt-1">
                              Job: {app.jobId.title}
                            </p>
                          </div>
                          <ArrowRight size={12} className="text-transparent group-hover:text-indigo-400 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 italic">Showing {totalResults} matches</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

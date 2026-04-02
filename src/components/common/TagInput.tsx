'use client';

import React, { useState, KeyboardEvent } from 'react';
import { X, Plus, Hash } from 'lucide-react';
import clsx from 'clsx';

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  tags,
  onChange,
  placeholder = 'Type and press Enter...',
  error,
  required
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmed = inputValue.trim().replace(/,$/, '');
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue('');
    } else if (tags.includes(trimmed)) {
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="space-y-1.5 flex flex-col group">
      <label className="text-sm font-bold text-gray-700 flex items-center gap-1 ml-1 mb-1">
        <Hash size={14} className="text-gray-400" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      <div className={clsx(
        "min-h-[52px] px-4 flex items-center rounded-2xl border transition-all bg-white shadow-sm",
        error 
          ? "border-red-300 ring-4 ring-red-50" 
          : "border-gray-200 group-focus-within:border-indigo-400 group-focus-within:ring-4 group-focus-within:ring-indigo-50"
      )}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 bg-transparent border-0 outline-none ring-0 focus:ring-0 focus:outline-none text-sm text-gray-700 py-3"
        />

        {tags.length === 0 && (
          <div className="flex items-center text-gray-300 pointer-events-none">
            <Plus size={16} />
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1 animate-in slide-in-from-top-1 duration-300">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100 shadow-sm transition-all hover:bg-indigo-100 animate-in zoom-in-95"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="p-0.5 hover:bg-white rounded-lg transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs font-semibold text-red-500 animate-in slide-in-from-top-1 ml-1">
          {error}
        </p>
      )}

      <p className="text-[10px] text-gray-400 ml-1 uppercase tracking-wider font-bold">
        {tags.length} tags added · Press Enter or Comma to save
      </p>
    </div>
  );
};

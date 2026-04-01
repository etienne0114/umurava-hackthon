'use client';

import React, { useRef, useState } from 'react';
import { useAppDispatch } from '@/store';
import { uploadResume, ParsedResumeProfile } from '@/store/slices/authSlice';
import { Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface CVUploadTriggerProps {
  onParsed?: (extracted: ParsedResumeProfile) => void;
  className?: string;
  variant?: 'button' | 'compact';
}

export const CVUploadTrigger: React.FC<CVUploadTriggerProps> = ({ 
  onParsed, 
  className,
  variant = 'button' 
}) => {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setStatus('uploading');
    try {
      const result = await dispatch(uploadResume(file)).unwrap();
      setStatus('done');
      toast.success('CV parsed by AI! Profile updated.');
      if (onParsed) onParsed(result.extracted);
    } catch (err: any) {
      setStatus('idle');
      toast.error(err.message || 'Failed to parse CV');
    }
  };

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={status === 'uploading'}
        className={clsx(
          "flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
          variant === 'button' ? "px-6 py-2.5 bg-white text-indigo-600 border border-indigo-100 font-bold rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200" : "p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg",
          status === 'uploading' && "opacity-75 cursor-wait",
          className
        )}
      >
        {status === 'uploading' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> {variant === 'button' && 'Analyzing...'}</>
        ) : (
          <><Upload className="w-4 h-4" /> {variant === 'button' && 'Import from CV'}</>
        )}
      </button>
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </>
  );
};

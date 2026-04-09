'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Applicant } from '@/types';

interface FileUploaderProps {
  jobId: string;
  maxSize: number;
  onUploadComplete: (applicants: Applicant[]) => void;
  onError: (error: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  jobId,
  maxSize,
  onUploadComplete,
  onError,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      if (selectedFile.size > maxSize) {
        onError(`File size exceeds maximum of ${maxSize / (1024 * 1024)}MB`);
        return;
      }
      
      setFile(selectedFile);
    }
  }, [maxSize, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('file', file);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applicants/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Upload failed');
      }

      const result = await response.json();
      setProgress(100);
      onUploadComplete(Array.isArray(result.data) ? result.data : []);
      setFile(null);
    } catch (error: any) {
      onError(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card role="region" aria-labelledby="file-uploader-heading">
      <h3 id="file-uploader-heading" className="text-base sm:text-lg font-semibold mb-4">
        Upload Applicants File
      </h3>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="font-semibold text-gray-600">Need a template?</span>
        <a
          href="/templates/candidates-template.csv"
          download
          className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2"
        >
          Download CSV template
        </a>
        <span className="text-gray-400">PDF uploads accept one candidate per file.</span>
      </div>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition ${
          isDragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-400 hover:border-blue-500'
        }`}
        role="button"
        tabIndex={0}
        aria-label="File upload area. Click or drag and drop a file to upload"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            input?.click();
          }
        }}
      >
        <input {...getInputProps()} aria-label="File input" />
        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4" aria-hidden="true">📁</div>
        {isDragActive ? (
          <p className="text-sm sm:text-base text-blue-700">Drop the file here...</p>
        ) : (
          <div>
            <p className="text-sm sm:text-base text-gray-800 mb-2">
              Drag and drop a file here, or click to select
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Supported formats: CSV, Excel (.xlsx, .xls), PDF
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Max size: {maxSize / (1024 * 1024)}MB
            </p>
          </div>
        )}
      </div>

      {file && (
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 rounded-lg gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                {file.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-red-700 hover:text-red-900 self-start sm:self-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
              disabled={uploading}
              aria-label={`Remove file ${file.name}`}
            >
              Remove
            </button>
          </div>

          {uploading && (
            <div className="mt-4" role="status" aria-live="polite">
              <div className="w-full bg-gray-200 rounded-full h-2" aria-hidden="true">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-700 mt-2 text-center">
                Uploading... {progress}%
              </p>
              <span className="sr-only">Upload progress: {progress} percent</span>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleUpload} 
              isLoading={uploading} 
              disabled={uploading} 
              className="w-full sm:w-auto"
              aria-label="Upload applicants file"
            >
              Upload Applicants
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

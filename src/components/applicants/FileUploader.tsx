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
  const [dragActive, setDragActive] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size exceeds maximum of ${Math.round(maxSize / (1024 * 1024))}MB`;
    }

    // Check file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/pdf'
    ];
    
    const allowedExtensions = ['.csv', '.xlsx', '.xls', '.pdf'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return 'Please upload a CSV, Excel (.xlsx, .xls), or PDF file';
    }

    return null;
  }, [maxSize]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('Files dropped:', { acceptedFiles, rejectedFiles });
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors?.[0]?.code === 'file-too-large') {
        onError(`File size exceeds maximum of ${Math.round(maxSize / (1024 * 1024))}MB`);
      } else if (rejection.errors?.[0]?.code === 'file-invalid-type') {
        onError('Please upload a CSV, Excel (.xlsx, .xls), or PDF file');
      } else {
        onError('File upload failed. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      console.log('File selected:', selectedFile);
      
      const validationError = validateFile(selectedFile);
      if (validationError) {
        onError(validationError);
        return;
      }
      
      setFile(selectedFile);
    }
  }, [maxSize, onError, validateFile]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: maxSize,
    noClick: false,
    noKeyboard: false,
    onDragEnter: () => {
      console.log('Drag enter detected');
      setDragActive(true);
    },
    onDragLeave: () => {
      console.log('Drag leave detected');
      setDragActive(false);
    },
    onDropAccepted: (files) => {
      console.log('Drop accepted:', files);
      setDragActive(false);
    },
    onDropRejected: (rejections) => {
      console.log('Drop rejected:', rejections);
      setDragActive(false);
    },
    onFileDialogCancel: () => {
      console.log('File dialog cancelled');
    },
    onFileDialogOpen: () => {
      console.log('File dialog opened');
    },
  });

  const handleUpload = async () => {
    if (!file) {
      onError('Please select a file first');
      return;
    }

    if (!jobId) {
      onError('Job ID is missing');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      console.log('Starting upload for file:', file.name);
      
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('file', file);

      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      console.log('Token available:', !!token);
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');

      // Get API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const uploadUrl = `${apiUrl}/applicants/upload`;
      console.log('Upload URL:', uploadUrl);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: token ? { 
          'Authorization': `Bearer ${token}`,
        } : {},
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          console.log('Error response:', errorData);
          errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch (_e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Upload result:', result);

      if (result.success && result.data) {
        const applicants = Array.isArray(result.data) ? result.data : [];
        onUploadComplete(applicants);
        setFile(null);
        setProgress(0);
      } else {
        throw new Error(result.message || 'Upload failed - no data returned');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      onError(error.message || 'Upload failed. Please try again.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log('File input clicked - opening dialog');
    try {
      open();
    } catch (error) {
      console.error('Error opening file dialog:', error);
      onError('Failed to open file dialog. Please try again.');
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
        <a
          href="/test-applicants.csv"
          download
          className="text-green-600 hover:text-green-700 font-semibold underline underline-offset-2"
        >
          Download test data
        </a>
        <span className="text-gray-400">PDF uploads accept one candidate per file.</span>
      </div>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive || dragActive 
            ? 'border-blue-600 bg-blue-50 scale-[1.02]' 
            : 'border-gray-400 hover:border-blue-500 hover:bg-gray-50'
        }`}
        role="button"
        tabIndex={0}
        aria-label="File upload area. Click or drag and drop a file to upload"
        onClick={(e) => {
          console.log('Upload area clicked');
          e.preventDefault();
          handleFileInputClick(e);
        }}
      >
        <input 
          {...getInputProps()} 
          aria-label="File input"
          style={{ display: 'none' }}
        />
        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4" aria-hidden="true">
          {isDragActive || dragActive ? '📂' : '📁'}
        </div>
        {isDragActive || dragActive ? (
          <p className="text-sm sm:text-base text-blue-700 font-medium">Drop the file here...</p>
        ) : (
          <div>
            <p className="text-sm sm:text-base text-gray-800 mb-2 font-medium">
              Drag and drop a file here, or click to select
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Supported formats: CSV, Excel (.xlsx, .xls), PDF
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Max size: {Math.round(maxSize / (1024 * 1024))}MB
            </p>
          </div>
        )}
      </div>

      {/* Alternative click button for better UX */}
      <div className="mt-4 text-center">
        <Button
          variant="secondary"
          onClick={handleFileInputClick}
          disabled={uploading}
          className="w-full sm:w-auto"
        >
          Choose File
        </Button>
      </div>

      {/* Manual file input as fallback */}
      <div className="mt-4 text-center">
        <input
          type="file"
          accept=".csv,.xlsx,.xls,.pdf"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
              console.log('Manual file input selected:', selectedFile);
              const validationError = validateFile(selectedFile);
              if (validationError) {
                onError(validationError);
                return;
              }
              setFile(selectedFile);
            }
          }}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 mt-1">Fallback file selector if drag & drop doesn't work</p>
      </div>

      {/* Debug information (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}</p>
          <p>Job ID: {jobId}</p>
          <p>Token: {typeof window !== 'undefined' && localStorage.getItem('token') ? 'Available' : 'Missing'}</p>
          <p>File selected: {file ? `${file.name} (${file.type})` : 'None'}</p>
          <p>Dropzone active: {isDragActive ? 'Yes' : 'No'}</p>
          <p>Drag state: {dragActive ? 'Active' : 'Inactive'}</p>
        </div>
      )}

      {file && (
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 rounded-lg gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                {file.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                {(file.size / 1024).toFixed(2)} KB • {file.type || 'Unknown type'}
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
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
              {uploading ? 'Uploading...' : 'Upload Applicants'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

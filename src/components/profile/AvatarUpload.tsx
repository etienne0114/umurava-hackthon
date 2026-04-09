'use client';

import React, { useRef, useState } from 'react';
import { useAppDispatch } from '@/store';
import { uploadAvatar } from '@/store/slices/authSlice';
import { Camera, Loader2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface AvatarUploadProps {
  currentAvatar?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onUploadSuccess?: (url: string) => void;
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  currentAvatar, 
  name, 
  size = 'lg',
  onUploadSuccess,
  className
}) => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setHasError(false); // Reset error state on new upload
    try {
      const result = await dispatch(uploadAvatar(file)).unwrap();
      toast.success('Avatar updated successfully!');
      if (onUploadSuccess) onUploadSuccess(result.avatarUrl);
    } catch (error: any) {
      toast.error(error || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs rounded-lg',
    md: 'w-16 h-16 text-lg rounded-xl',
    lg: 'w-24 h-24 text-2xl rounded-2xl',
    xl: 'w-28 h-28 text-3xl rounded-[2rem]',
    '2xl': 'w-36 h-36 text-4xl rounded-[2.5rem]',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
  };

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  // If the stored avatar path doesn't start with http, prepend the apiBaseUrl
  // Note: we ensure we don't double up on /api/ if it's already in the path or base URL
  const avatarUrl = currentAvatar 
    ? (currentAvatar.startsWith('http') 
        ? currentAvatar 
        : `${apiBaseUrl.replace(/\/api$/, '')}${currentAvatar.startsWith('/api') ? '' : '/api'}${currentAvatar}`) 
    : null;

  return (
    <div className="relative group inline-block">
      <div 
        className={clsx(
          "relative overflow-hidden bg-indigo-600 flex items-center justify-center text-white font-black shadow-xl transition-all",
          sizeClasses[size],
          !isUploading && "group-hover:shadow-indigo-200 group-hover:scale-[1.02]",
          className
        )}
      >
        {avatarUrl && !isUploading && !hasError ? (
          <img 
            src={avatarUrl} 
            alt={name} 
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-indigo-600/80 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="animate-spin text-white" size={iconSizes[size]} />
          </div>
        )}

        {/* Overlay on hover */}
        {!isUploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]"
            title="Update Photo"
          >
            <Camera className="text-white" size={iconSizes[size]} />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Small badge/indicator */}
      {!isUploading && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-md border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors z-10"
        >
          <Upload size={12} className="text-indigo-600" />
        </div>
      )}
    </div>
  );
};

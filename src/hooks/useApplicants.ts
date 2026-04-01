import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  uploadApplicants,
  importFromUmurava,
  fetchApplicants,
  deleteApplicant,
  setUploadProgress,
  clearError,
  clearApplicants,
} from '@/store/slices/applicantSlice';

export const useApplicants = (jobId?: string, autoFetch: boolean = false) => {
  const dispatch = useAppDispatch();
  const { applicants, loading, error, uploadProgress } = useAppSelector(
    (state) => state.applicants
  );

  useEffect(() => {
    if (autoFetch && jobId) {
      dispatch(fetchApplicants({ jobId }));
    }
  }, [autoFetch, jobId, dispatch]);

  const handleUploadApplicants = async (jobId: string, file: File) => {
    return await dispatch(uploadApplicants({ jobId, file })).unwrap();
  };

  const handleImportFromUmurava = async (jobId: string, profileIds: string[]) => {
    return await dispatch(importFromUmurava({ jobId, profileIds })).unwrap();
  };

  const handleFetchApplicants = async (
    jobId: string,
    options?: { limit?: number; offset?: number }
  ) => {
    return await dispatch(fetchApplicants({ jobId, ...options })).unwrap();
  };

  const handleDeleteApplicant = async (applicantId: string) => {
    return await dispatch(deleteApplicant(applicantId)).unwrap();
  };

  const handleSetUploadProgress = (progress: number) => {
    dispatch(setUploadProgress(progress));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const handleClearApplicants = () => {
    dispatch(clearApplicants());
  };

  return {
    applicants,
    loading,
    error,
    uploadProgress,
    uploadApplicants: handleUploadApplicants,
    importFromUmurava: handleImportFromUmurava,
    fetchApplicants: handleFetchApplicants,
    deleteApplicant: handleDeleteApplicant,
    setUploadProgress: handleSetUploadProgress,
    clearError: handleClearError,
    clearApplicants: handleClearApplicants,
  };
};

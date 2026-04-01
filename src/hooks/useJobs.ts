import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  createJob,
  fetchJobs,
  fetchJobById,
  updateJob,
  deleteJob,
  clearCurrentJob,
  clearError,
} from '@/store/slices/jobSlice';
import { Job, JobStatus } from '@/types';

export const useJobs = (autoFetch: boolean = false) => {
  const dispatch = useAppDispatch();
  const { jobs, currentJob, loading, error } = useAppSelector((state) => state.jobs);

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchJobs({}));
    }
  }, [autoFetch, dispatch]);

  const handleCreateJob = async (jobData: Partial<Job>) => {
    return await dispatch(createJob(jobData)).unwrap();
  };

  const handleFetchJobs = async (filters?: {
    status?: JobStatus;
    limit?: number;
    offset?: number;
  }) => {
    return await dispatch(fetchJobs(filters)).unwrap();
  };

  const handleFetchJobById = async (jobId: string) => {
    return await dispatch(fetchJobById(jobId)).unwrap();
  };

  const handleUpdateJob = async (jobId: string, updates: Partial<Job>) => {
    return await dispatch(updateJob({ jobId, updates })).unwrap();
  };

  const handleDeleteJob = async (jobId: string) => {
    return await dispatch(deleteJob(jobId)).unwrap();
  };

  const handleClearCurrentJob = () => {
    dispatch(clearCurrentJob());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    jobs,
    currentJob,
    loading,
    error,
    createJob: handleCreateJob,
    fetchJobs: handleFetchJobs,
    fetchJobById: handleFetchJobById,
    updateJob: handleUpdateJob,
    deleteJob: handleDeleteJob,
    clearCurrentJob: handleClearCurrentJob,
    clearError: handleClearError,
  };
};

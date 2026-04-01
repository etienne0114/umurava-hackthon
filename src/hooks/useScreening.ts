import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  startScreening,
  fetchScreeningStatus,
  fetchScreeningResults,
  regenerateScreening,
  clearResults,
  clearError,
} from '@/store/slices/screeningSlice';

export const useScreening = (jobId?: string, autoFetch: boolean = false) => {
  const dispatch = useAppDispatch();
  const { results, session, loading, error } = useAppSelector((state) => state.screening);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoFetch && jobId) {
      dispatch(fetchScreeningResults({ jobId }));
    }
  }, [autoFetch, jobId, dispatch]);

  useEffect(() => {
    if (session && session.status === 'processing') {
      pollingIntervalRef.current = setInterval(() => {
        dispatch(fetchScreeningStatus(session._id));
      }, 5000);
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [session, dispatch]);

  const handleStartScreening = async (jobId: string, options?: any) => {
    return await dispatch(startScreening({ jobId, options })).unwrap();
  };

  const handleFetchScreeningStatus = async (sessionId: string) => {
    return await dispatch(fetchScreeningStatus(sessionId)).unwrap();
  };

  const handleFetchScreeningResults = async (jobId: string, limit?: number) => {
    return await dispatch(fetchScreeningResults({ jobId, limit })).unwrap();
  };

  const handleRegenerateScreening = async (jobId: string, applicantIds?: string[]) => {
    return await dispatch(regenerateScreening({ jobId, applicantIds })).unwrap();
  };

  const handleClearResults = () => {
    dispatch(clearResults());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    results,
    session,
    loading,
    error,
    isProcessing: session?.status === 'processing',
    startScreening: handleStartScreening,
    fetchScreeningStatus: handleFetchScreeningStatus,
    fetchScreeningResults: handleFetchScreeningResults,
    regenerateScreening: handleRegenerateScreening,
    clearResults: handleClearResults,
    clearError: handleClearError,
  };
};

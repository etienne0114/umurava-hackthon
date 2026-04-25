'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import apiClient from '@/store/api/apiClient';

interface ProviderHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string | null;
  lastChecked?: string;
}

interface HealthResponse {
  providers: ProviderHealth[];
  timestamp: string;
}

interface AIProviderStatusProps {
  compact?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function AIProviderStatus({ 
  compact = false, 
  autoRefresh = false, 
  refreshInterval = 300000 // 5 minutes — only if autoRefresh is explicitly enabled
}: AIProviderStatusProps) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = async (manual = false) => {
    try {
      if (manual) setIsRefreshing(true);
      setError(null);
      // Use apiClient which has the correct backend baseURL (NEXT_PUBLIC_API_URL)
      // instead of relative fetch which would hit the Next.js dev server
      const response = await apiClient.get('/screening/health');
      const data = response.data;

      // Map the backend response shape to the component's expected format
      // Backend returns: { success, data: { gemini: {status, error}, groq: {status, error}, overall, timestamp }, meta }
      if (data?.success && data?.data) {
        const backendData = data.data;
        const providers: ProviderHealth[] = [];

        if (backendData.gemini) {
          providers.push({
            name: 'Google Gemini',
            status: backendData.gemini.status as ProviderHealth['status'],
            error: backendData.gemini.error,
            lastChecked: backendData.timestamp,
          });
        }

        if (backendData.groq) {
          providers.push({
            name: 'Groq',
            status: backendData.groq.status as ProviderHealth['status'],
            error: backendData.groq.error,
            lastChecked: backendData.timestamp,
          });
        }

        setHealth({
          providers,
          timestamp: backendData.timestamp || new Date().toISOString(),
        });
      } else {
        // Handle non-standard response gracefully
        setHealth(null);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch AI provider health:', err);
      const message = err instanceof Error ? err.message : 
        (typeof err === 'object' && err !== null && 'message' in err) ? String((err as { message: unknown }).message) :
        'Failed to check provider health';
      setError(message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch once on mount, then only auto-refresh if explicitly enabled
  useEffect(() => {
    fetchHealth();
    
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => fetchHealth(), refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'unhealthy':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'unhealthy':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusText = (provider: ProviderHealth) => {
    if (provider.status === 'healthy') {
      return `Healthy${provider.responseTime ? ` (${provider.responseTime}ms)` : ''}`;
    }
    if (provider.status === 'unhealthy') {
      return provider.error || 'Unhealthy';
    }
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className={clsx(
        'flex items-center gap-2',
        compact ? 'text-xs' : 'text-sm'
      )}>
        <RefreshCw size={16} className="animate-spin text-gray-400" />
        <span className="text-gray-600">Checking AI providers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(
        'flex items-center gap-2 p-3 rounded-lg border',
        'text-red-700 bg-red-50 border-red-200',
        compact ? 'text-xs' : 'text-sm'
      )}>
        <XCircle size={16} />
        <span>Failed to check provider status: {error}</span>
        <button
          onClick={() => fetchHealth(true)}
          disabled={isRefreshing}
          className="ml-auto text-red-600 hover:text-red-800 disabled:opacity-50"
          title="Retry"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>
    );
  }

  if (!health || !health.providers) {
    return (
      <div className={clsx(
        'flex items-center gap-2',
        compact ? 'text-xs' : 'text-sm'
      )}>
        <AlertCircle size={16} className="text-yellow-600" />
        <span className="text-gray-600">No provider data available</span>
      </div>
    );
  }

  if (compact) {
    const allHealthy = health.providers.every(p => p.status === 'healthy');
    // A provider is "functional" when healthy or degraded (rate-limited but key is valid — screening still works)
    const anyFunctional = health.providers.some(p => p.status === 'healthy' || p.status === ('degraded' as string));
    const allDown = health.providers.length > 0 && health.providers.every(p => p.status === 'unhealthy');

    return (
      <div className="flex items-center gap-2 text-xs">
        {allHealthy ? (
          <>
            <CheckCircle2 size={14} className="text-green-600" />
            <span className="text-green-700">AI Providers: All Healthy</span>
          </>
        ) : allDown ? (
          <>
            <XCircle size={14} className="text-red-600" />
            <span className="text-red-700">AI Providers: Issues Detected</span>
          </>
        ) : anyFunctional ? (
          <>
            <CheckCircle2 size={14} className="text-green-600" />
            <span className="text-green-700">AI Providers: Ready</span>
          </>
        ) : (
          <>
            <AlertCircle size={14} className="text-yellow-600" />
            <span className="text-yellow-700">AI Providers: Status Unknown</span>
          </>
        )}
        <button
          onClick={() => fetchHealth(true)}
          disabled={isRefreshing}
          className="ml-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          title="Refresh status"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">AI Provider Status</h3>
        <button
          onClick={() => fetchHealth(true)}
          disabled={isRefreshing}
          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          title="Refresh status"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>
      
      <div className="space-y-2">
        {health.providers.map((provider) => (
          <div
            key={provider.name}
            className={clsx(
              'flex items-center justify-between p-3 rounded-lg border text-sm',
              getStatusColor(provider.status)
            )}
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(provider.status)}
              <span className="font-medium">{provider.name}</span>
            </div>
            <div className="text-right">
              <div className="font-medium">{getStatusText(provider)}</div>
              {provider.lastChecked && (
                <div className="text-xs opacity-75">
                  Last checked: {new Date(provider.lastChecked).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {health.timestamp && (
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date(health.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
import { useCallback, useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { requestDeduplication } from '@/utils/requestDeduplication';

interface UseApiRequestOptions<T> {
  manual?: boolean; // If true, won't auto-execute on mount
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  deps?: React.DependencyList; // Dependencies to trigger re-execution
  cacheKey?: string; // Custom cache key for deduplication
}

interface UseApiRequestResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  run: (...args: any[]) => Promise<T | null>;
  refresh: () => Promise<T | null>;
  cancel: () => void;
}

/**
 * Custom hook for API requests with deduplication and loading states
 */
export function useApiRequest<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiRequestOptions<T> = {}
): UseApiRequestResult<T> {
  const {
    manual = false,
    onSuccess,
    onError,
    deps = [],
    cacheKey,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const cancelledRef = useRef(false);
  const lastArgsRef = useRef<any[]>([]);

  const run = useCallback(async (...args: any[]): Promise<T | null> => {
    if (cancelledRef.current) return null;

    setLoading(true);
    setError(null);
    lastArgsRef.current = args;

    try {
      const url = cacheKey || `${apiFunction.name}_${JSON.stringify(args)}`;
      const result = await requestDeduplication.deduplicate(
        () => apiFunction(...args),
        url,
        { params: args }
      );

      if (!cancelledRef.current) {
        setData(result);
        onSuccess?.(result);
        return result;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (!cancelledRef.current) {
        setError(error);
        onError?.(error);
        console.error('API request failed:', error);
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }

    return null;
  }, [apiFunction, cacheKey, onSuccess, onError]);

  const refresh = useCallback(() => {
    return run(...lastArgsRef.current);
  }, [run]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setLoading(false);
  }, []);

  // Auto-execute on mount and deps change (unless manual)
  useEffect(() => {
    cancelledRef.current = false;
    if (!manual) {
      run();
    }
    
    return () => {
      cancelledRef.current = true;
    };
  }, [manual, run, ...deps]);

  return {
    data,
    loading,
    error,
    run,
    refresh,
    cancel,
  };
}

/**
 * Hook for multiple API requests with deduplication
 */
export function useMultipleApiRequests<T extends Record<string, any>>(
  requests: {
    [K in keyof T]: {
      apiFunction: (...args: any[]) => Promise<T[K]>;
      args?: any[];
      manual?: boolean;
      cacheKey?: string;
    };
  },
  options: {
    onSuccess?: (data: T) => void;
    onError?: (errors: Partial<Record<keyof T, Error>>) => void;
    deps?: React.DependencyList;
  } = {}
) {
  const { onSuccess, onError, deps = [] } = options;
  
  const [data, setData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState<Partial<Record<keyof T, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof T, Error>>>({});
  
  const cancelledRef = useRef(false);

  const runAll = useCallback(async () => {
    if (cancelledRef.current) return;

    const requestKeys = Object.keys(requests) as (keyof T)[];
    const manualKeys = requestKeys.filter(key => requests[key].manual);
    const autoKeys = requestKeys.filter(key => !requests[key].manual);

    // Set loading states
    const loadingStates: Partial<Record<keyof T, boolean>> = {};
    autoKeys.forEach(key => {
      loadingStates[key] = true;
    });
    setLoading(loadingStates);

    // Clear previous errors
    setErrors({});

    // Execute non-manual requests
    const promises = autoKeys.map(async (key) => {
      try {
        const request = requests[key];
        const url = request.cacheKey || `${key as string}_${JSON.stringify(request.args || [])}`;
        
        const result = await requestDeduplication.deduplicate(
          () => request.apiFunction(...(request.args || [])),
          url,
          { params: request.args || [] }
        );

        if (!cancelledRef.current) {
          setData(prev => ({ ...prev, [key]: result }));
          setLoading(prev => ({ ...prev, [key]: false }));
        }
        
        return { key, result, error: null };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (!cancelledRef.current) {
          setErrors(prev => ({ ...prev, [key]: error }));
          setLoading(prev => ({ ...prev, [key]: false }));
        }
        return { key, result: null, error };
      }
    });

    const results = await Promise.all(promises);
    
    if (!cancelledRef.current) {
      const successData: Partial<T> = {};
      const errorData: Partial<Record<keyof T, Error>> = {};
      
      results.forEach(({ key, result, error }) => {
        if (error) {
          errorData[key] = error;
        } else {
          successData[key] = result;
        }
      });

      if (Object.keys(successData).length > 0) {
        onSuccess?.(successData as T);
      }
      
      if (Object.keys(errorData).length > 0) {
        onError?.(errorData);
      }
    }
  }, [requests, onSuccess, onError]);

  const runSingle = useCallback(async (key: keyof T, ...args: any[]) => {
    if (cancelledRef.current) return null;

    setLoading(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: undefined }));

    try {
      const request = requests[key];
      const url = request.cacheKey || `${key as string}_${JSON.stringify(args)}`;
      
      const result = await requestDeduplication.deduplicate(
        () => request.apiFunction(...args),
        url,
        { params: args }
      );

      if (!cancelledRef.current) {
        setData(prev => ({ ...prev, [key]: result }));
        setLoading(prev => ({ ...prev, [key]: false }));
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (!cancelledRef.current) {
        setErrors(prev => ({ ...prev, [key]: error }));
        setLoading(prev => ({ ...prev, [key]: false }));
      }
      return null;
    }
  }, [requests]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setLoading({});
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    runAll();
    
    return () => {
      cancelledRef.current = true;
    };
  }, [...deps]);

  return {
    data,
    loading,
    errors,
    runAll,
    runSingle,
    cancel,
  };
}

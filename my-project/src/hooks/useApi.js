import { useState, useCallback } from 'react';

/**
 * Custom hook for API calls with loading, error, and data states
 */
export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunc(...args);
      setData(result);
      return { success: true, data: result };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'An error occurred';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset, setData };
};

/**
 * Custom hook for API calls with automatic execution
 */
export const useApiOnMount = (apiFunc, deps = []) => {
  const { data, loading, error, execute, reset, setData } = useApi(apiFunc);
  
  // Auto-execute on mount and when deps change
  useState(() => {
    execute();
  });

  return { data, loading, error, refetch: execute, reset, setData };
};

export default useApi;

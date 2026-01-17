import { useState, useEffect, useCallback } from 'react';

interface UseHookNameOptions {
  /**
   * Enable or disable the hook logic
   * @default true
   */
  enabled?: boolean;
}

interface UseHookNameResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * useHookName
 * 
 * Description of what this hook does.
 * 
 * @example
 * const { data, isLoading } = useHookName({ enabled: true });
 */
export function useHookName<T>(
  initialData: T | null = null,
  options: UseHookNameOptions = {}
): UseHookNameResult<T> {
  const { enabled = true } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate async operation
      // const result = await api.getData();
      // setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Error in useHookName:', err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}

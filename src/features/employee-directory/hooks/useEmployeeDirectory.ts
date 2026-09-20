import { useState, useEffect, useCallback, useRef } from 'react';
import { GetEmployeesResponse } from '@/data/contracts';
import { fetchEmployees, isAbortError } from '@/data/api-client';
import { DirectoryQueryParams } from '@/domain/schemas';

export function useEmployeeDirectory(params: DirectoryQueryParams) {
  const [response, setResponse] = useState<GetEmployeesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchEmployees(params, controller.signal);
      if (abortControllerRef.current === controller) {
        setResponse(result);
      }
    } catch (err: any) {
      if (!isAbortError(err) && abortControllerRef.current === controller) {
        setError(err.message || 'We could not load employees.');
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [
    params.q,
    params.department,
    params.status,
    params.employmentType,
    params.view,
    params.sortBy,
    params.sortDir,
    params.page,
    params.pageSize,
  ]);

  useEffect(() => {
    loadData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  return {
    response,
    loading,
    error,
    refetch: loadData,
  };
}

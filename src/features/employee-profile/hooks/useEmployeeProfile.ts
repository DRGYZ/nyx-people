import { useState, useEffect, useCallback, useRef } from 'react';
import { Employee } from '@/domain/employee';
import { fetchEmployeeById } from '@/data/api-client';

export function useEmployeeProfile(employeeId: string | undefined) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadEmployee = useCallback(async () => {
    if (!employeeId) {
      setLoading(false);
      setError('Employee ID is required.');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setStatusCode(null);

    try {
      const response = await fetchEmployeeById(employeeId, controller.signal);
      setEmployee(response.data);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'We could not load employee profile.');
        setStatusCode(err.statusCode || 500);
      }
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadEmployee();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadEmployee]);

  return {
    employee,
    loading,
    error,
    statusCode,
    refetch: loadEmployee,
  };
}

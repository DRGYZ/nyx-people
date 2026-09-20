import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DirectoryQueryParams } from '@/domain/schemas';
import {
  parseDirectorySearchParams,
  serializeDirectorySearchParams,
} from '../utils/directory-query';

export function useDirectorySearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParams = useMemo(() => {
    return parseDirectorySearchParams(searchParams);
  }, [searchParams]);

  const updateQueryParams = useCallback(
    (updates: Partial<DirectoryQueryParams>, resetPage = false) => {
      const nextParams: DirectoryQueryParams = {
        ...queryParams,
        ...updates,
      };

      if (resetPage) {
        nextParams.page = 1;
      }

      const nextSerialized = serializeDirectorySearchParams(nextParams);
      setSearchParams(nextSerialized, { replace: true });
    },
    [queryParams, setSearchParams]
  );

  const resetAllFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // Current serialized search query string to pass to profile back link
  const currentQueryString = useMemo(() => {
    return searchParams.toString();
  }, [searchParams]);

  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(queryParams.q) ||
      queryParams.department !== 'all' ||
      queryParams.status !== 'all' ||
      queryParams.employmentType !== 'all' ||
      queryParams.view !== 'all'
    );
  }, [queryParams]);

  return {
    queryParams,
    updateQueryParams,
    resetAllFilters,
    currentQueryString,
    hasActiveFilters,
  };
}

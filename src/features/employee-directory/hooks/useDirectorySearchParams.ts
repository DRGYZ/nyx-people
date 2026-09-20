import { useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DirectoryQueryParams } from '@/domain/schemas';
import {
  parseDirectorySearchParams,
  serializeDirectorySearchParams,
  canonicalizeDirectorySearchParams,
} from '../utils/directory-query';

export interface UpdateQueryParamsOptions {
  resetPage?: boolean;
  replace?: boolean;
}

export function useDirectorySearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParams = useMemo(() => {
    return parseDirectorySearchParams(searchParams);
  }, [searchParams]);

  // Automatic URL repair / canonicalization effect
  const { isCanonical, canonicalSearchParams } = useMemo(() => {
    return canonicalizeDirectorySearchParams(searchParams);
  }, [searchParams]);

  useEffect(() => {
    if (!isCanonical) {
      setSearchParams(canonicalSearchParams, { replace: true });
    }
  }, [isCanonical, canonicalSearchParams, setSearchParams]);

  /**
   * Intentional mixed history policy:
   * - REPLACE for search typing (q) and programmatic URL repair/clamping
   * - PUSH for discrete user actions: department, status, employmentType, view, sort, page, pageSize
   */
  const updateQueryParams = useCallback(
    (updates: Partial<DirectoryQueryParams>, options?: boolean | UpdateQueryParamsOptions) => {
      // Support legacy boolean resetPage argument
      const opts: UpdateQueryParamsOptions =
        typeof options === 'boolean' ? { resetPage: options } : options || {};

      const nextParams: DirectoryQueryParams = {
        ...queryParams,
        ...updates,
      };

      if (opts.resetPage) {
        nextParams.page = 1;
      }

      // Default replace policy:
      // If updates only touches 'q', use replace: true (debounced typing).
      // Otherwise, default to push (replace: false) so Back/Forward navigates filter changes.
      const isSearchOnly =
        updates.q !== undefined && Object.keys(updates).filter((k) => k !== 'page').length === 1;
      const shouldReplace = opts.replace !== undefined ? opts.replace : isSearchOnly;

      const nextSerialized = serializeDirectorySearchParams(nextParams);
      setSearchParams(nextSerialized, { replace: shouldReplace });
    },
    [queryParams, setSearchParams]
  );

  const resetAllFilters = useCallback(() => {
    // Reset filters is a deliberate action -> PUSH into history
    setSearchParams(new URLSearchParams(), { replace: false });
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

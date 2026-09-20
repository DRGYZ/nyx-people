import { DirectoryQueryParams, DirectoryQueryParamsSchema } from '@/domain/schemas';

export function parseDirectorySearchParams(searchParams: URLSearchParams): DirectoryQueryParams {
  const rawParams = {
    q: searchParams.get('q') || '',
    department: searchParams.get('department') || 'all',
    status: searchParams.get('status') || 'all',
    employmentType: searchParams.get('employmentType') || 'all',
    view: searchParams.get('view') || 'all',
    sortBy: searchParams.get('sortBy') || 'default',
    sortDir: searchParams.get('sortDir') || 'asc',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 25,
  };

  const parsed = DirectoryQueryParamsSchema.safeParse(rawParams);
  if (parsed.success) {
    return parsed.data;
  }

  // Fallback defaults
  return {
    q: '',
    department: 'all',
    status: 'all',
    employmentType: 'all',
    view: 'all',
    sortBy: 'default',
    sortDir: 'asc',
    page: 1,
    pageSize: 25,
  };
}

export function serializeDirectorySearchParams(params: Partial<DirectoryQueryParams>): URLSearchParams {
  const sp = new URLSearchParams();

  if (params.q && params.q.trim()) {
    sp.set('q', params.q.trim());
  }
  if (params.department && params.department !== 'all') {
    sp.set('department', params.department);
  }
  if (params.status && params.status !== 'all') {
    sp.set('status', params.status);
  }
  if (params.employmentType && params.employmentType !== 'all') {
    sp.set('employmentType', params.employmentType);
  }
  if (params.view && params.view !== 'all') {
    sp.set('view', params.view);
  }
  if (params.sortBy && params.sortBy !== 'default') {
    sp.set('sortBy', params.sortBy);
  }
  if (params.sortDir && params.sortDir !== 'asc') {
    sp.set('sortDir', params.sortDir);
  }
  if (params.page && params.page > 1) {
    sp.set('page', String(params.page));
  }
  if (params.pageSize && params.pageSize !== 25) {
    sp.set('pageSize', String(params.pageSize));
  }

  return sp;
}

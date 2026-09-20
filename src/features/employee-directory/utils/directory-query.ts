import { DirectoryQueryParams } from '@/domain/schemas';
import { Department, EmployeeStatus, EmploymentType } from '@/domain/employee';

const VALID_DEPARTMENTS: readonly Department[] = [
  'Engineering',
  'Product',
  'People',
  'Marketing',
  'Finance',
  'Operations',
  'Sales',
  'Legal',
];

const VALID_STATUSES: readonly EmployeeStatus[] = [
  'active',
  'onboarding',
  'leave',
  'offboarded',
];

const VALID_EMPLOYMENT_TYPES: readonly EmploymentType[] = [
  'full-time',
  'part-time',
  'contractor',
  'intern',
];

const VALID_VIEWS = ['all', 'new-starters', 'onboarding', 'contractors'] as const;
type DirectoryView = (typeof VALID_VIEWS)[number];

const VALID_SORT_COLUMNS = ['default', 'name', 'department', 'status', 'startDate', 'role'] as const;
type SortColumn = (typeof VALID_SORT_COLUMNS)[number];

const VALID_PAGE_SIZES = [10, 25, 50, 100] as const;

/**
 * Validates each query parameter independently field-by-field.
 * Invalid parameters fall back to safe defaults without discarding valid neighboring state.
 */
export function parseDirectorySearchParams(
  searchParams: URLSearchParams,
  maxPage?: number
): DirectoryQueryParams {
  // 1. Search Query (q)
  const rawQ = searchParams.get('q');
  const q = rawQ ? rawQ.trim().slice(0, 100) : '';

  // 2. Department (case-insensitive resolution)
  const rawDept = searchParams.get('department');
  let department: string = 'all';
  if (rawDept && rawDept.toLowerCase() !== 'all') {
    const matchedDept = VALID_DEPARTMENTS.find(
      (d) => d.toLowerCase() === rawDept.trim().toLowerCase()
    );
    department = matchedDept || 'all';
  }

  // 3. Status (case-insensitive resolution)
  const rawStatus = searchParams.get('status');
  let status: string = 'all';
  if (rawStatus && rawStatus.toLowerCase() !== 'all') {
    const matchedStatus = VALID_STATUSES.find(
      (s) => s.toLowerCase() === rawStatus.trim().toLowerCase()
    );
    status = matchedStatus || 'all';
  }

  // 4. Employment Type (case-insensitive resolution)
  const rawType = searchParams.get('employmentType') || searchParams.get('type');
  let employmentType: string = 'all';
  if (rawType && rawType.toLowerCase() !== 'all') {
    const matchedType = VALID_EMPLOYMENT_TYPES.find(
      (t) => t.toLowerCase() === rawType.trim().toLowerCase()
    );
    employmentType = matchedType || 'all';
  }

  // 5. Editorial View / Tab
  const rawView = searchParams.get('view');
  let view: DirectoryView = 'all';
  if (rawView && rawView.toLowerCase() !== 'all') {
    const matchedView = VALID_VIEWS.find(
      (v) => v.toLowerCase() === rawView.trim().toLowerCase()
    );
    view = matchedView || 'all';
  }

  // 6. Sort Column (supports 'sortBy' and alias 'sort')
  const rawSort = searchParams.get('sortBy') || searchParams.get('sort');
  let sortBy: SortColumn = 'default';
  if (rawSort && rawSort !== 'default') {
    const matchedSort = VALID_SORT_COLUMNS.find(
      (s) => s.toLowerCase() === rawSort.trim().toLowerCase()
    );
    sortBy = matchedSort || 'default';
  }

  // 7. Sort Direction (supports 'sortDir' and alias 'direction')
  const rawDir = searchParams.get('sortDir') || searchParams.get('direction');
  let sortDir: 'asc' | 'desc' = 'asc';
  if (rawDir) {
    const normalizedDir = rawDir.trim().toLowerCase();
    if (normalizedDir === 'desc') {
      sortDir = 'desc';
    } else {
      sortDir = 'asc';
    }
  }

  // 8. Page (must be positive integer, clamped if maxPage provided)
  const rawPage = searchParams.get('page');
  let page = 1;
  if (rawPage !== null) {
    const parsedNum = Number(rawPage);
    if (!isNaN(parsedNum) && Number.isInteger(parsedNum) && parsedNum >= 1) {
      page = parsedNum;
    } else {
      page = 1;
    }
  }
  if (maxPage !== undefined && maxPage >= 1) {
    page = Math.min(page, maxPage);
  }

  // 9. Page Size
  const rawPageSize = searchParams.get('pageSize');
  let pageSize = 25;
  if (rawPageSize !== null) {
    const parsedSize = Number(rawPageSize);
    if (VALID_PAGE_SIZES.includes(parsedSize as any)) {
      pageSize = parsedSize;
    } else {
      pageSize = 25;
    }
  }

  return {
    q,
    department,
    status,
    employmentType,
    view,
    sortBy,
    sortDir,
    page,
    pageSize,
  };
}

/**
 * Serializes directory query parameters into clean canonical URLSearchParams.
 * Omits default values to keep the URL concise and human-readable.
 */
export function serializeDirectorySearchParams(
  params: Partial<DirectoryQueryParams>
): URLSearchParams {
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

export interface CanonicalizationResult {
  canonicalParams: DirectoryQueryParams;
  canonicalSearchParams: URLSearchParams;
  isCanonical: boolean;
}

/**
 * Checks whether the current raw search params match the canonical serialized form.
 * If malformed or out-of-range parameters are detected, isCanonical will be false,
 * and canonicalSearchParams will contain the repaired, clean URL search params.
 */
export function canonicalizeDirectorySearchParams(
  searchParams: URLSearchParams,
  maxPage?: number
): CanonicalizationResult {
  const canonicalParams = parseDirectorySearchParams(searchParams, maxPage);
  const canonicalSearchParams = serializeDirectorySearchParams(canonicalParams);

  // Compare raw search params with canonical search params
  const rawKeys = Array.from(searchParams.keys()).sort();
  const canonicalKeys = Array.from(canonicalSearchParams.keys()).sort();

  let isCanonical = true;
  if (rawKeys.length !== canonicalKeys.length) {
    isCanonical = false;
  } else {
    for (let i = 0; i < rawKeys.length; i++) {
      const rawKey = rawKeys[i]!;
      const canonicalKey = canonicalKeys[i]!;
      if (rawKey !== canonicalKey) {
        isCanonical = false;
        break;
      }
      if (searchParams.get(rawKey) !== canonicalSearchParams.get(canonicalKey)) {
        isCanonical = false;
        break;
      }
    }
  }

  return {
    canonicalParams,
    canonicalSearchParams,
    isCanonical,
  };
}

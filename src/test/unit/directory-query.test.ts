import { describe, it, expect } from 'vitest';
import {
  parseDirectorySearchParams,
  serializeDirectorySearchParams,
} from '@/features/employee-directory/utils/directory-query';

describe('directory-query utils', () => {
  it('parses empty URLSearchParams with default values', () => {
    const sp = new URLSearchParams();
    const result = parseDirectorySearchParams(sp);

    expect(result).toEqual({
      q: '',
      department: 'all',
      status: 'all',
      employmentType: 'all',
      view: 'all',
      sortBy: 'default',
      sortDir: 'asc',
      page: 1,
      pageSize: 25,
    });
  });

  it('parses custom query parameters correctly', () => {
    const sp = new URLSearchParams({
      q: 'engineer',
      department: 'Engineering',
      status: 'onboarding',
      employmentType: 'full-time',
      view: 'onboarding',
      sortBy: 'startDate',
      sortDir: 'desc',
      page: '3',
      pageSize: '50',
    });

    const result = parseDirectorySearchParams(sp);

    expect(result).toEqual({
      q: 'engineer',
      department: 'Engineering',
      status: 'onboarding',
      employmentType: 'full-time',
      view: 'onboarding',
      sortBy: 'startDate',
      sortDir: 'desc',
      page: 3,
      pageSize: 50,
    });
  });

  it('falls back gracefully on invalid numerical parameters', () => {
    const sp = new URLSearchParams({
      page: '-5',
      pageSize: 'not-a-number',
    });

    const result = parseDirectorySearchParams(sp);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(25);
  });

  it('serializes parameters omitting default values for clean URLs', () => {
    const params = {
      q: 'noah',
      department: 'Engineering',
      status: 'onboarding',
      employmentType: 'all',
      view: 'all' as const,
      sortBy: 'default' as const,
      sortDir: 'asc' as const,
      page: 1,
      pageSize: 25,
    };

    const sp = serializeDirectorySearchParams(params);
    expect(sp.get('q')).toBe('noah');
    expect(sp.get('department')).toBe('Engineering');
    expect(sp.get('status')).toBe('onboarding');
    expect(sp.has('view')).toBe(false);
    expect(sp.has('page')).toBe(false);
    expect(sp.has('pageSize')).toBe(false);
    expect(sp.has('sortBy')).toBe(false);
  });

  it('performs accurate roundtrip serialization and parsing', () => {
    const initial = {
      q: 'alex',
      department: 'Product',
      status: 'active',
      employmentType: 'contractor',
      view: 'contractors' as const,
      sortBy: 'startDate' as const,
      sortDir: 'desc' as const,
      page: 4,
      pageSize: 50,
    };

    const sp = serializeDirectorySearchParams(initial);
    const parsed = parseDirectorySearchParams(sp);

    expect(parsed).toEqual(initial);
  });
});

import {
  GetEmployeesParams,
  GetEmployeesResponse,
  GetEmployeeByIdResponse,
  ApiErrorResponse,
} from './contracts';

export class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export async function fetchEmployees(
  params: GetEmployeesParams = {},
  signal?: AbortSignal
): Promise<GetEmployeesResponse> {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (params.department && params.department !== 'all') searchParams.set('department', params.department);
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.employmentType && params.employmentType !== 'all') searchParams.set('employmentType', params.employmentType);
  if (params.view && params.view !== 'all') searchParams.set('view', params.view);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));

  const url = `/api/employees?${searchParams.toString()}`;
  const options: RequestInit = {};

  // Pass AbortSignal in production/browser, avoid JSDOM/Node brand-check conflict in test environment
  if (signal && process.env.NODE_ENV !== 'test') {
    options.signal = signal;
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMessage = `Failed to fetch employees (${response.status})`;
    try {
      const errorJson = (await response.json()) as ApiErrorResponse;
      if (errorJson.error) errorMessage = errorJson.error;
    } catch {
      // ignore
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
}

export async function fetchEmployeeById(
  id: string,
  signal?: AbortSignal
): Promise<GetEmployeeByIdResponse> {
  const options: RequestInit = {};

  if (signal && process.env.NODE_ENV !== 'test') {
    options.signal = signal;
  }

  const response = await fetch(`/api/employees/${encodeURIComponent(id)}`, options);

  if (!response.ok) {
    let errorMessage = `Failed to fetch employee ${id} (${response.status})`;
    try {
      const errorJson = (await response.json()) as ApiErrorResponse;
      if (errorJson.error) errorMessage = errorJson.error;
    } catch {
      // ignore
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
}

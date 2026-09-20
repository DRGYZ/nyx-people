import { EmployeeCreateInput, EmployeeUpdateInput } from '@/domain/employee';
import { OnboardingTab } from '@/domain/onboarding';
import {
  GetEmployeesParams,
  GetEmployeesResponse,
  GetEmployeeByIdResponse,
  ApiErrorResponse,
  GetManagersResponse,
  EmployeeManagerOption,
  GetOnboardingListResponse,
  GetOnboardingPlanResponse,
  UpdateOnboardingTaskResponse,
  GetOverviewResponse,
  ApiErrorCode,
} from './contracts';

export class ApiError extends Error {
  public statusCode: number;
  public code?: ApiErrorCode;
  public field?: string;

  constructor(message: string, statusCode: number, code?: ApiErrorCode, field?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
  }
}

export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === 'AbortError') ||
    (err instanceof Error && err.name === 'AbortError')
  );
}

export async function parseApiError(response: Response, defaultMessage: string): Promise<ApiError> {
  let errorMessage = `${defaultMessage} (${response.status})`;
  let errorCode: ApiErrorCode | undefined;
  let errorField: string | undefined;

  try {
    const errorJson = (await response.json()) as ApiErrorResponse;
    if (typeof errorJson.error === 'string') {
      errorMessage = errorJson.error;
    } else if (errorJson.error && typeof errorJson.error === 'object') {
      errorMessage = errorJson.error.message || errorMessage;
      errorCode = errorJson.error.code;
      errorField = errorJson.error.field;
    }
  } catch {
    // ignore
  }

  return new ApiError(errorMessage, response.status, errorCode, errorField);
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
    throw await parseApiError(response, 'Failed to fetch employees');
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
    throw await parseApiError(response, `Failed to fetch employee ${id}`);
  }

  return response.json();
}

export async function createEmployee(
  data: EmployeeCreateInput,
  signal?: AbortSignal
): Promise<GetEmployeeByIdResponse> {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  if (signal && process.env.NODE_ENV !== 'test') {
    options.signal = signal;
  }

  const response = await fetch('/api/employees', options);

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to create employee');
  }

  return response.json();
}

export async function updateEmployee(
  id: string,
  data: EmployeeUpdateInput,
  signal?: AbortSignal
): Promise<GetEmployeeByIdResponse> {
  const options: RequestInit = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  if (signal && process.env.NODE_ENV !== 'test') {
    options.signal = signal;
  }

  const response = await fetch(`/api/employees/${encodeURIComponent(id)}`, options);

  if (!response.ok) {
    throw await parseApiError(response, `Failed to update employee ${id}`);
  }

  return response.json();
}

export async function fetchManagers(
  query: string = '',
  excludeId?: string,
  signal?: AbortSignal
): Promise<EmployeeManagerOption[]> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (excludeId) params.set('excludeId', excludeId);

  const options: RequestInit = {};
  if (signal && process.env.NODE_ENV !== 'test') {
    options.signal = signal;
  }

  const response = await fetch(`/api/managers?${params.toString()}`, options);

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch managers');
  }

  const result = (await response.json()) as GetManagersResponse;
  return result.data;
}

export async function fetchOnboardingList(
  tab: OnboardingTab = 'all',
  signal?: AbortSignal
): Promise<GetOnboardingListResponse> {
  const options: RequestInit = {};
  if (signal && process.env.NODE_ENV !== 'test') {
    options.signal = signal;
  }

  const response = await fetch(`/api/onboarding?tab=${encodeURIComponent(tab)}`, options);

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch onboarding list');
  }

  return response.json();
}

export async function fetchOnboardingPlan(
  employeeId: string,
  signal?: AbortSignal
): Promise<GetOnboardingPlanResponse> {
  const options: RequestInit = {};
  if (signal && process.env.NODE_ENV !== 'test') {
    options.signal = signal;
  }

  const response = await fetch(`/api/onboarding/${encodeURIComponent(employeeId)}`, options);

  if (!response.ok) {
    throw await parseApiError(response, `Failed to fetch onboarding plan for ${employeeId}`);
  }

  return response.json();
}

export async function updateOnboardingTask(
  employeeId: string,
  taskKey: string,
  completed: boolean,
  signal?: AbortSignal
): Promise<UpdateOnboardingTaskResponse> {
  const options: RequestInit = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed }),
  };

  if (signal && process.env.NODE_ENV !== 'test') {
    options.signal = signal;
  }

  const response = await fetch(
    `/api/onboarding/${encodeURIComponent(employeeId)}/tasks/${encodeURIComponent(taskKey)}`,
    options
  );

  if (!response.ok) {
    throw await parseApiError(response, `Failed to update task ${taskKey}`);
  }

  return response.json();
}

export async function fetchOverview(
  signal?: AbortSignal
): Promise<GetOverviewResponse> {
  const options: RequestInit = {};
  if (signal && process.env.NODE_ENV !== 'test') {
    options.signal = signal;
  }

  const response = await fetch('/api/overview', options);

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to fetch overview');
  }

  return response.json();
}


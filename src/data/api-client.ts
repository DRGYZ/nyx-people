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
    let errorMessage = `Failed to create employee (${response.status})`;
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
    let errorMessage = `Failed to update employee ${id} (${response.status})`;
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
    throw new ApiError(`Failed to fetch managers (${response.status})`, response.status);
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
    let errorMessage = `Failed to fetch onboarding list (${response.status})`;
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
    let errorMessage = `Failed to fetch onboarding plan for ${employeeId} (${response.status})`;
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
    let errorMessage = `Failed to update task ${taskKey} (${response.status})`;
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


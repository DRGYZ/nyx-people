import { Employee, DirectoryCounts } from '@/domain/employee';
import { DirectoryQueryParams } from '@/domain/schemas';

export interface GetEmployeesResponse {
  data: Employee[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: DirectoryCounts;
  totalDepartments: number;
}

export interface GetEmployeeByIdResponse {
  data: Employee;
}

export interface ApiErrorResponse {
  error: string;
  statusCode: number;
}

export type GetEmployeesParams = Partial<DirectoryQueryParams>;

export interface EmployeeManagerOption {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
}

export interface GetManagersResponse {
  data: EmployeeManagerOption[];
}

export interface OnboardingEmployeeSummary {
  employee: Employee;
  progress: import('@/domain/onboarding').OnboardingProgress;
  urgency: string;
  needsAttention: boolean;
  startingSoon: boolean;
  remainingTasks: string[];
}

export interface GetOnboardingListResponse {
  data: OnboardingEmployeeSummary[];
  counts: import('@/domain/onboarding').OnboardingCounts;
  total: number;
}

export interface GetOnboardingPlanResponse {
  employee: Employee;
  onboarding: import('@/domain/employee').OnboardingDetails;
  progress: import('@/domain/onboarding').OnboardingProgress;
}

export interface UpdateOnboardingTaskResponse {
  employee: Employee;
  onboarding: import('@/domain/employee').OnboardingDetails;
  progress: import('@/domain/onboarding').OnboardingProgress;
}


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


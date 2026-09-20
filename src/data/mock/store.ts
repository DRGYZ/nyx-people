import { Employee, DirectoryCounts } from '@/domain/employee';
import { GetEmployeesParams, GetEmployeesResponse } from '@/data/contracts';
import { deterministicEmployees } from './fixtures';

export class EmployeeMockStore {
  private employees: Employee[];

  constructor(initialData: Employee[] = deterministicEmployees) {
    this.employees = [...initialData];
  }

  // Calculate counts across the whole dataset for tabs
  public getCounts(): DirectoryCounts {
    let newStarters = 0;
    let onboarding = 0;
    let contractors = 0;

    const referenceDate = new Date('2026-09-20').getTime();
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;

    for (const emp of this.employees) {
      if (emp.employment.status === 'onboarding') {
        onboarding++;
      }
      if (emp.employment.employmentType === 'contractor') {
        contractors++;
      }
      const startTime = new Date(emp.employment.startDate).getTime();
      if (Math.abs(referenceDate - startTime) <= sixtyDaysMs) {
        newStarters++;
      }
    }

    return {
      all: this.employees.length,
      newStarters,
      onboarding,
      contractors,
    };
  }

  public getEmployees(params: GetEmployeesParams): GetEmployeesResponse {
    const q = (params.q || '').trim().toLowerCase();
    const department = params.department || 'all';
    const status = params.status || 'all';
    const employmentType = params.employmentType || 'all';
    const view = params.view || 'all';
    const sortBy = params.sortBy || 'default';
    const sortDir = params.sortDir || 'asc';
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.max(1, Number(params.pageSize) || 25);

    const referenceDate = new Date('2026-09-20').getTime();
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;

    // 1. Filter by preset view
    let filtered = this.employees.filter((emp) => {
      if (view === 'onboarding') {
        return emp.employment.status === 'onboarding';
      }
      if (view === 'contractors') {
        return emp.employment.employmentType === 'contractor';
      }
      if (view === 'new-starters') {
        const startTime = new Date(emp.employment.startDate).getTime();
        return Math.abs(referenceDate - startTime) <= sixtyDaysMs;
      }
      return true;
    });

    // 2. Filter by search query
    if (q) {
      filtered = filtered.filter((emp) => {
        const fullName = `${emp.person.firstName} ${emp.person.lastName}`.toLowerCase();
        const email = emp.person.email.toLowerCase();
        const role = emp.employment.jobTitle.toLowerCase();
        const dept = emp.employment.department.toLowerCase();
        return (
          fullName.includes(q) ||
          email.includes(q) ||
          role.includes(q) ||
          dept.includes(q)
        );
      });
    }

    // 3. Filter by department
    if (department && department !== 'all') {
      filtered = filtered.filter(
        (emp) => emp.employment.department.toLowerCase() === department.toLowerCase()
      );
    }

    // 4. Filter by status
    if (status && status !== 'all') {
      filtered = filtered.filter(
        (emp) => emp.employment.status.toLowerCase() === status.toLowerCase()
      );
    }

    // 5. Filter by employment type
    if (employmentType && employmentType !== 'all') {
      filtered = filtered.filter(
        (emp) => emp.employment.employmentType.toLowerCase() === employmentType.toLowerCase()
      );
    }

    // 6. Sort (only if not 'default')
    if (sortBy && sortBy !== 'default') {
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case 'name': {
            const nameA = `${a.person.lastName} ${a.person.firstName}`.toLowerCase();
            const nameB = `${b.person.lastName} ${b.person.firstName}`.toLowerCase();
            comparison = nameA.localeCompare(nameB);
            break;
          }
          case 'department': {
            comparison = a.employment.department.localeCompare(b.employment.department);
            break;
          }
          case 'status': {
            comparison = a.employment.status.localeCompare(b.employment.status);
            break;
          }
          case 'startDate': {
            comparison = a.employment.startDate.localeCompare(b.employment.startDate);
            break;
          }
          case 'role': {
            comparison = a.employment.jobTitle.localeCompare(b.employment.jobTitle);
            break;
          }
          default:
            comparison = 0;
        }

        return sortDir === 'desc' ? -comparison : comparison;
      });
    }

    // 7. Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages,
      counts: this.getCounts(),
      totalDepartments: 8,
    };
  }

  public getEmployeeById(id: string): Employee | undefined {
    return this.employees.find(
      (emp) => emp.id.toLowerCase() === id.toLowerCase()
    );
  }
}

export const mockStore = new EmployeeMockStore();

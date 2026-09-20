import {
  Employee,
  DirectoryCounts,
  EmployeeCreateInput,
  EmployeeUpdateInput,
  OnboardingTask,
} from '@/domain/employee';
import { GetEmployeesParams, GetEmployeesResponse } from '@/data/contracts';
import { deterministicEmployees } from './fixtures';

export const STORAGE_KEY = 'ledger-hr_employees_v1';

function loadPersistedEmployees(): Employee[] | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as Employee[];
    }
  } catch (err) {
    console.warn('Failed to parse persisted employees from localStorage:', err);
  }
  return null;
}

function savePersistedEmployees(employees: Employee[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  } catch (err) {
    console.warn('Failed to persist employees to localStorage:', err);
  }
}

export class EmployeeMockStore {
  private employees: Employee[];

  constructor(initialData?: Employee[]) {
    if (initialData) {
      this.employees = [...initialData];
    } else {
      const persisted = loadPersistedEmployees();
      if (persisted) {
        this.employees = persisted;
      } else {
        this.employees = [...deterministicEmployees];
        savePersistedEmployees(this.employees);
      }
    }
  }

  public resetToBaseline(): void {
    this.employees = [...deterministicEmployees];
    savePersistedEmployees(this.employees);
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

  public searchManagers(query: string = '', excludeId?: string) {
    const q = query.trim().toLowerCase();
    return this.employees
      .filter((e) => {
        if (excludeId && e.id.toLowerCase() === excludeId.toLowerCase()) return false;
        if (!q) return true;
        const fullName = `${e.person.firstName} ${e.person.lastName}`.toLowerCase();
        return (
          fullName.includes(q) ||
          e.employment.jobTitle.toLowerCase().includes(q) ||
          e.employment.department.toLowerCase().includes(q)
        );
      })
      .slice(0, 50)
      .map((e) => ({
        id: e.id,
        name: `${e.person.firstName} ${e.person.lastName}`,
        initials: `${e.person.firstName[0] || ''}${e.person.lastName[0] || ''}`.toUpperCase(),
        role: e.employment.jobTitle,
        department: e.employment.department,
      }));
  }

  public createEmployee(input: EmployeeCreateInput): Employee {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existing = this.employees.find(
      (e) => e.person.email.toLowerCase() === normalizedEmail
    );
    if (existing) {
      throw new Error(`Email "${input.email}" is already registered to another employee.`);
    }

    let maxId = 0;
    for (const e of this.employees) {
      const match = e.id.match(/^EMP-(\d+)$/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxId) maxId = num;
      }
    }
    const newId = `EMP-${String(maxId + 1).padStart(4, '0')}`;

    // Resolve manager
    let manager = undefined;
    if (input.managerId) {
      const mgr = this.getEmployeeById(input.managerId);
      if (mgr) {
        manager = {
          id: mgr.id,
          name: `${mgr.person.firstName} ${mgr.person.lastName}`,
          initials: `${mgr.person.firstName[0] || ''}${mgr.person.lastName[0] || ''}`.toUpperCase(),
        };
      }
    }

    const now = new Date().toISOString();

    const defaultTasks: OnboardingTask[] = [
      { id: 'task-1', title: 'Hardware provisioning', subtitle: 'Workstation configuration and security keys', completed: false },
      { id: 'task-2', title: 'Identity & workspace accounts', subtitle: 'Single sign-on and operational system access', completed: false },
      { id: 'task-3', title: 'Compliance & security briefing', subtitle: 'Data privacy and regulatory policy acknowledgments', completed: false },
      { id: 'task-4', title: 'Team introduction & 1:1 schedule', subtitle: 'Manager introduction and buddy pairing', completed: false },
      { id: 'task-5', title: 'Development environment setup', subtitle: 'Repository permissions and workspace tooling', completed: false },
      { id: 'task-6', title: '30-day checkpoint schedule', subtitle: 'Initial milestone alignment with People Ops', completed: false },
    ];

    const newEmployee: Employee = {
      id: newId,
      person: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        preferredName: input.preferredName?.trim() || undefined,
        email: normalizedEmail,
        phone: input.phone.trim(),
        dateOfBirth: input.dateOfBirth,
        address: {
          street: input.street.trim(),
          postalCode: input.postalCode.trim(),
          city: input.city.trim(),
          country: input.country.trim(),
        },
      },
      employment: {
        jobTitle: input.jobTitle.trim(),
        department: input.department,
        location: input.location,
        employmentType: input.employmentType,
        status: input.status,
        startDate: input.startDate,
        manager,
      },
      onboarding:
        input.status === 'onboarding'
          ? {
              totalTasks: defaultTasks.length,
              completedTasks: 0,
              tasks: defaultTasks,
              responsiblePartner: {
                name: 'Eleanor Vance',
                note: 'Assigned People Operations Partner for onboarding setup',
              },
              attentionSummary: 'New onboarding workflow initialized. Pending initial account setup.',
            }
          : undefined,
      timestamps: {
        createdAt: now,
        updatedAt: now,
      },
    };

    this.employees.unshift(newEmployee);
    savePersistedEmployees(this.employees);
    return newEmployee;
  }

  public updateEmployee(id: string, input: EmployeeUpdateInput): Employee {
    const target = this.getEmployeeById(id);
    if (!target) {
      throw new Error(`Employee with ID '${id}' not found.`);
    }

    if (input.email) {
      const normalizedEmail = input.email.trim().toLowerCase();
      const conflict = this.employees.find(
        (e) => e.id.toLowerCase() !== id.toLowerCase() && e.person.email.toLowerCase() === normalizedEmail
      );
      if (conflict) {
        throw new Error(`Email "${input.email}" is already registered to another employee.`);
      }
    }

    if (input.managerId && input.managerId.toLowerCase() === id.toLowerCase()) {
      throw new Error('An employee cannot be their own manager.');
    }

    // Resolve manager
    let manager = target.employment.manager;
    if (input.managerId !== undefined) {
      if (!input.managerId) {
        manager = undefined;
      } else {
        const mgr = this.getEmployeeById(input.managerId);
        if (mgr) {
          manager = {
            id: mgr.id,
            name: `${mgr.person.firstName} ${mgr.person.lastName}`,
            initials: `${mgr.person.firstName[0] || ''}${mgr.person.lastName[0] || ''}`.toUpperCase(),
          };
        }
      }
    }

    const now = new Date().toISOString();

    const updatedEmployee: Employee = {
      ...target,
      person: {
        ...target.person,
        firstName: input.firstName !== undefined ? input.firstName.trim() : target.person.firstName,
        lastName: input.lastName !== undefined ? input.lastName.trim() : target.person.lastName,
        preferredName:
          input.preferredName !== undefined
            ? input.preferredName.trim() || undefined
            : target.person.preferredName,
        email: input.email !== undefined ? input.email.trim().toLowerCase() : target.person.email,
        phone: input.phone !== undefined ? input.phone.trim() : target.person.phone,
        dateOfBirth: input.dateOfBirth !== undefined ? input.dateOfBirth : target.person.dateOfBirth,
        address: {
          ...target.person.address,
          street: input.street !== undefined ? input.street.trim() : target.person.address.street,
          postalCode:
            input.postalCode !== undefined ? input.postalCode.trim() : target.person.address.postalCode,
          city: input.city !== undefined ? input.city.trim() : target.person.address.city,
          country: input.country !== undefined ? input.country.trim() : target.person.address.country,
        },
      },
      employment: {
        ...target.employment,
        jobTitle: input.jobTitle !== undefined ? input.jobTitle.trim() : target.employment.jobTitle,
        department: input.department !== undefined ? input.department : target.employment.department,
        location: input.location !== undefined ? input.location : target.employment.location,
        employmentType:
          input.employmentType !== undefined ? input.employmentType : target.employment.employmentType,
        status: input.status !== undefined ? input.status : target.employment.status,
        startDate: input.startDate !== undefined ? input.startDate : target.employment.startDate,
        manager,
      },
      timestamps: {
        ...target.timestamps,
        updatedAt: now,
      },
    };

    const index = this.employees.findIndex(
      (e) => e.id.toLowerCase() === id.toLowerCase()
    );
    if (index !== -1) {
      this.employees[index] = updatedEmployee;
    }
    savePersistedEmployees(this.employees);
    return updatedEmployee;
  }
}

export const mockStore = new EmployeeMockStore();


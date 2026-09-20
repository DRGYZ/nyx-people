import {
  Employee,
  DirectoryCounts,
  EmployeeCreateInput,
  EmployeeUpdateInput,
  EmployeeManager,
  OnboardingDetails,
} from '@/domain/employee';
import {
  GetEmployeesParams,
  GetEmployeesResponse,
  GetOnboardingListResponse,
  GetOnboardingPlanResponse,
  UpdateOnboardingTaskResponse,
  OnboardingEmployeeSummary,
  GetOverviewResponse,
} from '@/data/contracts';
import {
  OnboardingTab,
  OnboardingCounts,
  calculateOnboardingProgress,
  calculateOnboardingCounts,
  filterOnboardingEmployees,
  formatStartUrgency,
  needsAttention,
  isStartingSoon,
  reconcileOnboardingTasks,
  syncOnboardingPlanOnStatusChange,
} from '@/domain/onboarding';
import { getNow } from '@/domain/clock';
import { PersistedEnvelopeV1, PersistedEnvelopeV1Schema } from '@/domain/schemas';
import { deriveOverviewData } from '@/domain/overview';
import { createBaselineEmployees } from './fixtures';

export const STORAGE_KEY = 'ledger-hr_employees_v1';

/**
 * Loads, parses, and validates the persisted employee storage envelope.
 * Returns null if stored JSON is corrupt, schema is invalid, unknown version,
 * or contains duplicate IDs, triggering controlled fallback to baseline.
 */
export function loadPersistedEmployees(): Employee[] | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = PersistedEnvelopeV1Schema.safeParse(parsed);
    if (!result.success) {
      console.warn('Persisted state schema validation failed, falling back to baseline:', result.error);
      return null;
    }
    return result.data.employees.map((emp) => {
      if (emp.onboarding && emp.onboarding.tasks) {
        const reconciledTasks = reconcileOnboardingTasks(emp.onboarding.tasks);
        const progress = calculateOnboardingProgress(reconciledTasks);
        return {
          ...emp,
          onboarding: {
            ...emp.onboarding,
            tasks: reconciledTasks,
            totalTasks: progress.total,
            completedTasks: progress.completed,
          },
        };
      }
      return emp;
    });
  } catch (err) {
    console.warn('Failed to parse persisted employees from localStorage, falling back to baseline:', err);
    return null;
  }
}

/**
 * Saves employees to localStorage inside a versioned envelope.
 * Throws on storage failures (e.g. QuotaExceededError) so mutations can abort.
 */
export function savePersistedEmployees(employees: Employee[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  const envelope: PersistedEnvelopeV1 = {
    version: 1,
    employees,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch (err: any) {
    throw new Error(`Storage write failed: ${err?.message || 'Unable to persist state to browser storage'}`);
  }
}

export class EmployeeMockStore {
  private employees: Employee[];

  constructor(initialData?: Employee[]) {
    if (initialData) {
      this.employees = structuredClone(initialData);
    } else {
      const persisted = loadPersistedEmployees();
      if (persisted) {
        this.employees = persisted;
      } else {
        this.employees = createBaselineEmployees();
        savePersistedEmployees(this.employees);
      }
    }
  }

  public resetToBaseline(): void {
    this.employees = createBaselineEmployees();
    savePersistedEmployees(this.employees);
  }

  /**
   * Resolves presentation manager details dynamically from the referenced employee ID.
   */
  public resolveManager(managerId?: string): EmployeeManager | undefined {
    if (!managerId) return undefined;
    const mgr = this.employees.find((e) => e.id.toLowerCase() === managerId.toLowerCase());
    if (!mgr) return undefined;
    const initials = `${mgr.person.firstName[0] || ''}${mgr.person.lastName[0] || ''}`.toUpperCase();
    return {
      id: mgr.id,
      name: `${mgr.person.firstName} ${mgr.person.lastName}`,
      initials,
    };
  }

  /**
   * Resolves an employee's presentation details (like manager details) dynamically.
   */
  public resolveEmployee(emp: Employee): Employee {
    const managerId = emp.employment.managerId !== undefined
      ? (emp.employment.managerId || undefined)
      : emp.employment.manager?.id;
    const resolvedManager = managerId ? this.resolveManager(managerId) : undefined;
    return {
      ...emp,
      employment: {
        ...emp.employment,
        managerId,
        manager: resolvedManager,
      },
    };
  }

  // Calculate counts across the whole dataset for tabs
  public getCounts(): DirectoryCounts {
    let newStarters = 0;
    let onboarding = 0;
    let contractors = 0;

    const referenceDate = getNow().getTime();
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

    const referenceDate = getNow().getTime();
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
          dept.includes(q) ||
          emp.id.toLowerCase().includes(q)
        );
      });
    }

    // 3. Filter by department
    if (department !== 'all') {
      filtered = filtered.filter((emp) => emp.employment.department === department);
    }

    // 4. Filter by status
    if (status !== 'all') {
      filtered = filtered.filter((emp) => emp.employment.status === status);
    }

    // 5. Filter by employment type
    if (employmentType !== 'all') {
      filtered = filtered.filter((emp) => emp.employment.employmentType === employmentType);
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
          case 'department':
            comparison = a.employment.department.localeCompare(b.employment.department);
            break;
          case 'role':
            comparison = a.employment.jobTitle.localeCompare(b.employment.jobTitle);
            break;
          case 'status':
            comparison = a.employment.status.localeCompare(b.employment.status);
            break;
          case 'startDate':
            comparison = a.employment.startDate.localeCompare(b.employment.startDate);
            break;
        }
        return sortDir === 'desc' ? -comparison : comparison;
      });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const safePage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (safePage - 1) * pageSize;
    const paginatedEmployees = filtered
      .slice(startIndex, startIndex + pageSize)
      .map((e) => this.resolveEmployee(e));

    const allDepartments = new Set(this.employees.map((e) => e.employment.department));

    return {
      data: paginatedEmployees,
      total,
      page: safePage,
      pageSize,
      totalPages,
      counts: this.getCounts(),
      totalDepartments: allDepartments.size,
    };
  }

  public getEmployeeById(id: string): Employee | null {
    const target = this.employees.find((e) => e.id.toLowerCase() === id.toLowerCase());
    return target ? this.resolveEmployee(target) : null;
  }

  public searchManagers(
    query = '',
    excludeId?: string
  ): Array<{
    id: string;
    name: string;
    initials: string;
    role: string;
    department: string;
  }> {
    const q = query.trim().toLowerCase();
    return this.employees
      .filter((e) => {
        if (excludeId && e.id.toLowerCase() === excludeId.toLowerCase()) return false;
        if (e.employment.status === 'offboarded') return false;
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

  public getManagers(query = '', excludeId?: string) {
    return this.searchManagers(query, excludeId);
  }

  public createEmployee(input: EmployeeCreateInput): Employee {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existing = this.employees.find(
      (e) => e.person.email.toLowerCase() === normalizedEmail
    );
    if (existing) {
      throw new Error(`Email "${input.email}" is already registered to another employee.`);
    }

    // Safe ID generation ensuring zero collisions
    let maxId = 0;
    for (const e of this.employees) {
      const match = e.id.match(/^EMP-(\d+)$/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxId) maxId = num;
      }
    }
    let candidateNum = maxId + 1;
    let newId = `EMP-${String(candidateNum).padStart(4, '0')}`;
    while (this.employees.some((e) => e.id.toLowerCase() === newId.toLowerCase())) {
      candidateNum++;
      newId = `EMP-${String(candidateNum).padStart(4, '0')}`;
    }

    // Resolve manager with validation
    let managerId: string | undefined = undefined;
    if (input.managerId && input.managerId.trim()) {
      const normalizedMgrId = input.managerId.trim();
      const mgr = this.employees.find((e) => e.id.toLowerCase() === normalizedMgrId.toLowerCase());
      if (!mgr) {
        throw new Error(`Manager with ID '${normalizedMgrId}' not found.`);
      }
      managerId = mgr.id;
    }

    const now = getNow().toISOString();
    const onboarding = syncOnboardingPlanOnStatusChange('active', input.status);

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
        managerId,
      },
      onboarding,
      timestamps: {
        createdAt: now,
        updatedAt: now,
      },
    };

    // Atomic storage write before memory update
    const nextEmployees = [newEmployee, ...this.employees];
    savePersistedEmployees(nextEmployees);
    this.employees = nextEmployees;

    return this.resolveEmployee(newEmployee);
  }

  public updateEmployee(id: string, input: EmployeeUpdateInput): Employee {
    const target = this.employees.find((e) => e.id.toLowerCase() === id.toLowerCase());
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

    // Resolve manager with validation
    let managerId = target.employment.managerId || target.employment.manager?.id;
    if (input.managerId !== undefined) {
      if (!input.managerId || !input.managerId.trim()) {
        managerId = undefined;
      } else {
        const normalizedMgrId = input.managerId.trim();
        if (normalizedMgrId.toLowerCase() === id.toLowerCase()) {
          throw new Error('An employee cannot be their own manager.');
        }
        const mgr = this.employees.find((e) => e.id.toLowerCase() === normalizedMgrId.toLowerCase());
        if (!mgr) {
          throw new Error(`Manager with ID '${normalizedMgrId}' not found.`);
        }
        managerId = mgr.id;
      }
    }

    const now = getNow().toISOString();
    const nextStatus = input.status !== undefined ? input.status : target.employment.status;
    const onboarding = syncOnboardingPlanOnStatusChange(
      target.employment.status,
      nextStatus,
      target.onboarding
    );

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
        status: nextStatus,
        startDate: input.startDate !== undefined ? input.startDate : target.employment.startDate,
        managerId,
        manager: undefined,
      },
      onboarding,
      timestamps: {
        ...target.timestamps,
        updatedAt: now,
      },
    };

    const nextEmployees = this.employees.map((e) => (e.id.toLowerCase() === id.toLowerCase() ? updatedEmployee : e));
    savePersistedEmployees(nextEmployees);
    this.employees = nextEmployees;

    return this.resolveEmployee(updatedEmployee);
  }

  public getOnboardingCounts(): OnboardingCounts {
    const resolved = this.employees.map((e) => this.resolveEmployee(e));
    return calculateOnboardingCounts(resolved);
  }

  public getOnboardingList(tab: OnboardingTab = 'all'): GetOnboardingListResponse {
    const resolved = this.employees.map((e) => this.resolveEmployee(e));
    const filtered = filterOnboardingEmployees(resolved, tab);
    const counts = calculateOnboardingCounts(resolved);

    // Sort: starting soonest first, then name
    const sorted = [...filtered].sort((a, b) => {
      const dateComp = a.employment.startDate.localeCompare(b.employment.startDate);
      if (dateComp !== 0) return dateComp;
      return a.person.lastName.localeCompare(b.person.lastName);
    });

    const data: OnboardingEmployeeSummary[] = sorted.map((emp) => {
      const tasks = emp.onboarding?.tasks || [];
      const progress = calculateOnboardingProgress(tasks);
      const remainingTasks = tasks.filter((t) => !t.completed).map((t) => t.title);

      return {
        employee: emp,
        progress,
        urgency: formatStartUrgency(emp.employment.startDate),
        needsAttention: needsAttention(emp),
        startingSoon: isStartingSoon(emp.employment.startDate),
        remainingTasks,
      };
    });

    return {
      data,
      counts,
      total: data.length,
    };
  }

  /**
   * Strictly read-only GET operation for onboarding detail.
   * Returns null if employee does not exist or has no active onboarding plan.
   * Never mutates or persists state on read.
   */
  public getOnboardingPlan(employeeId: string): GetOnboardingPlanResponse | null {
    const target = this.employees.find((e) => e.id.toLowerCase() === employeeId.toLowerCase());
    if (!target || !target.onboarding) {
      return null;
    }

    const emp = this.resolveEmployee(target);
    const reconciledTasks = reconcileOnboardingTasks(emp.onboarding?.tasks);
    const progress = calculateOnboardingProgress(reconciledTasks);

    return {
      employee: emp,
      onboarding: {
        ...emp.onboarding!,
        tasks: reconciledTasks,
        totalTasks: progress.total,
        completedTasks: progress.completed,
      },
      progress,
    };
  }

  public updateOnboardingTask(
    employeeId: string,
    taskKey: string,
    completed: boolean
  ): UpdateOnboardingTaskResponse {
    const emp = this.employees.find((e) => e.id.toLowerCase() === employeeId.toLowerCase());
    if (!emp) {
      throw new Error(`Employee '${employeeId}' not found.`);
    }

    if (!emp.onboarding || emp.employment.status !== 'onboarding') {
      throw new Error(`No active onboarding plan found for employee '${employeeId}'.`);
    }

    const tasks = reconcileOnboardingTasks(emp.onboarding.tasks);
    const taskIndex = tasks.findIndex(
      (t) => t.id.toLowerCase() === taskKey.toLowerCase()
    );

    if (taskIndex === -1) {
      throw new Error(`Task '${taskKey}' not found for employee '${employeeId}'.`);
    }

    const now = getNow().toISOString();
    tasks[taskIndex] = {
      ...tasks[taskIndex]!,
      completed,
      completedAt: completed ? now : undefined,
    };

    const progress = calculateOnboardingProgress(tasks);
    let attentionSummary = emp.onboarding.attentionSummary;

    if (progress.isComplete) {
      attentionSummary = 'All onboarding tasks complete. Day-one readiness achieved.';
    } else {
      const remaining = tasks.filter((t) => !t.completed).map((t) => t.title).join(', ');
      attentionSummary = `Onboarding is ${progress.completed} of ${progress.total} complete. Remaining: ${remaining}.`;
    }

    const updatedOnboarding: OnboardingDetails = {
      ...emp.onboarding,
      tasks,
      totalTasks: progress.total,
      completedTasks: progress.completed,
      attentionSummary,
    };

    const updatedEmployee: Employee = {
      ...emp,
      onboarding: updatedOnboarding,
      timestamps: {
        ...emp.timestamps,
        updatedAt: now,
      },
    };

    const nextEmployees = this.employees.map((e) => (e.id.toLowerCase() === emp.id.toLowerCase() ? updatedEmployee : e));
    savePersistedEmployees(nextEmployees);
    this.employees = nextEmployees;

    const resolved = this.resolveEmployee(updatedEmployee);
    return {
      employee: resolved,
      onboarding: updatedOnboarding,
      progress,
    };
  }

  public getOverviewData(referenceDate: Date = getNow()): GetOverviewResponse {
    const resolved = this.employees.map((e) => this.resolveEmployee(e));
    return deriveOverviewData(resolved, referenceDate);
  }
}

export const mockStore = new EmployeeMockStore();

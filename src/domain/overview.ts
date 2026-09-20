import { Employee, Department, EmployeeStatus } from './employee';
import { getNow, DEFAULT_REFERENCE_DATE } from './clock';
import {
  needsAttention,
  isStartingSoon,
  formatStartUrgency,
  calculateOnboardingProgress,
} from './onboarding';

export { DEFAULT_REFERENCE_DATE as REFERENCE_DATE };

export interface OverviewAttentionItem {
  id: string;
  name: string;
  jobTitle: string;
  department: Department;
  startDate: string;
  urgency: string;
  remainingCount: number;
  remainingTasks: string[];
}

export interface OverviewUpcomingItem {
  id: string;
  name: string;
  jobTitle: string;
  department: Department;
  startDate: string;
  urgency: string;
  onboardingProgress?: {
    completed: number;
    total: number;
    percent: number;
  };
}

export interface OverviewRecentItem {
  id: string;
  name: string;
  jobTitle: string;
  department: Department;
  updatedAt: string;
  relativeUpdated: string;
}

export interface OverviewSnapshot {
  totalEmployees: number;
  onboardingCount: number;
  departmentCount: number;
  contractorCount: number;
}

export interface OverviewData {
  attention: OverviewAttentionItem[];
  upcomingStarts: OverviewUpcomingItem[];
  recentlyUpdated: OverviewRecentItem[];
  snapshot: OverviewSnapshot;
}

/**
 * Centrally defined eligible statuses for upcoming starts.
 * Excludes employees in 'offboarded' or 'leave' status from starting soon queues.
 */
export const UPCOMING_STARTS_ELIGIBLE_STATUSES: readonly EmployeeStatus[] = [
  'active',
  'onboarding',
] as const;

export function isEligibleForUpcomingStarts(employee: Employee): boolean {
  return UPCOMING_STARTS_ELIGIBLE_STATUSES.includes(employee.employment.status);
}

/**
 * Formats a relative updated string based on real persisted updatedAt timestamps.
 */
export function formatRelativeUpdated(
  updatedAtIso: string,
  referenceDate: Date = getNow()
): string {
  if (!updatedAtIso) return 'Recently';

  try {
    const ref = new Date(referenceDate);
    ref.setHours(0, 0, 0, 0);

    const target = new Date(updatedAtIso);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((ref.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Updated today';
    if (diffDays === 1) return 'Updated yesterday';
    if (diffDays > 1 && diffDays <= 7) return `Updated ${diffDays} days ago`;

    return `Updated ${new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(updatedAtIso))}`;
  } catch {
    return 'Recently';
  }
}

/**
 * Returns employees in need of immediate operational attention:
 * e.g. starting within upcoming 14 days with incomplete onboarding tasks.
 */
export function getAttentionEmployees(
  employees: Employee[],
  referenceDate: Date = getNow()
): OverviewAttentionItem[] {
  const attentionEmployees = employees.filter((emp) => needsAttention(emp, referenceDate));

  // Sort by start date ascending (earliest start date first)
  attentionEmployees.sort((a, b) => {
    const diff = a.employment.startDate.localeCompare(b.employment.startDate);
    if (diff !== 0) return diff;
    return a.person.lastName.localeCompare(b.person.lastName);
  });

  return attentionEmployees.map((emp) => {
    const tasks = emp.onboarding?.tasks || [];
    const progress = calculateOnboardingProgress(tasks);
    const remainingTasks = tasks.filter((t) => !t.completed).map((t) => t.title);

    return {
      id: emp.id,
      name: `${emp.person.firstName} ${emp.person.lastName}`,
      jobTitle: emp.employment.jobTitle,
      department: emp.employment.department,
      startDate: emp.employment.startDate,
      urgency: formatStartUrgency(emp.employment.startDate, referenceDate),
      remainingCount: progress.remaining,
      remainingTasks,
    };
  });
}

/**
 * Returns employees scheduled to start within the next 14 days.
 * Excludes ineligible lifecycle statuses (such as offboarded and leave).
 */
export function getUpcomingStarts(
  employees: Employee[],
  referenceDate: Date = getNow()
): OverviewUpcomingItem[] {
  const upcoming = employees.filter(
    (emp) => isEligibleForUpcomingStarts(emp) && isStartingSoon(emp.employment.startDate, referenceDate)
  );

  // Sort by start date ascending (earliest start date first)
  upcoming.sort((a, b) => {
    const diff = a.employment.startDate.localeCompare(b.employment.startDate);
    if (diff !== 0) return diff;
    return a.person.lastName.localeCompare(b.person.lastName);
  });

  return upcoming.map((emp) => {
    let onboardingProgress: OverviewUpcomingItem['onboardingProgress'] = undefined;
    if (emp.onboarding?.tasks) {
      const p = calculateOnboardingProgress(emp.onboarding.tasks);
      onboardingProgress = {
        completed: p.completed,
        total: p.total,
        percent: p.percent,
      };
    }

    return {
      id: emp.id,
      name: `${emp.person.firstName} ${emp.person.lastName}`,
      jobTitle: emp.employment.jobTitle,
      department: emp.employment.department,
      startDate: emp.employment.startDate,
      urgency: formatStartUrgency(emp.employment.startDate, referenceDate),
      onboardingProgress,
    };
  });
}

/**
 * Returns recently modified employee records based on actual persisted updatedAt timestamp.
 */
export function getRecentlyUpdatedEmployees(
  employees: Employee[],
  limit: number = 5,
  referenceDate: Date = getNow()
): OverviewRecentItem[] {
  const copy = [...employees];

  copy.sort((a, b) => {
    const timeA = new Date(a.timestamps.updatedAt).getTime() || 0;
    const timeB = new Date(b.timestamps.updatedAt).getTime() || 0;
    return timeB - timeA;
  });

  return copy.slice(0, limit).map((emp) => ({
    id: emp.id,
    name: `${emp.person.firstName} ${emp.person.lastName}`,
    jobTitle: emp.employment.jobTitle,
    department: emp.employment.department,
    updatedAt: emp.timestamps.updatedAt,
    relativeUpdated: formatRelativeUpdated(emp.timestamps.updatedAt, referenceDate),
  }));
}

/**
 * Derives compact workforce snapshot counts from actual employee dataset.
 */
export function getWorkforceSnapshot(employees: Employee[]): OverviewSnapshot {
  let onboardingCount = 0;
  let contractorCount = 0;
  const departmentSet = new Set<string>();

  for (const emp of employees) {
    if (emp.employment.status === 'onboarding') {
      onboardingCount++;
    }
    if (emp.employment.employmentType === 'contractor') {
      contractorCount++;
    }
    if (emp.employment.department) {
      departmentSet.add(emp.employment.department);
    }
  }

  return {
    totalEmployees: employees.length,
    onboardingCount,
    departmentCount: departmentSet.size,
    contractorCount,
  };
}

/**
 * Derives the complete Overview view model from actual application data.
 */
export function deriveOverviewData(
  employees: Employee[],
  referenceDate: Date = getNow()
): OverviewData {
  return {
    attention: getAttentionEmployees(employees, referenceDate),
    upcomingStarts: getUpcomingStarts(employees, referenceDate),
    recentlyUpdated: getRecentlyUpdatedEmployees(employees, 5, referenceDate),
    snapshot: getWorkforceSnapshot(employees),
  };
}

import { Employee, OnboardingTask } from './employee';

export type OnboardingTaskKey =
  | 'personal-details'
  | 'contract'
  | 'equipment'
  | 'accounts'
  | 'manager-introduction'
  | 'first-day-plan';

export interface CanonicalTaskDefinition {
  key: OnboardingTaskKey;
  title: string;
  actionLabel: string;
  defaultSubtitle: string;
  order: number;
}

export const CANONICAL_ONBOARDING_TASKS: readonly CanonicalTaskDefinition[] = [
  {
    key: 'personal-details',
    title: 'Personal details',
    actionLabel: 'Personal details verified',
    defaultSubtitle: 'Personal details verified · Identity and regulatory documentation',
    order: 1,
  },
  {
    key: 'contract',
    title: 'Contract received',
    actionLabel: 'Contract received',
    defaultSubtitle: 'Signed employment contract and confidentiality agreement',
    order: 2,
  },
  {
    key: 'equipment',
    title: 'Equipment requested',
    actionLabel: 'Equipment requested',
    defaultSubtitle: 'Workstation hardware, peripheral bundle, and security keys',
    order: 3,
  },
  {
    key: 'accounts',
    title: 'Account provisioned',
    actionLabel: 'Account provisioned',
    defaultSubtitle: 'SSO identity, Google Workspace, and operational system access',
    order: 4,
  },
  {
    key: 'manager-introduction',
    title: 'Manager introduction',
    actionLabel: 'Manager introduction',
    defaultSubtitle: '1:1 introductory session and onboarding buddy pairing',
    order: 5,
  },
  {
    key: 'first-day-plan',
    title: 'First-day plan',
    actionLabel: 'First-day plan',
    defaultSubtitle: 'First-week agenda, starter documentation, and milestone goals',
    order: 6,
  },
] as const;

export const REFERENCE_DATE = new Date('2026-09-20');

export interface OnboardingProgress {
  total: number;
  completed: number;
  remaining: number;
  percent: number;
  isComplete: boolean;
}

export type OnboardingTab = 'all' | 'attention' | 'starting-soon' | 'complete';

export interface OnboardingCounts {
  all: number;
  attention: number;
  startingSoon: number;
  complete: number;
}

/**
 * Calculates standardized onboarding progress for an employee or task list.
 */
export function calculateOnboardingProgress(tasks?: OnboardingTask[]): OnboardingProgress {
  const total = 6;
  if (!tasks || tasks.length === 0) {
    return {
      total,
      completed: 0,
      remaining: total,
      percent: 0,
      isComplete: false,
    };
  }

  const completed = tasks.filter((t) => t.completed).length;
  const remaining = Math.max(0, total - completed);
  const percent = Math.round((completed / total) * 100);

  return {
    total,
    completed,
    remaining,
    percent,
    isComplete: completed >= total,
  };
}

/**
 * Returns difference in days between target date and reference date (positive = target is in the future).
 */
export function getDaysDifference(targetDate: string, referenceDate = REFERENCE_DATE): number {
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - ref.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Checks if an employee is starting soon (start date is within upcoming 14 days: 0 <= diffDays <= 14).
 */
export function isStartingSoon(startDate: string, referenceDate = REFERENCE_DATE): boolean {
  const diffDays = getDaysDifference(startDate, referenceDate);
  return diffDays >= 0 && diffDays <= 14;
}

/**
 * Checks if employee start date has already passed or is today (diffDays <= 0).
 */
export function isStarted(startDate: string, referenceDate = REFERENCE_DATE): boolean {
  const diffDays = getDaysDifference(startDate, referenceDate);
  return diffDays <= 0;
}

/**
 * Formats relative start date urgency description.
 */
export function formatStartUrgency(startDate: string, referenceDate = REFERENCE_DATE): string {
  const diffDays = getDaysDifference(startDate, referenceDate);

  if (diffDays === 0) {
    return 'Starts today';
  }
  if (diffDays === 1) {
    return 'Starts tomorrow';
  }
  if (diffDays > 1) {
    return `Starts in ${diffDays} days`;
  }
  if (diffDays === -1) {
    return 'Started yesterday';
  }
  return `Started ${Math.abs(diffDays)} days ago`;
}

/**
 * Determines if an employee needs attention in onboarding:
 * Must have status === 'onboarding' (or active onboarding workflow),
 * has incomplete tasks, and start date is either upcoming soon (<= 14 days) or already started.
 */
export function needsAttention(employee: Employee, referenceDate = REFERENCE_DATE): boolean {
  if (employee.employment.status !== 'onboarding') {
    return false;
  }

  const progress = calculateOnboardingProgress(employee.onboarding?.tasks);
  if (progress.isComplete) {
    return false;
  }

  const diffDays = getDaysDifference(employee.employment.startDate, referenceDate);
  // Starts within next 14 days or already started
  return diffDays <= 14;
}

/**
 * Filters a list of onboarding employees by view tab.
 */
export function filterOnboardingEmployees(
  employees: Employee[],
  tab: OnboardingTab,
  referenceDate = REFERENCE_DATE
): Employee[] {
  // Only consider employees with status 'onboarding' or who have onboarding details
  const onboardingPool = employees.filter(
    (e) => e.employment.status === 'onboarding' || !!e.onboarding
  );

  switch (tab) {
    case 'attention':
      return onboardingPool.filter((e) => needsAttention(e, referenceDate));
    case 'starting-soon':
      return onboardingPool.filter((e) =>
        isStartingSoon(e.employment.startDate, referenceDate)
      );
    case 'complete':
      return onboardingPool.filter(
        (e) => calculateOnboardingProgress(e.onboarding?.tasks).isComplete
      );
    case 'all':
    default:
      return onboardingPool;
  }
}

/**
 * Calculates counts for all onboarding view tabs.
 */
export function calculateOnboardingCounts(
  employees: Employee[],
  referenceDate = REFERENCE_DATE
): OnboardingCounts {
  const onboardingPool = employees.filter(
    (e) => e.employment.status === 'onboarding' || !!e.onboarding
  );

  let attention = 0;
  let startingSoon = 0;
  let complete = 0;

  for (const emp of onboardingPool) {
    if (needsAttention(emp, referenceDate)) {
      attention++;
    }
    if (isStartingSoon(emp.employment.startDate, referenceDate)) {
      startingSoon++;
    }
    if (calculateOnboardingProgress(emp.onboarding?.tasks).isComplete) {
      complete++;
    }
  }

  return {
    all: onboardingPool.length,
    attention,
    startingSoon,
    complete,
  };
}

/**
 * Creates default canonical 6 onboarding tasks for a new onboarding workflow.
 */
export function createDefaultOnboardingTasks(): OnboardingTask[] {
  return CANONICAL_ONBOARDING_TASKS.map((task) => ({
    id: task.key,
    title: task.title,
    subtitle: task.defaultSubtitle,
    completed: false,
  }));
}

/**
 * Standardizes or migrates legacy task IDs (e.g. 'task-1' -> 'personal-details') if necessary.
 */
export function normalizeOnboardingTasks(tasks?: OnboardingTask[]): OnboardingTask[] {
  if (!tasks || tasks.length === 0) {
    return createDefaultOnboardingTasks();
  }

  const legacyMap: Record<string, OnboardingTaskKey> = {
    'task-1': 'personal-details',
    'task-2': 'contract',
    'task-3': 'equipment',
    'task-4': 'first-day-plan',
    'task-5': 'accounts',
    'task-6': 'manager-introduction',
    't1': 'personal-details',
    't2': 'contract',
    't3': 'equipment',
    't4': 'first-day-plan',
    't5': 'accounts',
    't6': 'manager-introduction',
  };

  return tasks.map((task) => {
    let key = task.id as OnboardingTaskKey;
    const directMap = legacyMap[task.id];
    if (directMap) {
      key = directMap;
    } else {
      const prefix = task.id.split('-')[0];
      const prefixMap = prefix ? legacyMap[prefix] : undefined;
      if (prefixMap) {
        key = prefixMap;
      }
    }

    const canonical = CANONICAL_ONBOARDING_TASKS.find((c) => c.key === key);
    return {
      id: key,
      title: canonical?.title || task.title,
      subtitle: task.subtitle || canonical?.defaultSubtitle || '',
      completed: task.completed,
      completedAt: task.completedAt,
    };
  });
}

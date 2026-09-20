import { Employee, OnboardingTask, OnboardingDetails, EmployeeStatus } from './employee';
import { getNow, DEFAULT_REFERENCE_DATE } from './clock';

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

/**
 * Historical reference date alias retained for tests and deterministic benchmarks.
 */
export const REFERENCE_DATE = DEFAULT_REFERENCE_DATE;

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
 * Reconciles tasks against the authoritative canonical onboarding task definitions.
 * Handles:
 * - missing canonical tasks (added with completed: false)
 * - duplicate tasks (deduplicated, prioritizing completed state)
 * - obsolete tasks (dropped)
 * - canonical ordering (strictly sorted by canonical definition order)
 * - preserves completed history and completedAt timestamps for matching keys
 */
export function reconcileOnboardingTasks(tasks?: OnboardingTask[]): OnboardingTask[] {
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

  const existingMap = new Map<OnboardingTaskKey, OnboardingTask>();

  if (tasks && tasks.length > 0) {
    for (const task of tasks) {
      if (!task || !task.id) continue;
      const normalizedKey = (legacyMap[task.id] || task.id) as OnboardingTaskKey;
      const canonicalMatch = CANONICAL_ONBOARDING_TASKS.find((c) => c.key === normalizedKey);
      if (!canonicalMatch) {
        // Discard obsolete task
        continue;
      }

      const existing = existingMap.get(canonicalMatch.key);
      if (!existing) {
        existingMap.set(canonicalMatch.key, {
          ...task,
          id: canonicalMatch.key,
        });
      } else if (!existing.completed && task.completed) {
        // Prefer completed state if duplicate exists
        existingMap.set(canonicalMatch.key, {
          ...task,
          id: canonicalMatch.key,
        });
      }
    }
  }

  // Build sorted list strictly conforming to canonical definition
  return CANONICAL_ONBOARDING_TASKS.map((canonical) => {
    const existing = existingMap.get(canonical.key);
    if (existing) {
      return {
        id: canonical.key,
        title: canonical.title,
        subtitle: existing.subtitle || canonical.defaultSubtitle,
        completed: Boolean(existing.completed),
        completedAt: existing.completed ? existing.completedAt : undefined,
      };
    }
    return {
      id: canonical.key,
      title: canonical.title,
      subtitle: canonical.defaultSubtitle,
      completed: false,
    };
  });
}

/**
 * Calculates standardized onboarding progress for an employee or task list.
 * Authoritative total is derived dynamically from canonical task definitions.
 */
export function calculateOnboardingProgress(tasks?: OnboardingTask[]): OnboardingProgress {
  const total = CANONICAL_ONBOARDING_TASKS.length;
  if (!tasks || tasks.length === 0) {
    return {
      total,
      completed: 0,
      remaining: total,
      percent: 0,
      isComplete: false,
    };
  }

  const reconciled = reconcileOnboardingTasks(tasks);
  const completed = reconciled.filter((t) => t.completed).length;
  const remaining = Math.max(0, total - completed);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    remaining,
    percent,
    isComplete: completed >= total,
  };
}

/**
 * Centralized onboarding lifecycle policy:
 * - Entering 'onboarding': creates canonical default plan or restores/reconciles existing plan.
 * - Leaving 'onboarding': retains plan for historical continuity without exposing as active.
 * - Returning to 'onboarding': restores existing plan without destroying completed task history.
 */
export function syncOnboardingPlanOnStatusChange(
  _previousStatus: EmployeeStatus,
  nextStatus: EmployeeStatus,
  existingPlan?: OnboardingDetails
): OnboardingDetails | undefined {
  if (nextStatus === 'onboarding') {
    if (existingPlan && existingPlan.tasks && existingPlan.tasks.length > 0) {
      const reconciledTasks = reconcileOnboardingTasks(existingPlan.tasks);
      const progress = calculateOnboardingProgress(reconciledTasks);
      return {
        ...existingPlan,
        tasks: reconciledTasks,
        totalTasks: progress.total,
        completedTasks: progress.completed,
      };
    }
    const defaultTasks = createDefaultOnboardingTasks();
    return {
      totalTasks: defaultTasks.length,
      completedTasks: 0,
      tasks: defaultTasks,
      responsiblePartner: {
        name: 'Eleanor Vance',
        note: 'Assigned People Operations Partner for onboarding setup',
      },
      attentionSummary: 'New onboarding workflow initialized. Pending initial account setup.',
    };
  }

  // Leaving onboarding or another status: retain the existing plan for history
  return existingPlan;
}

/**
 * Returns difference in days between target date and reference date (positive = target is in the future).
 */
export function getDaysDifference(targetDate: string, referenceDate: Date = getNow()): number {
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
export function isStartingSoon(startDate: string, referenceDate: Date = getNow()): boolean {
  const diffDays = getDaysDifference(startDate, referenceDate);
  return diffDays >= 0 && diffDays <= 14;
}

/**
 * Checks if employee start date has already passed or is today (diffDays <= 0).
 */
export function isStarted(startDate: string, referenceDate: Date = getNow()): boolean {
  const diffDays = getDaysDifference(startDate, referenceDate);
  return diffDays <= 0;
}

/**
 * Formats relative start date urgency description.
 */
export function formatStartUrgency(startDate: string, referenceDate: Date = getNow()): string {
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
 * Must have status === 'onboarding', incomplete tasks, and start date within 14 days (or already started).
 */
export function needsAttention(employee: Employee, referenceDate: Date = getNow()): boolean {
  if (employee.employment.status !== 'onboarding') {
    return false;
  }

  const progress = calculateOnboardingProgress(employee.onboarding?.tasks);
  if (progress.isComplete) {
    return false;
  }

  const diffDays = getDaysDifference(employee.employment.startDate, referenceDate);
  return diffDays <= 14;
}

/**
 * Filters a list of onboarding employees by view tab.
 * Strictly checks `employment.status === 'onboarding'` so retained plans for active/leave/offboarded
 * employees do NOT pollute the active onboarding workspace.
 */
export function filterOnboardingEmployees(
  employees: Employee[],
  tab: OnboardingTab,
  referenceDate: Date = getNow()
): Employee[] {
  const onboardingPool = employees.filter((e) => e.employment.status === 'onboarding');

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
  referenceDate: Date = getNow()
): OnboardingCounts {
  const onboardingPool = employees.filter((e) => e.employment.status === 'onboarding');

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
 * Creates default canonical onboarding tasks for a new onboarding workflow.
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
 * Standardizes or migrates legacy task IDs if necessary, delegating to canonical reconciliation.
 */
export function normalizeOnboardingTasks(tasks?: OnboardingTask[]): OnboardingTask[] {
  return reconcileOnboardingTasks(tasks);
}

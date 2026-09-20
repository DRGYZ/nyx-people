import { describe, it, expect } from 'vitest';
import {
  calculateOnboardingProgress,
  isStartingSoon,
  isStarted,
  formatStartUrgency,
  needsAttention,
  filterOnboardingEmployees,
  calculateOnboardingCounts,
  createDefaultOnboardingTasks,
  normalizeOnboardingTasks,
  CANONICAL_ONBOARDING_TASKS,
} from '@/domain/onboarding';
import { Employee } from '@/domain/employee';

describe('Onboarding Domain Logic', () => {
  const refDate = new Date('2026-09-20');

  describe('CANONICAL_ONBOARDING_TASKS', () => {
    it('defines exactly 6 canonical tasks in the specified order', () => {
      expect(CANONICAL_ONBOARDING_TASKS).toHaveLength(6);
      const keys = CANONICAL_ONBOARDING_TASKS.map((t) => t.key);
      expect(keys).toEqual([
        'personal-details',
        'contract',
        'equipment',
        'accounts',
        'manager-introduction',
        'first-day-plan',
      ]);
    });
  });

  describe('calculateOnboardingProgress', () => {
    it('returns 0 progress for empty or undefined task list', () => {
      const p1 = calculateOnboardingProgress(undefined);
      expect(p1).toEqual({
        total: 6,
        completed: 0,
        remaining: 6,
        percent: 0,
        isComplete: false,
      });

      const p2 = calculateOnboardingProgress([]);
      expect(p2.completed).toBe(0);
      expect(p2.percent).toBe(0);
    });

    it('accurately calculates partial completion', () => {
      const tasks = [
        { id: 'personal-details', title: 'Personal details', subtitle: '', completed: true },
        { id: 'contract', title: 'Contract received', subtitle: '', completed: true },
        { id: 'equipment', title: 'Equipment requested', subtitle: '', completed: true },
        { id: 'first-day-plan', title: 'First-day plan', subtitle: '', completed: true },
        { id: 'accounts', title: 'Account provisioned', subtitle: '', completed: false },
        { id: 'manager-introduction', title: 'Manager introduction', subtitle: '', completed: false },
      ];

      const p = calculateOnboardingProgress(tasks);
      expect(p.total).toBe(6);
      expect(p.completed).toBe(4);
      expect(p.remaining).toBe(2);
      expect(p.percent).toBe(67);
      expect(p.isComplete).toBe(false);
    });

    it('recognizes 100% completion', () => {
      const tasks = createDefaultOnboardingTasks().map((t) => ({
        ...t,
        completed: true,
      }));

      const p = calculateOnboardingProgress(tasks);
      expect(p.completed).toBe(6);
      expect(p.remaining).toBe(0);
      expect(p.percent).toBe(100);
      expect(p.isComplete).toBe(true);
    });
  });

  describe('isStartingSoon and isStarted', () => {
    it('identifies dates within 0 to 14 days as starting soon', () => {
      expect(isStartingSoon('2026-09-20', refDate)).toBe(true); // today
      expect(isStartingSoon('2026-09-24', refDate)).toBe(true); // in 4 days
      expect(isStartingSoon('2026-10-04', refDate)).toBe(true); // in 14 days
      expect(isStartingSoon('2026-10-05', refDate)).toBe(false); // in 15 days
      expect(isStartingSoon('2026-09-19', refDate)).toBe(false); // yesterday
    });

    it('identifies past or current dates as started', () => {
      expect(isStarted('2026-09-20', refDate)).toBe(true);
      expect(isStarted('2026-09-18', refDate)).toBe(true);
      expect(isStarted('2026-09-25', refDate)).toBe(false);
    });

    it('formats urgency strings correctly', () => {
      expect(formatStartUrgency('2026-09-20', refDate)).toBe('Starts today');
      expect(formatStartUrgency('2026-09-21', refDate)).toBe('Starts tomorrow');
      expect(formatStartUrgency('2026-09-24', refDate)).toBe('Starts in 4 days');
      expect(formatStartUrgency('2026-09-19', refDate)).toBe('Started yesterday');
      expect(formatStartUrgency('2026-09-17', refDate)).toBe('Started 3 days ago');
    });
  });

  describe('needsAttention', () => {
    const mockEmployee = (
      status: 'active' | 'onboarding',
      startDate: string,
      completedCount: number
    ): Employee => {
      const defaultTasks = createDefaultOnboardingTasks();
      const tasks = defaultTasks.map((t, idx) => ({
        ...t,
        completed: idx < completedCount,
      }));

      return {
        id: 'EMP-0001',
        person: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+33 1 23 45 67 89',
          dateOfBirth: '1990-01-01',
          address: { street: '1 Main St', postalCode: '75001', city: 'Paris', country: 'France' },
        },
        employment: {
          jobTitle: 'Developer',
          department: 'Engineering',
          location: 'Paris',
          employmentType: 'full-time',
          status,
          startDate,
        },
        onboarding: {
          totalTasks: 6,
          completedTasks: completedCount,
          tasks,
        },
        timestamps: { createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
      };
    };

    it('returns false for non-onboarding employees', () => {
      const emp = mockEmployee('active', '2026-09-24', 3);
      expect(needsAttention(emp, refDate)).toBe(false);
    });

    it('returns false if all tasks are complete', () => {
      const emp = mockEmployee('onboarding', '2026-09-24', 6);
      expect(needsAttention(emp, refDate)).toBe(false);
    });

    it('returns true if onboarding, incomplete tasks, and starting soon (<= 14 days)', () => {
      const emp = mockEmployee('onboarding', '2026-09-24', 4);
      expect(needsAttention(emp, refDate)).toBe(true);
    });

    it('returns true if onboarding, incomplete tasks, and already started', () => {
      const emp = mockEmployee('onboarding', '2026-09-18', 2);
      expect(needsAttention(emp, refDate)).toBe(true);
    });

    it('returns false if start date is far in the future (> 14 days)', () => {
      const emp = mockEmployee('onboarding', '2026-10-15', 1);
      expect(needsAttention(emp, refDate)).toBe(false);
    });
  });

  describe('normalizeOnboardingTasks', () => {
    it('converts legacy task ids (task-1..6) to canonical keys', () => {
      const legacy = [
        { id: 'task-1', title: 'Personal details', subtitle: 'Done', completed: true },
        { id: 'task-2', title: 'Contract received', subtitle: 'Done', completed: true },
        { id: 'task-3', title: 'Equipment requested', subtitle: 'Done', completed: true },
        { id: 'task-4', title: 'First-day plan', subtitle: 'Done', completed: true },
        { id: 'task-5', title: 'Account provisioned', subtitle: 'Pending', completed: false },
        { id: 'task-6', title: 'Manager introduction', subtitle: 'Pending', completed: false },
      ];

      const normalized = normalizeOnboardingTasks(legacy);
      expect(normalized[0]?.id).toBe('personal-details');
      expect(normalized[1]?.id).toBe('contract');
      expect(normalized[2]?.id).toBe('equipment');
      expect(normalized[3]?.id).toBe('first-day-plan');
      expect(normalized[4]?.id).toBe('accounts');
      expect(normalized[5]?.id).toBe('manager-introduction');
    });
  });

  describe('filterOnboardingEmployees and calculateOnboardingCounts', () => {
    const defaultTasks = createDefaultOnboardingTasks();
    const mockList: Employee[] = [
      {
        id: 'EMP-1',
        person: { firstName: 'A', lastName: 'A', email: 'a@co.com', phone: '', dateOfBirth: '1990-01-01', address: { street: '', postalCode: '', city: '', country: '' } },
        employment: { jobTitle: '', department: 'Engineering', location: 'Paris', employmentType: 'full-time', status: 'onboarding', startDate: '2026-09-22' },
        onboarding: { totalTasks: 6, completedTasks: 2, tasks: defaultTasks.map((t, i) => ({ ...t, completed: i < 2 })) },
        timestamps: { createdAt: '', updatedAt: '' },
      },
      {
        id: 'EMP-2',
        person: { firstName: 'B', lastName: 'B', email: 'b@co.com', phone: '', dateOfBirth: '1990-01-01', address: { street: '', postalCode: '', city: '', country: '' } },
        employment: { jobTitle: '', department: 'Product', location: 'London', employmentType: 'full-time', status: 'onboarding', startDate: '2026-09-24' },
        onboarding: { totalTasks: 6, completedTasks: 6, tasks: defaultTasks.map((t) => ({ ...t, completed: true })) },
        timestamps: { createdAt: '', updatedAt: '' },
      },
    ];

    it('filters by tab correctly', () => {
      expect(filterOnboardingEmployees(mockList, 'all', refDate)).toHaveLength(2);
      expect(filterOnboardingEmployees(mockList, 'attention', refDate)).toHaveLength(1);
      expect(filterOnboardingEmployees(mockList, 'starting-soon', refDate)).toHaveLength(2);
      expect(filterOnboardingEmployees(mockList, 'complete', refDate)).toHaveLength(1);
    });

    it('calculates counts correctly', () => {
      const counts = calculateOnboardingCounts(mockList, refDate);
      expect(counts.all).toBe(2);
      expect(counts.attention).toBe(1);
      expect(counts.startingSoon).toBe(2);
      expect(counts.complete).toBe(1);
    });
  });
});


import { describe, it, expect } from 'vitest';
import {
  getAttentionEmployees,
  getUpcomingStarts,
  getRecentlyUpdatedEmployees,
  getWorkforceSnapshot,
  formatRelativeUpdated,
  deriveOverviewData,
} from '@/domain/overview';
import { Employee } from '@/domain/employee';

describe('Overview Domain Selectors', () => {
  const refDate = new Date('2026-09-20');

  const createMockEmployee = (overrides: Partial<Employee> = {}): Employee => ({
    id: 'EMP-0001',
    person: {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@nyxpeople.com',
      phone: '+33 1 00 00 00 00',
      dateOfBirth: '1990-01-01',
      address: { street: '1 Rue de Paris', postalCode: '75001', city: 'Paris', country: 'France' },
    },
    employment: {
      jobTitle: 'Software Engineer',
      department: 'Engineering',
      location: 'Paris',
      employmentType: 'full-time',
      status: 'active',
      startDate: '2026-09-22',
    },
    timestamps: {
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-20T08:00:00Z',
    },
    ...overrides,
  });

  describe('formatRelativeUpdated', () => {
    it('returns "Updated today" for timestamps on the reference date', () => {
      expect(formatRelativeUpdated('2026-09-20T10:00:00Z', refDate)).toBe('Updated today');
    });

    it('returns "Updated yesterday" for timestamps 1 day prior', () => {
      expect(formatRelativeUpdated('2026-09-19T14:30:00Z', refDate)).toBe('Updated yesterday');
    });

    it('returns "Updated X days ago" for 2-7 days prior', () => {
      expect(formatRelativeUpdated('2026-09-17T12:00:00Z', refDate)).toBe('Updated 3 days ago');
    });

    it('formats date string for older timestamps', () => {
      expect(formatRelativeUpdated('2026-08-15T00:00:00Z', refDate)).toBe('Updated Aug 15');
    });
  });

  describe('getAttentionEmployees', () => {
    it('returns onboarding employees who have incomplete tasks and start soon (<= 14 days)', () => {
      const emp1 = createMockEmployee({
        id: 'EMP-0001',
        employment: {
          jobTitle: 'Frontend Engineer',
          department: 'Engineering',
          location: 'Paris',
          employmentType: 'full-time',
          status: 'onboarding',
          startDate: '2026-09-24',
        },
        onboarding: {
          totalTasks: 6,
          completedTasks: 4,
          tasks: [
            { id: 'personal-details', title: 'Personal details', subtitle: '', completed: true },
            { id: 'contract', title: 'Contract received', subtitle: '', completed: true },
            { id: 'equipment', title: 'Equipment requested', subtitle: '', completed: true },
            { id: 'first-day-plan', title: 'First-day plan', subtitle: '', completed: true },
            { id: 'accounts', title: 'Account provisioned', subtitle: '', completed: false },
            { id: 'manager-introduction', title: 'Manager introduction', subtitle: '', completed: false },
          ],
        },
      });

      const emp2 = createMockEmployee({
        id: 'EMP-0002',
        employment: {
          jobTitle: 'Backend Engineer',
          department: 'Engineering',
          location: 'Paris',
          employmentType: 'full-time',
          status: 'active', // not onboarding
          startDate: '2026-09-22',
        },
      });

      const attention = getAttentionEmployees([emp1, emp2], refDate);
      expect(attention).toHaveLength(1);
      expect(attention[0]?.id).toBe('EMP-0001');
      expect(attention[0]?.remainingCount).toBe(2);
      expect(attention[0]?.remainingTasks).toEqual(['Account provisioned', 'Manager introduction']);
      expect(attention[0]?.urgency).toBe('Starts in 4 days');
    });

    it('excludes onboarding employees whose tasks are all completed', () => {
      const emp = createMockEmployee({
        id: 'EMP-0001',
        employment: {
          jobTitle: 'Engineer',
          department: 'Engineering',
          location: 'Paris',
          employmentType: 'full-time',
          status: 'onboarding',
          startDate: '2026-09-24',
        },
        onboarding: {
          totalTasks: 6,
          completedTasks: 6,
          tasks: [
            { id: 'task-1', title: 'Task 1', subtitle: '', completed: true },
            { id: 'task-2', title: 'Task 2', subtitle: '', completed: true },
            { id: 'task-3', title: 'Task 3', subtitle: '', completed: true },
            { id: 'task-4', title: 'Task 4', subtitle: '', completed: true },
            { id: 'task-5', title: 'Task 5', subtitle: '', completed: true },
            { id: 'task-6', title: 'Task 6', subtitle: '', completed: true },
          ],
        },
      });

      const attention = getAttentionEmployees([emp], refDate);
      expect(attention).toHaveLength(0);
    });
  });

  describe('getUpcomingStarts', () => {
    it('returns employees starting within 14 days sorted ascending by start date', () => {
      const empSoon = createMockEmployee({
        id: 'EMP-0001',
        person: { ...createMockEmployee().person, firstName: 'Bob', lastName: 'Brown' },
        employment: {
          ...createMockEmployee().employment,
          startDate: '2026-09-24',
        },
      });

      const empLater = createMockEmployee({
        id: 'EMP-0002',
        person: { ...createMockEmployee().person, firstName: 'Clara', lastName: 'Adams' },
        employment: {
          ...createMockEmployee().employment,
          startDate: '2026-09-21',
        },
      });

      const empTooFar = createMockEmployee({
        id: 'EMP-0003',
        employment: {
          ...createMockEmployee().employment,
          startDate: '2026-10-15', // > 14 days
        },
      });

      const upcoming = getUpcomingStarts([empSoon, empLater, empTooFar], refDate);
      expect(upcoming).toHaveLength(2);
      expect(upcoming[0]?.id).toBe('EMP-0002'); // Sep 21 earlier than Sep 24
      expect(upcoming[1]?.id).toBe('EMP-0001');
    });
  });

  describe('getRecentlyUpdatedEmployees', () => {
    it('sorts by updatedAt descending and slices to limit', () => {
      const emp1 = createMockEmployee({
        id: 'EMP-0001',
        timestamps: { createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-09-18T10:00:00Z' },
      });
      const emp2 = createMockEmployee({
        id: 'EMP-0002',
        timestamps: { createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-09-20T12:00:00Z' },
      });
      const emp3 = createMockEmployee({
        id: 'EMP-0003',
        timestamps: { createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-09-19T09:00:00Z' },
      });

      const recent = getRecentlyUpdatedEmployees([emp1, emp2, emp3], 2, refDate);
      expect(recent).toHaveLength(2);
      expect(recent[0]?.id).toBe('EMP-0002');
      expect(recent[0]?.relativeUpdated).toBe('Updated today');
      expect(recent[1]?.id).toBe('EMP-0003');
      expect(recent[1]?.relativeUpdated).toBe('Updated yesterday');
    });
  });

  describe('getWorkforceSnapshot', () => {
    it('calculates total, onboarding, departments, and contractors accurately', () => {
      const employees = [
        createMockEmployee({
          employment: { ...createMockEmployee().employment, status: 'onboarding', department: 'Engineering' },
        }),
        createMockEmployee({
          employment: { ...createMockEmployee().employment, status: 'active', department: 'Product', employmentType: 'contractor' },
        }),
        createMockEmployee({
          employment: { ...createMockEmployee().employment, status: 'active', department: 'Engineering', employmentType: 'full-time' },
        }),
      ];

      const snapshot = getWorkforceSnapshot(employees);
      expect(snapshot).toEqual({
        totalEmployees: 3,
        onboardingCount: 1,
        departmentCount: 2,
        contractorCount: 1,
      });
    });
  });

  describe('deriveOverviewData', () => {
    it('returns complete OverviewData structure derived from employees', () => {
      const data = deriveOverviewData([createMockEmployee()], refDate);
      expect(data).toHaveProperty('attention');
      expect(data).toHaveProperty('upcomingStarts');
      expect(data).toHaveProperty('recentlyUpdated');
      expect(data).toHaveProperty('snapshot');
    });
  });
});

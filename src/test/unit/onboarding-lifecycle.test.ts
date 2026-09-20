import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeeMockStore } from '@/data/mock/store';
import {
  reconcileOnboardingTasks,
  calculateOnboardingProgress,
  filterOnboardingEmployees,
} from '@/domain/onboarding';
import { Employee, OnboardingTask } from '@/domain/employee';

describe('Onboarding Lifecycle and Task Reconciliation Policy', () => {
  let store: EmployeeMockStore;

  beforeEach(() => {
    store = new EmployeeMockStore();
    store.resetToBaseline();
  });

  describe('Read-Only GET Behavior', () => {
    it('getOnboardingPlan returns null without manufacturing a plan for employees without one', () => {
      // EMP-0102 is active and has no onboarding plan
      const empBefore = store.getEmployeeById('EMP-0102');
      expect(empBefore?.onboarding).toBeUndefined();

      const plan = store.getOnboardingPlan('EMP-0102');
      expect(plan).toBeNull();

      // Ensure employee record was not mutated
      const empAfter = store.getEmployeeById('EMP-0102');
      expect(empAfter?.onboarding).toBeUndefined();
    });

    it('getOnboardingPlan returns existing reconciled plan without mutating stored record', () => {
      const plan = store.getOnboardingPlan('EMP-0941');
      expect(plan).not.toBeNull();
      expect(plan?.employee.id).toBe('EMP-0941');
      expect(plan?.onboarding.tasks.length).toBe(6);
    });
  });

  describe('Lifecycle State Transitions', () => {
    it('transitions onboarding -> active: retains plan on record but excludes from active onboarding workspace', () => {
      // Noah starts in onboarding
      expect(store.getEmployeeById('EMP-0941')?.employment.status).toBe('onboarding');
      const activeListBefore = store.getOnboardingList('all').data;
      expect(activeListBefore.some((item) => item.employee.id === 'EMP-0941')).toBe(true);

      // Transition to active
      store.updateEmployee('EMP-0941', { status: 'active' });

      const empUpdated = store.getEmployeeById('EMP-0941')!;
      expect(empUpdated.employment.status).toBe('active');
      // Plan is retained for audit continuity
      expect(empUpdated.onboarding).toBeDefined();
      expect(empUpdated.onboarding?.tasks.length).toBe(6);

      // But excluded from active onboarding list
      const activeListAfter = store.getOnboardingList('all').data;
      expect(activeListAfter.some((item) => item.employee.id === 'EMP-0941')).toBe(false);
    });

    it('transitions active -> onboarding: restores plan and preserves previously completed tasks', () => {
      // First, complete all 4 tasks and transition to active
      store.updateEmployee('EMP-0941', { status: 'active' });

      // Return employee to onboarding
      store.updateEmployee('EMP-0941', { status: 'onboarding' });

      const restoredEmp = store.getEmployeeById('EMP-0941')!;
      expect(restoredEmp.employment.status).toBe('onboarding');
      expect(restoredEmp.onboarding).toBeDefined();

      // Verify the 4 previously completed tasks were preserved
      const completedCount = restoredEmp.onboarding?.tasks.filter((t) => t.completed).length;
      expect(completedCount).toBe(4);

      // Verify restored in active onboarding workspace
      const activeList = store.getOnboardingList('all').data;
      expect(activeList.some((item) => item.employee.id === 'EMP-0941')).toBe(true);
    });

    it('completing all tasks does not automatically transition employee to active', () => {
      // Complete all 6 tasks for Noah
      const tasks = ['accounts', 'manager-introduction'] as const;
      for (const taskId of tasks) {
        store.updateOnboardingTask('EMP-0941', taskId, true);
      }

      const noah = store.getEmployeeById('EMP-0941')!;
      expect(noah.onboarding?.completedTasks).toBe(6);
      expect(calculateOnboardingProgress(noah.onboarding?.tasks).isComplete).toBe(true);

      // Status must remain 'onboarding' until an operator explicitly transitions it
      expect(noah.employment.status).toBe('onboarding');
    });

    it('excludes offboarded and leave employees from active onboarding tabs', () => {
      const mockEmployees: Employee[] = [
        {
          id: 'EMP-0001',
          person: { firstName: 'Alice', lastName: 'Smith', email: 'a@c.com', phone: '', dateOfBirth: '1990-01-01', address: { street: '', postalCode: '', city: '', country: '' } },
          employment: { jobTitle: 'Dev', department: 'Engineering', location: 'Paris', employmentType: 'full-time', status: 'leave', startDate: '2026-09-25' },
          onboarding: { tasks: [] },
          timestamps: { createdAt: '', updatedAt: '' },
        },
        {
          id: 'EMP-0002',
          person: { firstName: 'Bob', lastName: 'Smith', email: 'b@c.com', phone: '', dateOfBirth: '1990-01-01', address: { street: '', postalCode: '', city: '', country: '' } },
          employment: { jobTitle: 'Dev', department: 'Engineering', location: 'Paris', employmentType: 'full-time', status: 'offboarded', startDate: '2026-09-25' },
          onboarding: { tasks: [] },
          timestamps: { createdAt: '', updatedAt: '' },
        },
      ];

      const activeList = filterOnboardingEmployees(mockEmployees, 'all');
      expect(activeList.length).toBe(0);
    });
  });

  describe('Canonical Onboarding Task Reconciliation', () => {
    it('enforces canonical order, fills missing tasks, drops obsolete tasks, and deduplicates', () => {
      const inputTasks: OnboardingTask[] = [
        // Out of order, obsolete task, duplicate task, missing task
        { id: 'obsolete-custom-task', title: 'Old Step', subtitle: 'Old', completed: true },
        { id: 'contract', title: 'Contract received', subtitle: 'Signed', completed: true, completedAt: '2026-09-19T00:00:00Z' },
        { id: 'personal-details', title: 'Personal details', subtitle: 'Done', completed: true, completedAt: '2026-09-18T00:00:00Z' },
        // Duplicate: this one is false, but another might be true
        { id: 'contract', title: 'Contract copy', subtitle: 'Duplicate', completed: false },
      ];

      const reconciled = reconcileOnboardingTasks(inputTasks);

      // Exactly 6 canonical tasks
      expect(reconciled.length).toBe(6);

      // Canonical order: personal-details, contract, equipment, accounts, manager-introduction, first-day-plan
      expect(reconciled[0]?.id).toBe('personal-details');
      expect(reconciled[1]?.id).toBe('contract');
      expect(reconciled[2]?.id).toBe('equipment');
      expect(reconciled[3]?.id).toBe('accounts');
      expect(reconciled[4]?.id).toBe('manager-introduction');
      expect(reconciled[5]?.id).toBe('first-day-plan');

      // Obsolete task was dropped
      expect(reconciled.some((t) => t.id === 'obsolete-custom-task')).toBe(false);

      // Deduplicated task preserved the completed state
      expect(reconciled[1]?.completed).toBe(true);

      // Missing tasks added with completed: false
      expect(reconciled[2]?.completed).toBe(false);
      expect(reconciled[3]?.completed).toBe(false);
      expect(reconciled[4]?.completed).toBe(false);
      expect(reconciled[5]?.completed).toBe(false);
    });

    it('clears completedAt if a task is not completed', () => {
      const invalidTask: OnboardingTask = {
        id: 'equipment',
        title: 'Equipment requested',
        subtitle: 'Sub',
        completed: false,
        completedAt: '2026-09-20T10:00:00Z',
      };

      const reconciled = reconcileOnboardingTasks([invalidTask]);
      const equipmentTask = reconciled.find((t) => t.id === 'equipment')!;
      expect(equipmentTask.completed).toBe(false);
      expect(equipmentTask.completedAt).toBeUndefined();
    });
  });
});

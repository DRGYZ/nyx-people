import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeeMockStore } from '@/data/mock/store';

describe('EmployeeMockStore Onboarding Operations', () => {
  let store: EmployeeMockStore;

  beforeEach(() => {
    store = new EmployeeMockStore();
    store.resetToBaseline();
  });

  it('fetches onboarding list and counts', () => {
    const res = store.getOnboardingList('all');
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.counts.all).toBe(res.data.length);
    expect(res.counts.attention).toBeGreaterThan(0);
    expect(res.counts.startingSoon).toBeGreaterThan(0);

    const noahSummary = res.data.find((item) => item.employee.id === 'EMP-0941');
    expect(noahSummary).toBeDefined();
    expect(noahSummary?.progress.completed).toBe(4);
    expect(noahSummary?.progress.total).toBe(6);
    expect(noahSummary?.needsAttention).toBe(true);
    expect(noahSummary?.remainingTasks).toContain('Account provisioned');
    expect(noahSummary?.remainingTasks).toContain('Manager introduction');
  });

  it('filters onboarding list by tab', () => {
    const attentionList = store.getOnboardingList('attention');
    expect(attentionList.data.length).toBe(store.getOnboardingCounts().attention);
    attentionList.data.forEach((item) => {
      expect(item.needsAttention).toBe(true);
      expect(item.progress.isComplete).toBe(false);
    });

    const startingSoonList = store.getOnboardingList('starting-soon');
    expect(startingSoonList.data.length).toBe(store.getOnboardingCounts().startingSoon);
    startingSoonList.data.forEach((item) => {
      expect(item.startingSoon).toBe(true);
    });
  });

  it('fetches onboarding plan for Noah Williams', () => {
    const plan = store.getOnboardingPlan('EMP-0941');
    expect(plan).toBeDefined();
    expect(plan?.employee.person.firstName).toBe('Noah');
    expect(plan?.onboarding.tasks).toHaveLength(6);
    expect(plan?.progress.completed).toBe(4);
    expect(plan?.progress.remaining).toBe(2);
  });

  it('toggles an onboarding task from incomplete to complete and back', () => {
    // Noah has 'accounts' incomplete
    const update1 = store.updateOnboardingTask('EMP-0941', 'accounts', true);
    expect(update1.progress.completed).toBe(5);
    expect(update1.progress.remaining).toBe(1);
    expect(update1.progress.percent).toBe(83);

    const planAfter1 = store.getOnboardingPlan('EMP-0941');
    expect(planAfter1?.progress.completed).toBe(5);
    const accountTask = planAfter1?.onboarding.tasks.find((t) => t.id === 'accounts');
    expect(accountTask?.completed).toBe(true);
    expect(accountTask?.completedAt).toBeDefined();

    // Toggle remaining 'manager-introduction'
    const update2 = store.updateOnboardingTask('EMP-0941', 'manager-introduction', true);
    expect(update2.progress.completed).toBe(6);
    expect(update2.progress.isComplete).toBe(true);
    expect(update2.onboarding.attentionSummary).toContain('All onboarding tasks complete');

    // Toggle back to incomplete
    const update3 = store.updateOnboardingTask('EMP-0941', 'accounts', false);
    expect(update3.progress.completed).toBe(5);
    expect(update3.progress.isComplete).toBe(false);
  });

  it('initializes canonical tasks when creating an employee with onboarding status', () => {
    const newEmp = store.createEmployee({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@ledger.hr',
      phone: '+33 1 23 45 67 89',
      dateOfBirth: '1992-05-15',
      street: '10 Rue de la Paix',
      postalCode: '75002',
      city: 'Paris',
      country: 'France',
      jobTitle: 'Backend Engineer',
      department: 'Engineering',
      location: 'Paris',
      employmentType: 'full-time',
      status: 'onboarding',
      startDate: '2026-09-25',
    });

    expect(newEmp.onboarding).toBeDefined();
    expect(newEmp.onboarding?.tasks).toHaveLength(6);
    expect(newEmp.onboarding?.completedTasks).toBe(0);
    expect(newEmp.onboarding?.tasks.every((t) => !t.completed)).toBe(true);

    const plan = store.getOnboardingPlan(newEmp.id);
    expect(plan).toBeDefined();
    expect(plan?.progress.completed).toBe(0);
    expect(plan?.progress.remaining).toBe(6);
  });
});

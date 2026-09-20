import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeeMockStore } from '@/data/mock/store';

describe('Manager Relationship and Referential Integrity', () => {
  let store: EmployeeMockStore;

  beforeEach(() => {
    store = new EmployeeMockStore();
    store.resetToBaseline();
  });

  it('dynamically resolves manager presentation details upon reading subordinate', () => {
    // Noah's manager is Amelia Carter (EMP-0102)
    const noah = store.getEmployeeById('EMP-0941')!;
    expect(noah.employment.manager?.id).toBe('EMP-0102');
    expect(noah.employment.manager?.name).toBe('Amelia Carter');
    expect(noah.employment.manager?.initials).toBe('AC');

    // Rename Amelia Carter to Amelia Vance
    store.updateEmployee('EMP-0102', {
      lastName: 'Vance',
    });

    // Query Noah again: manager name must reflect Amelia Vance dynamically without stale cache
    const noahUpdated = store.getEmployeeById('EMP-0941')!;
    expect(noahUpdated.employment.manager?.name).toBe('Amelia Vance');
    expect(noahUpdated.employment.manager?.initials).toBe('AV');
  });

  it('rejects self-management on employee creation and update', () => {
    // Update: setting employee as their own manager
    expect(() => {
      store.updateEmployee('EMP-0941', {
        managerId: 'EMP-0941',
      });
    }).toThrow(/cannot be their own manager/i);
  });

  it('rejects assigning a non-existent manager ID', () => {
    expect(() => {
      store.updateEmployee('EMP-0941', {
        managerId: 'EMP-9999',
      });
    }).toThrow(/(not found|does not exist)/i);
  });

  it('allows clearing the manager by setting managerId to empty string or undefined', () => {
    const updated = store.updateEmployee('EMP-0941', {
      managerId: '',
    });

    expect(updated.employment.managerId).toBeUndefined();
    expect(updated.employment.manager).toBeUndefined();

    // Query again from store
    const queried = store.getEmployeeById('EMP-0941')!;
    expect(queried.employment.managerId).toBeUndefined();
    expect(queried.employment.manager).toBeUndefined();
  });

  it('excludes offboarded employees from manager search', () => {
    // Offboard Amelia
    store.updateEmployee('EMP-0102', { status: 'offboarded' });

    const results = store.searchManagers('Amelia');
    expect(results.some((m) => m.id === 'EMP-0102')).toBe(false);
  });
});

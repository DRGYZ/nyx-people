import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeeMockStore } from '@/data/mock/store';
import { EmployeeCreateInput } from '@/domain/employee';

describe('EmployeeMockStore', () => {
  let store: EmployeeMockStore;

  const sampleInput: EmployeeCreateInput = {
    firstName: 'Martha',
    lastName: 'Jones',
    email: 'martha.jones@nyxpeople.com',
    phone: '+44 20 7946 0919',
    dateOfBirth: '1992-07-15',
    street: '10 Downing Street',
    postalCode: 'SW1A 2AA',
    city: 'London',
    country: 'United Kingdom',
    jobTitle: 'Medical Officer',
    department: 'People',
    location: 'London',
    employmentType: 'full-time',
    status: 'active',
    startDate: '2026-10-15',
    managerId: 'EMP-0102',
  };

  beforeEach(() => {
    store = new EmployeeMockStore();
    store.resetToBaseline();
  });

  it('creates an employee with a formatted EMP-XXXX ID', () => {
    const created = store.createEmployee(sampleInput);
    expect(created.id).toMatch(/^EMP-\d{4}$/);
    expect(created.person.firstName).toBe('Martha');
    expect(created.person.lastName).toBe('Jones');
    expect(created.person.email).toBe('martha.jones@nyxpeople.com');
    expect(created.employment.manager?.id).toBe('EMP-0102');
    expect(created.timestamps.createdAt).toBeDefined();

    // Verify it can be retrieved
    const fetched = store.getEmployeeById(created.id);
    expect(fetched).toBeDefined();
    expect(fetched?.person.firstName).toBe('Martha');
  });

  it('rejects employee creation with duplicate email address', () => {
    store.createEmployee(sampleInput);

    expect(() => {
      store.createEmployee({
        ...sampleInput,
        firstName: 'Duplicate',
        lastName: 'Person',
      });
    }).toThrow(/already registered/i);
  });

  it('updates an existing employee record and updates updatedAt timestamp', () => {
    const initialNoah = store.getEmployeeById('EMP-0941');
    expect(initialNoah).toBeDefined();

    const updated = store.updateEmployee('EMP-0941', {
      jobTitle: 'Principal Frontend Architect',
      department: 'Engineering',
      location: 'London',
    });

    expect(updated.employment.jobTitle).toBe('Principal Frontend Architect');
    expect(updated.employment.location).toBe('London');
    expect(updated.timestamps.updatedAt).toBeDefined();
    expect(typeof updated.timestamps.updatedAt).toBe('string');

    const refetched = store.getEmployeeById('EMP-0941');
    expect(refetched?.employment.jobTitle).toBe('Principal Frontend Architect');
  });

  it('rejects circular self-manager assignment', () => {
    expect(() => {
      store.updateEmployee('EMP-0941', {
        managerId: 'EMP-0941',
      });
    }).toThrow(/cannot be their own manager/i);
  });

  it('rejects updating an employee email to one that belongs to another employee', () => {
    const noah = store.getEmployeeById('EMP-0941');
    const amelia = store.getEmployeeById('EMP-0102');
    expect(noah).toBeDefined();
    expect(amelia).toBeDefined();

    expect(() => {
      store.updateEmployee('EMP-0941', {
        email: amelia!.person.email,
      });
    }).toThrow(/already registered/i);
  });

  it('allows updating an employee without changing email', () => {
    const noah = store.getEmployeeById('EMP-0941');
    expect(noah).toBeDefined();

    const updated = store.updateEmployee('EMP-0941', {
      email: noah!.person.email,
      jobTitle: 'Staff Engineer',
    });

    expect(updated.employment.jobTitle).toBe('Staff Engineer');
  });

  it('searches managers while excluding a specific employee ID', () => {
    const managers = store.searchManagers('Amelia', 'EMP-0941');
    expect(managers.length).toBeGreaterThan(0);
    expect(managers.some((m) => m.name.includes('Amelia'))).toBe(true);

    // If excluding Amelia Carter (EMP-0102), she shouldn't appear
    const excluded = store.searchManagers('Amelia', 'EMP-0102');
    expect(excluded.some((m) => m.id === 'EMP-0102')).toBe(false);
  });
});

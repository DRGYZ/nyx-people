import { describe, it, expect } from 'vitest';
import { deterministicEmployees } from '@/data/mock/fixtures';
import { EmployeeSchema } from '@/domain/schemas';
import { mockStore } from '@/data/mock/store';

describe('Deterministic Fixtures & Schema Validation', () => {
  it('generates exactly 428 employees as specified in the approved mockup', () => {
    expect(deterministicEmployees).toHaveLength(428);
  });

  it('validates all 428 employees against the strict Zod schema', () => {
    for (const emp of deterministicEmployees) {
      const parseResult = EmployeeSchema.safeParse(emp);
      if (!parseResult.success) {
        console.error(`Validation failed for employee ${emp.id}:`, parseResult.error.format());
      }
      expect(parseResult.success).toBe(true);
    }
  });

  it('includes canonical Noah Williams EMP-0941 matching the profile mockup', () => {
    const noah = deterministicEmployees.find((e) => e.id === 'EMP-0941');
    expect(noah).toBeDefined();
    expect(noah?.person.firstName).toBe('Noah');
    expect(noah?.person.lastName).toBe('Williams');
    expect(noah?.person.email).toBe('noah@company.com');
    expect(noah?.person.phone).toBe('+33 1 42 68 55 00');
    expect(noah?.employment.jobTitle).toBe('Frontend Engineer');
    expect(noah?.employment.department).toBe('Engineering');
    expect(noah?.employment.location).toBe('Paris');
    expect(noah?.employment.status).toBe('onboarding');
    expect(noah?.employment.startDate).toBe('2026-09-24');
    expect(noah?.employment.manager?.name).toBe('Amelia Carter');
    expect(noah?.onboarding?.totalTasks).toBe(6);
    expect(noah?.onboarding?.completedTasks).toBe(4);
    expect(noah?.onboarding?.tasks).toHaveLength(6);
    expect(noah?.person.address.street).toBe('14 Rue de Rivoli');
    expect(noah?.person.address.city).toBe('Paris');
  });

  it('includes Amelia Carter EMP-0102 Product Designer', () => {
    const amelia = deterministicEmployees.find((e) => e.id === 'EMP-0102');
    expect(amelia).toBeDefined();
    expect(amelia?.person.firstName).toBe('Amelia');
    expect(amelia?.person.lastName).toBe('Carter');
    expect(amelia?.employment.department).toBe('Product');
    expect(amelia?.employment.status).toBe('active');
  });

  it('calculates counts matching the editorial tabs', () => {
    const counts = mockStore.getCounts();
    expect(counts.all).toBe(428);
    expect(counts.onboarding).toBe(6);
    expect(counts.contractors).toBe(28);
  });
});

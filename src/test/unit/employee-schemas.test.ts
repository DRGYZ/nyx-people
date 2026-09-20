import { describe, it, expect } from 'vitest';
import {
  EmployeeCreateInputSchema,
  EmployeeUpdateInputSchema,
} from '@/domain/schemas';

describe('Employee Validation Schemas', () => {
  const validEmployeeInput = {
    firstName: 'Clara',
    lastName: 'Oswald',
    preferredName: 'Cleo',
    email: 'clara.oswald@ledger.hr',
    phone: '+33 1 42 68 55 00',
    dateOfBirth: '1996-11-23',
    street: '14 Rue de la Paix',
    postalCode: '75002',
    city: 'Paris',
    country: 'France',
    jobTitle: 'Frontend Engineer',
    department: 'Engineering',
    location: 'Paris',
    employmentType: 'full-time',
    status: 'active',
    startDate: '2026-10-01',
    managerId: 'EMP-0102',
  };

  it('validates and parses a complete valid employee input', () => {
    const result = EmployeeCreateInputSchema.safeParse(validEmployeeInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe('Clara');
      expect(result.data.email).toBe('clara.oswald@ledger.hr');
      expect(result.data.managerId).toBe('EMP-0102');
    }
  });

  it('trims whitespace on name inputs', () => {
    const result = EmployeeCreateInputSchema.safeParse({
      ...validEmployeeInput,
      firstName: '  Clara  ',
      lastName: '  Oswald  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe('Clara');
      expect(result.data.lastName).toBe('Oswald');
    }
  });

  it('rejects empty required fields with descriptive error messages', () => {
    const result = EmployeeCreateInputSchema.safeParse({
      ...validEmployeeInput,
      firstName: '   ',
      lastName: '',
      jobTitle: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('First name is required');
      expect(messages).toContain('Last name is required');
      expect(messages).toContain('Job title is required');
    }
  });

  it('rejects invalid email formats', () => {
    const result = EmployeeCreateInputSchema.safeParse({
      ...validEmployeeInput,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Please enter a valid email address');
    }
  });

  it('rejects date of birth for an applicant under 16 years old', () => {
    // Current year is 2026, so a birth year of 2015 is ~11 years old
    const result = EmployeeCreateInputSchema.safeParse({
      ...validEmployeeInput,
      dateOfBirth: '2015-05-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Employee must be at least 16 years old');
    }
  });

  it('rejects future date of birth', () => {
    const result = EmployeeCreateInputSchema.safeParse({
      ...validEmployeeInput,
      dateOfBirth: '2099-01-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Date of birth cannot be in the future');
    }
  });

  it('rejects invalid date formats not adhering to YYYY-MM-DD', () => {
    const result = EmployeeCreateInputSchema.safeParse({
      ...validEmployeeInput,
      startDate: '01/10/2026',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Start date must be in YYYY-MM-DD format'
      );
    }
  });

  it('allows optional preferredName and managerId to be omitted', () => {
    const { preferredName, managerId, ...minimalValid } = validEmployeeInput;
    const result = EmployeeCreateInputSchema.safeParse(minimalValid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferredName).toBeUndefined();
      expect(result.data.managerId).toBeUndefined();
    }
  });

  it('validates partial update inputs with EmployeeUpdateInputSchema', () => {
    const partialUpdate = {
      jobTitle: 'Senior Staff Engineer',
      department: 'Product',
    };
    const result = EmployeeUpdateInputSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobTitle).toBe('Senior Staff Engineer');
      expect(result.data.department).toBe('Product');
    }
  });
});

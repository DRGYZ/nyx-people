import { z } from 'zod';
import { getNow } from './clock';

/**
 * Validates whether a YYYY-MM-DD string is a real, existing calendar date.
 * Rejects impossible dates like 2026-02-31, 2025-04-31, 2023-02-29.
 * Validates leap years correctly (e.g. 2024-02-29 is valid).
 */
export function isValidCalendarDate(val: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
  const [yStr, mStr, dStr] = val.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return false;
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  if (y < 1900) return false; // Documented sanity bound: reasonable calendar floor
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

export const EmployeeStatusSchema = z.enum([
  'active',
  'onboarding',
  'leave',
  'offboarded',
]);

export const EmploymentTypeSchema = z.enum([
  'full-time',
  'part-time',
  'contractor',
  'intern',
]);

export const DepartmentSchema = z.enum([
  'Engineering',
  'Product',
  'People',
  'Marketing',
  'Finance',
  'Operations',
  'Sales',
  'Legal',
]);

export const OfficeLocationSchema = z.enum([
  'Paris',
  'London',
  'New York',
  'San Francisco',
  'Berlin',
  'Remote',
]);

export const OnboardingTaskSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string(),
    completed: z.boolean(),
    completedAt: z.string().optional(),
  })
  .refine(
    (task) => {
      // Invariant: incomplete tasks must not have a completedAt timestamp
      if (!task.completed && task.completedAt) {
        return false;
      }
      return true;
    },
    { message: 'Incomplete tasks cannot have completedAt populated', path: ['completedAt'] }
  );

export const EmployeeAddressSchema = z.object({
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
});

export const EmployeePersonSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  preferredName: z.string().optional(),
  email: z.string().email(),
  phone: z.string(),
  dateOfBirth: z
    .string()
    .refine(isValidCalendarDate, 'Date of birth must be a valid calendar date')
    .refine((val) => {
      const dob = new Date(`${val}T00:00:00Z`);
      const now = getNow();
      return dob.getTime() <= now.getTime();
    }, 'Date of birth cannot be in the future')
    .refine((val) => {
      const year = parseInt(val.split('-')[0] || '0', 10);
      return year >= 1900;
    }, 'Date of birth year must be 1900 or later'),
  address: EmployeeAddressSchema,
});

export const EmployeeManagerSchema = z.object({
  id: z.string(),
  name: z.string(),
  initials: z.string(),
});

export const EmploymentDetailsSchema = z.object({
  jobTitle: z.string().min(1),
  department: DepartmentSchema,
  location: OfficeLocationSchema,
  employmentType: EmploymentTypeSchema,
  status: EmployeeStatusSchema,
  startDate: z.string().refine(isValidCalendarDate, 'Start date must be a valid calendar date'),
  managerId: z.string().optional(),
  manager: EmployeeManagerSchema.optional(),
});

export const OnboardingDetailsSchema = z
  .object({
    totalTasks: z.number().int().nonnegative().optional(),
    completedTasks: z.number().int().nonnegative().optional(),
    tasks: z.array(OnboardingTaskSchema),
    responsiblePartner: z
      .object({
        name: z.string(),
        note: z.string(),
      })
      .optional(),
    attentionSummary: z.string().optional(),
  })
  .refine(
    (details) => {
      const ids = details.tasks.map((t) => t.id);
      return new Set(ids).size === ids.length;
    },
    { message: 'Onboarding tasks must have unique IDs', path: ['tasks'] }
  );

export const EmployeeSchema = z.object({
  id: z.string().regex(/^EMP-\d{4,}$/, 'Employee ID must be in format EMP-XXXX'),
  person: EmployeePersonSchema,
  employment: EmploymentDetailsSchema,
  onboarding: OnboardingDetailsSchema.optional(),
  timestamps: z.object({
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export const PersistedEnvelopeV1Schema = z.object({
  version: z.literal(1),
  employees: z.array(EmployeeSchema).refine(
    (emps) => {
      const ids = emps.map((e) => e.id);
      return new Set(ids).size === ids.length;
    },
    { message: 'Persisted employees must not contain duplicate IDs' }
  ),
});

export type PersistedEnvelopeV1 = z.infer<typeof PersistedEnvelopeV1Schema>;

export const DirectoryQueryParamsSchema = z.object({
  q: z.string().default(''),
  department: z.string().default('all'),
  status: z.string().default('all'),
  employmentType: z.string().default('all'),
  view: z.enum(['all', 'new-starters', 'onboarding', 'contractors']).default('all'),
  sortBy: z.enum(['default', 'name', 'department', 'status', 'startDate', 'role', '']).default('default'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(25),
});

export type DirectoryQueryParams = z.infer<typeof DirectoryQueryParamsSchema>;

export const EmployeeCreateInputSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  preferredName: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z.string().trim().min(1, 'Phone number is required'),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
    .refine(isValidCalendarDate, 'Date of birth must be a valid calendar date')
    .refine((val) => {
      const dob = new Date(`${val}T00:00:00Z`);
      const now = getNow();
      return dob.getTime() <= now.getTime();
    }, 'Date of birth cannot be in the future')
    .refine((val) => {
      const year = parseInt(val.split('-')[0] || '0', 10);
      return year >= 1900;
    }, 'Date of birth year must be 1900 or later'),
  street: z.string().trim().min(1, 'Street address is required'),
  postalCode: z.string().trim().min(1, 'Postal code is required'),
  city: z.string().trim().min(1, 'City is required'),
  country: z.string().trim().min(1, 'Country is required'),
  jobTitle: z.string().trim().min(1, 'Job title is required'),
  department: DepartmentSchema,
  location: OfficeLocationSchema,
  employmentType: EmploymentTypeSchema,
  status: EmployeeStatusSchema,
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .refine(isValidCalendarDate, 'Start date must be a valid calendar date'),
  managerId: z.string().optional(),
});

export const EmployeeUpdateInputSchema = EmployeeCreateInputSchema.partial();

import { z } from 'zod';

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

export const OnboardingTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  completed: z.boolean(),
  completedAt: z.string().optional(),
});

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
  dateOfBirth: z.string(),
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
  startDate: z.string(),
  manager: EmployeeManagerSchema.optional(),
});

export const OnboardingDetailsSchema = z.object({
  totalTasks: z.number().int().nonnegative(),
  completedTasks: z.number().int().nonnegative(),
  tasks: z.array(OnboardingTaskSchema),
  responsiblePartner: z
    .object({
      name: z.string(),
      note: z.string(),
    })
    .optional(),
  attentionSummary: z.string().optional(),
});

export const EmployeeSchema = z.object({
  id: z.string(),
  person: EmployeePersonSchema,
  employment: EmploymentDetailsSchema,
  onboarding: OnboardingDetailsSchema.optional(),
  timestamps: z.object({
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

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

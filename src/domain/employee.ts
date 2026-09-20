export type EmployeeStatus = 'active' | 'onboarding' | 'leave' | 'offboarded';

export type EmploymentType = 'full-time' | 'part-time' | 'contractor' | 'intern';

export type Department =
  | 'Engineering'
  | 'Product'
  | 'People'
  | 'Marketing'
  | 'Finance'
  | 'Operations'
  | 'Sales'
  | 'Legal';

export type OfficeLocation =
  | 'Paris'
  | 'London'
  | 'New York'
  | 'San Francisco'
  | 'Berlin'
  | 'Remote';

export interface OnboardingTask {
  id: string;
  title: string;
  subtitle: string;
  completed: boolean;
  completedAt?: string;
}

export interface EmployeeAddress {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface EmployeePerson {
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string;
  phone: string;
  dateOfBirth: string; // ISO format: YYYY-MM-DD
  address: EmployeeAddress;
}

export interface EmployeeManager {
  id: string;
  name: string;
  initials: string;
}

export interface EmploymentDetails {
  jobTitle: string;
  department: Department;
  location: OfficeLocation;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  startDate: string; // ISO format: YYYY-MM-DD
  manager?: EmployeeManager;
}

export interface OnboardingDetails {
  totalTasks: number;
  completedTasks: number;
  tasks: OnboardingTask[];
  responsiblePartner?: {
    name: string;
    note: string;
  };
  attentionSummary?: string;
}

export interface Employee {
  id: string; // e.g. "EMP-0941"
  person: EmployeePerson;
  employment: EmploymentDetails;
  onboarding?: OnboardingDetails;
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
}

export type DirectoryViewTab = 'all' | 'new-starters' | 'onboarding' | 'contractors';

export interface DirectoryCounts {
  all: number;
  newStarters: number;
  onboarding: number;
  contractors: number;
}

export interface EmployeeCreateInput {
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  jobTitle: string;
  department: Department;
  location: OfficeLocation;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  startDate: string;
  managerId?: string;
}

export type EmployeeUpdateInput = Partial<EmployeeCreateInput>;
export type EmployeeFormValues = EmployeeCreateInput;


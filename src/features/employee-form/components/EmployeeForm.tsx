import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import {
  Employee,
  EmployeeCreateInput,
  EmployeeFormValues,
  Department,
  OfficeLocation,
  EmploymentType,
  EmployeeStatus,
} from '@/domain/employee';
import { EmployeeCreateInputSchema } from '@/domain/schemas';
import { getNow } from '@/domain/clock';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ManagerCombobox } from './ManagerCombobox';
import { FormErrorSummary, FormErrorItem } from './FormErrorSummary';
import styles from './EmployeeForm.module.css';

interface EmployeeFormProps {
  initialData?: Employee;
  onSubmit: (values: EmployeeCreateInput) => Promise<void>;
  isSubmitting: boolean;
  serverError?: string | null;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const FIELD_LABELS: Record<keyof EmployeeFormValues, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  preferredName: 'Preferred name',
  email: 'Work email',
  phone: 'Phone number',
  dateOfBirth: 'Date of birth',
  street: 'Street address',
  postalCode: 'Postal code',
  city: 'City',
  country: 'Country',
  jobTitle: 'Job title',
  department: 'Department',
  location: 'Office location',
  employmentType: 'Employment type',
  status: 'Status',
  startDate: 'Start date',
  managerId: 'Reporting manager',
};

const DEPARTMENT_OPTIONS: SelectOption[] = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Product', label: 'Product' },
  { value: 'People', label: 'People' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Legal', label: 'Legal' },
];

const LOCATION_OPTIONS: SelectOption[] = [
  { value: 'Paris', label: 'Paris Bureau' },
  { value: 'London', label: 'London Office' },
  { value: 'New York', label: 'New York Office' },
  { value: 'San Francisco', label: 'San Francisco Bureau' },
  { value: 'Berlin', label: 'Berlin Office' },
  { value: 'Remote', label: 'Remote / Flexible' },
];

const EMPLOYMENT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'intern', label: 'Intern' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'leave', label: 'Leave' },
  { value: 'offboarded', label: 'Offboarded' },
];

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  serverError,
  onCancel,
  mode,
}) => {
  const defaultValues: EmployeeCreateInput = {
    firstName: initialData?.person.firstName || '',
    lastName: initialData?.person.lastName || '',
    preferredName: initialData?.person.preferredName || '',
    email: initialData?.person.email || '',
    phone: initialData?.person.phone || '',
    dateOfBirth: initialData?.person.dateOfBirth || '',
    street: initialData?.person.address.street || '',
    postalCode: initialData?.person.address.postalCode || '',
    city: initialData?.person.address.city || '',
    country: initialData?.person.address.country || 'France',
    jobTitle: initialData?.employment.jobTitle || '',
    department: (initialData?.employment.department as Department) || 'Engineering',
    location: (initialData?.employment.location as OfficeLocation) || 'Paris',
    employmentType: (initialData?.employment.employmentType as EmploymentType) || 'full-time',
    status: (initialData?.employment.status as EmployeeStatus) || 'active',
    startDate: initialData?.employment.startDate || getNow().toISOString().slice(0, 10),
    managerId: initialData?.employment.managerId || initialData?.employment.manager?.id || '',
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<EmployeeCreateInput>({
    resolver: zodResolver(EmployeeCreateInputSchema),
    defaultValues,
    mode: 'onBlur',
  });

  // Warn before browser unload if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const handleCancel = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      );
      if (!confirmLeave) return;
    }
    onCancel();
  };

  const handleFocusField = (field: string) => {
    const el = document.getElementById(`field-${field}`);
    if (el) {
      el.focus();
      el.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    }
  };

  // Construct structured error list for ErrorSummary
  const errorSummaryItems: FormErrorItem[] = Object.entries(errors)
    .filter(([_, error]) => error && error.message)
    .map(([fieldKey, error]) => ({
      field: fieldKey,
      label: FIELD_LABELS[fieldKey as keyof EmployeeFormValues] || fieldKey,
      message: (error?.message as string) || `Please enter a valid ${fieldKey}`,
    }));

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Top Error Summary */}
      <FormErrorSummary errors={errorSummaryItems} onFocusField={handleFocusField} />

      {/* Server / API Conflict Error Banner */}
      {serverError && (
        <div className={styles.serverAlert} role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      {/* SECTION 1: Personal Information */}
      <section className={styles.sectionCard} aria-labelledby="section-personal-heading">
        <div className={styles.sectionHeader}>
          <h2 id="section-personal-heading" className={styles.sectionTitle}>
            Personal Details
          </h2>
          <span className={styles.sectionTag}>PERSONAL RECORD</span>
        </div>

        <div className={styles.grid2}>
          {/* First Name */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-firstName" className={styles.label}>
              First name <span className={styles.requiredStar} aria-hidden="true">*</span>
            </label>
            <Input
              id="field-firstName"
              {...register('firstName')}
              placeholder="e.g. Clara"
              aria-required="true"
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'field-firstName-error' : undefined}
            />
            {errors.firstName && (
              <span id="field-firstName-error" className={styles.fieldError} role="alert">
                {errors.firstName.message}
              </span>
            )}
          </div>

          {/* Last Name */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-lastName" className={styles.label}>
              Last name <span className={styles.requiredStar} aria-hidden="true">*</span>
            </label>
            <Input
              id="field-lastName"
              {...register('lastName')}
              placeholder="e.g. Oswald"
              aria-required="true"
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'field-lastName-error' : undefined}
            />
            {errors.lastName && (
              <span id="field-lastName-error" className={styles.fieldError} role="alert">
                {errors.lastName.message}
              </span>
            )}
          </div>
        </div>

        <div className={styles.grid2}>
          {/* Preferred Name */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-preferredName" className={styles.label}>
              Preferred name <span className={styles.optionalTag}>(optional)</span>
            </label>
            <Input
              id="field-preferredName"
              {...register('preferredName')}
              placeholder="e.g. Cleo"
              aria-invalid={!!errors.preferredName}
              aria-describedby={errors.preferredName ? 'field-preferredName-error' : undefined}
            />
            {errors.preferredName && (
              <span id="field-preferredName-error" className={styles.fieldError} role="alert">
                {errors.preferredName.message}
              </span>
            )}
          </div>

          {/* Date of Birth */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-dateOfBirth" className={styles.label}>
              Date of birth <span className={styles.requiredStar} aria-hidden="true">*</span>
            </label>
            <Input
              id="field-dateOfBirth"
              type="date"
              {...register('dateOfBirth')}
              aria-required="true"
              aria-invalid={!!errors.dateOfBirth}
              aria-describedby={
                errors.dateOfBirth ? 'field-dateOfBirth-error' : 'field-dateOfBirth-hint'
              }
            />
            <span id="field-dateOfBirth-hint" className={styles.fieldHint}>
              Must be at least 16 years old (YYYY-MM-DD)
            </span>
            {errors.dateOfBirth && (
              <span id="field-dateOfBirth-error" className={styles.fieldError} role="alert">
                {errors.dateOfBirth.message}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: Contact & Location */}
      <section className={styles.sectionCard} aria-labelledby="section-contact-heading">
        <div className={styles.sectionHeader}>
          <h2 id="section-contact-heading" className={styles.sectionTitle}>
            Contact & Location
          </h2>
          <span className={styles.sectionTag}>LOCATION & REACH</span>
        </div>

        <div className={styles.grid2}>
          {/* Work Email */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-email" className={styles.label}>
              Work email <span className={styles.requiredStar} aria-hidden="true">*</span>
            </label>
            <Input
              id="field-email"
              type="email"
              {...register('email')}
              placeholder="e.g. clara.oswald@ledger.hr"
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'field-email-error' : undefined}
            />
            {errors.email && (
              <span id="field-email-error" className={styles.fieldError} role="alert">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Phone Number */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-phone" className={styles.label}>
              Phone number <span className={styles.requiredStar} aria-hidden="true">*</span>
            </label>
            <Input
              id="field-phone"
              type="tel"
              {...register('phone')}
              placeholder="e.g. +33 1 42 68 55 00"
              aria-required="true"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'field-phone-error' : undefined}
            />
            {errors.phone && (
              <span id="field-phone-error" className={styles.fieldError} role="alert">
                {errors.phone.message}
              </span>
            )}
          </div>
        </div>

        {/* Street Address */}
        <div className={styles.fieldGroup}>
          <label htmlFor="field-street" className={styles.label}>
            Street address <span className={styles.requiredStar} aria-hidden="true">*</span>
          </label>
          <Input
            id="field-street"
            {...register('street')}
            placeholder="e.g. 14 Rue de la Paix"
            aria-required="true"
            aria-invalid={!!errors.street}
            aria-describedby={errors.street ? 'field-street-error' : undefined}
          />
          {errors.street && (
            <span id="field-street-error" className={styles.fieldError} role="alert">
              {errors.street.message}
            </span>
          )}
        </div>

        <div className={styles.grid3}>
          {/* City */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-city" className={styles.label}>
              City <span className={styles.requiredStar} aria-hidden="true">*</span>
            </label>
            <Input
              id="field-city"
              {...register('city')}
              placeholder="e.g. Paris"
              aria-required="true"
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? 'field-city-error' : undefined}
            />
            {errors.city && (
              <span id="field-city-error" className={styles.fieldError} role="alert">
                {errors.city.message}
              </span>
            )}
          </div>

          {/* Postal Code */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-postalCode" className={styles.label}>
              Postal code <span className={styles.requiredStar} aria-hidden="true">*</span>
            </label>
            <Input
              id="field-postalCode"
              {...register('postalCode')}
              placeholder="e.g. 75002"
              aria-required="true"
              aria-invalid={!!errors.postalCode}
              aria-describedby={errors.postalCode ? 'field-postalCode-error' : undefined}
            />
            {errors.postalCode && (
              <span id="field-postalCode-error" className={styles.fieldError} role="alert">
                {errors.postalCode.message}
              </span>
            )}
          </div>

          {/* Country */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-country" className={styles.label}>
              Country <span className={styles.requiredStar} aria-hidden="true">*</span>
            </label>
            <Input
              id="field-country"
              {...register('country')}
              placeholder="e.g. France"
              aria-required="true"
              aria-invalid={!!errors.country}
              aria-describedby={errors.country ? 'field-country-error' : undefined}
            />
            {errors.country && (
              <span id="field-country-error" className={styles.fieldError} role="alert">
                {errors.country.message}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: Employment Details */}
      <section className={styles.sectionCard} aria-labelledby="section-employment-heading">
        <div className={styles.sectionHeader}>
          <h2 id="section-employment-heading" className={styles.sectionTitle}>
            Employment Details
          </h2>
          <span className={styles.sectionTag}>ORGANIZATION</span>
        </div>

        <div className={styles.grid2}>
          {/* Job Title */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-jobTitle" className={styles.label}>
              Job title <span className={styles.requiredStar} aria-hidden="true">*</span>
            </label>
            <Input
              id="field-jobTitle"
              {...register('jobTitle')}
              placeholder="e.g. Frontend Engineer"
              aria-required="true"
              aria-invalid={!!errors.jobTitle}
              aria-describedby={errors.jobTitle ? 'field-jobTitle-error' : undefined}
            />
            {errors.jobTitle && (
              <span id="field-jobTitle-error" className={styles.fieldError} role="alert">
                {errors.jobTitle.message}
              </span>
            )}
          </div>

          {/* Department */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-department" className={styles.label}>
              Department <span className={styles.requiredStar} aria-hidden="true">*</span>
            </label>
            <Controller
              control={control}
              name="department"
              render={({ field }) => (
                <Select
                  id="field-department"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={DEPARTMENT_OPTIONS}
                  placeholder="Select department..."
                  ariaLabel="Select department"
                  ariaInvalid={!!errors.department}
                  ariaDescribedBy={errors.department ? 'field-department-error' : undefined}
                />
              )}
            />
            {errors.department && (
              <span id="field-department-error" className={styles.fieldError} role="alert">
                {errors.department.message}
              </span>
            )}
          </div>
        </div>

        <div className={styles.grid2}>
          {/* Office Location */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-location" className={styles.label}>
              Office location <span className={styles.requiredStar} aria-hidden="true">*</span>
            </label>
            <Controller
              control={control}
              name="location"
              render={({ field }) => (
                <Select
                  id="field-location"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={LOCATION_OPTIONS}
                  placeholder="Select location..."
                  ariaLabel="Select office location"
                  ariaInvalid={!!errors.location}
                  ariaDescribedBy={errors.location ? 'field-location-error' : undefined}
                />
              )}
            />
            {errors.location && (
              <span id="field-location-error" className={styles.fieldError} role="alert">
                {errors.location.message}
              </span>
            )}
          </div>

          {/* Employment Type */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-employmentType" className={styles.label}>
              Employment type <span className={styles.requiredStar} aria-hidden="true">*</span>
            </label>
            <Controller
              control={control}
              name="employmentType"
              render={({ field }) => (
                <Select
                  id="field-employmentType"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={EMPLOYMENT_TYPE_OPTIONS}
                  placeholder="Select type..."
                  ariaLabel="Select employment type"
                  ariaInvalid={!!errors.employmentType}
                  ariaDescribedBy={errors.employmentType ? 'field-employmentType-error' : undefined}
                />
              )}
            />
            {errors.employmentType && (
              <span id="field-employmentType-error" className={styles.fieldError} role="alert">
                {errors.employmentType.message}
              </span>
            )}
          </div>
        </div>

        <div className={styles.grid2}>
          {/* Status */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-status" className={styles.label}>
              Status <span className={styles.requiredStar} aria-hidden="true">*</span>
            </label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  id="field-status"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={STATUS_OPTIONS}
                  placeholder="Select status..."
                  ariaLabel="Select employee status"
                  ariaInvalid={!!errors.status}
                  ariaDescribedBy={errors.status ? 'field-status-error' : undefined}
                />
              )}
            />
            {errors.status && (
              <span id="field-status-error" className={styles.fieldError} role="alert">
                {errors.status.message}
              </span>
            )}
          </div>

          {/* Start Date */}
          <div className={styles.fieldGroup}>
            <label htmlFor="field-startDate" className={styles.label}>
              Start date <span className={styles.requiredStar} aria-hidden="true">*</span>
            </label>
            <Input
              id="field-startDate"
              type="date"
              {...register('startDate')}
              aria-required="true"
              aria-invalid={!!errors.startDate}
              aria-describedby={errors.startDate ? 'field-startDate-error' : undefined}
            />
            {errors.startDate && (
              <span id="field-startDate-error" className={styles.fieldError} role="alert">
                {errors.startDate.message}
              </span>
            )}
          </div>
        </div>

        {/* Manager Combobox */}
        <div className={styles.fieldGroup}>
          <label htmlFor="field-managerId" className={styles.label}>
            Reporting manager <span className={styles.optionalTag}>(optional)</span>
          </label>
          <Controller
            control={control}
            name="managerId"
            render={({ field }) => (
              <ManagerCombobox
                id="field-managerId"
                value={field.value}
                onChange={field.onChange}
                excludeEmployeeId={initialData?.id}
                ariaInvalid={!!errors.managerId}
                ariaDescribedBy={errors.managerId ? 'field-managerId-error' : undefined}
              />
            )}
          />
          {errors.managerId && (
            <span id="field-managerId-error" className={styles.fieldError} role="alert">
              {errors.managerId.message}
            </span>
          )}
        </div>
      </section>

      {/* Action Bar Footer */}
      <footer className={styles.actionBar}>
        {isDirty && (
          <span className={styles.dirtyWarning} role="status">
            <AlertTriangle size={14} aria-hidden="true" />
            <span>Unsaved modifications in progress</span>
          </span>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          icon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : undefined}
        >
          {isSubmitting
            ? mode === 'create'
              ? 'Creating employee...'
              : 'Saving changes...'
            : mode === 'create'
            ? 'Create employee'
            : 'Save changes'}
        </Button>
      </footer>
    </form>
  );
};

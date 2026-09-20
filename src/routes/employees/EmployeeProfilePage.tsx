import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useEmployeeProfile } from '@/features/employee-profile/hooks/useEmployeeProfile';
import { ProfileHeader } from '@/features/employee-profile/components/ProfileHeader';
import { NeedsAttentionBanner } from '@/features/employee-profile/components/NeedsAttentionBanner';
import { EmploymentSection } from '@/features/employee-profile/components/EmploymentSection';
import { ContactSection } from '@/features/employee-profile/components/ContactSection';
import { PersonalInfoSection } from '@/features/employee-profile/components/PersonalInfoSection';
import { OnboardingChecklist } from '@/features/employee-profile/components/OnboardingChecklist';
import { ProfileFooter } from '@/features/employee-profile/components/ProfileFooter';
import { ProfileSkeleton } from '@/features/employee-profile/components/ProfileSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import styles from './EmployeeProfilePage.module.css';

export const EmployeeProfilePage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const location = useLocation();

  // Resolve preserved return query string
  const returnSearchQuery = React.useMemo(() => {
    if (location.state?.returnSearch) {
      return location.state.returnSearch;
    }
    const searchParams = new URLSearchParams(location.search);
    const returnSearch = searchParams.get('returnSearch');
    if (returnSearch) {
      return returnSearch;
    }
    // If query params were appended directly to URL, strip leading '?'
    const rawSearch = location.search.startsWith('?')
      ? location.search.slice(1)
      : location.search;
    return rawSearch;
  }, [location.search, location.state]);

  const { employee, loading, error, statusCode } = useEmployeeProfile(employeeId);

  if (loading) {
    return (
      <div className={styles.container}>
        <ProfileSkeleton />
      </div>
    );
  }

  if (error || !employee) {
    const isNotFound = statusCode === 404;
    return (
      <div className={styles.container}>
        <EmptyState
          title={isNotFound ? 'Employee Not Found' : "We couldn't load this profile"}
          description={
            isNotFound
              ? `The employee record '${employeeId}' does not exist in the directory.`
              : error || 'An unexpected error occurred.'
          }
          action={
            <Link to={returnSearchQuery ? `/employees?${returnSearchQuery}` : '/employees'}>
              <Button variant="secondary">Return to Employees</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const { employment, person, onboarding } = employee;
  const hasOnboarding = Boolean(onboarding && onboarding.tasks && onboarding.tasks.length > 0);

  return (
    <div className={styles.container}>
      <ProfileHeader
        employee={employee}
        returnSearchQuery={returnSearchQuery}
      />

      {onboarding?.attentionSummary && (
        <NeedsAttentionBanner summary={onboarding.attentionSummary} />
      )}

      <div className={styles.contentGrid}>
        <div className={styles.leftColumn}>
          <EmploymentSection employment={employment} />
          <ContactSection email={person.email} phone={person.phone} />
          <PersonalInfoSection dateOfBirth={person.dateOfBirth} address={person.address} />
        </div>

        {hasOnboarding && onboarding && (
          <div className={styles.rightColumn}>
            <OnboardingChecklist onboarding={onboarding} employeeId={employee.id} />
          </div>
        )}
      </div>

      <ProfileFooter
        employeeId={employee.id}
        location={employment.location}
      />
    </div>
  );
};

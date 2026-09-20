import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GetOnboardingPlanResponse } from '@/data/contracts';
import { fetchOnboardingPlan, updateOnboardingTask } from '@/data/api-client';
import { OnboardingDetailHeader } from '@/features/onboarding/components/OnboardingDetailHeader';
import { OnboardingProgressCard } from '@/features/onboarding/components/OnboardingProgressCard';
import { OnboardingChecklistSection } from '@/features/onboarding/components/OnboardingChecklistSection';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './EmployeeOnboardingPage.module.css';

export const EmployeeOnboardingPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();

  const [data, setData] = useState<GetOnboardingPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;

    let isMounted = true;
    setIsLoading(true);
    setNotFound(false);

    fetchOnboardingPlan(employeeId)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setIsLoading(false);
          if (err.statusCode === 404) {
            setNotFound(true);
          } else {
            setToggleError(err.message || 'Failed to load onboarding plan');
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [employeeId]);

  const handleToggleTask = async (taskId: string, newStatus: boolean) => {
    if (!employeeId || !data) return;

    setUpdatingTaskId(taskId);
    setToggleError(null);

    // Optimistic update
    const previousTasks = data.onboarding.tasks;
    const updatedTasks = previousTasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            completed: newStatus,
            completedAt: newStatus ? new Date().toISOString() : undefined,
          }
        : t
    );
    const completedCount = updatedTasks.filter((t) => t.completed).length;

    setData({
      ...data,
      onboarding: {
        ...data.onboarding,
        completedTasks: completedCount,
        tasks: updatedTasks,
      },
      progress: {
        ...data.progress,
        completed: completedCount,
        remaining: Math.max(0, 6 - completedCount),
        percent: Math.round((completedCount / 6) * 100),
        isComplete: completedCount >= 6,
      },
    });

    try {
      const res = await updateOnboardingTask(employeeId, taskId, newStatus);
      setData(res);
    } catch (err: any) {
      // Revert optimistic update
      setData((prev) => {
        if (!prev) return prev;
        const prevCompleted = previousTasks.filter((t) => t.completed).length;
        return {
          ...prev,
          onboarding: {
            ...prev.onboarding,
            completedTasks: prevCompleted,
            tasks: previousTasks,
          },
          progress: {
            ...prev.progress,
            completed: prevCompleted,
            remaining: Math.max(0, 6 - prevCompleted),
            percent: Math.round((prevCompleted / 6) * 100),
            isComplete: prevCompleted >= 6,
          },
        };
      });
      setToggleError(err.message || 'Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer} role="status" aria-label="Loading onboarding checklist">
        <div className={styles.loadingSkeleton}>
          <div className={styles.skeletonCard}>
            <Skeleton width="30%" height={32} />
            <Skeleton width="50%" height={20} />
          </div>
          <div className={styles.skeletonCard}>
            <Skeleton width="100%" height={12} />
          </div>
          <div className={styles.skeletonCard}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} width="100%" height={48} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.notFoundContainer} role="alert">
          <h2 className={styles.notFoundTitle}>Onboarding Record Not Found</h2>
          <p className={styles.notFoundText}>
            No onboarding workflow exists for employee ID &apos;{employeeId}&apos;.
          </p>
          <Link to="/onboarding" className={styles.returnButton}>
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Return to Onboarding</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <OnboardingDetailHeader employee={data.employee} />

      <OnboardingProgressCard
        onboarding={data.onboarding}
        progress={data.progress}
      />

      <OnboardingChecklistSection
        tasks={data.onboarding.tasks}
        updatingTaskId={updatingTaskId}
        errorMessage={toggleError}
        onToggleTask={handleToggleTask}
        onClearError={() => setToggleError(null)}
      />
    </div>
  );
};

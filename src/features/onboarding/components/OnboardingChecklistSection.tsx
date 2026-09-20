import React from 'react';
import { OnboardingTask } from '@/domain/employee';
import { OnboardingTaskItem } from './OnboardingTaskItem';
import styles from './OnboardingChecklistSection.module.css';

interface OnboardingChecklistSectionProps {
  tasks: OnboardingTask[];
  updatingTaskId?: string | null;
  errorMessage?: string | null;
  onToggleTask: (taskId: string, newStatus: boolean) => void;
  onClearError?: () => void;
}

export const OnboardingChecklistSection: React.FC<OnboardingChecklistSectionProps> = ({
  tasks,
  updatingTaskId,
  errorMessage,
  onToggleTask,
  onClearError,
}) => {
  return (
    <section className={styles.section} aria-labelledby="checklist-heading">
      <div className={styles.header}>
        <h2 id="checklist-heading" className={styles.title}>
          Tasks
        </h2>
      </div>

      {errorMessage && (
        <div className={styles.errorBanner} role="alert">
          <span>{errorMessage}</span>
          {onClearError && (
            <button
              type="button"
              onClick={onClearError}
              style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontWeight: 600 }}
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      <div className={styles.tasksList} role="list" aria-label="Operational readiness checklist">
        {tasks.map((task) => (
          <OnboardingTaskItem
            key={task.id}
            task={task}
            isUpdating={updatingTaskId === task.id}
            disabled={updatingTaskId !== null}
            onToggle={onToggleTask}
          />
        ))}
      </div>
    </section>
  );
};

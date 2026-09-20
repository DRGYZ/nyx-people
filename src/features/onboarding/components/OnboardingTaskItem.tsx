import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { OnboardingTask } from '@/domain/employee';
import styles from './OnboardingTaskItem.module.css';

interface OnboardingTaskItemProps {
  task: OnboardingTask;
  isUpdating?: boolean;
  disabled?: boolean;
  onToggle: (taskId: string, newStatus: boolean) => void;
}

export const OnboardingTaskItem: React.FC<OnboardingTaskItemProps> = ({
  task,
  isUpdating = false,
  disabled = false,
  onToggle,
}) => {
  const handleClick = () => {
    if (isUpdating || disabled) return;
    onToggle(task.id, !task.completed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  const formattedDate = task.completedAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(task.completedAt))
    : null;

  return (
    <div
      className={`${styles.item} ${task.completed ? styles.itemCompleted : ''}`}
      role="listitem"
    >
      <button
        type="button"
        role="checkbox"
        id={`task-checkbox-${task.id}`}
        aria-checked={task.completed}
        aria-labelledby={`task-title-${task.id}`}
        disabled={disabled || isUpdating}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`${styles.checkboxButton} ${
          task.completed ? styles.checkboxChecked : styles.checkboxPending
        }`}
      >
        {isUpdating ? (
          <Loader2 size={13} className={styles.spinner} aria-hidden="true" />
        ) : task.completed ? (
          <Check size={14} strokeWidth={3} aria-hidden="true" />
        ) : null}
      </button>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span
            id={`task-title-${task.id}`}
            className={`${styles.taskTitle} ${task.completed ? styles.titleCompleted : ''}`}
          >
            {task.title}
          </span>

          {task.completed && (
            <span className={`${styles.completedText} tabular-nums`}>
              Completed{formattedDate ? ` ${formattedDate}` : ''}
            </span>
          )}
        </div>

        <p className={styles.taskSubtitle}>{task.subtitle}</p>
      </div>
    </div>
  );
};

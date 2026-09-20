import React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  triggerPrefix?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  className = '',
  triggerPrefix,
}) => {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        className={`${styles.trigger} ${className}`}
        aria-label={ariaLabel}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {triggerPrefix && <span style={{ color: 'var(--text-secondary)' }}>{triggerPrefix}</span>}
          <RadixSelect.Value placeholder={placeholder} />
        </span>
        <RadixSelect.Icon className={styles.triggerIcon}>
          <ChevronDown size={14} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          className={styles.content}
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.Viewport className={styles.viewport}>
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className={styles.item}
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className={styles.itemIndicator}>
                  <Check size={12} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

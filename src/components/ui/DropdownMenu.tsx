import React from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
import styles from './DropdownMenu.module.css';

export interface ColumnToggleOption {
  id: string;
  label: string;
  isVisible: boolean;
  canToggle?: boolean;
}

interface ColumnVisibilityMenuProps {
  columns: ColumnToggleOption[];
  onToggleColumn: (columnId: string, visible: boolean) => void;
  triggerLabel?: string;
  className?: string;
}

export const ColumnVisibilityMenu: React.FC<ColumnVisibilityMenuProps> = ({
  columns,
  onToggleColumn,
  triggerLabel = 'Columns',
  className = '',
}) => {
  return (
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger className={`${styles.trigger} ${className}`}>
        <span>{triggerLabel}</span>
        <span className={styles.triggerIcon}>
          <ChevronDown size={14} />
        </span>
      </RadixDropdownMenu.Trigger>

      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          className={styles.content}
          align="end"
          sideOffset={4}
        >
          {columns.map((col) => (
            <RadixDropdownMenu.CheckboxItem
              key={col.id}
              className={styles.checkboxItem}
              checked={col.isVisible}
              disabled={col.canToggle === false}
              onCheckedChange={(checked) => onToggleColumn(col.id, checked)}
            >
              <span>{col.label}</span>
              <RadixDropdownMenu.ItemIndicator className={styles.checkboxItemIndicator}>
                <Check size={12} />
              </RadixDropdownMenu.ItemIndicator>
            </RadixDropdownMenu.CheckboxItem>
          ))}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};

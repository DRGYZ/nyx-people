import React, { useState, useEffect, useRef, useId } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { fetchManagers, isAbortError } from '@/data/api-client';
import { EmployeeManagerOption } from '@/data/contracts';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import styles from './ManagerCombobox.module.css';

export interface ManagerComboboxProps {
  id?: string;
  value?: string;
  onChange: (managerId: string | undefined) => void;
  excludeEmployeeId?: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}

export const ManagerCombobox: React.FC<ManagerComboboxProps> = ({
  id,
  value,
  onChange,
  excludeEmployeeId,
  ariaInvalid,
  ariaDescribedBy,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [managers, setManagers] = useState<EmployeeManagerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [selectedManagerInfo, setSelectedManagerInfo] = useState<EmployeeManagerOption | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const instanceId = useId().replace(/:/g, '');
  const listboxId = `manager-listbox-${instanceId}`;
  const searchInputId = `manager-search-${instanceId}`;

  // Fetch managers with debounce (150ms on query, 0ms on initial) and AbortController cancellation
  useEffect(() => {
    const controller = new AbortController();
    const delayMs = query ? 150 : 0;

    const timer = setTimeout(() => {
      setLoading(true);
      fetchManagers(query, excludeEmployeeId, controller.signal)
        .then((data) => {
          if (!controller.signal.aborted) {
            setManagers(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!isAbortError(err) && !controller.signal.aborted) {
            console.warn('Failed to load managers:', err);
            setLoading(false);
          }
        });
    }, delayMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, excludeEmployeeId]);

  // Keep selected manager info in sync
  useEffect(() => {
    if (!value) {
      setSelectedManagerInfo(null);
      return;
    }
    const found = managers.find((m) => m.id === value);
    if (found) {
      setSelectedManagerInfo(found);
    }
  }, [value, managers]);

  // Reset highlight when dropdown opens or managers change
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return;
    const activeMgr = highlightedIndex > 0 ? managers[highlightedIndex - 1] : undefined;
    const activeId =
      highlightedIndex === 0
        ? `manager-option-none-${instanceId}`
        : activeMgr
        ? `manager-option-${activeMgr.id}`
        : undefined;

    if (activeId) {
      const activeEl = document.getElementById(activeId);
      activeEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen, managers, instanceId]);

  const totalItems = 1 + managers.length; // 1 for "None" + managers count
  const activeManager = highlightedIndex > 0 ? managers[highlightedIndex - 1] : undefined;

  const activeOptionId =
    highlightedIndex === 0
      ? `manager-option-none-${instanceId}`
      : activeManager
      ? `manager-option-${activeManager.id}`
      : undefined;

  const handleSelect = (managerId: string | undefined) => {
    onChange(managerId);
    if (managerId) {
      const selected = managers.find((m) => m.id === managerId);
      if (selected) setSelectedManagerInfo(selected);
    } else {
      setSelectedManagerInfo(null);
    }
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setSelectedManagerInfo(null);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Home') {
      if (!query) {
        e.preventDefault();
        setHighlightedIndex(0);
      }
    } else if (e.key === 'End') {
      if (!query) {
        e.preventDefault();
        setHighlightedIndex(totalItems - 1);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex === 0) {
        handleSelect(undefined);
      } else if (activeManager) {
        handleSelect(activeManager.id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  const displayManager =
    selectedManagerInfo || managers.find((m) => m.id === value);

  return (
    <div className={styles.container}>
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <div className={styles.triggerGroup}>
          <Popover.Trigger asChild>
            <button
              ref={triggerRef}
              type="button"
              id={id}
              className={`${styles.trigger} ${value ? styles.triggerWithClear : ''} ${
                ariaInvalid ? styles.triggerError : ''
              }`}
              onClick={() => setIsOpen((prev) => !prev)}
              onKeyDown={handleTriggerKeyDown}
              role="combobox"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-controls={listboxId}
              aria-invalid={ariaInvalid}
              aria-describedby={ariaDescribedBy}
            >
              {displayManager ? (
                <div className={styles.selectedInfo}>
                  <InitialsAvatar initials={displayManager.initials} size="sm" />
                  <div className={styles.selectedDetails}>
                    <span className={styles.selectedName}>{displayManager.name}</span>
                    <span className={styles.selectedRole}>
                      {displayManager.role} · {displayManager.department}
                    </span>
                  </div>
                </div>
              ) : (
                <span className={styles.placeholder}>Select a reporting manager...</span>
              )}

              <ChevronDown
                size={16}
                className={`${styles.chevronIcon} ${isOpen ? styles.chevronIconOpen : ''}`}
                aria-hidden="true"
              />
            </button>
          </Popover.Trigger>

          {value && (
            <button
              type="button"
              className={styles.clearSelectionBtn}
              onClick={handleClear}
              aria-label="Clear selected manager"
              title="Clear selected manager"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <Popover.Portal>
          <Popover.Content
            className={styles.dropdown}
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              searchInputRef.current?.focus();
            }}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              triggerRef.current?.focus();
            }}
          >
            <div className={styles.searchHeader}>
              <Search size={14} className={styles.searchIcon} aria-hidden="true" />
              <input
                ref={searchInputRef}
                id={searchInputId}
                type="text"
                className={styles.searchInput}
                placeholder="Search by name, role, or department..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={activeOptionId}
                aria-label="Search reporting manager"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setHighlightedIndex(0);
                    searchInputRef.current?.focus();
                  }}
                  className={styles.clearQueryBtn}
                  aria-label="Clear manager search text"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <ul
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              className={styles.optionsList}
              aria-label="Reporting manager options"
            >
              {/* None Option */}
              <li
                id={`manager-option-none-${instanceId}`}
                role="option"
                aria-selected={!value}
                className={`${styles.optionItem} ${
                  highlightedIndex === 0 ? styles.optionItemFocused : ''
                }`}
                onClick={() => handleSelect(undefined)}
                onMouseEnter={() => setHighlightedIndex(0)}
              >
                <span className={styles.noneOption}>None (No manager assigned)</span>
                {!value && <Check size={14} aria-hidden="true" />}
              </li>

              {loading && managers.length === 0 ? (
                <li className={styles.emptyResults}>Loading managers...</li>
              ) : managers.length === 0 ? (
                <li className={styles.emptyResults}>No matching managers found</li>
              ) : (
                managers.map((mgr, index) => {
                  const itemIndex = index + 1;
                  const isSelected = value === mgr.id;
                  const isHighlighted = highlightedIndex === itemIndex;

                  return (
                    <li
                      key={mgr.id}
                      id={`manager-option-${mgr.id}`}
                      role="option"
                      aria-selected={isSelected}
                      className={`${styles.optionItem} ${
                        isHighlighted ? styles.optionItemFocused : ''
                      }`}
                      onClick={() => handleSelect(mgr.id)}
                      onMouseEnter={() => setHighlightedIndex(itemIndex)}
                    >
                      <div className={styles.optionContent}>
                        <InitialsAvatar initials={mgr.initials} size="sm" />
                        <div className={styles.optionText}>
                          <span className={styles.optionName}>{mgr.name}</span>
                          <span className={styles.optionMeta}>
                            {mgr.role} · {mgr.department}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check size={14} aria-hidden="true" />}
                    </li>
                  );
                })
              )}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

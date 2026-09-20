import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { fetchManagers } from '@/data/api-client';
import { EmployeeManagerOption } from '@/data/contracts';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import styles from './ManagerCombobox.module.css';

interface ManagerComboboxProps {
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
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Load managers when query or excludeId changes
  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchManagers(query, excludeEmployeeId)
      .then((data) => {
        if (active) {
          setManagers(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.warn('Failed to load managers:', err);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [query, excludeEmployeeId]);

  // Click outside to close
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  // When dropdown opens, focus search input
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const selectedManager = managers.find((m) => m.id === value);

  const handleSelect = (managerId: string | undefined) => {
    onChange(managerId);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const totalItems = managers.length + 1; // +1 for "None"

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex === 0) {
        handleSelect(undefined);
      } else if (highlightedIndex > 0) {
        const mgr = managers[highlightedIndex - 1];
        if (mgr) {
          handleSelect(mgr.id);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={`${styles.trigger} ${ariaInvalid ? styles.triggerError : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="manager-listbox"
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
      >
        {selectedManager ? (
          <div className={styles.selectedInfo}>
            <InitialsAvatar initials={selectedManager.initials} size="sm" />
            <div className={styles.selectedDetails}>
              <span className={styles.selectedName}>{selectedManager.name}</span>
              <span className={styles.selectedRole}>
                {selectedManager.role} · {selectedManager.department}
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

      {isOpen && (
        <div className={styles.dropdown} onKeyDown={handleKeyDown}>
          <div className={styles.searchHeader}>
            <Search size={14} className={styles.searchIcon} aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Search by name, role, or department..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search reporting manager"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                aria-label="Clear manager search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <ul
            ref={listboxRef}
            id="manager-listbox"
            role="listbox"
            className={styles.optionsList}
            aria-label="Reporting manager options"
          >
            {/* None Option */}
            <li
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
        </div>
      )}
    </div>
  );
};

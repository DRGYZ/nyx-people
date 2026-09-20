import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_KEY,
  loadPersistedEmployees,
  savePersistedEmployees,
  EmployeeMockStore,
} from '@/data/mock/store';
import { PersistedEnvelopeV1Schema } from '@/domain/schemas';
import { createBaselineEmployees } from '@/data/mock/fixtures';

describe('Persistence and Domain Envelope Correctness', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Envelope Schema Validation', () => {
    it('accepts a valid version 1 envelope with unique employee IDs', () => {
      const baseline = createBaselineEmployees().slice(0, 3);
      const envelope = {
        version: 1,
        employees: baseline,
      };

      const result = PersistedEnvelopeV1Schema.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it('rejects unsupported schema versions (e.g., version: 2)', () => {
      const baseline = createBaselineEmployees().slice(0, 2);
      const envelope = {
        version: 2,
        employees: baseline,
      };

      const result = PersistedEnvelopeV1Schema.safeParse(envelope);
      expect(result.success).toBe(false);
    });

    it('rejects envelopes containing duplicate employee IDs', () => {
      const baseline = createBaselineEmployees().slice(0, 2);
      const duplicateEmployees = [
        baseline[0]!,
        { ...baseline[1]!, id: baseline[0]!.id },
      ];

      const result = PersistedEnvelopeV1Schema.safeParse({
        version: 1,
        employees: duplicateEmployees,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/duplicate IDs/i);
      }
    });
  });

  describe('loadPersistedEmployees', () => {
    it('returns null when localStorage is empty', () => {
      expect(loadPersistedEmployees()).toBeNull();
    });

    it('returns null and falls back to baseline on corrupt JSON', () => {
      localStorage.setItem(STORAGE_KEY, '{ invalid-json');
      expect(loadPersistedEmployees()).toBeNull();
    });

    it('returns null when stored data has missing or invalid schema fields', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, employees: 'not-an-array' }));
      expect(loadPersistedEmployees()).toBeNull();
    });

    it('returns null when stored payload contains duplicate employee IDs', () => {
      const baseline = createBaselineEmployees().slice(0, 2);
      const corruptPayload = {
        version: 1,
        employees: [baseline[0]!, { ...baseline[1]!, id: baseline[0]!.id }],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(corruptPayload));
      expect(loadPersistedEmployees()).toBeNull();
    });

    it('returns valid employee list when payload conforms to PersistedEnvelopeV1', () => {
      const baseline = createBaselineEmployees().slice(0, 3);
      savePersistedEmployees(baseline);

      const loaded = loadPersistedEmployees();
      expect(loaded).not.toBeNull();
      expect(loaded?.length).toBe(3);
      expect(loaded?.[0]?.id).toBe(baseline[0]?.id);
    });
  });

  describe('Baseline Immutability and Reset', () => {
    it('createBaselineEmployees returns distinct objects using structuredClone', () => {
      const firstCall = createBaselineEmployees();
      const secondCall = createBaselineEmployees();

      expect(firstCall).not.toBe(secondCall);
      expect(firstCall[0]).not.toBe(secondCall[0]);
      expect(firstCall[0]?.person).not.toBe(secondCall[0]?.person);

      // Mutating an object from firstCall does not mutate secondCall
      firstCall[0]!.person.firstName = 'MutatedName';
      expect(secondCall[0]!.person.firstName).not.toBe('MutatedName');
    });

    it('store.resetToBaseline restores clean baseline employees', () => {
      const store = new EmployeeMockStore();
      const emp = store.getEmployeeById('EMP-0102')!;
      expect(emp.person.firstName).toBe('Amelia');

      store.updateEmployee('EMP-0102', { firstName: 'ModifiedAmelia' });
      expect(store.getEmployeeById('EMP-0102')?.person.firstName).toBe('ModifiedAmelia');

      store.resetToBaseline();
      expect(store.getEmployeeById('EMP-0102')?.person.firstName).toBe('Amelia');
    });
  });

  describe('Transactional Store Writes and Rollback', () => {
    it('rolls back in-memory employee mutations if localStorage.setItem throws', () => {
      const store = new EmployeeMockStore();
      const initialEmployee = store.getEmployeeById('EMP-0102')!;
      expect(initialEmployee.employment.jobTitle).toBe('Product Designer');

      // Mock localStorage.setItem to simulate QuotaExceededError or security failure
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('The quota has been exceeded', 'QuotaExceededError');
      });

      expect(() => {
        store.updateEmployee('EMP-0102', { jobTitle: 'Chief Design Officer' });
      }).toThrow(/quota has been exceeded/i);

      // Verify in-memory state was rolled back and not mutated
      const afterFail = store.getEmployeeById('EMP-0102')!;
      expect(afterFail.employment.jobTitle).toBe('Product Designer');

      setItemSpy.mockRestore();
    });
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isValidCalendarDate } from '@/domain/schemas';
import { getNow, setClock, resetClock } from '@/domain/clock';
import { isStartingSoon } from '@/domain/onboarding';
import { getUpcomingStarts } from '@/domain/overview';
import { Employee } from '@/domain/employee';

describe('Gregorian Calendar Validation, Clock Abstraction, and Overview Starts', () => {
  beforeEach(() => {
    resetClock();
  });

  afterEach(() => {
    resetClock();
  });

  describe('isValidCalendarDate', () => {
    it('accepts valid dates across months and years', () => {
      expect(isValidCalendarDate('2026-09-20')).toBe(true);
      expect(isValidCalendarDate('2026-01-31')).toBe(true);
      expect(isValidCalendarDate('2026-04-30')).toBe(true);
      expect(isValidCalendarDate('2026-12-31')).toBe(true);
    });

    it('correctly handles February in leap years and non-leap years', () => {
      // 2024 is a leap year (divisible by 4)
      expect(isValidCalendarDate('2024-02-29')).toBe(true);

      // 2023, 2025, 2026 are not leap years
      expect(isValidCalendarDate('2023-02-29')).toBe(false);
      expect(isValidCalendarDate('2025-02-29')).toBe(false);
      expect(isValidCalendarDate('2026-02-29')).toBe(false);

      // February 30 and 31 never exist
      expect(isValidCalendarDate('2024-02-30')).toBe(false);
      expect(isValidCalendarDate('2026-02-31')).toBe(false);
    });

    it('rejects day 31 on 30-day months (April, June, September, November)', () => {
      expect(isValidCalendarDate('2026-04-31')).toBe(false);
      expect(isValidCalendarDate('2026-06-31')).toBe(false);
      expect(isValidCalendarDate('2026-09-31')).toBe(false);
      expect(isValidCalendarDate('2026-11-31')).toBe(false);
    });

    it('rejects out of range months and days', () => {
      expect(isValidCalendarDate('2026-00-15')).toBe(false);
      expect(isValidCalendarDate('2026-13-15')).toBe(false);
      expect(isValidCalendarDate('2026-05-00')).toBe(false);
      expect(isValidCalendarDate('2026-05-32')).toBe(false);
    });
  });

  describe('Clock Abstraction', () => {
    it('defaults to dynamic system date when no clock override is active', () => {
      const before = Date.now();
      const clockDate = getNow().getTime();
      const after = Date.now();

      expect(clockDate).toBeGreaterThanOrEqual(before);
      expect(clockDate).toBeLessThanOrEqual(after);
    });

    it('injects fixed reference date and drives time-dependent domain calculations', () => {
      // Set fixed reference clock: 2026-09-20
      setClock(new Date('2026-09-20T12:00:00Z'));
      expect(getNow().toISOString()).toBe('2026-09-20T12:00:00.000Z');

      // Employee starting in 4 days (2026-09-24) is starting soon
      expect(isStartingSoon('2026-09-24')).toBe(true);

      // Employee starting in 30 days (2026-10-20) is not starting soon
      expect(isStartingSoon('2026-10-20')).toBe(false);

      // Reset restores dynamic clock
      resetClock();
      const clockNow = getNow().getTime();
      expect(Math.abs(clockNow - Date.now())).toBeLessThan(1000);
    });
  });

  describe('Overview Upcoming Starts Eligibility', () => {
    it('excludes offboarded and on-leave employees from upcoming starts even if dates match window', () => {
      setClock(new Date('2026-09-20T00:00:00Z'));

      const mockEmployees: Employee[] = [
        {
          id: 'EMP-0001',
          person: { firstName: 'Active', lastName: 'Starter', email: 'active@co.com', phone: '', dateOfBirth: '1990-01-01', address: { street: '', postalCode: '', city: '', country: '' } },
          employment: { jobTitle: 'Dev', department: 'Engineering', location: 'Paris', employmentType: 'full-time', status: 'active', startDate: '2026-09-24' },
          timestamps: { createdAt: '', updatedAt: '' },
        },
        {
          id: 'EMP-0002',
          person: { firstName: 'Onboarding', lastName: 'Starter', email: 'onboarding@co.com', phone: '', dateOfBirth: '1990-01-01', address: { street: '', postalCode: '', city: '', country: '' } },
          employment: { jobTitle: 'Dev', department: 'Engineering', location: 'Paris', employmentType: 'full-time', status: 'onboarding', startDate: '2026-09-25' },
          timestamps: { createdAt: '', updatedAt: '' },
        },
        {
          id: 'EMP-0003',
          person: { firstName: 'Leave', lastName: 'Starter', email: 'leave@co.com', phone: '', dateOfBirth: '1990-01-01', address: { street: '', postalCode: '', city: '', country: '' } },
          employment: { jobTitle: 'Dev', department: 'Engineering', location: 'Paris', employmentType: 'full-time', status: 'leave', startDate: '2026-09-22' },
          timestamps: { createdAt: '', updatedAt: '' },
        },
        {
          id: 'EMP-0004',
          person: { firstName: 'Offboarded', lastName: 'Starter', email: 'offboarded@co.com', phone: '', dateOfBirth: '1990-01-01', address: { street: '', postalCode: '', city: '', country: '' } },
          employment: { jobTitle: 'Dev', department: 'Engineering', location: 'Paris', employmentType: 'full-time', status: 'offboarded', startDate: '2026-09-22' },
          timestamps: { createdAt: '', updatedAt: '' },
        },
      ];

      const upcoming = getUpcomingStarts(mockEmployees);
      const ids = upcoming.map((item) => item.id);

      expect(ids).toContain('EMP-0001');
      expect(ids).toContain('EMP-0002');
      expect(ids).not.toContain('EMP-0003');
      expect(ids).not.toContain('EMP-0004');
    });
  });
});

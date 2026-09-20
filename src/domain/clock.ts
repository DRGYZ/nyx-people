/**
 * Injectable clock abstraction for deterministic testing and runtime date resolution.
 */

export type ClockFn = () => Date;

export const DEFAULT_REFERENCE_DATE = new Date('2026-09-20');

let activeClock: ClockFn = () => new Date();

/**
 * Returns the current date according to the active clock provider.
 * Defaults to current local date/time in production runtime.
 */
export function getNow(): Date {
  return activeClock();
}

/**
 * Injects a custom clock provider or fixed date (primarily for deterministic unit/integration tests).
 */
export function setClock(clockOrDate: ClockFn | Date | string): void {
  if (typeof clockOrDate === 'function') {
    activeClock = clockOrDate;
  } else {
    const fixed = new Date(clockOrDate);
    activeClock = () => new Date(fixed.getTime());
  }
}

/**
 * Resets the clock to standard dynamic local date/time.
 */
export function resetClock(): void {
  activeClock = () => new Date();
}

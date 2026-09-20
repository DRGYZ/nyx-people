export function formatDate(isoDateString: string): string {
  if (!isoDateString) return '—';
  try {
    const [yearStr, monthStr, dayStr] = isoDateString.split('-');
    if (!yearStr || !monthStr || !dayStr) {
      return isoDateString;
    }
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    const date = new Date(Date.UTC(year, month, day));
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  } catch {
    return isoDateString;
  }
}

export function formatFullDate(isoDateString: string): string {
  if (!isoDateString) return '—';
  try {
    const [yearStr, monthStr, dayStr] = isoDateString.split('-');
    if (!yearStr || !monthStr || !dayStr) {
      return isoDateString;
    }
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    const date = new Date(Date.UTC(year, month, day));
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  } catch {
    return isoDateString;
  }
}

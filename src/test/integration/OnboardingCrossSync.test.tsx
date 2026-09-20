import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/utils';
import { mockStore } from '@/data/mock/store';

describe('Onboarding Cross-App Synchronization', () => {
  beforeEach(() => {
    mockStore.resetToBaseline();
  });

  it('reflects task completion across Onboarding, Profile, and Directory', async () => {
    const user = userEvent.setup();

    // 1. Visit onboarding checklist for Noah Williams
    const { unmount } = renderWithRouter(undefined, {
      initialEntries: ['/employees/EMP-0941/onboarding'],
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeInTheDocument();
    });

    expect(screen.getByText(/4 of 6 complete · 67%/)).toBeInTheDocument();

    // Toggle 'Account provisioned'
    const accountCheckbox = screen.getByRole('checkbox', { name: /account provisioned/i });
    await user.click(accountCheckbox);

    await waitFor(() => {
      expect(screen.getByText(/5 of 6 complete · 83%/)).toBeInTheDocument();
    });

    unmount();

    // 2. Visit Noah's Profile page
    const { unmount: unmountProfile } = renderWithRouter(undefined, {
      initialEntries: ['/employees/EMP-0941'],
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeInTheDocument();
    });

    // Profile onboarding checklist should show 5 of 6 complete!
    expect(screen.getByText('5 of 6 complete')).toBeInTheDocument();

    unmountProfile();

    // 3. Visit Directory page
    renderWithRouter(undefined, {
      initialEntries: ['/employees?q=Noah'],
    });

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('Noah Williams')).toBeInTheDocument();
    });

    const table = screen.getByRole('table');
    // Directory Onboarding Progress column should show 5 / 6!
    expect(within(table).getByText('5 / 6')).toBeInTheDocument();
  });
});

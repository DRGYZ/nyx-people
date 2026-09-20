import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/utils';
import { mockStore } from '@/data/mock/store';

describe('EmployeeOnboardingPage Integration', () => {
  beforeEach(() => {
    mockStore.resetToBaseline();
  });

  it('renders employee checklist for Noah Williams with 4 completed and 2 incomplete tasks', async () => {
    renderWithRouter(undefined, {
      initialEntries: ['/employees/EMP-0941/onboarding'],
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeInTheDocument();
    });

    // Header info
    expect(screen.getByText('Back to Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();

    // Progress card
    expect(screen.getByText(/4 of 6 complete · 67%/)).toBeInTheDocument();

    // Checklist tasks
    expect(screen.getByRole('heading', { level: 2, name: 'Operational Readiness Tasks' })).toBeInTheDocument();
    expect(screen.getByText('Personal details')).toBeInTheDocument();
    expect(screen.getByText('Contract received')).toBeInTheDocument();
    expect(screen.getByText('Equipment requested')).toBeInTheDocument();
    expect(screen.getByText('First-day plan')).toBeInTheDocument();
    expect(screen.getByText('Account provisioned')).toBeInTheDocument();
    expect(screen.getByText('Manager introduction')).toBeInTheDocument();

    // Checkbox states
    const accountCheckbox = screen.getByRole('checkbox', { name: /account provisioned/i });
    expect(accountCheckbox).toHaveAttribute('aria-checked', 'false');

    const contractCheckbox = screen.getByRole('checkbox', { name: /contract received/i });
    expect(contractCheckbox).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles an incomplete task to completed and updates progress fraction and percentage', async () => {
    const user = userEvent.setup();
    renderWithRouter(undefined, {
      initialEntries: ['/employees/EMP-0941/onboarding'],
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeInTheDocument();
    });

    const accountCheckbox = screen.getByRole('checkbox', { name: /account provisioned/i });
    expect(accountCheckbox).toHaveAttribute('aria-checked', 'false');

    // Click checkbox to complete task
    await user.click(accountCheckbox);

    // Progress updates to 5 of 6 (83%)
    await waitFor(() => {
      expect(screen.getByText(/5 of 6 complete · 83%/)).toBeInTheDocument();
    });
    expect(accountCheckbox).toHaveAttribute('aria-checked', 'true');

    // Complete the remaining task
    const managerCheckbox = screen.getByRole('checkbox', { name: /manager introduction/i });
    await user.click(managerCheckbox);

    await waitFor(() => {
      expect(screen.getByText(/6 of 6 complete · 100%/)).toBeInTheDocument();
    });
    expect(
      screen.getAllByText(/All onboarding tasks complete\. Day-one readiness achieved\./).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('displays not-found message for invalid employee ID', async () => {
    renderWithRouter(undefined, {
      initialEntries: ['/employees/EMP-999999/onboarding'],
    });

    await waitFor(() => {
      expect(screen.getByText('Onboarding Record Not Found')).toBeInTheDocument();
      expect(
        screen.getByText("No onboarding workflow exists for employee ID 'EMP-999999'.")
      ).toBeInTheDocument();
    });

    const returnBtn = screen.getByRole('link', { name: /return to onboarding/i });
    expect(returnBtn).toHaveAttribute('href', '/onboarding');
  });
});

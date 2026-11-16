import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/utils';
import { mockStore } from '@/data/mock/store';
import { resetClock, setClock } from '@/domain/clock';

describe.each([
  ['2026-11-16', '2026-11-20'],
  ['2027-02-27', '2027-03-03'],
])('Overview Cross-App Synchronization on %s', (referenceDate, upcomingDate) => {
  beforeEach(() => {
    setClock(`${referenceDate}T12:00:00`);
    mockStore.resetToBaseline();
  });

  afterEach(resetClock);

  it('reflects onboarding task completion by removing employee from Needs Attention', async () => {
    const user = userEvent.setup();

    // 1. Start at Overview and verify Noah Williams is present in Needs Attention
    renderWithRouter(undefined, {
      initialEntries: ['/overview'],
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();
    });

    const attentionList = await screen.findByRole('list', { name: /employees requiring immediate attention/i });
    expect(within(attentionList).getByText('Noah Williams')).toBeInTheDocument();
    const noahCard = within(attentionList).getByText('Noah Williams').closest('li')!;
    expect(within(noahCard).getByText(/2 tasks remaining/i)).toBeInTheDocument();

    // 2. Click "View onboarding" to navigate to Noah's checklist
    const viewBtn = screen.getByRole('link', { name: /view onboarding for noah williams/i });
    await user.click(viewBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /noah williams/i })).toBeInTheDocument();
    });

    // 3. Complete both pending tasks
    const accountsCheckbox = screen.getByRole('checkbox', { name: 'Account provisioned' });
    const managerCheckbox = screen.getByRole('checkbox', { name: 'Manager introduction' });

    expect(accountsCheckbox).not.toBeChecked();
    expect(managerCheckbox).not.toBeChecked();

    await user.click(accountsCheckbox);
    await user.click(managerCheckbox);

    // Verify both are now checked
    expect(accountsCheckbox).toBeChecked();
    expect(managerCheckbox).toBeChecked();

    // 4. Navigate back to Overview
    const overviewNavLink = screen.getByRole('link', { name: 'Overview' });
    await user.click(overviewNavLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();
    });

    // Noah Williams is no longer in Needs Attention!
    const updatedAttentionList = await screen.findByRole('list', { name: /employees requiring immediate attention/i });
    expect(within(updatedAttentionList).queryByText('Noah Williams')).not.toBeInTheDocument();
  });

  it('reflects new employee creation in Upcoming Starts, Recently Updated, and Workforce Snapshot', async () => {
    const user = userEvent.setup();

    renderWithRouter(undefined, {
      initialEntries: ['/overview'],
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();
    });

    // Initial headcount is 428
    await screen.findByRole('link', { name: /total headcount: 428 employees/i });

    // Navigate to Employees and create a new employee starting in 4 days
    const employeesNavLink = screen.getByRole('link', { name: 'Employees' });
    await user.click(employeesNavLink);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /add employee/i })).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('link', { name: /add employee/i });
    await user.click(addBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /new employee/i })).toBeInTheDocument();
    });

    // Fill form with valid details
    await user.type(screen.getByLabelText(/first name/i), 'Elena');
    await user.type(screen.getByLabelText(/last name/i), 'Rostova');
    await user.type(screen.getByLabelText(/work email/i), 'elena.rostova@nyxpeople.com');
    await user.type(screen.getByLabelText(/phone number/i), '+33 6 11 22 33 44');
    await user.type(screen.getByLabelText(/date of birth/i), '1992-06-15');
    await user.type(screen.getByLabelText(/street address/i), '12 Rue de Rivoli');
    await user.type(screen.getByLabelText(/city/i), 'Paris');
    await user.type(screen.getByLabelText(/postal code/i), '75004');
    await user.type(screen.getByLabelText(/country/i), 'France');
    await user.type(screen.getByLabelText(/job title/i), 'Staff Security Engineer');

    const startDateInput = screen.getByLabelText(/start date/i);
    await user.clear(startDateInput);
    await user.type(startDateInput, upcomingDate);

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /create employee/i });
    await user.click(submitBtn);

    // Navigates to created profile
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /elena rostova/i })).toBeInTheDocument();
    });

    // Navigate back to Overview
    const overviewLink = screen.getByRole('link', { name: 'Overview' });
    await user.click(overviewLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();
    });

    // 1. Workforce snapshot headcount incremented from 428 to 429
    expect(await screen.findByRole('link', { name: /total headcount: 429 employees/i })).toBeInTheDocument();

    // 2. Upcoming starts includes Elena Rostova
    const upcomingList = screen.getByRole('list', { name: /employees scheduled to start within 14 days/i });
    expect(within(upcomingList).getByText('Elena Rostova')).toBeInTheDocument();
    expect(within(upcomingList).getByText('Staff Security Engineer')).toBeInTheDocument();

    // 3. Recently updated includes Elena Rostova at the top with "Updated today"
    const recentList = screen.getByRole('list', { name: /recently updated employee records/i });
    expect(within(recentList).getByText('Elena Rostova')).toBeInTheDocument();
    expect(within(recentList).getAllByText('Updated today').length).toBeGreaterThanOrEqual(1);
  });
});

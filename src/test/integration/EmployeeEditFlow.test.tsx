import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/utils';
import { mockStore } from '@/data/mock/store';

describe('Employee Edit Flow Integration', () => {
  beforeEach(() => {
    mockStore.resetToBaseline();
  });

  it('loads existing employee data into the edit form', async () => {
    renderWithRouter(undefined, { initialEntries: ['/employees/EMP-0941/edit'] });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edit noah williams/i })).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
    const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/work email/i) as HTMLInputElement;
    const jobTitleInput = screen.getByLabelText(/job title/i) as HTMLInputElement;

    expect(firstNameInput.value).toBe('Noah');
    expect(lastNameInput.value).toBe('Williams');
    expect(emailInput.value).toBe('noah@company.com');
    expect(jobTitleInput.value).toBe('Frontend Engineer');
  });

  it('shows unsaved changes warning when user edits a field', async () => {
    const user = userEvent.setup();
    renderWithRouter(undefined, { initialEntries: ['/employees/EMP-0941/edit'] });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edit noah williams/i })).toBeInTheDocument();
    });

    expect(screen.queryByText(/unsaved modifications in progress/i)).not.toBeInTheDocument();

    const jobTitleInput = screen.getByLabelText(/job title/i);
    await user.type(jobTitleInput, ' Senior');

    expect(screen.getByText(/unsaved modifications in progress/i)).toBeInTheDocument();
  });

  it('updates employee details and navigates back to profile with updated information', async () => {
    const user = userEvent.setup();
    renderWithRouter(undefined, { initialEntries: ['/employees/EMP-0941/edit'] });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edit noah williams/i })).toBeInTheDocument();
    });

    const jobTitleInput = screen.getByLabelText(/job title/i);
    await user.clear(jobTitleInput);
    await user.type(jobTitleInput, 'Principal Systems Engineer');

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitBtn);

    // Should redirect to profile page /employees/EMP-0941
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /noah williams/i })).toBeInTheDocument();
    });

    expect(screen.getAllByText(/principal systems engineer/i).length).toBeGreaterThanOrEqual(1);
  });

  it('displays not found message for non-existent employee ID', async () => {
    renderWithRouter(undefined, { initialEntries: ['/employees/EMP-9999/edit'] });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /employee not found/i })).toBeInTheDocument();
    });
  });
});

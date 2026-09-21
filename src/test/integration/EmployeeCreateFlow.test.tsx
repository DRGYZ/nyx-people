import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/utils';
import { mockStore } from '@/data/mock/store';

describe('Employee Create Flow Integration', () => {
  beforeEach(() => {
    mockStore.resetToBaseline();
  });

  it('renders employee creation form with all required sections and fields', async () => {
    renderWithRouter(undefined, { initialEntries: ['/employees/new'] });

    expect(screen.getByRole('heading', { name: /add new employee/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /personal information/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /contact & location/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /employment/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
  });

  it('displays error summary at top and focuses input when error link is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(undefined, { initialEntries: ['/employees/new'] });

    // Click submit without entering required data
    const submitBtn = screen.getByRole('button', { name: /create employee/i });
    await user.click(submitBtn);

    // Wait for Error Summary to appear
    const alertHeading = await screen.findByRole('heading', {
      name: /errors with your submission/i,
    });
    expect(alertHeading).toBeInTheDocument();

    // Verify error link exists and focuses input
    const firstNameErrorLink = screen.getByRole('link', { name: /first name is required/i });
    expect(firstNameErrorLink).toBeInTheDocument();

    await user.click(firstNameErrorLink);
    const firstNameInput = screen.getByLabelText(/first name/i);
    expect(document.activeElement).toBe(firstNameInput);
  });

  it('successfully creates an employee and navigates to the employee profile', async () => {
    const user = userEvent.setup();
    renderWithRouter(undefined, { initialEntries: ['/employees/new'] });

    // Fill form
    await user.type(screen.getByLabelText(/first name/i), 'Donna');
    await user.type(screen.getByLabelText(/last name/i), 'Noble');
    await user.type(screen.getByLabelText(/work email/i), 'donna.noble@nyxpeople.com');
    await user.type(screen.getByLabelText(/phone number/i), '+44 20 7946 0192');
    await user.type(screen.getByLabelText(/date of birth/i), '1990-04-12');
    await user.type(screen.getByLabelText(/street address/i), '42 Chiswick High Road');
    await user.type(screen.getByLabelText(/city/i), 'London');
    await user.type(screen.getByLabelText(/postal code/i), 'W4 1PR');
    await user.type(screen.getByLabelText(/country/i), 'United Kingdom');
    await user.type(screen.getByLabelText(/job title/i), 'Executive Operations Lead');

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /create employee/i });
    await user.click(submitBtn);

    // Should navigate to profile with Donna Noble's name
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /donna noble/i })).toBeInTheDocument();
    });

    expect(screen.getAllByText(/executive operations lead/i).length).toBeGreaterThanOrEqual(1);
  });

  it('displays server error banner when email is already registered', async () => {
    const user = userEvent.setup();
    renderWithRouter(undefined, { initialEntries: ['/employees/new'] });

    // Use Noah Williams' email (noah@company.com)
    await user.type(screen.getByLabelText(/first name/i), 'Imposter');
    await user.type(screen.getByLabelText(/last name/i), 'Noah');
    await user.type(screen.getByLabelText(/work email/i), 'noah@company.com');
    await user.type(screen.getByLabelText(/phone number/i), '+33 1 42 68 55 99');
    await user.type(screen.getByLabelText(/date of birth/i), '1995-02-14');
    await user.type(screen.getByLabelText(/street address/i), '10 Rue de Rivoli');
    await user.type(screen.getByLabelText(/city/i), 'Paris');
    await user.type(screen.getByLabelText(/postal code/i), '75001');
    await user.type(screen.getByLabelText(/country/i), 'France');
    await user.type(screen.getByLabelText(/job title/i), 'Software Engineer');

    const submitBtn = screen.getByRole('button', { name: /create employee/i });
    await user.click(submitBtn);

    // Expect server error alert
    await waitFor(() => {
      expect(screen.getByText(/already registered/i)).toBeInTheDocument();
    });
  });
});

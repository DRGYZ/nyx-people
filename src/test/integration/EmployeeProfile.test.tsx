import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/utils';

describe('EmployeeProfile Integration', () => {
  it('renders complete profile for Noah Williams matching the approved mockup', async () => {
    renderWithRouter(undefined, {
      initialEntries: ['/employees/EMP-0941'],
    });

    // Wait for MSW response
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeInTheDocument();
    });

    // Subtitle & role
    expect(screen.getAllByText(/Frontend Engineer/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Paris/).length).toBeGreaterThanOrEqual(1);

    // Needs attention banner
    expect(screen.getByText(/Needs attention —/)).toBeInTheDocument();
    expect(
      screen.getByText(/Onboarding is 4 of 6 complete. Account access and manager introduction remain incomplete./)
    ).toBeInTheDocument();

    // Employment section
    expect(screen.getByRole('heading', { level: 2, name: 'Employment' })).toBeInTheDocument();
    expect(screen.getByText('Amelia Carter')).toBeInTheDocument();
    expect(screen.getByText(/full-time/i)).toBeInTheDocument();

    // Contact section
    expect(screen.getByRole('heading', { level: 2, name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByText('noah@company.com')).toBeInTheDocument();
    expect(screen.getByText('+33 1 42 68 55 00')).toBeInTheDocument();

    // Personal info section
    expect(screen.getByRole('heading', { level: 2, name: 'Personal information' })).toBeInTheDocument();
    expect(screen.getByText(/••••••••/)).toBeInTheDocument();
    expect(screen.getByText(/14 Rue de Rivoli/)).toBeInTheDocument();

    // Onboarding checklist
    expect(screen.getByRole('heading', { level: 2, name: 'Onboarding' })).toBeInTheDocument();
    expect(screen.getByText('4 of 6 complete')).toBeInTheDocument();
    expect(screen.getByText('Personal details')).toBeInTheDocument();
    expect(screen.getByText('Contract received')).toBeInTheDocument();
    expect(screen.getByText('Equipment requested')).toBeInTheDocument();
    expect(screen.getByText('First-day plan')).toBeInTheDocument();
    expect(screen.getByText('Account provisioned')).toBeInTheDocument();
    expect(screen.getByText('Manager introduction')).toBeInTheDocument();
    expect(
      screen.getByText(/Amelia Carter is coordinating initial pair-programming arrangements for Noah's first week./)
    ).toBeInTheDocument();

    // Record ref footer
    expect(screen.getByText(/Record ref: EMP-0941 · Paris Bureau/)).toBeInTheDocument();
  });

  it('reveals and hides protected date of birth on toggle', async () => {
    const user = userEvent.setup();
    renderWithRouter(undefined, {
      initialEntries: ['/employees/EMP-0941'],
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeInTheDocument();
    });

    const revealBtn = screen.getByRole('button', { name: /show date of birth/i });
    expect(screen.getByText(/••••••••/)).toBeInTheDocument();

    await user.click(revealBtn);

    expect(screen.getByText('Nov 20, 1995')).toBeInTheDocument();

    const hideBtn = screen.getByRole('button', { name: /hide date of birth/i });
    await user.click(hideBtn);

    expect(screen.getByText(/••••••••/)).toBeInTheDocument();
  });

  it('preserves return directory query params in back link', async () => {
    renderWithRouter(undefined, {
      initialEntries: ['/employees/EMP-0941?department=Engineering&status=onboarding&page=2'],
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeInTheDocument();
    });

    const backLink = screen.getByRole('link', { name: /return to employees directory/i });
    expect(backLink).toHaveAttribute(
      'href',
      '/employees?department=Engineering&status=onboarding&page=2'
    );
  });

  it('displays not-found empty state for non-existent employee ID', async () => {
    renderWithRouter(undefined, {
      initialEntries: ['/employees/EMP-999999'],
    });

    await waitFor(() => {
      expect(screen.getByText('Employee Not Found')).toBeInTheDocument();
      expect(
        screen.getByText("The employee record 'EMP-999999' does not exist in the directory.")
      ).toBeInTheDocument();
    });

    const returnBtn = screen.getByRole('link', { name: /return to employees/i });
    expect(returnBtn).toBeInTheDocument();
  });
});

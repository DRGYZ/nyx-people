import { describe, it, expect } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/utils';

describe('EmployeeDirectory Integration', () => {
  it('renders employee directory header and loads initial employee rows from MSW', async () => {
    renderWithRouter(undefined, { initialEntries: ['/employees'] });

    // Header title and count
    expect(screen.getByRole('heading', { level: 1, name: 'Employees' })).toBeInTheDocument();

    // Wait for data to load from MSW into table
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('Amelia Carter')).toBeInTheDocument();
    });

    const table = screen.getByRole('table');
    expect(within(table).getByText('Noah Williams')).toBeInTheDocument();
    expect(within(table).getByText('Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText(/people across/)).toBeInTheDocument();
    expect(screen.getByText('428')).toBeInTheDocument();
  });

  it('filters employees via search input', async () => {
    const user = userEvent.setup();
    renderWithRouter(undefined, { initialEntries: ['/employees'] });

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('Amelia Carter')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox', {
      name: /search employees by name, email or role/i,
    });

    await user.type(searchInput, 'Noah');

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('Noah Williams')).toBeInTheDocument();
      expect(within(table).queryByText('Amelia Carter')).not.toBeInTheDocument();
    });
  });

  it('switches editorial tabs and filters accordingly', async () => {
    const user = userEvent.setup();
    renderWithRouter(undefined, { initialEntries: ['/employees'] });

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('Amelia Carter')).toBeInTheDocument();
    });

    // Click Onboarding tab
    const onboardingTab = screen.getByRole('button', { name: /onboarding/i });
    await user.click(onboardingTab);

    await waitFor(() => {
      const table = screen.getByRole('table');
      // Noah is onboarding
      expect(within(table).getByText('Noah Williams')).toBeInTheDocument();
      // Amelia is active, so should be filtered out
      expect(within(table).queryByText('Amelia Carter')).not.toBeInTheDocument();
    });
  });

  it('displays empty state when filter returns no matches and allows resetting', async () => {
    const user = userEvent.setup();
    renderWithRouter(undefined, { initialEntries: ['/employees'] });

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('Amelia Carter')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox', {
      name: /search employees by name, email or role/i,
    });

    await user.type(searchInput, 'NonExistentPersonNameXYZ');

    await waitFor(() => {
      expect(screen.getByText('No employees match these filters.')).toBeInTheDocument();
    });

    // Reset filters button in empty state
    const resetBtn = screen.getByRole('button', { name: /reset filters/i });
    await user.click(resetBtn);

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('Amelia Carter')).toBeInTheDocument();
    });
  });

  it('provides a proper profile link containing query context', async () => {
    renderWithRouter(undefined, {
      initialEntries: ['/employees?department=Engineering&status=onboarding'],
    });

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('Noah Williams')).toBeInTheDocument();
    });

    const links = screen.getAllByRole('link', { name: /view profile of noah williams/i });
    expect(links[0]).toHaveAttribute(
      'href',
      '/employees/EMP-0941?department=Engineering&status=onboarding'
    );
  });
});

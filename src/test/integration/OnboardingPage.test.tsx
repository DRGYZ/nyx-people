import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/utils';
import { mockStore } from '@/data/mock/store';

describe('OnboardingPage Integration', () => {
  beforeEach(() => {
    mockStore.resetToBaseline();
  });

  it('renders onboarding workspace with header metrics, tabs, and employee cards', async () => {
    renderWithRouter(undefined, {
      initialEntries: ['/onboarding'],
    });

    // Wait for title and data to load
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Onboarding' })).toBeInTheDocument();
    });

    // Subtitle
    expect(
      screen.getByText(/Track new starters and remaining onboarding tasks/)
    ).toBeInTheDocument();

    // Filter tabs
    expect(screen.getByRole('tab', { name: /all onboardings/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /needs attention/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /starting soon/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /complete/i })).toBeInTheDocument();

    // Verify Noah Williams row is rendered
    expect(screen.getByText('Noah Williams')).toBeInTheDocument();
    expect(screen.getAllByText('4 / 6 complete').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/2 tasks remaining/i).length).toBeGreaterThanOrEqual(1);
  });

  it('filters employees by tab selection', async () => {
    const user = userEvent.setup();
    renderWithRouter(undefined, {
      initialEntries: ['/onboarding'],
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Onboarding' })).toBeInTheDocument();
    });

    const attentionTab = screen.getByRole('tab', { name: /needs attention/i });
    await user.click(attentionTab);

    // Tab becomes selected
    expect(attentionTab).toHaveAttribute('aria-selected', 'true');

    // Noah Williams is in needs attention
    expect(screen.getByText('Noah Williams')).toBeInTheDocument();
  });

  it('links directly to the individual employee checklist', async () => {
    renderWithRouter(undefined, {
      initialEntries: ['/onboarding'],
    });

    await waitFor(() => {
      expect(screen.getByText('Noah Williams')).toBeInTheDocument();
    });

    const openLink = screen.getByRole('link', {
      name: /open onboarding checklist for noah williams/i,
    });
    expect(openLink).toHaveAttribute('href', '/employees/EMP-0941/onboarding');
  });
});

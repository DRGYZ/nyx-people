import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/data/mock/server';
import { renderWithRouter } from '@/test/utils';
import { mockStore } from '@/data/mock/store';

describe('OverviewPage Integration', () => {
  beforeEach(() => {
    mockStore.resetToBaseline();
  });

  it('renders all four operational overview sections with live data', async () => {
    renderWithRouter(undefined, {
      initialEntries: ['/overview'],
    });

    // Wait for Overview header to render
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Operational priorities, upcoming employee arrivals, and organization activity at a glance/)
    ).toBeInTheDocument();

    // 1. Needs attention section
    const attentionHeading = screen.getByRole('heading', { level: 2, name: 'Needs attention' });
    expect(attentionHeading).toBeInTheDocument();

    const attentionList = screen.getByRole('list', { name: /employees requiring immediate attention/i });
    expect(within(attentionList).getByText('Noah Williams')).toBeInTheDocument();
    
    const noahCard = within(attentionList).getByText('Noah Williams').closest('li')!;
    expect(within(noahCard).getByText(/2 tasks remaining/i)).toBeInTheDocument();
    expect(within(noahCard).getByText('Account provisioned')).toBeInTheDocument();
    expect(within(noahCard).getByText('Manager introduction')).toBeInTheDocument();

    const viewOnboardingLink = screen.getByRole('link', { name: /view onboarding for noah williams/i });
    expect(viewOnboardingLink).toHaveAttribute('href', '/employees/EMP-0941/onboarding');

    const viewAllOnboardingLink = screen.getByRole('link', { name: /view all onboarding/i });
    expect(viewAllOnboardingLink).toHaveAttribute('href', '/onboarding?view=attention');

    // 2. Upcoming starts section
    const upcomingHeading = screen.getByRole('heading', { level: 2, name: 'Upcoming starts' });
    expect(upcomingHeading).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view new starters/i })).toHaveAttribute(
      'href',
      '/employees?view=new-starters'
    );

    // 3. Workforce snapshot section
    const snapshotHeading = screen.getByRole('heading', { level: 2, name: 'Workforce snapshot' });
    expect(snapshotHeading).toBeInTheDocument();

    // Check link destinations in snapshot
    expect(screen.getByRole('link', { name: /total headcount: 428 employees/i })).toHaveAttribute(
      'href',
      '/employees'
    );
    expect(screen.getByRole('link', { name: /in onboarding: 6 employees/i })).toHaveAttribute(
      'href',
      '/onboarding'
    );

    // 4. Recently updated section
    const recentHeading = screen.getByRole('heading', { level: 2, name: 'Recently updated' });
    expect(recentHeading).toBeInTheDocument();
  });

  it('displays empty state when no employees need attention', async () => {
    // Complete all tasks for all onboarding employees in mockStore
    const onboardingItems = mockStore.getOnboardingList('all').data;
    for (const item of onboardingItems) {
      for (const t of item.employee.onboarding?.tasks || []) {
        mockStore.updateOnboardingTask(item.employee.id, t.id as any, true);
      }
    }

    renderWithRouter(undefined, {
      initialEntries: ['/overview'],
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();
    });

    expect(
      screen.getByText('Nothing needs attention right now. All active onboardings are on track.')
    ).toBeInTheDocument();
  });

  it('displays error banner with retry option when overview request fails', async () => {
    // Intercept overview endpoint to simulate a server failure
    server.use(
      http.get('/api/overview', () => {
        return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
      })
    );

    renderWithRouter(undefined, {
      initialEntries: ['/overview'],
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/We could not load the overview|Failed to fetch/i)).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    // Reset handlers to restore normal server response
    server.resetHandlers();

    const user = userEvent.setup();
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Needs attention' })).toBeInTheDocument();
    });
  });
});

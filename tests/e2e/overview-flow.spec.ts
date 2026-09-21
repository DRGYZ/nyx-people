import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('People Operations Workspace — Milestone 4 Operational Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employees');
    await page.evaluate(() => {
      try {
        window.localStorage.clear();
      } catch {
        // ignore
      }
    });
  });

  test('FLOW 1: Overview navigation, redirect from root, section verification, and Needs Attention resolution', async ({
    page,
  }) => {
    // 1. Root route redirects to /overview
    await page.goto('/');
    await expect(page).toHaveURL(/\/overview/);

    // Verify Overview header
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();
    await expect(
      page.getByText('Operational priorities, upcoming employee arrivals, and organization activity at a glance.')
    ).toBeVisible();

    // Verify Top Nav has Overview marked active
    const overviewNavLink = page.getByRole('link', { name: 'Overview', exact: true });
    await expect(overviewNavLink).toBeVisible();

    // 2. Verify all four operational sections
    // Section 1: Needs attention
    const attentionHeading = page.getByRole('heading', { level: 2, name: 'Needs attention' });
    await expect(attentionHeading).toBeVisible();

    const attentionList = page.getByRole('list', { name: 'Employees requiring immediate attention' });
    await expect(attentionList).toBeVisible();
    const noahCard = attentionList.getByRole('listitem').filter({ hasText: 'Noah Williams' });
    await expect(noahCard).toBeVisible();
    await expect(noahCard.getByText('Account provisioned')).toBeVisible();
    await expect(noahCard.getByText('Manager introduction')).toBeVisible();

    const viewAllOnboarding = page.getByRole('link', { name: /view all onboarding/i });
    await expect(viewAllOnboarding).toHaveAttribute('href', '/onboarding?view=attention');

    // Section 2: Upcoming starts
    const upcomingHeading = page.getByRole('heading', { level: 2, name: 'Upcoming starts' });
    await expect(upcomingHeading).toBeVisible();
    const upcomingList = page.getByRole('list', { name: 'Employees scheduled to start within 14 days' });
    await expect(upcomingList).toBeVisible();
    const viewNewStarters = page.getByRole('link', { name: /view new starters/i });
    await expect(viewNewStarters).toHaveAttribute('href', '/employees?view=new-starters');

    // Section 3: Workforce snapshot
    const snapshotHeading = page.getByRole('heading', { level: 2, name: 'Workforce snapshot' });
    await expect(snapshotHeading).toBeVisible();
    await expect(page.getByRole('link', { name: /total headcount: 428 employees/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /in onboarding: 6 employees/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /departments: 8 active teams/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contractors: 28 active contractors/i })).toBeVisible();

    // Section 4: Recently updated
    const recentHeading = page.getByRole('heading', { level: 2, name: 'Recently updated' });
    await expect(recentHeading).toBeVisible();
    const recentList = page.getByRole('list', { name: 'Recently updated employee records' });
    await expect(recentList).toBeVisible();

    // 3. Resolve Noah Williams's attention items
    const viewNoahOnboarding = attentionList.getByRole('link', {
      name: /view onboarding for noah williams/i,
    });
    await expect(viewNoahOnboarding).toBeVisible();
    await viewNoahOnboarding.click();

    await expect(page).toHaveURL(/\/employees\/EMP-0941\/onboarding/);
    await expect(page.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeVisible();

    // Complete "Account provisioned"
    const accountsCheckbox = page.getByRole('checkbox', { name: 'Account provisioned' });
    await expect(accountsCheckbox).toHaveAttribute('aria-checked', 'false');
    const patchResp1 = page.waitForResponse(
      (resp) => resp.url().includes('/api/onboarding') && resp.request().method() === 'PATCH'
    );
    await accountsCheckbox.click();
    await patchResp1;
    await expect(accountsCheckbox).toHaveAttribute('aria-checked', 'true');

    // Complete "Manager introduction"
    const managerCheckbox = page.getByRole('checkbox', { name: 'Manager introduction' });
    await expect(managerCheckbox).toHaveAttribute('aria-checked', 'false');
    const patchResp2 = page.waitForResponse(
      (resp) => resp.url().includes('/api/onboarding') && resp.request().method() === 'PATCH'
    );
    await managerCheckbox.click();
    await patchResp2;
    await expect(managerCheckbox).toHaveAttribute('aria-checked', 'true');

    // 4. Return to Overview and verify Noah is no longer in Needs Attention
    await overviewNavLink.click();
    await expect(page).toHaveURL(/\/overview/);

    const updatedAttentionList = page.getByRole('list', { name: 'Employees requiring immediate attention' });
    await expect(updatedAttentionList.getByText('Noah Williams')).not.toBeAttached();
  });

  test('FLOW 2: Create employee and verify reflection across Upcoming Starts, Recently Updated, and Snapshot', async ({
    page,
  }) => {
    // 1. Visit Overview and check baseline headcount
    await page.goto('/overview');
    await expect(page.getByRole('link', { name: /total headcount: 428 employees/i })).toBeVisible();

    // 2. Navigate to create employee
    const employeesNav = page.getByRole('link', { name: 'Employees', exact: true });
    await employeesNav.click();
    await expect(page).toHaveURL(/\/employees/);

    const addBtn = page.getByRole('link', { name: /add employee/i });
    await addBtn.click();
    await expect(page).toHaveURL(/\/employees\/new/);

    // 3. Fill form
    await page.getByLabel('First name *').fill('Camille');
    await page.getByLabel('Last name *').fill('Laurent');
    await page.getByLabel('Work email *').fill('camille.laurent@nyxpeople.com');
    await page.getByLabel('Phone number *').fill('+33 6 99 88 77 66');
    await page.getByLabel('Date of birth *').fill('1991-03-22');
    await page.getByLabel('Street address *').fill('10 Boulevard Haussmann');
    await page.getByLabel('City *').fill('Paris');
    await page.getByLabel('Postal code *').fill('75009');
    await page.getByLabel('Country *').fill('France');
    await page.getByLabel('Job title *').fill('Director of Talent');

    // Start date in 4 days from reference date (2026-09-24)
    const startDateInput = page.getByLabel('Start date *');
    await startDateInput.fill('2026-09-24');

    // Submit
    const submitBtn = page.getByRole('button', { name: /create employee/i });
    const postResp = page.waitForResponse(
      (resp) => resp.url().includes('/api/employees') && resp.request().method() === 'POST'
    );
    await submitBtn.click();
    await postResp;

    // Navigated to employee profile
    await expect(page).toHaveURL(/\/employees\/EMP-/);
    await expect(page.getByRole('heading', { level: 1, name: 'Camille Laurent' })).toBeVisible();

    // 4. Return to Overview and check all updates
    const overviewNav = page.getByRole('link', { name: 'Overview', exact: true });
    await overviewNav.click();
    await expect(page).toHaveURL(/\/overview/);

    // Headcount incremented
    await expect(page.getByRole('link', { name: /total headcount: 429 employees/i })).toBeVisible();

    // Upcoming starts includes Camille Laurent
    const upcomingList = page.getByRole('list', { name: 'Employees scheduled to start within 14 days' });
    await expect(upcomingList.getByText('Camille Laurent')).toBeVisible();
    await expect(upcomingList.getByText('Director of Talent')).toBeVisible();

    // Recently updated includes Camille Laurent with "Updated today"
    const recentList = page.getByRole('list', { name: 'Recently updated employee records' });
    await expect(recentList.getByText('Camille Laurent')).toBeVisible();
    await expect(recentList.getByText('Updated today').first()).toBeVisible();
  });

  test('WCAG 2.2 AA Accessibility audit and mobile responsive layout', async ({ page }) => {
    // 1. Audit /overview
    await page.goto('/overview');
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();

    const overviewAxeResults = await new AxeBuilder({ page }).analyze();
    expect(overviewAxeResults.violations).toEqual([]);

    // 2. Mobile viewport check (375x667 iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/overview');
    await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();

    // Verify main sections remain legible and visible on mobile
    await expect(page.getByRole('heading', { level: 2, name: 'Needs attention' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Upcoming starts' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Workforce snapshot' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Recently updated' })).toBeVisible();

    // Verify no horizontal scrolling on body
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});

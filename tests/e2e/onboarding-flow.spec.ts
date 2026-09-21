import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('People Operations Workspace — Milestone 3 Onboarding Workflows', () => {
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

  test('FLOW 1: Onboarding workspace, filtering, task toggling, and cross-application synchronization', async ({
    page,
  }) => {
    // 1. Navigate via top shell navigation to Onboarding
    await page.goto('/employees');
    const onboardingNavLink = page.getByRole('link', { name: 'Onboarding', exact: true });
    await expect(onboardingNavLink).toBeVisible();
    await onboardingNavLink.click();

    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.getByRole('heading', { level: 1, name: 'Onboarding' })).toBeVisible();

    // 2. Filter tabs: click "Needs attention"
    const attentionTab = page.getByRole('tab', { name: /needs attention/i });
    await expect(attentionTab).toBeVisible();
    await attentionTab.click();

    await expect(page).toHaveURL(/view=attention/);
    await expect(attentionTab).toHaveAttribute('aria-selected', 'true');

    // Verify Noah Williams appears in needs attention
    await expect(page.getByText('Noah Williams')).toBeVisible();

    // 3. Open Noah Williams checklist
    const openNoahChecklist = page.getByRole('link', {
      name: /open onboarding checklist for noah williams/i,
    });
    await expect(openNoahChecklist).toBeVisible();
    await openNoahChecklist.click();

    await expect(page).toHaveURL(/\/employees\/EMP-0941\/onboarding/);
    await expect(page.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeVisible();

    // Verify progress card initial state: 4 of 6 complete
    await expect(page.getByText(/4 of 6 complete/)).toBeVisible();

    // Verify all 6 canonical tasks are listed
    const checklist = page.getByRole('list', { name: /operational readiness checklist/i });
    await expect(checklist.getByText('Personal details')).toBeVisible();
    await expect(checklist.getByText('Contract received')).toBeVisible();
    await expect(checklist.getByText('Equipment requested')).toBeVisible();
    await expect(checklist.getByText('First-day plan')).toBeVisible();
    await expect(checklist.getByText('Account provisioned')).toBeVisible();
    await expect(checklist.getByText('Manager introduction')).toBeVisible();

    // 4. Toggle incomplete task "Account provisioned"
    const accountCheckbox = page.getByRole('checkbox', { name: /account provisioned/i });
    await expect(accountCheckbox).toHaveAttribute('aria-checked', 'false');
    const patchResponse1 = page.waitForResponse(
      (resp) => resp.url().includes('/api/onboarding') && resp.request().method() === 'PATCH'
    );
    await accountCheckbox.click();
    await patchResponse1;

    // Progress updates to 5 of 6
    await expect(page.getByText(/5 of 6 complete/)).toBeVisible();
    await expect(accountCheckbox).toHaveAttribute('aria-checked', 'true');
    await expect(accountCheckbox).toBeEnabled();

    // 5. Navigate to Noah's employee profile via the header link
    const profileLink = page.getByRole('link', { name: /view employee profile/i });
    await expect(profileLink).toBeVisible();
    await profileLink.click();

    await expect(page).toHaveURL(/\/employees\/EMP-0941$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeVisible();

    // Verify Profile onboarding card reflects updated 5 of 6 tasks
    await expect(page.getByText('5 of 6 complete', { exact: true })).toBeVisible();

    // Verify "Manage checklist" link on profile page
    const manageLink = page.getByRole('link', { name: /manage onboarding checklist/i });
    await expect(manageLink).toBeVisible();

    // 6. Navigate to Directory and verify progress column
    await page.goto('/employees?q=Noah');
    const isMobile = await page.evaluate(() => window.innerWidth <= 768);

    if (!isMobile) {
      const table = page.getByRole('table');
      await expect(table.getByText('Noah Williams')).toBeVisible();
      await expect(table.getByText('5 / 6')).toBeVisible();
    } else {
      const mobileFeed = page.getByRole('feed', { name: 'Employees list' });
      await expect(mobileFeed.getByText('Noah Williams')).toBeVisible();
    }

    // 7. Verify persistence across page reload
    await page.reload();
    if (!isMobile) {
      const table = page.getByRole('table');
      await expect(table.getByText('Noah Williams')).toBeVisible();
      await expect(table.getByText('5 / 6')).toBeVisible();
    } else {
      const mobileFeed = page.getByRole('feed', { name: 'Employees list' });
      await expect(mobileFeed.getByText('Noah Williams')).toBeVisible();
    }
  });

  test('FLOW 2: Create employee with onboarding status, automatic 6-task initialization, and toggle', async ({
    page,
  }) => {
    // 1. Go to Add employee
    await page.goto('/employees/new');
    await expect(page.getByRole('heading', { level: 1, name: /add new employee/i })).toBeVisible();

    // 2. Fill form
    await page.getByLabel(/first name/i).fill('Lucas');
    await page.getByLabel(/last name/i).fill('Moreau');
    await page.getByLabel(/work email/i).fill('lucas.moreau@nyxpeople.com');
    await page.getByLabel(/phone number/i).fill('+33 1 42 68 55 99');
    await page.getByLabel(/date of birth/i).fill('1994-06-12');
    await page.getByLabel(/street address/i).fill('8 Rue de la Paix');
    await page.getByLabel(/city/i).fill('Paris');
    await page.getByLabel(/postal code/i).fill('75001');
    await page.getByLabel(/country/i).fill('France');
    await page.getByLabel(/job title/i).fill('Systems Engineer');

    // Select status 'onboarding'
    await page.locator('#field-status').click();
    await page.getByRole('option', { name: /onboarding/i }).click();

    // Submit
    const submitBtn = page.getByRole('button', { name: /create employee/i });
    await submitBtn.click();

    // 3. Arrives on profile page
    await expect(page).toHaveURL(/\/employees\/EMP-/);
    await expect(page.getByRole('heading', { level: 1, name: 'Lucas Moreau' })).toBeVisible();

    // Profile shows onboarding card with 0 of 6 complete
    await expect(page.getByText('0 of 6 complete')).toBeVisible();

    // 4. Click "Manage checklist"
    const manageLink = page.getByRole('link', { name: /manage onboarding checklist/i });
    await manageLink.click();

    await expect(page).toHaveURL(/\/employees\/EMP-.*\/onboarding/);
    await expect(page.getByRole('heading', { level: 1, name: 'Lucas Moreau' })).toBeVisible();
    await expect(page.getByText(/0 of 6 complete/)).toBeVisible();

    // Toggle first task
    const personalDetailsCheckbox = page.getByRole('checkbox', { name: /personal details/i });
    await expect(personalDetailsCheckbox).toHaveAttribute('aria-checked', 'false');
    const patchResponse2 = page.waitForResponse(
      (resp) => resp.url().includes('/api/onboarding') && resp.request().method() === 'PATCH'
    );
    await personalDetailsCheckbox.click();
    await patchResponse2;

    await expect(page.getByText(/1 of 6 complete/)).toBeVisible();
    await expect(personalDetailsCheckbox).toHaveAttribute('aria-checked', 'true');
    await expect(personalDetailsCheckbox).toBeEnabled();

    // 5. Reload to verify persistence
    await page.reload();
    await expect(page.getByText(/1 of 6 complete/)).toBeVisible();
  });

  test('WCAG 2.2 AA Accessibility audit and mobile responsive layout', async ({ page }) => {
    // 1. Audit /onboarding
    await page.goto('/onboarding');
    await expect(page.getByRole('heading', { level: 1, name: 'Onboarding' })).toBeVisible();

    const onboardingAxeResults = await new AxeBuilder({ page }).analyze();
    expect(onboardingAxeResults.violations).toEqual([]);

    // 2. Audit /employees/EMP-0941/onboarding
    await page.goto('/employees/EMP-0941/onboarding');
    await expect(page.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeVisible();

    const checklistAxeResults = await new AxeBuilder({ page }).analyze();
    expect(checklistAxeResults.violations).toEqual([]);

    // 3. Mobile viewport check (375x667 iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/onboarding');
    await expect(page.getByRole('heading', { level: 1, name: 'Onboarding' })).toBeVisible();
    await expect(page.getByText('Noah Williams')).toBeVisible();

    // Check checklist page on mobile
    await page.goto('/employees/EMP-0941/onboarding');
    await expect(page.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeVisible();
    await expect(page.getByText('Personal details')).toBeVisible();
  });
});

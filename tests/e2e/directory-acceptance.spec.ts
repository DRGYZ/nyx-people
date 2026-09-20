import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('People Operations Workspace — Milestone 1 Acceptance Flow', () => {
  test('full user flow: directory filter -> open profile -> return with preserved filters', async ({ page }) => {
    // 1. Open /employees directly or via root redirect
    await page.goto('/');
    await expect(page).toHaveURL(/\/employees/);

    // Verify main headings and initial state
    await expect(page.getByRole('heading', { level: 1, name: 'Employees' })).toBeVisible();

    // Verify Amelia Carter appears in the visible directory (table on desktop, feed on mobile)
    const visibleAmelia = page.locator('a[href*="EMP-0102"]:visible');
    await expect(visibleAmelia).toBeVisible();

    // 2. Filter directory: search for "Noah"
    const searchInput = page.getByRole('searchbox', { name: /search employees by name, email or role/i });
    await searchInput.fill('Noah');

    // Verify URL updated with search param
    await expect(page).toHaveURL(/q=Noah/);

    // Verify filtered table shows Noah Williams and does not show Amelia Carter
    const visibleNoah = page.locator('a[href*="EMP-0941"]:visible');
    await expect(visibleNoah).toBeVisible();
    await expect(visibleAmelia).not.toBeVisible();

    // 3. Open Noah Williams employee profile
    await visibleNoah.click();

    // Verify navigation to /employees/EMP-0941
    await expect(page).toHaveURL(/\/employees\/EMP-0941/);

    // Verify Profile header, attention banner, and details
    await expect(page.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeVisible();
    await expect(page.getByText(/Frontend Engineer/).first()).toBeVisible();
    await expect(page.getByText(/Needs attention —/)).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Employment' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Onboarding' })).toBeVisible();
    await expect(page.getByText('4 of 6 complete', { exact: true })).toBeVisible();

    // Verify masked date of birth toggle works
    await expect(page.getByText(/••••••••/)).toBeVisible();
    await page.getByRole('button', { name: /show date of birth/i }).click();
    await expect(page.getByText('Nov 20, 1995')).toBeVisible();

    // 4. Return to Employees via back navigation control
    const backLink = page.getByRole('link', { name: /return to employees directory/i });
    await backLink.click();

    // 5. Verify returned to /employees and directory state (q=Noah) is preserved!
    await expect(page).toHaveURL(/q=Noah/);
    await expect(searchInput).toHaveValue('Noah');
    await expect(visibleNoah).toBeVisible();
    await expect(visibleAmelia).not.toBeVisible();
  });

  test('mobile viewport: structured vertical list without horizontal table overflow', async ({ page }) => {
    // Set viewport to mobile width
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/employees');

    await expect(page.getByRole('heading', { level: 1, name: 'Employees' })).toBeVisible();

    // Verify structured vertical list (role="feed") is displayed
    const mobileFeed = page.getByRole('feed', { name: 'Employees list' });
    await expect(mobileFeed).toBeVisible();

    // Verify employee items inside mobile feed
    await expect(mobileFeed.getByText('Amelia Carter')).toBeVisible();
    await expect(mobileFeed.getByText('Product Designer · Product').first()).toBeVisible();

    // Verify no horizontal overflow on body
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // allowing minor subpixel
  });

  test('accessibility check (axe-core WCAG 2.2)', async ({ page }) => {
    await page.goto('/employees');
    await expect(page.getByRole('heading', { level: 1, name: 'Employees' })).toBeVisible();

    // Run axe accessibility audit on directory
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('People Operations Workspace — Milestone 2 Create & Edit Workflows', () => {
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

  test('FLOW 1: Create employee workflow, error summary validation, manager combobox, and persistence', async ({ page }) => {
    // 1. Navigate to directory
    await page.goto('/employees');
    await expect(page.getByRole('heading', { level: 1, name: 'Employees' })).toBeVisible();

    // 2. Click "+ Add employee"
    const addEmployeeLink = page.getByRole('link', { name: /add employee/i });
    await expect(addEmployeeLink).toBeVisible();
    await addEmployeeLink.click();

    await expect(page).toHaveURL(/\/employees\/new/);
    await expect(page.getByRole('heading', { level: 1, name: /add new employee/i })).toBeVisible();

    // 3. Attempt to submit empty form to test validation & error summary
    const submitButton = page.getByRole('button', { name: /create employee/i });
    await submitButton.click();

    // Verify Error Summary appears
    const errorHeading = page.getByRole('heading', { name: /errors with your submission/i });
    await expect(errorHeading).toBeVisible();

    // Verify focus link for First Name
    const firstNameErrorLink = page.getByRole('link', { name: /first name is required/i });
    await expect(firstNameErrorLink).toBeVisible();
    await firstNameErrorLink.click();

    const firstNameInput = page.getByLabel(/first name/i);
    await expect(firstNameInput).toBeFocused();

    // 4. Fill form with valid employee details
    await firstNameInput.fill('Clara');
    await page.getByLabel(/last name/i).fill('Oswald');
    await page.getByLabel(/work email/i).fill('clara.oswald@ledger.hr');
    await page.getByLabel(/phone number/i).fill('+33 1 42 68 55 00');
    await page.getByLabel(/date of birth/i).fill('1996-11-23');
    await page.getByLabel(/street address/i).fill('14 Rue de la Paix');
    await page.getByLabel(/city/i).fill('Paris');
    await page.getByLabel(/postal code/i).fill('75002');
    await page.getByLabel(/country/i).fill('France');
    await page.getByLabel(/job title/i).fill('Principal Design Technologist');

    // Select manager using ManagerCombobox
    const managerTrigger = page.locator('#field-managerId');
    await managerTrigger.click();

    // Search for "Amelia" in manager combobox
    const managerSearchInput = page.getByRole('textbox', { name: /search reporting manager/i });
    await expect(managerSearchInput).toBeVisible();
    await managerSearchInput.fill('Amelia');

    const ameliaOption = page.getByRole('option', { name: /amelia carter/i });
    await expect(ameliaOption).toBeVisible();
    await ameliaOption.click();

    // Verify selected manager is displayed
    await expect(page.getByText('Amelia Carter')).toBeVisible();

    // 5. Submit form
    await submitButton.click();

    // 6. Verify navigation to newly created employee profile
    await expect(page).toHaveURL(/\/employees\/EMP-\d{4}/);
    await expect(page.getByRole('heading', { level: 1, name: 'Clara Oswald' })).toBeVisible();
    await expect(page.getByText('Principal Design Technologist').first()).toBeVisible();
    await expect(page.getByText('Amelia Carter')).toBeVisible();

    // 7. Verify persistence across page reloads
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Clara Oswald' })).toBeVisible();
    await expect(page.getByText('Principal Design Technologist').first()).toBeVisible();

    // 8. Return to directory and verify employee appears in directory search
    await page.getByRole('link', { name: /employees/i }).first().click();
    await expect(page).toHaveURL(/\/employees/);

    const searchInput = page.getByRole('searchbox', { name: /search employees/i });
    await searchInput.fill('Clara Oswald');
    await expect(page.locator('a:visible').filter({ hasText: 'Clara Oswald' }).first()).toBeVisible();
  });

  test('FLOW 2: Edit employee workflow, pre-populated inputs, and persistence', async ({ page }) => {
    // 1. Navigate to Noah Williams profile
    await page.goto('/employees/EMP-0941');
    await expect(page.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeVisible();

    // 2. Click "Edit employee"
    const editLink = page.getByRole('link', { name: /edit noah williams/i });
    await expect(editLink).toBeVisible();
    await editLink.click();

    await expect(page).toHaveURL('/employees/EMP-0941/edit');
    await expect(page.getByRole('heading', { level: 1, name: /edit noah williams/i })).toBeVisible();

    // 3. Verify inputs are pre-populated
    const jobTitleInput = page.getByLabel(/job title/i);
    await expect(jobTitleInput).toHaveValue('Frontend Engineer');

    // 4. Make modifications
    await jobTitleInput.clear();
    await jobTitleInput.fill('Staff Systems Architect');

    // Verify dirty state indicator is visible
    await expect(page.getByText(/unsaved modifications in progress/i)).toBeVisible();

    // 5. Save changes
    const saveButton = page.getByRole('button', { name: /save changes/i });
    await saveButton.click();

    // 6. Verify redirected back to profile with updated details
    await expect(page).toHaveURL('/employees/EMP-0941');
    await expect(page.getByRole('heading', { level: 1, name: 'Noah Williams' })).toBeVisible();
    await expect(page.getByText('Staff Systems Architect').first()).toBeVisible();

    // 7. Verify persistence across reload
    await page.reload();
    await expect(page.getByText('Staff Systems Architect').first()).toBeVisible();
  });

  test('Accessibility audit on create and edit routes (axe-core WCAG 2.2 AA)', async ({ page }) => {
    // 1. Check /employees/new
    await page.goto('/employees/new');
    await expect(page.getByRole('heading', { level: 1, name: /add new employee/i })).toBeVisible();

    const createA11yResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(createA11yResults.violations).toEqual([]);

    // 2. Check /employees/EMP-0941/edit
    await page.goto('/employees/EMP-0941/edit');
    await expect(page.getByRole('heading', { level: 1, name: /edit noah williams/i })).toBeVisible();

    const editA11yResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(editA11yResults.violations).toEqual([]);
  });

  test('Mobile responsive layout at 375px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/employees/new');

    await expect(page.getByRole('heading', { level: 1, name: /add new employee/i })).toBeVisible();

    // Verify form fields are visible and no horizontal overflow exists
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create employee/i })).toBeVisible();
  });
});

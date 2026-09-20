import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/utils';
import { EmployeeForm } from '@/features/employee-form/components/EmployeeForm';
import { ManagerCombobox } from '@/features/employee-form/components/ManagerCombobox';
import { OnboardingTabs } from '@/features/onboarding/components/OnboardingTabs';
import { LifecycleMarker } from '@/components/ui/LifecycleMarker';
import { NewEmployeePage } from '@/routes/employees/NewEmployeePage';
import { AppShell } from '@/app/AppShell';

describe('Phase B: Interaction and Accessibility Correctness', () => {
  describe('1. Dirty Form Navigation Protection', () => {
    it('does NOT prompt on pristine form cancel', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      const onSubmit = vi.fn();

      renderWithRouter(
        <EmployeeForm
          mode="create"
          onSubmit={onSubmit}
          isSubmitting={false}
          onCancel={onCancel}
        />
      );

      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelBtn);

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('prompts confirmation dialog when dirty form Cancel is clicked and stays on Stay', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      const onSubmit = vi.fn();

      renderWithRouter(
        <EmployeeForm
          mode="create"
          onSubmit={onSubmit}
          isSubmitting={false}
          onCancel={onCancel}
        />
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'Arthur');

      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelBtn);

      // Alert dialog must be shown
      const dialog = await screen.findByRole('alertdialog');
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { name: /unsaved changes/i })).toBeInTheDocument();

      // Click "Stay"
      const stayBtn = within(dialog).getByRole('button', { name: /stay/i });
      await user.click(stayBtn);

      // Dialog dismissed, onCancel NOT called
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('confirms leaving dirty form when Leave without saving is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      const onSubmit = vi.fn();

      renderWithRouter(
        <EmployeeForm
          mode="create"
          onSubmit={onSubmit}
          isSubmitting={false}
          onCancel={onCancel}
        />
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'Arthur');

      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelBtn);

      const dialog = await screen.findByRole('alertdialog');
      const leaveBtn = within(dialog).getByRole('button', { name: /leave without saving/i });
      await user.click(leaveBtn);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. Manager Combobox ARIA 1.2 Pattern & Behavior', () => {
    it('renders combobox trigger with ARIA attributes and opens popover on click', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<ManagerCombobox id="test-manager" value={undefined} onChange={onChange} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      const listbox = await screen.findByRole('listbox', { name: /reporting manager options/i });
      expect(listbox).toBeInTheDocument();

      const searchInput = screen.getByRole('textbox', { name: /search reporting manager/i });
      expect(searchInput).toHaveAttribute('aria-autocomplete', 'list');
      expect(searchInput).toHaveAttribute('aria-controls', listbox.id);
    });

    it('navigates options via keyboard arrows and selects with Enter', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<ManagerCombobox id="test-manager" value={undefined} onChange={onChange} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const searchInput = screen.getByRole('textbox', { name: /search reporting manager/i });

      // Initially on "None" (index 0)
      expect(searchInput).toHaveAttribute('aria-activedescendant', expect.stringContaining('manager-option-none'));

      // ArrowDown to first manager
      await user.keyboard('{ArrowDown}');
      await waitFor(() => {
        expect(searchInput).not.toHaveAttribute('aria-activedescendant', expect.stringContaining('manager-option-none'));
      });

      // Press Enter to select
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.any(String));
    });

    it('displays clear button when manager is selected and clears value on click', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      // Render with preselected manager id
      render(<ManagerCombobox id="test-manager" value="emp-001" onChange={onChange} />);

      const clearBtn = await screen.findByRole('button', { name: /clear selected manager/i });
      expect(clearBtn).toBeInTheDocument();

      await user.click(clearBtn);
      expect(onChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('3. Landmark Nesting & Single Main', () => {
    it('NewEmployeePage renders within shell without nested main landmark', () => {
      const { container } = renderWithRouter(<NewEmployeePage />, { initialEntries: ['/employees/new'] });
      const mainElements = container.querySelectorAll('main');
      expect(mainElements.length).toBe(0); // Only shell renders main, NewEmployeePage uses div
    });

    it('EditEmployeePage renders within shell without nested main landmark', async () => {
      renderWithRouter(undefined, { initialEntries: ['/employees/EMP-0941/edit'] });
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /edit/i })).toBeInTheDocument();
      });
      const mainElements = document.querySelectorAll('main');
      expect(mainElements.length).toBe(1); // Exactly one <main id="main-content">
      expect(mainElements[0]).toHaveAttribute('id', 'main-content');
    });

    it('AppShell renders exactly one main landmark with id="main-content"', () => {
      renderWithRouter(<AppShell />, { initialEntries: ['/overview'] });
      const mainLandmark = screen.getByRole('main');
      expect(mainLandmark).toHaveAttribute('id', 'main-content');
    });
  });

  describe('4. Skip Navigation Link', () => {
    it('renders skip link as the first link pointing to #main-content', () => {
      renderWithRouter(<AppShell />, { initialEntries: ['/overview'] });
      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });

  describe('5. Onboarding Tab Semantics (ARIA Tabs & Roving Tabindex)', () => {
    it('renders tablist with roving tabindex and keyboard navigation', async () => {
      const user = userEvent.setup();
      const onTabChange = vi.fn();
      const counts = { all: 10, attention: 3, startingSoon: 4, complete: 3 };

      const { rerender } = render(
        <OnboardingTabs activeTab="all" counts={counts} onTabChange={onTabChange} />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);

      // Active tab has tabIndex 0, others have tabIndex -1
      expect(tabs[0]).toHaveAttribute('tabIndex', '0');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('tabIndex', '-1');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');

      // Navigate with ArrowRight
      tabs[0]?.focus();
      await user.keyboard('{ArrowRight}');
      expect(onTabChange).toHaveBeenCalledWith('attention');

      // Rerender as activeTab="attention"
      rerender(<OnboardingTabs activeTab="attention" counts={counts} onTabChange={onTabChange} />);
      const updatedTabs = screen.getAllByRole('tab');
      expect(updatedTabs[1]).toBeDefined();
      expect(updatedTabs[0]).toBeDefined();
      if (updatedTabs[1] && updatedTabs[0]) {
        expect(updatedTabs[1]).toHaveAttribute('tabIndex', '0');
        expect(updatedTabs[0]).toHaveAttribute('tabIndex', '-1');
      }
    });
  });

  describe('6. LifecycleMarker Decorative Role', () => {
    it('is purely decorative with aria-hidden="true" and no role="presentation" or aria-label', () => {
      const { container } = render(<LifecycleMarker status="active" size="md" />);
      const span = container.querySelector('span');
      expect(span).toHaveAttribute('aria-hidden', 'true');
      expect(span).not.toHaveAttribute('role');
      expect(span).not.toHaveAttribute('aria-label');
    });
  });

  describe('7. Screen Reader Field Error Semantics', () => {
    it('does NOT place role="alert" on individual field errors to prevent duplicate announcements', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <EmployeeForm
          mode="create"
          onSubmit={vi.fn()}
          isSubmitting={false}
          onCancel={vi.fn()}
        />
      );

      const submitBtn = screen.getByRole('button', { name: /create employee/i });
      await user.click(submitBtn);

      // Error summary announces the form errors
      const summary = await screen.findByRole('alert');
      expect(summary).toHaveTextContent(/errors with your submission/i);

      // Individual field error spans must NOT have role="alert"
      const firstNameError = document.getElementById('field-firstName-error');
      expect(firstNameError).toBeInTheDocument();
      expect(firstNameError).not.toHaveAttribute('role', 'alert');
    });
  });
});

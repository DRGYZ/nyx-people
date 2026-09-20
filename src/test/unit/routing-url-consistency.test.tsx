import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/utils';
import {
  parseDirectorySearchParams,
  canonicalizeDirectorySearchParams,
} from '@/features/employee-directory/utils/directory-query';
import { mockStore } from '@/data/mock/store';
import { ApiError, isAbortError, parseApiError } from '@/data/api-client';
import { server } from '@/data/mock/server';
import { http, HttpResponse } from 'msw';

describe('Phase C: Routing, URL State, Request Consistency, and API Contracts', () => {
  describe('1. Resilient Query Parameter Parsing', () => {
    it('preserves valid params when neighboring params are invalid', () => {
      const searchParams = new URLSearchParams({
        department: 'Engineering',
        status: 'active',
        page: 'invalid-number',
        pageSize: '-50',
        sort: 'invalidSort',
        direction: 'invalidDir',
        view: 'invalidView',
      });

      const parsed = parseDirectorySearchParams(searchParams);

      // Valid parameters preserved
      expect(parsed.department).toBe('Engineering');
      expect(parsed.status).toBe('active');

      // Invalid parameters gracefully fell back to safe defaults
      expect(parsed.page).toBe(1);
      expect(parsed.pageSize).toBe(25);
      expect(parsed.sortBy).toBe('default');
      expect(parsed.sortDir).toBe('asc');
      expect(parsed.view).toBe('all');
    });

    it('parses legacy and alternative parameter names correctly', () => {
      const searchParams = new URLSearchParams({
        q: 'Sarah',
        sort: 'department',
        direction: 'desc',
        type: 'contractor',
      });

      const parsed = parseDirectorySearchParams(searchParams);

      expect(parsed.q).toBe('Sarah');
      expect(parsed.sortBy).toBe('department');
      expect(parsed.sortDir).toBe('desc');
      expect(parsed.employmentType).toBe('contractor');
    });
  });

  describe('2. Canonical Search Params and URL Normalization', () => {
    it('strips redundant defaults to keep URLs clean', () => {
      const searchParams = new URLSearchParams({
        department: 'all',
        status: 'all',
        employmentType: 'all',
        view: 'all',
        sortBy: 'default',
        sortDir: 'asc',
        page: '1',
        pageSize: '25',
      });

      const { canonicalSearchParams, isCanonical } = canonicalizeDirectorySearchParams(searchParams);

      expect(isCanonical).toBe(false);
      expect(canonicalSearchParams.toString()).toBe('');
    });

    it('clamps page exceeding maxPage during canonicalization', () => {
      const searchParams = new URLSearchParams({
        department: 'Engineering',
        page: '999',
      });

      const { canonicalParams, canonicalSearchParams, isCanonical } = canonicalizeDirectorySearchParams(
        searchParams,
        5
      );

      expect(isCanonical).toBe(false);
      expect(canonicalParams.page).toBe(5);
      expect(canonicalSearchParams.get('page')).toBe('5');
      expect(canonicalSearchParams.get('department')).toBe('Engineering');
    });

    it('identifies already canonical query strings as canonical', () => {
      const searchParams = new URLSearchParams({
        department: 'Engineering',
        page: '2',
      });

      const { isCanonical } = canonicalizeDirectorySearchParams(searchParams, 5);
      expect(isCanonical).toBe(true);
    });
  });

  describe('3. Store Safe Pagination Clamping', () => {
    it('clamps page=999 to max page without returning empty slice when total > 0', () => {
      const result = mockStore.getEmployees({ page: 999, pageSize: 10 });

      expect(result.page).toBe(result.totalPages);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it('clamps negative or zero page to page 1', () => {
      const result = mockStore.getEmployees({ page: -3, pageSize: 10 });

      expect(result.page).toBe(1);
      expect(result.data.length).toBe(10);
    });
  });

  describe('4. Honest 404 Route Handling', () => {
    it('renders accessible 404 page for unmatched routes with links to Overview and Employees', async () => {
      renderWithRouter(undefined, { initialEntries: ['/unknown-route-that-does-not-exist'] });

      // Page heading
      const heading = screen.getByRole('heading', { level: 1, name: /page not found/i });
      expect(heading).toBeInTheDocument();

      // Explanatory message
      expect(
        screen.getByText(/the page you're looking for doesn't exist or may have been moved/i)
      ).toBeInTheDocument();

      // Navigation links
      const overviewLink = screen.getByRole('link', { name: /return to overview/i });
      expect(overviewLink).toBeInTheDocument();
      expect(overviewLink).toHaveAttribute('href', '/overview');

      const employeesLink = screen.getByRole('link', { name: /view employees/i });
      expect(employeesLink).toBeInTheDocument();
      expect(employeesLink).toHaveAttribute('href', '/employees');
    });
  });

  describe('5. API Error Contracts & Structured Error Parsing', () => {
    it('parses structured API error with code, field, and message', async () => {
      const mockResponse = new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: "Field 'completed' must be a boolean",
            field: 'completed',
          },
          statusCode: 400,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );

      const parsedError = await parseApiError(mockResponse, 'Default error');

      expect(parsedError).toBeInstanceOf(ApiError);
      expect(parsedError.statusCode).toBe(400);
      expect(parsedError.code).toBe('VALIDATION_ERROR');
      expect(parsedError.field).toBe('completed');
      expect(parsedError.message).toBe("Field 'completed' must be a boolean");
    });

    it('falls back gracefully to string error and status code', async () => {
      const mockResponse = new Response(
        JSON.stringify({
          error: 'Legacy error format',
          statusCode: 404,
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );

      const parsedError = await parseApiError(mockResponse, 'Default error');

      expect(parsedError).toBeInstanceOf(ApiError);
      expect(parsedError.statusCode).toBe(404);
      expect(parsedError.message).toBe('Legacy error format');
      expect(parsedError.code).toBeUndefined();
    });

    it('correctly identifies AbortError with isAbortError', () => {
      const domAbort = new DOMException('The user aborted a request.', 'AbortError');
      const standardAbort = new Error('AbortError');
      standardAbort.name = 'AbortError';
      const randomError = new Error('Network error');

      expect(isAbortError(domAbort)).toBe(true);
      expect(isAbortError(standardAbort)).toBe(true);
      expect(isAbortError(randomError)).toBe(false);
      expect(isAbortError(null)).toBe(false);
    });

    it('rejects non-boolean completed values in task mutation handler with HTTP 400 VALIDATION_ERROR', async () => {
      const res = await fetch('/api/onboarding/emp-1/tasks/paperwork', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: 'not-a-boolean' }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe('VALIDATION_ERROR');
      expect(json.error.field).toBe('completed');
    });
  });

  describe('6. Task Mutation Serialization and Error Recovery', () => {
    it('disables task buttons while an update is in flight and serializes toggles', async () => {
      const user = userEvent.setup();

      // Seed an employee with onboarding in mockStore
      const emp = mockStore.getEmployees({ pageSize: 1 }).data[0];
      if (!emp) return;

      // Ensure employee has onboarding
      mockStore.updateEmployee(emp.id, {
        status: 'onboarding',
      });

      renderWithRouter(undefined, {
        initialEntries: [`/employees/${emp.id}/onboarding`],
      });

      // Wait for checklist to load
      await waitFor(() => {
        expect(screen.getByRole('list', { name: /operational readiness checklist/i })).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
      const firstCheckbox = checkboxes[0];
      if (!firstCheckbox) return;

      // Delay handler to test in-flight disabled state
      let resolveMutation: () => void = () => {};
      const mutationPromise = new Promise<void>((resolve) => {
        resolveMutation = resolve;
      });

      server.use(
        http.patch('/api/onboarding/:employeeId/tasks/:taskKey', async ({ params, request }) => {
          await mutationPromise;
          const body = (await request.json()) as any;
          const res = mockStore.updateOnboardingTask(
            params.employeeId as string,
            params.taskKey as string,
            body.completed
          );
          return HttpResponse.json(res);
        })
      );

      // Click the first task
      await user.click(firstCheckbox);

      // While in flight, all checkboxes must be disabled to serialize requests
      await waitFor(() => {
        checkboxes.forEach((cb) => {
          expect(cb).toBeDisabled();
        });
      });

      // Complete mutation
      resolveMutation();

      // Checkboxes re-enabled after completion
      await waitFor(() => {
        expect(firstCheckbox).not.toBeDisabled();
      });
    });
  });
});

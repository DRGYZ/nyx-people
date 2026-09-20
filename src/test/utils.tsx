import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { EmployeesPage } from '@/routes/employees/EmployeesPage';
import { EmployeeProfilePage } from '@/routes/employees/EmployeeProfilePage';
import { NewEmployeePage } from '@/routes/employees/NewEmployeePage';
import { EditEmployeePage } from '@/routes/employees/EditEmployeePage';
import { OnboardingPage } from '@/routes/onboarding/OnboardingPage';
import { EmployeeOnboardingPage } from '@/routes/onboarding/EmployeeOnboardingPage';
import { OverviewPage } from '@/routes/overview/OverviewPage';
import { NotFoundPage } from '@/routes/not-found/NotFoundPage';

interface RenderWithRouterOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
}

export function renderWithRouter(
  ui?: React.ReactElement,
  { initialEntries = ['/employees'], ...options }: RenderWithRouterOptions = {}
) {
  const routes = ui
    ? [
        {
          path: '*',
          element: ui,
        },
      ]
    : [
        {
          path: '/',
          element: <AppShell />,
          children: [
            { path: 'overview', element: <OverviewPage /> },
            { path: 'employees', element: <EmployeesPage /> },
            { path: 'employees/new', element: <NewEmployeePage /> },
            { path: 'employees/:employeeId', element: <EmployeeProfilePage /> },
            { path: 'employees/:employeeId/edit', element: <EditEmployeePage /> },
            { path: 'employees/:employeeId/onboarding', element: <EmployeeOnboardingPage /> },
            { path: 'onboarding', element: <OnboardingPage /> },
            { path: '*', element: <NotFoundPage /> },
          ],
        },
      ];

  const router = createMemoryRouter(routes, {
    initialEntries,
  });

  return render(<RouterProvider router={router} />, options);
}

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { EmployeesPage } from '@/routes/employees/EmployeesPage';
import { EmployeeProfilePage } from '@/routes/employees/EmployeeProfilePage';
import { NewEmployeePage } from '@/routes/employees/NewEmployeePage';
import { EditEmployeePage } from '@/routes/employees/EditEmployeePage';
import { OnboardingPage } from '@/routes/onboarding/OnboardingPage';
import { EmployeeOnboardingPage } from '@/routes/onboarding/EmployeeOnboardingPage';
import { PlaceholderPage } from '@/routes/placeholders/PlaceholderPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/employees" replace />,
      },
      {
        path: 'employees',
        element: <EmployeesPage />,
      },
      {
        path: 'employees/new',
        element: <NewEmployeePage />,
      },
      {
        path: 'employees/:employeeId',
        element: <EmployeeProfilePage />,
      },
      {
        path: 'employees/:employeeId/edit',
        element: <EditEmployeePage />,
      },
      {
        path: 'employees/:employeeId/onboarding',
        element: <EmployeeOnboardingPage />,
      },
      {
        path: 'overview',
        element: (
          <PlaceholderPage
            title="Overview"
            description="Company-wide headcount telemetry, turnover, and operational metrics."
            plannedMilestone="Milestone 4"
          />
        ),
      },
      {
        path: 'onboarding',
        element: <OnboardingPage />,
      },
      {
        path: '*',
        element: <Navigate to="/employees" replace />,
      },
    ],
  },
]);

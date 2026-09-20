import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { EmployeesPage } from '@/routes/employees/EmployeesPage';
import { EmployeeProfilePage } from '@/routes/employees/EmployeeProfilePage';
import { NewEmployeePage } from '@/routes/employees/NewEmployeePage';
import { EditEmployeePage } from '@/routes/employees/EditEmployeePage';
import { OnboardingPage } from '@/routes/onboarding/OnboardingPage';
import { EmployeeOnboardingPage } from '@/routes/onboarding/EmployeeOnboardingPage';

import { OverviewPage } from '@/routes/overview/OverviewPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/overview" replace />,
      },
      {
        path: 'overview',
        element: <OverviewPage />,
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
        path: 'onboarding',
        element: <OnboardingPage />,
      },
      {
        path: '*',
        element: <Navigate to="/overview" replace />,
      },
    ],
  },
]);

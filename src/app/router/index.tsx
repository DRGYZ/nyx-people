import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';

const OverviewPage = React.lazy(() =>
  import('@/routes/overview/OverviewPage').then((m) => ({ default: m.OverviewPage }))
);
const EmployeesPage = React.lazy(() =>
  import('@/routes/employees/EmployeesPage').then((m) => ({ default: m.EmployeesPage }))
);
const NewEmployeePage = React.lazy(() =>
  import('@/routes/employees/NewEmployeePage').then((m) => ({ default: m.NewEmployeePage }))
);
const EmployeeProfilePage = React.lazy(() =>
  import('@/routes/employees/EmployeeProfilePage').then((m) => ({ default: m.EmployeeProfilePage }))
);
const EditEmployeePage = React.lazy(() =>
  import('@/routes/employees/EditEmployeePage').then((m) => ({ default: m.EditEmployeePage }))
);
const EmployeeOnboardingPage = React.lazy(() =>
  import('@/routes/onboarding/EmployeeOnboardingPage').then((m) => ({ default: m.EmployeeOnboardingPage }))
);
const OnboardingPage = React.lazy(() =>
  import('@/routes/onboarding/OnboardingPage').then((m) => ({ default: m.OnboardingPage }))
);
const NotFoundPage = React.lazy(() =>
  import('@/routes/not-found/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

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
        element: <NotFoundPage />,
      },
    ],
  },
]);

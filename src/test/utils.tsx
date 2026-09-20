import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { EmployeesPage } from '@/routes/employees/EmployeesPage';
import { EmployeeProfilePage } from '@/routes/employees/EmployeeProfilePage';
import { NewEmployeePage } from '@/routes/employees/NewEmployeePage';
import { EditEmployeePage } from '@/routes/employees/EditEmployeePage';
import { OnboardingPage } from '@/routes/onboarding/OnboardingPage';
import { EmployeeOnboardingPage } from '@/routes/onboarding/EmployeeOnboardingPage';
import { OverviewPage } from '@/routes/overview/OverviewPage';

interface RenderWithRouterOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
}

export function renderWithRouter(
  ui?: React.ReactElement,
  { initialEntries = ['/employees'], ...options }: RenderWithRouterOptions = {}
) {
  const defaultUi = (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route path="overview" element={<OverviewPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="employees/new" element={<NewEmployeePage />} />
        <Route path="employees/:employeeId" element={<EmployeeProfilePage />} />
        <Route path="employees/:employeeId/edit" element={<EditEmployeePage />} />
        <Route path="employees/:employeeId/onboarding" element={<EmployeeOnboardingPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
      </Route>
    </Routes>
  );

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui || defaultUi}
    </MemoryRouter>,
    options
  );
}

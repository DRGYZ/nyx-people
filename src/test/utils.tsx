import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { EmployeesPage } from '@/routes/employees/EmployeesPage';
import { EmployeeProfilePage } from '@/routes/employees/EmployeeProfilePage';

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
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="employees/:employeeId" element={<EmployeeProfilePage />} />
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

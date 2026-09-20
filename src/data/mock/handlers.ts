import { http, HttpResponse, delay } from 'msw';
import { mockStore } from './store';
import {
  DirectoryQueryParamsSchema,
  EmployeeCreateInputSchema,
  EmployeeUpdateInputSchema,
} from '@/domain/schemas';

export const handlers = [
  // GET /api/employees
  http.get('/api/employees', async ({ request }) => {
    // Controlled latency simulation (skipped in test environments)
    if (process.env.NODE_ENV !== 'test') {
      await delay(60);
    }

    const url = new URL(request.url);
    const rawParams = {
      q: url.searchParams.get('q') || '',
      department: url.searchParams.get('department') || 'all',
      status: url.searchParams.get('status') || 'all',
      employmentType: url.searchParams.get('employmentType') || 'all',
      view: (url.searchParams.get('view') as any) || 'all',
      sortBy: (url.searchParams.get('sortBy') as any) || 'name',
      sortDir: (url.searchParams.get('sortDir') as any) || 'asc',
      page: Number(url.searchParams.get('page')) || 1,
      pageSize: Number(url.searchParams.get('pageSize')) || 25,
    };

    const parseResult = DirectoryQueryParamsSchema.safeParse(rawParams);
    const validParams = parseResult.success ? parseResult.data : rawParams;

    const response = mockStore.getEmployees(validParams);
    return HttpResponse.json(response);
  }),

  // GET /api/managers
  http.get('/api/managers', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') {
      await delay(30);
    }

    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const excludeId = url.searchParams.get('excludeId') || undefined;

    const managers = mockStore.searchManagers(q, excludeId);
    return HttpResponse.json({ data: managers });
  }),

  // GET /api/employees/:id
  http.get('/api/employees/:id', async ({ params }) => {
    if (process.env.NODE_ENV !== 'test') {
      await delay(50);
    }

    const id = params.id as string;
    const employee = mockStore.getEmployeeById(id);

    if (!employee) {
      return HttpResponse.json(
        { error: `Employee with ID '${id}' not found.`, statusCode: 404 },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: employee });
  }),

  // POST /api/employees
  http.post('/api/employees', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') {
      await delay(80);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json(
        { error: 'Invalid JSON request body', statusCode: 400 },
        { status: 400 }
      );
    }

    const parseResult = EmployeeCreateInputSchema.safeParse(body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]?.message || 'Validation failed';
      return HttpResponse.json(
        {
          error: firstIssue,
          details: parseResult.error.format(),
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    try {
      const created = mockStore.createEmployee(parseResult.data);
      return HttpResponse.json({ data: created }, { status: 201 });
    } catch (err: any) {
      const isConflict = err.message && err.message.toLowerCase().includes('already registered');
      return HttpResponse.json(
        {
          error: err.message || 'Failed to create employee',
          statusCode: isConflict ? 409 : 400,
        },
        { status: isConflict ? 409 : 400 }
      );
    }
  }),

  // PATCH /api/employees/:id
  http.patch('/api/employees/:id', async ({ params, request }) => {
    if (process.env.NODE_ENV !== 'test') {
      await delay(80);
    }

    const id = params.id as string;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json(
        { error: 'Invalid JSON request body', statusCode: 400 },
        { status: 400 }
      );
    }

    const parseResult = EmployeeUpdateInputSchema.safeParse(body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]?.message || 'Validation failed';
      return HttpResponse.json(
        {
          error: firstIssue,
          details: parseResult.error.format(),
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    try {
      const updated = mockStore.updateEmployee(id, parseResult.data);
      return HttpResponse.json({ data: updated });
    } catch (err: any) {
      const message = err.message || '';
      const isNotFound = message.includes('not found');
      const isConflict = message.toLowerCase().includes('already registered');
      const statusCode = isNotFound ? 404 : isConflict ? 409 : 400;

      return HttpResponse.json(
        {
          error: message || 'Failed to update employee',
          statusCode,
        },
        { status: statusCode }
      );
    }
  }),

  // GET /api/onboarding
  http.get('/api/onboarding', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') {
      await delay(60);
    }

    const url = new URL(request.url);
    const tab = (url.searchParams.get('tab') || url.searchParams.get('view') || 'all') as any;

    const response = mockStore.getOnboardingList(tab);
    return HttpResponse.json(response);
  }),

  // GET /api/onboarding/:employeeId
  http.get('/api/onboarding/:employeeId', async ({ params }) => {
    if (process.env.NODE_ENV !== 'test') {
      await delay(50);
    }

    const employeeId = params.employeeId as string;
    const plan = mockStore.getOnboardingPlan(employeeId);

    if (!plan) {
      return HttpResponse.json(
        { error: `Onboarding plan for employee '${employeeId}' not found.`, statusCode: 404 },
        { status: 404 }
      );
    }

    return HttpResponse.json(plan);
  }),

  // PATCH /api/onboarding/:employeeId/tasks/:taskKey
  http.patch('/api/onboarding/:employeeId/tasks/:taskKey', async ({ params, request }) => {
    if (process.env.NODE_ENV !== 'test') {
      await delay(60);
    }

    const employeeId = params.employeeId as string;
    const taskKey = params.taskKey as string;

    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json(
        { error: 'Invalid JSON request body', statusCode: 400 },
        { status: 400 }
      );
    }

    const completed = typeof body.completed === 'boolean' ? body.completed : true;

    try {
      const response = mockStore.updateOnboardingTask(employeeId, taskKey, completed);
      return HttpResponse.json(response);
    } catch (err: any) {
      const message = err.message || '';
      const isNotFound = message.includes('not found');
      return HttpResponse.json(
        {
          error: message || 'Failed to update onboarding task',
          statusCode: isNotFound ? 404 : 400,
        },
        { status: isNotFound ? 404 : 400 }
      );
    }
  }),

  // GET /api/overview
  http.get('/api/overview', async () => {
    if (process.env.NODE_ENV !== 'test') {
      await delay(50);
    }

    const data = mockStore.getOverviewData();
    return HttpResponse.json(data);
  }),
];



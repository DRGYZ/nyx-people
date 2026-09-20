import { http, HttpResponse, delay } from 'msw';
import { mockStore } from './store';
import { DirectoryQueryParamsSchema } from '@/domain/schemas';

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
];

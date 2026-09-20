import { Employee, Department, OfficeLocation, EmploymentType, EmployeeStatus } from '@/domain/employee';

// Seeded PRNG (Mulberry32) for perfectly deterministic data generation
function createPRNG(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const prng = createPRNG(133742);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(prng() * arr.length)]!;
}

const firstNames = [
  'Lucas', 'Camille', 'Gabriel', 'Chloe', 'Arthur', 'Ines', 'Louis', 'Sarah',
  'Hugo', 'Lea', 'Raphael', 'Manon', 'Jules', 'Zoe', 'Leo', 'Emma',
  'Liam', 'Olivia', 'Ethan', 'Charlotte', 'Mason', 'Amelia', 'Oliver', 'Ava',
  'Alexander', 'Mia', 'Daniel', 'Harper', 'Henry', 'Evelyn', 'Sebastian', 'Abigail',
  'Theo', 'Alice', 'Maxime', 'Louise', 'Thomas', 'Juliette', 'Victor', 'Clara',
  'Adam', 'Eva', 'Paul', 'Rose', 'Nathan', 'Anna', 'Antoine', 'Lucie'
];

const lastNames = [
  'Dubois', 'Laurent', 'Moreau', 'Fournier', 'Girard', 'Bonnet', 'Dupont', 'Fontaine',
  'Rousseau', 'Vincent', 'Muller', 'Lefebvre', 'Mercier', 'Blanc', 'Guerin', 'Boyer',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson',
  'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez',
  'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const departments: Department[] = [
  'Engineering',
  'Product',
  'People',
  'Marketing',
  'Finance',
  'Operations',
  'Sales',
  'Legal'
];

const locations: OfficeLocation[] = [
  'Paris',
  'London',
  'New York',
  'San Francisco',
  'Berlin',
  'Remote'
];

const rolesByDepartment: Record<Department, string[]> = {
  Engineering: [
    'Frontend Engineer', 'Senior Frontend Engineer', 'Backend Engineer',
    'Senior Backend Engineer', 'Fullstack Engineer', 'DevOps Engineer',
    'Senior Data Architect', 'Staff Software Engineer', 'Security Engineer',
    'QA Automation Engineer', 'Infrastructure Lead'
  ],
  Product: [
    'Product Designer', 'Senior Product Designer', 'Product Manager',
    'Senior Product Manager', 'Group Product Manager', 'UX Researcher',
    'Design Systems Lead'
  ],
  People: [
    'People Partner', 'Senior Talent Partner', 'People Operations Specialist',
    'Head of People', 'Recruiting Coordinator', 'HR Business Partner'
  ],
  Marketing: [
    'Staff Content Strategist', 'Growth Marketing Lead', 'Brand Designer',
    'Product Marketing Manager', 'Performance Marketer', 'Communications Lead'
  ],
  Finance: [
    'Financial Analyst', 'Senior Financial Analyst', 'Controller',
    'Billing Specialist', 'Finance Director', 'Accounting Manager'
  ],
  Operations: [
    'Operations Lead', 'Business Operations Manager', 'Office Experience Lead',
    'Workplace Coordinator', 'Operations Specialist'
  ],
  Sales: [
    'Account Executive', 'Enterprise Account Executive', 'Sales Development Rep',
    'Head of Sales', 'Customer Success Manager', 'Solutions Architect'
  ],
  Legal: [
    'Legal Counsel', 'Senior Compliance Officer', 'Data Privacy Officer',
    'Corporate Paralegal'
  ]
};

// Key primary employees specifically required by the visual mockups
const canonicalEmployees: Employee[] = [
  {
    id: 'EMP-0102',
    person: {
      firstName: 'Amelia',
      lastName: 'Carter',
      email: 'amelia@company.com',
      phone: '+33 1 42 68 55 12',
      dateOfBirth: '1992-04-14',
      address: {
        street: '8 Rue de la Paix',
        postalCode: '75002',
        city: 'Paris',
        country: 'France'
      }
    },
    employment: {
      jobTitle: 'Product Designer',
      department: 'Product',
      location: 'Paris',
      employmentType: 'full-time',
      status: 'active',
      startDate: '2024-03-12',
      manager: {
        id: 'EMP-0005',
        name: 'Alexandre Roy',
        initials: 'AR'
      }
    },
    timestamps: {
      createdAt: '2024-02-15T09:00:00Z',
      updatedAt: '2024-03-12T10:00:00Z'
    }
  },
  {
    id: 'EMP-0941',
    person: {
      firstName: 'Noah',
      lastName: 'Williams',
      email: 'noah@company.com',
      phone: '+33 1 42 68 55 00',
      dateOfBirth: '1995-11-20',
      address: {
        street: '14 Rue de Rivoli',
        postalCode: '75004',
        city: 'Paris',
        country: 'France'
      }
    },
    employment: {
      jobTitle: 'Frontend Engineer',
      department: 'Engineering',
      location: 'Paris',
      employmentType: 'full-time',
      status: 'onboarding',
      startDate: '2026-09-24',
      manager: {
        id: 'EMP-0102',
        name: 'Amelia Carter',
        initials: 'AC'
      }
    },
    onboarding: {
      totalTasks: 6,
      completedTasks: 4,
      attentionSummary: 'Onboarding is 4 of 6 complete. Account access and manager introduction remain incomplete.',
      responsiblePartner: {
        name: 'Amelia Carter',
        note: "Amelia Carter is coordinating initial pair-programming arrangements for Noah's first week."
      },
      tasks: [
        {
          id: 'personal-details',
          title: 'Personal details',
          subtitle: 'Submitted by employee · Complete',
          completed: true,
          completedAt: '2026-09-18T14:30:00Z'
        },
        {
          id: 'contract',
          title: 'Contract received',
          subtitle: 'Signed via DocuSign · Complete',
          completed: true,
          completedAt: '2026-09-19T09:15:00Z'
        },
        {
          id: 'equipment',
          title: 'Equipment requested',
          subtitle: 'Hardware dispatched to Paris office · Complete',
          completed: true,
          completedAt: '2026-09-19T16:00:00Z'
        },
        {
          id: 'first-day-plan',
          title: 'First-day plan',
          subtitle: 'Confirmed with Amelia Carter · Complete',
          completed: true,
          completedAt: '2026-09-20T11:00:00Z'
        },
        {
          id: 'accounts',
          title: 'Account provisioned',
          subtitle: 'Awaiting IT security clearance · Incomplete',
          completed: false
        },
        {
          id: 'manager-introduction',
          title: 'Manager introduction',
          subtitle: 'Scheduled for first morning · Incomplete',
          completed: false
        }
      ]
    },
    timestamps: {
      createdAt: '2026-09-15T08:00:00Z',
      updatedAt: '2026-09-20T11:00:00Z'
    }
  },
  {
    id: 'EMP-0215',
    person: {
      firstName: 'Emma',
      lastName: 'Laurent',
      email: 'emma@company.com',
      phone: '+33 1 42 68 55 44',
      dateOfBirth: '1990-08-12',
      address: {
        street: '22 Boulevard Saint-Germain',
        postalCode: '75005',
        city: 'Paris',
        country: 'France'
      }
    },
    employment: {
      jobTitle: 'People Partner',
      department: 'People',
      location: 'Paris',
      employmentType: 'full-time',
      status: 'active',
      startDate: '2025-01-08'
    },
    timestamps: {
      createdAt: '2024-12-01T09:00:00Z',
      updatedAt: '2025-01-08T09:00:00Z'
    }
  },
  {
    id: 'EMP-0044',
    person: {
      firstName: 'Julian',
      lastName: 'Vance',
      email: 'julian@company.com',
      phone: '+44 20 7946 0912',
      dateOfBirth: '1987-03-29',
      address: {
        street: '15 Clerkenwell Close',
        postalCode: 'EC1R 0AA',
        city: 'London',
        country: 'United Kingdom'
      }
    },
    employment: {
      jobTitle: 'Senior Data Architect',
      department: 'Engineering',
      location: 'London',
      employmentType: 'full-time',
      status: 'active',
      startDate: '2023-11-04'
    },
    timestamps: {
      createdAt: '2023-10-01T09:00:00Z',
      updatedAt: '2023-11-04T09:00:00Z'
    }
  },
  {
    id: 'EMP-0189',
    person: {
      firstName: 'Sophia',
      lastName: 'Chen',
      email: 'sophia@company.com',
      phone: '+1 212 555 0198',
      dateOfBirth: '1991-09-05',
      address: {
        street: '350 5th Avenue',
        postalCode: '10118',
        city: 'New York',
        country: 'United States'
      }
    },
    employment: {
      jobTitle: 'Staff Content Strategist',
      department: 'Marketing',
      location: 'New York',
      employmentType: 'full-time',
      status: 'leave',
      startDate: '2022-06-17'
    },
    timestamps: {
      createdAt: '2022-05-10T09:00:00Z',
      updatedAt: '2022-06-17T09:00:00Z'
    }
  },
  {
    id: 'EMP-0310',
    person: {
      firstName: 'Marcus',
      lastName: 'Thorne',
      email: 'marcus@company.com',
      phone: '+44 20 7946 0884',
      dateOfBirth: '1989-12-14',
      address: {
        street: '42 Old Broad Street',
        postalCode: 'EC2N 1DW',
        city: 'London',
        country: 'United Kingdom'
      }
    },
    employment: {
      jobTitle: 'Financial Analyst',
      department: 'Finance',
      location: 'London',
      employmentType: 'full-time',
      status: 'active',
      startDate: '2024-02-19'
    },
    timestamps: {
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-02-19T09:00:00Z'
    }
  },
  {
    id: 'EMP-0078',
    person: {
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena@company.com',
      phone: '+49 30 2312 5520',
      dateOfBirth: '1986-07-22',
      address: {
        street: 'Friedrichstraße 43',
        postalCode: '10117',
        city: 'Berlin',
        country: 'Germany'
      }
    },
    employment: {
      jobTitle: 'Operations Lead',
      department: 'Operations',
      location: 'Berlin',
      employmentType: 'full-time',
      status: 'active',
      startDate: '2021-10-10'
    },
    timestamps: {
      createdAt: '2021-09-01T09:00:00Z',
      updatedAt: '2021-10-10T09:00:00Z'
    }
  },
  {
    id: 'EMP-0255',
    person: {
      firstName: 'David',
      lastName: 'Kim',
      email: 'david@company.com',
      phone: '+1 415 555 2671',
      dateOfBirth: '1993-02-18',
      address: {
        street: '500 Howard Street',
        postalCode: '94105',
        city: 'San Francisco',
        country: 'United States'
      }
    },
    employment: {
      jobTitle: 'DevOps Engineer',
      department: 'Engineering',
      location: 'San Francisco',
      employmentType: 'full-time',
      status: 'active',
      startDate: '2023-08-15'
    },
    timestamps: {
      createdAt: '2023-07-10T09:00:00Z',
      updatedAt: '2023-08-15T09:00:00Z'
    }
  }
];

// Target numbers from the approved mockup:
// Total: 428
// New Starters: 14 (startDate within past 60 days or near future)
// Onboarding: 6 (status === 'onboarding')
// Contractors: 28 (employmentType === 'contractor')
// 8 departments

export function generateDeterministicEmployees(): Employee[] {
  const result: Employee[] = [...canonicalEmployees];

  // We have 8 canonical employees:
  // 1 is onboarding (Noah) -> need 5 more onboarding to make 6
  // 0 are contractors -> need 28 contractors
  // 1 is new starter (Noah) -> need 13 more new starters to make 14
  // Total to generate: 428 - 8 = 420 employees

  let onboardingRemaining = 5;
  let contractorsRemaining = 28;
  let newStartersRemaining = 13;

  for (let i = 9; i <= 428; i++) {
    const fn = pick(firstNames);
    const ln = pick(lastNames);
    const dept = departments[(i - 1) % departments.length]!;
    const roleList = rolesByDepartment[dept]!;
    const role = roleList[(i + 3) % roleList.length]!;
    const loc = locations[i % locations.length]!;

    let status: EmployeeStatus = 'active';
    let empType: EmploymentType = 'full-time';
    let startDate = '2024-01-15';
    let onboardingData = undefined;

    if (onboardingRemaining > 0) {
      status = 'onboarding';
      onboardingRemaining--;
      // Set recent start date
      startDate = `2026-09-${String(15 + (i % 12)).padStart(2, '0')}`;
      const completedCount = 2 + (i % 4);
      onboardingData = {
        totalTasks: 6,
        completedTasks: completedCount,
        tasks: [
          { id: 'personal-details', title: 'Personal details', subtitle: 'Submitted by employee · Complete', completed: true },
          { id: 'contract', title: 'Contract received', subtitle: 'Signed via DocuSign · Complete', completed: true },
          { id: 'equipment', title: 'Equipment requested', subtitle: 'Hardware dispatched · Complete', completed: completedCount >= 3 },
          { id: 'accounts', title: 'Account provisioned', subtitle: 'IT clearance', completed: completedCount >= 4 },
          { id: 'manager-introduction', title: 'Manager introduction', subtitle: 'Scheduled for first day', completed: completedCount >= 5 },
          { id: 'first-day-plan', title: 'First-day plan', subtitle: 'Confirmed with manager', completed: completedCount >= 6 }
        ]
      };
    } else if (contractorsRemaining > 0 && i % 3 === 0) {
      empType = 'contractor';
      contractorsRemaining--;
      startDate = `2024-${String(1 + (i % 11)).padStart(2, '0')}-10`;
    } else if (newStartersRemaining > 0 && i % 4 === 0) {
      newStartersRemaining--;
      // Started in August or September 2026
      startDate = `2026-08-${String(1 + (i % 25)).padStart(2, '0')}`;
      status = 'active';
    } else {
      // General distribution: mostly active, rare leave or offboarded
      const roll = (i * 17) % 100;
      if (roll < 6) {
        status = 'leave';
      } else if (roll < 9) {
        status = 'offboarded';
      } else {
        status = 'active';
      }
      const year = 2020 + (i % 6);
      const month = String(1 + (i % 12)).padStart(2, '0');
      const day = String(1 + (i % 28)).padStart(2, '0');
      startDate = `${year}-${month}-${day}`;
    }

    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@company.com`;
    const paddedId = String(i).padStart(4, '0');

    result.push({
      id: `EMP-${paddedId}`,
      person: {
        firstName: fn,
        lastName: ln,
        email,
        phone: `+33 1 ${String(40 + (i % 50)).padStart(2, '0')} ${String(10 + (i % 80)).padStart(2, '0')} ${String(10 + ((i * 3) % 80)).padStart(2, '0')}`,
        dateOfBirth: `19${85 + (i % 15)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
        address: {
          street: `${(i % 150) + 1} Rue de la République`,
          postalCode: '75011',
          city: loc,
          country: loc === 'Paris' ? 'France' : loc === 'London' ? 'United Kingdom' : 'United States'
        }
      },
      employment: {
        jobTitle: role,
        department: dept,
        location: loc,
        employmentType: empType,
        status,
        startDate,
        manager: {
          id: 'EMP-0102',
          name: 'Amelia Carter',
          initials: 'AC'
        }
      },
      onboarding: onboardingData,
      timestamps: {
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2026-09-20T00:00:00Z'
      }
    });
  }

  return result;
}

export const deterministicEmployees: Employee[] = generateDeterministicEmployees();

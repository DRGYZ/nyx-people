import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Employee, EmployeeCreateInput } from '@/domain/employee';
import { fetchEmployeeById, updateEmployee } from '@/data/api-client';
import { EmployeeForm } from '@/features/employee-form/components/EmployeeForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { formatFullDate } from '@/utils/formatters';
import styles from './EditEmployeePage.module.css';

export const EditEmployeePage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!employeeId) {
      setLoading(false);
      setLoadError('Employee ID not specified.');
      return;
    }

    setLoading(true);
    setLoadError(null);

    fetchEmployeeById(employeeId)
      .then((res) => {
        if (active) {
          setEmployee(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setLoadError(err.message || 'Failed to load employee.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [employeeId]);

  const handleSubmit = async (values: EmployeeCreateInput) => {
    if (!employee) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      await updateEmployee(employee.id, values);
      navigate(`/employees/${employee.id}`);
    } catch (err: any) {
      setServerError(err.message || 'An unexpected error occurred while updating the employee.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingSkeleton}>
          <Skeleton width="120px" height="20px" />
          <Skeleton width="300px" height="36px" />
          <Skeleton width="100%" height="220px" />
          <Skeleton width="100%" height="220px" />
        </div>
      </main>
    );
  }

  if (loadError || !employee) {
    return (
      <main className={styles.container}>
        <div className={styles.errorState}>
          <h2 className={styles.errorTitle}>Employee Not Found</h2>
          <p className={styles.errorText}>
            {loadError || `Could not find an employee with ID "${employeeId}".`}
          </p>
          <Button variant="outline" onClick={() => navigate('/employees')}>
            Return to Employees
          </Button>
        </div>
      </main>
    );
  }

  const fullName = `${employee.person.firstName} ${employee.person.lastName}`;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link
          to={`/employees/${employee.id}`}
          className={styles.backLink}
          aria-label="Return to employee profile"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to profile</span>
        </Link>
        <h1 className={styles.title}>Edit {fullName}</h1>
        <p className={styles.subtitle}>
          EMP ID: <span className="tabular-nums">{employee.id}</span> · Record created{' '}
          <span className="tabular-nums">{formatFullDate(employee.timestamps.createdAt)}</span>
        </p>
      </header>

      <EmployeeForm
        mode="edit"
        initialData={employee}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverError={serverError}
        onCancel={() => navigate(`/employees/${employee.id}`)}
      />
    </main>
  );
};

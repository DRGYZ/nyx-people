import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EmployeeCreateInput } from '@/domain/employee';
import { createEmployee } from '@/data/api-client';
import { EmployeeForm } from '@/features/employee-form/components/EmployeeForm';
import styles from './NewEmployeePage.module.css';

export const NewEmployeePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (values: EmployeeCreateInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await createEmployee(values);
      // Navigate to newly created employee profile
      navigate(`/employees/${response.data.id}`);
    } catch (err: any) {
      setServerError(err.message || 'An unexpected error occurred while creating the employee.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/employees" className={styles.backLink} aria-label="Return to directory">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Employees</span>
        </Link>
        <h1 className={styles.title}>Add new employee</h1>
        <p className={styles.subtitle}>
          Add personal and employment details
        </p>
      </header>

      <EmployeeForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverError={serverError}
        onCancel={() => navigate('/employees')}
      />
    </div>
  );
};

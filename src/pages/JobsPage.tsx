import React from 'react';
import { JobsList } from '../components/jobs/JobsList';
import { JobForm } from '../components/forms/JobForm';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { useUIStore } from '../store';

export const JobsPage: React.FC = () => {
  const { modals } = useUIStore();

  return (
    <>
      <JobsList />
      {modals.jobForm.open && <JobForm job={modals.jobForm.job} />}
      {modals.deleteConfirm.open && <DeleteConfirmModal />}
    </>
  );
};


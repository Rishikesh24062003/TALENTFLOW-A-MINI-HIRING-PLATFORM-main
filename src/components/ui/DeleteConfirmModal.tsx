import React from 'react';
import { useUIStore } from '../../store';
import { useDeleteJob } from '../../hooks';
import { Button } from './Button';
import { X, AlertTriangle } from 'lucide-react';

export const DeleteConfirmModal: React.FC = () => {
  const { modals, closeModal } = useUIStore();
  const deleteJobMutation = useDeleteJob();
  
  const modalData = modals.deleteConfirm;
  
  if (!modalData.open) {
    return null;
  }

  const handleConfirm = async () => {
    if (modalData.type === 'job' && modalData.id) {
      try {
        await deleteJobMutation.mutateAsync(modalData.id);
        closeModal('deleteConfirm');
      } catch (error) {
        // Error handling is done in the mutation
        console.error('Failed to delete job:', error);
      }
    }
  };

  const handleClose = () => {
    closeModal('deleteConfirm');
  };

  // Type guard to check if we have the required modal data
  const title = (modalData as any).title || 'Confirm Delete';
  const message = (modalData as any).message || 'Are you sure you want to delete this item? This action cannot be undone.';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={deleteJobMutation.isPending}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={deleteJobMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              loading={deleteJobMutation.isPending}
            >
              {modalData.type === 'job' ? 'Archive' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

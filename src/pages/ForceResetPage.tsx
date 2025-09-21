import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { 
  RefreshCw,
  CheckCircle
} from 'lucide-react';

export const ForceResetPage: React.FC = () => {
  const [status, setStatus] = useState('Clearing data...');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const resetData = async () => {
      try {
        setStatus('Clearing existing data...');
        
        // Clear IndexedDB data
        const { StorageService } = await import('../lib/storage');
        await StorageService.clearAllData();
        
        setStatus('Generating fresh data with assessments...');
        
        // Force re-seed with fresh data
        const { seedDataToStorage } = await import('../lib/seedData');
        await seedDataToStorage();
        
        setStatus('Data reset complete!');
        setIsComplete(true);
        
        // Refresh the page to reload with new data
        setTimeout(() => {
          window.location.href = '/candidate-portal';
        }, 2000);
        
      } catch (error) {
        console.error('Failed to reset data:', error);
        setStatus('Error resetting data. Please refresh the page.');
      }
    };

    resetData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {isComplete ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Resetting Application Data
        </h1>
        <p className="text-gray-600 mb-4">
          {status}
        </p>
        {!isComplete && <LoadingSpinner size="sm" />}
        {isComplete && (
          <p className="text-sm text-green-600">
            Redirecting to candidate portal...
          </p>
        )}
      </div>
    </div>
  );
};

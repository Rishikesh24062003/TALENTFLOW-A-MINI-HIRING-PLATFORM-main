import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { 
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

export const ClearDataPage: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const navigate = useNavigate();

  const handleClearData = async () => {
    setIsClearing(true);

    try {
      // Clear IndexedDB data
      const { StorageService } = await import('../lib/storage');
      
      // Clear all stores
      await StorageService.clearAllData();
      
      // Force re-seed with fresh data
      const { seedDataToStorage } = await import('../lib/seedData');
      await seedDataToStorage();
      
      setIsCleared(true);
      
      // Refresh the page to reload with new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to clear data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  if (isCleared) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Data Cleared Successfully!
          </h1>
          <p className="text-gray-600 mb-4">
            Fresh data has been generated. The page will reload automatically.
          </p>
          <LoadingSpinner size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/candidate-portal">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Clear Application Data
            </h1>
            <p className="text-gray-600">
              This will clear all stored data and regenerate fresh sample data including assessments for all jobs.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-yellow-800 mb-2">Warning:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• All job applications will be removed</li>
                  <li>• All candidate data will be reset</li>
                  <li>• Fresh assessments will be created for all jobs</li>
                  <li>• This action cannot be undone</li>
                  <li>• The page will reload after clearing data</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleClearData}
              disabled={isClearing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isClearing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Clearing Data...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear All Data & Regenerate
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="secondary" asChild>
              <Link to="/candidate-portal">
                Cancel
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

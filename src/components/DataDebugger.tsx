import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';

export const DataDebugger: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const loadStorageInfo = async () => {
    try {
      const { StorageService } = await import('../lib/storage');
      const info = await StorageService.getStorageInfo();
      console.log('🔍 DataDebugger: Storage info:', info);
      setStorageInfo(info);
      
      // Also load sample data to see what's actually in storage
      const jobs = await StorageService.getAllJobs();
      const candidates = await StorageService.getAllCandidates();
      console.log('🔍 DataDebugger: Sample jobs:', jobs.slice(0, 2));
      console.log('🔍 DataDebugger: Sample candidates:', candidates.slice(0, 2));
    } catch (error) {
      console.error('🔍 DataDebugger: Error loading storage info:', error);
    }
  };

  const testAPICall = async () => {
    try {
      console.log('🔍 DataDebugger: Testing API calls...');
      
      // Test jobs API
      const jobsResponse = await fetch('/api/jobs?pageSize=5');
      const jobsData = await jobsResponse.json();
      console.log('🔍 DataDebugger: Jobs API response:', jobsData);
      
      // Test candidates API
      const candidatesResponse = await fetch('/api/candidates?pageSize=5');
      const candidatesData = await candidatesResponse.json();
      console.log('🔍 DataDebugger: Candidates API response:', candidatesData);
    } catch (error) {
      console.error('🔍 DataDebugger: API test error:', error);
    }
  };

  const seedData = async () => {
    try {
      console.log('🔍 DataDebugger: Seeding data...');
      const { seedDataToStorage } = await import('../lib/seedData');
      await seedDataToStorage();
      await loadStorageInfo();
      console.log('🔍 DataDebugger: Data seeded successfully');
    } catch (error) {
      console.error('🔍 DataDebugger: Seeding error:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      loadStorageInfo();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="secondary"
          size="sm"
          className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg"
        >
          🔍 Debug Data
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border-2 border-yellow-500 rounded-lg shadow-xl p-4 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Data Debugger</h3>
        <Button
          onClick={() => setIsVisible(false)}
          variant="secondary"
          size="sm"
        >
          ×
        </Button>
      </div>

      {/* Storage Info */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">IndexedDB Status</h4>
        {storageInfo ? (
          <div className="text-xs text-gray-600 space-y-1">
            <div>📁 Jobs: {storageInfo.jobsCount}</div>
            <div>👥 Candidates: {storageInfo.candidatesCount}</div>
            <div>📝 Assessments: {storageInfo.assessmentsCount}</div>
            <div>📊 Responses: {storageInfo.responsesCount}</div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">Loading...</div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={loadStorageInfo}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          🔄 Refresh Storage
        </Button>

        <Button
          onClick={testAPICall}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          🧪 Test API Calls
        </Button>

        <Button
          onClick={seedData}
          variant="primary"
          size="sm"
          className="w-full"
        >
          🌱 Seed Data
        </Button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Check browser console for detailed logs
      </div>
    </div>
  );
};

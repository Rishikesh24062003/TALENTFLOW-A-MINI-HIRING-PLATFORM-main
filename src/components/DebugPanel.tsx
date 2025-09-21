import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Database, RefreshCw, Trash2, Download, Upload, Eye } from 'lucide-react';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStorageInfo = async () => {
    try {
      const { StorageService } = await import('../lib/storage');
      const info = await StorageService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const seedData = async () => {
    setIsLoading(true);
    try {
      const { seedDataToStorage } = await import('../lib/seedData');
      await seedDataToStorage();
      await loadStorageInfo();
      console.log('✅ Data seeded successfully');
    } catch (error) {
      console.error('❌ Failed to seed data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const { StorageService } = await import('../lib/storage');
      await StorageService.clearAllData();
      await loadStorageInfo();
      console.log('✅ All data cleared');
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const { StorageService } = await import('../lib/storage');
      const data = await StorageService.exportData();
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `talentflow-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Failed to export data:', error);
    }
  };

  const viewIndexedDB = () => {
    if (typeof window !== 'undefined') {
      console.log('Opening browser DevTools to view IndexedDB...');
      console.log('1. Open DevTools (F12)');
      console.log('2. Go to Application tab');
      console.log('3. Look for IndexedDB > talentflow');
      alert('Check the browser console for instructions to view IndexedDB data');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStorageInfo();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="secondary"
          size="sm"
          className="shadow-lg"
        >
          <Database className="w-4 h-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Debug Panel</h3>
        <Button
          onClick={() => setIsOpen(false)}
          variant="secondary"
          size="sm"
        >
          ×
        </Button>
      </div>

      {/* Storage Info */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Storage Stats</h4>
        {storageInfo ? (
          <div className="text-xs text-gray-600 space-y-1">
            <div>Jobs: {storageInfo.jobsCount}</div>
            <div>Candidates: {storageInfo.candidatesCount}</div>
            <div>Assessments: {storageInfo.assessmentsCount}</div>
            <div>Responses: {storageInfo.responsesCount}</div>
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
          <RefreshCw className="w-3 h-3 mr-2" />
          Refresh Stats
        </Button>

        <Button
          onClick={seedData}
          variant="primary"
          size="sm"
          className="w-full"
          disabled={isLoading}
        >
          <Database className="w-3 h-3 mr-2" />
          {isLoading ? 'Seeding...' : 'Seed Data'}
        </Button>

        <Button
          onClick={viewIndexedDB}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          <Eye className="w-3 h-3 mr-2" />
          View IndexedDB
        </Button>

        <Button
          onClick={exportData}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          <Download className="w-3 h-3 mr-2" />
          Export Data
        </Button>

        <Button
          onClick={clearAllData}
          variant="secondary"
          size="sm"
          className="w-full text-red-600 hover:text-red-700"
          disabled={isLoading}
        >
          <Trash2 className="w-3 h-3 mr-2" />
          Clear All Data
        </Button>
      </div>
    </div>
  );
};

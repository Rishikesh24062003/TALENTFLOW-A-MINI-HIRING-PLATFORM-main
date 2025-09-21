import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';

export const DataFlowDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-10), `${timestamp}: ${message}`]);
    console.log(message);
  };

  const testFullDataFlow = async () => {
    setLogs([]);
    addLog('🔍 Starting full data flow test...');
    
    try {
      // Step 1: Check IndexedDB directly
      addLog('📦 Step 1: Checking IndexedDB...');
      const { StorageService } = await import('../lib/storage');
      const jobs = await StorageService.getAllJobs();
      const candidates = await StorageService.getAllCandidates();
      addLog(`📊 IndexedDB: ${jobs.length} jobs, ${candidates.length} candidates`);
      
      if (jobs.length === 0) {
        addLog('❌ No data in IndexedDB - seeding required');
        const { seedDataToStorage } = await import('../lib/seedData');
        await seedDataToStorage();
        addLog('✅ Data seeded to IndexedDB');
        
        // Re-check after seeding
        const newJobs = await StorageService.getAllJobs();
        const newCandidates = await StorageService.getAllCandidates();
        addLog(`📊 After seeding: ${newJobs.length} jobs, ${newCandidates.length} candidates`);
      }
      
      // Step 2: Test API endpoints directly
      addLog('🌐 Step 2: Testing API endpoints...');
      
      const jobsResponse = await fetch('/api/jobs?pageSize=5');
      const jobsData = await jobsResponse.json();
      addLog(`🔗 Jobs API: ${jobsData.success ? 'SUCCESS' : 'FAILED'} - ${jobsData.total || 0} total`);
      
      const candidatesResponse = await fetch('/api/candidates?pageSize=5');
      const candidatesData = await candidatesResponse.json();
      addLog(`🔗 Candidates API: ${candidatesData.success ? 'SUCCESS' : 'FAILED'} - ${candidatesData.total || 0} total`);
      
      // Step 3: Test React Query
      addLog('⚛️ Step 3: Testing React Query...');
      addLog('ℹ️ Check browser console for React Query logs');
      
      // Step 4: Force page refresh
      addLog('🔄 Step 4: Refreshing page to reload data...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      addLog(`❌ Error in data flow test: ${error}`);
    }
  };

  const clearIndexedDB = async () => {
    try {
      const { StorageService } = await import('../lib/storage');
      await StorageService.clearAllData();
      addLog('🗑️ IndexedDB cleared');
    } catch (error) {
      addLog(`❌ Error clearing IndexedDB: ${error}`);
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed top-20 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="secondary"
          size="sm"
          className="bg-red-500 hover:bg-red-600 text-white shadow-lg"
        >
          🚨 Data Flow Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-50 bg-white border-2 border-red-500 rounded-lg shadow-xl p-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Data Flow Debugger</h3>
        <Button
          onClick={() => setIsVisible(false)}
          variant="secondary"
          size="sm"
        >
          ×
        </Button>
      </div>

      {/* Logs */}
      <div className="mb-4 max-h-48 overflow-y-auto bg-gray-100 p-2 rounded text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-500">No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1 font-mono">{log}</div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={testFullDataFlow}
          variant="primary"
          size="sm"
          className="w-full"
        >
          🔍 Run Full Data Flow Test
        </Button>

        <Button
          onClick={clearIndexedDB}
          variant="secondary"
          size="sm"
          className="w-full text-red-600"
        >
          🗑️ Clear IndexedDB
        </Button>

        <Button
          onClick={() => window.location.reload()}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          🔄 Refresh Page
        </Button>
      </div>

      <div className="mt-4 text-xs text-gray-500 border-t pt-2">
        <div><strong>Current Issue:</strong> Data shows 0 but exists in IndexedDB</div>
        <div><strong>Solution:</strong> Run test to identify where data flow breaks</div>
      </div>
    </div>
  );
};

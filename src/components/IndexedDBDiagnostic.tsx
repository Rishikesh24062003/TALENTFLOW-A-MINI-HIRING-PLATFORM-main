import React, { useState } from 'react';
import { Button } from './ui/Button';

export const IndexedDBDiagnostic: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-15), `${timestamp}: ${message}`]);
    console.log(`[IndexedDB Test] ${message}`);
  };

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog('🔍 Starting comprehensive IndexedDB test...');

    try {
      // Test 1: Check if IndexedDB is available
      addLog('📋 Test 1: Checking IndexedDB availability...');
      if (!window.indexedDB) {
        addLog('❌ IndexedDB not available in this browser');
        return;
      }
      addLog('✅ IndexedDB is available');

      // Test 2: List all databases
      addLog('📋 Test 2: Listing IndexedDB databases...');
      try {
        const databases = await indexedDB.databases();
        addLog(`📊 Found ${databases.length} databases:`);
        databases.forEach(db => {
          addLog(`  - ${db.name} (version: ${db.version})`);
        });
      } catch (err) {
        addLog(`⚠️ Cannot list databases: ${err}`);
      }

      // Test 3: Test localforage directly
      addLog('📋 Test 3: Testing localforage directly...');
      const localforage = (await import('localforage')).default;
      
      // Create test store
      const testStore = localforage.createInstance({
        name: 'talentflow',
        storeName: 'test',
      });

      // Test write/read
      await testStore.setItem('test-key', 'test-value');
      const testValue = await testStore.getItem('test-key');
      
      if (testValue === 'test-value') {
        addLog('✅ Localforage basic read/write works');
      } else {
        addLog('❌ Localforage basic read/write failed');
      }

      // Test 4: Test actual storage instances
      addLog('📋 Test 4: Testing actual TalentFlow storage instances...');
      
      const jobsStore = localforage.createInstance({
        name: 'talentflow',
        storeName: 'jobs',
      });

      const candidatesStore = localforage.createInstance({
        name: 'talentflow',
        storeName: 'candidates',
      });

      // Count items in each store
      let jobsCount = 0;
      let candidatesCount = 0;

      await jobsStore.iterate(() => {
        jobsCount++;
      });

      await candidatesStore.iterate(() => {
        candidatesCount++;
      });

      addLog(`📊 Direct store counts: Jobs=${jobsCount}, Candidates=${candidatesCount}`);

      // Test 5: Test StorageService methods
      addLog('📋 Test 5: Testing StorageService methods...');
      const { StorageService } = await import('../lib/storage');
      
      const jobs = await StorageService.getAllJobs();
      const candidates = await StorageService.getAllCandidates();
      
      addLog(`📊 StorageService counts: Jobs=${jobs.length}, Candidates=${candidates.length}`);

      if (jobs.length > 0) {
        addLog(`📝 Sample job: ${jobs[0].title}`);
      }
      if (candidates.length > 0) {
        addLog(`📝 Sample candidate: ${candidates[0].name}`);
      }

      // Test 6: Test API endpoints
      addLog('📋 Test 6: Testing API endpoints...');
      
      try {
        const jobsResponse = await fetch('/api/jobs?pageSize=1');
        const jobsData = await jobsResponse.json();
        addLog(`🌐 Jobs API: ${jobsData.success ? 'SUCCESS' : 'FAILED'} - Total: ${jobsData.total || 0}`);
      } catch (err) {
        addLog(`❌ Jobs API failed: ${err}`);
      }

      try {
        const candidatesResponse = await fetch('/api/candidates?pageSize=1');
        const candidatesData = await candidatesResponse.json();
        addLog(`🌐 Candidates API: ${candidatesData.success ? 'SUCCESS' : 'FAILED'} - Total: ${candidatesData.total || 0}`);
      } catch (err) {
        addLog(`❌ Candidates API failed: ${err}`);
      }

      // Test 7: Force data seeding if needed
      if (jobsCount === 0 || candidatesCount === 0) {
        addLog('📋 Test 7: No data found, seeding...');
        const { seedDataToStorage } = await import('../lib/seedData');
        await seedDataToStorage();
        
        // Re-test after seeding
        const newJobsCount = await jobsStore.iterate(() => {});
        const newCandidatesCount = await candidatesStore.iterate(() => {});
        addLog(`📊 After seeding: Jobs=${newJobsCount}, Candidates=${newCandidatesCount}`);
      }

      addLog('✅ Comprehensive test completed');

    } catch (error) {
      addLog(`❌ Test failed with error: ${error}`);
      console.error('IndexedDB Test Error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const clearAllData = async () => {
    try {
      addLog('🗑️ Clearing all IndexedDB data...');
      const { StorageService } = await import('../lib/storage');
      await StorageService.clearAllData();
      addLog('✅ All data cleared');
    } catch (error) {
      addLog(`❌ Clear failed: ${error}`);
    }
  };

  const forceRefresh = () => {
    addLog('🔄 Forcing page refresh...');
    setTimeout(() => window.location.reload(), 1000);
  };

  if (!isVisible) {
    return (
      <div className="fixed top-36 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="secondary"
          size="sm"
          className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg"
        >
          🔬 IndexedDB Test
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-36 right-4 z-50 bg-white border-2 border-purple-500 rounded-lg shadow-xl p-4 max-w-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">IndexedDB Diagnostic</h3>
        <Button
          onClick={() => setIsVisible(false)}
          variant="secondary"
          size="sm"
        >
          ×
        </Button>
      </div>

      {/* Logs */}
      <div className="mb-4 max-h-64 overflow-y-auto bg-gray-100 p-2 rounded text-xs font-mono">
        {logs.length === 0 ? (
          <div className="text-gray-500">Click "Run Test" to diagnose IndexedDB...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={runComprehensiveTest}
          variant="primary"
          size="sm"
          className="w-full"
          disabled={isRunning}
        >
          {isRunning ? '🔄 Running...' : '🔬 Run Comprehensive Test'}
        </Button>

        <Button
          onClick={clearAllData}
          variant="secondary"
          size="sm"
          className="w-full text-red-600"
          disabled={isRunning}
        >
          🗑️ Clear All Data
        </Button>

        <Button
          onClick={forceRefresh}
          variant="secondary"
          size="sm"
          className="w-full"
          disabled={isRunning}
        >
          🔄 Force Refresh
        </Button>
      </div>

      <div className="mt-4 text-xs text-gray-500 border-t pt-2">
        <div><strong>Issue:</strong> Data not fetched from IndexedDB</div>
        <div><strong>Solution:</strong> This test will identify the exact cause</div>
      </div>
    </div>
  );
};

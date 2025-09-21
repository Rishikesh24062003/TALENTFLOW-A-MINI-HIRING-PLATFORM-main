import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '../../store';
import { useRole } from '../ui/RoleBasedAccess';
import { cn } from '../../utils';

export const Layout: React.FC = () => {
  const { sidebarOpen } = useUIStore();
  const { isHR } = useRole();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className={cn(
        'transition-all duration-300 ease-in-out',
        // Only apply margin if user is HR (sidebar is visible)
        isHR() ? (sidebarOpen ? 'ml-64' : 'ml-16') : 'ml-0'
      )}>
        {/* Header */}
        <Header />
        
        {/* Page content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

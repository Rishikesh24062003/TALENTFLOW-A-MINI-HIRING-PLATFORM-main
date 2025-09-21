import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUIStore, useAppStore } from '../../store';
import { HROnly, useRole } from '../ui/RoleBasedAccess';
import { cn } from '../../utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const getPageTitle = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0 || segments[0] === 'dashboard') {
    return 'Dashboard';
  }
  
  const firstSegment = segments[0];
  const pageNames: Record<string, string> = {
    jobs: 'Jobs',
    candidates: 'Candidates',
    assessments: 'Assessments',
  };
  
  return pageNames[firstSegment] || firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
};

export const Header: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, logout } = useAppStore();
  const { isHR } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pageTitle = getPageTitle(location.pathname);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement global search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button - Only show for HR users */}
          <HROnly>
            <button
              type="button"
              className="lg:hidden -ml-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" />
            </button>
          </HROnly>

          {/* Page title */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>
          </div>
        </div>

        {/* Center - Search - Only show for HR users */}
        <HROnly>
          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search jobs, candidates, assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
                className="w-full"
              />
            </form>
          </div>
        </HROnly>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Notifications - Only show for HR users */}
          <HROnly>
            <div className="relative">
              <button
                type="button"
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" />
                {/* Notification badge */}
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-md">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            New candidate applied
                          </p>
                          <p className="text-sm text-gray-500">
                            John Doe applied for Senior Frontend Developer
                          </p>
                          <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-md">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            Assessment completed
                          </p>
                          <p className="text-sm text-gray-500">
                            Sarah Wilson completed the React Developer assessment
                          </p>
                          <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="w-full">
                        View all notifications
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </HROnly>

          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <UserCircleIcon className="h-6 w-6" />
              <span className="hidden sm:block text-sm font-medium">
                {user?.name || 'User'}
              </span>
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  
                  <button
                    type="button"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Cog6ToothIcon className="mr-3 h-4 w-4" />
                    Settings
                  </button>
                  
                  <button
                    type="button"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                      navigate('/auth');
                    }}
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global search overlay for mobile */}
      {searchQuery && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-3">
          <div className="text-sm text-gray-500">
            Searching for "{searchQuery}"...
          </div>
        </div>
      )}
    </header>
  );
};

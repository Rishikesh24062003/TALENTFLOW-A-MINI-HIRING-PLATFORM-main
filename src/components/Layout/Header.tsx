import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useUIStore, useAppStore } from '../../store';
import { HROnly } from '../ui/RoleBasedAccess';
import {
  Bars3Icon,
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
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* TalentFlow Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="hidden sm:block text-xl font-bold text-gray-900">
              TalentFlow
            </span>
          </Link>

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

        {/* Right side */}
        <div className="flex items-center space-x-2">
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
    </header>
  );
};

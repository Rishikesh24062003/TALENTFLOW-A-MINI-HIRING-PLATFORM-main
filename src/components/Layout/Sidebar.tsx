import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUIStore } from '../../store';
import { useRole } from '../ui/RoleBasedAccess';
import { cn } from '../../utils';
import {
  HomeIcon,
  BriefcaseIcon,
  UsersIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: number;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
  { name: 'Candidates', href: '/candidates', icon: UsersIcon },
  { name: 'Assessments', href: '/assessments', icon: DocumentTextIcon },
];

export const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { isHR } = useRole();
  const location = useLocation();

  // Don't render sidebar for candidates
  if (!isHR()) {
    return null;
  }

  return (
    <>
      {/* Desktop sidebar */}
      <div className={cn(
        'hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ease-in-out z-40',
        sidebarOpen ? 'lg:w-64' : 'lg:w-16'
      )}>
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
            <motion.div
              initial={false}
              animate={{ 
                width: sidebarOpen ? 'auto' : '32px',
                opacity: 1 
              }}
              className="flex items-center"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="ml-3 text-xl font-bold text-gray-900"
                >
                   <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >TalentFlow</Link>
                  
                </motion.span>
              )}
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center rounded-md text-sm font-medium transition-colors',
                    sidebarOpen ? 'px-3 py-2' : 'px-2 py-2 justify-center',
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'flex-shrink-0 h-5 w-5',
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-3"
                    >
                      {item.name}
                    </motion.span>
                  )}
                  {item.badge && sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ml-auto inline-block bg-primary-100 text-primary-600 text-xs rounded-full px-2 py-1"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Collapse button */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                'group flex items-center rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full',
                sidebarOpen ? 'px-3 py-2' : 'px-2 py-2 justify-center'
              )}
            >
              {sidebarOpen ? (
                <ChevronLeftIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              ) : (
                <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              )}
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-3"
                >
                  Collapse
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        'lg:hidden fixed inset-0 flex z-40',
        sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}>
        <motion.div
          initial={false}
          animate={{
            x: sidebarOpen ? 0 : '-100%',
            opacity: sidebarOpen ? 1 : 0,
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative flex w-full max-w-xs flex-1 flex-col bg-white"
        >
          {/* Close button */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <ChevronLeftIcon className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Mobile logo */}
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">
                TalentFlow
              </span>
            </div>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto inline-block bg-primary-100 text-primary-600 text-xs rounded-full px-2 py-1">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </motion.div>
      </div>
    </>
  );
};

import React from 'react';
import { useAppStore } from '../../store';

type UserRole = 'admin' | 'hr' | 'recruiter' | 'candidate';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user role
 */
export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}) => {
  const { user } = useAppStore();

  if (!user) {
    return <>{fallback}</>;
  }

  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

interface ProtectFromRoleProps {
  children: React.ReactNode;
  blockedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Component that hides content from specific roles
 */
export const ProtectFromRole: React.FC<ProtectFromRoleProps> = ({ 
  children, 
  blockedRoles, 
  fallback = null 
}) => {
  const { user } = useAppStore();

  if (!user) {
    return <>{fallback}</>;
  }

  if (blockedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface HROnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Shorthand component for HR/Admin/Recruiter only content
 */
export const HROnly: React.FC<HROnlyProps> = ({ children, fallback = null }) => {
  return (
    <RoleBasedAccess allowedRoles={['admin', 'hr', 'recruiter']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

interface CandidateOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Shorthand component for candidate only content
 */
export const CandidateOnly: React.FC<CandidateOnlyProps> = ({ children, fallback = null }) => {
  return (
    <RoleBasedAccess allowedRoles={['candidate']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Shorthand component for admin only content
 */
export const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback = null }) => {
  return (
    <RoleBasedAccess allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

/**
 * Custom hook for role-based logic
 */
export const useRole = () => {
  const { user } = useAppStore();

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const isHR = (): boolean => hasRole(['admin', 'hr', 'recruiter']);
  const isCandidate = (): boolean => hasRole('candidate');
  const isAdmin = (): boolean => hasRole('admin');

  return {
    user,
    hasRole,
    isHR,
    isCandidate,
    isAdmin,
    role: user?.role
  };
};

// context/PermissionContext.tsx
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useUserSession } from './UserSessionContext';

interface PermissionContextType {
  permissions: string[];
  roles: any[];
  isSuperAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  hasPermissions: (permissions: string[], anyPermission?: boolean) => boolean;
  loading: boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const { user } = useUserSession();
  const [permissions, setPermissions] = useState<string[]>(user?.permissions || []);
  const [roles, setRoles] = useState<any[]>([]);
  const [isSuperAdminState, setIsSuperAdminState] = useState<boolean>(() => {
    // Initialize from localStorage
    return localStorage.getItem('isSuperAdmin') === 'true';
  });
  const [loading, setLoading] = useState(true);

  // Function to fetch user permissions from API
  const fetchUserSessionData = async (): Promise<{permissions: string[], roles: any[], isSuperAdmin: boolean}> => {
    if (!user) {
      return { permissions: [], roles: [], isSuperAdmin: false };
    }

    try {
      // Call the session validation API endpoint to get current permissions and roles
      const response = await fetch('/api/auth/session', {
        headers: {
          'user-id': user.id.toString(),
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          permissions: data.permissions || [],
          roles: data.roles || [],
          isSuperAdmin: data.isSuperAdmin || false
        };
      } else {
        console.error('Failed to fetch user session data:', response.statusText);
        // fallback to permissions from session
        return {
          permissions: user.permissions || [],
          roles: [],
          isSuperAdmin: false
        };
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
      // fallback to permissions from session
      return {
        permissions: user.permissions || [],
        roles: [],
        isSuperAdmin: false
      };
    }
  };

  const refreshPermissions = async () => {
    if (!user) {
      setPermissions([]);
      setRoles([]);
      setIsSuperAdminState(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const sessionData = await fetchUserSessionData();
      setPermissions(sessionData.permissions);
      setRoles(sessionData.roles);
      setIsSuperAdminState(sessionData.isSuperAdmin);

      // Set super admin status in local storage for quick access
      localStorage.setItem('isSuperAdmin', sessionData.isSuperAdmin ? 'true' : 'false');
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions(user?.permissions || []);
      setRoles([]);
      setIsSuperAdminState(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPermissions();
  }, [user?.id]); // Refresh when user changes

  const hasPermission = (permission: string): boolean => {
    // Check if user is a super admin - if so, grant access to everything
    if (isSuperAdminState) return true;

    return permissions.includes(permission);
  };

  const hasPermissions = (requiredPermissions: string[], anyPermission: boolean = false): boolean => {
    // Check if user is a super admin - if so, grant access to everything
    if (isSuperAdminState) return true;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required means access granted
    }

    if (anyPermission) {
      // User needs ANY of the specified permissions
      return requiredPermissions.some(perm => hasPermission(perm));
    } else {
      // User needs ALL of the specified permissions
      return requiredPermissions.every(perm => hasPermission(perm));
    }
  };

  const value = {
    permissions,
    roles,
    isSuperAdmin: isSuperAdminState,
    hasPermission,
    hasPermissions,
    loading,
    refreshPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }

  // Add role-based access functions
  const hasRole = (roleName: string): boolean => {
    // Super admin has all roles
    if (context.isSuperAdmin) return true;
    return context.roles.some((role: any) => role.name === roleName);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    if (!roleNames || roleNames.length === 0) return true;
    // Super admin has all roles
    if (context.isSuperAdmin) return true;
    return context.roles.some((role: any) => roleNames.includes(role.name));
  };

  return {
    ...context,
    hasRole,
    hasAnyRole
  };
}
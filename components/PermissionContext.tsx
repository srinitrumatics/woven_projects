// context/PermissionContext.tsx
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useUserSession } from './UserSessionContext';

interface PermissionContextType {
  permissions: string[];
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
  const [loading, setLoading] = useState(true);

  // Function to fetch user permissions from API
  const fetchUserPermissions = async (): Promise<string[]> => {
    if (!user) {
      return [];
    }

    try {
      // Call the session validation API endpoint to get current permissions
      const response = await fetch('/api/auth/session', {
        headers: {
          'user-id': user.id.toString(),
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.permissions || [];
      } else {
        console.error('Failed to fetch user permissions:', response.statusText);
        return user.permissions || []; // fallback to permissions from session
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return user.permissions || []; // fallback to permissions from session
    }
  };

  const refreshPermissions = async () => {
    if (!user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userPermissions = await fetchUserPermissions();
      setPermissions(userPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions(user?.permissions || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPermissions();
  }, [user?.id]); // Refresh when user changes

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasPermissions = (requiredPermissions: string[], anyPermission: boolean = false): boolean => {
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
  return context;
}
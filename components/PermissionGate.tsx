// components/PermissionGate.tsx
'use client';

import { ReactNode } from 'react';
import { useUserPermissions } from '../hooks/useUserPermissions';

interface PermissionGateProps {
  children: ReactNode;
  requiredPermissions?: string[]; // Optional - if not provided, only check roles
  requiredRoles?: string[];       // Optional - if not provided, only check permissions
  anyPermission?: boolean; // If true, user needs ANY of the permissions, not ALL
  anyRole?: boolean;       // If true, user needs ANY of the roles, not ALL
  fallback?: ReactNode; // What to render if user doesn't have permissions
}

export default function PermissionGate({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  anyPermission = false,
  anyRole = false,
  fallback = null
}: PermissionGateProps) {
  const { hasPermissions, hasAnyRole, hasRole, loading } = useUserPermissions();

  // If still loading permissions, don't render anything (or render a loader)
  if (loading) {
    return null; // Or return a loading spinner
  }

  // Check if user has the required permissions (if specified)
  const permissionsCheckPassed = requiredPermissions.length === 0 ||
                                 hasPermissions(requiredPermissions, anyPermission);

  // Check if user has the required roles (if specified)
  const rolesCheckPassed = requiredRoles.length === 0;
  let specificRolesCheckPassed = true;

  if (requiredRoles.length > 0) {
    specificRolesCheckPassed = anyRole ?
      hasAnyRole(requiredRoles) :
      requiredRoles.every(role => hasRole(role));
  }

  // User has access if both permission and role checks pass
  const userHasAccess = permissionsCheckPassed && specificRolesCheckPassed;

  if (!userHasAccess) {
    return fallback;
  }

  return <>{children}</>;
}
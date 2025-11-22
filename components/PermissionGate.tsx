// components/PermissionGate.tsx
'use client';

import { ReactNode } from 'react';
import { useUserPermissions } from '../hooks/useUserPermissions';

interface PermissionGateProps {
  children: ReactNode;
  requiredPermissions: string[];
  anyPermission?: boolean; // If true, user needs ANY of the permissions, not ALL
  fallback?: ReactNode; // What to render if user doesn't have permissions
}

export default function PermissionGate({
  children,
  requiredPermissions,
  anyPermission = false,
  fallback = null
}: PermissionGateProps) {
  const { hasPermissions, loading } = useUserPermissions();

  // If still loading permissions, don't render anything (or render a loader)
  if (loading) {
    return null; // Or return a loading spinner
  }

  // Check if user has the required permissions
  const userHasAccess = hasPermissions(requiredPermissions, anyPermission);

  if (!userHasAccess) {
    return fallback;
  }

  return <>{children}</>;
}
// components/ProtectedRoute.tsx
'use client';

import { useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserPermissions } from '../hooks/useUserPermissions';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  anyPermission?: boolean; // If true, user needs ANY of the permissions, not ALL
  fallback?: ReactNode; // What to show if user doesn't have permissions
}

export default function ProtectedRoute({
  children,
  requiredPermissions = [],
  anyPermission = false,
  fallback = null
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPermissions, loading } = useUserPermissions();

  // If no session, redirect to login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // If still loading or checking permissions, show nothing (or a spinner)
  if (status === 'loading' || loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  // If authenticated but no required permissions to check, show children
  if (requiredPermissions.length === 0) {
    return <>{children}</>;
  }

  // Check if user has required permissions
  const userHasAccess = hasPermissions(requiredPermissions, anyPermission);

  if (!userHasAccess) {
    return fallback || <div>Access denied. You don't have the required permissions.</div>;
  }

  return <>{children}</>;
}
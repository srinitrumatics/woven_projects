// components/ProtectedPageWrapper.tsx
'use client';

import { useUserSession } from './UserSessionContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PermissionGate } from './PermissionGate';

interface ProtectedPageWrapperProps {
  children: React.ReactNode;
  requiredPermissions: string[];
  anyPermission?: boolean;
}

export default function ProtectedPageWrapper({
  children,
  requiredPermissions,
  anyPermission = false
}: ProtectedPageWrapperProps) {
  const { isAuthenticated, loading } = useUserSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by useEffect
  }

  return (
    <PermissionGate 
      requiredPermissions={requiredPermissions} 
      anyPermission={anyPermission}
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-5xl font-bold text-red-500 mb-4">403</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this resource.
            </p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      }
    >
      {children}
    </PermissionGate>
  );
}
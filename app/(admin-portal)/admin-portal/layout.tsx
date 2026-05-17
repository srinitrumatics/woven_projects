import React from 'react';
import { UserSessionProvider } from '@/components/UserSessionContext';
import { PermissionProvider } from '@/components/PermissionContext';
import Sidebar from '@/components/layouts/Sidebar';

// This layout applies ONLY to /admin-portal/* pages — not to /admin-login
export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserSessionProvider>
      <PermissionProvider>
        <Sidebar>
          {children}
        </Sidebar>
      </PermissionProvider>
    </UserSessionProvider>
  );
}

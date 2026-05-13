import React from 'react';
import '../globals.css';
import { UserSessionProvider } from '@/components/UserSessionContext';
import { PermissionProvider } from '@/components/PermissionContext';
import Sidebar from '@/components/layouts/Sidebar';

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

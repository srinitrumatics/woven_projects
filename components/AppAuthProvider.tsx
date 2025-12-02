// components/AppAuthProvider.tsx
'use client';

import React, { ReactNode } from 'react';
import { UserSessionProvider } from './UserSessionContext';
import { PermissionProvider } from './PermissionContext';

// Main auth provider component that wraps the app
export default function AppAuthProvider({ children }: { children: ReactNode }) {
  return (
    <UserSessionProvider>
      <PermissionProvider>
        {children}
      </PermissionProvider>
    </UserSessionProvider>
  );
}
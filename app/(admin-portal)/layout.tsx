import React from 'react';
import '../globals.css';

// Plain layout — no Sidebar. Sidebar is applied in admin-portal/layout.tsx
export default function AdminPortalGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import Sidebar from '@/components/layouts/Sidebar';
import { requireAuth } from '@/lib/session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is authenticated via Salesforce, but don't block permissions here
  // Sub-pages like /admin/users will have their own protection
  await requireAuth();

  return (
    <Sidebar>
      {children}
    </Sidebar>
  );
}
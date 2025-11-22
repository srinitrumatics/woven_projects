import Sidebar from "@/components/layouts/Sidebar";
import Link from "next/link";
import { requireAuth } from '../../lib/auth';

// Server-side authorization check
export default async function AdminPage() {
  // This will redirect if user doesn't have required permissions
  await requireAuth(); // This checks if user is authenticated

  return (
    <Sidebar>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage users, roles, permissions, and system settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Link href="/admin/users" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage user accounts and assign roles</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/roles" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Roles</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create and manage roles with permissions</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/permissions" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Permissions</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Define system permissions</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Role-Based Access Control (RBAC)</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Our RBAC system allows you to control access to system resources through a three-tiered approach:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
          <li><strong>Users</strong> - Individual accounts in the system</li>
          <li><strong>Roles</strong> - Collections of permissions</li>
          <li><strong>Permissions</strong> - Specific actions that can be performed</li>
        </ul>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Start by creating permissions, then roles, and finally assign roles to users.
        </p>
      </div>
    </Sidebar>
  );
}

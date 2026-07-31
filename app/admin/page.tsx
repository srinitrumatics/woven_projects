'use client';

import Link from "next/link";
import ProtectedRoute from '../../components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white ">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 truncate" title="Manage organizations and system settings">
            Manage organizations and system settings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Link href="/admin/organizations" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow truncate">
            <div className="flex items-center min-w-0">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white ">Organizations</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 truncate" title="Manage organizations and their Salesforce connections">Manage organizations and their Salesforce connections</p>
              </div>
            </div>
          </Link>
        </div>
      </>
    </ProtectedRoute>
  );
}

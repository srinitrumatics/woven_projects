"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusIcon, BuildingOfficeIcon, GlobeAltIcon, CalendarIcon, TrashIcon, PencilSquareIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

type Organization = {
  id: string;
  name: string;
  orgId: string;
  salesforceUrl: string;
  createdAt: string;
};

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/organizations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrgs(data.organizations);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching organizations:', err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will NOT delete the provisioned schema automatically.`)) return;
    
    try {
      const res = await fetch(`/api/admin/organizations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOrgs(orgs.filter(org => org.id !== id));
      }
    } catch (err) {
      console.error('Error deleting organization:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Organizations</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage detached tenant environments and provisioning
          </p>
        </div>
        <Link
          href="/admin-portal/organizations/create"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Create New Tenant
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 py-12 px-6 text-center">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tenants active</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start by creating your first detached organization.</p>
          <div className="mt-6">
            <Link
              href="/admin-portal/organizations/create"
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              New Tenant
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BuildingOfficeIcon className="h-6 w-6" />
                  </div>
                  <div className="flex space-x-2">
                    <button className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(org.id, org.name)}
                      className="rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-white dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{org.name}</h3>
                  <p className="mt-1 text-sm font-mono text-gray-500 dark:text-gray-400">{org.orgId || 'NO-ID'}</p>
                </div>
                <div className="mt-6 flex flex-col space-y-3">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <GlobeAltIcon className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="truncate">{org.salesforceUrl || 'No Salesforce URL'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                    <span>{new Date(org.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
                <button className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary/80">
                  <span>Manage Schema</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

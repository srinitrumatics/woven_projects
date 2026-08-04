"use client";

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { PlusIcon, BuildingOfficeIcon, GlobeAltIcon, CalendarIcon, TrashIcon, PencilSquareIcon, ArrowTopRightOnSquareIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/components/ui/Toast';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Pagination from '@/components/ui/Pagination';
import { useSortableData } from '@/hooks/useSortableData';

type Organization = {
  id: string;
  name: string;
  orgId: string;
  salesforceUrl: string;
  siteUrl: string;
  createdAt: string;
};

const ITEMS_PER_PAGE = 9;

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { confirm: confirmToast, success: successToast, error: errorToast } = useToast();

  const fetchOrganizations = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch('/api/admin/organizations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrgs(data.organizations);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching organizations:', err);
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const filteredOrgs = useMemo(() => {
    if (!searchQuery) return orgs;
    const query = searchQuery.toLowerCase();
    return orgs.filter(org => org.name.toLowerCase().includes(query));
  }, [orgs, searchQuery]);

  const { items: sortedOrgs, requestSort, sortConfig } = useSortableData<Organization>(filteredOrgs);

  const totalPages = Math.ceil(sortedOrgs.length / ITEMS_PER_PAGE);
  const paginatedOrgs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedOrgs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedOrgs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig]);

  const handleDelete = async (id: string, name: string) => {
    confirmToast(`Are you sure you want to delete ${name}? This will NOT delete the provisioned schema automatically.`, async () => {
      try {
        const res = await fetch(`/api/admin/organizations/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setOrgs(orgs.filter(org => org.id !== id));
          successToast('Organization deleted successfully');
        } else {
          errorToast('Failed to delete organization');
        }
      } catch (err) {
        console.error('Error deleting organization:', err);
        errorToast('Error deleting organization');
      }
    });
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

      {!loading && !error && orgs.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organizations..."
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <select
            value={sortConfig ? `${String(sortConfig.key)}-${sortConfig.direction}` : ''}
            onChange={(e) => {
              const [key] = e.target.value.split('-');
              requestSort(key as keyof Organization);
            }}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            <option value="">Sort by...</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="createdAt-asc">Created (Oldest)</option>
            <option value="createdAt-desc">Created (Newest)</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>
          ))}
        </div>
      ) : error ? (
        <ErrorMessage
          title="Failed to load organizations"
          message="Something went wrong while loading organizations. Please try again."
          onRetry={fetchOrganizations}
        />
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
      ) : sortedOrgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 py-12 px-6 text-center">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No organizations match your search</h3>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedOrgs.map((org) => (
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
                    <Link href={`/admin-portal/organizations/${org.id}`} aria-label="Edit organization" className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700">
                      <PencilSquareIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(org.id, org.name)}
                      aria-label="Delete organization"
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
                <button
                  onClick={() => {
                    const url = org.siteUrl;
                    if (!url) {
                      errorToast('No site URL configured for this organization.');
                      return;
                    }
                    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                    window.open(fullUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex w-full items-center justify-between text-xs font-semibold  text-primary hover:text-primary/80"
                >
                  <span>Launch Webapp</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedOrgs.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemName="organizations"
        />
        </>
      )}
    </div>
  );
}

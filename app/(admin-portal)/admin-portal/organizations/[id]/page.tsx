"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  GlobeAltIcon,
  LockClosedIcon,
  BuildingOfficeIcon,
  ServerStackIcon
} from '@heroicons/react/24/outline';

export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    orgId: '',
    salesforceUrl: '',
    salesforceAuthUrl: '',
    clientId: '',
    clientSecret: '',
    siteUrl: '',
    algoliaIndexName: '',
    algoliaSchema: ''
  });

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/admin/organizations/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.organization) {
          setFormData({
            name: data.organization.name || '',
            orgId: data.organization.orgId || '',
            salesforceUrl: data.organization.salesforceUrl || '',
            salesforceAuthUrl: data.organization.salesforceAuthUrl || '',
            clientId: data.organization.clientId || '',
            clientSecret: data.organization.clientSecret || '',
            siteUrl: data.organization.siteUrl || '',
            algoliaIndexName: data.organization.algoliaIndexName || '',
            algoliaSchema: data.organization.algoliaSchema || ''
          });
        } else {
          setError('Organization not found');
        }
        setFetching(false);
      })
      .catch(err => {
        console.error('Error fetching org:', err);
        setError('Failed to fetch organization details');
        setFetching(false);
      });
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/organizations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update organization');

      setSuccess('Organization updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Tenant: {formData.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Modify organization details and integration configurations.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
        >
          <ArrowLeftIcon className="-ml-1 mr-2 w-5 h-5" aria-hidden="true" />
          Back to Organizations
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden p-8 space-y-8">
        {/* Core Info */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Core Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Organization Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-2"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Site URL / Host</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="siteUrl"
                  value={formData.siteUrl}
                  onChange={handleInputChange}
                  className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-2"
                  placeholder="e.g. acme.wovn.com"
                />
              </div>
              <p className="text-xs text-gray-400">Host URL mapping for dynamic resolution.</p>
            </div>
          </div>
        </div>

        {/* Salesforce Integration */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Salesforce Integration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Salesforce Org ID <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="orgId"
                required
                value={formData.orgId}
                onChange={handleInputChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm font-mono py-2 px-3"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Salesforce Instance URL <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  name="salesforceUrl"
                  required
                  value={formData.salesforceUrl}
                  onChange={handleInputChange}
                  className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-2"
                />
              </div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Salesforce Auth URL <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  name="salesforceAuthUrl"
                  required
                  value={formData.salesforceAuthUrl}
                  onChange={handleInputChange}
                  className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-2"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Client ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-2"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Secret</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="clientSecret"
                  value={formData.clientSecret}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-2"
                />
              </div>
              <p className="text-xs text-gray-400">Leave blank to keep unchanged if previously set.</p>
            </div>
          </div>
        </div>

        {/* Algolia Config */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Algolia Config</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Algolia Index Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ServerStackIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="algoliaIndexName"
                  value={formData.algoliaIndexName}
                  onChange={handleInputChange}
                  className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm font-mono py-2"
                  placeholder="woven_products_..."
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Algolia Schema</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ServerStackIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="algoliaSchema"
                  value={formData.algoliaSchema}
                  onChange={handleInputChange}
                  className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-2"
                  placeholder="e.g. JSON overrides or schema name"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-md bg-primary px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 transition-all"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

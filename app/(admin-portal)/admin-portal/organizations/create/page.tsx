"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CircleStackIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    orgId: '',
    siteUrl: '',
    salesforceUrl: '',
    salesforceAuthUrl: '',
    clientId: '',
    clientSecret: '',
  });

  const [createdOrgId, setCreatedOrgId] = useState('');

  const [schemaData, setSchemaData] = useState({
    schemaName: '',
    indexName: ''
  });

  // Derive schemaName from orgId using the sf_ convention (matches the sync worker)
  const deriveSchemaName = (orgId: string) =>
    orgId ? `sf_${orgId.toLowerCase().replace(/[^a-z0-9]/g, '')}` : '';

  const deriveIndexName = (schemaName: string) =>
    schemaName ? `woven_products_${schemaName}` : '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (step === 1) {
      setFormData(prev => {
        const updated = { ...prev, [name]: value };
        // Auto-derive schema and index from orgId as user types
        if (name === 'orgId') {
          const schema = deriveSchemaName(value);
          setSchemaData({ schemaName: schema, indexName: deriveIndexName(schema) });
        }
        return updated;
      });
    } else {
      setSchemaData(prev => {
        const updated = { ...prev, [name]: value };
        // When schemaName changes, auto-update indexName too
        if (name === 'schemaName') {
          updated.indexName = deriveIndexName(value);
        }
        return updated;
      });
    }
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create organization');

      // Use orgId-based naming to match worker convention: sf_<orgid>
      const schema = deriveSchemaName(formData.orgId || formData.name);
      setCreatedOrgId(data.organization?.id || '');
      setSchemaData({
        schemaName: schema,
        indexName: deriveIndexName(schema),
      });
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/organizations/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemaName: schemaData.schemaName,
          indexName: schemaData.indexName
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to provision schema');

      router.push('/admin-portal/organizations');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between">
        {/* Left: Step Indicators */}
        <div className="flex items-center space-x-4 flex-1">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
            {step > 1 ? <CheckCircleIcon className="h-6 w-6" /> : '1'}
          </div>
          <div className="h-0.5 w-12 bg-gray-200">
            <div className={`h-full bg-primary transition-all duration-500 ${step > 1 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
            2
          </div>
        </div>

        {/* Center: Title and Subtitle */}
        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {step === 1 ? 'Tenant Registry' : 'Resource Provisioning'}
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Step {step} of 2</p>
        </div>

        {/* Right: Back Button */}
        <div className="flex justify-end flex-1">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 w-5 h-5" aria-hidden="true" />
            Back to Organizations
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
          <div className="flex">
            <ShieldCheckIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            <div className="ml-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        {step === 1 ? (
          <form onSubmit={handleNextStep} className="p-8 space-y-6">
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
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Salesforce Org ID <span className="text-red-500">*</span>
                  <span className="ml-1 text-xs text-gray-400 font-normal">(18-char, e.g. 00D...)</span>
                </label>
                <input
                  type="text"
                  name="orgId"
                  required
                  value={formData.orgId}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm font-mono py-2 px-3"
                  placeholder="00DgK000007zMR7UAM"
                />
                {formData.orgId && (
                  <p className="text-xs text-primary font-mono mt-1">
                    Schema: <strong>{deriveSchemaName(formData.orgId)}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
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
                <p className="text-xs text-gray-400">Host URL used to dynamically resolve this organization's configuration.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="https://acme.my.salesforce.com"
                  />
                </div>
              </div>
              <div className="space-y-1">
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
                    placeholder="https://acme.my.salesforce.com/services/oauth2/token"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Client ID <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="clientId"
                    required
                    value={formData.clientId}
                    onChange={handleInputChange}
                    className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-2"
                    placeholder="3MVG9..."
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Secret <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="clientSecret"
                    required
                    value={formData.clientSecret}
                    onChange={handleInputChange}
                    className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-2"
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 transition-all"
              >
                {loading ? 'Creating...' : 'Register Identity'}
                <ChevronRightIcon className="ml-2 w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleProvision} className="p-8 space-y-8">
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 flex gap-4 border border-green-200 dark:border-green-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40 text-green-600">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">✓ Organization Registered</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <strong>{formData.name}</strong> has been saved to the <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">organizations</code> table.
                  Now provision its isolated schema and Algolia search index.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">What will be created</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 font-mono">
                  PostgreSQL schema: {schemaData.schemaName || '—'}
                </span>
                <span className="rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 font-mono">
                  Algolia index: {schemaData.indexName || '—'}
                </span>
                <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1">
                  algolia_sync_queue + algolia_index_config + triggers
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  PostgreSQL Schema Name
                  <span className="ml-2 text-xs text-gray-400 font-normal">auto-derived from Org ID</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CircleStackIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="schemaName"
                    required
                    value={schemaData.schemaName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm font-mono py-2"
                    placeholder="sf_00dgk000007zmr7uam"
                  />
                </div>
                <p className="text-xs text-gray-400">Convention: <code>sf_{'<'}orgid_lowercase{'>'}</code> — must match ALGOLIA_SYNC_SCHEMAS in worker</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Algolia Index Name
                  <span className="ml-2 text-xs text-gray-400 font-normal">auto-derived from schema</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="indexName"
                    required
                    value={schemaData.indexName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm font-mono py-2"
                    placeholder="woven_products_sf_00dgk000007zmr7uam"
                  />
                </div>
                <p className="text-xs text-gray-400">This index will be created in your Algolia account dashboard</p>
              </div>

              <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>After provisioning</strong>, add the schema to your worker env:
                </p>
                <code className="text-xs block mt-1 text-amber-800 dark:text-amber-300 font-mono">
                  ALGOLIA_SYNC_SCHEMAS=...existing...,{schemaData.schemaName || 'sf_neworg'}
                </code>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                Back to registry
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded-md bg-primary px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 transition-all"
              >
                {loading ? 'Provisioning...' : 'Complete Infrastructure Build'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

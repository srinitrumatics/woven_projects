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
    salesforceUrl: '',
    salesforceAuthUrl: '',
    clientId: '',
    clientSecret: '',
  });

  const [schemaData, setSchemaData] = useState({
    schemaName: '',
    indexName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (step === 1) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setSchemaData(prev => ({ ...prev, [name]: value }));
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

      const sanitizedName = formData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      setSchemaData({
        schemaName: `org_${sanitizedName}`,
        indexName: `idx_${sanitizedName}_products`
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
    <div className="max-w-4xl mx-auto space-y-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-sm text-gray-500 hover:text-primary transition-colors"
      >
        <ArrowLeftIcon className="mr-2 w-4 h-4" />
        Back to Organizations
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
        <div className="text-right">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {step === 1 ? 'Tenant Registry' : 'Resource Provisioning'}
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Step {step} of 2</p>
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Organization Name</label>
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
                    className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">External Org ID</label>
                <input
                  type="text"
                  name="orgId"
                  value={formData.orgId}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-mono"
                  placeholder="00D..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Salesforce URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  name="salesforceUrl"
                  value={formData.salesforceUrl}
                  onChange={handleInputChange}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="https://acme.my.salesforce.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
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
                    className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                    className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
            <div className="rounded-lg bg-primary/5 p-4 flex gap-4 border border-primary/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Identity Confirmed</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Tenant <strong>{formData.name}</strong> has been successfully registered. Now we will provision the isolated PostgreSQL environment.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Database Schema Name</label>
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
                    className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Algolia Index ID</label>
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
                    className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-mono"
                  />
                </div>
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

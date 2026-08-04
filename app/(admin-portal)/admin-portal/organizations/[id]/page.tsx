"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ArrowLeftIcon,
  GlobeAltIcon,
  LockClosedIcon,
  BuildingOfficeIcon,
  ServerStackIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

type SyncRun = {
  type: 'load' | 'index';
  runId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  // load-specific
  salesforceTotal?: number;
  upserted?: number;
  skipped?: number;
  // index-specific
  totalEnqueued?: number;
  succeeded?: number;
  pending?: number;
  failed?: number;
};

export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [load, setLoad] = useState<{
    status: 'idle' | 'running' | 'completed' | 'completed_with_errors' | 'failed';
    runId: string | null;
    upserted: number;
    salesforceTotal: number;
    skipped: number;
    failed: number;
    error: string;
  }>({ status: 'idle', runId: null, upserted: 0, salesforceTotal: 0, skipped: 0, failed: 0, error: '' });

  const [index, setIndex] = useState<{
    status: 'idle' | 'running' | 'completed' | 'completed_with_errors' | 'failed';
    runId: string | null;
    totalEnqueued: number;
    succeeded: number;
    failed: number;
    pending: number;
    error: string;
  }>({ status: 'idle', runId: null, totalEnqueued: 0, succeeded: 0, failed: 0, pending: 0, error: '' });

  const [history, setHistory] = useState<{ loadRuns: SyncRun[]; indexRuns: SyncRun[] }>({ loadRuns: [], indexRuns: [] });
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [failuresByRun, setFailuresByRun] = useState<Record<string, { recordId: string; errorMessage: string }[]>>({});

  const fetchHistory = React.useCallback(() => {
    if (!id) return;
    fetch(`/api/admin/organizations/${id}/sync/history`)
      .then((res) => res.json())
      .then((data) => {
        if (data.loadRuns && data.indexRuns) setHistory(data);
      })
      .catch(() => { })
      .finally(() => setHistoryLoaded(true));
  }, [id]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Refresh history whenever a run reaches a terminal state, and resume
  // polling automatically if the page loads while a run is still active
  // (e.g. the admin navigated away and came back) — the run itself keeps
  // going in the background regardless of whether anyone is watching.
  useEffect(() => {
    if (!historyLoaded) return;
    const activeLoad = history.loadRuns.find((r) => r.status === 'running');
    if (activeLoad && load.status === 'idle') {
      setLoad((prev) => ({ ...prev, runId: activeLoad.runId, status: 'running' }));
    }
    const activeIndex = history.indexRuns.find((r) => r.status === 'running');
    if (activeIndex && index.status === 'idle') {
      setIndex((prev) => ({ ...prev, runId: activeIndex.runId, status: 'running', totalEnqueued: activeIndex.totalEnqueued || 0 }));
    }
  }, [historyLoaded, history]);

  useEffect(() => {
    if (load.status === 'completed' || load.status === 'completed_with_errors' || load.status === 'failed') fetchHistory();
  }, [load.status, fetchHistory]);
  useEffect(() => {
    if (index.status === 'completed' || index.status === 'completed_with_errors' || index.status === 'failed') fetchHistory();
  }, [index.status, fetchHistory]);

  const toggleFailures = async (run: SyncRun) => {
    if (expandedRunId === run.runId) {
      setExpandedRunId(null);
      return;
    }
    setExpandedRunId(run.runId);
    if (!failuresByRun[run.runId]) {
      const res = await fetch(`/api/admin/organizations/${id}/sync/status?type=index&runId=${run.runId}&includeFailures=true`);
      const data = await res.json();
      if (res.ok && data.failures) {
        setFailuresByRun((prev) => ({ ...prev, [run.runId]: data.failures }));
      }
    }
  };

  const latestIndexRun = history.indexRuns[0];
  const canRetryIndexing = latestIndexRun && (latestIndexRun.failed || 0) > 0 && index.status !== 'running';

  const lastCompletedLoad = history.loadRuns.find((r) => r.status.startsWith('completed'));
  const lastCompletedIndex = history.indexRuns.find((r) => r.status.startsWith('completed'));

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

  const handleLoadProducts = async () => {
    setLoad((prev) => ({ ...prev, status: 'running', error: '' }));

    try {
      const res = await fetch(`/api/admin/organizations/${id}/sync/load`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to start Load Products');

      setLoad((prev) => ({ ...prev, runId: data.runId, status: 'running' }));
    } catch (err: any) {
      setLoad((prev) => ({ ...prev, status: 'idle', error: err.message }));
    }
  };

  // Poll load progress every 5s while a run is active (research.md §4).
  useEffect(() => {
    if (load.status !== 'running' || !load.runId) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/admin/organizations/${id}/sync/status?type=load&runId=${load.runId}`);
        const data = await res.json();
        if (!res.ok || cancelled) return;

        setLoad((prev) => ({
          ...prev,
          upserted: data.upserted,
          salesforceTotal: data.salesforceTotal,
          skipped: data.skipped,
          failed: data.failed,
          status: data.status,
          error: data.status === 'failed' ? (data.errorMessage || 'Load failed') : '',
        }));
      } catch {
        // transient poll failure — try again on the next tick
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [load.status, load.runId, id]);

  const handleIndexProducts = async () => {
    setIndex((prev) => ({ ...prev, status: 'running', error: '' }));

    try {
      const res = await fetch(`/api/admin/organizations/${id}/sync/index`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setIndex((prev) => ({ ...prev, status: 'idle', error: data.error || 'Failed to start indexing' }));
        return;
      }

      setIndex((prev) => ({ ...prev, runId: data.runId, status: 'running', totalEnqueued: data.totalEnqueued }));
    } catch (err: any) {
      setIndex((prev) => ({ ...prev, status: 'idle', error: err.message }));
    }
  };

  // Poll index progress every 5s while a run is active (research.md §4).
  useEffect(() => {
    if (index.status !== 'running' || !index.runId) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/admin/organizations/${id}/sync/status?type=index&runId=${index.runId}`);
        const data = await res.json();
        if (!res.ok || cancelled) return;

        setIndex((prev) => ({
          ...prev,
          totalEnqueued: data.totalEnqueued,
          succeeded: data.succeeded,
          failed: data.failed,
          pending: data.pending,
          status: data.status,
        }));
      } catch {
        // transient poll failure — try again on the next tick
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [index.status, index.runId, id]);

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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Tenant: {formData.name}</h1>
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
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Salesforce Org ID</label>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <LockClosedIcon className="h-3 w-3" />
                  Locked
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="orgId"
                  value={formData.orgId}
                  readOnly
                  tabIndex={-1}
                  className="block w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 sm:text-sm font-mono py-2 px-3 cursor-not-allowed select-all"
                />
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500">Org ID is fixed after provisioning and cannot be changed.</p>
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
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Algolia Index Name</label>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <LockClosedIcon className="h-3 w-3" />
                  Locked
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ServerStackIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="algoliaIndexName"
                  value={formData.algoliaIndexName}
                  readOnly
                  tabIndex={-1}
                  className="block w-full pl-10 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 sm:text-sm font-mono py-2 cursor-not-allowed select-all"
                />
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500">Index name is fixed after provisioning and cannot be changed.</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Algolia Schema</label>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <LockClosedIcon className="h-3 w-3" />
                  Locked
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ServerStackIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="algoliaSchema"
                  value={formData.algoliaSchema}
                  readOnly
                  tabIndex={-1}
                  className="block w-full pl-10 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 sm:text-sm py-2 cursor-not-allowed select-all"
                />
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500">Schema is fixed after provisioning and cannot be changed.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700 gap-4">
          <div className="flex flex-col gap-3 w-full">
            {(lastCompletedLoad || lastCompletedIndex) && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                {lastCompletedLoad && (
                  <span>Last loaded: {new Date(lastCompletedLoad.completedAt || lastCompletedLoad.startedAt).toLocaleString()}</span>
                )}
                {lastCompletedIndex && (
                  <span>Last indexed: {new Date(lastCompletedIndex.completedAt || lastCompletedIndex.startedAt).toLocaleString()}</span>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleLoadProducts}
                disabled={load.status === 'running'}
                className="inline-flex items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-50 transition-all"
              >
                {load.status === 'running' ? (
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                ) : (
                  <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                )}
                Load Products
              </button>

              {load.status === 'running' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200 text-sm">
                  {load.salesforceTotal > 0
                    ? `${load.upserted.toLocaleString()} / ${load.salesforceTotal.toLocaleString()} loaded`
                    : 'Fetching products from Salesforce…'}
                </div>
              )}
              {(load.status === 'completed' || load.status === 'completed_with_errors') && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">
                  <CheckCircleIcon className="h-4 w-4" />
                  {load.upserted.toLocaleString()} products loaded
                  {load.failed > 0 ? ` · ${load.failed} failed` : ''}
                </div>
              )}
              {(load.status === 'failed' || load.error) && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                  <XCircleIcon className="h-4 w-4" />
                  {load.error || 'Load failed'}
                </div>
              )}

              <button
                type="button"
                onClick={handleIndexProducts}
                disabled={index.status === 'running'}
                className="inline-flex items-center justify-center rounded-md bg-purple-50 dark:bg-purple-900/30 px-4 py-2.5 text-sm font-semibold text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 disabled:opacity-50 transition-all"
              >
                {index.status === 'running' ? (
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                ) : (
                  <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                )}
                Index Products
              </button>

              {index.status === 'running' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-md border border-purple-200 text-sm">
                  {index.succeeded.toLocaleString()} / {index.totalEnqueued.toLocaleString()} indexed
                </div>
              )}
              {(index.status === 'completed' || index.status === 'completed_with_errors') && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">
                  <CheckCircleIcon className="h-4 w-4" />
                  {index.succeeded.toLocaleString()} products indexed
                  {index.failed > 0 ? ` · ${index.failed} failed` : ''}
                </div>
              )}
              {index.error && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                  <XCircleIcon className="h-4 w-4" />
                  {index.error}
                </div>
              )}

              {canRetryIndexing && (
                <button
                  type="button"
                  onClick={handleIndexProducts}
                  className="inline-flex items-center justify-center rounded-md bg-amber-50 dark:bg-amber-900/30 px-4 py-2.5 text-sm font-semibold text-amber-700 dark:text-amber-300 shadow-sm border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all"
                >
                  <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                  Retry Indexing ({latestIndexRun.failed} failed)
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 transition-all w-full sm:w-auto"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden p-8 space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-gray-400" />
          Sync History
        </h3>

        {!historyLoaded ? (
          <p className="text-sm text-gray-400">Loading history…</p>
        ) : history.loadRuns.length === 0 && history.indexRuns.length === 0 ? (
          <p className="text-sm text-gray-400">No sync runs yet.</p>
        ) : (
          <div className="space-y-2">
            {[...history.loadRuns.map((r) => ({ ...r, type: 'load' as const })), ...history.indexRuns.map((r) => ({ ...r, type: 'index' as const }))]
              .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
              .map((run) => (
                <div key={`${run.type}-${run.runId}`} className="rounded-md border border-gray-200 dark:border-gray-700">
                  <div
                    className={`flex items-center justify-between px-4 py-3 text-sm ${run.type === 'index' && (run.failed || 0) > 0 ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/40' : ''}`}
                    onClick={() => { if (run.type === 'index' && (run.failed || 0) > 0) toggleFailures(run); }}
                    role={run.type === 'index' && (run.failed || 0) > 0 ? 'button' : undefined}
                    tabIndex={run.type === 'index' && (run.failed || 0) > 0 ? 0 : undefined}
                    aria-expanded={run.type === 'index' && (run.failed || 0) > 0 ? expandedRunId === run.runId : undefined}
                    onKeyDown={(e) => {
                      if (run.type === 'index' && (run.failed || 0) > 0 && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        toggleFailures(run);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${run.type === 'load' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'}`}>
                        {run.type === 'load' ? 'Load' : 'Index'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {new Date(run.startedAt).toLocaleString()}
                      </span>
                      <StatusBadge status={run.status} variant="compact" />
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      {run.type === 'load'
                        ? <span>{(run.upserted || 0).toLocaleString()} loaded{run.failed ? ` · ${run.failed} failed` : ''}</span>
                        : <span>{(run.succeeded || 0).toLocaleString()} indexed{run.failed ? ` · ${run.failed} failed` : ''}</span>}
                      {run.type === 'index' && (run.failed || 0) > 0 && (
                        expandedRunId === run.runId ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  {run.type === 'index' && expandedRunId === run.runId && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-4 py-3 text-xs space-y-1 max-h-48 overflow-y-auto">
                      {(failuresByRun[run.runId] || []).length === 0 ? (
                        <p className="text-gray-400">Loading failure details…</p>
                      ) : (
                        failuresByRun[run.runId].map((f, i) => (
                          <p key={i} className="text-red-600 dark:text-red-400 font-mono">
                            {f.recordId}: {f.errorMessage}
                          </p>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

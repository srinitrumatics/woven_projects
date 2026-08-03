'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Organization } from '../../../db/schema';
import { organizationApi } from '../../../lib/api/organization-api';
import {
  Plus, Edit, Trash2, Building2, Sparkles, Search,
  ChevronLeft, ChevronRight, X, RefreshCw, ExternalLink,
  CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';
import { Table, THead, TBody, Th, Td } from "@/components/ui/DataTable";

const ITEMS_PER_PAGE = 20;

type SyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface SyncState {
  status: SyncStatus;
  message: string;
}

const OrganizationManagement: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  // Per-org sync state
  const [syncStates, setSyncStates] = useState<Record<string, SyncState>>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    orgId: '',
    salesforceUrl: '',
    salesforceAuthUrl: '',
    clientId: '',
    clientSecret: '',
    siteUrl: '',
    algoliaIndexName: '',
    algoliaSchema: '',
  });

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const orgsData = await organizationApi.getOrganizations();
      setOrganizations(orgsData);
    } catch (err) {
      setError('Failed to load organizations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter organizations based on search term
  const filteredOrganizations = useMemo(() => {
    if (!searchTerm) return organizations;
    const term = searchTerm.toLowerCase();
    return organizations.filter(org =>
      org.name.toLowerCase().includes(term) ||
      (org.description && org.description.toLowerCase().includes(term))
    );
  }, [organizations, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredOrganizations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrganizations = filteredOrganizations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  React.useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        orgId: formData.orgId || undefined,
        salesforceUrl: formData.salesforceUrl || undefined,
        salesforceAuthUrl: formData.salesforceAuthUrl || undefined,
        clientId: formData.clientId || undefined,
        clientSecret: formData.clientSecret || undefined,
        siteUrl: formData.siteUrl || undefined,
        algoliaIndexName: formData.algoliaIndexName || undefined,
        algoliaSchema: formData.algoliaSchema || undefined,
      };
      if (editingOrg) {
        await organizationApi.updateOrganization(editingOrg.id, payload);
      } else {
        await organizationApi.createOrganization(payload);
      }
      setFormData({ name: '', description: '', orgId: '', salesforceUrl: '', salesforceAuthUrl: '', clientId: '', clientSecret: '', siteUrl: '', algoliaIndexName: '', algoliaSchema: '' });
      setEditingOrg(null);
      setShowForm(false);
      await loadOrganizations();
    } catch (err) {
      setError('Failed to save organization');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (org: Organization) => {
    setFormData({
      name: org.name,
      description: org.description || '',
      orgId: (org as any).orgId || '',
      salesforceUrl: (org as any).salesforceUrl || '',
      salesforceAuthUrl: (org as any).salesforceAuthUrl || '',
      clientId: (org as any).clientId || '',
      clientSecret: (org as any).clientSecret || '',
      siteUrl: (org as any).siteUrl || '',
      algoliaIndexName: (org as any).algoliaIndexName || '',
      algoliaSchema: (org as any).algoliaSchema || '',
    });
    setEditingOrg(org);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this organization? This will permanently drop the database schema and Algolia index.')) {
      try {
        await organizationApi.deleteOrganization(id);
        await loadOrganizations();
      } catch (err) {
        setError('Failed to delete organization');
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', orgId: '', salesforceUrl: '', salesforceAuthUrl: '', clientId: '', clientSecret: '', siteUrl: '', algoliaIndexName: '', algoliaSchema: '' });
    setEditingOrg(null);
    setShowForm(false);
  };

  // --- NEW: Add Products to Index ---
  const handleSyncProducts = async (org: Organization) => {
    const orgId = org.id;
    setSyncStates(prev => ({ ...prev, [orgId]: { status: 'loading', message: 'Syncing from Salesforce...' } }));

    try {
      const res = await fetch(`/api/admin/organizations/${orgId}/sync`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      const { summary } = data;
      const msg = `✅ ${summary.dbUpserted} products synced · ${summary.algoliaPushed} pushed to Algolia`;
      setSyncStates(prev => ({ ...prev, [orgId]: { status: 'success', message: msg } }));

      // Auto-clear after 6 s
      setTimeout(() => setSyncStates(prev => ({ ...prev, [orgId]: { status: 'idle', message: '' } })), 6000);
    } catch (err: any) {
      setSyncStates(prev => ({ ...prev, [orgId]: { status: 'error', message: err.message } }));
      setTimeout(() => setSyncStates(prev => ({ ...prev, [orgId]: { status: 'idle', message: '' } })), 8000);
    }
  };

  // --- NEW: Launch Webapp ---
  const handleLaunchWebapp = (org: Organization) => {
    const url = org.siteUrl;
    if (!url) {
      alert('No site URL configured for this organization. Please set a Site URL first.');
      return;
    }
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-16 bg-gray-200 rounded-2xl mb-8 animate-pulse"></div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Organizations</div>
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary/5 to-primary-dark/10 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Organization Management
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Manage organizations and their settings
                  </p>
                </div>
              </div>
              {!showForm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setFormData({ name: '', description: '', orgId: '', salesforceUrl: '', salesforceAuthUrl: '', clientId: '', clientSecret: '', siteUrl: '', algoliaIndexName: '', algoliaSchema: '' }); setEditingOrg(null); setShowForm(true); }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add New Organization
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {editingOrg ? 'Edit Organization' : 'Create New Organization'}
                      </h2>
                      <p className="text-white/80 text-sm">
                        {editingOrg ? 'Update organization details' : 'Add a new organization to the system'}
                      </p>
                    </div>
                  </div>
                  <button onClick={handleCancel} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* ── Basic Info ── */}
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Basic Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Organization Name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                        placeholder="e.g., Acme Corporation"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                      <input type="text" name="description" value={formData.description} onChange={handleInputChange}
                        placeholder="e.g., Main corporate entity"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Org ID</label>
                      <input type="text" name="orgId" value={formData.orgId} onChange={handleInputChange}
                        placeholder="e.g., 00Dxxxxxxxxxxxxxxx"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                      <p className="text-xs text-gray-400 mt-1">Salesforce Org ID (18-char)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Site URL</label>
                      <input type="text" name="siteUrl" value={formData.siteUrl} onChange={handleInputChange}
                        placeholder="e.g., https://acme.wovn.app"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                      <p className="text-xs text-gray-400 mt-1">Public-facing subdomain for Launch Webapp</p>
                    </div>
                  </div>
                </div>

                {/* ── Salesforce Credentials ── */}
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Salesforce Connection</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Instance URL</label>
                      <input type="text" name="salesforceUrl" value={formData.salesforceUrl} onChange={handleInputChange}
                        placeholder="https://yourorg.my.salesforce.com/"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Auth / Token URL</label>
                      <input type="text" name="salesforceAuthUrl" value={formData.salesforceAuthUrl} onChange={handleInputChange}
                        placeholder="https://yourorg.my.salesforce.com/services/oauth2/token"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Client ID</label>
                      <input type="text" name="clientId" value={formData.clientId} onChange={handleInputChange}
                        placeholder="Connected App Consumer Key"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Client Secret</label>
                      <input type="password" name="clientSecret" value={formData.clientSecret} onChange={handleInputChange}
                        placeholder="Connected App Consumer Secret"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>
                  </div>
                </div>

                {/* ── Algolia Config ── */}
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Algolia Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Algolia Index Name</label>
                      <input type="text" name="algoliaIndexName" value={formData.algoliaIndexName} onChange={handleInputChange}
                        placeholder="e.g., woven_products_acme"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Database Schema</label>
                      <input type="text" name="algoliaSchema" value={formData.algoliaSchema} onChange={handleInputChange}
                        placeholder="e.g., sf_00dxxxxxxx"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                      <p className="text-xs text-gray-400 mt-1">Postgres schema that holds this org's product2 table</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  {/* Left side actions (only for edit) */}
                  <div>
                    {editingOrg && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleSyncProducts(editingOrg)}
                          disabled={syncStates[editingOrg.id]?.status === 'loading'}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-primary/30 text-primary-dark bg-primary/10 hover:bg-primary/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                          {syncStates[editingOrg.id]?.status === 'loading'
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <RefreshCw className="w-4 h-4" />}
                          Add Products to Index
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLaunchWebapp(editingOrg)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Launch Webapp
                        </button>

                        {/* Sync feedback message */}
                        <AnimatePresence>
                          {syncStates[editingOrg.id]?.status && syncStates[editingOrg.id]?.status !== 'idle' && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border ${
                                syncStates[editingOrg.id].status === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                                syncStates[editingOrg.id].status === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {syncStates[editingOrg.id].status === 'success' && <CheckCircle2 className="w-4 h-4" />}
                              {syncStates[editingOrg.id].status === 'error' && <AlertCircle className="w-4 h-4" />}
                              {syncStates[editingOrg.id].status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                              <span>{syncStates[editingOrg.id].message}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Right side standard actions */}
                  <div className="flex gap-3">
                    <button type="button" onClick={handleCancel}
                      className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSaving}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      {isSaving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        <>{editingOrg ? 'Update Organization' : 'Create Organization'}</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Organization List */}
        {!showForm && organizations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-light to-primary/10">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text" placeholder="Search organizations..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {filteredOrganizations.length} {filteredOrganizations.length === 1 ? 'organization' : 'organizations'}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <tr>
                    <Th>Organization Name</Th>
                    <Th>Description</Th>
                    <Th>Schema / Index</Th>
                    <Th>Actions</Th>
                  </tr>
                </THead>
                <TBody>
                  {paginatedOrganizations.map((org, index) => {
                    const syncState = syncStates[org.id] || { status: 'idle', message: '' };
                    const isSyncing = syncState.status === 'loading';

                    return (
                      <motion.tr
                        key={org.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-primary/5 transition-colors duration-150"
                      >
                        {/* Name */}
                        <Td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-sm font-semibold text-gray-900">{org.name}</div>
                          </div>
                        </Td>

                        {/* Description */}
                        <Td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {org.description || <span className="italic text-gray-400">No description</span>}
                          </div>
                        </Td>

                        {/* Schema / Index */}
                        <Td className="px-6 py-4">
                          <div className="space-y-1">
                            {org.algoliaSchema && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200">
                                {org.algoliaSchema}
                              </span>
                            )}
                            {org.algoliaIndexName && (
                              <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200">
                                  {org.algoliaIndexName}
                                </span>
                              </div>
                            )}
                            {!org.algoliaSchema && !org.algoliaIndexName && (
                              <span className="text-xs italic text-gray-400">Not provisioned</span>
                            )}
                          </div>
                        </Td>

                        {/* Actions */}
                        <Td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {/* Top row: core actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(org)}
                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="Edit Organization"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(org.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Organization"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* NEW: Add Products to Index */}
                            <button
                              id={`sync-btn-${org.id}`}
                              onClick={() => handleSyncProducts(org)}
                              disabled={isSyncing}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-primary/30 text-primary-dark bg-primary/10 hover:bg-primary/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                              title="Pull products from Salesforce and push to Algolia index"
                            >
                              {isSyncing
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <RefreshCw className="w-3.5 h-3.5" />}
                              {isSyncing ? 'Syncing...' : 'Add Products to Index'}
                            </button>

                            {/* NEW: Launch Webapp */}
                            <button
                              id={`launch-btn-${org.id}`}
                              onClick={() => handleLaunchWebapp(org)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all whitespace-nowrap"
                              title={org.siteUrl ? `Open ${org.siteUrl}` : 'No site URL configured'}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Launch Webapp
                            </button>

                            {/* Sync feedback message */}
                            <AnimatePresence>
                              {syncState.status !== 'idle' && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className={`flex items-start gap-1.5 text-xs rounded-lg px-2 py-1.5 ${
                                    syncState.status === 'success'
                                      ? 'bg-green-50 text-green-700 border border-green-200'
                                      : syncState.status === 'error'
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                                  }`}
                                >
                                  {syncState.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
                                  {syncState.status === 'error' && <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
                                  {syncState.status === 'loading' && <Loader2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 animate-spin" />}
                                  <span className="leading-snug">{syncState.message}</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </Td>
                      </motion.tr>
                    );
                  })}
                </TBody>
              </Table>
            </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredOrganizations.length)} of {filteredOrganizations.length} organizations
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                              ? 'bg-gradient-to-r from-primary to-primary-dark text-white'
                              : 'border border-gray-300 hover:bg-gray-100'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty Search State */}
            {filteredOrganizations.length === 0 && (
              <div className="p-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No organizations found</h3>
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'No organizations available'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {organizations.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Organizations Yet</h3>
              <p className="text-gray-500 mb-8">
                Get started by creating your first organization to manage users and resources.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setFormData({ name: '', description: '', orgId: '', salesforceUrl: '', salesforceAuthUrl: '', clientId: '', clientSecret: '', siteUrl: '', algoliaIndexName: '', algoliaSchema: '' }); setEditingOrg(null); setShowForm(true); }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-xl transition-all duration-200 font-semibold text-lg"
              >
                <Plus className="w-6 h-6" />
                Create Your First Organization
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrganizationManagement;
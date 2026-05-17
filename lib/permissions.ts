// lib/permissions.ts

export type AccountTypeCategory = 'Customer' | 'Partner' | 'Hybrid';

export const MANUFACTURER_GROUP = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'];

export const getCategoryFromAccountType = (accountType?: string): AccountTypeCategory => {
  if (!accountType) return 'Customer';
  if (accountType === 'Customer' || accountType === 'NSO') return 'Customer';
  if (accountType === 'Hybrid') return 'Hybrid';
  if (MANUFACTURER_GROUP.includes(accountType)) return 'Partner';
  return 'Partner'; // Default for other Partner types
};

export const PERMISSIONS_BY_CATEGORY: Record<AccountTypeCategory, string[]> = {
  Customer: [
    'program360-view',
    'product-list', 'product-read',
    'inventory-list', 'inventory-read',
    'order-list', 'order-read', 'order-create', 'order-update', 'order-delete',
    'proposal-list', 'proposal-read',
    'quote-list', 'quote-read',
    'shipment-list', 'shipment-read',
    'invoice-list', 'invoice-read',
    'location-list', 'location-read', 'location-create', 'location-update', 'location-delete',
    'report-list', 'report-read',
    'admin-list', 'admin-read', 'admin-create', 'admin-update', 'admin-delete',
    'profile-list', 'profile-read', 'profile-create', 'profile-update', 'profile-delete',
    'user-list', 'user-read', 'user-create', 'user-update', 'user-delete',
    'role-list', 'role-read', 'role-create', 'role-update', 'role-delete',
    'permission-list', 'permission-read', 'permission-create', 'permission-update', 'permission-delete'
  ],
  Partner: [
    'program360-view',
    'product-list', 'product-read', 'product-create',
    'inventory-list', 'inventory-read',
    'purchase-order-list', 'purchase-order-read',
    'supplier-bill-list', 'supplier-bill-read',
    'location-list', 'location-read', 'location-create', 'location-update', 'location-delete',
    'report-list', 'report-read',
    'admin-list', 'admin-read', 'admin-create', 'admin-update', 'admin-delete',
    'profile-list', 'profile-read', 'profile-create', 'profile-update', 'profile-delete',
    'user-list', 'user-read', 'user-create', 'user-update', 'user-delete',
    'role-list', 'role-read', 'role-create', 'role-update', 'role-delete',
    'permission-list', 'permission-read', 'permission-create', 'permission-update', 'permission-delete'
  ],
  Hybrid: [
    'program360-view',
    'product-list', 'product-read', 'product-create',
    'inventory-list', 'inventory-read',
    'order-list', 'order-read', 'order-create', 'order-update', 'order-delete',
    'proposal-list', 'proposal-read',
    'quote-list', 'quote-read',
    'purchase-order-list', 'purchase-order-read',
    'supplier-bill-list', 'supplier-bill-read',
    'shipment-list', 'shipment-read',
    'invoice-list', 'invoice-read',
    'location-list', 'location-read', 'location-create', 'location-update', 'location-delete',
    'report-list', 'report-read',
    'admin-list', 'admin-read', 'admin-create', 'admin-update', 'admin-delete',
    'profile-list', 'profile-read', 'profile-create', 'profile-update', 'profile-delete',
    'user-list', 'user-read', 'user-create', 'user-update', 'user-delete',
    'role-list', 'role-read', 'role-create', 'role-update', 'role-delete',
    'permission-list', 'permission-read', 'permission-create', 'permission-update', 'permission-delete'
  ]
};

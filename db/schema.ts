import { sql } from 'drizzle-orm';
import { uuid, pgTable, text, primaryKey, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  resetPasswordCode: text('reset_password_code'),
  resetPasswordExpires: text('reset_password_expires'),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Organizations table (Master Schema)
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // This is the org_name
  orgId: text('org_id').unique(), // External Org ID or identifier
  description: text('description'),
  
  // Salesforce Connection Details
  salesforceUrl: text('salesforce_url'),
  salesforceAuthUrl: text('salesforce_auth_url'),
  clientId: text('client_id'),
  clientSecret: text('client_secret'), // In production, this should be encrypted!
  
  siteUrl: text('site_url'),
  algoliaIndexName: text('algolia_index_name'),
  
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Roles table
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Permission Groups table
export const permissionGroups = pgTable('permission_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // e.g. 'Order Management', 'User Management'
  description: text('description'),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Permissions table
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // e.g. 'create_user', 'delete_role'
  description: text('description'),
  groupId: uuid('group_id')
    .references(() => permissionGroups.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Role-Permission relationship (many-to-many)
export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
  })
);

// Role-Organization relationship (many-to-many) - determines which organizations a role is available in
export const roleOrganizations = pgTable(
  'role_organizations',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.organizationId] }),
  })
);

// User-Organization relationship (many-to-many)
export const userOrganizations = pgTable(
  'user_organizations',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.organizationId] }),
  })
);

// User-Role relationship (many-to-many) with organization context
export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId, t.organizationId] }),
  })
);

// Define relations
export const organizationRelations = relations(organizations, ({ many }) => ({
  userOrganizations: many(userOrganizations),
  userRoles: many(userRoles),
}));

export const userRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  userOrganizations: many(userOrganizations),
}));

export const roleRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}));

export const permissionGroupRelations = relations(permissionGroups, ({ many }) => ({
  permissions: many(permissions),
}));

export const permissionRelations = relations(permissions, ({ one, many }) => ({
  group: one(permissionGroups, {
    fields: [permissions.groupId],
    references: [permissionGroups.id],
  }),
  rolePermissions: many(rolePermissions),
}));

export const userOrganizationRelations = relations(userOrganizations, ({ one }) => ({
  user: one(users, {
    fields: [userOrganizations.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [userOrganizations.organizationId],
    references: [organizations.id],
  }),
}));

export const userRoleRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  organization: one(organizations, {
    fields: [userRoles.organizationId],
    references: [organizations.id],
  }),
}));

export const roleOrganizationRelations = relations(roleOrganizations, ({ one }) => ({
  role: one(roles, {
    fields: [roleOrganizations.roleId],
    references: [roles.id],
  }),
  organization: one(organizations, {
    fields: [roleOrganizations.organizationId],
    references: [organizations.id],
  }),
}));

// Types for better TypeScript support
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserOrganization = typeof userOrganizations.$inferSelect;
export type NewUserOrganization = typeof userOrganizations.$inferInsert;

export type RoleOrganization = typeof roleOrganizations.$inferSelect;
export type NewRoleOrganization = typeof roleOrganizations.$inferInsert;

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type PermissionGroup = typeof permissionGroups.$inferSelect;
export type NewPermissionGroup = typeof permissionGroups.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;

// API Keys table
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'), // Optional: Link to a specific user if needed, or null for service accounts
  keyHash: text('key_hash').notNull().unique(), // Store hashed key
  prefix: text('prefix').notNull(), // e.g. 'sk_live_...'
  name: text('name').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  rateLimit: integer('rate_limit').default(60).notNull(), // Requests per minute
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  lastUsedAt: text('last_used_at'),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

// User Salesforce Profiles table — maps local users to their Salesforce Contact & Account IDs
// A user can belong to multiple accounts; composite PK prevents exact duplicates
export const userSalesforceProfiles = pgTable(
  'user_salesforce_profiles',
  {
    userId: uuid('user_id')
      .primaryKey()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    contactId: text('contact_id').notNull(),
  }
);

export const userSalesforceProfileRelations = relations(userSalesforceProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userSalesforceProfiles.userId],
    references: [users.id],
  }),
}));

export type UserSalesforceProfile = typeof userSalesforceProfiles.$inferSelect;
export type NewUserSalesforceProfile = typeof userSalesforceProfiles.$inferInsert;

export * from './salesforce-schema';

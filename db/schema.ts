import { sql } from 'drizzle-orm';
import { uuid, pgTable, text } from 'drizzle-orm/pg-core';

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
  algoliaSchema: text('algolia_schema'),
  
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Types for better TypeScript support
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export * from './salesforce-schema';

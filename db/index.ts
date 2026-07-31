import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Determine if SSL should be used based on the database URL
// Local Postgres instances typically do not support SSL
const dbUrl = process.env.DATABASE_URL || '';
const isRemoteDb = dbUrl.includes('rds.amazonaws.com') ||
  dbUrl.includes('neon.tech') ||
  dbUrl.includes('supabase') ||
  dbUrl.includes('railway.app') ||
  dbUrl.includes('heroku') ||
  process.env.DATABASE_SSL === 'true';

// Initialize the PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ...(isRemoteDb ? { ssl: { rejectUnauthorized: false } } : {}),
});

// Configure Drizzle ORM with the pool and schema
export const db = drizzle(pool, { schema });

// Export pool for direct use if needed
export { pool };
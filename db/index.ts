import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Initialize the PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false, // Required for cloud-hosted PostgreSQL databases
  },
});

// Configure Drizzle ORM with the pool and schema
export const db = drizzle(pool, { schema });

// Export pool for direct use if needed
export { pool };
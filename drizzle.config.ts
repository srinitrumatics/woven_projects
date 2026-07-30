import type { Config } from 'drizzle-kit';

// Load DATABASE_URL from environment (Heroku sets this automatically)
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Only enable SSL for cloud-hosted databases; local Postgres does not support SSL
const isRemoteDb = databaseUrl.includes('rds.amazonaws.com') ||
                   databaseUrl.includes('neon.tech') ||
                   databaseUrl.includes('supabase') ||
                   databaseUrl.includes('railway.app') ||
                   databaseUrl.includes('heroku') ||
                   process.env.DATABASE_SSL === 'true';

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
    ...(isRemoteDb ? { ssl: true } : {}),
  },
} satisfies Config;

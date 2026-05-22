import type { Config } from 'drizzle-kit';

// Load DATABASE_URL from environment (Heroku sets this automatically)
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
    ssl: true,
  },
} satisfies Config; 

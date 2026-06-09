/**
 * Production migration script for Heroku.
 * Uses drizzle-orm's built-in migrator — does NOT require drizzle-kit CLI.
 * Run via: node scripts/migrate.js
 * Added to Procfile as a release phase: release: node scripts/migrate.js
 */

const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { Pool } = require('pg');
const path = require('path');

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false, // Required for Heroku Postgres SSL
    },
  });

  const db = drizzle(pool);

  const migrationsFolder = path.join(__dirname, '..', 'drizzle');

  try {
    await migrate(db, { migrationsFolder });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();

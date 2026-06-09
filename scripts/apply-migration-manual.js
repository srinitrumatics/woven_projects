
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function applyMigration() {
    const migrationPath = path.join(__dirname, '..', 'drizzle', '0007_quick_captain_stacy.sql');

    try {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        const client = await pool.connect();

        try {
            // Split by breakpoint if needed, but usually running the whole text works in simple cases
            // Drizzle uses --> statement-breakpoint
            const statements = sql.split('--> statement-breakpoint');

            for (const statement of statements) {
                if (statement.trim()) {
                    await client.query(statement);
                }
            }
        } catch (err) {
            console.error('❌ Error executing SQL:', err);
        } finally {
            client.release();
            await pool.end();
        }
    } catch (err) {
        console.error('Error reading/setup:', err);
    }
}

applyMigration();

require('dotenv').config();
const { Pool } = require('pg');

async function debugSync() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const countRes = await client.query(`
            SELECT status, count(*) 
            FROM salesforce.algolia_sync_queue 
            GROUP BY status
        `);
        console.table(countRes.rows);

        const recentRes = await client.query(`
            SELECT id, table_name, operation, status, error_message, created_at 
            FROM salesforce.algolia_sync_queue 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        console.table(recentRes.rows);

        const configRes = await client.query(`
            SELECT * FROM salesforce.algolia_index_config
        `);
        console.table(configRes.rows);

        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

debugSync();

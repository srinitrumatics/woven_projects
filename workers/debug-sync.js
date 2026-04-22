require('dotenv').config();
const { Pool } = require('pg');

async function debugSync() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        
        console.log('--- Sync Queue Summary ---');
        const countRes = await client.query(`
            SELECT status, count(*) 
            FROM salesforce.algolia_sync_queue 
            GROUP BY status
        `);
        console.table(countRes.rows);

        console.log('\n--- Recent Items ---');
        const recentRes = await client.query(`
            SELECT id, table_name, operation, status, error_message, created_at 
            FROM salesforce.algolia_sync_queue 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        console.table(recentRes.rows);

        console.log('\n--- Index Config ---');
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

// Check failed queue items and their errors
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkFailedItems() {
    console.log("[Function Start] check-errors.js -> checkFailedItems");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        const client = await pool.connect();

        const failedItems = await client.query(`
            SELECT id, table_name, operation, retry_count, error_message, payload
            FROM algolia_sync_queue
            WHERE status = 'failed'
            ORDER BY created_at
        `);

        failedItems.rows.forEach((item, idx) => {});

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

checkFailedItems();

// Check failed queue items and their errors
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkFailedItems() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        const client = await pool.connect();

        const failedItems = await client.query(`
            SELECT id, table_name, operation, retry_count, error_message, payload
            FROM algolia_sync_queue
            WHERE status = 'failed'
            ORDER BY created_at
        `);

        console.log('Failed items:', failedItems.rows.length);
        console.log('');

        failedItems.rows.forEach((item, idx) => {
            console.log(`${idx + 1}. Queue ID: ${item.id}`);
            console.log(`   Table: ${item.table_name}, Operation: ${item.operation}`);
            console.log(`   Retries: ${item.retry_count}`);
            console.log(`   Error: ${item.error_message}`);
            console.log(`   Payload objectID: ${item.payload?.objectID}`);
            console.log('');
        });

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

checkFailedItems();

// Reset failed queue items to pending
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function resetQueue() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        const client = await pool.connect();

        console.log('Resetting failed items to pending...');

        const result = await client.query(`
            UPDATE algolia_sync_queue
            SET 
                status = 'pending',
                retry_count = 0,
                error_message = NULL,
                processed_at = NULL
            WHERE status = 'failed'
            RETURNING id
        `);

        console.log(`✓ Reset ${result.rowCount} items.`);

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

resetQueue();

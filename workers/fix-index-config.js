// Update index configuration and reset queue
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function fixIndexConfig() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        const client = await pool.connect();

        console.log('Updating index configuration...');

        // 1. Update index name
        await client.query(`
            UPDATE algolia_index_config
            SET index_name = 'dev_woven_products'
            WHERE table_name = 'products'
        `);
        console.log("✓ Updated index_name to 'dev_woven_products'");

        // 2. Reset queue items to pending (so they get synced to the new index)
        const result = await client.query(`
            UPDATE algolia_sync_queue
            SET 
                status = 'pending',
                retry_count = 0,
                error_message = NULL,
                processed_at = NULL
            WHERE table_name = 'products'
        `);
        console.log(`✓ Reset ${result.rowCount} items to pending`);

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

fixIndexConfig();

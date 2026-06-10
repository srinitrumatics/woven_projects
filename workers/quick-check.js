// Quick diagnostic to check database state
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function quickCheck() {
    console.log("[Function Start] quick-check.js -> quickCheck");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        const client = await pool.connect();

        // Check if products table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'products'
            );
        `);

        if (tableCheck.rows[0].exists) {
            // Count products
            const productCount = await client.query('SELECT COUNT(*) FROM products');

            // Check queue
            const queueCheck = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'algolia_sync_queue'
                );
            `);

            if (queueCheck.rows[0].exists) {
                const queueCount = await client.query('SELECT COUNT(*), status FROM algolia_sync_queue GROUP BY status');
            }
        }

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

quickCheck();

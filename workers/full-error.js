// Check full error messages
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkFullErrors() {
    console.log("[Function Start] full-error.js -> checkFullErrors");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        const client = await pool.connect();

        const failedItems = await client.query(`
            SELECT error_message
            FROM algolia_sync_queue
            WHERE status = 'failed'
            LIMIT 1
        `);

        if (failedItems.rows.length > 0) {}

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

checkFullErrors();

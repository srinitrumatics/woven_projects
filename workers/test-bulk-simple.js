const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testBulkUpdateSimple() {
    console.log("[Function Start] test-bulk-simple.js -> testBulkUpdateSimple");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Get 5 products
        const products = await client.query(`
            SELECT sfid, name FROM salesforce.product2 LIMIT 5
        `);

        const sfids = products.rows.map(p => p.sfid);

        // Clear any existing pending entries for these products
        await client.query(`
            DELETE FROM salesforce.algolia_sync_queue 
            WHERE record_id = ANY($1::text[])
        `, [sfids]);
        await client.query(`
            UPDATE salesforce.product2 
            SET image_url = jsonb_build_object('updated_at', NOW()::text)
            WHERE sfid = ANY($1::text[])
        `, [sfids]);

        // Wait a moment for triggers to fire
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check queue
        const queueCheck = await client.query(`
            SELECT record_id, operation, status, created_at
            FROM salesforce.algolia_sync_queue
            WHERE record_id = ANY($1::text[])
            ORDER BY created_at DESC
        `, [sfids]);

        if (queueCheck.rows.length === sfids.length) {
            console.table(queueCheck.rows);
        } else if (queueCheck.rows.length === 0) {} else {
            console.table(queueCheck.rows);
        }

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

testBulkUpdateSimple();

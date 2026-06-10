const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function quickTest() {
    console.log("[Function Start] quick-trigger-test.js -> quickTest");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Get one product
        const product = await client.query(`
            SELECT sfid FROM salesforce.product2 LIMIT 1
        `);

        if (product.rows.length === 0) {
            client.release();
            await pool.end();
            return;
        }

        const sfid = product.rows[0].sfid;

        // Count queue before
        const before = await client.query(`
            SELECT COUNT(*) FROM salesforce.algolia_sync_queue
        `);

        // Update
        await client.query(`
            UPDATE salesforce.product2 
            SET image_url = jsonb_build_object('test', NOW()::text)
            WHERE sfid = $1
        `, [sfid]);

        // Count queue after
        const after = await client.query(`
            SELECT COUNT(*) FROM salesforce.algolia_sync_queue
        `);

        const diff = parseInt(after.rows[0].count) - parseInt(before.rows[0].count);

        if (diff > 0) {} else {}

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

quickTest();

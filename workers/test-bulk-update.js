const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testBulkUpdate() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const queueBefore = await client.query(`
            SELECT status, COUNT(*) as count 
            FROM salesforce.algolia_sync_queue 
            GROUP BY status
        `);
        console.table(queueBefore.rows);

        const products = await client.query(`
            SELECT sfid, name, 
                   COALESCE(image_url, '{}'::jsonb) as current_image_url
            FROM salesforce.product2 
            LIMIT 3
        `);

        products.rows.forEach((p, i) => {});

        const sfids = products.rows.map(p => p.sfid);

        const updateResult = await client.query(`
            UPDATE salesforce.product2 
            SET image_url = jsonb_set(
                COALESCE(image_url, '{}'::jsonb), 
                '{bulk_test_timestamp}', 
                to_jsonb($1)
            )
            WHERE sfid = ANY($2::text[])
            RETURNING sfid, name
        `, [new Date().toISOString(), sfids]);

        const queueAfter = await client.query(`
            SELECT status, COUNT(*) as count 
            FROM salesforce.algolia_sync_queue 
            GROUP BY status
        `);
        console.table(queueAfter.rows);

        const queueEntries = await client.query(`
            SELECT id, record_id, operation, status, created_at, error_message
            FROM salesforce.algolia_sync_queue
            WHERE record_id = ANY($1::text[])
            ORDER BY created_at DESC
        `, [sfids]);

        if (queueEntries.rows.length === 0) {} else {
            console.table(queueEntries.rows);
        }

        client.release();

        const beforeCount = queueBefore.rows.reduce((sum, r) => sum + parseInt(r.count), 0);
        const afterCount = queueAfter.rows.reduce((sum, r) => sum + parseInt(r.count), 0);
        const newEntries = afterCount - beforeCount;

        if (newEntries === updateResult.rows.length) {} else if (newEntries === 0) {} else {}
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }

    await pool.end();
}

testBulkUpdate();

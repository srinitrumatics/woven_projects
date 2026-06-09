require('dotenv').config();
const { Pool } = require('pg');

async function verifyWorker() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const res = await client.query(`
            INSERT INTO salesforce.algolia_sync_queue 
            (table_name, record_id, operation, payload, status)
            VALUES 
            ('salesforce.product2', 'TEST_RECORD_ID', 'UPDATE', '{"objectID": "TEST_RECORD_ID", "test": true}', 'pending')
            RETURNING id
        `);
        const queueId = res.rows[0].id;
        for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 1000));
            const check = await client.query(`
                SELECT status, error_message 
                FROM salesforce.algolia_sync_queue 
                WHERE id = $1
            `, [queueId]);

            const status = check.rows[0].status;

            if (status !== 'pending') {
                if (check.rows[0].error_message) {}
                break;
            }
        }

        // Cleanup
        await client.query('DELETE FROM salesforce.algolia_sync_log WHERE queue_id = $1', [queueId]);
        await client.query('DELETE FROM salesforce.algolia_sync_queue WHERE id = $1', [queueId]);

        client.release();
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

verifyWorker();

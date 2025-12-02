require('dotenv').config();
const { Pool } = require('pg');

async function checkStatus() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        const res = await client.query("SELECT * FROM salesforce.algolia_sync_queue WHERE record_id = 'TEST_RECORD_ID'");
        console.log('Item status:', res.rows);
        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkStatus();

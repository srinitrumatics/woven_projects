const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkConfig() {
    console.log("[Function Start] check-config.js -> checkConfig");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        const res = await client.query('SELECT * FROM salesforce.algolia_index_config');
        console.table(res.rows);
        client.release();
    } catch (e) {
        console.error(e);
    }
    await pool.end();
}

checkConfig();

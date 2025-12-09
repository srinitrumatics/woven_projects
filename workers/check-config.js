const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkConfig() {
    console.log('Checking Algolia Index Config...');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        const res = await client.query('SELECT * FROM salesforce.algolia_index_config');
        console.log('Config entries found:', res.rows.length);
        console.table(res.rows);
        client.release();
    } catch (e) {
        console.error(e);
    }
    await pool.end();
}

checkConfig();

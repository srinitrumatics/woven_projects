const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkConfig() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        const res = await client.query('SELECT table_name, is_enabled, transform_function, index_name FROM salesforce.algolia_index_config');
        client.release();
    } catch (e) {
        console.error('Error fetching config:', e.message);
    }
    await pool.end();
}

checkConfig();

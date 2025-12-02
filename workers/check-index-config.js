// Check index configuration
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkIndexConfig() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        const client = await pool.connect();

        console.log('Checking algolia_index_config...');
        const result = await client.query(`
            SELECT table_name, index_name, is_enabled 
            FROM algolia_index_config
        `);

        console.table(result.rows);

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

checkIndexConfig();

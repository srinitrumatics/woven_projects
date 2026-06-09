const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function inspectKeys() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const result = await client.query(`
            SELECT 
                name,
                image_url,
                jsonb_object_keys(image_url) as keys
            FROM salesforce.product2
            WHERE image_url IS NOT NULL
            LIMIT 1
        `);

        result.rows.forEach(row => {});

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }

    await pool.end();
}

inspectKeys();

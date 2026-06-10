const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testExtraction() {
    console.log("[Function Start] test-extraction.js -> testExtraction");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const result = await client.query(`
            SELECT 
                name,
                jsonb_typeof(image_url) as type,
                image_url->0 as first_element,
                image_url->0->>'url' as method1,
                image_url#>>'{0,url}' as method2
            FROM salesforce.product2
            WHERE image_url IS NOT NULL
            LIMIT 1
        `);

        if (result.rows.length > 0) {
            const row = result.rows[0];
        }

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }

    await pool.end();
}

testExtraction();

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testNewExtraction() {
    console.log("[Function Start] test-new-extraction.js -> testNewExtraction");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Test the new extraction method
        const result = await client.query(`
            SELECT 
                name,
                image_url#>>'{images,0,url}' as extracted_url
            FROM salesforce.product2
            WHERE image_url IS NOT NULL
            LIMIT 5
        `);

        result.rows.forEach((row, i) => {});

        if (result.rows.every(r => r.extracted_url)) {} else {}

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

testNewExtraction();

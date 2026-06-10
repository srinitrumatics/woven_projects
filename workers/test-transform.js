const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testTransform() {
    console.log("[Function Start] test-transform.js -> testTransform");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Test the transform function
        const result = await client.query(`
            SELECT 
                p.sfid,
                p.name,
                p.image_url as raw_image_url,
                salesforce.transform_sf_product_for_algolia(p.*) as transformed
            FROM salesforce.product2 p
            WHERE p.image_url IS NOT NULL
            LIMIT 3
        `);

        result.rows.forEach((row, i) => {});

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }

    await pool.end();
}

testTransform();

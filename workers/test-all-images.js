const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testAllImages() {
    console.log("[Function Start] test-all-images.js -> testAllImages");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const result = await client.query(`
            SELECT 
                name,
                salesforce.transform_sf_product_for_algolia(p.*) as transformed
            FROM salesforce.product2 p
            WHERE image_url IS NOT NULL
            LIMIT 1
        `);

        if (result.rows.length > 0) {
            const transformed = result.rows[0].transformed;
        }

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

testAllImages();

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testTransform() {
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

        console.log('Transform Function Test:\n');
        result.rows.forEach((row, i) => {
            console.log(`${i + 1}. ${row.name}`);
            console.log(`   Raw image_url:`, JSON.stringify(row.raw_image_url, null, 2));
            console.log(`   Transformed image_url:`, row.transformed.image_url);
            console.log('');
        });

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }

    await pool.end();
}

testTransform();

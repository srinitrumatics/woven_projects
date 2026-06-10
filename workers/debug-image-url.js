const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function debugImageUrl() {
    console.log("[Function Start] debug-image-url.js -> debugImageUrl");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const result = await client.query(`
            SELECT 
                sfid,
                name,
                image_url,
                jsonb_typeof(image_url) as json_type,
                CASE 
                    WHEN jsonb_typeof(image_url) = 'array' THEN jsonb_array_length(image_url)
                    ELSE NULL
                END as array_length,
                CASE
                    WHEN jsonb_typeof(image_url) = 'array' AND jsonb_array_length(image_url) > 0 
                        THEN image_url->0->>'url'
                    WHEN jsonb_typeof(image_url) = 'object' 
                        THEN image_url->>'url'
                    ELSE NULL
                END as extracted_url
            FROM salesforce.product2
            WHERE image_url IS NOT NULL
            LIMIT 5
        `);

        result.rows.forEach((row, i) => {});

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

debugImageUrl();

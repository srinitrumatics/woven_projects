const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkImageUrlStructure() {
    console.log("[Function Start] check-image-url-structure.js -> checkImageUrlStructure");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const result = await client.query(`
            SELECT sfid, name, image_url
            FROM salesforce.product2
            WHERE image_url IS NOT NULL
            LIMIT 3
        `);

        result.rows.forEach((row, i) => {});

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

checkImageUrlStructure();

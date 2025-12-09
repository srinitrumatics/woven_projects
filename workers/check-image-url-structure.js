const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkImageUrlStructure() {
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

        console.log('Sample image_url values:\n');
        result.rows.forEach((row, i) => {
            console.log(`${i + 1}. Product: ${row.name}`);
            console.log(`   SFID: ${row.sfid}`);
            console.log(`   image_url type: ${typeof row.image_url}`);
            console.log(`   image_url value:`, JSON.stringify(row.image_url, null, 2));
            console.log('');
        });

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
    }

    await pool.end();
}

checkImageUrlStructure();

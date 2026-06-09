const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function updateTransformFunction() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Read the SQL file
        const sqlPath = path.join(__dirname, '..', 'update-transform-all-images.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);

        const testResult = await client.query(`
            SELECT 
                p.sfid,
                p.name,
                p.manufacturer_name__c,
                salesforce.transform_sf_product_for_algolia(p.*) as transformed
            FROM salesforce.product2 p
            WHERE p.manufacturer_name__c IS NOT NULL
            LIMIT 1
        `);

        if (testResult.rows.length > 0) {
            const row = testResult.rows[0];

            if (row.transformed.manufacturer) {} else {}

            // Check if manufacturer is in tags
            if (row.transformed._tags && row.transformed._tags.includes(row.manufacturer_name__c)) {}
        } else {}

        client.release();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }

    await pool.end();
}

updateTransformFunction();

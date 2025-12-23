const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function updateTransformFunction() {
    console.log('Updating transform_sf_product_for_algolia function...\n');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Read the SQL file
        const sqlPath = path.join(__dirname, '..', 'update-transform-all-images.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL to update transform function...');
        await client.query(sql);

        console.log('✅ Transform function updated successfully!');

        // Test the function with a product that has manufacturer
        console.log('\nTesting transform function...');
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
            console.log('\nTest Product:', row.name);
            console.log('Manufacturer (DB):', row.manufacturer_name__c);
            console.log('Manufacturer (Algolia):', row.transformed.manufacturer);

            if (row.transformed.manufacturer) {
                console.log('✅ Manufacturer field is included in transform!');
            } else {
                console.log('❌ Manufacturer field is missing in transform');
            }

            // Check if manufacturer is in tags
            if (row.transformed._tags && row.transformed._tags.includes(row.manufacturer_name__c)) {
                console.log('✅ Manufacturer is included in searchable tags!');
            }
        } else {
            console.log('No products with manufacturer found to test');
        }

        client.release();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }

    await pool.end();
}

updateTransformFunction();

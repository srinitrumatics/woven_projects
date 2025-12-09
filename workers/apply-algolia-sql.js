const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function applyAlgoliaSql() {
    console.log('=== Applying db/algolia.sql to Database ===\n');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // Read the SQL file
        const sqlPath = path.join(__dirname, '..', 'db', 'algolia.sql');
        console.log('Reading SQL file:', sqlPath);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Connecting to database...');
        const client = await pool.connect();

        console.log('Executing SQL...\n');
        await client.query(sql);

        console.log('✅ SUCCESS! db/algolia.sql has been applied to the database.\n');

        // Verify the transform function was updated
        console.log('Verifying transform function...');
        const testResult = await client.query(`
            SELECT salesforce.transform_sf_product_for_algolia(p.*) as transformed
            FROM salesforce.product2 p
            WHERE p.image_url IS NOT NULL
            LIMIT 1
        `);

        if (testResult.rows.length > 0) {
            console.log('Sample transformed data:');
            console.log('  image_url:', testResult.rows[0].transformed.image_url);
            console.log('  name:', testResult.rows[0].transformed.name);
        }

        client.release();

        console.log('\n✅ All done! The database has been updated.');
        console.log('\nNext steps:');
        console.log('1. Trigger a product update to sync to Algolia');
        console.log('2. Check your /search page to see the images');

    } catch (error) {
        console.error('❌ Error applying SQL:', error.message);
        console.error('\nFull error:');
        console.error(error);
    }

    await pool.end();
}

applyAlgoliaSql();

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function triggerResync() {
    console.log('=== Triggering Product Re-sync to Algolia ===\n');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Get count of products
        const countResult = await client.query(`
            SELECT COUNT(*) FROM salesforce.product2
        `);
        const totalProducts = parseInt(countResult.rows[0].count);

        console.log(`Found ${totalProducts} products in database`);
        console.log('Triggering update to force re-sync...\n');

        // Update all products to trigger the sync
        // We'll just touch the systemmodstamp field
        const updateResult = await client.query(`
            UPDATE salesforce.product2
            SET systemmodstamp = CURRENT_TIMESTAMP
            WHERE image_url IS NOT NULL
            RETURNING sfid
        `);

        console.log(`✅ Triggered re-sync for ${updateResult.rows.length} products with images`);
        console.log('\nThe Algolia sync worker will process these updates.');
        console.log('Wait a few moments, then run: node workers/check-algolia-images.js');

        client.release();
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }

    await pool.end();
}

triggerResync();

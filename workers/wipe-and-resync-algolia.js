const { Pool } = require('pg');
const algoliasearch = require('algoliasearch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function wipeAndResync() {
    console.log("Connecting to Algolia...");
    const client = algoliasearch(
        process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, 
        process.env.ALGOLIA_ADMIN_KEY
    );
    const index = client.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'dev_woven_products');

    console.log("Wiping all existing products from the Algolia index...");
    await index.clearObjects();
    console.log("✅ Algolia index is now empty!");

    console.log("Connecting to Postgres...");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    const pgClient = await pool.connect();
    
    // Push everything in local salesforce.product2 to the sync queue
    console.log("Pushing all local database products into the sync queue...");
    await pgClient.query(`
        UPDATE salesforce.product2
        SET systemmodstamp = CURRENT_TIMESTAMP;
    `);

    console.log("✅ Success! The syncing worker will now rebuild Algolia perfectly.");
    
    pgClient.release();
    await pool.end();
}

wipeAndResync().catch(console.error);

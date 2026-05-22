// ============================================================
// Direct push from salesforce.product2 → Algolia index
// Bypasses the queue system entirely — useful for full resyncs.
// Usage: node workers/direct-push-to-algolia.js [index-name]
//   e.g. node workers/direct-push-to-algolia.js dev_woven_products
// ============================================================

const algoliasearch = require('algoliasearch');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const TARGET_INDEX = process.argv[2] || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'wovn_products_local';

async function main() {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const apiKey = process.env.ALGOLIA_ADMIN_KEY;

    if (!appId || !apiKey) {
        console.error('❌ Missing NEXT_PUBLIC_ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY');
        process.exit(1);
    }

    console.log(`\n📋 Algolia App ID  : ${appId}`);
    console.log(`📦 Target Index    : ${TARGET_INDEX}`);
    console.log(`🔑 Admin Key       : ${apiKey.slice(0, 8)}...\n`);

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    const client = await pool.connect();

    console.log('Fetching all active products from salesforce.product2...');
    const { rows } = await client.query(`
        SELECT
            sfid            AS "objectID",
            name            AS "Name",
            productcode     AS "ProductCode",
            description     AS "Description",
            isactive        AS "IsActive",
            family          AS "Family",
            gtherp__price__c                AS "Price",
            gtherp__stock_quantity__c       AS "StockQuantity",
            gtherp__available_quantity__c   AS "AvailableQuantity",
            gtherp__discount__c             AS "Discount",
            gtherp__category__c             AS "Category",
            gtherp__sub_category__c         AS "SubCategory",
            manufacturer_name__c            AS "ManufacturerName",
            product_availability__c         AS "ProductAvailability",
            image_url                       AS "ImageUrl",
            createddate                     AS "CreatedDate",
            systemmodstamp                  AS "SystemModstamp"
        FROM salesforce.product2
        WHERE isactive = true
    `);

    console.log(`Found ${rows.length} active products in DB.\n`);

    if (rows.length === 0) {
        console.log('⚠️  No products to sync. Exiting.');
        await client.release();
        await pool.end();
        return;
    }

    const algolia = algoliasearch(appId, apiKey);
    const index = algolia.initIndex(TARGET_INDEX);

    console.log(`Pushing ${rows.length} objects to Algolia index "${TARGET_INDEX}"...`);
    const result = await index.saveObjects(rows);
    console.log(`✅ Success! Saved ${result.objectIDs.length} records.`);
    console.log(`   First 3 objectIDs: ${result.objectIDs.slice(0, 3).join(', ')}`);

    // Verify
    await new Promise(r => setTimeout(r, 1500)); // brief wait for indexing
    const stats = await index.getSettings();
    const search = await index.search('', { hitsPerPage: 1 });
    console.log(`\n📊 Index "${TARGET_INDEX}" now has ${search.nbHits} total records.`);

    await client.release();
    await pool.end();
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
